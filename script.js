var score = 0;
var answered = false;
var currentQuestion = 0;
var timeLeft = 60;
var quizTimeLimit = 60;
var timer = null;
var studentAnswers = [];
var questionStartTime = 0;
var allAttempts = [];
var currentRole = null;
var currentUser = null;
var activeQuizQuestions = [];
var shuffledOptionsMap = {};

var ATTEMPTS_KEY = "learningHub_attempts";
var QUESTIONS_KEY = "learningHub_questions";
var CLASSES_KEY = "learningHub_classes";
var ASSIGNMENTS_KEY = "learningHub_assignments";
var TEACHERS_KEY = "learningHub_teachers";
var ATTENDANCE_KEY = "learningHub_attendance";
var CONCEPTS_KEY = "learningHub_concepts";
var STUDENTS_KEY = "learningHub_students";

var questions = [];
var classes = [];
var assignments = [];
var teachers = [];
var conceptStats = {};
var attendance = [];
var studentAccounts = [];

var subjectsData = {
    "Computer Science": {
        icon: "&#128187;",
        color: "#4f46e5",
        description: "Hardware, Software, Programming & Problem Solving",
        chapters: [
            { num: 1, title: "Computer Systems", topics: ["Computer Generations", "Systems and Types", "Core Components", "Von Neumann Architecture", "Data Transmission", "Computer Memory"] },
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
        '<span style="flex:1;font-size:13px;color:var(--text-mid);min-width:120px;">' + name + '</span>' +
        '<div style="flex:2;height:10px;background:#e2e8f0;border-radius:5px;overflow:hidden;">' +
        '<div style="height:100%;width:' + pct + '%;background:' + color + ';border-radius:5px;transition:width 0.6s ease;"></div>' +
        '</div>' +
        '<span style="font-size:13px;font-weight:700;width:40px;text-align:right;color:' + color + ';">' + pct + '%</span>' +
        '</div>';
}

function renderPalette() {
    var pal = document.getElementById("questionPalette");
    if (!pal) return;
    pal.innerHTML = "";
    for (var i = 0; i < activeQuizQuestions.length; i++) {
        var dot = document.createElement("div");
        dot.className = "palette-dot";
        dot.textContent = i + 1;
        if (i === currentQuestion) {
            dot.classList.add("current");
        } else {
            var answered_q = false;
            for (var j = 0; j < studentAnswers.length; j++) {
                if (studentAnswers[j].question === i) { answered_q = true; break; }
            }
            if (answered_q) dot.classList.add("answered");
            else dot.classList.add("skipped");
        }
        dot.onclick = (function(idx) { return function() { jumpToQuestion(idx); }; })(i);
        pal.appendChild(dot);
    }
}

function jumpToQuestion(idx) {
    currentQuestion = idx;
    answered = false;
    for (var j = 0; j < studentAnswers.length; j++) {
        if (studentAnswers[j].question === idx) { answered = true; break; }
    }
    document.getElementById("nextButton").style.display = answered ? "block" : "none";
    document.getElementById("nextButton").textContent = (currentQuestion === activeQuizQuestions.length - 1) ? "Finish Quiz" : "Next Question";
    displayQuestion();
}

function prevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        answered = false;
        for (var j = 0; j < studentAnswers.length; j++) {
            if (studentAnswers[j].question === currentQuestion) { answered = true; break; }
        }
        document.getElementById("nextButton").style.display = answered ? "block" : "none";
        document.getElementById("nextButton").textContent = (currentQuestion === activeQuizQuestions.length - 1) ? "Finish Quiz" : "Next Question";
        displayQuestion();
    }
}

function skipQuestion() {
    if (currentQuestion < activeQuizQuestions.length - 1) {
        currentQuestion++;
        answered = false;
        for (var j = 0; j < studentAnswers.length; j++) {
            if (studentAnswers[j].question === currentQuestion) { answered = true; break; }
        }
        document.getElementById("nextButton").style.display = answered ? "block" : "none";
        document.getElementById("nextButton").textContent = (currentQuestion === activeQuizQuestions.length - 1) ? "Finish Quiz" : "Next Question";
        displayQuestion();
    }
}

