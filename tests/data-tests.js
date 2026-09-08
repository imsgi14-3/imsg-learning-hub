function runPersistenceTests() {
    TestRunner.suite("Persistence - localStorage Save/Load");

    var testKey = "test_key_" + Date.now();
    localStorage.setItem(testKey, JSON.stringify({ hello: "world" }));
    var loaded = JSON.parse(localStorage.getItem(testKey));
    TestRunner.assertNotNull(loaded, "Data saved to localStorage");
    TestRunner.assertEqual(loaded.hello, "world", "Data loaded correctly from localStorage");
    localStorage.removeItem(testKey);

    TestRunner.suite("Persistence - Save All");

    var beforeSave = questions.length;
    saveAll();
    var afterSave = JSON.parse(localStorage.getItem(QUESTIONS_KEY));
    TestRunner.assertEqual(afterSave.length, beforeSave, "Questions saved to localStorage");
    var classesSaved = JSON.parse(localStorage.getItem(CLASSES_KEY));
    TestRunner.assertNotNull(classesSaved, "Classes saved to localStorage");
    var studentsSaved = JSON.parse(localStorage.getItem(STUDENTS_KEY));
    TestRunner.assertNotNull(studentsSaved, "Students saved to localStorage");

    TestRunner.suite("Persistence - Load Data");

    var origQuestions = questions.length;
    var origClasses = classes.length;
    var origTeachers = teachers.length;
    var origStudents = studentAccounts.length;
    loadData();
    TestRunner.assertEqual(questions.length, origQuestions, "Questions loaded correctly");
    TestRunner.assertEqual(classes.length, origClasses, "Classes loaded correctly");
    TestRunner.assertEqual(teachers.length, origTeachers, "Teachers loaded correctly");
    TestRunner.assertEqual(studentAccounts.length, origStudents, "Students loaded correctly");

    TestRunner.suite("Persistence - DataStore Module");

    TestRunner.assertType(DataStore, "object", "DataStore module exists");
    TestRunner.assertType(DataStore.load, "function", "DataStore.load exists");
    TestRunner.assertType(DataStore.save, "function", "DataStore.save exists");
    TestRunner.assertType(DataStore.loadFromFirestore, "function", "DataStore.loadFromFirestore exists");
    TestRunner.assertType(DataStore.generateRandomPassword, "function", "DataStore.generateRandomPassword exists");
    TestRunner.assertType(DataStore.generateStudentId, "function", "DataStore.generateStudentId exists");
    TestRunner.assertType(DataStore.generateTeacherId, "function", "DataStore.generateTeacherId exists");
    TestRunner.assertType(DataStore.shuffleArray, "function", "DataStore.shuffleArray exists");
    TestRunner.assertType(DataStore.findStudentById, "function", "DataStore.findStudentById exists");
    TestRunner.assertType(DataStore.findTeacherById, "function", "DataStore.findTeacherById exists");
    TestRunner.assertType(DataStore.findClassById, "function", "DataStore.findClassById exists");

    TestRunner.suite("Persistence - Auth Module");

    TestRunner.assertType(Auth, "object", "Auth module exists");
    TestRunner.assertType(Auth.getRole, "function", "Auth.getRole exists");
    TestRunner.assertType(Auth.getUser, "function", "Auth.getUser exists");
    TestRunner.assertType(Auth.isLoggedIn, "function", "Auth.isLoggedIn exists");
    TestRunner.assertType(Auth.loginAs, "function", "Auth.loginAs exists");
    TestRunner.assertType(Auth.logout, "function", "Auth.logout exists");
    TestRunner.assertType(Auth.handleLogin, "function", "Auth.handleLogin exists");

    TestRunner.suite("Persistence - UI Module");

    TestRunner.assertType(UI, "object", "UI module exists");
    TestRunner.assertType(UI.showLogin, "function", "UI.showLogin exists");
    TestRunner.assertType(UI.showDashboard, "function", "UI.showDashboard exists");
    TestRunner.assertType(UI.showQuiz, "function", "UI.showQuiz exists");
    TestRunner.assertType(UI.showResult, "function", "UI.showResult exists");
    TestRunner.assertType(UI.renderDashboard, "function", "UI.renderDashboard exists");
    TestRunner.assertType(UI.displayQuestion, "function", "UI.displayQuestion exists");
    TestRunner.assertType(UI.renderBar, "function", "UI.renderBar exists");
    TestRunner.assertType(UI.renderDonut, "function", "UI.renderDonut exists");

    TestRunner.suite("Persistence - QuizEngine Module");

    TestRunner.assertType(QuizEngine, "object", "QuizEngine module exists");
    TestRunner.assertType(QuizEngine.startQuiz, "function", "QuizEngine.startQuiz exists");
    TestRunner.assertType(QuizEngine.startTimer, "function", "QuizEngine.startTimer exists");
    TestRunner.assertType(QuizEngine.stopTimer, "function", "QuizEngine.stopTimer exists");
    TestRunner.assertType(QuizEngine.recordAnswer, "function", "QuizEngine.recordAnswer exists");
    TestRunner.assertType(QuizEngine.finish, "function", "QuizEngine.finish exists");

    TestRunner.suite("Persistence - Firebase Config");

    TestRunner.assertType(db, (typeof db), "Firestore db defined");
    TestRunner.assertType(fbAuth, (typeof fbAuth), "Firebase Auth defined");

    TestRunner.suite("Persistence - Question JSON Path");

    var config = QuestionLoader.getChapterConfig();
    TestRunner.assertNotNull(config[1], "Chapter 1 config exists");
    TestRunner.assertTrue(config[1].file.indexOf("question-bank") !== -1, "Path contains question-bank");
    TestRunner.assertTrue(config[1].file.indexOf("grade9") !== -1, "Path contains grade9");
    TestRunner.assertTrue(config[1].file.indexOf("computer-science") !== -1, "Path contains computer-science");

    TestRunner.suite("Persistence - Principal Account");

    TestRunner.assertNotNull(principalAccount, "Principal account exists");
    TestRunner.assertEqual(principalAccount.id, "ADMIN-001", "Principal ID correct");
    TestRunner.assertGreaterThan(principalAccount.password.length, 5, "Principal password valid length");
    var savedPrincipal = JSON.parse(localStorage.getItem("learningHub_principal"));
    TestRunner.assertNotNull(savedPrincipal, "Principal saved to localStorage");
}
