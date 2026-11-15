// Phase 1 audit: find template-rephrased MCQ clones in the Chemistry bank.
//
// A clone group = questions sharing one option fingerprint (identical
// normalized option set + identical correct-answer text) — exactly what
// ExamEngine.fingerprintDedupe() collapses at runtime. The tool loads and
// reuses that function, so the report can never drift from the runtime
// behaviour it describes.
//
// It also finds additional stem near-duplicates (Jaccard >= 0.6 within the
// same chapter + topic) that fingerprinting cannot see, checks whether any
// planned retirement is referenced by a Firestore assignment/exam, and
// writes a review report plus a machine-readable decision list for Phase 3.
//
// Usage:
//   node tools/audit-duplicates.js [--no-firebase]
//
// Output:
//   question-bank/grade9/chemistry/duplicate-audit.md    (review report)
//   question-bank/grade9/chemistry/duplicate-audit.json (Phase 3 decisions)

var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");
var CHEM_DIR = path.join(ROOT, "question-bank", "grade9", "chemistry");
var OUT_MD = path.join(CHEM_DIR, "duplicate-audit.md");
var OUT_JSON = path.join(CHEM_DIR, "duplicate-audit.json");

// The approved plan: at most 2 active variants per clone group.
var KEEPER_CAP = 2;
// Stem similarity threshold for "additional near-duplicate" pairs.
var STEM_JACCARD_MIN = 0.6;

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

// Load the browser IIFE from examEngine.js and reuse its fingerprint code.
// examEngine.js touches no DOM/globals at definition time, and every
// Similarity reference inside it is typeof-guarded, so this is safe.
function loadExamEngine() {
    var src = fs.readFileSync(path.join(ROOT, "examEngine.js"), "utf8");
    return new Function(src + "\n;return ExamEngine;")();
}

// Bank files are plain arrays for Chemistry (some chapters are empty []).
function loadChapterQuestions(file) {
    try {
        var raw = JSON.parse(fs.readFileSync(file, "utf8"));
        var list = Array.isArray(raw) ? raw : (raw.questions || []);
        return list.filter(function(q) { return q && q.id; });
    } catch (e) {
        return [];
    }
}

function loadChemistry() {
    var out = [];
    for (var c = 1; c <= 19; c++) {
        var file = path.join(CHEM_DIR, "chapter" + c + ".json");
        if (!fs.existsSync(file)) continue;
        var qs = loadChapterQuestions(file);
        for (var i = 0; i < qs.length; i++) out.push(qs[i]);
    }
    return out;
}

// original-seed and authored-* variants are human-curated; everything else
// (concept-expansion, repair batches, ...) is bulk-generated template work.
function variantTier(q) {
    var v = String(q.bank_variant || "");
    if (v === "original-seed") return 0;
    if (v.indexOf("authored") === 0) return 1;
    return 2;
}

function variantTierLabel(t) {
    return t === 0 ? "seed" : t === 1 ? "authored" : "generated";
}

function hasExplanation(q) {
    return !!(q.explanation && String(q.explanation).trim().length > 0);
}

function isScenario(q) {
    return !!q.scenario_id;
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
    var keysA = Object.keys(A).length;
    var keysB = Object.keys(B).length;
    var uni = keysA + keysB - inter;
    return uni ? inter / uni : 0;
}

function stemOf(q) {
    var s = String(q.question || q.text || "").replace(/\s+/g, " ").trim();
    return s.length > 72 ? s.substring(0, 69) + "..." : s;
}

