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

function handleLogin() { Auth.handleLogin(); }
function handleLogout() { Auth.handleLogout(); }
function updateLoginFields() {
    var role = document.getElementById("loginRole").value;
    var idField = document.getElementById("loginID");
    var passField = document.getElementById("loginPassword");
    var loginMsg = document.getElementById("loginMsg");
    loginMsg.style.display = "none";
    if (role === "principal") {
        idField.placeholder = "Enter admin ID (ADMIN-001)";
        passField.placeholder = "Enter password";
    } else if (role === "student") {
        idField.placeholder = "Enter student ID (e.g. 9A-01)";
        passField.placeholder = "Enter password";
    } else if (role === "parent") {
        idField.placeholder = "Enter student ID";
        passField.placeholder = "Enter password";
    } else if (role === "teacher") {
        idField.placeholder = "Enter teacher ID (e.g. T-01)";
        passField.placeholder = "Enter password";
    }
}

function activateTab(tab) {
    if (!Auth.isLoggedIn()) return;
    UI.renderDashboard();
}

function startPractice() { UI.launchFullPractice(); }
function startAssignmentQuiz() {}
function displayQuestion() { UI.displayQuestion(); }
function checkAnswer() {}
function nextQuestion() { UI.nextQuestion(); }
function showResult() { UI.showResult(); }
function startTimer() { UI.startTimer(); }
function updateTimerDisplay(sec) { UI.updateTimerDisplay(sec); }
function showReview() {}
function backToDashboard() { UI.backToDashboard(); }
function jumpToQuestion() {}
function prevQuestion() { UI.prevQuestion(); }
function skipQuestion() { UI.skipQuestion(); }

function shuffleArray(arr) { return DataStore.shuffleArray(arr); }
function generateRandomPassword() { return DataStore.generateRandomPassword(); }
function generateStudentId(classObj, rollNo) { return DataStore.generateStudentId(classObj, rollNo); }
function generateTeacherId() { return DataStore.generateTeacherId(); }

function showAddTeacherModal() { UI.showAddTeacherModal(); }
function saveTeacher() { UI.saveTeacher(); }
function editTeacher(id) { UI.editTeacher(id); }
function deleteTeacher(id) { UI.deleteTeacher(id); }
function showAddStudentModal() { UI.showAddStudentModal(); }
function saveStudent() { UI.saveStudent(); }
function editStudent(id) { UI.editStudent(id); }
function deleteStudent(id) { UI.deleteStudent(id); }
function showAddClassModal() { UI.showAddClassModal(); }
function saveClass() { UI.saveClass(); }
function editClass(idx) { UI.editClass(idx); }
function deleteClass(idx) { UI.deleteClass(idx); }
function showExcelImportModal() { UI.showExcelImportModal(); }
function previewExcel() { UI.previewExcel(); }
function confirmExcelImport() { UI.confirmExcelImport(); }
function showAddQuestionModal() { UI.showAddQuestionModal(); }
function saveQuestion() { UI.saveQuestion(); }
function editQuestion(id) { UI.editQuestion(id); }
function deleteQuestion(id) { UI.deleteQuestion(id); }
function showCreateAssignmentModal() { UI.showCreateAssignmentModal(); }
function saveAssignment() { UI.saveAssignment(); }
function editAssignment(idx) { UI.editAssignment(idx); }
function deleteAssignment(idx) { UI.deleteAssignment(idx); }
function closeModal() { UI.closeModal(); }

function renderBar(id, data, max) { UI.renderBar(id, data, max); }
function renderDonut(id, data) { UI.renderDonut(id, data); }

function showTeacherQuestions() { UI.showTeacherQuestions(); }
function showTeacherAssignments() { UI.showTeacherAssignments(); }
function showTeacherAnalytics() { UI.showTeacherAnalytics(); }
function showPrincipalStudents() { UI.showPrincipalStudents(); }
function showPrincipalTeachers() { UI.showPrincipalTeachers(); }
function showPrincipalClasses() { UI.showPrincipalClasses(); }
function showPrincipalAnalytics() { UI.showPrincipalAnalytics(); }
function renderFilteredQuestions() { UI.renderFilteredQuestions(); }
function renderStudentList() { UI.renderStudentList(); }
function renderTeacherList() { UI.renderTeacherList(); }
function renderClassList() { UI.renderClassList(); }
function startPracticeFromDashboard(mode) { UI.startPracticeFromDashboard(mode); }
function showSubjectPicker() { UI.showSubjectPicker(); }
function showChaptersForSubject(subject) { UI.showChaptersForSubject(subject); }
function showChapterDetail(subject, chapter) { UI.showChapterDetail(subject, chapter); }
function quickPracticeChapter(subject, chapter) { UI.quickPracticeChapter(subject, chapter); }
function quickPracticeTopic(subject, chapter, topic) { UI.quickPracticeTopic(subject, chapter, topic); }
function showResults() { UI.showResults(); }

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
