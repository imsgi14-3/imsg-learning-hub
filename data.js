var questions = [];
var classes = [];
var assignments = [];
var exams = [];
var teachers = [];
var attendance = [];
var allAttempts = [];
var conceptStats = {};
var studentAccounts = [];
var principalAccount = { id: "ADMIN-001", name: "Principal", password: "yyJwe6sY", createdAt: Date.now() };
var pendingImportData = [];
var pendingStudentExcelData = [];
var deletedIds = [];

var ATTEMPTS_KEY = "learningHub_attempts";
var QUESTIONS_KEY = "learningHub_questions";
var CLASSES_KEY = "learningHub_classes";
var DELETED_KEY = "learningHub_deleted";
var ASSIGNMENTS_KEY = "learningHub_assignments";
var TEACHERS_KEY = "learningHub_teachers";
var ATTENDANCE_KEY = "learningHub_attendance";
var CONCEPTS_KEY = "learningHub_concepts";
var STUDENTS_KEY = "learningHub_students";

var subjectsData = {
    "Computer Science": {
        icon: "&#128187;",
        color: "#4f46e5",
        description: "Hardware, Software, Programming & Problem Solving",
        chapters: [
            { num: 1, title: "Computer Systems", topics: ["1.1 Brief History of Computer Systems and Generations of Computers", "1.2 Understanding Systems and their Types", "1.3 Core Components of a Computer System", "1.4 Von Neumann Architecture", "1.5 Data Transmission within a computer system", "1.6 Computer Memory", "1.7 Software Engineering and Hardware Engineering", "1.8 Computer Software", "1.9 Data Communication"] },
            { num: 2, title: "Computational Thinking & Algorithms", topics: ["Problem Solving", "Algorithms", "Flowcharts", "Pseudocode", "Decomposition", "Pattern Recognition"] },
            { num: 3, title: "Programming Fundamentals", topics: ["Variables", "Data Types", "Input/Output", "Operators", "Conditions", "Loops", "Functions"] },
            { num: 4, title: "Data and Analysis", topics: ["Data Types", "Binary Operations", "Data Representation", "File Handling", "Databases"] },
            { num: 5, title: "Applications of Computer Science", topics: ["HTML & CSS", "Web Technologies", "Scratch", "Python", "App Development"] },
            { num: 6, title: "Impacts of Computing", topics: ["ICT in Daily Life", "Digital Footprint", "Cyberbullying", "Data Privacy", "Environmental Impact"] },
            { num: 7, title: "Entrepreneurship", topics: ["Digital Entrepreneurship", "E-Commerce", "Digital Marketing", "Business Models", "Career Paths"] }
        ]
    },
    "Physics": {
        icon: "&#9883;",
        color: "#f59e0b",
        description: "Forces, Energy, Waves & Electricity",
        chapters: [
            { num: 1, title: "Physical Quantities", topics: ["SI Units", "Measurement", "Errors"] },
            { num: 2, title: "Kinematics", topics: ["Distance & Displacement", "Speed & Velocity", "Acceleration"] },
            { num: 3, title: "Forces & Motion", topics: ["Newton's Laws", "Friction", "Momentum"] },
            { num: 4, title: "Work & Energy", topics: ["Work", "Energy Types", "Power", "Efficiency"] },
            { num: 5, title: "Simple Machines", topics: ["Levers", "Pulleys", "Mechanical Advantage"] },
            { num: 6, title: "Sound", topics: ["Sound Waves", "Speed of Sound", "Echo"] },
            { num: 7, title: "Light", topics: ["Reflection", "Refraction", "Lenses"] },
            { num: 8, title: "Electricity", topics: ["Current", "Voltage", "Resistance", "Circuits"] }
        ]
    },
    "Chemistry": {
        icon: "&#128300;",
        color: "#10b981",
        description: "Matter, Reactions, Acids & Organic Chemistry",
        chapters: [
            { num: 1, title: "Nature of Science in Chemistry" },
            { num: 2, title: "Matter" },
            { num: 3, title: "Atomic Structure" },
            { num: 4, title: "Periodic Table and Periodicity of Properties" },
            { num: 5, title: "Chemical Bonding" },
            { num: 6, title: "Stoichiometry" },
            { num: 7, title: "Electrochemistry" },
            { num: 8, title: "Energetics" },
            { num: 9, title: "Chemical Equilibrium" },
            { num: 10, title: "Acids, Bases, and Salts" },
            { num: 11, title: "Environmental Chemistry \u2014 Air" },
            { num: 12, title: "Environmental Chemistry \u2014 Water" },
            { num: 13, title: "Organic Chemistry" },
            { num: 14, title: "Hydrocarbons" },
            { num: 15, title: "Biochemistry" },
            { num: 16, title: "Empirical Data Collection and Analysis" },
            { num: 17, title: "Separation Techniques" },
            { num: 18, title: "Qualitative Analysis" },
            { num: 19, title: "Chromatography" }
        ]
    },
    "Biology": {
        icon: "&#129516;",
        color: "#22c55e",
        description: "Cells, Genetics, Ecology & Health",
        chapters: [
            { num: 1, title: "Cell Biology", topics: ["Cell Structure", "Organelles", "Cell Division"] },
            { num: 2, title: "Cell Cycle", topics: ["Mitosis", "Meiosis", "Growth"] },
            { num: 3, title: "Tissues", topics: ["Plant Tissues", "Animal Tissues", "Organ Systems"] },
            { num: 4, title: "Biodiversity", topics: ["Classification", "Ecosystems", "Food Chains"] },
            { num: 5, title: "Plant Biology", topics: ["Photosynthesis", "Transpiration", "Growth"] },
            { num: 6, title: "Human Biology", topics: ["Digestive System", "Circulatory System", "Nervous System"] }
        ]
    },
    "Mathematics": {
        icon: "&#128290;",
        color: "#8b5cf6",
        description: "Algebra, Geometry, Statistics & Numbers",
        chapters: [
            { num: 1, title: "Number System", topics: ["Real Numbers", "Rational Numbers", "Surds"] },
            { num: 2, title: "Algebra", topics: ["Polynomials", "Factorization", "Equations"] },
            { num: 3, title: "Matrices", topics: ["Matrix Operations", "Types of Matrices", "Determinants"] },
            { num: 4, title: "Geometry", topics: ["Lines & Angles", "Triangles", "Quadrilaterals"] },
            { num: 5, title: "Trigonometry", topics: ["Ratios", "Identities", "Applications"] },
            { num: 6, title: "Statistics", topics: ["Mean", "Median", "Mode", "Graphs"] }
        ]
    }
};

// A class ID is the stable identity referenced by students, teachers and
// attempts (CLASS-9A = grade 9, section A). If an Edit Class save rewrites
// the label of an existing class, reset it from the ID so a device holding
// the bad cached copy self-heals: Firestore merges are local-wins, so without
// this the wrong label would keep displaying forever. IDs that do not match
// the CLASS-<grade><section> pattern are left untouched.
function normalizeClasses() {
    var changed = false;
    for (var i = 0; i < classes.length; i++) {
        var cl = classes[i];
        var m = /^CLASS-(\d+)([A-Za-z]+)$/.exec(cl && cl.id ? String(cl.id) : "");
        if (!m) continue;
        var expectGrade = parseInt(m[1], 10);
        var expectSection = m[2].toUpperCase();
        var grade = parseInt(cl.grade, 10);
        var section = String(cl.section == null ? "" : cl.section).trim().toUpperCase();
        if (grade !== expectGrade || section !== expectSection) {
            cl.grade = expectGrade;
            cl.section = expectSection;
            cl.name = expectGrade + expectSection;
            changed = true;
        }
    }
    if (changed) {
        LocalDB.putAll("classes", classes);
        localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
    }
    return changed;
}