function mdEscape(s) {
    return String(s).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

// ---------------------------------------------------------------------------
// Clone grouping + keeper decisions
// ---------------------------------------------------------------------------

function buildGroups(questions, ExamEngine) {
    var byFingerprint = {};
    var order = [];
    var ungrouped = 0;
    for (var i = 0; i < questions.length; i++) {
        var fp = ExamEngine.fingerprintOf(questions[i]);
        if (fp === null) { ungrouped++; continue; }
        if (!byFingerprint[fp]) { byFingerprint[fp] = []; order.push(fp); }
        byFingerprint[fp].push(questions[i]);
    }
    var groups = [];
    for (var g = 0; g < order.length; g++) {
        var members = byFingerprint[order[g]];
        if (members.length < 2) continue;
        groups.push({ fingerprint: order[g], members: members });
    }
    // Biggest families first, then stable id order for reproducible reports.
    groups.sort(function(a, b) {
        if (b.members.length !== a.members.length) return b.members.length - a.members.length;
        return String(a.members[0].id) < String(b.members[0].id) ? -1 : 1;
    });
    return { groups: groups, ungrouped: ungrouped };
}

// Keeper rules (approved plan):
//   1. Scenario questions are never retired — a stimulus set must survive
//      whole, and runtime fingerprint dedupe skips them by design.
//   2. Among straight members: seeded/authored variants beat bulk-generated
//      ones, an explanation beats none, lower id wins ties.
//   3. At most KEEPER_CAP straight keepers per group; the rest are retired.
function decideGroup(group) {
    var straight = [];
    var scenario = [];
    for (var i = 0; i < group.members.length; i++) {
        (isScenario(group.members[i]) ? scenario : straight).push(group.members[i]);
    }
    straight.sort(function(a, b) {
        var ta = variantTier(a), tb = variantTier(b);
        if (ta !== tb) return ta - tb;
        var ea = hasExplanation(a) ? 1 : 0, eb = hasExplanation(b) ? 1 : 0;
        if (ea !== eb) return eb - ea;
        return String(a.id) < String(b.id) ? -1 : String(a.id) > String(b.id) ? 1 : 0;
    });
    var keepCount = Math.min(KEEPER_CAP, straight.length);
    var keepers = straight.slice(0, keepCount);
    var retire = straight.slice(keepCount);
    var keepIds = {};
    for (var k = 0; k < keepers.length; k++) keepIds[keepers[k].id] = true;
    return {
        straight: straight,
        scenario: scenario,
        keepers: keepers,
        retire: retire,
        keepIds: keepIds
    };
}

// ---------------------------------------------------------------------------
// Scenario observations (report-only): the runtime fingerprint deliberately
// skips scenario questions, so this scenario-AWARE variant quantifies what
// Phase 3 will not touch. Never used for retirement decisions.
// ---------------------------------------------------------------------------

function fingerprintIgnoringScenario(q, ExamEngine) {
    if (!q || !q.scenario_id) return ExamEngine.fingerprintOf(q);
    var copy = {};
    for (var k in q) if (Object.prototype.hasOwnProperty.call(q, k)) copy[k] = q[k];
    delete copy.scenario_id;
    return ExamEngine.fingerprintOf(copy);
}

function scenarioObservations(questions, ExamEngine) {
    var byFingerprint = {};
    for (var i = 0; i < questions.length; i++) {
        var fp = fingerprintIgnoringScenario(questions[i], ExamEngine);
        if (fp === null) continue;
        if (!byFingerprint[fp]) byFingerprint[fp] = [];
        byFingerprint[fp].push(questions[i]);
    }
    var out = { withinSetGroups: 0, withinSetQuestions: 0, crossGroups: 0, crossQuestions: 0 };
    for (var f in byFingerprint) {
        if (!Object.prototype.hasOwnProperty.call(byFingerprint, f)) continue;
        var members = byFingerprint[f];
        if (members.length < 2) continue;
        var scenarioMembers = [];
        var setCounts = {};
        for (var m = 0; m < members.length; m++) {
            var q = members[m];
            if (!q.scenario_id) continue;
            scenarioMembers.push(q);
            setCounts[q.scenario_id] = (setCounts[q.scenario_id] || 0) + 1;
        }
        if (scenarioMembers.length === 0) continue;
        var hasSameSetRepeat = false;
        for (var s in setCounts) {
            if (Object.prototype.hasOwnProperty.call(setCounts, s) && setCounts[s] >= 2) hasSameSetRepeat = true;
        }
        if (hasSameSetRepeat) {
            out.withinSetGroups++;
            out.withinSetQuestions += scenarioMembers.length;
        } else {
            out.crossGroups++;
            out.crossQuestions += scenarioMembers.length;
        }
    }
    return out;
}

// ---------------------------------------------------------------------------
// Stem near-duplicates: same chapter + topic, Jaccard >= MIN, not already a
// fingerprint clone (those are covered at score 1.0).
// ---------------------------------------------------------------------------

function findStemNearDupes(questions, ExamEngine) {
    var pairs = [];
    for (var i = 0; i < questions.length; i++) {
        for (var j = i + 1; j < questions.length; j++) {
            var a = questions[i], b = questions[j];
            if (a.chapter !== b.chapter || !a.topic || a.topic !== b.topic) continue;
            if (jaccard(a.question, b.question) < STEM_JACCARD_MIN) continue;
            var fa = ExamEngine.fingerprintOf(a);
            var fb = ExamEngine.fingerprintOf(b);
            if (fa !== null && fa === fb) continue; // clone group member
            var kind;
            if (isScenario(a) && isScenario(b)) {
                kind = a.scenario_id === b.scenario_id ? "same-set" : "cross-set";
            } else if (isScenario(a) || isScenario(b)) {
                kind = "mixed";
            } else {
                kind = "straight";
            }
            pairs.push({
                a: a.id, b: b.id,
                chapter: a.chapter, topic: a.topic,
                s: Math.round(jaccard(a.question, b.question) * 1000) / 1000,
                kind: kind
            });
        }
    }
    pairs.sort(function(x, y) { return y.s - x.s || (x.a < y.a ? -1 : 1); });
    return pairs;
}

// ---------------------------------------------------------------------------
// Firestore reference check (best effort; never blocks the audit)
// ---------------------------------------------------------------------------

function readFirebaseConfig() {
    var file = path.join(ROOT, "firebase-config.js");
    if (!fs.existsSync(file)) return null;
    var text = fs.readFileSync(file, "utf8");
    var key = text.match(/apiKey:\s*"([^"]+)"/);
    var proj = text.match(/projectId:\s*"([^"]+)"/);
    if (!key || !proj) return null;
    return { apiKey: key[1], projectId: proj[1] };
}

