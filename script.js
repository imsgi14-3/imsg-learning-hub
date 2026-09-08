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
                }
                Auth.restoreSession();
                if (Auth.isLoggedIn()) { UI.showDashboard(); }
            });
        } else {
            Auth.restoreSession();
            if (Auth.isLoggedIn()) { UI.showDashboard(); }
        }
    });
};

function handleLogin(e) { Auth.handleLogin(e); }
function handleLogout() { Auth.handleLogout(); }
function updateLoginFields() { UI.updateLoginFields(); }
function showStudentTab(tab) { UI.showStudentTab(tab); }
function showTeacherTab(tab) { UI.showTeacherTab(tab); }
function showCTTab(tab) { UI.showCTTab(tab); }
function showParentTab(tab) { UI.showParentTab(tab); }
function showPrincipalTab(tab) { UI.showPrincipalTab(tab); }
function startPractice() { UI.startPractice(); }
function displayQuestion() { QuizEngine.displayQuestion(); }
function checkAnswer(sel) { QuizEngine.checkAnswer(sel); }
function nextQuestion() { QuizEngine.nextQuestion(); }
function prevQuestion() { QuizEngine.prevQuestion(); }
function skipQuestion() { QuizEngine.skipQuestion(); }
function jumpToQuestion(idx) { QuizEngine.jumpToQuestion(idx); }
function showReview() { QuizEngine.showReview(); }
function backToDashboard() { QuizEngine.backToDashboard(); }
function showSubjectList() { UI.showSubjectList(); }
function showSubjectChapters(s) { UI.showSubjectChapters(s); }
function showChapterQuizOptions(c, s) { UI.showChapterQuizOptions(c, s); }
function backToChapters() { UI.backToChapters(); }
function showTopicPicker(c, s) { UI.showTopicPicker(c, s); }
function launchTopicPractice(c, s, t) { UI.launchTopicPractice(c, s, t); }
function launchChapterMode(c, s, m) { UI.launchChapterMode(c, s, m); }
function launchQuiz(s, c, t, n) { UI.launchQuiz(s, c, t, n); }
function launchQuickPractice() { UI.launchQuickPractice(); }
function launchChapterTest() { UI.launchChapterTest(); }
function launchFullBookTest() { UI.launchFullBookTest(); }
function launchWeakPractice() { UI.launchWeakPractice(); }
function showModeDetail(m) { UI.showModeDetail(m); }
function hideModeDetail() { UI.hideModeDetail(); }
function startAssignmentQuiz(i) { UI.startAssignmentQuiz(i); }
function renderBar(n, p, c) { return renderBar(n, p, c); }
function showAddQuestionModal() { UI.showAddQuestionModal(); }
function saveQuestion(e) { UI.saveQuestion(e); }
function editQuestion(id) { UI.editQuestion(id); }
function deleteQuestion(id) { UI.deleteQuestion(id); }
function filterQuestions() { UI.filterQuestions(); }
function showCreateAssignmentModal() { UI.showCreateAssignmentModal(); }
function updateAssignmentQuestionList() { UI.updateAssignmentQuestionList(); }
function saveAssignment(e) { UI.saveAssignment(e); }
function editAssignment(i) { UI.editAssignment(i); }
function deleteAssignment(i) { UI.deleteAssignment(i); }
function showAddTeacherModal() { UI.showAddTeacherModal(); }
function toggleCTClassField() { UI.toggleCTClassField(); }
function saveTeacher(e) { UI.saveTeacher(e); }
function editTeacher(id) { UI.editTeacher(id); }
function deleteTeacher(id) { UI.deleteTeacher(id); }
function showCreateStudentModal() { UI.showCreateStudentModal(); }
function updateStudentPreview() { UI.updateStudentPreview(); }
function saveStudentAccount(e) { UI.saveStudentAccount(e); }
function editStudentAccount(id) { UI.editStudentAccount(id); }
function deleteStudentAccount(id) { UI.deleteStudentAccount(id); }
function showStudentPassword(id) { UI.showStudentPassword(id); }
function refreshStudentLists() { UI.refreshStudentLists(); }
function showCreateClassModal() { UI.showCreateClassModal(); }
function saveClass(e) { UI.saveClass(e); }
function editClass(i) { UI.editClass(i); }
function deleteClass(i) { UI.deleteClass(i); }
function showExcelImportModal() { UI.showExcelImportModal(); }
function importExcel(e) { UI.importExcel(e); }
function confirmImport() { UI.confirmImport(); }
function showStudentExcelModal() { UI.showStudentExcelModal(); }
function previewStudentExcel(e) { UI.previewStudentExcel(e); }
function confirmStudentExcelImport() { UI.confirmStudentExcelImport(); }
function exportStudentCredentials() { UI.exportStudentCredentials(); }
function doExportCredentials() { UI.doExportCredentials(); }
function closeModal() { UI.closeModal(); }
function loadClassAnalytics() { UI.loadClassAnalytics(); }
function markAttendance() { UI.markAttendance(); }
function saveAttendance(e) { UI.saveAttendance(e); }
function dashboardsHide() { UI.dashboardsHide(); }
function renderClasses() { UI.renderClasses(); }
function renderQuestions() { UI.renderQuestions(); }
function renderAssignments() { UI.renderAssignments(); }
function renderCTOverview() { UI.renderCTOverview(); }
function renderCTStudents() { UI.renderCTStudents(); }
function renderCTCrossSubject() { UI.renderCTCrossSubject(); }
function renderCTAttendance() { UI.renderCTAttendance(); }
function renderPrincipalSchool() { UI.renderPrincipalSchool(); }
function renderPrincipalClasses() { UI.renderPrincipalClasses(); }
function renderPrincipalTeachers() { UI.renderPrincipalTeachers(); }
function renderPrincipalStudents() { UI.renderPrincipalStudents(); }
function renderPrincipalAnalytics() { UI.renderPrincipalAnalytics(); }