function loadData() {
    var c = LocalDB.getCache();
    questions = c.questions || [];
    classes = c.classes || [];
    normalizeClasses();
    assignments = c.assignments || [];
    exams = c.exams || [];
    teachers = c.teachers || [];
    attendance = c.attendance || [];
    allAttempts = c.allAttempts || [];
    conceptStats = c.conceptStats || {};
    studentAccounts = c.studentAccounts || [];
    deletedIds = c.deletedIds || [];
    var principalArr = c.principalAccount;
    if (principalArr && principalArr.length > 0) {
        var found = false;
        for (var i = 0; i < principalArr.length; i++) {
            if (principalArr[i].id === "ADMIN-001") { principalAccount = principalArr[i]; found = true; break; }
        }
    }
    var migrated = false;
    for (var i = 0; i < questions.length; i++) {
        if (!questions[i].subject) { questions[i].subject = "Computer Science"; migrated = true; }
        if (!questions[i].grade) { questions[i].grade = 9; migrated = true; }
    }
    for (var i = 0; i < teachers.length; i++) {
        var t = teachers[i];
        if (!t.subjects) t.subjects = t.subject ? [t.subject] : ["Computer Science"];
        if (!t.classes) t.classes = t.classId ? [t.classId] : [];
        if (!t.subject) t.subject = t.subjects[0] || "";
        if (!t.classId) t.classId = t.classes[0] || "";
        if (!t.classTeacherOf) t.classTeacherOf = t.isClassTeacher && t.classId ? [t.classId] : [];
        if (!t.classSubjects) {
            t.classSubjects = {};
            for (var j = 0; j < t.classes.length; j++) {
                t.classSubjects[t.classes[j]] = t.subjects.slice();
            }
        }
        t.isSubjectTeacher = true;
        if (/^T-\d+$/i.test(t.id) && t.name) {
            var oldId = t.id;
            var newId = generateTeacherId(t.name);
            t.id = newId;
            for (var j = 0; j < assignments.length; j++) {
                if (assignments[j].createdBy === oldId) assignments[j].createdBy = newId;
            }
        }
    }
    if (migrated) LocalDB.putAll("questions", questions);
    if (teachers.length > 0) LocalDB.putAll("teachers", teachers);
    if (principalAccount) LocalDB.putAll("principalAccount", [principalAccount]);
    if (classes.length === 0) {
        classes = [
            { id: "CLASS-9A", name: "9A", grade: 9, section: "A", students: [] },
            { id: "CLASS-9B", name: "9B", grade: 9, section: "B", students: [] }
        ];
    }
}

function saveAll() {
    LocalDB.putAll("questions", questions);
    LocalDB.putAll("classes", classes);
    localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
    LocalDB.putAll("assignments", assignments);
    LocalDB.putAll("exams", exams);
    LocalDB.putAll("teachers", teachers);
    LocalDB.putAll("attendance", attendance);
    LocalDB.putAll("allAttempts", allAttempts);
    LocalDB.putAll("conceptStats", conceptStats);
    LocalDB.putAll("studentAccounts", studentAccounts);
    if (principalAccount) LocalDB.putAll("principalAccount", [principalAccount]);
}

// Bulk-rewrites EVERY local record to Firestore. Nothing in the normal app
// flow calls this (the per-record push* helpers below do all writing), and a
// stray call would burn thousands of write/delete quota units at once — so it
// only runs when a migration explicitly opts in.
var ALLOW_BULK_FIRESTORE_WRITE = false;
function saveToFirestore() {
    if (!ALLOW_BULK_FIRESTORE_WRITE) return;
    if (typeof db === "undefined") { return; }
    if (principalAccount) db.collection("teachers").doc("PRINCIPAL").set(principalAccount).catch(function() {});
    for (var i = 0; i < studentAccounts.length; i++) db.collection("students").doc(studentAccounts[i].id).set(studentAccounts[i]).catch(function() {});
    for (var i = 0; i < classes.length; i++) db.collection("classes").doc(classes[i].id).set(classes[i]).catch(function() {});
    for (var i = 0; i < questions.length; i++) db.collection("questions").doc(questions[i].id).set(questions[i]).catch(function() {});
    for (var i = 0; i < assignments.length; i++) db.collection("assignments").doc(assignments[i].id || ("a-" + i)).set(assignments[i]).catch(function() {});
    for (var i = 0; i < exams.length; i++) db.collection("exams").doc(exams[i].id).set(exams[i]).catch(function() {});
    for (var i = 0; i < teachers.length; i++) db.collection("teachers").doc(teachers[i].id).set(teachers[i]).catch(function() {});
    for (var i = 0; i < allAttempts.length; i++) db.collection("attempts").doc(allAttempts[i].attemptId || allAttempts[i].timestamp || ("att-" + i)).set(allAttempts[i]).catch(function() {});
}

function pushStudentToFirestore(student) { try { if (typeof db !== "undefined") db.collection("students").doc(student.id).set(student); } catch(e) { LocalDB.addToSyncQueue({ type: "student", action: "set", data: student }); } }
function pushTeacherToFirestore(teacher) { try { if (typeof db !== "undefined") db.collection("teachers").doc(teacher.id).set(teacher); } catch(e) { LocalDB.addToSyncQueue({ type: "teacher", action: "set", data: teacher }); } }
function pushClassToFirestore(cls) { try { if (typeof db !== "undefined") db.collection("classes").doc(cls.id).set(cls); } catch(e) { LocalDB.addToSyncQueue({ type: "class", action: "set", data: cls }); } }
function pushAssignmentToFirestore(a) { try { if (typeof db !== "undefined") db.collection("assignments").doc(a.id || "a-" + assignments.indexOf(a)).set(a); } catch(e) { LocalDB.addToSyncQueue({ type: "assignment", action: "set", data: a }); } }
function pushExamToFirestore(exam) { try { if (typeof db !== "undefined") db.collection("exams").doc(exam.id).set(exam); } catch(e) { LocalDB.addToSyncQueue({ type: "exams", action: "set", data: exam }); } }
function pushAttemptToFirestore(attempt) { try { if (typeof db !== "undefined") db.collection("attempts").doc(attempt.attemptId).set(attempt); } catch(e) { LocalDB.addToSyncQueue({ type: "attempt", action: "set", data: attempt }); } }
function pushQuestionToFirestore(q) { try { if (typeof db !== "undefined") db.collection("questions").doc(q.id).set(q); } catch(e) { LocalDB.addToSyncQueue({ type: "question", action: "set", data: q }); } }
// Save/replace one exam locally (IndexedDB) then push to Firestore.
// Local write is authoritative; Firestore failure falls back to sync queue.
function saveExam(exam) {
    if (!exam || !exam.id) return false;
    for (var i = 0; i < exams.length; i++) {
        if (exams[i].id === exam.id) { exams[i] = exam; LocalDB.putAll("exams", exams); pushExamToFirestore(exam); return true; }
    }
    exams.push(exam);
    LocalDB.putAll("exams", exams);
    pushExamToFirestore(exam);
    return true;
}
function saveAttempt(attempt) {
    if (!attempt || !attempt.attemptId) return false;
    if (!attempt.id) attempt.id = attempt.attemptId; // IndexedDB keyPath is "id"
    var found = false;
    for (var i = 0; i < allAttempts.length; i++) {
        if (allAttempts[i].attemptId === attempt.attemptId) { allAttempts[i] = attempt; found = true; break; }
    }
    if (!found) allAttempts.push(attempt);
    pushAttemptToFirestore(attempt);
    if (typeof saveAll === "function") { saveAll(); }
    else { try { localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(allAttempts)); } catch (e) {} }
    return true;
}
function deleteFromFirestore(collection, id) { try { if (typeof db !== "undefined") { db.collection(collection).doc(id).delete(); if (deletedIds.indexOf(id) === -1) deletedIds.push(id); LocalDB.putAll("deletedIds", deletedIds); db.collection("meta").doc("deletedIds").set({ ids: deletedIds }); } } catch(e) { LocalDB.addToSyncQueue({ type: collection, action: "delete", data: { id: id } }); } }

function saveTeacherToFirestore(teacherObj, callback) {
    if (typeof db === "undefined") { LocalDB.addToSyncQueue({ type: "teacher", action: "set", data: teacherObj }); if (callback) callback(false); return; }
    db.collection("teachers").doc(teacherObj.id).set(teacherObj)
        .then(function() { if (callback) callback(true); })
        .catch(function(e) { console.error("Firestore single teacher save error:", e); LocalDB.addToSyncQueue({ type: "teacher", action: "set", data: teacherObj }); if (callback) callback(false); });
}