// Firestore REST documents -> every string value inside them.
function collectStrings(node, out) {
    if (!node || typeof node !== "object") return out;
    if (typeof node.stringValue === "string") { out.push(node.stringValue); return out; }
    if (node.arrayValue && Array.isArray(node.arrayValue.values)) {
        for (var i = 0; i < node.arrayValue.values.length; i++) collectStrings(node.arrayValue.values[i], out);
        return out;
    }
    if (node.mapValue && node.mapValue.fields) {
        for (var k in node.mapValue.fields) {
            if (Object.prototype.hasOwnProperty.call(node.mapValue.fields, k)) collectStrings(node.mapValue.fields[k], out);
        }
        return out;
    }
    return out;
}

function fetchCollection(cfg, name) {
    var base = "https://firestore.googleapis.com/v1/projects/" + cfg.projectId +
        "/databases/(default)/documents/" + name;
    var docs = [];
    function page(token) {
        var url = base + "?key=" + encodeURIComponent(cfg.apiKey) + "&pageSize=300";
        if (token) url += "&pageToken=" + encodeURIComponent(token);
        return fetch(url, { signal: AbortSignal.timeout(15000) }).then(function(resp) {
            if (!resp.ok) throw new Error("HTTP " + resp.status + (resp.status === 403 ? " (permission denied — security rules block unauthenticated reads)" : ""));
            return resp.json();
        }).then(function(data) {
            if (Array.isArray(data.documents)) docs = docs.concat(data.documents);
            if (data.nextPageToken) return page(data.nextPageToken);
            return docs;
        });
    }
    return page(null);
}

function docLabel(doc) {
    var id = String(doc.name || "").split("/").pop() || "?";
    var fields = doc.fields || {};
    var title = fields.title && fields.title.stringValue ? fields.title.stringValue : "";
    return title ? (title + " [" + id + "]") : id;
}

