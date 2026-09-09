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
        description: "Elements, Reactions, Acids & Bases",
        chapters: [
            { num: 1, title: "States of Matter", topics: ["Solids", "Liquids", "Gases", "Changes of State"] },
            { num: 2, title: "Atomic Structure", topics: ["Atoms", "Elements", "Periodic Table"] },
            { num: 3, title: "Chemical Bonding", topics: ["Ionic Bond", "Covalent Bond", "Metallic Bond"] },
            { num: 4, title: "Acids & Bases", topics: ["Properties", "pH Scale", "Neutralization"] },
            { num: 5, title: "Salts", topics: ["Preparation", "Types", "Uses"] },
            { num: 6, title: "Chemical Reactions", topics: ["Types of Reactions", "Equations", "Balancing"] }
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

function loadData() {
    questions = JSON.parse(localStorage.getItem(QUESTIONS_KEY)) || [];
    classes = JSON.parse(localStorage.getItem(CLASSES_KEY)) || [];
    assignments = JSON.parse(localStorage.getItem(ASSIGNMENTS_KEY)) || [];
    teachers = JSON.parse(localStorage.getItem(TEACHERS_KEY)) || [];
    attendance = JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || [];
    allAttempts = JSON.parse(localStorage.getItem(ATTEMPTS_KEY)) || [];
    conceptStats = JSON.parse(localStorage.getItem(CONCEPTS_KEY)) || {};
    studentAccounts = JSON.parse(localStorage.getItem(STUDENTS_KEY)) || [];
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
    if (migrated) localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
    if (teachers.length > 0) localStorage.setItem(TEACHERS_KEY, JSON.stringify(teachers));
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
    if (typeof db === "undefined") { console.warn("Firestore not available"); return; }
    if (principalAccount) db.collection("teachers").doc("PRINCIPAL").set(principalAccount).catch(function(e) { console.error("Firestore PRINCIPAL save error:", e); });
    for (var i = 0; i < studentAccounts.length; i++) db.collection("students").doc(studentAccounts[i].id).set(studentAccounts[i]).catch(function(e) { console.error("Firestore student save error:", e); });
    for (var i = 0; i < classes.length; i++) db.collection("classes").doc(classes[i].id).set(classes[i]).catch(function(e) { console.error("Firestore class save error:", e); });
    for (var i = 0; i < questions.length; i++) db.collection("questions").doc(questions[i].id).set(questions[i]).catch(function(e) { console.error("Firestore question save error:", e); });
    for (var i = 0; i < assignments.length; i++) db.collection("assignments").doc(assignments[i].id || ("a-" + i)).set(assignments[i]).catch(function(e) { console.error("Firestore assignment save error:", e); });
    for (var i = 0; i < teachers.length; i++) db.collection("teachers").doc(teachers[i].id).set(teachers[i]).catch(function(e) { console.error("Firestore teacher save error:", e); });
    for (var i = 0; i < allAttempts.length; i++) db.collection("attempts").doc(allAttempts[i].attemptId || allAttempts[i].timestamp || ("att-" + i)).set(allAttempts[i]).catch(function(e) { console.error("Firestore attempt save error:", e); });
}

function saveTeacherToFirestore(teacherObj, callback) {
    if (typeof db === "undefined") { if (callback) callback(false); return; }
    db.collection("teachers").doc(teacherObj.id).set(teacherObj)
        .then(function() { if (callback) callback(true); })
        .catch(function(e) { console.error("Firestore single teacher save error:", e); if (callback) callback(false); });
}

function loadFromFirestore(callback) {
    if (typeof db === "undefined") { console.warn("Firestore not available for refresh"); if (callback) callback(); return; }
    var loaded = 0, total = 6;
    function done() { loaded++; if (loaded >= total && callback) callback(); }
    db.collection("students").get().then(function(snap) {
        if (snap.size > 0) { studentAccounts = []; snap.forEach(function(doc) { studentAccounts.push(doc.data()); }); localStorage.setItem(STUDENTS_KEY, JSON.stringify(studentAccounts)); }
        done();
    }).catch(function(e) { console.error("Firestore students load error:", e); done(); });
    db.collection("classes").get().then(function(snap) {
        if (snap.size > 0) { classes = []; snap.forEach(function(doc) { classes.push(doc.data()); }); localStorage.setItem(CLASSES_KEY, JSON.stringify(classes)); }
        done();
    }).catch(function(e) { console.error("Firestore classes load error:", e); done(); });
    db.collection("questions").get().then(function(snap) {
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
        done();
    }).catch(function(e) { console.error("Firestore questions load error:", e); done(); });
    db.collection("assignments").get().then(function(snap) {
        if (snap.size > 0) { assignments = []; snap.forEach(function(doc) { assignments.push(doc.data()); }); localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments)); }
        done();
    }).catch(function(e) { console.error("Firestore assignments load error:", e); done(); });
    db.collection("attempts").get().then(function(snap) {
        if (snap.size > 0) { allAttempts = []; snap.forEach(function(doc) { allAttempts.push(doc.data()); }); localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(allAttempts)); }
        done();
    }).catch(function() { done(); });
    db.collection("teachers").get().then(function(snap) {
        if (snap.size > 0) {
            var firestoreTeachers = [];
            snap.forEach(function(doc) {
                var d = doc.data();
                if (d.id === "PRINCIPAL" || doc.id === "PRINCIPAL") { if (!principalAccount || principalAccount.id !== "ADMIN-001") principalAccount = d; }
                else {
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
            for (var i = 0; i < firestoreTeachers.length; i++) localById[firestoreTeachers[i].id] = firestoreTeachers[i];
            teachers = [];
            for (var id in localById) teachers.push(localById[id]);
            console.log("Merged teachers:", teachers.map(function(t) { return t.id; }));
            localStorage.setItem(TEACHERS_KEY, JSON.stringify(teachers));
        }
        done();
    }).catch(function(e) { console.error("Firestore teachers load error:", e); done(); });
}

function refreshAssignmentsFromFirestore(callback) {
    if (typeof db === "undefined") { if (callback) callback(); return; }
    db.collection("assignments").get().then(function(snap) {
        assignments = [];
        snap.forEach(function(doc) { assignments.push(doc.data()); });
        localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
        if (callback) callback();
    }).catch(function() { if (callback) callback(); });
}

function refreshAttemptsFromFirestore(callback) {
    if (typeof db === "undefined") { if (callback) callback(); return; }
    db.collection("attempts").get().then(function(snap) {
        allAttempts = [];
        snap.forEach(function(doc) { allAttempts.push(doc.data()); });
        localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(allAttempts));
        if (callback) callback();
    }).catch(function() { if (callback) callback(); });
}

function refreshAllData(callback) {
    if (typeof db === "undefined") { console.warn("Firestore not available for refresh"); if (callback) callback(); return; }
    loadFromFirestore(function() {
        console.log("Refresh complete. Teachers:", teachers.length, "Classes:", classes.length, "Students:", studentAccounts.length);
        var user = null;
        try { user = JSON.parse(localStorage.getItem("learningHub_user")); } catch(e) {}
        if (user && user.user) {
            var role = user.role;
            var u = user.user;
            if (role === "teacher" || role === "classteacher") {
                for (var i = 0; i < teachers.length; i++) {
                    if (teachers[i].id === u.id) {
                        u.classSubjects = teachers[i].classSubjects || u.classSubjects;
                        u.subjects = teachers[i].subjects || u.subjects;
                        u.classes = teachers[i].classes || u.classes;
                        u.classId = teachers[i].classId || u.classId;
                        u.isClassTeacher = teachers[i].isClassTeacher;
                        u.classTeacherOf = teachers[i].classTeacherOf || u.classTeacherOf;
                        break;
                    }
                }
            } else if (role === "student") {
                for (var i = 0; i < studentAccounts.length; i++) {
                    if (studentAccounts[i].id === u.id) {
                        u.classId = studentAccounts[i].classId || u.classId;
                        break;
                    }
                }
            }
            localStorage.setItem("learningHub_user", JSON.stringify({ role: role, user: u }));
        }
        if (callback) callback();
    });
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
    var num = 1;
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
