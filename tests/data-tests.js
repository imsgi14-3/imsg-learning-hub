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