function checkFirestore(referencedIds, skip) {
    if (skip) return Promise.resolve({ skipped: "--no-firebase" });
    var cfg = readFirebaseConfig();
    if (!cfg) return Promise.resolve({ skipped: "firebase-config.js not readable" });
    var out = { projectId: cfg.projectId, collections: {} };
    return Promise.allSettled([
        fetchCollection(cfg, "assignments"),
        fetchCollection(cfg, "exams")
    ]).then(function(results) {
        var names = ["assignments", "exams"];
        for (var i = 0; i < results.length; i++) {
            var r = results[i];
            var name = names[i];
            if (r.status === "rejected") {
                out.collections[name] = { error: String(r.reason && r.reason.message || r.reason) };
                continue;
            }
            var hits = [];
            var docs = r.value;
            for (var d = 0; d < docs.length; d++) {
                var strings = collectStrings(docs[d].fields, []);
                var found = [];
                for (var s = 0; s < strings.length; s++) {
                    if (referencedIds[strings[s]]) found.push(strings[s]);
                }
                if (found.length) hits.push({ doc: docLabel(docs[d]), retiredIds: found.sort() });
            }
            out.collections[name] = { scanned: docs.length, hits: hits };
        }
        return out;
    });
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

function perChapterStats(questions, groups, decisions) {
    var stats = {};
    function ensure(ch) {
        if (!stats[ch]) stats[ch] = { chapter: ch, total: 0, cloneGroups: 0, cloneMembers: 0, scenarioKept: 0, keepers: 0, retire: 0 };
        return stats[ch];
    }
    for (var i = 0; i < questions.length; i++) ensure(questions[i].chapter).total++;
    for (var g = 0; g < groups.length; g++) {
        var members = groups[g].members;
        var chapters = {};
        for (var m = 0; m < members.length; m++) chapters[members[m].chapter] = true;
        for (var ch in chapters) {
            if (Object.prototype.hasOwnProperty.call(chapters, ch)) ensure(ch).cloneGroups++;
        }
        for (m = 0; m < members.length; m++) {
            var st = ensure(members[m].chapter);
            st.cloneMembers++;
            var id = members[m].id;
            if (decisions[g].keepIds[id]) st.keepers++;
            else if (isScenario(members[m])) st.scenarioKept++;
            else st.retire++;
        }
    }
    var list = [];
    for (var k in stats) if (Object.prototype.hasOwnProperty.call(stats, k)) list.push(stats[k]);
    list.sort(function(a, b) { return a.chapter - b.chapter; });
    return list;
}

function buildReport(data, groups, decisions) {
    var L = [];
    L.push("# Chemistry Question Bank — Duplicate Audit (Phase 1)");
    L.push("");
    L.push("Generated: " + data.generatedAt + " by `tools/audit-duplicates.js`.");
    L.push("");
    L.push("## Method");
    L.push("");
    L.push("- **Clone group** = identical *option fingerprint*: the sorted, normalized");
    L.push("  option texts plus the normalized correct-answer text, computed by the");
    L.push("  same `ExamEngine.fingerprintOf()` that runtime practice selection uses.");
    L.push("  Stems are ignored on purpose — that is what makes reworded template");
    L.push("  copies visible. **Scenario questions are never fingerprinted** (their");
    L.push("  stimulus sets must survive whole), so they never enter a clone group");
    L.push("  and are never retired.");
    L.push("- **Keeper rules**: at most **" + KEEPER_CAP + " keepers per clone group** (clone");
    L.push("  groups are straight-only by the rule above); seeded/authored variants");
    L.push("  beat bulk-generated ones, an explanation beats none, lower id breaks ties.");
    L.push("- **Stem near-duplicates**: token Jaccard ≥ " + STEM_JACCARD_MIN.toFixed(1) +
        " within the same chapter + topic, excluding pairs already inside one clone group.");
    L.push("");
    L.push("## Summary");
    L.push("");
    L.push("| Metric | Value |");
    L.push("|---|---|");
    L.push("| Chemistry questions audited | " + data.totals.total + " |");
    L.push("| Clone groups (≥2 identical fingerprints) | " + data.totals.groups + " |");
    L.push("| Questions inside clone groups | " + data.totals.covered + " (" + data.totals.coveredPct + "%) |");
    L.push("| Clone variants → keep | " + data.totals.keepers + " |");
    L.push("| Clone variants → **retire** | **" + data.totals.retire + "** |");
    L.push("| Largest clone group | " + data.totals.largest + " questions |");
    L.push("| Active chemistry bank before → after | " + data.totals.total + " → **" + data.totals.activeAfter + "** |");
    L.push("| Additional stem near-dup pairs (actionable) | " + data.totals.stemPairs + " |");
    L.push("");
    if (data.totals.activeAfter < 30) {
        L.push("> ⚠ Active bank after retirement falls below the 30-question comfort floor.");
        L.push("");
    }
    L.push("## Scenario template repeats (left active by design)");
    L.push("");
    L.push("Scenario questions are excluded from fingerprinting and therefore from");
    L.push("retirement. Quantified here so the reviewer knows exactly what Phase 3");
    L.push("does **not** touch:");
    L.push("");
    L.push("| Observation | Groups | Questions |");
    L.push("|---|---|---|");
    L.push("| Identical options+answer **within one stimulus set** (content rewrite needed — a set cannot lose members) | " +
        data.scenarioObs.withinSetGroups + " | " + data.scenarioObs.withinSetQuestions + " |");
    L.push("| Identical options+answer **across sets / with straight questions** (different stimuli = different questions) | " +
        data.scenarioObs.crossGroups + " | " + data.scenarioObs.crossQuestions + " |");
    L.push("");
    L.push("## Per-chapter impact");
    L.push("");
    L.push("| Chapter | Active before | Clone groups | Clone members | Keepers | Retire | Active after |");
    L.push("|---|---|---|---|---|---|---|");
    for (var i = 0; i < data.chapters.length; i++) {
        var c = data.chapters[i];
        var after = c.total - c.retire;
        L.push("| " + c.chapter + " | " + c.total + " | " + c.cloneGroups + " | " + c.cloneMembers +
            " | " + c.keepers + " | " + c.retire + " | " + after + " |");
    }
    L.push("");
    L.push("## Firestore reference check");
    L.push("");
    var fsr = data.firestore;
    if (fsr.skipped) {
        L.push("_Skipped: " + mdEscape(fsr.skipped) + "_");
        L.push("");
        L.push("Run without `--no-firebase` to check whether assignments/exams reference");
        L.push("any planned retirement. Local-only assignments (browser IndexedDB) are");
        L.push("not visible to this check — teachers should review assignments manually");
        L.push("in Phase 3 before retiring.");
        L.push("");
    } else {
        L.push("Project: `" + fsr.projectId + "` — retirement is **safe for any collection");
        L.push("listed with 0 hits**. Assignments reference questions **by id**, so a hit");
        L.push("means that assignment would lose questions when the id leaves the active");
        L.push("pool; edit the assignment first (saved exams embed full snapshots and are");
        L.push("never affected).");
        L.push("");
        L.push("| Collection | Docs scanned | Docs referencing retirements |");
        L.push("|---|---|---|");
        var names = ["assignments", "exams"];
        for (var n = 0; n < names.length; n++) {
            var col = fsr.collections[names[n]];
            if (!col) continue;
            if (col.error) {
                L.push("| " + names[n] + " | — | ⚠ " + mdEscape(col.error) + " |");
            } else {
                L.push("| " + names[n] + " | " + col.scanned + " | " + col.hits.length + " |");
            }
        }
        L.push("");
        var anyHits = false;
        for (n = 0; n < names.length; n++) {
            var col2 = fsr.collections[names[n]];
            if (!col2 || !col2.hits || !col2.hits.length) continue;
            anyHits = true;
            L.push("### " + names[n] + " needing attention");
            L.push("");
            for (var h = 0; h < col2.hits.length; h++) {
                var hit = col2.hits[h];
                L.push("- **" + mdEscape(hit.doc) + "** → " + hit.retiredIds.join(", "));
            }
            L.push("");
        }
        if (!anyHits) {
            L.push("✅ No stored assignment or exam references a planned retirement.");
            L.push("");
        }
    }
    L.push("## Additional stem near-duplicates (not fingerprint clones)");
    L.push("");
    L.push("These pass Jaccard ≥ " + STEM_JACCARD_MIN.toFixed(1) + " on their stems within one chapter + topic but differ in");
    L.push("options/answer, so runtime fingerprinting cannot collapse them. The");
    L.push("straight pairs below are shipped into `similarity-pairs.json` at score 0.95");
    L.push("so selection still never shows both in one quiz. Scenario pairs are listed");
    L.push("for information only — different stimuli are different questions.");
    L.push("");
    var straightPairs = [];
    for (var p = 0; p < data.stemPairsList.length; p++) {
        if (data.stemPairsList[p].kind === "straight") straightPairs.push(data.stemPairsList[p]);
    }
    L.push("**Actionable (straight) pairs: " + straightPairs.length + "**");
    L.push("");
    if (straightPairs.length) {
        L.push("| Score | Question A | Question B | Chapter | Topic |");
        L.push("|---|---|---|---|---|");
        for (p = 0; p < straightPairs.length; p++) {
            var pr = straightPairs[p];
            L.push("| " + pr.s.toFixed(3) + " | " + pr.a + " | " + pr.b + " | " + pr.chapter + " | " + mdEscape(pr.topic) + " |");
        }
        L.push("");
    }
    var otherPairs = data.stemPairsList.length - straightPairs.length;
    if (otherPairs > 0) {
        L.push("_" + otherPairs + " additional scenario/mixed-stem pairs were found and intentionally");
        L.push("not shipped (informational only; see `duplicate-audit.json`)._");
        L.push("");
    }
    L.push("## All clone groups (" + data.groups.length + ")");
    L.push("");
    L.push("Decision legend: **keep** = active after Phase 3, **retire** = flagged");
    L.push("`retired: true` (still in JSON, hidden from practice). Scenario questions");
    L.push("never appear here — they are not fingerprinted (see section above).");
    L.push("");
    for (var g = 0; g < groups.length; g++) {
        var grp = groups[g];
        var dec = decisions[g];
        var chs = {};
        for (var m = 0; m < grp.members.length; m++) chs[grp.members[m].chapter] = true;
        var chList = Object.keys(chs).sort(function(a, b) { return a - b; }).join(", ");
        L.push("### Group " + (g + 1) + " — Chapter " + chList + " · " + mdEscape(grp.members[0].topic || "General"));
        L.push("");
        L.push(grp.members.length + " members · " + dec.keepers.length + " keep · " +
            dec.retire.length + " retire · " + dec.scenario.length + " scenario kept");
        L.push("");
        L.push("| Decision | ID | Variant | Stem |");
        L.push("|---|---|---|---|");
        for (m = 0; m < grp.members.length; m++) {
            var q = grp.members[m];
            var decision;
            if (dec.keepIds[q.id]) decision = "keep";
            else if (isScenario(q)) decision = "keep (scenario)";
            else decision = "**retire**";
            L.push("| " + decision + " | " + q.id + " | " + (q.bank_variant || "?") + " | " + mdEscape(stemOf(q)) + " |");
        }
        L.push("");
    }
    return L.join("\n") + "\n";
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
    var skipFirebase = process.argv.indexOf("--no-firebase") >= 0;
    var ExamEngine = loadExamEngine();
    if (typeof ExamEngine.fingerprintOf !== "function") {
        console.error("examEngine.js does not export fingerprintOf — Phase 2 code missing.");
        process.exit(1);
    }
    var questions = loadChemistry();
    if (questions.length === 0) {
        console.error("No chemistry questions found under " + CHEM_DIR);
        process.exit(1);
    }

    var grouped = buildGroups(questions, ExamEngine);
    var groups = grouped.groups;
    var decisions = groups.map(decideGroup);

    var keepers = 0, retire = 0, scenarioInGroups = 0, covered = 0;
    var retireIds = [], keepIds = [], scenarioIds = [];
    for (var g = 0; g < groups.length; g++) {
        covered += groups[g].members.length;
        keepers += decisions[g].keepers.length;
        retire += decisions[g].retire.length;
        scenarioInGroups += decisions[g].scenario.length;
        for (var m = 0; m < groups[g].members.length; m++) {
            var q = groups[g].members[m];
            if (decisions[g].keepIds[q.id]) keepIds.push(q.id);
            else if (isScenario(q)) scenarioIds.push(q.id);
            else retireIds.push(q.id);
        }
    }
    retireIds.sort();
    keepIds.sort();
    scenarioIds.sort();

    var referenced = {};
    for (var r = 0; r < retireIds.length; r++) referenced[retireIds[r]] = true;

    var stemPairsList = findStemNearDupes(questions, ExamEngine);
    var scenarioObs = scenarioObservations(questions, ExamEngine);
    var stemActionable = 0;
    for (var p = 0; p < stemPairsList.length; p++) if (stemPairsList[p].kind === "straight") stemActionable++;

    var largest = 0;
    for (g = 0; g < groups.length; g++) largest = Math.max(largest, groups[g].members.length);

    var totals = {
        total: questions.length,
        groups: groups.length,
        covered: covered,
        coveredPct: ((covered / questions.length) * 100).toFixed(1),
        scenarioInGroups: scenarioInGroups,
        keepers: keepers,
        retire: retire,
        largest: largest,
        activeAfter: questions.length - retire,
        stemPairs: stemActionable
    };

    console.log("Chemistry: " + questions.length + " questions, " + groups.length +
        " clone groups covering " + covered + " (" + totals.coveredPct + "%)");
    console.log("Decisions: keep " + keepers + " + scenario kept " + scenarioInGroups +
        ", retire " + retire + " → active after: " + totals.activeAfter);
    console.log("Stem near-dupes: " + stemActionable + " actionable straight pairs (Jaccard >= " + STEM_JACCARD_MIN + ")");
    console.log("Scenario repeats left active: " + scenarioObs.withinSetGroups +
        " within-set groups, " + scenarioObs.crossGroups + " cross-set/mixed groups");

    checkFirestore(referenced, skipFirebase).then(function(firestore) {
        if (firestore.skipped) {
            console.log("Firestore check skipped: " + firestore.skipped);
        } else {
            var names = ["assignments", "exams"];
            for (var n = 0; n < names.length; n++) {
                var col = firestore.collections[names[n]];
                if (!col) continue;
                if (col.error) console.log("Firestore " + names[n] + " check failed: " + col.error);
                else console.log("Firestore " + names[n] + ": scanned " + col.scanned +
                    ", " + col.hits.length + " doc(s) reference retirement ids");
            }
        }

        var report = {
            generatedAt: new Date().toISOString(),
            method: {
                fingerprint: "ExamEngine.fingerprintOf (sorted normalized options + answer text)",
                keeperCap: KEEPER_CAP,
                scenarioPolicy: "never retired (stimulus set integrity)",
                stemJaccardMin: STEM_JACCARD_MIN
            },
            totals: totals,
            chapters: perChapterStats(questions, groups, decisions),
            firestore: firestore,
            scenarioObs: scenarioObs,
            stemPairsList: stemPairsList,
            retire: retireIds,
            keep: keepIds,
            scenarioKept: scenarioIds,
            groups: groups.map(function(grp, gi) {
                return {
                    chapter: grp.members[0].chapter,
                    topic: grp.members[0].topic || "General",
                    fingerprint: grp.fingerprint,
                    members: grp.members.map(function(q) {
                        return {
                            id: q.id,
                            variant: q.bank_variant || null,
                            scenario: q.scenario_id || null,
                            decision: decisions[gi].keepIds[q.id] ? "keep" :
                                (isScenario(q) ? "keep-scenario" : "retire")
                        };
                    })
                };
            })
        };

        fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 1) + "\n", "utf8");
        fs.writeFileSync(OUT_MD, buildReport(report, groups, decisions), "utf8");
        console.log("Wrote " + OUT_MD);
        console.log("Wrote " + OUT_JSON);
    }).catch(function(err) {
        console.error("Audit failed: " + (err && err.stack || err));
        process.exit(1);
    });
}

main();