// ---------------------------------------------------------------------------
// Plan A — Firestore read budget (Spark free tier allows 50K reads/day).
// Before login there are ZERO Firestore reads: local cache + static JSON
// power the login page. After login each role pulls only what it needs, at
// most once per role cooldown (persisted in localStorage, so a page reload
// doesn't reset it), and attempts sync incrementally instead of re-reading
// the whole collection on every load.
// ---------------------------------------------------------------------------
var PULL_KEY = "learningHub_lastPull";
var QUESTIONS_PULL_KEY = "learningHub_lastQuestionsPull";
var ASSIGNMENTS_PULL_KEY = "learningHub_lastAssignmentsPull";
var ATTEMPTS_SYNC_KEY = "learningHub_attemptsSync";

function getPullRole() {
    if (typeof Auth !== "undefined" && Auth.getRole && Auth.getRole()) return Auth.getRole();
    try { var s = JSON.parse(localStorage.getItem("learningHub_user")); if (s && s.role) return s.role; } catch(e) {}
    return null;
}

function readStamp(key) {
    try { var v = parseInt(localStorage.getItem(key), 10); return isNaN(v) ? 0 : v; } catch(e) { return 0; }
}
function writeStamp(key, value) {
    try { localStorage.setItem(key, String(value)); } catch(e) {}
}

// Students/parents are local-first and rarely need fresh server data; staff
// refresh a little more often. Tunable here without touching call sites.
function getPullCooldown(role) {
    if (role === "student" || role === "parent") return 45 * 60000;
    if (role === "teacher" || role === "classteacher") return 15 * 60000;
    if (role === "principal") return 5 * 60000;
    return 0;
}

// The questions collection is by far the largest (3,154 docs) and changes
// rarely, so staff read it at most once a day. The marker is written when a
// pull starts, which also prevents retry storms.
var QUESTIONS_PULL_COOLDOWN = 24 * 3600000;
function questionsPullDue() {
    if (Date.now() - readStamp(QUESTIONS_PULL_KEY) < QUESTIONS_PULL_COOLDOWN) return false;
    writeStamp(QUESTIONS_PULL_KEY, Date.now());
    return true;
}

// Attempts are append-only and carry an ISO `timestamp`, so after the first
// sync a device only re-reads the window since its last successful sync
// (a 5-minute overlap absorbs clock skew). The first sync is scoped: students
// and parents read only their own attempts; staff read the whole (small, ~608
// docs) collection once. Failed syncs never advance the marker.
function attemptsSyncKey() {
    var role = getPullRole();
    if (role !== "student" && role !== "parent") return ATTEMPTS_SYNC_KEY;
    var uid = "";
    var u = (typeof Auth !== "undefined" && Auth.getUser && Auth.getUser()) || null;
    if (!u) { try { var s = JSON.parse(localStorage.getItem("learningHub_user")); u = s ? s.user : null; } catch(e) {} }
    if (u) uid = u.childId || u.id || "";
    return ATTEMPTS_SYNC_KEY + "_" + (uid || "unknown");
}

function pullAttemptsIncremental(done) {
    if (typeof db === "undefined") { done(); return; }
    var key = attemptsSyncKey();
    var since = null;
    try { since = localStorage.getItem(key); } catch(e) {}
    var ref = db.collection("attempts");
    var query;
    if (since) {
        query = ref.where("timestamp", ">=", since);
    } else if (key !== ATTEMPTS_SYNC_KEY && key !== ATTEMPTS_SYNC_KEY + "_unknown") {
        // First sync for a student/parent on this device: own history only.
        query = ref.where("studentId", "==", key.substring(ATTEMPTS_SYNC_KEY.length + 1));
    } else {
        query = ref;
    }
    query.get().then(function(snap) {
        // Rebuild from EVERY local source plus the fetch. Memory may be empty
        // on a fresh load (IndexedDB cache), so localStorage must be part of
        // the union — a partial array must never replace valid local data.
        var merged = {};
        var local = [];
        try { local = JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || "[]"); } catch(e) {}
        for (var i = 0; i < local.length; i++) merged[local[i].attemptId || local[i].timestamp || ("local-" + i)] = local[i];
        for (var i = 0; i < allAttempts.length; i++) merged[allAttempts[i].attemptId || allAttempts[i].timestamp || ("mem-" + i)] = allAttempts[i];
        snap.forEach(function(doc) { var d = doc.data(); var k = d.attemptId || d.timestamp || doc.id; if (!merged[k]) merged[k] = d; });
        allAttempts = [];
        for (var m in merged) {
            var a = merged[m];
            if (!a.id) a.id = a.attemptId || a.timestamp || m; // IndexedDB keyPath is "id"
            allAttempts.push(a);
        }
        try { localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(allAttempts)); } catch(e) {}
        try { LocalDB.putAll("allAttempts", allAttempts); } catch(e) {}
        try { localStorage.setItem(key, new Date(Date.now() - 300000).toISOString()); } catch(e) {}
        done();
    }).catch(function() { done(); });
}

// Fills in fields that older teacher records may be missing. Shared by the
// full pull and the login-time single-document fetch.
function normalizeTeacher(d) {
    if (!d.subjects) d.subjects = d.subject ? [d.subject] : ["Computer Science"];
    if (!d.classes) d.classes = d.classId ? [d.classId] : [];
    if (!d.subject) d.subject = d.subjects[0] || "";
    if (!d.classId) d.classId = d.classes[0] || "";
    if (!d.classTeacherOf) d.classTeacherOf = d.isClassTeacher && d.classId ? [d.classId] : [];
    if (!d.classSubjects) {
        d.classSubjects = {};
        for (var j = 0; j < d.classes.length; j++) {
            d.classSubjects[d.classes[j]] = d.subjects.slice();
        }
    }
    d.isSubjectTeacher = true;
    return d;
}

// Targeted one-document fetch used ONLY when a login ID isn't in the local
// cache (a new device, or an account created after this device last synced).
// This replaces the old pre-login roster pull: a wrong or unknown ID is
// remembered for 5 minutes and an hourly budget caps repeated misses, so
// failed logins can't burn read quota. Returns true when a fetch was started
// (callback runs with "ok" | "missing" | "error"), false when the caller
// should fail normally without touching Firestore.
var LOGIN_MISS_TTL = 300000;
var LOGIN_MISS_BUDGET = 6;
var LOGIN_MISS_WINDOW = 3600000;
function pullAccountForLogin(scope, id, callback) {
    if (typeof db === "undefined" || !id) return false;
    var safeId = String(id).replace(/[^A-Za-z0-9_-]/g, "");
    var missKey = "learningHub_loginMiss_" + scope + "_" + safeId;
    var budgetKey = "learningHub_loginBudget";
    var now = Date.now();
    try {
        var miss = parseInt(localStorage.getItem(missKey), 10) || 0;
        if (miss && now - miss < LOGIN_MISS_TTL) return false;
    } catch(e) {}
    var budget = null;
    try { budget = JSON.parse(localStorage.getItem(budgetKey)); } catch(e) {}
    if (!budget || typeof budget.start !== "number" || now - budget.start > LOGIN_MISS_WINDOW) budget = { start: now, count: 0 };
    if (budget.count >= LOGIN_MISS_BUDGET) return false;
    budget.count++;
    try { localStorage.setItem(budgetKey, JSON.stringify(budget)); } catch(e) {}
    var collection = scope === "teachers" ? "teachers" : "students";
    db.collection(collection).doc(String(id)).get().then(function(doc) {
        if (doc.exists) {
            var d = doc.data();
            if (!d.id) d.id = doc.id;
            if (collection === "teachers") {
                if (d.id !== "PRINCIPAL" && doc.id !== "PRINCIPAL") {
                    normalizeTeacher(d);
                    // Merge into the stored roster: memory may be empty on a
                    // fresh load, so writing it alone would wipe teachers this
                    // device already knows. Union = localStorage + memory + doc.
                    var rosterT = [];
                    try { rosterT = JSON.parse(localStorage.getItem(TEACHERS_KEY) || "[]"); } catch(e) {}
                    for (var i = 0; i < teachers.length; i++) {
                        var dupT = false;
                        for (var t = 0; t < rosterT.length; t++) { if (rosterT[t].id === teachers[i].id) { dupT = true; break; } }
                        if (!dupT) rosterT.push(teachers[i]);
                    }
                    var seen = false;
                    for (var t2 = 0; t2 < rosterT.length; t2++) { if (rosterT[t2].id === d.id) { seen = true; break; } }
                    if (!seen) rosterT.push(d);
                    teachers = rosterT;
                    localStorage.setItem(TEACHERS_KEY, JSON.stringify(teachers));
                    try { LocalDB.putAll("teachers", teachers); } catch(e) {}
                }
            } else {
                // Same union-merge for the student roster — never overwrite it
                // with the in-memory array, which can be empty on a fresh load.
                var roster = [];
                try { roster = JSON.parse(localStorage.getItem(STUDENTS_KEY) || "[]"); } catch(e) {}
                for (var j = 0; j < studentAccounts.length; j++) {
                    var dupS = false;
                    for (var r = 0; r < roster.length; r++) { if (roster[r].id === studentAccounts[j].id) { dupS = true; break; } }
                    if (!dupS) roster.push(studentAccounts[j]);
                }
                var seenS = false;
                for (var r2 = 0; r2 < roster.length; r2++) { if (roster[r2].id === d.id) { seenS = true; break; } }
                if (!seenS) roster.push(d);
                studentAccounts = roster;
                localStorage.setItem(STUDENTS_KEY, JSON.stringify(studentAccounts));
                try { LocalDB.putAll("studentAccounts", studentAccounts); } catch(e) {}
            }
            callback("ok");
        } else {
            try { localStorage.setItem(missKey, String(now)); } catch(e) {}
            callback("missing");
        }
    }).catch(function() { callback("error"); });
    return true;
}

