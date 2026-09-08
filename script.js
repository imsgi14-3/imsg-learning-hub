var currentQuestion = 0;
var score = 0;
var timeLeft = 60;
var timer = null;
var questions = [];
var userAnswers = [];
var currentRole = null;
var currentUser = null;
var allAttempts = [];
var classes = [];
var assignments = [];
var teachers = [];
var attendance = [];
var conceptStats = {};
var studentAccounts = [];
var principalAccount = null;

var QUESTIONS_KEY = DataStore.KEYS.questions;
var CLASSES_KEY = DataStore.KEYS.classes;
var ASSIGNMENTS_KEY = DataStore.KEYS.assignments;
var TEACHERS_KEY = DataStore.KEYS.teachers;
var ATTENDANCE_KEY = DataStore.KEYS.attendance;
var ATTEMPTS_KEY = DataStore.KEYS.attempts;
var CONCEPTS_KEY = DataStore.KEYS.concepts;
var STUDENTS_KEY = DataStore.KEYS.students;
var PRINCIPAL_KEY = DataStore.KEYS.principal;

function loadData() {
    DataStore.load();
    questions = DataStore.questions;
    classes = DataStore.classes;
    assignments = DataStore.assignments;
    teachers = DataStore.teachers;
    attendance = DataStore.attendance;
    allAttempts = DataStore.allAttempts;
    conceptStats = DataStore.conceptStats;
    studentAccounts = DataStore.studentAccounts;
    principalAccount = DataStore.principalAccount;
}

function saveAll() {
    DataStore.questions = questions;
    DataStore.classes = classes;
    DataStore.assignments = assignments;
    DataStore.teachers = teachers;
    DataStore.attendance = attendance;
    DataStore.allAttempts = allAttempts;
    DataStore.conceptStats = conceptStats;
    DataStore.studentAccounts = studentAccounts;
    if (principalAccount) DataStore.principalAccount = principalAccount;
    DataStore.save();
}

function loadFromFirestore(callback) {
    DataStore.loadFromFirestore(function() {
        questions = DataStore.questions;
        classes = DataStore.classes;
        assignments = DataStore.assignments;
        teachers = DataStore.teachers;
        attendance = DataStore.attendance;
        allAttempts = DataStore.allAttempts;
        conceptStats = DataStore.conceptStats;
        studentAccounts = DataStore.studentAccounts;
        principalAccount = DataStore.principalAccount;
        if (callback) callback();
    });
}

function handleLogin(e) { Auth.handleLogin(e); }
function handleLogout() { Auth.handleLogout(); }
function updateLoginFields() {
    var role = document.getElementById("roleSelect").value;
    var sf = document.getElementById("studentFields");
    var tf = document.getElementById("teacherFields");
    var pf = document.getElementById("parentFields");
    var prf = document.getElementById("principalFields");
    if (sf) sf.style.display = "none";
    if (tf) tf.style.display = "none";
    if (pf) pf.style.display = "none";
    if (prf) prf.style.display = "none";
    if (role === "student" || role === "parent") { if (sf) sf.style.display = "block"; }
    else if (role === "teacher" || role === "classteacher") { if (tf) tf.style.display = "block"; }
    else if (role === "principal") { if (prf) prf.style.display = "block"; }
}

function activateTab(tab) { if (Auth.isLoggedIn()) UI.showDashboard(); }
function showStudentTab(tab) { UI.showStudentTab(tab); }
function showTeacherTab(tab) { UI.showTeacherTab(tab); }
function showCTTab(tab) { UI.showCTTab(tab); }
function showParentTab(tab) { UI.showParentTab(tab); }
function showPrincipalTab(tab) { UI.showPrincipalTab(tab); }

function startPractice() { UI.launchQuiz("Computer Science", "Chapter 1", "all", 20); }
function displayQuestion() { UI.displayQuestion(); }
function nextQuestion() { UI.nextQuestion(); }
function prevQuestion() { UI.prevQuestion(); }
function skipQuestion() { UI.skipQuestion(); }
function jumpToQuestion(idx) { UI.jumpToQuestion(idx); }
function showReview() { UI.showReview(); }
function backToDashboard() { UI.backToDashboard(); }
function startTimer() { UI.startTimer(); }

