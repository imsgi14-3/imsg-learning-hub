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

    // Multi-dimension balanced selection with best-effort fallback.
    // opts: { targets: { difficulty, cognitive, format }, evenKey: "topic" | "chapter" | null }
    // Returns a randomized selection of min(count, pool.length) questions.
    function selectBalanced(pool, count, opts) {
        opts = opts || {};
        if (!pool || pool.length === 0 || count <= 0) return [];
        var src = shuffle(pool);
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

    function checkFeasibility(bp, pool) {
        var t = targetCounts(bp);
        var shortages = [];
        var byChapter = {};
        var selectedPool = [];
        for (var i = 0; i < pool.length; i++) {
            var q = pool[i];
            byChapter[q.chapter] = (byChapter[q.chapter] || 0) + 1;
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
        var rem = { chapters: {}, cognitive: {}, difficulty: {}, format: {} };
        for (var i = 0; i < bp.chapters.length; i++) rem.chapters[bp.chapters[i].chapter] = t.chapters[i];
        var cogKeys = Object.keys(bp.cognitive);
        var diffKeys = Object.keys(bp.difficulty);
        var fmtKeys = Object.keys(bp.format);
        for (var i = 0; i < cogKeys.length; i++) rem.cognitive[cogKeys[i]] = t.cognitive[i];
        for (var i = 0; i < diffKeys.length; i++) rem.difficulty[diffKeys[i]] = t.difficulty[i];
        for (var i = 0; i < fmtKeys.length; i++) rem.format[fmtKeys[i]] = t.format[i];
        var selected = [];
        var remaining = pool.slice();
        var selGroups = {};

        function applySel(q) {
            selected.push(q);
            if (q.scenario_id) selGroups[q.scenario_id] = (selGroups[q.scenario_id] || 0) + 1;
            rem.chapters[q.chapter]--;
            rem.cognitive[normCognitive(q)]--;
            rem.difficulty[normDifficulty(q.difficulty)]--;
            rem.format[normFormat(q)]--;
            var idx = remaining.indexOf(q);
            if (idx >= 0) remaining.splice(idx, 1);
        }

        function fitsAlone(q) {
            var ch = rem.chapters[q.chapter];
            if (ch === undefined || ch <= 0) return false;
            var cg = rem.cognitive[normCognitive(q)];
            if (cg === undefined || cg <= 0) return false;
            var df = rem.difficulty[normDifficulty(q.difficulty)];
            if (df === undefined || df <= 0) return false;
            var fm = rem.format[normFormat(q)];
            return !(fm === undefined || fm <= 0);
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
            for (var key in groups) {
                var members = groups[key];
                if (members.length === 0 || members.length > scenRem) continue;
                var ok = true, gscore = 0;
                for (var mi = 0; mi < members.length; mi++) {
                    var mq = members[mi];
                    var mch = rem.chapters[mq.chapter];
                    var mcg = rem.cognitive[normCognitive(mq)];
                    var mdf = rem.difficulty[normDifficulty(mq.difficulty)];
                    if (mch === undefined || mch <= 0 || mcg === undefined || mcg <= 0 || mdf === undefined || mdf <= 0) { ok = false; break; }
                    gscore += mch * 5 + mcg * 4 + mdf * 3 + Math.random() * 0.5;
                }
                if (!ok) continue;
                if (gscore > bestScore) { bestScore = gscore; bestKey = key; }
            }
            if (bestKey) {
                var pick = groups[bestKey];
                for (var pi = 0; pi < pick.length; pi++) applySel(pick[pi]);
                scenRem -= pick.length;
                if (!marginsStillPossible(remaining, rem)) return null;
                continue;
            }
            var iBest = null, iScore = -1;
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
                if (isc > iScore) { iScore = isc; iBest = iq; }
            }
            if (!iBest) return null;
            applySel(iBest);
            scenRem--;
            if (!marginsStillPossible(remaining, rem)) return null;
        }

        // Phase 2 — straight questions with the original per-question
        // greedy scoring (the scenario bucket is 0 by now, so scenario
        // questions can no longer be picked here).
        while (selected.length < bp.total) {
            var candidates = [];
            for (var i = 0; i < remaining.length; i++) {
                var q = remaining[i];
                var ch = rem.chapters[q.chapter];
                if (ch === undefined || ch <= 0) continue;
                var cg = rem.cognitive[normCognitive(q)];
                var df = rem.difficulty[normDifficulty(q.difficulty)];
                var fm = rem.format[normFormat(q)];
                if (cg === undefined || cg <= 0 || df === undefined || df <= 0 || fm === undefined || fm <= 0) continue;
                var score = ch * 5 + cg * 4 + fm * 4 + df * 3 + Math.random();
                candidates.push([score, q]);
            }
            if (candidates.length === 0) return null;
            candidates.sort(function(a, b) { return b[0] - a[0]; });
            applySel(candidates[0][1]);
            if (!marginsStillPossible(remaining, rem)) return null;
        }
        return selected;
    }

    function marginsStillPossible(pool, rem) {
        var checks = [
            { rem: rem.chapters, match: function(q, k) { return String(q.chapter) === String(k); } },
            { rem: rem.cognitive, match: function(q, k) { return normCognitive(q) === k; } },
            { rem: rem.difficulty, match: function(q, k) { return normDifficulty(q.difficulty) === k; } },
            { rem: rem.format, match: function(q, k) { return normFormat(q) === k; } }
        ];
        for (var c = 0; c < checks.length; c++) {
            var keys = Object.keys(checks[c].rem);
            for (var i = 0; i < keys.length; i++) {
                var need = checks[c].rem[keys[i]];
                if (need <= 0) continue;
                var have = 0;
                for (var p = 0; p < pool.length; p++) {
                    if (checks[c].match(pool[p], keys[i])) have++;
                }
                if (have < need) return false;
            }
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
        checkFeasibility: checkFeasibility,
        generateExamPlan: generateExamPlan
    };
})();