// ---------------------------------------------------------------------------
// Role-scoped pull. Never runs before login (no role) — that single change
// removes the ~3,300 reads per page load that exhausted the free plan.
// ---------------------------------------------------------------------------
function loadFromFirestore(callback) {
    if (typeof db === "undefined") { if (callback) callback(); return; }
    var role = getPullRole();
    if (!role) { if (callback) callback(); return; }
    var isStaff = role === "teacher" || role === "classteacher" || role === "principal";
    var now = Date.now();
    if (now - readStamp(PULL_KEY) < getPullCooldown(role)) { if (callback) callback(); return; }
    writeStamp(PULL_KEY, now);
    var runQuestions = isStaff && questionsPullDue();
    var loaded = 0;
    var total = 4; // deletedIds + classes + assignments + attempts
    if (isStaff) total += 3; // students + teachers + exams
    if (runQuestions) total += 1;
    function done() { loaded++; if (loaded >= total && callback) callback(); }
    db.collection("meta").doc("deletedIds").get().then(function(doc) {
        if (doc.exists) {
            var remote = doc.data().ids || [];
            for (var i = 0; i < remote.length; i++) { if (deletedIds.indexOf(remote[i]) === -1) deletedIds.push(remote[i]); }
            localStorage.setItem(DELETED_KEY, JSON.stringify(deletedIds));
        }
        done();
    }).catch(function() { done(); });
    if (isStaff) db.collection("students").get().then(function(snap) {
        if (snap.size > 0) {
            var merged = {};
            for (var i = 0; i < studentAccounts.length; i++) merged[studentAccounts[i].id] = studentAccounts[i];
            snap.forEach(function(doc) { var d = doc.data(); if (!merged[d.id] && deletedIds.indexOf(d.id) === -1) merged[d.id] = d; });
            studentAccounts = [];
            for (var key in merged) studentAccounts.push(merged[key]);
            localStorage.setItem(STUDENTS_KEY, JSON.stringify(studentAccounts));
            try { LocalDB.putAll("studentAccounts", studentAccounts); } catch(e) {}
        }
        done();
    }).catch(function(e) { console.error("Firestore students load error:", e); done(); });
    db.collection("classes").get().then(function(snap) {
        if (snap.size > 0) {
            var merged = {};
            for (var i = 0; i < classes.length; i++) merged[classes[i].id] = classes[i];
            snap.forEach(function(doc) { var d = doc.data(); if (!merged[d.id] && deletedIds.indexOf(d.id) === -1) merged[d.id] = d; });
            classes = [];
            for (var key in merged) classes.push(merged[key]);
            localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
        }
        done();
    }).catch(function(e) { console.error("Firestore classes load error:", e); done(); });
    if (runQuestions) db.collection("questions").get().then(function(snap) {
        if (snap.size > 0) {
            var byId = {};
            for (var i = 0; i < questions.length; i++) byId[questions[i].id] = i;
            snap.forEach(function(doc) {
                var q = doc.data();
                if (!q.subject) q.subject = "Computer Science";
                if (!q.grade) q.grade = 9;
                if (byId[q.id] !== undefined) { questions[byId[q.id]] = q; }
                else { questions.push(q); byId[q.id] = questions.length - 1; }
            });
            localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
        }
        // Remote questions can include legacy/non-JSON records — re-run the
        // JSON-bank cleanup so staff see the same filtered set as before Plan A.
        if (typeof runQuestionCleanup === "function") runQuestionCleanup();
        done();
    }).catch(function(e) { console.error("Firestore questions load error:", e); done(); });
    db.collection("assignments").get().then(function(snap) {
        if (snap.size > 0) {
            var merged = {};
            for (var i = 0; i < assignments.length; i++) merged[assignments[i].id || ("a-" + i)] = assignments[i];
            snap.forEach(function(doc) { var d = doc.data(); var key = d.id || doc.id; if (!merged[key] && deletedIds.indexOf(key) === -1) merged[key] = d; });
            assignments = [];
            for (var key in merged) assignments.push(merged[key]);
            localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
        }
        done();
    }).catch(function(e) { console.error("Firestore assignments load error:", e); done(); });
    pullAttemptsIncremental(done);
    if (isStaff) db.collection("exams").get().then(function(snap) {
        if (snap.size > 0) {
            var merged = {};
            for (var i = 0; i < exams.length; i++) merged[exams[i].id] = exams[i];
            snap.forEach(function(doc) { var d = doc.data(); if (!merged[d.id] && deletedIds.indexOf(d.id) === -1) merged[d.id] = d; });
            exams = [];
            for (var key in merged) exams.push(merged[key]);
            LocalDB.putAll("exams", exams);
        }
        done();
    }).catch(function() { done(); });
    if (isStaff) db.collection("teachers").get().then(function(snap) {
        if (snap.size > 0) {
            var firestoreTeachers = [];
            snap.forEach(function(doc) {
                var d = doc.data();
                if (d.id === "PRINCIPAL" || doc.id === "PRINCIPAL") { if (!principalAccount || principalAccount.id !== "ADMIN-001") principalAccount = d; }
                else {
                    normalizeTeacher(d);
                    if (/^T-\d+$/i.test(d.id) && d.name) {
                        var oldId = d.id;
                        d.id = generateTeacherId(d.name);
                        for (var j = 0; j < assignments.length; j++) {
                            if (assignments[j].createdBy === oldId) assignments[j].createdBy = d.id;
                        }
                        if (typeof db !== "undefined") db.collection("teachers").doc(oldId).delete().catch(function() {});
                    }
                    firestoreTeachers.push(d);
                }
            });
            console.log("Firestore teachers loaded:", firestoreTeachers.map(function(t) { return t.id; }));
            var localById = {};
            for (var i = 0; i < teachers.length; i++) localById[teachers[i].id] = teachers[i];
            for (var i = 0; i < firestoreTeachers.length; i++) {
                if (deletedIds.indexOf(firestoreTeachers[i].id) === -1) localById[firestoreTeachers[i].id] = firestoreTeachers[i];
            }
            teachers = [];
            for (var id in localById) teachers.push(localById[id]);
            console.log("Merged teachers:", teachers.map(function(t) { return t.id; }));
            localStorage.setItem(TEACHERS_KEY, JSON.stringify(teachers));
            try { LocalDB.putAll("teachers", teachers); } catch(e) {}
        }
        done();
    }).catch(function(e) { console.error("Firestore teachers load error:", e); done(); });
}

