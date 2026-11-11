var ExamEngine = (function() {

    function normDifficulty(v) {
        v = String(v || "").toLowerCase().trim();
        if (v === "difficult") return "hard";
        if (v === "avg") return "medium";
        return v;
    }

    function normCognitive(q) {
        if (!q) return "u";
        var lvl = String(q.cognitive_level || "").trim().toLowerCase();
        if (lvl === "k" || lvl === "u" || lvl === "a") return lvl;
        var b = String(q.bloom || "").toLowerCase().trim();
        if (b.indexOf("remember") === 0 || b === "knowledge") return "k";
        if (b.indexOf("understand") === 0) return "u";
        if (b) return "a";
        return "u";
    }

    function normFormat(q) {
        var v = String((q && (q.question_format || q.mode)) || "straight").toLowerCase().replace(/[\s_-]+/g, "/").trim();
        if (v === "scenario" || v === "stimulus" || v === "situation" || v.indexOf("scenario") === 0) return "scenario";
        return "straight";
    }

    function shuffle(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    function largestRemainder(total, pcts) {
        var sum = 0;
        for (var i = 0; i < pcts.length; i++) sum += pcts[i];
        if (sum <= 0 || total <= 0) {
            var zeros = [];
            for (var z = 0; z < pcts.length; z++) zeros.push(0);
            return zeros;
        }
        var raw = pcts.map(function(p) { return total * p / sum; });
        var base = raw.map(Math.floor);
        var rem = total - base.reduce(function(a, b) { return a + b; }, 0);
        raw.map(function(x, i) { return [x - base[i], i]; })
            .sort(function(a, b) { return b[0] - a[0]; })
            .slice(0, rem)
            .forEach(function(pair) { base[pair[1]]++; });
        return base;
    }

    var DEFAULT_TARGETS = {
        cognitive: { k: 30, u: 50, a: 20 },
        difficulty: { easy: 40, medium: 40, hard: 20 },
        format: { straight: 67, scenario: 33 }
    };

    function makeDim(name, bucketOf, order, pctMap, total) {
        var pcts = [];
        for (var i = 0; i < order.length; i++) pcts.push(pctMap[order[i]] || 0);
        var shares = largestRemainder(total, pcts);
        var rem = {};
        for (var i = 0; i < order.length; i++) rem[order[i]] = shares[i];
        return { name: name, bucketOf: bucketOf, rem: rem, order: order };
    }

    function dimSatisfied(dim) {
        for (var i = 0; i < dim.order.length; i++) {
            if (dim.rem[dim.order[i]] > 0) return false;
        }
        return true;
    }

    // At most one question per similarity set, where a scenario stimulus set
    // counts as a single question. The returned pool has disjoint similarity
    // clusters, so any selection made from it is duplicate-free by
    // construction. No-op when the similarity data has not loaded.
    function dedupePool(pool) {
        if (typeof Similarity === "undefined" || !Similarity) return pool;
        return Similarity.filterUnits(pool);
    }

    // Multi-dimension balanced selection with best-effort fallback.
    // opts: { targets: { difficulty, cognitive, format }, evenKey: "topic" | "chapter" | null }
    // Returns a randomized selection of min(count, pool.length) questions.
    function selectBalanced(pool, count, opts) {
        opts = opts || {};
        if (!pool || pool.length === 0 || count <= 0) return [];
        var src = dedupePool(shuffle(pool));
        if (count >= src.length) return src;
        var targets = opts.targets || DEFAULT_TARGETS;
        var dims = [];
        if (targets.difficulty) {
            dims.push(makeDim("difficulty", function(q) { return normDifficulty(q.difficulty); },
                ["easy", "medium", "hard"], targets.difficulty, count));
        }
        if (targets.cognitive) {
            dims.push(makeDim("cognitive", normCognitive, ["k", "u", "a"], targets.cognitive, count));
        }
        if (targets.format) {
            dims.push(makeDim("format", normFormat, ["straight", "scenario"], targets.format, count));
        }
        if (opts.evenKey) {
            var vals = {};
            for (var i = 0; i < src.length; i++) {
                var v = src[i][opts.evenKey];
                if (v !== undefined && v !== null && v !== "") vals[String(v)] = true;
            }
            var keys = Object.keys(vals);
            if (keys.length > 1) {
                var pctMap = {};
                for (var k = 0; k < keys.length; k++) pctMap[keys[k]] = 1;
                dims.push(makeDim(opts.evenKey, function(q) { return String(q[opts.evenKey]); }, keys, pctMap, count));
            }
        }

        function deficitOf(dim, q) {
            var d = dim.rem[dim.bucketOf(q)];
            return d === undefined ? 0 : d;
        }

        var selected = [];
        var remaining = src.slice();
        var selGroups = {};
        while (selected.length < count && remaining.length) {
            var strictPick = null, strictScore = -1;
            var relaxedPick = null, relaxedScore = -1;
            for (var i = 0; i < remaining.length; i++) {
                var q = remaining[i];
                var fitsAll = true, helpsAny = false, score = 0;
                for (var d = 0; d < dims.length; d++) {
                    var def = deficitOf(dims[d], q);
                    if (def > 0) { score += def; helpsAny = true; }
                    else if (!dimSatisfied(dims[d])) fitsAll = false;
                }
                if (!helpsAny) continue;
                var gBonus = 0;
                if (q.scenario_id) {
                    var gCount = selGroups[q.scenario_id] || 0;
                    var sqo = parseInt(q.question_order, 10);
                    if (gCount > 0 && !isNaN(sqo) && gCount === sqo - 1) gBonus = 3;
                    else if (gCount > 0) gBonus = 1;
                    else if (sqo === 1) gBonus = 2;
                }
                var eff = score + gBonus + Math.random();
                if (fitsAll && eff > strictScore) { strictScore = eff; strictPick = q; }
                if (eff > relaxedScore) { relaxedScore = eff; relaxedPick = q; }
            }
            var pick = strictPick || relaxedPick;
            if (!pick) {
                var rest = shuffle(remaining);
                while (selected.length < count && rest.length) selected.push(rest.shift());
                break;
            }
            var idx = remaining.indexOf(pick);
            if (idx >= 0) remaining.splice(idx, 1);
            if (pick.scenario_id) selGroups[pick.scenario_id] = (selGroups[pick.scenario_id] || 0) + 1;
            for (var d = 0; d < dims.length; d++) {
                var b = dims[d].bucketOf(pick);
                if (dims[d].rem[b] > 0) dims[d].rem[b]--;
            }
            selected.push(pick);
        }
        return shuffle(selected);
    }

    function validateBlueprint(bp) {
        var errors = [];
        var groups = [
            ["Content", bp.chapters ? bp.chapters.map(function(c) { return c.pct; }) : []],
            ["Cognitive", valuesOf(bp.cognitive)],
            ["Difficulty", valuesOf(bp.difficulty)],
            ["Format", valuesOf(bp.format)]
        ];
        for (var g = 0; g < groups.length; g++) {
            var sum = 0;
            for (var i = 0; i < groups[g][1].length; i++) sum += groups[g][1][i];
            if (Math.abs(sum - 100) > 0.05) errors.push(groups[g][0] + " ratios total " + sum.toFixed(1) + "%, but must equal 100%.");
        }
        if (!bp.chapters || bp.chapters.length === 0) errors.push("Select at least one chapter.");
        if (!bp.total || bp.total <= 0) errors.push("Total questions must be greater than zero.");
        return errors;
    }

    function valuesOf(obj) {
        var out = [];
        if (!obj) return out;
        for (var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) out.push(obj[k]); }
        return out;
    }

    function targetCounts(bp) {
        return {
            chapters: largestRemainder(bp.total, bp.chapters.map(function(c) { return c.pct; })),
            cognitive: largestRemainder(bp.total, valuesOf(bp.cognitive)),
            difficulty: largestRemainder(bp.total, valuesOf(bp.difficulty)),
            format: largestRemainder(bp.total, valuesOf(bp.format))
        };
    }

    // Joint cognitive x difficulty allocation. rows/cols are target counts
    // keyed by cognitive level and difficulty; supply maps "k|easy" style
    // keys to how many pool questions exist in that cell. Returns
    // { "k|easy": n, ... } meeting BOTH margins exactly, or null when the
    // two margins cannot be satisfied at the same time — each margin can
    // look fine alone while, say, every hard question in the bank is
    // Analysis. Uses a tiny max-flow; cell-edge order is randomized so
    // repeated calls can return different valid allocations.
    function solveJointTargets(rows, cols, supply) {
        var rowKeys = [], colKeys = [];
        var key, i;
        var required = 0;
        for (key in rows) {
            if (Object.prototype.hasOwnProperty.call(rows, key) && rows[key] > 0) {
                rowKeys.push(key);
                required += rows[key];
            }
        }
        for (key in cols) {
            if (Object.prototype.hasOwnProperty.call(cols, key) && cols[key] > 0) colKeys.push(key);
        }
        if (required === 0) {
            // No row demand: fine only when the columns agree.
            var anyCol = false;
            for (var zc = 0; zc < colKeys.length; zc++) if (cols[colKeys[zc]] > 0) anyCol = true;
            return anyCol ? null : {};
        }
        // Both margins must demand the same total, otherwise no allocation
        // can meet them exactly.
        var colTotal = 0;
        for (var ci = 0; ci < colKeys.length; ci++) colTotal += cols[colKeys[ci]];
        if (colTotal !== required) return null;
        var R = rowKeys.length, C = colKeys.length;
        var source = 0, sink = R + C + 1, N = R + C + 2;
        var graph = [];
        for (i = 0; i < N; i++) graph.push([]);
        function addEdge(from, to, cap) {
            graph[from].push({ to: to, cap: cap, orig: cap, rev: graph[to].length });
            graph[to].push({ to: from, cap: 0, orig: 0, rev: graph[from].length - 1 });
        }
        for (i = 0; i < R; i++) addEdge(source, 1 + i, rows[rowKeys[i]]);
        for (i = 0; i < C; i++) addEdge(1 + R + i, sink, cols[colKeys[i]]);
        var cells = [];
        for (var r = 0; r < R; r++) {
            for (var c = 0; c < C; c++) {
                var cap = supply[rowKeys[r] + "|" + colKeys[c]] || 0;
                if (cap > 0) cells.push({ r: r, c: c, cap: cap });
            }
        }
        for (i = cells.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var swap = cells[i]; cells[i] = cells[j]; cells[j] = swap;
        }
        for (i = 0; i < cells.length; i++) addEdge(1 + cells[i].r, 1 + R + cells[i].c, cells[i].cap);
        var flow = 0;
        while (flow < required) {
            var prev = [], prevEdge = [];
            for (i = 0; i < N; i++) { prev[i] = -1; prevEdge[i] = -1; }
            prev[source] = source;
            var queue = [source], qi = 0;
            while (qi < queue.length && prev[sink] === -1) {
                var u = queue[qi++];
                for (var ei = 0; ei < graph[u].length; ei++) {
                    var edge = graph[u][ei];
                    if (edge.cap > 0 && prev[edge.to] === -1) {
                        prev[edge.to] = u;
                        prevEdge[edge.to] = ei;
                        queue.push(edge.to);
                    }
                }
            }
            if (prev[sink] === -1) break;
            var bottleneck = Infinity;
            for (var v = sink; v !== source; v = prev[v]) {
                var pe = graph[prev[v]][prevEdge[v]];
                if (pe.cap < bottleneck) bottleneck = pe.cap;
            }
            for (v = sink; v !== source; v = prev[v]) {
                pe = graph[prev[v]][prevEdge[v]];
                pe.cap -= bottleneck;
                graph[pe.to][pe.rev].cap += bottleneck;
            }
            flow += bottleneck;
        }
        if (flow < required) return null;
        var out = {};
        for (var rr = 0; rr < R; rr++) {
            for (var ej = 0; ej < graph[1 + rr].length; ej++) {
                var ed = graph[1 + rr][ej];
                if (ed.to >= 1 + R && ed.to <= R + C) {
                    var used = ed.orig - ed.cap;
                    if (used > 0) out[rowKeys[rr] + "|" + colKeys[ed.to - (1 + R)]] = used;
                }
            }
        }
        return out;
    }

    function checkFeasibility(bp, pool) {
        var t = targetCounts(bp);
        var shortages = [];
        var byChapter = {};
        var cellSupply = {};
        var selectedPool = [];
        for (var i = 0; i < pool.length; i++) {
            var q = pool[i];
            byChapter[q.chapter] = (byChapter[q.chapter] || 0) + 1;
            var cellKey = normCognitive(q) + "|" + normDifficulty(q.difficulty);
            cellSupply[cellKey] = (cellSupply[cellKey] || 0) + 1;
            selectedPool.push(q);
        }
        var cogKeys = Object.keys(bp.cognitive);
        var diffKeys = Object.keys(bp.difficulty);
        var fmtKeys = Object.keys(bp.format);
        for (var i = 0; i < bp.chapters.length; i++) {
            var ch = bp.chapters[i].chapter;
            if ((byChapter[ch] || 0) < t.chapters[i]) {
                shortages.push("Chapter " + ch + ": need " + t.chapters[i] + ", bank has " + (byChapter[ch] || 0));
            }
        }
        var cogHave = { k: 0, u: 0, a: 0 }, diffHave = {}, fmtHave = { straight: 0, scenario: 0 };
        for (var i = 0; i < selectedPool.length; i++) {
            cogHave[normCognitive(selectedPool[i])]++;
            var dk = normDifficulty(selectedPool[i].difficulty);
            diffHave[dk] = (diffHave[dk] || 0) + 1;
            fmtHave[normFormat(selectedPool[i])]++;
        }
        for (var i = 0; i < cogKeys.length; i++) {
            if ((cogHave[cogKeys[i]] || 0) < t.cognitive[i]) shortages.push(cogKeys[i].toUpperCase() + ": need " + t.cognitive[i] + ", bank has " + (cogHave[cogKeys[i]] || 0));
        }
        for (var i = 0; i < diffKeys.length; i++) {
            if ((diffHave[diffKeys[i]] || 0) < t.difficulty[i]) shortages.push(diffKeys[i] + ": need " + t.difficulty[i] + ", bank has " + (diffHave[diffKeys[i]] || 0));
        }
        for (var i = 0; i < fmtKeys.length; i++) {
            if ((fmtHave[fmtKeys[i]] || 0) < t.format[i]) shortages.push(fmtKeys[i] + ": need " + t.format[i] + ", selected chapters have " + (fmtHave[fmtKeys[i]] || 0));
        }
        // Joint cognitive x difficulty: every marginal above can pass while
        // no single selection satisfies both ratios at once (e.g. every
        // hard question in the bank is Analysis, but the blueprint wants
        // hard questions at other cognitive levels too).
        var cogDemand = {}, diffDemand = {};
        for (var i = 0; i < cogKeys.length; i++) cogDemand[cogKeys[i]] = t.cognitive[i];
        for (var i = 0; i < diffKeys.length; i++) diffDemand[diffKeys[i]] = t.difficulty[i];
        var jointAlloc = solveJointTargets(cogDemand, diffDemand, cellSupply);
        if (jointAlloc === null) {
            shortages.push("Cognitive x difficulty combination: the selected chapters cannot satisfy the cognitive and difficulty ratios at the same time (some cognitive level has no questions at a required difficulty).");
        } else if (shortages.length === 0) {
            // All four marginals can pass while no single question set
            // satisfies them together (e.g. the chapter slots only fit
            // questions from cells the format slots cannot spare). Search
            // for one cognitive x difficulty allocation that BOTH the
            // remaining chapter slots and the remaining format slots can
            // absorb; when none of the randomized candidates works, the
            // ratios are jointly impossible.
            var chCellSupply = {}, fmtCellSupply = {}, chFmtSupply = {};
            for (var i = 0; i < selectedPool.length; i++) {
                var sq = selectedPool[i];
                var scell = normCognitive(sq) + "|" + normDifficulty(sq.difficulty);
                var sck = String(sq.chapter) + "|" + scell;
                chCellSupply[sck] = (chCellSupply[sck] || 0) + 1;
                var sfk = normFormat(sq) + "|" + scell;
                fmtCellSupply[sfk] = (fmtCellSupply[sfk] || 0) + 1;
                var scfk = String(sq.chapter) + "|" + normFormat(sq);
                chFmtSupply[scfk] = (chFmtSupply[scfk] || 0) + 1;
            }
            var chDemand = {}, fmtDemand = {};
            for (var i = 0; i < bp.chapters.length; i++) chDemand[bp.chapters[i].chapter] = t.chapters[i];
            for (var i = 0; i < fmtKeys.length; i++) fmtDemand[fmtKeys[i]] = t.format[i];
            var compatible = false;
            if (solveJointTargets(chDemand, fmtDemand, chFmtSupply) !== null) {
                for (var i = 0; i < 60 && !compatible; i++) {
                    var alloc = solveJointTargets(cogDemand, diffDemand, cellSupply);
                    if (!alloc) break;
                    if (solveJointTargets(chDemand, alloc, chCellSupply) !== null &&
                        solveJointTargets(fmtDemand, alloc, fmtCellSupply) !== null) compatible = true;
                }
            }
            if (!compatible) shortages.push("Chapter/cognitive/difficulty/format combination: the selected chapters cannot satisfy the chapter, cognitive, difficulty and format ratios at the same time.");
        }
        var fmtCog = { straight: { k: 0, u: 0, a: 0 }, scenario: { k: 0, u: 0, a: 0 } };
        for (var i = 0; i < selectedPool.length; i++) {
            var f = normFormat(selectedPool[i]);
            var c = normCognitive(selectedPool[i]);
            if (fmtCog[f]) fmtCog[f][c]++;
        }
        var scenarioTarget = 0, aTarget = 0;
        for (var i = 0; i < fmtKeys.length; i++) if (fmtKeys[i] === "scenario") scenarioTarget = t.format[i];
        for (var i = 0; i < cogKeys.length; i++) if (cogKeys[i] === "a") aTarget = t.cognitive[i];
        var scenarioNonARequired = Math.max(0, scenarioTarget - aTarget);
        var scenarioNonAHave = fmtCog.scenario.k + fmtCog.scenario.u;
        if (scenarioNonAHave < scenarioNonARequired) {
            shortages.push("Scenario/cognitive intersection: at least " + scenarioNonARequired + " scenario questions must be Knowledge/Understanding; selected chapters have " + scenarioNonAHave + ".");
        }
        return shortages;
    }

    function generateExamPlan(bp, pool, retries) {
        retries = retries || 250;
        var errs = validateBlueprint(bp);
        if (errs.length) return null;
        var t = targetCounts(bp);
        for (var attempt = 0; attempt < retries; attempt++) {
            var plan = makePlan(bp, t, pool);
            if (plan) return orderScenarioGroups(plan);
        }
        return null;
    }

    // Shared entry point for assignment/exam selection: exact blueprint plan
    // when feasible, closest-balance selection otherwise. Never throws.
    function selectForBlueprint(bp, pool, retries) {
        if (!bp || !pool || pool.length === 0 || !bp.total || bp.total <= 0) return [];
        var plan = generateExamPlan(bp, pool, retries);
        if (plan && plan.length > 0) return plan;
        return selectBalanced(pool, bp.total, {
            targets: { cognitive: bp.cognitive, difficulty: bp.difficulty, format: bp.format }
        });
    }

    // Paper/attempt order: straight questions first, then scenario questions
    // grouped contiguously by scenario_id, each group in question_order (1-4).
    function orderScenarioGroups(list) {
        if (!list || list.length === 0) return [];
        if (list.length === 1) return list.slice();
        var straight = [];
        var groups = {};
        var groupOrder = [];
        for (var i = 0; i < list.length; i++) {
            var q = list[i];
            if (normFormat(q) !== "scenario") { straight.push(q); continue; }
            var gid = q.scenario_id;
            if (!gid) gid = "sc:" + String(q.scenario || q.stimulus || "");
            if (!groups[gid]) { groups[gid] = []; groupOrder.push(gid); }
            groups[gid].push({ q: q, idx: i });
        }
        var out = straight.slice();
        for (var g = 0; g < groupOrder.length; g++) {
            var members = groups[groupOrder[g]];
            members.sort(function(a, b) {
                var oa = parseInt(a.q.question_order, 10);
                var ob = parseInt(b.q.question_order, 10);
                if (isNaN(oa)) oa = parseInt(a.q.scenario_order, 10);
                if (isNaN(ob)) ob = parseInt(b.q.scenario_order, 10);
                if (isNaN(oa)) oa = a.idx;
                if (isNaN(ob)) ob = b.idx;
                return oa - ob;
            });
            for (var m = 0; m < members.length; m++) out.push(members[m].q);
        }
        return out;
    }

    // Copy a question's own properties (shallow) for version generation.
    function copyQuestion(q) {
        var c = {};
        for (var k in q) if (Object.prototype.hasOwnProperty.call(q, k)) c[k] = q[k];
        return c;
    }

    // Randomize option order for one question and remap the answer letter
    // so it still points at the same option text. Returns a copy.
    function shuffleOptions(q) {
        var c = copyQuestion(q);
        var opts = q && q.options ? q.options : [];
        if (opts.length < 2) return c;
        var perm = [];
        for (var i = 0; i < opts.length; i++) perm.push(i);
        for (i = opts.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = perm[i]; perm[i] = perm[j]; perm[j] = t;
        }
        var newOpts = [];
        for (i = 0; i < perm.length; i++) newOpts.push(opts[perm[i]]);
        c.options = newOpts;
        var ans = q && typeof q.answer === "string" ? q.answer.toUpperCase() : "";
        if (ans.length === 1 && ans >= "A" && ans <= "Z") {
            var origIdx = ans.charCodeAt(0) - 65;
            if (origIdx < perm.length) {
                for (i = 0; i < perm.length; i++) {
                    if (perm[i] === origIdx) { c.answer = String.fromCharCode(65 + i); break; }
                }
            }
        }
        return c;
    }

    // Shuffle only the straight-question prefix. Scenario groups at the
    // end keep both their group contiguity and internal question_order.
    function shuffleStraightSegment(list) {
        if (!list || list.length === 0) return [];
        if (list.length < 3) return list.slice();
        var firstScen = -1;
        for (var i = 0; i < list.length; i++) {
            if (normFormat(list[i]) === "scenario") { firstScen = i; break; }
        }
        if (firstScen === -1) return shuffle(list);
        if (firstScen < 2) return list.slice();
        return shuffle(list.slice(0, firstScen)).concat(list.slice(firstScen));
    }

    // N independent papers from one blueprint: different selection, shuffled
    // straight order, shuffled options (answers remapped), scenarios intact
    // and last. Returns [{ label: "A", questions: [...] }, ...] or null.
    function generateVersions(bp, pool, n, retries) {
        n = Number(n) || 1;
        if (n < 1) n = 1;
        var out = [];
        for (var v = 0; v < n; v++) {
            var plan = generateExamPlan(bp, pool, retries);
            if (!plan || plan.length === 0) return null;
            plan = shuffleStraightSegment(plan);
            var qs = [];
            for (var i = 0; i < plan.length; i++) qs.push(shuffleOptions(plan[i]));
            out.push({ label: String.fromCharCode(65 + v), questions: qs });
        }
        return out;
    }

    function makePlan(bp, t, pool) {
        var rem = { chapters: {}, cognitive: {}, difficulty: {}, format: {}, cells: null };
        for (var i = 0; i < bp.chapters.length; i++) rem.chapters[bp.chapters[i].chapter] = t.chapters[i];
        var cogKeys = Object.keys(bp.cognitive);
        var diffKeys = Object.keys(bp.difficulty);
        var fmtKeys = Object.keys(bp.format);
        for (var i = 0; i < cogKeys.length; i++) rem.cognitive[cogKeys[i]] = t.cognitive[i];
        for (var i = 0; i < diffKeys.length; i++) rem.difficulty[diffKeys[i]] = t.difficulty[i];
        for (var i = 0; i < fmtKeys.length; i++) rem.format[fmtKeys[i]] = t.format[i];
        // Joint bookkeeping for the exact residual checks:
        // - cellLeft: live count per cognitive|difficulty cell;
        // - leftChCell / leftFmtCell: live count per chapter|cell and
        //   format|cell (the couplings the greedy used to dead-end on);
        // - chLeft/cogLeft/diffLeft/fmtLeft: marginal supply counters;
        // - rem.cells: one cognitive x difficulty allocation of the
        //   remaining targets that the remaining chapter and format slots
        //   can actually absorb (re-rolled after every pick).
        var cellLeft = {}, leftChCell = {}, leftFmtCell = {}, leftChFmt = {};
        var chLeft = {}, cogLeft = {}, diffLeft = {}, fmtLeft = {};
        for (var si = 0; si < pool.length; si++) {
            var pq = pool[si];
            var pc = normCognitive(pq), pd = normDifficulty(pq.difficulty), pf = normFormat(pq);
            var pcKey = pc + "|" + pd;
            cellLeft[pcKey] = (cellLeft[pcKey] || 0) + 1;
            var pcc = String(pq.chapter) + "|" + pcKey;
            leftChCell[pcc] = (leftChCell[pcc] || 0) + 1;
            var pfc = pf + "|" + pcKey;
            leftFmtCell[pfc] = (leftFmtCell[pfc] || 0) + 1;
            var pcf = String(pq.chapter) + "|" + pf;
            leftChFmt[pcf] = (leftChFmt[pcf] || 0) + 1;
            chLeft[pq.chapter] = (chLeft[pq.chapter] || 0) + 1;
            cogLeft[pc] = (cogLeft[pc] || 0) + 1;
            diffLeft[pd] = (diffLeft[pd] || 0) + 1;
            fmtLeft[pf] = (fmtLeft[pf] || 0) + 1;
        }
        var initAlloc = solveCompatibleAlloc(25);
        if (!initAlloc) return null;
        rem.cells = initAlloc.alloc;
        rem.chFlow = initAlloc.chFlow;
        rem.fmtFlow = initAlloc.fmtFlow;
        rem.chFmtFlow = initAlloc.chFmtFlow;
        var jointCache = {};

        // Find a cognitive x difficulty allocation of the current state
        // that the remaining chapter and format slots can absorb: the
        // allocation pins the per-cell demands, then a chapter x cell flow
        // and a format x cell flow must both realize them. Randomized
        // re-rolls search the space of valid allocations. The flows are
        // kept because a pick is trivially safe when all four (allocation,
        // chapter flow, format flow, chapter x format flow) credit it
        // together.
        function solveCompatibleAlloc(rolls) {
            var chFmtFlow = solveJointTargets(rem.chapters, rem.format, leftChFmt);
            if (!chFmtFlow) return null;
            for (var r = 0; r < rolls; r++) {
                var cand = solveJointTargets(rem.cognitive, rem.difficulty, cellLeft);
                if (!cand) return null;
                var chFlow = solveJointTargets(rem.chapters, cand, leftChCell);
                if (!chFlow) continue;
                var fmtFlow = solveJointTargets(rem.format, cand, leftFmtCell);
                if (!fmtFlow) continue;
                return { alloc: cand, chFlow: chFlow, fmtFlow: fmtFlow, chFmtFlow: chFmtFlow };
            }
            return null;
        }

        // Fast counter version of the old pool scan: every remaining
        // bucket still has supply for its remaining demand.
        function stillPossible() {
            var k;
            for (k in rem.chapters) if ((chLeft[k] || 0) < rem.chapters[k]) return false;
            for (k in rem.cognitive) if ((cogLeft[k] || 0) < rem.cognitive[k]) return false;
            for (k in rem.difficulty) if ((diffLeft[k] || 0) < rem.difficulty[k]) return false;
            for (k in rem.format) if ((fmtLeft[k] || 0) < rem.format[k]) return false;
            return true;
        }
        var selected = [];
        var remaining = pool.slice();
        var selGroups = {};
        // Duplicate suppression: prefer questions from similarity sets that
        // are still free, and only fall back to a conflicting one when the
        // blueprint could not be filled otherwise (relax as last resort).
        var sim = (typeof Similarity !== "undefined" && Similarity && Similarity.isReady()) ? Similarity.createSession() : null;
        var simRelaxed = false;
        function simOk(unit) { return !sim || sim.canTake(unit); }
        function simClaim(unit) { if (sim) sim.take(unit); }
        function simRelax() {
            if (simRelaxed) return;
            simRelaxed = true;
            console.warn("ExamEngine: used a similar question set as a last resort to complete the blueprint.");
        }

        function applySel(q) {
            selected.push(q);
            if (q.scenario_id) selGroups[q.scenario_id] = (selGroups[q.scenario_id] || 0) + 1;
            var qc = normCognitive(q), qd = normDifficulty(q.difficulty), qf = normFormat(q);
            var cellKey = qc + "|" + qd;
            rem.chapters[q.chapter]--;
            rem.cognitive[qc]--;
            rem.difficulty[qd]--;
            rem.format[qf]--;
            if (rem.cells) rem.cells[cellKey] = (rem.cells[cellKey] || 0) - 1;
            cellLeft[cellKey] = (cellLeft[cellKey] || 0) - 1;
            var chCellKey = String(q.chapter) + "|" + cellKey;
            leftChCell[chCellKey] = (leftChCell[chCellKey] || 0) - 1;
            var fmtCellKey = qf + "|" + cellKey;
            leftFmtCell[fmtCellKey] = (leftFmtCell[fmtCellKey] || 0) - 1;
            var chFmtKey = String(q.chapter) + "|" + qf;
            leftChFmt[chFmtKey] = (leftChFmt[chFmtKey] || 0) - 1;
            chLeft[q.chapter] = (chLeft[q.chapter] || 0) - 1;
            cogLeft[qc] = (cogLeft[qc] || 0) - 1;
            diffLeft[qd] = (diffLeft[qd] || 0) - 1;
            fmtLeft[qf] = (fmtLeft[qf] || 0) - 1;
            jointCache = {};
            // Keep the compatible allocation in step with the new state so
            // the O(1) fast path in jointOk stays honest. If the
            // randomized search misses (rare — the state is feasible by
            // induction), clear it and jointOk falls back to exact
            // re-solves for every candidate.
            var sol = solveCompatibleAlloc(6);
            if (sol) {
                rem.cells = sol.alloc;
                rem.chFlow = sol.chFlow;
                rem.fmtFlow = sol.fmtFlow;
                rem.chFmtFlow = sol.chFmtFlow;
            } else {
                rem.cells = null;
                rem.chFlow = null;
                rem.fmtFlow = null;
                rem.chFmtFlow = null;
            }
            var idx = remaining.indexOf(q);
            if (idx >= 0) remaining.splice(idx, 1);
        }

        // Exact check for one candidate: after taking it, does ANY
        // completion of all four ratios still exist (cognitive x difficulty
        // allocation that both the remaining chapter slots and the
        // remaining format slots can absorb)? Fast path when the current
        // allocation AND both realization flows credit this exact pick —
        // decrementing all three together keeps every constraint
        // satisfiable. Otherwise re-solve for the post-pick state; the
        // result only depends on (chapter, format, cell), so it is cached
        // until the next pick changes the state.
        function jointOk(qc, qd, qch, qfmt) {
            var cellKey = qc + "|" + qd;
            var chKey = String(qch) + "|" + cellKey;
            var fmtKey = qfmt + "|" + cellKey;
            if (rem.cells && (rem.cells[cellKey] || 0) > 0 &&
                rem.chFlow && (rem.chFlow[chKey] || 0) > 0 &&
                rem.fmtFlow && (rem.fmtFlow[fmtKey] || 0) > 0 &&
                rem.chFmtFlow && (rem.chFmtFlow[String(qch) + "|" + qfmt] || 0) > 0) return true;
            var cacheKey = String(qch) + "|" + qfmt + "|" + cellKey;
            if (jointCache[cacheKey] !== undefined) return jointCache[cacheKey];
            var rows = {}, cols = {}, chDem = {}, fmtDem = {};
            var supply = {}, chSupply = {}, fmtSupply = {}, chFmtSupply = {};
            var k;
            for (k in rem.cognitive) if (Object.prototype.hasOwnProperty.call(rem.cognitive, k)) rows[k] = rem.cognitive[k] - (k === qc ? 1 : 0);
            for (k in rem.difficulty) if (Object.prototype.hasOwnProperty.call(rem.difficulty, k)) cols[k] = rem.difficulty[k] - (k === qd ? 1 : 0);
            for (k in rem.chapters) if (Object.prototype.hasOwnProperty.call(rem.chapters, k)) chDem[k] = rem.chapters[k] - (String(k) === String(qch) ? 1 : 0);
            for (k in rem.format) if (Object.prototype.hasOwnProperty.call(rem.format, k)) fmtDem[k] = rem.format[k] - (k === qfmt ? 1 : 0);
            for (k in cellLeft) if (Object.prototype.hasOwnProperty.call(cellLeft, k)) supply[k] = cellLeft[k] - (k === cellKey ? 1 : 0);
            for (k in leftChCell) if (Object.prototype.hasOwnProperty.call(leftChCell, k)) chSupply[k] = leftChCell[k] - (k === chKey ? 1 : 0);
            for (k in leftFmtCell) if (Object.prototype.hasOwnProperty.call(leftFmtCell, k)) fmtSupply[k] = leftFmtCell[k] - (k === fmtKey ? 1 : 0);
            for (k in leftChFmt) if (Object.prototype.hasOwnProperty.call(leftChFmt, k)) chFmtSupply[k] = leftChFmt[k] - (k === String(qch) + "|" + qfmt ? 1 : 0);
            var ok = false;
            // Chapter x format projection first (independent of the cell
            // allocation — catches e.g. every straight question living in
            // a chapter whose slots are already spent elsewhere).
            if (solveJointTargets(chDem, fmtDem, chFmtSupply) !== null) {
                var alloc = solveJointTargets(rows, cols, supply);
                if (alloc) {
                    ok = solveJointTargets(chDem, alloc, chSupply) !== null &&
                         solveJointTargets(fmtDem, alloc, fmtSupply) !== null;
                }
            }
            jointCache[cacheKey] = ok;
            return ok;
        }

        function fitsAlone(q) {
            var ch = rem.chapters[q.chapter];
            if (ch === undefined || ch <= 0) return false;
            var qc = normCognitive(q), qd = normDifficulty(q.difficulty);
            var cg = rem.cognitive[qc];
            if (cg === undefined || cg <= 0) return false;
            var df = rem.difficulty[qd];
            if (df === undefined || df <= 0) return false;
            var qf = normFormat(q);
            var fm = rem.format[qf];
            if (fm === undefined || fm <= 0) return false;
            return jointOk(qc, qd, q.chapter, qf);
        }

        // Phase 1 — scenario questions are taken as WHOLE groups so a
        // stimulus group is never split across the paper. Only when the
        // quota is not a multiple of the group size (or whole groups are
        // blocked by other buckets) does it fall back to individuals,
        // with a cohesion bonus keeping same-group members together.
        var scenRem = rem.format.scenario || 0;
        while (scenRem > 0) {
            var groups = {};
            for (var gi = 0; gi < remaining.length; gi++) {
                var gq = remaining[gi];
                if (normFormat(gq) !== "scenario") continue;
                var gk = gq.scenario_id ? gq.scenario_id : ("sc:" + String(gq.scenario || gq.stimulus || ""));
                if (!groups[gk]) groups[gk] = [];
                groups[gk].push(gq);
            }
            var bestKey = null, bestScore = -1;
            var relaxKey = null, relaxScore = -1;
            for (var key in groups) {
                var members = groups[key];
                if (members.length === 0 || members.length > scenRem) continue;
                // A whole group must fit every bucket as a unit — members
                // can share one chapter/cognitive/difficulty/cell — so check
                // aggregate demand, then fall back to an exact re-solve of
                // the post-group state (cognitive x difficulty allocation
                // plus chapter x cell and format x cell flows) when the
                // current allocation does not credit the group.
                var needCh = {}, needCg = {}, needDf = {}, needFmt = {};
                var needCell = {}, needChCell = {}, needFmtCell = {}, needChFmt = {};
                for (var mi = 0; mi < members.length; mi++) {
                    var mq = members[mi];
                    var mc = normCognitive(mq), md = normDifficulty(mq.difficulty);
                    var mf = normFormat(mq);
                    var mcell = mc + "|" + md;
                    needCh[mq.chapter] = (needCh[mq.chapter] || 0) + 1;
                    needCg[mc] = (needCg[mc] || 0) + 1;
                    needDf[md] = (needDf[md] || 0) + 1;
                    needFmt[mf] = (needFmt[mf] || 0) + 1;
                    needCell[mcell] = (needCell[mcell] || 0) + 1;
                    var mck = String(mq.chapter) + "|" + mcell;
                    needChCell[mck] = (needChCell[mck] || 0) + 1;
                    var mfk = mf + "|" + mcell;
                    needFmtCell[mfk] = (needFmtCell[mfk] || 0) + 1;
                    var mcf = String(mq.chapter) + "|" + mf;
                    needChFmt[mcf] = (needChFmt[mcf] || 0) + 1;
                }
                var ok = bucketCovers(needCh, rem.chapters) && bucketCovers(needCg, rem.cognitive) &&
                         bucketCovers(needDf, rem.difficulty) && bucketCovers(needFmt, rem.format);
                if (ok) {
                    var grows = {}, gcols = {}, gsupply = {};
                    var gchDem = {}, gfmtDem = {}, gchSupply = {}, gfmtSupply = {}, gchFmtSupply = {};
                    var jkey;
                    for (jkey in rem.cognitive) if (Object.prototype.hasOwnProperty.call(rem.cognitive, jkey)) grows[jkey] = rem.cognitive[jkey] - (needCg[jkey] || 0);
                    for (jkey in rem.difficulty) if (Object.prototype.hasOwnProperty.call(rem.difficulty, jkey)) gcols[jkey] = rem.difficulty[jkey] - (needDf[jkey] || 0);
                    for (jkey in cellLeft) if (Object.prototype.hasOwnProperty.call(cellLeft, jkey)) gsupply[jkey] = cellLeft[jkey] - (needCell[jkey] || 0);
                    for (jkey in rem.chapters) if (Object.prototype.hasOwnProperty.call(rem.chapters, jkey)) gchDem[jkey] = rem.chapters[jkey] - (needCh[jkey] || 0);
                    for (jkey in rem.format) if (Object.prototype.hasOwnProperty.call(rem.format, jkey)) gfmtDem[jkey] = rem.format[jkey] - (needFmt[jkey] || 0);
                    for (jkey in leftChCell) if (Object.prototype.hasOwnProperty.call(leftChCell, jkey)) gchSupply[jkey] = leftChCell[jkey] - (needChCell[jkey] || 0);
                    for (jkey in leftFmtCell) if (Object.prototype.hasOwnProperty.call(leftFmtCell, jkey)) gfmtSupply[jkey] = leftFmtCell[jkey] - (needFmtCell[jkey] || 0);
                    for (jkey in leftChFmt) if (Object.prototype.hasOwnProperty.call(leftChFmt, jkey)) gchFmtSupply[jkey] = leftChFmt[jkey] - (needChFmt[jkey] || 0);
                    // Chapter x format projection first (independent of
                    // the cell allocation), then the allocation flows.
                    ok = solveJointTargets(gchDem, gfmtDem, gchFmtSupply) !== null;
                }
                if (ok) {
                    // Prefer the current allocation minus the group (cheap
                    // and likely to work), then randomized re-rolls.
                    var baseAlloc = null;
                    if (rem.cells && bucketCovers(needCell, rem.cells)) {
                        baseAlloc = {};
                        for (jkey in rem.cells) if (Object.prototype.hasOwnProperty.call(rem.cells, jkey)) {
                            baseAlloc[jkey] = rem.cells[jkey] - (needCell[jkey] || 0);
                        }
                    }
                    ok = false;
                    for (var gr = 0; gr < 6 && !ok; gr++) {
                        var gal = null;
                        if (gr === 0 && baseAlloc) gal = baseAlloc;
                        else gal = solveJointTargets(grows, gcols, gsupply);
                        if (!gal) break;
                        if (solveJointTargets(gchDem, gal, gchSupply) !== null &&
                            solveJointTargets(gfmtDem, gal, gfmtSupply) !== null) ok = true;
                    }
                }
                var gscore = 0;
                if (ok) {
                    for (var mi2 = 0; mi2 < members.length; mi2++) {
                        var mq2 = members[mi2];
                        gscore += rem.chapters[mq2.chapter] * 5 + rem.cognitive[normCognitive(mq2)] * 4 +
                                  rem.difficulty[normDifficulty(mq2.difficulty)] * 3 + Math.random() * 0.5;
                    }
                }
                if (!ok) continue;
                if (simOk(members)) {
                    if (gscore > bestScore) { bestScore = gscore; bestKey = key; }
                } else if (gscore > relaxScore) { relaxScore = gscore; relaxKey = key; }
            }
            var takeKey = bestKey;
            if (!takeKey && relaxKey) { takeKey = relaxKey; simRelax(); }
            if (takeKey) {
                var pick = groups[takeKey];
                for (var pi = 0; pi < pick.length; pi++) applySel(pick[pi]);
                simClaim(pick);
                scenRem -= pick.length;
                if (!stillPossible()) return null;
                continue;
            }
            var iBest = null, iScore = -1;
            var rBest = null, rScore = -1;
            for (var ii = 0; ii < remaining.length; ii++) {
                var iq = remaining[ii];
                if (normFormat(iq) !== "scenario") continue;
                if (!fitsAlone(iq)) continue;
                var gBonus = 0;
                if (iq.scenario_id) {
                    var gCount = selGroups[iq.scenario_id] || 0;
                    var qo = parseInt(iq.question_order, 10);
                    if (gCount > 0 && !isNaN(qo) && gCount === qo - 1) gBonus = 10;
                    else if (gCount > 0) gBonus = 4;
                    else if (qo === 1) gBonus = 6;
                }
                var isc = rem.chapters[iq.chapter] * 5 + rem.cognitive[normCognitive(iq)] * 4 +
                          gBonus + rem.difficulty[normDifficulty(iq.difficulty)] * 3 + Math.random();
                if (simOk([iq])) {
                    if (isc > iScore) { iScore = isc; iBest = iq; }
                } else if (isc > rScore) { rScore = isc; rBest = iq; }
            }
            var iTake = iBest;
            if (!iTake && rBest) { iTake = rBest; simRelax(); }
            if (!iTake) return null;
            applySel(iTake);
            simClaim([iTake]);
            scenRem--;
            if (!stillPossible()) return null;
        }

        // Phase 2 — straight questions with the original per-question
        // greedy scoring (the scenario bucket is 0 by now, so scenario
        // questions can no longer be picked here).
        while (selected.length < bp.total) {
            var candidates = [];
            for (var i = 0; i < remaining.length; i++) {
                var q = remaining[i];
                if (!fitsAlone(q)) continue;
                var ch = rem.chapters[q.chapter];
                var cg = rem.cognitive[normCognitive(q)];
                var df = rem.difficulty[normDifficulty(q.difficulty)];
                var fm = rem.format[normFormat(q)];
                var score = ch * 5 + cg * 4 + fm * 4 + df * 3 + Math.random();
                candidates.push([score, q, simOk([q])]);
            }
            if (candidates.length === 0) return null;
            candidates.sort(function(a, b) { return b[0] - a[0]; });
            var pick = null;
            for (var ci = 0; ci < candidates.length; ci++) {
                if (candidates[ci][2]) { pick = candidates[ci][1]; break; }
            }
            if (!pick) { pick = candidates[0][1]; simRelax(); }
            applySel(pick);
            simClaim([pick]);
            if (!stillPossible()) return null;
        }
        return selected;
    }

    // True when every key's demand fits inside the credit map.
    function bucketCovers(demand, have) {
        for (var dk in demand) {
            if (!Object.prototype.hasOwnProperty.call(demand, dk)) continue;
            if ((have[dk] || 0) < demand[dk]) return false;
        }
        return true;
    }

    // FBISE Table of Specifications (grade 9 CS): domain letter -> weight %
    var DEFAULT_TOS = { A: 26, B: 14, C: 17, D: 12, E: 9, F: 14, H: 8 };
    var CHAPTER_DOMAIN = { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E", 6: "F", 7: "H" };

    function chapterToSPct(chapter) {
        var d = CHAPTER_DOMAIN[chapter];
        return d && DEFAULT_TOS[d] !== undefined ? DEFAULT_TOS[d] : 0;
    }

    // Scale a list of raw chapter percentages so it sums to exactly 100.
    function normalizeToSAlloc(pctList) {
        return largestRemainder(100, pctList);
    }

    function normAnswerLetter(q) {
        var a = String(q && q.answer !== undefined && q.answer !== null ? q.answer : "").trim().toUpperCase();
        if (a.length === 1 && "ABCD".indexOf(a) >= 0) return a;
        var opts = (q && q.options) || [];
        for (var i = 0; i < opts.length; i++) if (String(opts[i]) === String(q.answer)) return "ABCD".charAt(i);
        return a ? a.charAt(0) : "";
    }

    function gradeDetected(questions, answers) {
        questions = questions || [];
        answers = answers || [];
        var score = 0, out = [];
        for (var i = 0; i < questions.length; i++) {
            var q = questions[i] || {};
            var key = normAnswerLetter(q);
            var sel = answers[i] !== undefined && answers[i] !== null ? String(answers[i]).toUpperCase().slice(0, 1) : null;
            var ok = !!(sel && key && sel === key);
            if (ok) score++;
            out.push({
                questionId: q.id,
                selectedAnswer: sel,
                correctAnswer: key,
                correct: ok,
                topic: q.topic || "General",
                difficulty: normDifficulty(q.difficulty) || "medium",
                bloom: q.bloom || "knowledge"
            });
        }
        return {
            score: score,
            total: questions.length,
            percentage: questions.length ? Number(((score / questions.length) * 100).toFixed(2)) : 0,
            questions: out
        };
    }

    return {
        normDifficulty: normDifficulty,
        normCognitive: normCognitive,
        normFormat: normFormat,
        shuffle: shuffle,
        largestRemainder: largestRemainder,
        DEFAULT_TARGETS: DEFAULT_TARGETS,
        DEFAULT_TOS: DEFAULT_TOS,
        CHAPTER_DOMAIN: CHAPTER_DOMAIN,
        chapterToSPct: chapterToSPct,
        normalizeToSAlloc: normalizeToSAlloc,
        orderScenarioGroups: orderScenarioGroups,
        shuffleOptions: shuffleOptions,
        shuffleStraightSegment: shuffleStraightSegment,
        generateVersions: generateVersions,
        gradeDetected: gradeDetected,
        normAnswerLetter: normAnswerLetter,
        selectForBlueprint: selectForBlueprint,
        selectBalanced: selectBalanced,
        validateBlueprint: validateBlueprint,
        targetCounts: targetCounts,
        solveJointTargets: solveJointTargets,
        checkFeasibility: checkFeasibility,
        generateExamPlan: generateExamPlan
    };
})();