function showSubjectList() { UI.showSubjectList(); }
function showSubjectChapters(s) { UI.showSubjectChapters(s); }
function showChapterQuizOptions(s, c) { UI.showChapterQuizOptions(s, c); }
function launchQuiz(s, c, t, n) { UI.launchQuiz(s, c, t, n); }
function startAssignmentQuiz(i) { UI.startAssignmentQuiz(i); }
function showResults() { UI.renderStudentResults(); }

function shuffleArray(arr) { return DataStore.shuffleArray(arr); }
function generateRandomPassword() { return DataStore.generateRandomPassword(); }
function generateStudentId(c, r) { return DataStore.generateStudentId(c, r); }
function generateTeacherId() { return DataStore.generateTeacherId(); }

function showAddQuestionModal() { UI.showAddQuestionModal(); }
function saveQuestion(e) { UI.saveQuestion(e); }
function editQuestion(id) { UI.editQuestion(id); }
function deleteQuestion(id) { UI.deleteQuestion(id); }
function filterQuestions() { UI.filterQuestions(); }
function showCreateAssignmentModal() { UI.showCreateAssignmentModal(); }
function saveAssignment() { UI.saveAssignment(); }
function editAssignment(i) { UI.editAssignment(i); }
function deleteAssignment(i) { UI.deleteAssignment(i); }
function showAddTeacherModal() { UI.showAddTeacherModal(); }
function saveTeacher() { UI.saveTeacher(); }
function editTeacher(id) { UI.editTeacher(id); }
function deleteTeacher(id) { UI.deleteTeacher(id); }
function showCreateStudentModal() { UI.showCreateStudentModal(); }
function saveStudent() { UI.saveStudent(); }
function editStudent(id) { UI.editStudent(id); }
function deleteStudent(id) { UI.deleteStudent(id); }
function showAddClassModal() { UI.showAddClassModal(); }
function saveClass() { UI.saveClass(); }
function editClass(i) { UI.editClass(i); }
function deleteClass(i) { UI.deleteClass(i); }
function showExcelImportModal() { UI.showExcelImportModal(); }
function showStudentExcelModal() { UI.showStudentExcelModal(); }
function exportStudentCredentials() { UI.exportStudentCredentials(); }
function closeModal() { UI.closeModal(); }
function loadClassAnalytics() { UI.loadClassAnalytics(); }

function renderBar(id, data, max) { UI.renderBar(id, data, max); }
function renderDonut(id, data) { UI.renderDonut(id, data); }

window.onload = function() {
    loadData();
    loadFromFirestore(function() {
        if (typeof QuestionLoader !== "undefined") {
            QuestionLoader.loadAllChapters(function(allQs) {
                if (allQs && allQs.length > 0) {
                    var jsonById = {};
                    for (var i = 0; i < allQs.length; i++) jsonById[allQs[i].id] = allQs[i];
                    var cleaned = [];
                    for (var i = 0; i < questions.length; i++) {
                        if (jsonById[questions[i].id]) cleaned.push(jsonById[questions[i].id]);
                        else if (!questions[i].subject || !questions[i].chapter) cleaned.push(questions[i]);
                    }
                    for (var i = 0; i < allQs.length; i++) {
                        var found = false;
                        for (var j = 0; j < cleaned.length; j++) { if (cleaned[j].id === allQs[i].id) { found = true; break; } }
                        if (!found) cleaned.push(allQs[i]);
                    }
                    questions = cleaned;
                    DataStore.questions = questions;
                }
                if (!principalAccount) { principalAccount = DataStore.principalAccount; }
                Auth.restoreSession();
                if (Auth.isLoggedIn()) { UI.showDashboard(); }
            });
        } else {
            if (!principalAccount) { principalAccount = DataStore.principalAccount; }
            Auth.restoreSession();
            if (Auth.isLoggedIn()) { UI.showDashboard(); }
        }
    });
};

var subjectsData = {
    "Computer Science": {
        chapters: [
            { num: 1, title: "Fundamentals of Computer", topics: ["Input & Output Devices", "Primary & Secondary Memory", "Number Systems", "Boolean Logic", "Software & Hardware", "Networking Basics", "Operating System", "Storage Devices", "Computer Networks"] },
            { num: 2, title: "Data Representation", topics: ["Binary & Hexadecimal", "ASCII & Unicode", "Image Representation", "Sound Digitization", "Data Compression"] },
            { num: 3, title: "Computer Architecture", topics: ["Von Neumann Architecture", "CPU Components", "Registers & Buses", "Instruction Cycle", "Memory Hierarchy"] }
        ]
    }
};