function refreshAssignmentsFromFirestore(callback) {
    if (typeof db === "undefined") { if (callback) callback(); return; }
    // Several student tabs call this when opened. The collection is small but
    // a 5-minute gate keeps rapid tab-switching from racking up reads; the
    // Sync button bypasses this gate via refreshAllData instead.
    if (Date.now() - readStamp(ASSIGNMENTS_PULL_KEY) < 300000) { if (callback) callback(); return; }
    writeStamp(ASSIGNMENTS_PULL_KEY, Date.now());
    db.collection("assignments").get().then(function(snap) {
        assignments = [];
        snap.forEach(function(doc) { assignments.push(doc.data()); });
        localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
        if (callback) callback();
    }).catch(function() { if (callback) callback(); });
}

function refreshAttemptsFromFirestore(callback) {
    // Incremental: only reads attempts newer than this device's last sync
    // (first sync is scoped — see pullAttemptsIncremental).
    pullAttemptsIncremental(function() { if (callback) callback(); });
}

var lastRefreshTime = 0;
var REFRESH_COOLDOWN = 30000;

function refreshAllData(callback) {
    if (typeof db === "undefined") { if (callback) callback(); return; }
    var now = Date.now();
    if (now - lastRefreshTime < REFRESH_COOLDOWN) { if (callback) callback(); return; }
    lastRefreshTime = now;
    var role = null;
    try { var s = JSON.parse(localStorage.getItem("learningHub_user")); role = s ? s.role : null; } catch(e) {}
    if (role === "student") {
        refreshStudentData(callback);
    } else if (role === "teacher" || role === "classteacher") {
        refreshTeacherData(callback);
    } else if (role === "parent") {
        refreshParentData(callback);
    } else if (role === "principal") {
        refreshAdminData(callback);
    } else {
        if (callback) callback();
    }
}

function refreshStudentData(callback) {
    if (typeof db === "undefined") { if (callback) callback(); return; }
    // Plan A: students never pull the 3,154-doc questions collection — the
    // static JSON bank + IndexedDB cache are authoritative for them.
    var loaded = 0, total = 2;
    function done() { loaded++; if (loaded >= total && callback) callback(); }
    db.collection("classes").get().then(function(snap) {
        if (snap.size > 0) {
            var merged = {};
            for (var i = 0; i < classes.length; i++) merged[classes[i].id] = classes[i];
            snap.forEach(function(doc) { var d = doc.data(); if (!merged[d.id] && deletedIds.indexOf(d.id) === -1) merged[d.id] = d; });
            classes = [];
            for (var key in merged) classes.push(merged[key]);
            localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
        }
        done();
    }).catch(function() { done(); });
    db.collection("assignments").get().then(function(snap) {
        if (snap.size > 0) {
            var merged = {};
            for (var i = 0; i < assignments.length; i++) merged[assignments[i].id || ("a-" + i)] = assignments[i];
            snap.forEach(function(doc) { var d = doc.data(); var key = d.id || doc.id; if (!merged[key] && deletedIds.indexOf(key) === -1) merged[key] = d; });
            assignments = [];
            for (var key in merged) assignments.push(merged[key]);
            localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
        }
        done();
    }).catch(function() { done(); });
}

function refreshTeacherData(callback) {
    if (typeof db === "undefined") { if (callback) callback(); return; }
    // Questions (3,154 docs) sync at most once a day — see questionsPullDue().
    var runQuestions = questionsPullDue();
    var loaded = 0, total = runQuestions ? 4 : 3;
    function done() { loaded++; if (loaded >= total && callback) callback(); }
    db.collection("teachers").get().then(function(snap) {
        if (snap.size > 0) {
            var firestoreTeachers = [];
            snap.forEach(function(doc) { var d = doc.data(); if (d.id !== "PRINCIPAL" && doc.id !== "PRINCIPAL") firestoreTeachers.push(d); });
            var localById = {}; for (var i = 0; i < teachers.length; i++) localById[teachers[i].id] = teachers[i];
            for (var i = 0; i < firestoreTeachers.length; i++) localById[firestoreTeachers[i].id] = firestoreTeachers[i];
            teachers = []; for (var id in localById) teachers.push(localById[id]);
            localStorage.setItem(TEACHERS_KEY, JSON.stringify(teachers));
        }
        done();
    }).catch(function() { done(); });
    db.collection("classes").get().then(function(snap) {
        if (snap.size > 0) {
            var merged = {};
            for (var i = 0; i < classes.length; i++) merged[classes[i].id] = classes[i];
            snap.forEach(function(doc) { var d = doc.data(); if (!merged[d.id] && deletedIds.indexOf(d.id) === -1) merged[d.id] = d; });
            classes = [];
            for (var key in merged) classes.push(merged[key]);
            localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
        }
        done();
    }).catch(function() { done(); });
    db.collection("assignments").get().then(function(snap) {
        if (snap.size > 0) {
            var merged = {};
            for (var i = 0; i < assignments.length; i++) merged[assignments[i].id || ("a-" + i)] = assignments[i];
            snap.forEach(function(doc) { var d = doc.data(); var key = d.id || doc.id; if (!merged[key] && deletedIds.indexOf(key) === -1) merged[key] = d; });
            assignments = [];
            for (var key in merged) assignments.push(merged[key]);
            localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
        }
        done();
    }).catch(function() { done(); });
    if (runQuestions) db.collection("questions").get().then(function(snap) {
        if (snap.size > 0) { var byId = {}; for (var i = 0; i < questions.length; i++) byId[questions[i].id] = i; snap.forEach(function(doc) { var q = doc.data(); if (byId[q.id] !== undefined) questions[byId[q.id]] = q; else questions.push(q); }); localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions)); }
        done();
    }).catch(function() { done(); });
}

function refreshParentData(callback) {
    if (typeof db === "undefined") { if (callback) callback(); return; }
    var loaded = 0, total = 2;
    function done() { loaded++; if (loaded >= total && callback) callback(); }
    db.collection("assignments").get().then(function(snap) {
        if (snap.size > 0) {
            var merged = {};
            for (var i = 0; i < assignments.length; i++) merged[assignments[i].id || ("a-" + i)] = assignments[i];
            snap.forEach(function(doc) { var d = doc.data(); var key = d.id || doc.id; if (!merged[key] && deletedIds.indexOf(key) === -1) merged[key] = d; });
            assignments = [];
            for (var key in merged) assignments.push(merged[key]);
            localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
        }
        done();
    }).catch(function() { done(); });
    pullAttemptsIncremental(done);
}

function refreshAdminData(callback) {
    if (typeof db === "undefined") { if (callback) callback(); return; }
    var loaded = 0, total = 5;
    function done() { loaded++; if (loaded >= total && callback) callback(); }
    db.collection("meta").doc("deletedIds").get().then(function(doc) {
        if (doc.exists) {
            var remote = doc.data().ids || [];
            for (var i = 0; i < remote.length; i++) { if (deletedIds.indexOf(remote[i]) === -1) deletedIds.push(remote[i]); }
            localStorage.setItem(DELETED_KEY, JSON.stringify(deletedIds));
        }
        done();
    }).catch(function() { done(); });
    db.collection("teachers").get().then(function(snap) {
        if (snap.size > 0) {
            var firestoreTeachers = [];
            snap.forEach(function(doc) { var d = doc.data(); if (d.id !== "PRINCIPAL" && doc.id !== "PRINCIPAL") firestoreTeachers.push(d); });
            var localById = {}; for (var i = 0; i < teachers.length; i++) localById[teachers[i].id] = teachers[i];
            for (var i = 0; i < firestoreTeachers.length; i++) localById[firestoreTeachers[i].id] = firestoreTeachers[i];
            teachers = []; for (var id in localById) teachers.push(localById[id]);
            localStorage.setItem(TEACHERS_KEY, JSON.stringify(teachers));
        }
        done();
    }).catch(function() { done(); });
    db.collection("students").get().then(function(snap) {
        if (snap.size > 0) {
            var merged = {};
            for (var i = 0; i < studentAccounts.length; i++) merged[studentAccounts[i].id] = studentAccounts[i];
            snap.forEach(function(doc) { var d = doc.data(); if (!merged[d.id] && deletedIds.indexOf(d.id) === -1) merged[d.id] = d; });
            studentAccounts = [];
            for (var key in merged) studentAccounts.push(merged[key]);
            localStorage.setItem(STUDENTS_KEY, JSON.stringify(studentAccounts));
        }
        done();
    }).catch(function() { done(); });
    db.collection("classes").get().then(function(snap) {
        if (snap.size > 0) {
            var merged = {};
            for (var i = 0; i < classes.length; i++) merged[classes[i].id] = classes[i];
            snap.forEach(function(doc) { var d = doc.data(); if (!merged[d.id] && deletedIds.indexOf(d.id) === -1) merged[d.id] = d; });
            classes = [];
            for (var key in merged) classes.push(merged[key]);
            localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
        }
        done();
    }).catch(function() { done(); });
    pullAttemptsIncremental(done);
}

