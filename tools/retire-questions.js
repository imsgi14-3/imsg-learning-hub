// Phase 3: apply (or undo) the Chemistry duplicate retirement.
//
// Reads the approved decision list from duplicate-audit.json (the `retire`
// array written by tools/audit-duplicates.js) and flags each matching
// question in question-bank/grade9/chemistry/chapter*.json with
// `retired: true`. QuestionLoader filters flagged questions out of the
// active pool, so students no longer see them — but the data stays in the
// JSON (and any Firestore copy), which makes the whole operation reversible.
//
// Files are rewritten with JSON.stringify(data, null, 2) and no trailing
// newline, which is byte-identical to the existing bank format, so the git
// diff shows only the added "retired" lines.
//
// Usage:
//   node tools/retire-questions.js           apply the retirement
//   node tools/retire-questions.js --undo    remove every retired flag
//
// Exits non-zero if any audit id cannot be found in the bank (that would
// mean the audit and the bank disagree).

var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");
var CHEM_DIR = path.join(ROOT, "question-bank", "grade9", "chemistry");
var AUDIT_FILE = path.join(CHEM_DIR, "duplicate-audit.json");

function chapterFiles() {
    var out = [];
    for (var c = 1; c <= 19; c++) {
        var file = path.join(CHEM_DIR, "chapter" + c + ".json");
        if (!fs.existsSync(file)) continue;
        var text = fs.readFileSync(file, "utf8");
        if (text.trim().length === 0) continue; // chapters 16-19 are []
        out.push({ chapter: c, file: file, text: text });
    }
    return out;
}

function parseBank(text) {
    var data = JSON.parse(text);
    return Array.isArray(data) ? data : (data.questions || []);
}

function applyRetirement() {
    var audit = JSON.parse(fs.readFileSync(AUDIT_FILE, "utf8"));
    var retireIds = audit && Array.isArray(audit.retire) ? audit.retire : [];
    if (retireIds.length === 0) {
        console.error("duplicate-audit.json has no retire list — nothing to apply.");
        process.exit(1);
    }
    var wanted = {};
    for (var i = 0; i < retireIds.length; i++) wanted[retireIds[i]] = true;

    var files = chapterFiles();
    var flagged = 0;
    var already = 0;
    var found = {};
    var perFile = [];

    for (var f = 0; f < files.length; f++) {
        var qs = parseBank(files[f].text);
        var count = 0;
        var pre = 0;
        var changed = false;
        for (var q = 0; q < qs.length; q++) {
            var question = qs[q];
            if (!question || !question.id || !wanted[question.id]) continue;
            found[question.id] = true;
            if (question.retired === true) { already++; pre++; continue; }
            question.retired = true;
            changed = true;
            count++;
        }
        flagged += count;
        perFile.push({ chapter: files[f].chapter, total: qs.length, flagged: count, pre: pre });
        if (changed) {
            // No trailing newline: byte-identical formatting to the rest of
            // the bank, so the diff is only the new "retired" lines.
            fs.writeFileSync(files[f].file, JSON.stringify(qs, null, 2), "utf8");
        }
    }

    var missing = [];
    for (var id in wanted) {
        if (Object.prototype.hasOwnProperty.call(wanted, id) && !found[id]) missing.push(id);
    }

    console.log("Retirement list: " + retireIds.length + " ids from duplicate-audit.json");
    console.log("Flagged now: " + flagged + ", already flagged: " + already + ", files rewritten: " +
        perFile.filter(function(p) { return p.flagged > 0; }).length);
    for (var p = 0; p < perFile.length; p++) {
        console.log("  Chapter " + perFile[p].chapter + ": " + perFile[p].flagged + " flagged now, " +
            perFile[p].pre + " already flagged of " + perFile[p].total +
            " (active after: " + (perFile[p].total - perFile[p].flagged - perFile[p].pre) + ")");
    }
    if (missing.length) {
        console.error("ERROR: " + missing.length + " audit id(s) not found in the bank: " +
            missing.slice(0, 10).join(", ") + (missing.length > 10 ? " ..." : ""));
        process.exit(1);
    }
    verify(files, retireIds);
}

// Post-condition: exactly the audit ids are flagged, nothing else, and no
// chapter loses so many questions that practice would starve.
function verify(files, retireIds) {
    var expected = {};
    for (var i = 0; i < retireIds.length; i++) expected[retireIds[i]] = true;
    var actualFlagged = {};
    var activeByChapter = {};
    var chaptersWithQuestions = {};
    var activeTotal = 0;
    var wrong = [];

    for (var f = 0; f < files.length; f++) {
        var qs = parseBank(fs.readFileSync(files[f].file, "utf8"));
        var active = 0;
        for (var q = 0; q < qs.length; q++) {
            var question = qs[q];
            if (!question) continue;
            if (question.retired === true) {
                actualFlagged[question.id] = true;
                if (!expected[question.id]) wrong.push("unexpected retirement: " + question.id);
            } else {
                active++;
            }
        }
        if (qs.length > 0) chaptersWithQuestions[files[f].chapter] = true;
        activeByChapter[files[f].chapter] = active;
        activeTotal += active;
    }
    for (var id in expected) {
        if (Object.prototype.hasOwnProperty.call(expected, id) && !actualFlagged[id]) {
            wrong.push("missing retirement: " + id);
        }
    }

    console.log("Verify: " + Object.keys(actualFlagged).length + " flagged, " + activeTotal + " active Chemistry questions");
    var lowest = null;
    for (var ch in activeByChapter) {
        if (!Object.prototype.hasOwnProperty.call(activeByChapter, ch)) continue;
        if (!chaptersWithQuestions[ch]) continue; // chapters 16-19 ship empty []
        if (lowest === null || activeByChapter[ch] < activeByChapter[lowest]) lowest = ch;
    }
    if (lowest !== null) {
        console.log("  Lowest chapter: " + lowest + " with " + activeByChapter[lowest] + " active");
        if (activeByChapter[lowest] < 30) {
            wrong.push("chapter " + lowest + " fell below the 30-question floor (" + activeByChapter[lowest] + ")");
        }
    }
    if (wrong.length) {
        console.error("VERIFY FAILED:");
        for (var w = 0; w < wrong.length && w < 20; w++) console.error("  " + wrong[w]);
        process.exit(1);
    }
    console.log("Verify OK: flag set matches the audit exactly.");
}

function undoRetirement() {
    var files = chapterFiles();
    var removed = 0;
    for (var f = 0; f < files.length; f++) {
        var qs = parseBank(files[f].text);
        var changed = false;
        for (var q = 0; q < qs.length; q++) {
            if (qs[q] && qs[q].retired === true) {
                delete qs[q].retired;
                removed++;
                changed = true;
            }
        }
        if (changed) fs.writeFileSync(files[f].file, JSON.stringify(qs, null, 2), "utf8");
    }
    console.log("Undo: removed " + removed + " retired flag(s) from " + files.length + " chapter files");
}

if (process.argv.indexOf("--undo") >= 0) {
    undoRetirement();
} else {
    applyRetirement();
}
