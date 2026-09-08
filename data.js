var questions = [];
var classes = [];
var assignments = [];
var teachers = [];
var attendance = [];
var allAttempts = [];
var conceptStats = {};
var studentAccounts = [];
var principalAccount = { id: "ADMIN-001", name: "Principal", password: "yyJwe6sY", createdAt: Date.now() };
var pendingImportData = [];
var pendingStudentExcelData = [];

var ATTEMPTS_KEY = "learningHub_attempts";
var QUESTIONS_KEY = "learningHub_questions";
var CLASSES_KEY = "learningHub_classes";
var ASSIGNMENTS_KEY = "learningHub_assignments";
var TEACHERS_KEY = "learningHub_teachers";
var ATTENDANCE_KEY = "learningHub_attendance";
var CONCEPTS_KEY = "learningHub_concepts";
var STUDENTS_KEY = "learningHub_students";

function loadData() {
    questions = JSON.parse(localStorage.getItem(QUESTIONS_KEY)) || [];
    classes = JSON.parse(localStorage.getItem(CLASSES_KEY)) || [];
    assignments = JSON.parse(localStorage.getItem(ASSIGNMENTS_KEY)) || [];
    teachers = JSON.parse(localStorage.getItem(TEACHERS_KEY)) || [];
    attendance = JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || [];
    allAttempts = JSON.parse(localStorage.getItem(ATTEMPTS_KEY)) || [];
    conceptStats = JSON.parse(localStorage.getItem(CONCEPTS_KEY)) || {};
    studentAccounts = JSON.parse(localStorage.getItem(STUDENTS_KEY)) || [];
    var sp = JSON.parse(localStorage.getItem("learningHub_principal"));
    if (sp && sp.id === "ADMIN-001") principalAccount = sp;
    if (classes.length === 0) {
        classes = [
            { id: "CLASS-9A", name: "9A", grade: 9, section: "A", students: [] },
            { id: "CLASS-9B", name: "9B", grade: 9, section: "B", students: [] }
        ];
    }
}

function saveAll() {
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
    localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
    localStorage.setItem(TEACHERS_KEY, JSON.stringify(teachers));
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendance));
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(allAttempts));
    localStorage.setItem(CONCEPTS_KEY, JSON.stringify(conceptStats));
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(studentAccounts));
    if (principalAccount) localStorage.setItem("learningHub_principal", JSON.stringify(principalAccount));
    saveToFirestore();
}

function saveToFirestore() {
    if (typeof db === "undefined") return;
    if (principalAccount) db.collection("teachers").doc("PRINCIPAL").set(principalAccount).catch(function() {});
    for (var i = 0; i < studentAccounts.length; i++) db.collection("students").doc(studentAccounts[i].id).set(studentAccounts[i]).catch(function() {});
    for (var i = 0; i < classes.length; i++) db.collection("classes").doc(classes[i].id).set(classes[i]).catch(function() {});
    for (var i = 0; i < questions.length; i++) db.collection("questions").doc(questions[i].id).set(questions[i]).catch(function() {});
    for (var i = 0; i < assignments.length; i++) db.collection("assignments").doc(assignments[i].id || ("a-" + i)).set(assignments[i]).catch(function() {});
    for (var i = 0; i < teachers.length; i++) db.collection("teachers").doc(teachers[i].id).set(teachers[i]).catch(function() {});
    for (var i = 0; i < allAttempts.length; i++) db.collection("attempts").doc(allAttempts[i].attemptId || allAttempts[i].timestamp || ("att-" + i)).set(allAttempts[i]).catch(function() {});
}

function loadFromFirestore(callback) {
    if (typeof db === "undefined") { if (callback) callback(); return; }
    var loaded = 0, total = 6;
    function done() { loaded++; if (loaded >= total && callback) callback(); }
    db.collection("students").get().then(function(snap) {
        if (snap.size > 0) { studentAccounts = []; snap.forEach(function(doc) { studentAccounts.push(doc.data()); }); localStorage.setItem(STUDENTS_KEY, JSON.stringify(studentAccounts)); }
        done();
    }).catch(function() { done(); });
    db.collection("classes").get().then(function(snap) {
        if (snap.size > 0) { classes = []; snap.forEach(function(doc) { classes.push(doc.data()); }); localStorage.setItem(CLASSES_KEY, JSON.stringify(classes)); }
        done();
    }).catch(function() { done(); });
    db.collection("questions").get().then(function(snap) {
        if (snap.size > 0) {
            var byId = {};
            for (var i = 0; i < questions.length; i++) byId[questions[i].id] = i;
            snap.forEach(function(doc) {
                var q = doc.data();
                if (byId[q.id] !== undefined) { questions[byId[q.id]] = q; }
                else { questions.push(q); byId[q.id] = questions.length - 1; }
            });
            localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
        }
        done();
    }).catch(function() { done(); });
    db.collection("assignments").get().then(function(snap) {
        if (snap.size > 0) { assignments = []; snap.forEach(function(doc) { assignments.push(doc.data()); }); localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments)); }
        done();
    }).catch(function() { done(); });
    db.collection("attempts").get().then(function(snap) {
        if (snap.size > 0) { allAttempts = []; snap.forEach(function(doc) { allAttempts.push(doc.data()); }); localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(allAttempts)); }
        done();
    }).catch(function() { done(); });
    db.collection("teachers").get().then(function(snap) {
        if (snap.size > 0) {
            teachers = [];
            snap.forEach(function(doc) {
                var d = doc.data();
                if (d.id === "PRINCIPAL" || doc.id === "PRINCIPAL") { if (!principalAccount || principalAccount.id !== "ADMIN-001") principalAccount = d; }
                else teachers.push(d);
            });
            localStorage.setItem(TEACHERS_KEY, JSON.stringify(teachers));
        }
        done();
    }).catch(function() { done(); });
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

function generateTeacherId() {
    var num = teachers.length + 1;
    var id = "T-" + (num < 10 ? "0" : "") + num;
    for (var i = 0; i < teachers.length; i++) {
        if (teachers[i].id === id) { num++; id = "T-" + (num < 10 ? "0" : "") + num; i = -1; }
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