function shuffleArray(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
}

function renderBar(name, pct, cls) {
    var color = "var(--primary)";
    if (cls === "good") color = "var(--success)";
    else if (cls === "avg") color = "var(--accent)";
    else if (cls === "bad") color = "var(--error)";
    return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">' +
        '<div style="flex:0 0 120px;font-size:13px;text-align:right;">' + name + '</div>' +
        '<div style="flex:1;height:20px;background:var(--bg-tertiary,#e2e8f0);border-radius:10px;overflow:hidden;">' +
        '<div style="width:' + pct + '%;height:100%;background:' + color + ';border-radius:10px;transition:width 0.5s;"></div></div>' +
        '<div style="flex:0 0 40px;font-size:13px;font-weight:700;">' + pct + '%</div></div>';
}

function generateRandomPassword() {
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    var pass = "";
    for (var i = 0; i < 8; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    return pass;
}

function generateStudentId(classObj, rollNo) {
    var prefix = classObj.name;
    var num = (rollNo < 10 ? "0" : "") + rollNo;
    return prefix + "-" + num;
}

function generateTeacherId(name) {
    var base = "";
    if (name) {
        base = name.toLowerCase().replace(/[^a-z]/g, "");
    }
    if (base.length < 2) base = "teacher";
    var num = teachers.length + 1;
    var id = base + "t" + (num < 10 ? "0" : "") + num;
    for (var i = 0; i < teachers.length; i++) {
        if (teachers[i].id === id) { num++; id = base + "t" + (num < 10 ? "0" : "") + num; i = -1; }
    }
    return id;
}

function getQuestionsBySubject(subject) {
    var result = [];
    for (var i = 0; i < questions.length; i++) {
        if (!subject || questions[i].subject === subject) result.push(questions[i]);
    }
    return result;
}

function getQuestionsByChapter(subject, chapter) {
    var result = [];
    var chNum = parseInt(chapter);
    if (isNaN(chNum)) chNum = chapter;
    for (var i = 0; i < questions.length; i++) {
        if (questions[i].subject === subject && questions[i].chapter == chNum) result.push(questions[i]);
    }
    return result;
}

function getQuestionsByTopic(subject, chapter, topic) {
    var result = [];
    var chNum = parseInt(chapter);
    if (isNaN(chNum)) chNum = chapter;
    for (var i = 0; i < questions.length; i++) {
        var q = questions[i];
        if (q.subject === subject && q.chapter == chNum && (topic === "all" || q.topic === topic)) result.push(q);
    }
    return result;
}

function getAttemptsByStudent(studentId) {
    var result = [];
    for (var i = 0; i < allAttempts.length; i++) {
        if (allAttempts[i].studentId === studentId) result.push(allAttempts[i]);
    }
    return result;
}

function isAssignmentClosed(assignment, now) {
    if (!assignment || !assignment.dueDate) return false;
    var dueDate = String(assignment.dueDate);
    var parts = dueDate.split("-");
    var due;
    if (parts.length === 3) {
        due = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 23, 59, 59, 999);
    } else {
        due = new Date(dueDate);
    }
    if (isNaN(due.getTime())) return false;
    return due.getTime() < (typeof now === "number" ? now : Date.now());
}

function getAssignmentAttempt(assignmentId, studentId) {
    if (!assignmentId || !studentId) return null;
    for (var i = 0; i < allAttempts.length; i++) {
        var a = allAttempts[i];
        if (a && a.assignmentId === assignmentId && a.studentId === studentId) return a;
    }
    return null;
}

function getAssignmentState(assignment, studentId) {
    if (!assignment) return "available";
    if (studentId && getAssignmentAttempt(assignment.id, studentId)) return "submitted";
    if (isAssignmentClosed(assignment)) return "closed";
    return "available";
}

function formatChapterLabel(chapterNum, subject) {
    var cfg = null;
    if (typeof QuestionLoader !== "undefined" && QuestionLoader && typeof QuestionLoader.getChapterConfig === "function") {
        var all = QuestionLoader.getChapterConfig();
        cfg = all[chapterNum];
        if (subject && (!cfg || !cfg.subject || cfg.subject !== subject)) {
            cfg = null;
            for (var k in all) {
                if (all[k] && all[k].subject === subject && all[k].chapter === Number(chapterNum)) { cfg = all[k]; break; }
            }
        }
    }
    if (cfg && cfg.chapterTitle) return "Chapter " + chapterNum + ": " + cfg.chapterTitle;
    return "Chapter " + chapterNum;
}

function getAttemptChapterLabel(attempt, topicKeys) {
    if (attempt.questions && typeof questions !== "undefined" && questions && questions.length) {
        for (var i = 0; i < attempt.questions.length; i++) {
            var qid = attempt.questions[i] && attempt.questions[i].questionId;
            if (!qid) continue;
            for (var j = 0; j < questions.length; j++) {
                if (questions[j] && questions[j].id === qid && questions[j].chapter) {
                    return formatChapterLabel(questions[j].chapter, questions[j].subject);
                }
            }
        }
    }
    for (var t = 0; t < topicKeys.length; t++) {
        var m = /^\s*(\d+)\./.exec(String(topicKeys[t]));
        if (m) return formatChapterLabel(parseInt(m[1], 10), attempt.subject);
    }
    if (attempt.chapter && attempt.chapter !== "all") {
        var chNum = parseInt(attempt.chapter, 10);
        if (!isNaN(chNum)) return formatChapterLabel(chNum, attempt.subject);
    }
    return null;
}

function getAttemptTypeLabel(attempt) {
    if (!attempt) return "";
    var mode = attempt.mode || "practice";
    mode = String(mode);
    var label;
    if (typeof Analytics !== "undefined" && Analytics.MODE_LABELS && Analytics.MODE_LABELS[mode]) {
        label = Analytics.MODE_LABELS[mode];
    } else {
        label = mode.charAt(0).toUpperCase() + mode.slice(1);
    }
    if (mode === "assignment") {
        if (attempt.assignmentId) {
            for (var i = 0; i < assignments.length; i++) {
                if (assignments[i].id === attempt.assignmentId) return assignments[i].title || label;
            }
        }
        return label;
    }
    var topics = {};
    if (attempt.topicPerformance && typeof attempt.topicPerformance === "object") {
        for (var t in attempt.topicPerformance) {
            if (t && t !== "General") topics[t] = true;
        }
    }
    if (Object.keys(topics).length === 0 && attempt.questions && attempt.questions.length) {
        for (var q = 0; q < attempt.questions.length; q++) {
            var qt = attempt.questions[q] && attempt.questions[q].topic;
            if (qt && qt !== "General") topics[qt] = true;
        }
    }
    var topicKeys = Object.keys(topics);
    if (topicKeys.length === 1) return topicKeys[0];
    if (topicKeys.length > 1) {
        var chapterLabel = getAttemptChapterLabel(attempt, topicKeys);
        if (chapterLabel) return chapterLabel;
    }
    return label;
}

function getAttemptsByClass(classId) {
    var result = [];
    for (var i = 0; i < allAttempts.length; i++) {
        for (var j = 0; j < studentAccounts.length; j++) {
            if (studentAccounts[j].id === allAttempts[i].studentId && studentAccounts[j].classId === classId) {
                result.push(allAttempts[i]);
                break;
            }
        }
    }
    return result;
}

function getStudentCountByClass(classId) {
    var count = 0;
    for (var i = 0; i < studentAccounts.length; i++) {
        if (studentAccounts[i].classId === classId) count++;
    }
    return count;
}