function loadData() {
    questions = JSON.parse(localStorage.getItem(QUESTIONS_KEY)) || [];
    classes = JSON.parse(localStorage.getItem(CLASSES_KEY)) || [];
    assignments = JSON.parse(localStorage.getItem(ASSIGNMENTS_KEY)) || [];
    teachers = JSON.parse(localStorage.getItem(TEACHERS_KEY)) || [];
    attendance = JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || [];
    allAttempts = JSON.parse(localStorage.getItem(ATTEMPTS_KEY)) || [];
    conceptStats = JSON.parse(localStorage.getItem(CONCEPTS_KEY)) || {};
    studentAccounts = JSON.parse(localStorage.getItem(STUDENTS_KEY)) || [];
    if (studentAccounts.length === 0) {
        studentAccounts = [
            { id: "9A-001", name: "Ahmed Ali", classId: "CLASS-9A", grade: 9, password: "123", forcePasswordChange: false },
            { id: "9A-002", name: "Sara Khan", classId: "CLASS-9A", grade: 9, password: "123", forcePasswordChange: false },
            { id: "9A-003", name: "Usman Tariq", classId: "CLASS-9A", grade: 9, password: "123", forcePasswordChange: false },
            { id: "9B-001", name: "Fatima Noor", classId: "CLASS-9B", grade: 9, password: "123", forcePasswordChange: false },
            { id: "9B-002", name: "Bilal Ahmed", classId: "CLASS-9B", grade: 9, password: "123", forcePasswordChange: false },
            { id: "9B-003", name: "Ayesha Siddiqui", classId: "CLASS-9B", grade: 9, password: "123", forcePasswordChange: false }
        ];
    }
    if (classes.length === 0) {
        classes = [
            { id: "CLASS-9A", name: "9A", grade: 9, section: "A", students: ["9A-001", "9A-002", "9A-003"] },
            { id: "CLASS-9B", name: "9B", grade: 9, section: "B", students: ["9B-001", "9B-002", "9B-003"] }
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
}

function dashboardsHide() {
    var ids = ["studentDashboard", "teacherDashboard", "classTeacherDashboard", "parentDashboard", "principalDashboard"];
    for (var i = 0; i < ids.length; i++) {
        document.getElementById(ids[i]).style.display = "none";
    }
}

function updateLoginFields() {
    var role = document.getElementById("roleSelect").value;
    var ids = ["studentFields", "teacherFields", "parentFields", "principalFields"];
    for (var i = 0; i < ids.length; i++) document.getElementById(ids[i]).style.display = "none";
    if (role === "student") document.getElementById("studentFields").style.display = "block";
    else if (role === "teacher") document.getElementById("teacherFields").style.display = "block";
    else if (role === "parent") document.getElementById("parentFields").style.display = "block";
    else if (role === "principal") document.getElementById("principalFields").style.display = "block";
    else if (role === "classteacher") document.getElementById("teacherFields").style.display = "block";
}

function handleLogin(e) {
    e.preventDefault();
    var role = document.getElementById("roleSelect").value;
    var name = "", id = "", subject = null, childId = null, password = "";
    var defaultPasswords = { teacher: "123", classteacher: "123", parent: "123", principal: "admin" };
    if (role === "student") {
        id = document.getElementById("studentId").value.trim();
        name = document.getElementById("studentName").value.trim();
        password = document.getElementById("studentPassword").value;
        if (!id || !password) { alert("Please enter Student ID and Password."); return; }
        var found = null;
        for (var i = 0; i < studentAccounts.length; i++) {
            if (studentAccounts[i].id === id) { found = studentAccounts[i]; break; }
        }
        if (!found) { alert("Student ID not found. Contact admin to create your account."); return; }
        if (found.password !== password) { alert("Incorrect password."); return; }
        name = name || found.name;
        currentUser = { id: found.id, name: found.name, role: "student", subject: null, childId: null, classId: found.classId, grade: found.grade };
        currentRole = "student";
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("logoutBar").style.display = "flex";
        document.getElementById("homeBtn").style.display = "inline-block";
        document.getElementById("loggedUser").textContent = found.name + " (Student)";
        dashboardsHide();
        if (found.forcePasswordChange) {
            document.getElementById("passwordChangeModal").classList.add("active");
            document.getElementById("modalOverlay").classList.add("active");
            return;
        }
        document.getElementById("studentDashboard").style.display = "block";
        document.getElementById("studentDisplayName").textContent = found.name;
        showStudentTab("practice");
        history.pushState({ page: "dashboard" }, "", "#dashboard");
        return;
    } else if (role === "teacher") {
        id = document.getElementById("teacherId").value || "T-001";
        name = document.getElementById("teacherName").value || "Teacher";
        subject = document.getElementById("teacherSubject").value;
        password = document.getElementById("teacherPassword").value;
    } else if (role === "classteacher") {
        id = document.getElementById("teacherId").value || "T-CT-001";
        name = document.getElementById("teacherName").value || "Class Teacher";
        subject = "All Subjects";
        password = document.getElementById("teacherPassword").value;
    } else if (role === "parent") {
        id = document.getElementById("parentId").value || "P-001";
        name = document.getElementById("parentName").value || "Parent";
        childId = document.getElementById("childId").value || "9A-001";
        password = document.getElementById("parentPassword").value;
    } else if (role === "principal") {
        id = document.getElementById("principalId").value || "ADMIN-001";
        name = document.getElementById("principalName").value || "Principal";
        password = document.getElementById("principalPassword").value;
    }
    if (password !== defaultPasswords[role]) {
        alert("Incorrect password. Demo password for " + role + ": " + defaultPasswords[role]);
        return;
    }
    currentUser = { id: id, name: name, role: role, subject: subject, childId: childId };
    currentRole = role;
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("logoutBar").style.display = "flex";
    document.getElementById("homeBtn").style.display = "inline-block";
    document.getElementById("loggedUser").textContent = name + " (" + role + ")";
    dashboardsHide();
    if (role === "student") {
        document.getElementById("studentDashboard").style.display = "block";
        document.getElementById("studentDisplayName").textContent = name;
        showStudentTab("practice");
    } else if (role === "teacher" || role === "classteacher") {
        document.getElementById("teacherDashboard").style.display = "block";
        document.getElementById("teacherDisplayName").textContent = name;
        document.getElementById("teacherSubjectDisplay").textContent = subject || "All";
        populateTeacherClasses();
        showTeacherTab("classes");
    } else if (role === "parent") {
        document.getElementById("parentDashboard").style.display = "block";
        document.getElementById("parentDisplayName").textContent = name;
        document.getElementById("childIdDisplay").textContent = childId || "";
        var cc = null;
        for (var i = 0; i < classes.length; i++) {
            if (classes[i].students.indexOf(childId) !== -1) { cc = classes[i]; break; }
        }
        document.getElementById("childDisplayName").textContent = cc ? "Student " + childId : childId;
        showParentTab("progress");
    } else if (role === "principal") {
        document.getElementById("principalDashboard").style.display = "block";
        document.getElementById("principalDisplayName").textContent = name;
        showPrincipalTab("school");
    }
    history.pushState({ page: "dashboard" }, "", "#dashboard");
}

function handleLogout() {
    currentRole = null;
    currentUser = null;
    clearInterval(timer);
    document.getElementById("logoutBar").style.display = "none";
    dashboardsHide();
    document.getElementById("quiz").style.display = "none";
    document.getElementById("result").style.display = "none";
    document.getElementById("review").style.display = "none";
    document.getElementById("homeBtn").style.display = "none";
    document.getElementById("loginPage").style.display = "block";
    history.pushState({ page: "login" }, "", "#login");
}

function activateTab(containerSel, idx) {
    var btns = document.querySelectorAll(containerSel + " .tab-btn");
    for (var i = 0; i < btns.length; i++) {
        if (i === idx) btns[i].classList.add("active");
        else btns[i].classList.remove("active");
    }
}

function showStudentTab(tab) {
    var map = { practice: 0, assignments: 1, results: 2, progress: 3 };
    var ids = ["studentPracticeTab", "studentAssignmentsTab", "studentResultsTab", "studentProgressTab"];
    for (var i = 0; i < ids.length; i++) document.getElementById(ids[i]).style.display = "none";
    activateTab("#studentDashboard", map[tab]);
    if (tab === "practice") { document.getElementById("studentPracticeTab").style.display = "block"; renderSubjects(); showSubjectList(); }
    else if (tab === "assignments") { document.getElementById("studentAssignmentsTab").style.display = "block"; renderStudentAssignments(); }
    else if (tab === "results") { document.getElementById("studentResultsTab").style.display = "block"; renderStudentResults(); }
    else if (tab === "progress") { document.getElementById("studentProgressTab").style.display = "block"; renderStudentProgress(); }
}

function renderStudentAssignments() {
    var c = document.getElementById("studentAssignmentsList");
    var sc = null;
    for (var i = 0; i < classes.length; i++) {
        if (classes[i].students.indexOf(currentUser.id) !== -1) { sc = classes[i]; break; }
    }
    if (!sc) { c.innerHTML = "<p>No class assigned.</p>"; return; }
    var my = [];
    for (var i = 0; i < assignments.length; i++) {
        if (assignments[i].classId === sc.id) my.push(assignments[i]);
    }
    if (my.length === 0) { c.innerHTML = "<p>No assignments yet.</p>"; return; }
    var h = '<table><thead><tr><th>Title</th><th>Subject</th><th>Due Date</th><th>Questions</th><th>Action</th></tr></thead><tbody>';
    for (var i = 0; i < my.length; i++) {
        var overdue = new Date(my[i].dueDate) < new Date();
        h += '<tr><td>' + my[i].title + '</td><td>' + my[i].subject + '</td><td>' + my[i].dueDate + (overdue ? ' <span class="badge badge-hard">Overdue</span>' : '') + '</td><td>' + my[i].questions.length + '</td><td><button onclick="startAssignmentQuiz(\'' + my[i].id + '\')" class="action-btn">Start Quiz</button></td></tr>';
    }
    c.innerHTML = h + '</tbody></table>';
}

function renderStudentResults() {
    var c = document.getElementById("studentResultsList");
    var my = [];
    for (var i = 0; i < allAttempts.length; i++) {
        if (allAttempts[i].studentId === currentUser.id) my.push(allAttempts[i]);
    }
    if (my.length === 0) { c.innerHTML = '<div class="empty-state"><h4>No results yet</h4><p>Complete a quiz to see your results here.</p></div>'; return; }
    my.sort(function(a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });
    var h = '<table class="history-table"><thead><tr><th>Date</th><th>Subject</th><th>Score</th><th>%</th><th>Time</th></tr></thead><tbody>';
    for (var i = 0; i < my.length; i++) {
        var d = new Date(my[i].timestamp);
        var ts = my[i].timeSpent ? Math.floor(my[i].timeSpent / 60) + ":" + (my[i].timeSpent % 60 < 10 ? "0" : "") + (my[i].timeSpent % 60) : "-";
        var cls = my[i].percentage >= 70 ? "color:var(--success)" : my[i].percentage >= 50 ? "color:var(--accent)" : "color:var(--error)";
        h += '<tr><td>' + d.toLocaleDateString() + '</td><td>' + my[i].subject + '</td><td>' + my[i].score + '/' + my[i].total + '</td><td style="' + cls + ';font-weight:700;">' + my[i].percentage + '%</td><td>' + ts + '</td></tr>';
    }
    c.innerHTML = h + '</tbody></table>';
}

function renderStudentProgress() {
    var c = document.getElementById("studentProgressContent");
    var my = [];
    for (var i = 0; i < allAttempts.length; i++) {
        if (allAttempts[i].studentId === currentUser.id) my.push(allAttempts[i]);
    }
    if (my.length === 0) { c.innerHTML = '<div class="empty-state"><h4>No progress data yet</h4><p>Complete a quiz to see your progress here.</p></div>'; return; }
    var avg = 0, best = 0, totalQ = 0;
    for (var i = 0; i < my.length; i++) { avg += my[i].percentage; if (my[i].percentage > best) best = my[i].percentage; totalQ += my[i].total; }
    avg = avg / my.length;
    var h = '<div class="analytics-grid">' +
        '<div class="analytics-card"><h4>Total Quizzes</h4><div class="analytics-value">' + my.length + '</div></div>' +
        '<div class="analytics-card"><h4>Average Score</h4><div class="analytics-value">' + avg.toFixed(0) + '%</div></div>' +
        '<div class="analytics-card"><h4>Best Score</h4><div class="analytics-value">' + best.toFixed(0) + '%</div></div>' +
        '<div class="analytics-card"><h4>Questions Done</h4><div class="analytics-value">' + totalQ + '</div></div>' +
        '</div>';
    var subs = {};
    for (var i = 0; i < my.length; i++) {
        var s = my[i].subject;
        if (!subs[s]) subs[s] = { n: 0, sum: 0 };
        subs[s].n++; subs[s].sum += my[i].percentage;
    }
    h += '<div class="panel-card"><h3>&#128202; Performance by Subject</h3>';
    for (var s in subs) {
        var pct = Math.round(subs[s].sum / subs[s].n);
        var cls = pct >= 70 ? "good" : pct >= 50 ? "avg" : "bad";
        h += renderBar(s, pct, cls);
    }
    h += '</div>';
    var topics = {};
    for (var i = 0; i < my.length; i++) {
        var tp = my[i].topicPerformance || {};
        for (var t in tp) {
            if (!topics[t]) topics[t] = { correct: 0, total: 0 };
            topics[t].correct += tp[t].correct;
            topics[t].total += tp[t].total;
        }
    }
    if (Object.keys(topics).length > 0) {
        h += '<div class="panel-card"><h3>&#128200; Performance by Topic</h3>';
        var sorted = [];
        for (var t in topics) sorted.push({ name: t, pct: Math.round(topics[t].correct / topics[t].total * 100), correct: topics[t].correct, total: topics[t].total });
        sorted.sort(function(a, b) { return b.pct - a.pct; });
        for (var i = 0; i < sorted.length; i++) {
            var cls = sorted[i].pct >= 70 ? "good" : sorted[i].pct >= 50 ? "avg" : "bad";
            h += renderBar(sorted[i].name + " (" + sorted[i].correct + "/" + sorted[i].total + ")", sorted[i].pct, cls);
        }
        h += '</div>';
    }
    var uid = currentUser.id;
    var concepts = [];
    for (var key in conceptStats) {
        if (key.indexOf(uid + "_") === 0) {
            var cs = conceptStats[key];
            concepts.push({ name: cs.topic, subject: cs.subject, pct: Math.round(cs.correct / cs.total * 100), correct: cs.correct, total: cs.total });
        }
    }
    if (concepts.length > 0) {
        concepts.sort(function(a, b) { return a.pct - b.pct; });
        var strong = [];
        var weak = [];
        for (var i = 0; i < concepts.length; i++) {
            if (concepts[i].pct >= 70) strong.push(concepts[i]);
            else if (concepts[i].total >= 2 && concepts[i].pct < 60) weak.push(concepts[i]);
        }
        if (weak.length > 0) {
            h += '<div class="panel-card" style="border-left:4px solid var(--error);"><h3>&#9888; Weak Areas (Focus Here)</h3>';
            for (var i = 0; i < Math.min(5, weak.length); i++) {
                h += renderBar(weak[i].name + " — " + weak[i].subject, weak[i].pct, "bad");
            }
            h += '</div>';
        }
        if (strong.length > 0) {
            h += '<div class="panel-card" style="border-left:4px solid var(--success);"><h3>&#9989; Strong Areas (Mastered)</h3>';
            for (var i = 0; i < Math.min(5, strong.length); i++) {
                h += renderBar(strong[i].name + " — " + strong[i].subject, strong[i].pct, "good");
            }
            h += '</div>';
        }
    }
    h += '<div class="panel-card"><h3>&#128197; Recent Attempts</h3>';
    h += '<table class="history-table"><thead><tr><th>Date</th><th>Subject</th><th>Score</th><th>%</th><th>Time</th></tr></thead><tbody>';
    for (var i = my.length - 1; i >= Math.max(0, my.length - 10); i--) {
        var d = new Date(my[i].timestamp);
        var ts = my[i].timeSpent ? Math.floor(my[i].timeSpent / 60) + ":" + (my[i].timeSpent % 60 < 10 ? "0" : "") + (my[i].timeSpent % 60) : "-";
        h += '<tr><td>' + d.toLocaleDateString() + '</td><td>' + my[i].subject + '</td><td>' + my[i].score + '/' + my[i].total + '</td><td><strong>' + my[i].percentage + '%</strong></td><td>' + ts + '</td></tr>';
    }
    h += '</tbody></table></div>';
    c.innerHTML = h;
}

function balancedSelect(pool, target) {
    if (pool.length <= target) return shuffleArray(pool);
    var bySubject = {};
    for (var i = 0; i < pool.length; i++) {
        var s = pool[i].subject;
        if (!bySubject[s]) bySubject[s] = [];
        bySubject[s].push(pool[i]);
    }
    var subjects = [];
    for (var k in bySubject) subjects.push(k);
    var perSubject = Math.floor(target / subjects.length);
    var selected = [];
    for (var i = 0; i < subjects.length; i++) {
        var shuffled = shuffleArray(bySubject[subjects[i]]);
        for (var j = 0; j < Math.min(perSubject, shuffled.length); j++) {
            selected.push(shuffled[j]);
        }
    }
    if (selected.length < target) {
        var remaining = [];
        for (var i = 0; i < pool.length; i++) {
            var found = false;
            for (var j = 0; j < selected.length; j++) {
                if (selected[j].id === pool[i].id) { found = true; break; }
            }
            if (!found) remaining.push(pool[i]);
        }
        var extra = shuffleArray(remaining);
        for (var i = 0; i < Math.min(target - selected.length, extra.length); i++) {
            selected.push(extra[i]);
        }
    }
    return shuffleArray(selected.slice(0, target));
}

function getWeakQuestions() {
    var attempts = JSON.parse(localStorage.getItem(ATTEMPTS_KEY)) || [];
    var wrongIds = {};
    for (var i = 0; i < attempts.length; i++) {
        var a = attempts[i];
        var answerList = a.questions || a.studentAnswers || [];
        for (var j = 0; j < answerList.length; j++) {
            if (!answerList[j].correct) {
                wrongIds[answerList[j].questionId] = true;
            }
        }
    }
    var weak = [];
    for (var i = 0; i < questions.length; i++) {
        if (wrongIds[questions[i].id]) weak.push(questions[i]);
    }
    return weak;
}

var currentSubject = null;

function renderSubjects() {
    var grid = document.getElementById("subjectGrid");
    var html = "";
    for (var name in subjectsData) {
        var s = subjectsData[name];
        var count = 0;
        for (var i = 0; i < s.chapters.length; i++) {
            for (var j = 0; j < questions.length; j++) {
                if (questions[j].subject === name && questions[j].chapter === s.chapters[i].num) count++;
            }
        }
        html += '<div class="subject-card" data-subject="' + name + '" onclick="showSubjectChapters(\'' + name + '\')">' +
            '<div class="subject-icon">' + s.icon + '</div>' +
            '<h4>' + name + '</h4>' +
            '<p>' + s.description + '</p>' +
            '<p style="margin-top:8px;font-size:12px;color:var(--primary);font-weight:600;">' + s.chapters.length + ' chapters &bull; ' + count + ' questions</p>' +
            '</div>';
    }
    grid.innerHTML = html;
}

function showSubjectChapters(subject) {
    currentSubject = subject;
    var s = subjectsData[subject];
    document.getElementById("subjectListView").style.display = "none";
    document.getElementById("chapterListView").style.display = "block";
    document.getElementById("chapterSubjectTitle").innerHTML = s.icon + " " + subject + " — Select Chapter";
    var grid = document.getElementById("chapterGrid");
    var html = "";
    for (var i = 0; i < s.chapters.length; i++) {
        var ch = s.chapters[i];
        var qCount = 0;
        for (var j = 0; j < questions.length; j++) {
            if (questions[j].subject === subject && questions[j].chapter === ch.num) qCount++;
        }
        html += '<div class="chapter-card" onclick="showChapterQuizOptions(' + ch.num + ', \'' + subject + '\')">' +
            '<div class="chapter-num">Chapter ' + ch.num + '</div>' +
            '<h4>' + ch.title + '</h4>' +
            '<p>' + ch.topics.slice(0, 3).join(", ") + (ch.topics.length > 3 ? "..." : "") + '</p>' +
            '<span class="chapter-count">' + qCount + ' questions</span>' +
            '</div>';
    }
    grid.innerHTML = html;
    document.getElementById("chapterQuizOptions").style.display = "none";
}

function showSubjectList() {
    document.getElementById("subjectListView").style.display = "block";
    document.getElementById("chapterListView").style.display = "none";
    document.getElementById("modeDetailPanel").style.display = "none";
    currentSubject = null;
}

function showChapterQuizOptions(chapterNum, subject) {
    var s = subjectsData[subject];
    var ch = null;
    for (var i = 0; i < s.chapters.length; i++) {
        if (s.chapters[i].num === chapterNum) { ch = s.chapters[i]; break; }
    }
    if (!ch) return;
    var qCount = 0;
    for (var j = 0; j < questions.length; j++) {
        if (questions[j].subject === subject && questions[j].chapter === chapterNum) qCount++;
    }
    document.getElementById("chapterGrid").style.display = "none";
    var panel = document.getElementById("chapterQuizOptions");
    panel.style.display = "block";
    panel.innerHTML = '<button class="mode-back-btn" onclick="backToChapters()">&#8592; Back to Chapters</button>' +
        '<h3>' + s.icon + ' ' + subject + ' — Chapter ' + chapterNum + ': ' + ch.title + '</h3>' +
        '<p>' + qCount + ' questions available</p>' +
        '<div class="quiz-mode-grid">' +
        '<div class="quiz-mode-card" onclick="showTopicPicker(' + chapterNum + ', \'' + subject + '\')">' +
        '<div class="quiz-mode-icon">&#9889;</div>' +
        '<h4>Quick Practice</h4>' +
        '<p>15 questions &bull; 20 min<br>Pick a topic to revise</p>' +
        '</div>' +
        '<div class="quiz-mode-card" onclick="launchChapterMode(' + chapterNum + ', \'' + subject + '\', \'test\')">' +
        '<div class="quiz-mode-icon">&#128218;</div>' +
        '<h4>Chapter Test</h4>' +
        '<p>30 questions &bull; 40 min<br>67% straight + 33% scenario</p>' +
        '</div>' +
        '<div class="quiz-mode-card" onclick="launchChapterMode(' + chapterNum + ', \'' + subject + '\', \'weak\')">' +
        '<div class="quiz-mode-icon">&#128200;</div>' +
        '<h4>Weak Areas</h4>' +
        '<p>Mistakes from this chapter<br>Fix your weak points</p>' +
        '</div>';
}

function backToChapters() {
    document.getElementById("chapterGrid").style.display = "";
    document.getElementById("chapterQuizOptions").style.display = "none";
}

function showTopicPicker(chapterNum, subject) {
    var s = subjectsData[subject];
    var ch = null;
    for (var i = 0; i < s.chapters.length; i++) {
        if (s.chapters[i].num === chapterNum) { ch = s.chapters[i]; break; }
    }
    if (!ch) return;
    var panel = document.getElementById("chapterQuizOptions");
    var html = '<button class="mode-back-btn" onclick="showChapterQuizOptions(' + chapterNum + ', \'' + subject + '\')">&#8592; Back to Modes</button>' +
        '<h3>&#9889; Quick Practice — Pick a Topic</h3>' +
        '<p>Choose a topic from Chapter ' + chapterNum + ': ' + ch.title + '</p>' +
        '<div class="quiz-mode-grid">';
    html += '<div class="quiz-mode-card" onclick="launchTopicPractice(' + chapterNum + ', \'' + subject + '\', \'all\')">' +
        '<div class="quiz-mode-icon">&#128230;</div>' +
        '<h4>All Topics</h4>' +
        '<p>Mixed questions from entire chapter</p>' +
        '</div>';
    for (var i = 0; i < ch.topics.length; i++) {
        var tCount = 0;
        for (var j = 0; j < questions.length; j++) {
            if (questions[j].subject === subject && questions[j].chapter === chapterNum && questions[j].topic === ch.topics[i]) tCount++;
        }
        html += '<div class="quiz-mode-card" onclick="launchTopicPractice(' + chapterNum + ', \'' + subject + '\', \'' + ch.topics[i].replace(/'/g, "\\'") + '\')">' +
            '<div class="quiz-mode-icon">&#128196;</div>' +
            '<h4>' + ch.topics[i] + '</h4>' +
            '<p>' + tCount + ' questions</p>' +
            '</div>';
    }
    html += '</div>';
    panel.innerHTML = html;
}

function launchTopicPractice(chapterNum, subject, topic) {
    var filtered = [];
    for (var i = 0; i < questions.length; i++) {
        var q = questions[i];
        if (q.subject === subject && q.chapter === chapterNum) {
            if (topic === "all" || q.topic === topic) filtered.push(q);
        }
    }
    if (filtered.length === 0) { alert("No questions available for this topic."); return; }
    var count = Math.min(15, filtered.length);
    var selected = balancedSelect(filtered, count);
    launchQuiz(selected, 20, "practice");
}

function launchChapterMode(chapterNum, subject, mode) {
    var filtered = [];
    for (var i = 0; i < questions.length; i++) {
        if (questions[i].subject === subject && questions[i].chapter === chapterNum) filtered.push(questions[i]);
    }
    if (filtered.length === 0) { alert("No questions available for this chapter."); return; }
    var count, time;
    if (mode === "practice") { count = Math.min(15, filtered.length); time = 20; }
    else if (mode === "test") { count = Math.min(30, filtered.length); time = 40; }
    else if (mode === "weak") {
        var weak = getWeakQuestions();
        var chapterWeak = [];
        for (var i = 0; i < weak.length; i++) {
            if (weak[i].subject === subject && weak[i].chapter === chapterNum) chapterWeak.push(weak[i]);
        }
        if (chapterWeak.length === 0) { alert("No weak areas found for this chapter. Complete some quizzes first!"); return; }
        count = Math.min(15, chapterWeak.length); time = 20;
        filtered = chapterWeak;
    }
    var selected = balancedSelect(filtered, count);
    launchQuiz(selected, time, mode);
}

function balancedSelect(pool, count) {
    var straight = [];
    var scenario = [];
    for (var i = 0; i < pool.length; i++) {
        if (pool[i].mode === "scenario") scenario.push(pool[i]);
        else straight.push(pool[i]);
    }
    straight = shuffleArray(straight);
    scenario = shuffleArray(scenario);
    var straightCount = Math.round(count * 0.6667);
    var scenarioCount = count - straightCount;
    var result = [];
    for (var i = 0; i < straightCount && i < straight.length; i++) result.push(straight[i]);
    for (var i = 0; i < scenarioCount && i < scenario.length; i++) result.push(scenario[i]);
    var remaining = count - result.length;
    if (remaining > 0) {
        var used = {};
        for (var i = 0; i < result.length; i++) used[result[i].id] = true;
        for (var i = 0; i < pool.length && remaining > 0; i++) {
            if (!used[pool[i].id]) { result.push(pool[i]); remaining--; }
        }
    }
    return shuffleArray(result);
}

function showModeDetail(mode) {
    var panel = document.getElementById("modeDetailPanel");
    var html = "";
    if (mode === "quick") {
        html = '<div class="mode-detail">' +
            '<h4>&#9889; Quick Practice</h4>' +
            '<p class="mode-desc">Fast revision session. Pick a subject or do all.</p>' +
            '<div class="mode-info">' +
            '<div class="mode-info-item"><strong>10</strong> questions</div>' +
            '<div class="mode-info-item"><strong>15 min</strong> time limit</div>' +
            '<div class="mode-info-item">Instant feedback</div>' +
            '</div>' +
            '<div class="mode-subject-select">' +
            '<label>Subject</label>' +
            '<select id="quickSubject">' +
            '<option value="all">All Subjects</option>' +
            '<option value="Computer Science">Computer Science</option>' +
            '<option value="Physics">Physics</option>' +
            '<option value="Chemistry">Chemistry</option>' +
            '<option value="Biology">Biology</option>' +
            '<option value="Mathematics">Mathematics</option>' +
            '</select></div>' +
            '<button class="mode-start-btn" onclick="launchQuickPractice()">Start Practice</button>' +
            '<button class="mode-back-btn" onclick="hideModeDetail()">Back</button>' +
            '</div>';
    } else if (mode === "chapter") {
        var subjectCounts = {};
        for (var i = 0; i < questions.length; i++) {
            var s = questions[i].subject;
            subjectCounts[s] = (subjectCounts[s] || 0) + 1;
        }
        html = '<div class="mode-detail">' +
            '<h4>&#128218; Chapter Test</h4>' +
            '<p class="mode-desc">Assessment covering one full subject. Balanced topic coverage.</p>' +
            '<div class="mode-info">' +
            '<div class="mode-info-item"><strong>30</strong> questions</div>' +
            '<div class="mode-info-item"><strong>40 min</strong> time limit</div>' +
            '<div class="mode-info-item">Score + review</div>' +
            '</div>' +
            '<div class="mode-subject-select">' +
            '<label>Select Subject</label>' +
            '<select id="chapterSubject">';
        for (var s in subjectCounts) {
            html += '<option value="' + s + '">' + s + ' (' + subjectCounts[s] + ' MCQs)</option>';
        }
        html += '</select></div>' +
            '<button class="mode-start-btn" onclick="launchChapterTest()">Start Test</button>' +
            '<button class="mode-back-btn" onclick="hideModeDetail()">Back</button>' +
            '</div>';
    } else if (mode === "fullbook") {
        var total = questions.length;
        html = '<div class="mode-detail">' +
            '<h4>&#127891; Full Book Test</h4>' +
            '<p class="mode-desc">Exam simulation with questions from all subjects.</p>' +
            '<div class="mode-info">' +
            '<div class="mode-info-item"><strong>50</strong> questions</div>' +
            '<div class="mode-info-item"><strong>60 min</strong> time limit</div>' +
            '<div class="mode-info-item"><strong>' + total + '</strong> total MCQs</div>' +
            '</div>' +
            '<button class="mode-start-btn" onclick="launchFullBookTest()">Start Test</button>' +
            '<button class="mode-back-btn" onclick="hideModeDetail()">Back</button>' +
            '</div>';
    } else if (mode === "weak") {
        var weak = getWeakQuestions();
        html = '<div class="mode-detail">' +
            '<h4>&#128200; Weak Areas Practice</h4>' +
            '<p class="mode-desc">Focus on questions you got wrong before.</p>' +
            '<div class="mode-info">' +
            '<div class="mode-info-item"><strong>' + Math.min(10, weak.length) + '</strong> questions</div>' +
            '<div class="mode-info-item"><strong>15 min</strong> time limit</div>' +
            '<div class="mode-info-item"><strong>' + weak.length + '</strong> weak questions found</div>' +
            '</div>';
        if (weak.length === 0) {
            html += '<p style="color:var(--text-light);margin-bottom:16px;">No weak areas yet. Complete some quizzes first!</p>' +
                '<button class="mode-start-btn" disabled>Start Practice</button>';
        } else {
            html += '<button class="mode-start-btn" onclick="launchWeakPractice()">Start Practice</button>';
        }
        html += '<button class="mode-back-btn" onclick="hideModeDetail()">Back</button></div>';
    }
    panel.innerHTML = html;
    panel.style.display = "block";
}

function hideModeDetail() {
    document.getElementById("modeDetailPanel").style.display = "none";
}

function launchQuiz(questions, timeMinutes, mode) {
    activeQuizQuestions = questions;
    shuffledOptionsMap = {};
    for (var i = 0; i < activeQuizQuestions.length; i++) {
        shuffledOptionsMap[activeQuizQuestions[i].id] = shuffleArray(activeQuizQuestions[i].options);
    }
    score = 0; answered = false; currentQuestion = 0; studentAnswers = [];
    quizTimeLimit = timeMinutes * 60;
    document.getElementById("quiz").style.display = "block";
    document.getElementById("result").style.display = "none";
    document.getElementById("review").style.display = "none";
    document.getElementById("homeBtn").style.display = "inline-block";
    document.getElementById("studentPracticeTab").style.display = "none";
    history.pushState({ page: "quiz" }, "", "#quiz");
    startTimer();
    document.getElementById("score").textContent = "Score: " + score;
    displayQuestion();
}

function launchQuickPractice() {
    var f = document.getElementById("quickSubject").value;
    var filtered = [];
    for (var i = 0; i < questions.length; i++) {
        if (f === "all" || questions[i].subject === f) filtered.push(questions[i]);
    }
    if (filtered.length < 5) { alert("Not enough questions. Need at least 5."); return; }
    var selected = shuffleArray(filtered).slice(0, Math.min(10, filtered.length));
    launchQuiz(selected, 15, "quick");
}

function launchChapterTest() {
    var subject = document.getElementById("chapterSubject").value;
    var filtered = [];
    for (var i = 0; i < questions.length; i++) {
        if (questions[i].subject === subject) filtered.push(questions[i]);
    }
    if (filtered.length < 10) { alert("Not enough questions for this subject. Need at least 10."); return; }
    var selected = balancedSelect(filtered, Math.min(30, filtered.length));
    launchQuiz(selected, 40, "chapter");
}

function launchFullBookTest() {
    if (questions.length < 20) { alert("Not enough questions. Need at least 20."); return; }
    var selected = balancedSelect(questions, Math.min(50, questions.length));
    launchQuiz(selected, 60, "fullbook");
}

function launchWeakPractice() {
    var weak = getWeakQuestions();
    if (weak.length === 0) { alert("No weak areas found."); return; }
    var selected = shuffleArray(weak).slice(0, Math.min(10, weak.length));
    launchQuiz(selected, 15, "weak");
}

function startPractice() {
    var el = document.getElementById("practiceSubject");
    var f = el ? el.value : "all";
    var filtered = [];
    for (var i = 0; i < questions.length; i++) {
        if (f === "all" || questions[i].subject === f) filtered.push(questions[i]);
    }
    if (filtered.length === 0) { alert("No questions available for this subject."); return; }
    activeQuizQuestions = shuffleArray(filtered);
    shuffledOptionsMap = {};
    for (var i = 0; i < activeQuizQuestions.length; i++) {
        shuffledOptionsMap[activeQuizQuestions[i].id] = shuffleArray(activeQuizQuestions[i].options);
    }
    score = 0; answered = false; currentQuestion = 0; studentAnswers = [];
    quizTimeLimit = 60;
    document.getElementById("quiz").style.display = "block";
    document.getElementById("result").style.display = "none";
    document.getElementById("review").style.display = "none";
    document.getElementById("homeBtn").style.display = "inline-block";
    document.getElementById("studentPracticeTab").style.display = "none";
    startTimer();
    document.getElementById("score").textContent = "Score: " + score;
    displayQuestion();
}

function startAssignmentQuiz(aid) {
    var a = null;
    for (var i = 0; i < assignments.length; i++) { if (assignments[i].id === aid) { a = assignments[i]; break; } }
    if (!a || a.questions.length === 0) { alert("This assignment has no questions."); return; }
    activeQuizQuestions = [];
    for (var i = 0; i < a.questions.length; i++) {
        for (var j = 0; j < questions.length; j++) {
            if (questions[j].id === a.questions[i]) { activeQuizQuestions.push(questions[j]); break; }
        }
    }
    activeQuizQuestions = shuffleArray(activeQuizQuestions);
    shuffledOptionsMap = {};
    for (var i = 0; i < activeQuizQuestions.length; i++) {
        shuffledOptionsMap[activeQuizQuestions[i].id] = shuffleArray(activeQuizQuestions[i].options);
    }
    if (activeQuizQuestions.length === 0) { alert("Assignment questions not found."); return; }
    score = 0; answered = false; currentQuestion = 0; studentAnswers = [];
    quizTimeLimit = 60;
    document.getElementById("quiz").style.display = "block";
    document.getElementById("result").style.display = "none";
    document.getElementById("review").style.display = "none";
    document.getElementById("homeBtn").style.display = "inline-block";
    document.getElementById("studentAssignmentsTab").style.display = "none";
    startTimer();
    document.getElementById("score").textContent = "Score: " + score;
    document.getElementById("quiz").dataset.assignmentId = aid;
    displayQuestion();
}

function displayQuestion() {
    questionStartTime = Date.now();
    var q = activeQuizQuestions[currentQuestion];
    document.getElementById("questionNumber").textContent = "Question " + (currentQuestion + 1) + " of " + activeQuizQuestions.length;
    document.getElementById("progressBar").style.width = ((currentQuestion + 1) / activeQuizQuestions.length * 100) + "%";
    document.getElementById("question").textContent = q.text || q.question;
    var md = document.getElementById("quizMedia");
    md.innerHTML = "";
    if (q.media) md.innerHTML = '<img src="' + q.media + '" alt="Question image" style="max-width:100%;border-radius:8px;margin-bottom:15px;">';
    if (q.scenario) md.innerHTML += '<div style="background:#f0f4ff;padding:12px;border-radius:8px;margin-bottom:15px;border-left:4px solid var(--primary);"><strong>Scenario:</strong> ' + q.scenario + '</div>';
    var opts = shuffledOptionsMap[q.id] || q.options;
    var labels = ["A", "B", "C", "D"];
    var btns = document.querySelectorAll("#quizOptions .option");
    for (var i = 0; i < btns.length; i++) {
        btns[i].innerHTML = '<span class="opt-label">' + labels[i] + '</span><span class="opt-text">' + opts[i] + '</span>';
        btns[i].className = "option";
        btns[i].onclick = (function(txt) { return function() { checkAnswer(txt); }; })(opts[i]);
    }
    document.getElementById("nextButton").style.display = "none";
    document.getElementById("nextButton").textContent = (currentQuestion === activeQuizQuestions.length - 1) ? "Finish Quiz" : "Next Question";
    document.getElementById("prevButton").style.display = (currentQuestion > 0) ? "inline-block" : "none";
    document.getElementById("skipButton").style.display = (currentQuestion === activeQuizQuestions.length - 1) ? "none" : "inline-block";
    renderPalette();
}

function checkAnswer(sel) {
    if (answered) return;
    answered = true;
    var q = activeQuizQuestions[currentQuestion];
    var answerIndex = "ABCD".indexOf(String(q.answer).toUpperCase());
    var correctAnswerText = "";
    if (answerIndex >= 0 && q.options && q.options[answerIndex]) {
        correctAnswerText = q.options[answerIndex];
    } else {
        correctAnswerText = q.answer;
    }
    var correct = sel === correctAnswerText;
    if (correct) score++;
    studentAnswers.push({
        question: currentQuestion,
        questionId: q.id,
        text: q.text || q.question,
        options: q.options,
        selected: sel,
        answer: q.answer,
        correctAnswerText: correctAnswerText,
        correct: correct,
        timeUsed: Math.round((Date.now() - questionStartTime) / 1000),
        explanation: q.explanation
    });
    document.getElementById("score").textContent = "Score: " + score;
    var btns = document.querySelectorAll("#quizOptions .option");
    for (var i = 0; i < btns.length; i++) {
        btns[i].onclick = null;
        var optText = btns[i].querySelector(".opt-text").textContent;
        if (optText === correctAnswerText) {
            btns[i].classList.add("correct");
        } else if (optText === sel && !correct) {
            btns[i].classList.add("incorrect");
        }
    }
    document.getElementById("nextButton").style.display = "block";
    renderPalette();
}

function nextQuestion() {
    if (currentQuestion === activeQuizQuestions.length - 1) { showResult(); return; }
    currentQuestion++;
    answered = false;
    document.getElementById("nextButton").style.display = "none";
    displayQuestion();
}

function showResult() {
    clearInterval(timer);
    document.getElementById("quiz").style.display = "none";
    document.getElementById("result").style.display = "block";
    document.getElementById("nextButton").style.display = "none";
    history.pushState({ page: "result" }, "", "#result");
    document.getElementById("finalScore").textContent = "Score: " + score + " / " + activeQuizQuestions.length;
    var pct = activeQuizQuestions.length > 0 ? Number(((score / activeQuizQuestions.length) * 100).toFixed(2)) : 0;
    document.getElementById("percentage").textContent = "Percentage: " + pct + "%";
    var timeSpent = quizTimeLimit - timeLeft;
    var tm = Math.floor(timeSpent / 60);
    var ts = timeSpent % 60;
    var timeStr = (tm < 10 ? "0" + tm : tm) + ":" + (ts < 10 ? "0" + ts : ts);
    var timeEl = document.getElementById("timeTaken");
    if (timeEl) timeEl.textContent = "Time: " + timeStr;
    var fb;
    if (pct >= 90) fb = "Excellent! You've mastered this topic!";
    else if (pct >= 70) fb = "Good job! A little more practice will make you stronger.";
    else if (pct >= 50) fb = "Keep practicing. You're getting there!";
    else fb = "Don't give up! Review the topic and try again.";
    document.getElementById("feedback").textContent = fb;
    var attempt = {
        attemptId: "attempt-" + Date.now(),
        timestamp: new Date().toISOString(),
        studentId: currentUser ? currentUser.id : "unknown",
        subject: activeQuizQuestions[0] ? activeQuizQuestions[0].subject : "General",
        grade: activeQuizQuestions[0] ? activeQuizQuestions[0].grade : 9,
        score: score,
        total: activeQuizQuestions.length,
        percentage: pct,
        timeSpent: timeSpent,
        questions: [],
        topicPerformance: {}
    };
    for (var i = 0; i < studentAnswers.length; i++) {
        var sa = studentAnswers[i];
        attempt.questions.push({
            questionId: sa.questionId,
            selectedAnswer: sa.selected,
            correctAnswer: sa.answer,
            correctAnswerText: sa.correctAnswerText || sa.answer,
            correct: sa.correct,
            timeUsed: sa.timeUsed
        });
    }
    for (var i = 0; i < studentAnswers.length; i++) {
        var sa = studentAnswers[i];
        var originalQuestion = null;
        for (var j = 0; j < activeQuizQuestions.length; j++) {
            if (activeQuizQuestions[j].id === sa.questionId) {
                originalQuestion = activeQuizQuestions[j];
                break;
            }
        }
        if (!originalQuestion) continue;
        var topic = originalQuestion.topic || "General";
        if (!attempt.topicPerformance[topic]) attempt.topicPerformance[topic] = { correct: 0, total: 0 };
        attempt.topicPerformance[topic].total++;
        if (sa.correct) attempt.topicPerformance[topic].correct++;
    }
    for (var t in attempt.topicPerformance) {
        var tp = attempt.topicPerformance[t];
        tp.percentage = tp.total > 0 ? Number(((tp.correct / tp.total) * 100).toFixed(2)) : 0;
    }
    allAttempts.push(attempt);
    var uid = currentUser ? currentUser.id : "unknown";
    for (var i = 0; i < studentAnswers.length; i++) {
        var sa = studentAnswers[i];
        var originalQuestion = null;
        for (var j = 0; j < activeQuizQuestions.length; j++) {
            if (activeQuizQuestions[j].id === sa.questionId) {
                originalQuestion = activeQuizQuestions[j];
                break;
            }
        }
        if (!originalQuestion) continue;
        var topic = originalQuestion.topic || "General";
        var key = uid + "_" + topic;
        if (!conceptStats[key]) conceptStats[key] = { correct: 0, total: 0, topic: topic, subject: originalQuestion.subject };
        conceptStats[key].total++;
        if (sa.correct) conceptStats[key].correct++;
    }
    saveAll();
    var tsDiv = document.createElement("div");
    tsDiv.className = "topic-summary";
    var topicNames = Object.keys(attempt.topicPerformance);
    if (topicNames.length > 0) {
        var topicHTML = "<h3>Topic Performance</h3>";
        for (var i = 0; i < topicNames.length; i++) {
            var topic = topicNames[i];
            var tst = attempt.topicPerformance[topic];
            topicHTML += "<p>" + topic + ": <strong>" + tst.correct + "/" + tst.total + "</strong> (" + tst.percentage + "%)</p>";
        }
        tsDiv.innerHTML = topicHTML;
    }
    var rc = document.querySelector(".result-card");
    if (rc) {
        var es = rc.querySelector(".topic-summary");
        if (es) es.remove();
        var feedbackEl = document.getElementById("feedback");
        if (feedbackEl && feedbackEl.nextSibling) {
            rc.insertBefore(tsDiv, feedbackEl.nextSibling);
        } else {
            rc.appendChild(tsDiv);
        }
    }
}

function startTimer() {
    clearInterval(timer);
    document.getElementById("timer").classList.remove("warning");
    timeLeft = quizTimeLimit;
    updateTimerDisplay();
    timer = setInterval(function() {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 300) document.getElementById("timer").classList.add("warning");
        if (timeLeft <= 0) { clearInterval(timer); alert("Time is up! Quiz submitted."); showResult(); }
    }, 1000);
}

function updateTimerDisplay() {
    var m = Math.floor(timeLeft / 60);
    var s = timeLeft % 60;
    var mm = m < 10 ? "0" + m : "" + m;
    var ss = s < 10 ? "0" + s : "" + s;
    document.getElementById("timer").textContent = "Time: " + mm + ":" + ss;
}

function showReview() {
    document.getElementById("result").style.display = "none";
    document.getElementById("review").style.display = "block";
    history.pushState({ page: "review" }, "", "#review");
    var rc = document.getElementById("reviewContent");
    rc.innerHTML = "";
    for (var i = 0; i < studentAnswers.length; i++) {
        var sa = studentAnswers[i];
        var d = document.createElement("div");
        d.className = "review-item";
        var correctAnswer = sa.correctAnswerText || sa.answer || "Not available";
        var resultText = sa.correct ? "Correct" : "Incorrect";
        d.innerHTML =
            "<h3>Question " + (i + 1) + "</h3>" +
            "<p><strong>ID:</strong> " + (sa.questionId || "?") + "</p>" +
            "<p>" + sa.text + "</p>" +
            "<p><strong>Your answer:</strong> " + sa.selected + "</p>" +
            "<p><strong>Correct answer:</strong> " + correctAnswer + "</p>" +
            "<p><strong>Time spent:</strong> " + sa.timeUsed + "s</p>" +
            (sa.explanation ? "<p><strong>Explanation:</strong> " + sa.explanation + "</p>" : "") +
            "<p><strong>" + resultText + "</strong></p>";
        rc.appendChild(d);
    }
}

function backToDashboard() {
    document.getElementById("quiz").style.display = "none";
    document.getElementById("result").style.display = "none";
    document.getElementById("review").style.display = "none";
    var mdp = document.getElementById("modeDetailPanel");
    if (mdp) mdp.style.display = "none";
    clearInterval(timer);
    if (document.getElementById("quiz").dataset.assignmentId) delete document.getElementById("quiz").dataset.assignmentId;
    dashboardsHide();
    if (currentRole === "student") {
        document.getElementById("studentDashboard").style.display = "block";
        showStudentTab("practice");
    } else if (currentRole === "teacher" || currentRole === "classteacher") {
        document.getElementById("teacherDashboard").style.display = "block";
        showTeacherTab("classes");
    } else if (currentRole === "parent") {
        document.getElementById("parentDashboard").style.display = "block";
        showParentTab("progress");
    } else if (currentRole === "principal") {
        document.getElementById("principalDashboard").style.display = "block";
        showPrincipalTab("overview");
    }
    history.pushState({ page: "dashboard" }, "", "#dashboard");
}

function showTeacherTab(tab) {
    var map = { classes: 0, questionbank: 1, assignments: 2, analytics: 3 };
    var ids = ["teacherClassesTab", "teacherQuestionBankTab", "teacherAssignmentsTab", "teacherAnalyticsTab"];
    for (var i = 0; i < ids.length; i++) document.getElementById(ids[i]).style.display = "none";
    activateTab("#teacherDashboard", map[tab]);
    if (tab === "classes") { document.getElementById("teacherClassesTab").style.display = "block"; renderClasses(); }
    else if (tab === "questionbank") { document.getElementById("teacherQuestionBankTab").style.display = "block"; renderQuestions(); }
    else if (tab === "assignments") { document.getElementById("teacherAssignmentsTab").style.display = "block"; renderAssignments(); }
    else if (tab === "analytics") { document.getElementById("teacherAnalyticsTab").style.display = "block"; }
}

function populateTeacherClasses() {
    var sel = document.getElementById("analyticsClassSelect");
    sel.innerHTML = '<option value="">Select a class</option>';
    for (var i = 0; i < classes.length; i++) {
        var o = document.createElement("option");
        o.value = classes[i].id; o.textContent = classes[i].name;
        sel.appendChild(o);
    }
}

function renderClasses() {
    var c = document.getElementById("classesList");
    if (classes.length === 0) { c.innerHTML = "<p>No classes yet.</p>"; return; }
    var h = '<table><thead><tr><th>Class</th><th>Grade</th><th>Section</th><th>Students</th><th>Actions</th></tr></thead><tbody>';
    for (var i = 0; i < classes.length; i++) {
        var cl = classes[i];
        h += '<tr><td>' + cl.name + '</td><td>' + cl.grade + '</td><td>' + cl.section + '</td><td>' + cl.students.length + '</td><td><button onclick="editClass(\'' + cl.id + '\')" class="action-btn">Edit</button> <button onclick="deleteClass(\'' + cl.id + '\')" class="action-btn danger">Delete</button></td></tr>';
    }
    c.innerHTML = h + '</tbody></table>';
}

function editClass(cid) {
    var cl = null;
    for (var i = 0; i < classes.length; i++) { if (classes[i].id === cid) { cl = classes[i]; break; } }
    if (!cl) return;
    document.getElementById("cmClassId").value = cl.id;
    document.getElementById("cmName").value = cl.name;
    document.getElementById("cmGrade").value = cl.grade;
    document.getElementById("cmSection").value = cl.section;
    document.getElementById("cmStudents").value = cl.students.join("\n");
    document.getElementById("classModalTitle").textContent = "Edit Class";
    document.getElementById("classModal").classList.add("active");
    document.getElementById("modalOverlay").classList.add("active");
}

function deleteClass(cid) {
    if (!confirm("Delete this class?")) return;
    classes = classes.filter(function(c) { return c.id !== cid; });
    saveAll(); renderClasses();
}

function showCreateClassModal() {
    document.getElementById("classForm").reset();
    document.getElementById("cmClassId").value = "";
    document.getElementById("classModalTitle").textContent = "Create New Class";
    document.getElementById("classModal").classList.add("active");
    document.getElementById("modalOverlay").classList.add("active");
}

function saveClass(e) {
    e.preventDefault();
    var cid = document.getElementById("cmClassId").value;
    var d = { id: cid || "CLASS-" + document.getElementById("cmName").value.toUpperCase(), name: document.getElementById("cmName").value, grade: parseInt(document.getElementById("cmGrade").value), section: document.getElementById("cmSection").value, students: document.getElementById("cmStudents").value.split("\n").filter(function(l) { return l.trim(); }) };
    if (cid) { for (var i = 0; i < classes.length; i++) { if (classes[i].id === cid) { classes[i] = d; break; } } }
    else classes.push(d);
    saveAll(); closeModal(); renderClasses();
}

function renderQuestions() {
    var c = document.getElementById("questionsTable");
    var st = (document.getElementById("qbSearch").value || "").toLowerCase();
    var fs = document.getElementById("qbFilterSubject").value;
    var fg = document.getElementById("qbFilterGrade").value;
    var f = [];
    for (var i = 0; i < questions.length; i++) {
        var q = questions[i];
        var ok = true;
        if (st && (q.text || q.question || "").toLowerCase().indexOf(st) === -1 && q.id.toLowerCase().indexOf(st) === -1) ok = false;
        if (fs && q.subject !== fs) ok = false;
        if (fg && q.grade !== parseInt(fg)) ok = false;
        if (ok) f.push(q);
    }
    if (f.length === 0) { c.innerHTML = "<p>No questions found.</p>"; return; }
    var h = '<table><thead><tr><th>ID</th><th>Subject</th><th>Grade</th><th>Topic</th><th>Difficulty</th><th>Actions</th></tr></thead><tbody>';
    for (var i = 0; i < f.length; i++) {
        var q = f[i];
        h += '<tr><td>' + q.id + '</td><td>' + q.subject + '</td><td>' + q.grade + '</td><td>' + q.topic + '</td><td>' + q.difficulty + '</td><td><button onclick="editQuestion(\'' + q.id + '\')" class="action-btn">Edit</button> <button onclick="deleteQuestion(\'' + q.id + '\')" class="action-btn danger">Delete</button></td></tr>';
    }
    c.innerHTML = h + '</tbody></table>';
}

function filterQuestions() { renderQuestions(); }

function showAddQuestionModal() {
    document.getElementById("questionForm").reset();
    document.getElementById("qmQuestionId").value = "";
    document.getElementById("qmModalTitle").textContent = "Add Question";
    document.getElementById("questionModal").classList.add("active");
    document.getElementById("modalOverlay").classList.add("active");
}

function editQuestion(qid) {
    var q = null;
    for (var i = 0; i < questions.length; i++) { if (questions[i].id === qid) { q = questions[i]; break; } }
    if (!q) return;
    document.getElementById("qmQuestionId").value = q.id;
    document.getElementById("qmSubject").value = q.subject;
    document.getElementById("qmGrade").value = q.grade;
    document.getElementById("qmChapter").value = q.chapter;
    document.getElementById("qmTopic").value = q.topic;
    document.getElementById("qmDifficulty").value = q.difficulty;
    document.getElementById("qmText").value = q.text || q.question || "";
    document.getElementById("qmExplanation").value = q.explanation || "";
    document.getElementById("qmOptionA").value = q.options[0];
    document.getElementById("qmOptionB").value = q.options[1];
    document.getElementById("qmOptionC").value = q.options[2];
    document.getElementById("qmOptionD").value = q.options[3];
    document.getElementById("qmAnswer").value = q.answer;
    document.getElementById("qmMedia").value = q.media || "";
    document.getElementById("qmModalTitle").textContent = "Edit Question";
    document.getElementById("questionModal").classList.add("active");
    document.getElementById("modalOverlay").classList.add("active");
}

function deleteQuestion(qid) {
    if (!confirm("Delete this question?")) return;
    questions = questions.filter(function(q) { return q.id !== qid; });
    saveAll(); renderQuestions();
}

function saveQuestion(e) {
    e.preventDefault();
    var id = document.getElementById("qmQuestionId").value;
    var d = { id: id || "Q-" + Date.now(), subject: document.getElementById("qmSubject").value, grade: parseInt(document.getElementById("qmGrade").value), chapter: document.getElementById("qmChapter").value, topic: document.getElementById("qmTopic").value, type: "mcq", text: document.getElementById("qmText").value, options: [document.getElementById("qmOptionA").value, document.getElementById("qmOptionB").value, document.getElementById("qmOptionC").value, document.getElementById("qmOptionD").value], answer: document.getElementById("qmAnswer").value, explanation: document.getElementById("qmExplanation").value, difficulty: document.getElementById("qmDifficulty").value, media: document.getElementById("qmMedia").value || null };
    if (id) { for (var i = 0; i < questions.length; i++) { if (questions[i].id === id) { questions[i] = d; break; } } }
    else questions.push(d);
    saveAll(); closeModal(); renderQuestions();
}

function renderAssignments() {
    var c = document.getElementById("assignmentsList");
    if (assignments.length === 0) { c.innerHTML = "<p>No assignments yet.</p>"; return; }
    var h = '<table><thead><tr><th>Title</th><th>Subject</th><th>Class</th><th>Due Date</th><th>Questions</th><th>Actions</th></tr></thead><tbody>';
    for (var i = 0; i < assignments.length; i++) {
        var a = assignments[i], cl = null;
        for (var j = 0; j < classes.length; j++) { if (classes[j].id === a.classId) { cl = classes[j]; break; } }
        h += '<tr><td>' + a.title + '</td><td>' + a.subject + '</td><td>' + (cl ? cl.name : "N/A") + '</td><td>' + a.dueDate + '</td><td>' + a.questions.length + '</td><td><button onclick="editAssignment(\'' + a.id + '\')" class="action-btn">Edit</button> <button onclick="deleteAssignment(\'' + a.id + '\')" class="action-btn danger">Delete</button></td></tr>';
    }
    c.innerHTML = h + '</tbody></table>';
}

function showCreateAssignmentModal() {
    document.getElementById("assignmentForm").reset();
    document.getElementById("amAssignmentId").value = "";
    document.getElementById("amModalTitle").textContent = "Create Assignment";
    var cs = document.getElementById("amClass");
    cs.innerHTML = '<option value="">Select a class</option>';
    for (var i = 0; i < classes.length; i++) {
        var o = document.createElement("option");
        o.value = classes[i].id; o.textContent = classes[i].name;
        cs.appendChild(o);
    }
    updateAssignmentQuestionList();
    document.getElementById("assignmentModal").classList.add("active");
    document.getElementById("modalOverlay").classList.add("active");
}

function updateAssignmentQuestionList() {
    var c = document.getElementById("amQuestionSelector");
    var st = (document.getElementById("amQSearch").value || "").toLowerCase();
    var sub = document.getElementById("amSubject").value;
    var f = [];
    for (var i = 0; i < questions.length; i++) {
        var q = questions[i];
        var qtxt = (q.text || q.question || "").toLowerCase();
        if (q.subject === sub && (!st || qtxt.indexOf(st) !== -1 || q.id.toLowerCase().indexOf(st) !== -1)) f.push(q);
    }
    if (f.length === 0) { c.innerHTML = "<p>No questions found for this subject.</p>"; return; }
    var h = '<div class="question-select-list">';
    for (var i = 0; i < f.length; i++) {
        var txt = (f[i].text || f[i].question || "").substring(0, 60);
        h += '<label class="question-select-item"><input type="checkbox" class="am-q-checkbox" value="' + f[i].id + '"> <strong>' + f[i].id + '</strong> - ' + txt + '... (' + f[i].difficulty + ')</label>';
    }
    c.innerHTML = h + '</div>';
}

function editAssignment(aid) {
    var a = null;
    for (var i = 0; i < assignments.length; i++) { if (assignments[i].id === aid) { a = assignments[i]; break; } }
    if (!a) return;
    document.getElementById("amAssignmentId").value = a.id;
    document.getElementById("amTitleInput").value = a.title;
    document.getElementById("amSubject").value = a.subject;
    document.getElementById("amClass").value = a.classId;
    document.getElementById("amDueDate").value = a.dueDate;
    document.getElementById("amModalTitle").textContent = "Edit Assignment";
    var cs = document.getElementById("amClass");
    cs.innerHTML = '<option value="">Select a class</option>';
    for (var i = 0; i < classes.length; i++) {
        var o = document.createElement("option");
        o.value = classes[i].id; o.textContent = classes[i].name;
        cs.appendChild(o);
    }
    cs.value = a.classId;
    updateAssignmentQuestionList();
    for (var i = 0; i < a.questions.length; i++) {
        var cbs = document.querySelectorAll('.am-q-checkbox');
        for (var j = 0; j < cbs.length; j++) { if (cbs[j].value === a.questions[i]) cbs[j].checked = true; }
    }
    document.getElementById("assignmentModal").classList.add("active");
    document.getElementById("modalOverlay").classList.add("active");
}

function deleteAssignment(aid) {
    if (!confirm("Delete this assignment?")) return;
    assignments = assignments.filter(function(a) { return a.id !== aid; });
    saveAll(); renderAssignments();
}

function saveAssignment(e) {
    e.preventDefault();
    var id = document.getElementById("amAssignmentId").value;
    var sel = [];
    var cbs = document.querySelectorAll(".am-q-checkbox:checked");
    for (var i = 0; i < cbs.length; i++) sel.push(cbs[i].value);
    if (sel.length === 0) { alert("Please select at least one question."); return; }
    var d = { id: id || "ASSIGN-" + Date.now(), title: document.getElementById("amTitleInput").value, subject: document.getElementById("amSubject").value, classId: document.getElementById("amClass").value, dueDate: document.getElementById("amDueDate").value, questions: sel, createdBy: currentUser ? currentUser.id : "unknown", createdAt: new Date().toISOString() };
    if (id) { for (var i = 0; i < assignments.length; i++) { if (assignments[i].id === id) { assignments[i] = d; break; } } }
    else assignments.push(d);
    saveAll(); closeModal(); renderAssignments();
}

function loadClassAnalytics() {
    var cid = document.getElementById("analyticsClassSelect").value;
    var c = document.getElementById("classAnalyticsContent");
    if (!cid) { c.innerHTML = "<p>Select a class to view analytics.</p>"; return; }
    var cl = null;
    for (var i = 0; i < classes.length; i++) { if (classes[i].id === cid) { cl = classes[i]; break; } }
    if (!cl) return;
    var ca = [];
    for (var i = 0; i < allAttempts.length; i++) {
        if (cl.students.indexOf(allAttempts[i].studentId) !== -1) ca.push(allAttempts[i]);
    }
    if (ca.length === 0) { c.innerHTML = "<p>No quiz attempts for this class yet.</p>"; return; }
    var avg = 0;
    for (var i = 0; i < ca.length; i++) avg += ca[i].percentage;
    avg = avg / ca.length;
    var h = '<div class="analytics-grid"><div class="analytics-card"><h4>Class Statistics</h4><p>Total Attempts: <strong>' + ca.length + '</strong></p><p>Average Score: <strong>' + avg.toFixed(1) + '%</strong></p><p>Students: <strong>' + cl.students.length + '</strong></p></div>';
    var ss = {};
    for (var i = 0; i < ca.length; i++) {
        var s = ca[i].subject;
        if (!ss[s]) ss[s] = { n: 0, sum: 0 };
        ss[s].n++; ss[s].sum += ca[i].percentage;
    }
    h += '<div class="analytics-card"><h4>Subject Breakdown</h4>';
    for (var s in ss) h += '<p>' + s + ': <strong>' + (ss[s].sum / ss[s].n).toFixed(1) + '%</strong></p>';
    h += '</div></div>';
    c.innerHTML = h;
}

function showCTTab(tab) {
    var map = { overview: 0, students: 1, "cross-subject": 2, attendance: 3 };
    var ids = ["ctOverviewTab", "ctStudentsTab", "ctCrossSubjectTab", "ctAttendanceTab"];
    for (var i = 0; i < ids.length; i++) document.getElementById(ids[i]).style.display = "none";
    activateTab("#classTeacherDashboard", map[tab]);
    if (tab === "overview") { document.getElementById("ctOverviewTab").style.display = "block"; renderCTOverview(); }
    else if (tab === "students") { document.getElementById("ctStudentsTab").style.display = "block"; renderCTStudents(); }
    else if (tab === "cross-subject") { document.getElementById("ctCrossSubjectTab").style.display = "block"; renderCTCrossSubject(); }
    else if (tab === "attendance") { document.getElementById("ctAttendanceTab").style.display = "block"; renderCTAttendance(); }
}

function renderCTOverview() {
    var c = document.getElementById("ctOverviewContent");
    var ts = 0;
    for (var i = 0; i < classes.length; i++) ts += classes[i].students.length;
    var avg = allAttempts.length > 0 ? allAttempts.reduce(function(s, a) { return s + a.percentage; }, 0) / allAttempts.length : 0;
    c.innerHTML = '<div class="analytics-card"><h4>Class Overview</h4><p>Classes: <strong>' + classes.length + '</strong></p><p>Students: <strong>' + ts + '</strong></p><p>Questions: <strong>' + questions.length + '</strong></p><p>Average: <strong>' + avg.toFixed(1) + '%</strong></p></div>';
}

function renderCTStudents() {
    var c = document.getElementById("ctStudentsList");
    var h = '<table><thead><tr><th>Student</th><th>Class</th><th>Attempts</th><th>Average</th></tr></thead><tbody>';
    for (var i = 0; i < classes.length; i++) {
        for (var j = 0; j < classes[i].students.length; j++) {
            var sid = classes[i].students[j], sa = [];
            for (var k = 0; k < allAttempts.length; k++) { if (allAttempts[k].studentId === sid) sa.push(allAttempts[k]); }
            var avg = sa.length > 0 ? sa.reduce(function(s, a) { return s + a.percentage; }, 0) / sa.length : 0;
            h += '<tr><td>' + sid + '</td><td>' + classes[i].name + '</td><td>' + sa.length + '</td><td>' + avg.toFixed(1) + '%</td></tr>';
        }
    }
    c.innerHTML = h + '</tbody></table>';
}

function renderCTCrossSubject() {
    var c = document.getElementById("ctCrossSubjectContent");
    var ss = {};
    for (var i = 0; i < allAttempts.length; i++) {
        var s = allAttempts[i].subject;
        if (!ss[s]) ss[s] = { n: 0, sum: 0 };
        ss[s].n++; ss[s].sum += allAttempts[i].percentage;
    }
    if (Object.keys(ss).length === 0) { c.innerHTML = "<p>No data yet.</p>"; return; }
    var h = '<div class="analytics-grid">';
    for (var s in ss) h += '<div class="analytics-card"><h4>' + s + '</h4><p>Average: <strong>' + (ss[s].sum / ss[s].n).toFixed(1) + '%</strong></p><p>Attempts: <strong>' + ss[s].n + '</strong></p></div>';
    c.innerHTML = h + '</div>';
}

function renderCTAttendance() {
    var c = document.getElementById("ctAttendanceContent");
    c.innerHTML = '<p>Select a date and click "Mark Attendance" to record attendance.</p>';
}

function markAttendance() {
    var dl = document.getElementById("attDate");
    dl.value = new Date().toISOString().split("T")[0];
    var lc = document.getElementById("attendanceStudentList");
    var h = "";
    for (var i = 0; i < classes.length; i++) {
        for (var j = 0; j < classes[i].students.length; j++) {
            h += '<label class="attendance-item"><span>' + classes[i].students[j] + ' (' + classes[i].name + ')</span><select class="att-status" data-student="' + classes[i].students[j] + '"><option value="present">Present</option><option value="absent">Absent</option><option value="late">Late</option></select></label>';
        }
    }
    lc.innerHTML = h;
    document.getElementById("attendanceModal").classList.add("active");
    document.getElementById("modalOverlay").classList.add("active");
}

function saveAttendance(e) {
    e.preventDefault();
    var date = document.getElementById("attDate").value;
    var rec = {};
    var sels = document.querySelectorAll(".att-status");
    for (var i = 0; i < sels.length; i++) rec[sels[i].dataset.student] = sels[i].value;
    var found = false;
    for (var i = 0; i < attendance.length; i++) { if (attendance[i].date === date) { attendance[i].records = rec; found = true; break; } }
    if (!found) attendance.push({ date: date, records: rec });
    saveAll(); closeModal(); renderCTAttendance();
}

function showParentTab(tab) {
    var map = { progress: 0, assignments: 1, results: 2, attendance: 3 };
    var ids = ["parentProgressTab", "parentAssignmentsTab", "parentResultsTab", "parentAttendanceTab"];
    for (var i = 0; i < ids.length; i++) document.getElementById(ids[i]).style.display = "none";
    activateTab("#parentDashboard", map[tab]);
    if (tab === "progress") { document.getElementById("parentProgressTab").style.display = "block"; renderParentProgress(); }
    else if (tab === "assignments") { document.getElementById("parentAssignmentsTab").style.display = "block"; renderParentAssignments(); }
    else if (tab === "results") { document.getElementById("parentResultsTab").style.display = "block"; renderParentResults(); }
    else if (tab === "attendance") { document.getElementById("parentAttendanceTab").style.display = "block"; renderParentAttendance(); }
}

function renderParentProgress() {
    var c = document.getElementById("parentProgressContent");
    var my = [];
    for (var i = 0; i < allAttempts.length; i++) { if (allAttempts[i].studentId === currentUser.childId) my.push(allAttempts[i]); }
    if (my.length === 0) { c.innerHTML = '<div class="empty-state"><h4>No progress data yet</h4><p>Your child hasn\'t completed any quizzes yet.</p></div>'; return; }
    var avg = 0, best = 0, totalQ = 0;
    for (var i = 0; i < my.length; i++) { avg += my[i].percentage; if (my[i].percentage > best) best = my[i].percentage; totalQ += my[i].total; }
    avg = avg / my.length;
    var h = '<div class="analytics-grid">' +
        '<div class="analytics-card"><h4>Total Quizzes</h4><div class="analytics-value">' + my.length + '</div></div>' +
        '<div class="analytics-card"><h4>Average Score</h4><div class="analytics-value">' + avg.toFixed(0) + '%</div></div>' +
        '<div class="analytics-card"><h4>Best Score</h4><div class="analytics-value">' + best.toFixed(0) + '%</div></div>' +
        '<div class="analytics-card"><h4>Questions Done</h4><div class="analytics-value">' + totalQ + '</div></div>' +
        '</div>';
    var subs = {};
    for (var i = 0; i < my.length; i++) {
        var s = my[i].subject;
        if (!subs[s]) subs[s] = { n: 0, sum: 0 };
        subs[s].n++; subs[s].sum += my[i].percentage;
    }
    h += '<div class="panel-card"><h3>&#128202; Performance by Subject</h3>';
    for (var s in subs) {
        var pct = Math.round(subs[s].sum / subs[s].n);
        var cls = pct >= 70 ? "good" : pct >= 50 ? "avg" : "bad";
        h += renderBar(s, pct, cls);
    }
    h += '</div>';
    var topics = {};
    for (var i = 0; i < my.length; i++) {
        var tp = my[i].topicPerformance || {};
        for (var t in tp) {
            if (!topics[t]) topics[t] = { correct: 0, total: 0 };
            topics[t].correct += tp[t].correct;
            topics[t].total += tp[t].total;
        }
    }
    if (Object.keys(topics).length > 0) {
        h += '<div class="panel-card"><h3>&#128200; Performance by Topic</h3>';
        var sorted = [];
        for (var t in topics) sorted.push({ name: t, pct: Math.round(topics[t].correct / topics[t].total * 100), correct: topics[t].correct, total: topics[t].total });
        sorted.sort(function(a, b) { return b.pct - a.pct; });
        for (var i = 0; i < sorted.length; i++) {
            var cls = sorted[i].pct >= 70 ? "good" : sorted[i].pct >= 50 ? "avg" : "bad";
            h += renderBar(sorted[i].name + " (" + sorted[i].correct + "/" + sorted[i].total + ")", sorted[i].pct, cls);
        }
        h += '</div>';
    }
    var childId = currentUser.childId;
    var concepts = [];
    for (var key in conceptStats) {
        if (key.indexOf(childId + "_") === 0) {
            var cs = conceptStats[key];
            concepts.push({ name: cs.topic, subject: cs.subject, pct: Math.round(cs.correct / cs.total * 100), correct: cs.correct, total: cs.total });
        }
    }
    if (concepts.length > 0) {
        concepts.sort(function(a, b) { return a.pct - b.pct; });
        var strong = [];
        var weak = [];
        for (var i = 0; i < concepts.length; i++) {
            if (concepts[i].pct >= 70) strong.push(concepts[i]);
            else if (concepts[i].total >= 2 && concepts[i].pct < 60) weak.push(concepts[i]);
        }
        if (weak.length > 0) {
            h += '<div class="panel-card" style="border-left:4px solid var(--error);"><h3>&#9888; Weak Areas (Focus Here)</h3>';
            for (var i = 0; i < Math.min(5, weak.length); i++) {
                h += renderBar(weak[i].name + " — " + weak[i].subject, weak[i].pct, "bad");
            }
            h += '</div>';
        }
        if (strong.length > 0) {
            h += '<div class="panel-card" style="border-left:4px solid var(--success);"><h3>&#9989; Strong Areas (Mastered)</h3>';
            for (var i = 0; i < Math.min(5, strong.length); i++) {
                h += renderBar(strong[i].name + " — " + strong[i].subject, strong[i].pct, "good");
            }
            h += '</div>';
        }
    }
    h += '<div class="panel-card"><h3>&#128197; Recent Attempts</h3>';
    h += '<table class="history-table"><thead><tr><th>Date</th><th>Subject</th><th>Score</th><th>%</th></tr></thead><tbody>';
    for (var i = my.length - 1; i >= Math.max(0, my.length - 10); i--) {
        var d = new Date(my[i].timestamp);
        h += '<tr><td>' + d.toLocaleDateString() + '</td><td>' + my[i].subject + '</td><td>' + my[i].score + '/' + my[i].total + '</td><td><strong>' + my[i].percentage + '%</strong></td></tr>';
    }
    h += '</tbody></table></div>';
    c.innerHTML = h;
}

function renderParentAssignments() {
    var c = document.getElementById("parentAssignmentsContent");
    var sc = null;
    for (var i = 0; i < classes.length; i++) { if (classes[i].students.indexOf(currentUser.childId) !== -1) { sc = classes[i]; break; } }
    if (!sc) { c.innerHTML = "<p>No class info found.</p>"; return; }
    var my = [];
    for (var i = 0; i < assignments.length; i++) { if (assignments[i].classId === sc.id) my.push(assignments[i]); }
    if (my.length === 0) { c.innerHTML = "<p>No assignments yet.</p>"; return; }
    var h = '<table><thead><tr><th>Title</th><th>Subject</th><th>Due Date</th><th>Questions</th></tr></thead><tbody>';
    for (var i = 0; i < my.length; i++) {
        var od = new Date(my[i].dueDate) < new Date();
        h += '<tr><td>' + my[i].title + '</td><td>' + my[i].subject + '</td><td>' + my[i].dueDate + (od ? ' <span class="badge badge-hard">Overdue</span>' : '') + '</td><td>' + my[i].questions.length + '</td></tr>';
    }
    c.innerHTML = h + '</tbody></table>';
}

function renderParentResults() {
    var c = document.getElementById("parentResultsContent");
    var my = [];
    for (var i = 0; i < allAttempts.length; i++) { if (allAttempts[i].studentId === currentUser.childId) my.push(allAttempts[i]); }
    if (my.length === 0) { c.innerHTML = "<p>No results yet.</p>"; return; }
    my.sort(function(a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });
    var h = '<table><thead><tr><th>Date</th><th>Subject</th><th>Score</th><th>Percentage</th></tr></thead><tbody>';
    for (var i = 0; i < my.length; i++) {
        h += '<tr><td>' + new Date(my[i].timestamp).toLocaleDateString() + '</td><td>' + my[i].subject + '</td><td>' + my[i].score + '/' + my[i].total + '</td><td>' + my[i].percentage + '%</td></tr>';
    }
    c.innerHTML = h + '</tbody></table>';
}

function renderParentAttendance() {
    var c = document.getElementById("parentAttendanceContent");
    var cid = currentUser.childId;
    var rec = [];
    for (var i = 0; i < attendance.length; i++) {
        if (attendance[i].records[cid]) rec.push({ date: attendance[i].date, status: attendance[i].records[cid] });
    }
    if (rec.length === 0) { c.innerHTML = "<p>No attendance records.</p>"; return; }
    rec.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    var pr = 0, ab = 0, lt = 0;
    for (var i = 0; i < rec.length; i++) { if (rec[i].status === "present") pr++; else if (rec[i].status === "absent") ab++; else lt++; }
    var h = '<div class="analytics-card"><h4>Attendance Summary</h4><p>Present: <strong>' + pr + '</strong></p><p>Absent: <strong>' + ab + '</strong></p><p>Late: <strong>' + lt + '</strong></p><p>Rate: <strong>' + (rec.length > 0 ? (pr / rec.length * 100).toFixed(1) : 0) + '%</strong></p></div>';
    h += '<table><thead><tr><th>Date</th><th>Status</th></tr></thead><tbody>';
    for (var i = 0; i < rec.length; i++) {
        var sc = rec[i].status === "present" ? "badge-easy" : rec[i].status === "late" ? "badge-medium" : "badge-hard";
        h += '<tr><td>' + rec[i].date + '</td><td><span class="badge ' + sc + '">' + rec[i].status + '</span></td></tr>';
    }
    c.innerHTML = h + '</tbody></table>';
}

function showPrincipalTab(tab) {
    var map = { school: 0, classes: 1, teachers: 2, students: 3, analytics: 4 };
    var ids = ["principalSchoolTab", "principalClassesTab", "principalTeachersTab", "principalStudentsTab", "principalAnalyticsTab"];
    for (var i = 0; i < ids.length; i++) document.getElementById(ids[i]).style.display = "none";
    activateTab("#principalDashboard", map[tab]);
    if (tab === "school") { document.getElementById("principalSchoolTab").style.display = "block"; renderPrincipalSchool(); }
    else if (tab === "classes") { document.getElementById("principalClassesTab").style.display = "block"; renderPrincipalClasses(); }
    else if (tab === "teachers") { document.getElementById("principalTeachersTab").style.display = "block"; renderPrincipalTeachers(); }
    else if (tab === "students") { document.getElementById("principalStudentsTab").style.display = "block"; renderPrincipalStudents(); }
    else if (tab === "analytics") { document.getElementById("principalAnalyticsTab").style.display = "block"; renderPrincipalAnalytics(); }
}

function renderPrincipalSchool() {
    var c = document.getElementById("principalSchoolContent");
    var ts = 0;
    for (var i = 0; i < classes.length; i++) ts += classes[i].students.length;
    var avg = allAttempts.length > 0 ? allAttempts.reduce(function(s, a) { return s + a.percentage; }, 0) / allAttempts.length : 0;
    var h = '<div class="analytics-grid"><div class="analytics-card"><h4>School Overview</h4><p>Classes: <strong>' + classes.length + '</strong></p><p>Students: <strong>' + ts + '</strong></p><p>Questions: <strong>' + questions.length + '</strong></p><p>Quizzes Taken: <strong>' + allAttempts.length + '</strong></p><p>Average: <strong>' + avg.toFixed(1) + '%</strong></p></div></div>';
    c.innerHTML = h;
}

function renderPrincipalClasses() {
    var c = document.getElementById("principalClassesContent");
    var h = '<table><thead><tr><th>Class</th><th>Grade</th><th>Section</th><th>Students</th></tr></thead><tbody>';
    for (var i = 0; i < classes.length; i++) {
        h += '<tr><td>' + classes[i].name + '</td><td>' + classes[i].grade + '</td><td>' + classes[i].section + '</td><td>' + classes[i].students.length + '</td></tr>';
    }
    c.innerHTML = h + '</tbody></table>';
}

function renderPrincipalTeachers() {
    var c = document.getElementById("principalTeachersContent");
    if (teachers.length === 0) { c.innerHTML = "<p>No teachers added yet.</p>"; return; }
    var h = '<table><thead><tr><th>ID</th><th>Name</th><th>Subject</th><th>Actions</th></tr></thead><tbody>';
    for (var i = 0; i < teachers.length; i++) {
        h += '<tr><td>' + teachers[i].id + '</td><td>' + teachers[i].name + '</td><td>' + teachers[i].subject + '</td><td><button onclick="editTeacher(\'' + teachers[i].id + '\')" class="action-btn">Edit</button> <button onclick="deleteTeacher(\'' + teachers[i].id + '\')" class="action-btn danger">Delete</button></td></tr>';
    }
    c.innerHTML = h + '</tbody></table>';
}

function showAddTeacherModal() {
    document.getElementById("teacherForm").reset();
    document.getElementById("tmTeacherId").value = "";
    document.getElementById("teacherModalTitle").textContent = "Add Teacher";
    document.getElementById("teacherModal").classList.add("active");
    document.getElementById("modalOverlay").classList.add("active");
}

function editTeacher(tid) {
    var t = null;
    for (var i = 0; i < teachers.length; i++) { if (teachers[i].id === tid) { t = teachers[i]; break; } }
    if (!t) return;
    document.getElementById("tmTeacherId").value = t.id;
    document.getElementById("tmId").value = t.id;
    document.getElementById("tmName").value = t.name;
    document.getElementById("tmSubject").value = t.subject;
    document.getElementById("teacherModalTitle").textContent = "Edit Teacher";
    document.getElementById("teacherModal").classList.add("active");
    document.getElementById("modalOverlay").classList.add("active");
}

function deleteTeacher(tid) {
    if (!confirm("Delete this teacher?")) return;
    teachers = teachers.filter(function(t) { return t.id !== tid; });
    saveAll(); renderPrincipalTeachers();
}

function saveTeacher(e) {
    e.preventDefault();
    var id = document.getElementById("tmTeacherId").value;
    var d = { id: document.getElementById("tmId").value, name: document.getElementById("tmName").value, subject: document.getElementById("tmSubject").value };
    if (id) { for (var i = 0; i < teachers.length; i++) { if (teachers[i].id === id) { teachers[i] = d; break; } } }
    else teachers.push(d);
    saveAll(); closeModal(); renderPrincipalTeachers();
}

function renderPrincipalStudents() {
    var c = document.getElementById("principalStudentsContent");
    if (studentAccounts.length === 0) { c.innerHTML = "<p>No students yet. Click 'Add Student' to create accounts.</p>"; return; }
    var h = '<table><thead><tr><th>ID</th><th>Name</th><th>Class</th><th>Grade</th><th>Password</th><th>Actions</th></tr></thead><tbody>';
    for (var i = 0; i < studentAccounts.length; i++) {
        var s = studentAccounts[i];
        var className = "N/A";
        for (var j = 0; j < classes.length; j++) {
            if (classes[j].id === s.classId) { className = classes[j].name; break; }
        }
        h += '<tr><td>' + s.id + '</td><td>' + s.name + '</td><td>' + className + '</td><td>' + s.grade + '</td><td>' + s.password + '</td>' +
            '<td><button onclick="editStudentAccount(\'' + s.id + '\')" class="action-btn">Edit</button> ' +
            '<button onclick="deleteStudentAccount(\'' + s.id + '\')" class="action-btn danger">Delete</button></td></tr>';
    }
    c.innerHTML = h + '</tbody></table>';
}

function showCreateStudentModal() {
    document.getElementById("studentForm").reset();
    document.getElementById("smStudentId").value = "";
    document.getElementById("studentModalTitle").textContent = "\uD83D\uDC64 Add Student";
    var sel = document.getElementById("smClassId");
    sel.innerHTML = "";
    for (var i = 0; i < classes.length; i++) {
        sel.innerHTML += '<option value="' + classes[i].id + '">' + classes[i].name + ' (Grade ' + classes[i].grade + ')</option>';
    }
    document.getElementById("studentModal").classList.add("active");
    document.getElementById("modalOverlay").classList.add("active");
}

function editStudentAccount(sid) {
    var s = null;
    for (var i = 0; i < studentAccounts.length; i++) {
        if (studentAccounts[i].id === sid) { s = studentAccounts[i]; break; }
    }
    if (!s) return;
    document.getElementById("smStudentId").value = s.id;
    document.getElementById("smId").value = s.id;
    document.getElementById("smId").disabled = true;
    document.getElementById("smName").value = s.name;
    document.getElementById("smGrade").value = s.grade;
    document.getElementById("smPassword").value = s.password;
    document.getElementById("studentModalTitle").textContent = "\uD83D\uDC64 Edit Student";
    var sel = document.getElementById("smClassId");
    sel.innerHTML = "";
    for (var i = 0; i < classes.length; i++) {
        var selected = classes[i].id === s.classId ? " selected" : "";
        sel.innerHTML += '<option value="' + classes[i].id + '"' + selected + '>' + classes[i].name + ' (Grade ' + classes[i].grade + ')</option>';
    }
    document.getElementById("studentModal").classList.add("active");
    document.getElementById("modalOverlay").classList.add("active");
}

function saveStudentAccount(e) {
    e.preventDefault();
    var editId = document.getElementById("smStudentId").value;
    var id = document.getElementById("smId").value.trim();
    var name = document.getElementById("smName").value.trim();
    var classId = document.getElementById("smClassId").value;
    var grade = parseInt(document.getElementById("smGrade").value);
    var password = document.getElementById("smPassword").value || "123";
    if (!id || !name) { alert("Please fill in Student ID and Name."); return; }
    if (editId) {
        for (var i = 0; i < studentAccounts.length; i++) {
            if (studentAccounts[i].id === editId) {
                studentAccounts[i].name = name;
                studentAccounts[i].classId = classId;
                studentAccounts[i].grade = grade;
                studentAccounts[i].password = password;
                break;
            }
        }
    } else {
        for (var i = 0; i < studentAccounts.length; i++) {
            if (studentAccounts[i].id === id) { alert("Student ID already exists!"); return; }
        }
        studentAccounts.push({ id: id, name: name, classId: classId, grade: grade, password: password, forcePasswordChange: true });
    }
    saveAll();
    closeModal();
    renderPrincipalStudents();
    document.getElementById("smId").disabled = false;
}

function deleteStudentAccount(sid) {
    if (!confirm("Delete student account " + sid + "?")) return;
    for (var i = 0; i < studentAccounts.length; i++) {
        if (studentAccounts[i].id === sid) { studentAccounts.splice(i, 1); break; }
    }
    saveAll();
    renderPrincipalStudents();
}

function renderPrincipalAnalytics() {
    var c = document.getElementById("principalAnalyticsContent");
    var avg = allAttempts.length > 0 ? allAttempts.reduce(function(s, a) { return s + a.percentage; }, 0) / allAttempts.length : 0;
    var ts = 0;
    for (var i = 0; i < classes.length; i++) ts += classes[i].students.length;
    c.innerHTML = '<div class="analytics-grid"><div class="analytics-card"><h4>School Analytics</h4><p>Attempts: <strong>' + allAttempts.length + '</strong></p><p>Average: <strong>' + avg.toFixed(1) + '%</strong></p><p>Students: <strong>' + ts + '</strong></p><p>Questions: <strong>' + questions.length + '</strong></p></div></div>';
}

var pendingImportData = [];

function showExcelImportModal() {
    document.getElementById("excelForm").reset();
    document.getElementById("importResult").style.display = "none";
    document.getElementById("importPreview").style.display = "none";
    document.getElementById("excelModal").classList.add("active");
    document.getElementById("modalOverlay").classList.add("active");
}

function importExcel(e) {
    e.preventDefault();
    var file = document.getElementById("excelFile").files[0];
    if (!file) return;
    if (typeof XLSX === "undefined") { alert("SheetJS library not loaded. Please refresh the page."); return; }
    var reader = new FileReader();
    reader.onload = function(ev) {
        var data = new Uint8Array(ev.target.result);
        var workbook = XLSX.read(data, { type: "array" });
        var sheetName = workbook.SheetNames[0];
        var sheet = workbook.Sheets[sheetName];
        var rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        if (rows.length === 0) { alert("File is empty or has no data rows."); return; }
        pendingImportData = [];
        var errors = [];
        var valid = 0;
        for (var i = 0; i < rows.length; i++) {
            var r = rows[i];
            var row = i + 2;
            var id = (r.id || "").toString().trim();
            var question = (r.question || r.text || "").toString().trim();
            var answer = (r.answer || "").toString().trim();
            if (!id) { errors.push("Row " + row + ": Missing ID"); continue; }
            if (!question) { errors.push("Row " + row + ": Missing question text"); continue; }
            if (!answer) { errors.push("Row " + row + ": Missing answer"); continue; }
            var dup = false;
            for (var j = 0; j < questions.length; j++) { if (questions[j].id === id) { dup = true; break; } }
            if (dup) { errors.push("Row " + row + ": Duplicate ID '" + id + "'"); continue; }
            var optA = (r.optionA || r.option_a || r.A || "").toString().trim();
            var optB = (r.optionB || r.option_b || r.B || "").toString().trim();
            var optC = (r.optionC || r.option_c || r.C || "").toString().trim();
            var optD = (r.optionD || r.option_d || r.D || "").toString().trim();
            var qObj = {
                id: id,
                chapter: parseInt(r.chapter) || 1,
                topic: (r.topic || "General").toString().trim(),
                type: (r.type || "mcq").toString().trim().toLowerCase(),
                mode: (r.mode || "straight").toString().trim().toLowerCase(),
                difficulty: (r.difficulty || "medium").toString().trim().toLowerCase(),
                question: question,
                options: [optA, optB, optC, optD],
                answer: answer.toUpperCase(),
                explanation: (r.explanation || "").toString().trim(),
                bloom: (r.bloom || "Remembering").toString().trim(),
                source: (r.source || "Excel Import").toString().trim()
            };
            pendingImportData.push(qObj);
            valid++;
        }
        var previewDiv = document.getElementById("importPreview");
        var resultDiv = document.getElementById("importResult");
        previewDiv.style.display = "block";
        resultDiv.style.display = "none";
        var html = '<table class="history-table"><thead><tr><th>ID</th><th>Topic</th><th>Q (first 50 chars)</th><th>Answer</th><th>Difficulty</th></tr></thead><tbody>';
        var show = Math.min(5, pendingImportData.length);
        for (var i = 0; i < show; i++) {
            var q = pendingImportData[i];
            html += '<tr><td>' + q.id + '</td><td>' + q.topic + '</td><td>' + q.question.substring(0, 50) + '...</td><td>' + q.answer + '</td><td>' + q.difficulty + '</td></tr>';
        }
        html += '</tbody></table>';
        document.getElementById("importPreviewTable").innerHTML = html;
        var statsHtml = '<p style="color:var(--success);">Valid questions: <strong>' + valid + '</strong></p>';
        if (errors.length > 0) {
            statsHtml += '<p style="color:var(--error);">Errors: <strong>' + errors.length + '</strong></p><div style="max-height:100px;overflow-y:auto;font-size:12px;color:#666;">';
            for (var i = 0; i < Math.min(10, errors.length); i++) statsHtml += '<p>' + errors[i] + '</p>';
            if (errors.length > 10) statsHtml += '<p>...and ' + (errors.length - 10) + ' more</p>';
            statsHtml += '</div>';
        }
        document.getElementById("importStats").innerHTML = statsHtml;
        if (valid === 0) {
            document.getElementById("importPreview").querySelector(".btn-save").style.display = "none";
        } else {
            document.getElementById("importPreview").querySelector(".btn-save").style.display = "";
        }
    };
    reader.readAsArrayBuffer(file);
}

function confirmImport() {
    if (pendingImportData.length === 0) return;
    for (var i = 0; i < pendingImportData.length; i++) {
        questions.push(pendingImportData[i]);
    }
    saveAll();
    pendingImportData = [];
    var rd = document.getElementById("importResult");
    rd.style.display = "block";
    document.getElementById("importPreview").style.display = "none";
    rd.innerHTML = '<p style="color:var(--success);font-size:16px;">&#9989; Successfully imported questions into the question bank!</p>';
    renderQuestions();
}

function validatePasswordChange() {
    var cur = document.getElementById("pcCurrent").value;
    var nw = document.getElementById("pcNew").value;
    var cf = document.getElementById("pcConfirm").value;
    var err = document.getElementById("pcError");
    err.style.display = "none";
    if (nw.length < 3) { err.textContent = "New password must be at least 3 characters."; err.style.display = "block"; return false; }
    if (nw !== cf) { err.textContent = "New passwords do not match."; err.style.display = "block"; return false; }
    return true;
}

function changePassword(e) {
    e.preventDefault();
    var cur = document.getElementById("pcCurrent").value;
    var nw = document.getElementById("pcNew").value;
    var err = document.getElementById("pcError");
    err.style.display = "none";
    if (!validatePasswordChange()) return;
    var found = null;
    for (var i = 0; i < studentAccounts.length; i++) {
        if (studentAccounts[i].id === currentUser.id) { found = studentAccounts[i]; break; }
    }
    if (!found) { err.textContent = "Account not found."; err.style.display = "block"; return; }
    if (found.password !== cur) { err.textContent = "Current password is incorrect."; err.style.display = "block"; return; }
    found.password = nw;
    found.forcePasswordChange = false;
    saveAll();
    document.getElementById("passwordChangeModal").classList.remove("active");
    document.getElementById("modalOverlay").classList.remove("active");
    document.getElementById("studentDashboard").style.display = "block";
    document.getElementById("studentDisplayName").textContent = found.name;
    showStudentTab("practice");
    history.pushState({ page: "dashboard" }, "", "#dashboard");
    alert("Password changed successfully!");
}

function showStudentExcelModal() {
    document.getElementById("studentExcelFile").value = "";
    document.getElementById("studentExcelPreview").innerHTML = "";
    document.getElementById("studentExcelConfirmBtn").style.display = "none";
    document.getElementById("studentExcelModal").classList.add("active");
    document.getElementById("modalOverlay").classList.add("active");
}

var pendingStudentExcelData = [];

function previewStudentExcel(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
        try {
            var wb = XLSX.read(ev.target.result, { type: "binary" });
            var ws = wb.Sheets[wb.SheetNames[0]];
            var data = XLSX.utils.sheet_to_json(ws, { header: 1 });
            if (data.length < 2) { alert("Excel file is empty or has no data rows."); return; }
            var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
            var idIdx = headers.indexOf("id");
            var nameIdx = headers.indexOf("name");
            var classIdx = headers.indexOf("class");
            var gradeIdx = headers.indexOf("grade");
            var passIdx = headers.indexOf("password");
            if (idIdx === -1 || nameIdx === -1 || classIdx === -1) {
                alert("Excel must have columns: ID, Name, Class (and optionally Grade, Password).");
                return;
            }
            pendingStudentExcelData = [];
            var errors = [];
            var existingIds = {};
            for (var i = 0; i < studentAccounts.length; i++) existingIds[studentAccounts[i].id] = true;
            for (var i = 1; i < data.length; i++) {
                var row = data[i];
                if (!row || !row[idIdx]) continue;
                var sid = String(row[idIdx]).trim();
                var sname = String(row[nameIdx]).trim();
                var sclass = String(row[classIdx]).trim();
                var sgrade = gradeIdx !== -1 ? parseInt(row[gradeIdx]) || 9 : 9;
                var spass = passIdx !== -1 && row[passIdx] ? String(row[passIdx]).trim() : "123";
                if (!sid || !sname) { errors.push("Row " + (i + 1) + ": Missing ID or Name."); continue; }
                if (existingIds[sid]) { errors.push("Row " + (i + 1) + ": ID " + sid + " already exists (skipped)."); continue; }
                var matchedClass = null;
                for (var j = 0; j < classes.length; j++) {
                    if (classes[j].name === sclass) { matchedClass = classes[j]; break; }
                }
                if (!matchedClass) { errors.push("Row " + (i + 1) + ": Class '" + sclass + "' not found."); continue; }
                pendingStudentExcelData.push({ id: sid, name: sname, classId: matchedClass.id, grade: sgrade, password: spass, forcePasswordChange: true });
                existingIds[sid] = true;
            }
            var h = '<p><b>' + pendingStudentExcelData.length + '</b> students ready to import.</p>';
            if (errors.length > 0) h += '<p style="color:#e74c3c;">' + errors.join("<br>") + '</p>';
            if (pendingStudentExcelData.length > 0) {
                h += '<table><thead><tr><th>ID</th><th>Name</th><th>Class</th><th>Grade</th><th>Password</th></tr></thead><tbody>';
                for (var i = 0; i < pendingStudentExcelData.length; i++) {
                    var s = pendingStudentExcelData[i];
                    var cn = "N/A";
                    for (var j = 0; j < classes.length; j++) { if (classes[j].id === s.classId) { cn = classes[j].name; break; } }
                    h += '<tr><td>' + s.id + '</td><td>' + s.name + '</td><td>' + cn + '</td><td>' + s.grade + '</td><td>' + s.password + '</td></tr>';
                }
                h += '</tbody></table>';
                document.getElementById("studentExcelConfirmBtn").style.display = "inline-block";
            } else {
                document.getElementById("studentExcelConfirmBtn").style.display = "none";
            }
            document.getElementById("studentExcelPreview").innerHTML = h;
        } catch (ex) { alert("Error reading Excel file: " + ex.message); }
    };
    reader.readAsBinaryString(file);
}

function confirmStudentExcelImport() {
    if (pendingStudentExcelData.length === 0) return;
    for (var i = 0; i < pendingStudentExcelData.length; i++) {
        studentAccounts.push(pendingStudentExcelData[i]);
    }
    saveAll();
    pendingStudentExcelData = [];
    closeModal();
    renderPrincipalStudents();
    alert("Students imported successfully!");
}

function closeModal() {
    var ids = ["questionModal", "classModal", "assignmentModal", "excelModal", "teacherModal", "attendanceModal", "studentModal", "studentExcelModal"];
    for (var i = 0; i < ids.length; i++) document.getElementById(ids[i]).classList.remove("active");
    document.getElementById("modalOverlay").classList.remove("active");
    document.getElementById("smId").disabled = false;
}

window.onload = function() {
    loadData();
    if (questions.length === 0 && typeof QuestionLoader !== "undefined") {
        QuestionLoader.loadChapter(1, function(data) {
            if (data && data.questions) {
                for (var i = 0; i < data.questions.length; i++) {
                    questions.push(data.questions[i]);
                }
                saveAll();
                console.log("Loaded " + data.questions.length + " questions from Chapter 1. Total: " + questions.length);
            }
            document.getElementById("loginPage").style.display = "block";
            dashboardsHide();
        });
    } else {
        document.getElementById("loginPage").style.display = "block";
        dashboardsHide();
    }
    history.replaceState({ page: "login" }, "", location.href);
    window.addEventListener("beforeunload", function(e) {
        if (document.getElementById("quiz").style.display === "block") {
            e.returnValue = "Quiz is in progress. Are you sure you want to leave?";
            return "Quiz is in progress. Are you sure you want to leave?";
        }
    });
};

window.addEventListener("popstate", function(e) {
    if (!e.state || !e.state.page) return;
    var page = e.state.page;
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("quiz").style.display = "none";
    document.getElementById("result").style.display = "none";
    document.getElementById("review").style.display = "none";
    var mdp = document.getElementById("modeDetailPanel");
    if (mdp) mdp.style.display = "none";
    if (page === "login") {
        clearInterval(timer);
        document.getElementById("logoutBar").style.display = "none";
        document.getElementById("homeBtn").style.display = "none";
        dashboardsHide();
        document.getElementById("loginPage").style.display = "block";
        currentUser = null;
        currentRole = null;
    } else if (page === "dashboard") {
        clearInterval(timer);
        dashboardsHide();
        if (currentRole === "student") {
            document.getElementById("studentDashboard").style.display = "block";
        } else if (currentRole === "teacher" || currentRole === "classteacher") {
            document.getElementById("teacherDashboard").style.display = "block";
        } else if (currentRole === "parent") {
            document.getElementById("parentDashboard").style.display = "block";
        } else if (currentRole === "principal") {
            document.getElementById("principalDashboard").style.display = "block";
        }
    } else if (page === "quiz") {
        document.getElementById("quiz").style.display = "block";
    } else if (page === "result") {
        document.getElementById("result").style.display = "block";
    } else if (page === "review") {
        document.getElementById("review").style.display = "block";
    }
}, false);
