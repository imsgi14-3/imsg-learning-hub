// Similarity module: which question ids are near-duplicates of each other.
//
// Pure data + set logic. No DOM, no Firestore, no localStorage.
//   data (question-bank/similarity-pairs.json) -> load()/loadPairs()
//   union-find clusters at the active threshold -> clusterOf()
//   units (a straight question, or a whole scenario stimulus set)
//       -> createSession() / filterUnits() / findDuplicates()
//
// Selection code (examEngine.js) calls this so a generated quiz/test/paper
// never contains two questions from the same similarity set. Everything here
// degrades to a no-op when the data file is missing or has not loaded yet.
var Similarity = (function() {

    // Pairs below this score are ignored even though they are shipped in the
    // JSON (the file keeps >= 0.90 so this stays tunable without a rebuild).
    var DEFAULT_THRESHOLD = 0.95;

    var threshold = DEFAULT_THRESHOLD;
    var allPairs = [];        // every pair in the file: { a, b, s }
    var activePairs = [];     // pairs at/above the threshold
    var parent = {};          // union-find: id -> parent id
    var clusterOfId = {};     // id -> cluster root (only ids in a cluster)
    var pairScore = {};       // "a|b" (ordered) -> score, active pairs only
    var ready = false;

    function reset() {
        threshold = DEFAULT_THRESHOLD;
        allPairs = [];
        activePairs = [];
        parent = {};
        clusterOfId = {};
        pairScore = {};
        ready = false;
    }

    function find(x) {
        var root = x;
        while (parent[root] !== root) root = parent[root];
        while (parent[x] !== root) {
            var next = parent[x];
            parent[x] = root;
            x = next;
        }
        return root;
    }

    function pairKey(a, b) { return a < b ? a + "|" + b : b + "|" + a; }

    // Rebuild clusters from activePairs. Cheap (a few hundred pairs) and done
    // once per load/threshold change, never per selection.
    function rebuild() {
        parent = {};
        clusterOfId = {};
        pairScore = {};
        activePairs = [];
        for (var i = 0; i < allPairs.length; i++) {
            var p = allPairs[i];
            if (!(p && p.a && p.b) || !(p.s >= threshold)) continue;
            activePairs.push(p);
            if (!(p.a in parent)) parent[p.a] = p.a;
            if (!(p.b in parent)) parent[p.b] = p.b;
            var ra = find(p.a), rb = find(p.b);
            if (ra !== rb) parent[ra] = rb;
            pairScore[pairKey(p.a, p.b)] = p.s;
        }
        for (var id in parent) {
            if (Object.prototype.hasOwnProperty.call(parent, id)) clusterOfId[id] = find(id);
        }
        ready = true;
    }

    // Inject pairs directly (tests, or a future local/precomputed source).
    function loadPairs(list, thr) {
        allPairs = Array.isArray(list) ? list : [];
        if (typeof thr === "number" && thr > 0) threshold = thr;
        rebuild();
    }

    // Fetch the pairs file. Never rejects: on any failure the module stays
    // inactive and selection behaves exactly as it did before this file existed.
    function load(url) {
        if (!url) return Promise.resolve(false);
        var sep = url.indexOf("?") >= 0 ? "&" : "?";
        return fetch(url + sep + "v=" + Date.now())
            .then(function(resp) {
                if (!resp.ok) throw new Error("HTTP " + resp.status);
                return resp.json();
            })
            .then(function(data) {
                if (!data || !Array.isArray(data.pairs)) throw new Error("unexpected shape");
                loadPairs(data.pairs);
                console.log("Similarity: " + activePairs.length + " similar pairs active at >= " + threshold +
                    " (" + Object.keys(clusterOfId).length + " questions in " + stats().clusterCount + " sets).");
                return true;
            })
            .catch(function(err) {
                console.log("Similarity data unavailable (" + (err && err.message ? err.message : err) +
                    ") — duplicate suppression is off.");
                reset();
                return false;
            });
    }

    function isReady() { return ready; }
    function getThreshold() { return threshold; }

    function clusterOf(qid) {
        if (!ready || !qid) return null;
        return Object.prototype.hasOwnProperty.call(clusterOfId, qid) ? clusterOfId[qid] : null;
    }

    // All ids that share a cluster with qid (excluding qid itself).
    function similarTo(qid) {
        var c = clusterOf(qid);
        if (!c) return [];
        var out = [];
        for (var id in clusterOfId) {
            if (Object.prototype.hasOwnProperty.call(clusterOfId, id) && id !== qid && clusterOfId[id] === c) out.push(id);
        }
        return out;
    }

    // A selection unit: a whole scenario stimulus set stays together (one
    // choice), a straight question is its own unit.
    function unitKey(q) {
        if (!q) return "";
        return q.scenario_id ? "sg:" + q.scenario_id : "q:" + (q.id || "");
    }

    // Group a flat question list into units, preserving first-seen order.
    function groupUnits(list) {
        var units = [];
        var byKey = {};
        for (var i = 0; i < (list ? list.length : 0); i++) {
            var q = list[i];
            if (!q) continue;
            var key = unitKey(q);
            if (byKey[key] !== undefined) {
                units[byKey[key]].push(q);
            } else {
                byKey[key] = units.length;
                units.push([q]);
            }
        }
        return units;
    }

    // One quiz / one paper = one session. Claimed clusters accumulate in the
    // order questions are taken, so nothing from a claimed set can follow.
    function createSession() {
        var claimed = {};

        function clustersOf(unit) {
            var out = [];
            if (!unit) return out;
            for (var i = 0; i < unit.length; i++) {
                var c = clusterOf(unit[i] && unit[i].id);
                if (c && out.indexOf(c) === -1) out.push(c);
            }
            return out;
        }

        function conflicts(unit) {
            var cs = clustersOf(unit);
            var hit = [];
            for (var i = 0; i < cs.length; i++) if (claimed[cs[i]]) hit.push(cs[i]);
            return hit;
        }

        return {
            // unit: array of questions (one question, or a scenario set)
            canTake: function(unit) { return conflicts(unit).length === 0; },
            take: function(unit) {
                var cs = clustersOf(unit);
                for (var i = 0; i < cs.length; i++) claimed[cs[i]] = true;
                return cs;
            },
            conflicts: conflicts,
            claimedCount: function() { return Object.keys(claimed).length; }
        };
    }

    // Keep at most one unit per similarity set, first unit wins. No-op when
    // the data is not loaded.
    function filterUnits(list) {
        if (!ready || !list || list.length < 2) return list;
        var session = createSession();
        var units = groupUnits(list);
        var keep = {};
        for (var i = 0; i < units.length; i++) {
            if (session.canTake(units[i])) {
                session.take(units[i]);
                for (var j = 0; j < units[i].length; j++) keep[units[i][j].id] = true;
            }
        }
        var out = [];
        for (var k = 0; k < list.length; k++) {
            if (list[k] && keep[list[k].id]) out.push(list[k]);
        }
        return out;
    }

    // Similar pairs inside a given list, strongest first. Used to flag
    // teacher hand-picked lists in the preview UI.
    function findDuplicates(list) {
        if (!ready || !list || list.length < 2) return [];
        var present = {};
        for (var i = 0; i < list.length; i++) if (list[i] && list[i].id) present[list[i].id] = true;
        var hits = [];
        for (var p = 0; p < activePairs.length; p++) {
            var pr = activePairs[p];
            if (present[pr.a] && present[pr.b]) hits.push({ a: pr.a, b: pr.b, s: pr.s });
        }
        hits.sort(function(x, y) { return y.s - x.s; });
        return hits;
    }

    function stats() {
        var ids = Object.keys(clusterOfId);
        var roots = {};
        for (var i = 0; i < ids.length; i++) roots[clusterOfId[ids[i]]] = true;
        return {
            ready: ready,
            threshold: threshold,
            activePairs: activePairs.length,
            clusterCount: Object.keys(roots).length,
            questionsCovered: ids.length
        };
    }

    return {
        DEFAULT_THRESHOLD: DEFAULT_THRESHOLD,
        load: load,
        loadPairs: loadPairs,
        reset: reset,
        isReady: isReady,
        getThreshold: getThreshold,
        clusterOf: clusterOf,
        similarTo: similarTo,
        unitKey: unitKey,
        groupUnits: groupUnits,
        createSession: createSession,
        filterUnits: filterUnits,
        findDuplicates: findDuplicates,
        stats: stats
    };
})();