function getAttemptsForTeacher(filters) {
    filters = filters || {};
    var classId = filters.classId || null;
    var teacherClasses = filters.teacherClasses || null;
    var studentId = filters.studentId || null;
    var subject = filters.subject || null;
    var result = [];
    for (var i = 0; i < allAttempts.length; i++) {
        var a = allAttempts[i];
        if (!a || !a.studentId) continue;
        if (studentId && a.studentId !== studentId) continue;
        var student = null;
        for (var j = 0; j < studentAccounts.length; j++) {
            if (studentAccounts[j].id === a.studentId) { student = studentAccounts[j]; break; }
        }
        if (classId && (!student || student.classId !== classId)) continue;
        if (teacherClasses && teacherClasses.length > 0) {
            if (!student || teacherClasses.indexOf(student.classId) === -1) continue;
        }
        if (subject) {
            var attemptSubject = a.subject || "";
            if (attemptSubject !== subject) continue;
        }
        result.push(a);
    }
    return result;
}

function normalizeAttemptsForAnalytics(attempts) {
    if (!attempts || !Array.isArray(attempts)) return [];
    var result = [];
    for (var i = 0; i < attempts.length; i++) {
        var a = attempts[i];
        if (!a) continue;
        var normalized = {
            attemptId: a.attemptId || ("attempt-" + (a.timestamp || i)),
            studentId: a.studentId || "unknown",
            classId: a.classId || "",
            subject: a.subject || "General",
            grade: a.grade || 0,
            score: typeof a.score === "number" ? a.score : 0,
            total: typeof a.total === "number" ? a.total : 0,
            percentage: typeof a.percentage === "number" ? a.percentage : 0,
            timeSpent: typeof a.timeSpent === "number" ? a.timeSpent : 0,
            mode: a.mode || "practice",
            timestamp: a.timestamp ? String(a.timestamp) : (a.completedAt ? String(a.completedAt) : ""),
            startedAt: a.startedAt ? String(a.startedAt) : "",
            completedAt: a.completedAt ? String(a.completedAt) : (a.timestamp ? String(a.timestamp) : ""),
            assignmentId: a.assignmentId || "",
            questions: [],
            topicPerformance: a.topicPerformance || {}
        };
        if (a.questions && Array.isArray(a.questions)) {
            for (var j = 0; j < a.questions.length; j++) {
                var q = a.questions[j];
                if (!q) continue;
                normalized.questions.push({
                    questionId: q.questionId || q.id || ("q-" + j),
                    selectedAnswer: q.selectedAnswer !== undefined ? q.selectedAnswer : null,
                    correctAnswer: q.correctAnswer || q.correctAnswerText || "",
                    correct: typeof q.correct === "boolean" ? q.correct : false,
                    timeUsed: typeof q.timeUsed === "number" ? q.timeUsed : 0,
                    topic: q.topic || "General",
                    difficulty: q.difficulty || "medium",
                    bloom: q.bloom || "knowledge"
                });
            }
        }
        result.push(normalized);
    }
    return result;
}

function getTeacherAnalyticsData(filters) {
    var attempts = getAttemptsForTeacher(filters);
    var normalized = normalizeAttemptsForAnalytics(attempts);
    return {
        attempts: normalized,
        totalAttempts: normalized.length,
        filters: filters
    };
}

function getTeacherClassIds(user) {
    if (!user) return [];
    if (user.classes && user.classes.length > 0) return user.classes;
    if (user.classId) return [user.classId];
    return [];
}

function processSyncQueue(callback) {
    if (typeof db === "undefined") { if (callback) callback(); return; }
    LocalDB.getSyncQueue(function(queue) {
        if (!queue || queue.length === 0) { if (callback) callback(); return; }
        var remaining = queue.length;
        var processed = 0;
        function done() {
            remaining--;
            if (remaining <= 0) {
                LocalDB.clearSyncQueue(function() {
                    if (callback) callback(processed);
                });
            }
        }
        for (var i = 0; i < queue.length; i++) {
            (function(entry) {
                try {
                    if (entry.action === "delete") {
                        db.collection(entry.type).doc(entry.data.id).delete()
                            .then(function() { processed++; done(); })
                            .catch(function() { done(); });
                    } else {
                        var docId = entry.data && entry.data.id ? entry.data.id : ("sync-" + Date.now());
                        db.collection(entry.type).doc(docId).set(entry.data)
                            .then(function() { processed++; done(); })
                            .catch(function() { done(); });
                    }
                } catch(e) { done(); }
            })(queue[i]);
        }
    });
}

function checkAndProcessSync() {
    if (typeof db !== "undefined" && navigator.onLine) {
        processSyncQueue();
    }
}

window.addEventListener("online", function() {
    console.log("Back online - processing sync queue");
    checkAndProcessSync();
});

window.addEventListener("offline", function() {
    console.log("Gone offline - writes will be queued");
});

