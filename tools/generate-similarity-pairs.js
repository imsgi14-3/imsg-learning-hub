// Regenerate question-bank/similarity-pairs.json from the question banks.
//
// Two pair sources are merged (keeping the higher score per pair):
//   1. Option-fingerprint clones  -> score 1.0 (star pattern: one hub per
//      clone group connects the rest, keeping the file lean). These are the
//      template-rephrased copies the old audit CSV never saw — without them
//      exam/blueprint generation (makePlan, which uses Similarity sessions
//      rather than fingerprintDedupe) could still pick two clones.
//   2. Stem near-duplicates       -> score 0.95: token Jaccard >= 0.6 within
//      the same chapter + topic, straight questions only (two different
//      stimuli are different questions, so scenario sets are excluded).
//
// Pairs already in the file are kept — scores merge with max(), so the old
// audit data is never lost and can only be upgraded.
//
// Usage:
//   node tools/generate-similarity-pairs.js [out.json]
//
// The active cut-off stays 0.95 (Similarity.DEFAULT_THRESHOLD), so every
// pair this writes is live at runtime; the file floor remains 0.90 for
// forward compatibility with tools/build-similarity-pairs.js.

var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");
var PAIRS_FILE = path.join(ROOT, "question-bank", "similarity-pairs.json");
var FILE_FLOOR = 0.9;
var STEM_JACCARD_MIN = 0.6;
var STEM_SCORE = 0.95;
var FINGERPRINT_SCORE = 1.0;

// Same loader as audit-duplicates.js: reuse the runtime fingerprint code so
// the shipped pairs always match what fingerprintDedupe() collapses.
function loadExamEngine() {
    var src = fs.readFileSync(path.join(ROOT, "examEngine.js"), "utf8");
    return new Function(src + "\n;return ExamEngine;")();
}

function loadBank(dir) {
    var out = [];
    if (!fs.existsSync(dir)) return out;
    var files = fs.readdirSync(dir).filter(function(f) { return /^chapter\d+\.json$/.test(f); });
    files.sort(function(a, b) {
        return parseInt(a.replace(/\D/g, ""), 10) - parseInt(b.replace(/\D/g, ""), 10);
    });
    for (var i = 0; i < files.length; i++) {
        try {
            var raw = JSON.parse(fs.readFileSync(path.join(dir, files[i]), "utf8"));
            var list = Array.isArray(raw) ? raw : (raw.questions || []);
            for (var q = 0; q < list.length; q++) if (list[q] && list[q].id) out.push(list[q]);
        } catch (e) {
            console.log("Skipping unreadable bank file " + files[i] + ": " + e.message);
        }
    }
    return out;
}

function tokenize(text) {
    var normalized = String(text == null ? "" : text)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    var parts = normalized.split(" ");
    var set = {};
    for (var i = 0; i < parts.length; i++) if (parts[i]) set[parts[i]] = true;
    return set;
}

function jaccard(a, b) {
    var A = tokenize(a);
    var B = tokenize(b);
    var inter = 0;
    for (var t in A) if (Object.prototype.hasOwnProperty.call(B, t)) inter++;
    var uni = Object.keys(A).length + Object.keys(B).length - inter;
    return uni ? inter / uni : 0;
}

function pairKey(a, b) { return a < b ? a + "|" + b : b + "|" + a; }

function fingerprintPairs(questions, ExamEngine) {
    var byFingerprint = {};
    for (var i = 0; i < questions.length; i++) {
        var fp = ExamEngine.fingerprintOf(questions[i]);
        if (fp === null) continue;
        if (!byFingerprint[fp]) byFingerprint[fp] = [];
        byFingerprint[fp].push(questions[i]);
    }
    var pairs = [];
    var groups = 0;
    for (var f in byFingerprint) {
        if (!Object.prototype.hasOwnProperty.call(byFingerprint, f)) continue;
        var members = byFingerprint[f];
        if (members.length < 2) continue;
        groups++;
        members.sort(function(a, b) { return String(a.id) < String(b.id) ? -1 : String(a.id) > String(b.id) ? 1 : 0; });
        var hub = members[0];
        for (var m = 1; m < members.length; m++) {
            var other = members[m];
            // Two members of one stimulus set share one selection unit, so a
            // pair between them can never suppress anything — skip it.
            if (hub.scenario_id && other.scenario_id && hub.scenario_id === other.scenario_id) continue;
            pairs.push({ a: hub.id, b: other.id, s: FINGERPRINT_SCORE });
        }
    }
    return { pairs: pairs, groups: groups };
}