var TeacherAnalytics = (function() {
    function getClassOverview(filters) {
        try {
            var data = getTeacherAnalyticsData(filters);
            return Analytics.getClassOverview(data.attempts);
        } catch(e) {
            console.error("TeacherAnalytics.getClassOverview error:", e);
            return { totalAttempts: 0, uniqueStudents: 0, averageScore: 0, averagePercentage: 0, completionRate: 0, totalQuestions: 0, correctAnswers: 0, incorrectAnswers: 0, accuracy: 0 };
        }
    }

    function getStudentPerformance(studentId, filters) {
        try {
            var data = getTeacherAnalyticsData(filters);
            return Analytics.getStudentPerformance(studentId, data.attempts);
        } catch(e) {
            console.error("TeacherAnalytics.getStudentPerformance error:", e);
            return { studentId: studentId, totalAttempts: 0, averageScore: 0, averagePercentage: 0, bestPercentage: 0, lowestPercentage: 100, totalQuestions: 0, correctAnswers: 0, incorrectAnswers: 0, accuracy: 0, recentPerformance: [], topicStrengths: [], topicWeaknesses: [] };
        }
    }

    function getTopicMastery(filters) {
        try {
            var data = getTeacherAnalyticsData(filters);
            return Analytics.getTopicMastery(data.attempts);
        } catch(e) {
            console.error("TeacherAnalytics.getTopicMastery error:", e);
            return [];
        }
    }

    function getQuestionStatistics(filters) {
        try {
            var data = getTeacherAnalyticsData(filters);
            return Analytics.getQuestionStatistics(data.attempts);
        } catch(e) {
            console.error("TeacherAnalytics.getQuestionStatistics error:", e);
            return [];
        }
    }

    function getDifficultyPerformance(filters) {
        try {
            var data = getTeacherAnalyticsData(filters);
            return Analytics.getDifficultyPerformance(data.attempts);
        } catch(e) {
            console.error("TeacherAnalytics.getDifficultyPerformance error:", e);
            return [];
        }
    }

    function getBloomPerformance(filters) {
        try {
            var data = getTeacherAnalyticsData(filters);
            return Analytics.getBloomPerformance(data.attempts);
        } catch(e) {
            console.error("TeacherAnalytics.getBloomPerformance error:", e);
            return [];
        }
    }

    function getAssessmentTrend(filters) {
        try {
            var data = getTeacherAnalyticsData(filters);
            return Analytics.getAssessmentTrend(data.attempts);
        } catch(e) {
            console.error("TeacherAnalytics.getAssessmentTrend error:", e);
            return [];
        }
    }

    function getAtRiskStudents(filters) {
        try {
            var data = getTeacherAnalyticsData(filters);
            return Analytics.getAtRiskStudents(data.attempts);
        } catch(e) {
            console.error("TeacherAnalytics.getAtRiskStudents error:", e);
            return [];
        }
    }

    function getTeacherOverview(filters) {
        try {
            var data = getTeacherAnalyticsData(filters);
            var teacherClasses = filters.teacherClasses || [];
            var totalStudents = 0;
            for (var i = 0; i < studentAccounts.length; i++) {
                if (teacherClasses.indexOf(studentAccounts[i].classId) !== -1) {
                    totalStudents++;
                }
            }
            return Analytics.getTeacherOverview(data.attempts, totalStudents);
        } catch(e) {
            console.error("TeacherAnalytics.getTeacherOverview error:", e);
            return {
                totalAttempts: 0, uniqueStudents: 0, averageScore: 0,
                averagePercentage: 0, completionRate: 0, totalQuestions: 0,
                correctAnswers: 0, incorrectAnswers: 0, accuracy: 0,
                totalStudents: 0, activeStudents: 0, participationRate: 0,
                trendDirection: "stable", trendDataPoints: 0
            };
        }
    }

    function getClassPerformanceDistribution(filters) {
        try {
            var data = getTeacherAnalyticsData(filters);
            return Analytics.getClassPerformanceDistribution(data.attempts);
        } catch(e) {
            console.error("TeacherAnalytics.getClassPerformanceDistribution error:", e);
            return { totalAttempts: 0, strong: 0, developing: 0, needsSupport: 0, strongPct: 0, developingPct: 0, needsSupportPct: 0, dominantLevel: "Developing" };
        }
    }

    function getAssessmentComparison(filters) {
        try {
            var data = getTeacherAnalyticsData(filters);
            return Analytics.getAssessmentComparison(data.attempts);
        } catch(e) {
            console.error("TeacherAnalytics.getAssessmentComparison error:", e);
            return [];
        }
    }

    function getTrendDirection(filters) {
        try {
            var data = getTeacherAnalyticsData(filters);
            return Analytics.getTrendDirection(data.attempts);
        } catch(e) {
            console.error("TeacherAnalytics.getTrendDirection error:", e);
            return "stable";
        }
    }

    function getTeacherInsights(filters) {
        try {
            var data = getTeacherAnalyticsData(filters);
            var atRisk = Analytics.getAtRiskStudents(data.attempts);
            var topics = Analytics.getTopicMastery(data.attempts);
            var trend = Analytics.getTrendDirection(data.attempts);
            var overview = Analytics.getClassOverview(data.attempts);
            return Analytics.getTeacherInsights(atRisk, topics, trend, overview);
        } catch(e) {
            console.error("TeacherAnalytics.getTeacherInsights error:", e);
            return [];
        }
    }

    function getRecommendations(filters) {
        try {
            var data = getTeacherAnalyticsData(filters);
            var attempts = data.attempts;
            var analyticsResults = {
                topicMastery: Analytics.getTopicMastery(attempts),
                atRiskStudents: Analytics.getAtRiskStudents(attempts),
                questionStatistics: Analytics.getQuestionStatistics(attempts),
                difficultyPerformance: Analytics.getDifficultyPerformance(attempts),
                bloomPerformance: Analytics.getBloomPerformance(attempts),
                trendDirection: Analytics.getTrendDirection(attempts),
                classOverview: Analytics.getClassOverview(attempts),
                totalAttempts: data.totalAttempts
            };
            if (!Recommendations.hasSufficientData(analyticsResults)) {
                return [];
            }
            return Recommendations.generate(analyticsResults);
        } catch(e) {
            console.error("TeacherAnalytics.getRecommendations error:", e);
            return [];
        }
    }

    function getActionableInsights(filters) {
        try {
            var data = getTeacherAnalyticsData(filters);
            var attempts = data.attempts;
            var teacherClasses = filters.teacherClasses || [];
            var totalStudents = 0;
            for (var i = 0; i < studentAccounts.length; i++) {
                if (teacherClasses.indexOf(studentAccounts[i].classId) !== -1) {
                    totalStudents++;
                }
            }
            var analyticsResults = {
                topicMastery: Analytics.getTopicMastery(attempts),
                atRiskStudents: Analytics.getAtRiskStudents(attempts),
                questionStatistics: Analytics.getQuestionStatistics(attempts),
                difficultyPerformance: Analytics.getDifficultyPerformance(attempts),
                bloomPerformance: Analytics.getBloomPerformance(attempts),
                trendDirection: Analytics.getTrendDirection(attempts),
                classOverview: Analytics.getClassOverview(attempts),
                totalAttempts: data.totalAttempts,
                totalStudents: totalStudents,
                attempts: attempts,
                advancedQuestionAnalytics: Analytics.getAdvancedQuestionAnalytics(attempts),
                advancedClassAnalytics: Analytics.getAdvancedClassAnalytics(attempts, totalStudents)
            };
            if (!Recommendations.hasSufficientData(analyticsResults)) {
                return [];
            }
            return Recommendations.generateActionableInsights(analyticsResults);
        } catch(e) {
            console.error("TeacherAnalytics.getActionableInsights error:", e);
            return [];
        }
    }

    function getAdvancedQuestionAnalytics(filters) {
        try {
            var data = getTeacherAnalyticsData(filters);
            return Analytics.getAdvancedQuestionAnalytics(data.attempts);
        } catch(e) {
            console.error("TeacherAnalytics.getAdvancedQuestionAnalytics error:", e);
            return [];
        }
    }

    function getAdvancedStudentAnalytics(studentId, filters) {
        try {
            var data = getTeacherAnalyticsData(filters);
            return Analytics.getAdvancedStudentAnalytics(studentId, data.attempts);
        } catch(e) {
            console.error("TeacherAnalytics.getAdvancedStudentAnalytics error:", e);
            return { studentId: studentId, totalAttempts: 0, confidence: "insufficient", consistency: null, difficultyPerformance: [], bloomPerformance: [], timeAccuracy: null, modeComparison: null, riskTrajectory: null };
        }
    }

    function getAdvancedClassAnalytics(filters) {
        try {
            var data = getTeacherAnalyticsData(filters);
            var teacherClasses = filters.teacherClasses || [];
            var totalStudents = 0;
            for (var i = 0; i < studentAccounts.length; i++) {
                if (teacherClasses.indexOf(studentAccounts[i].classId) !== -1) {
                    totalStudents++;
                }
            }
            return Analytics.getAdvancedClassAnalytics(data.attempts, totalStudents);
        } catch(e) {
            console.error("TeacherAnalytics.getAdvancedClassAnalytics error:", e);
            return { totalAttempts: 0, uniqueStudents: 0, confidence: "insufficient", performanceSpread: null, studentGroups: null, practiceAssessment: null, weakTopics: [], dataSufficiency: null };
        }
    }

    function getFullAnalytics(filters) {
        try {
            var data = getTeacherAnalyticsData(filters);
            return {
                overview: Analytics.getClassOverview(data.attempts),
                topicMastery: Analytics.getTopicMastery(data.attempts),
                questionStatistics: Analytics.getQuestionStatistics(data.attempts),
                difficultyPerformance: Analytics.getDifficultyPerformance(data.attempts),
                bloomPerformance: Analytics.getBloomPerformance(data.attempts),
                assessmentTrend: Analytics.getAssessmentTrend(data.attempts),
                atRiskStudents: Analytics.getAtRiskStudents(data.attempts),
                attempts: data.attempts,
                totalAttempts: data.totalAttempts
            };
        } catch(e) {
            console.error("TeacherAnalytics.getFullAnalytics error:", e);
            return { overview: { totalAttempts: 0 }, topicMastery: [], questionStatistics: [], difficultyPerformance: [], bloomPerformance: [], assessmentTrend: [], atRiskStudents: [], attempts: [], totalAttempts: 0 };
        }
    }

    return {
        getClassOverview: getClassOverview,
        getStudentPerformance: getStudentPerformance,
        getTopicMastery: getTopicMastery,
        getQuestionStatistics: getQuestionStatistics,
        getDifficultyPerformance: getDifficultyPerformance,
        getBloomPerformance: getBloomPerformance,
        getAssessmentTrend: getAssessmentTrend,
        getAtRiskStudents: getAtRiskStudents,
        getTeacherOverview: getTeacherOverview,
        getClassPerformanceDistribution: getClassPerformanceDistribution,
        getAssessmentComparison: getAssessmentComparison,
        getTrendDirection: getTrendDirection,
        getTeacherInsights: getTeacherInsights,
        getRecommendations: getRecommendations,
        getActionableInsights: getActionableInsights,
        getAdvancedQuestionAnalytics: getAdvancedQuestionAnalytics,
        getAdvancedStudentAnalytics: getAdvancedStudentAnalytics,
        getAdvancedClassAnalytics: getAdvancedClassAnalytics,
        getFullAnalytics: getFullAnalytics
    };
})();