function stemPairs(questions, ExamEngine) {
    var pairs = [];
    for (var i = 0; i < questions.length; i++) {
        for (var j = i + 1; j < questions.length; j++) {
            var a = questions[i], b = questions[j];
            if (a.scenario_id || b.scenario_id) continue; // stimuli differ
            if (a.chapter !== b.chapter || !a.topic || a.topic !== b.topic) continue;
            if (jaccard(a.question, b.question) < STEM_JACCARD_MIN) continue;
            var fa = ExamEngine.fingerprintOf(a);
            var fb = ExamEngine.fingerprintOf(b);
            if (fa !== null && fa === fb) continue; // already a 1.0 pair
            pairs.push({ a: a.id, b: b.id, s: STEM_SCORE });
        }
    }
    return pairs;
}

function loadExistingPairs(file) {
    if (!fs.existsSync(file)) return [];
    try {
        var data = JSON.parse(fs.readFileSync(file, "utf8"));
        return Array.isArray(data.pairs) ? data.pairs : [];
    } catch (e) {
        console.log("Existing pairs file unreadable (" + e.message + ") — starting fresh.");
        return [];
    }
}

function main() {
    var outPath = process.argv[2] || PAIRS_FILE;
    var ExamEngine = loadExamEngine();
    if (typeof ExamEngine.fingerprintOf !== "function") {
        console.error("examEngine.js does not export fingerprintOf — Phase 2 code missing.");
        process.exit(1);
    }

    var chemistry = loadBank(path.join(ROOT, "question-bank", "grade9", "chemistry"));
    var cs = loadBank(path.join(ROOT, "question-bank", "grade9", "computer-science"));
    var all = chemistry.concat(cs);

    var fp = fingerprintPairs(all, ExamEngine);
    var stems = stemPairs(all, ExamEngine);

    // Merge with the existing file: max(score) wins, nothing is dropped.
    var existing = loadExistingPairs(PAIRS_FILE);
    var merged = {};
    var order = [];
    function put(a, b, s) {
        if (!a || !b || a === b || !(s >= FILE_FLOOR)) return;
        var key = pairKey(a, b);
        if (merged[key] === undefined) order.push(key);
        merged[key] = Math.max(merged[key] || 0, s);
    }
    for (var e = 0; e < existing.length; e++) put(existing[e].a, existing[e].b, existing[e].s);
    var addedFp = 0, addedStem = 0, upgraded = 0;
    for (var i = 0; i < fp.pairs.length; i++) {
        var key = pairKey(fp.pairs[i].a, fp.pairs[i].b);
        var before = merged[key] || 0;
        put(fp.pairs[i].a, fp.pairs[i].b, fp.pairs[i].s);
        if (before === 0) addedFp++; else if (merged[key] > before) upgraded++;
    }
    for (i = 0; i < stems.length; i++) {
        var key2 = pairKey(stems[i].a, stems[i].b);
        var before2 = merged[key2] || 0;
        put(stems[i].a, stems[i].b, stems[i].s);
        if (before2 === 0) addedStem++; else if (merged[key2] > before2) upgraded++;
    }

    var pairs = [];
    for (var k = 0; k < order.length; k++) {
        var parts = order[k].split("|"); // pairKey stores ids in sorted order
        pairs.push({ a: parts[0], b: parts[1], s: Math.round(merged[order[k]] * 10000) / 10000 });
    }
    pairs.sort(function(x, y) { return y.s - x.s || (x.a < y.a ? -1 : x.a > y.a ? 1 : 0); });

    var head = {
        source: "tools/generate-similarity-pairs.js",
        minSimilarity: FILE_FLOOR,
        pairCount: pairs.length
    };
    // Pretty header + one pair per line: small file, readable diffs.
    var lines = pairs.map(function(p) { return JSON.stringify(p); });
    var json = JSON.stringify(head, null, 2).slice(0, -2) + ',\n  "pairs": [\n    ' +
        lines.join(",\n    ") + "\n  ]\n}\n";
    fs.writeFileSync(outPath, json, "utf8");

    var active = 0;
    for (i = 0; i < pairs.length; i++) if (pairs[i].s >= 0.95) active++;
    console.log("Banks: Chemistry " + chemistry.length + " + Computer Science " + cs.length + " questions");
    console.log("Fingerprint: " + fp.groups + " clone groups -> star pairs at 1.0 (" + fp.pairs.length + " candidates)");
    console.log("Stem: " + stems.length + " pairs at " + STEM_SCORE + " (Jaccard >= " + STEM_JACCARD_MIN + ", same chapter+topic, straight only)");
    console.log("Merge: " + existing.length + " existing, +" + addedFp + " fingerprint, +" + addedStem + " stem, " + upgraded + " upgraded to a higher score");
    console.log("Wrote " + pairs.length + " pairs (" + active + " active at >= 0.95) to " + outPath);
}

main();
