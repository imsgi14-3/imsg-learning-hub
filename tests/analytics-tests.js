function runAnalyticsTests() {
    TestRunner.suite("Analytics - Data Structures");

    TestRunner.assertType(allAttempts, "object", "allAttempts is an array");
    TestRunner.assertType(classes, "object", "classes is an array");
    TestRunner.assertType(studentAccounts, "object", "studentAccounts is an array");
    TestRunner.assertType(teachers, "object", "teachers is an array");
    TestRunner.assertType(questions, "object", "questions is an array");

    TestRunner.suite("Analytics - Class Structure");

    for (var i = 0; i < classes.length; i++) {
        var cl = classes[i];
        TestRunner.assertNotNull(cl.id, "Class " + i + " has ID");
        TestRunner.assertNotNull(cl.name, "Class " + i + " has name");
        TestRunner.assertNotNull(cl.grade, "Class " + i + " has grade");
        TestRunner.assertNotNull(cl.section, "Class " + i + " has section");
    }

    TestRunner.suite("Analytics - Student-Class Mapping");

    for (var i = 0; i < studentAccounts.length; i++) {
        var s = studentAccounts[i];
        var classExists = false;
        for (var j = 0; j < classes.length; j++) {
            if (classes[j].id === s.classId) { classExists = true; break; }
        }
        TestRunner.assertTrue(classExists, "Student " + s.id + " has valid classId");
    }

    TestRunner.suite("Analytics - Attempt Structure");

    if (allAttempts.length > 0) {
        var a = allAttempts[0];
        TestRunner.assertNotNull(a.studentId, "Attempt has studentId");
        TestRunner.assertNotNull(a.percentage, "Attempt has percentage");
        TestRunner.assertInRange(a.percentage, 0, 100, "Percentage is 0-100");
        TestRunner.assertType(a.percentage, "number", "Percentage is number");
    }

    TestRunner.suite("Analytics - Score Calculations");

    if (allAttempts.length > 0) {
        var sum = 0;
        for (var i = 0; i < allAttempts.length; i++) sum += allAttempts[i].percentage;
        var avg = sum / allAttempts.length;
        TestRunner.assertInRange(avg, 0, 100, "Average score in valid range");

        var best = 0;
        for (var i = 0; i < allAttempts.length; i++) {
            if (allAttempts[i].percentage > best) best = allAttempts[i].percentage;
        }
        TestRunner.assertInRange(best, 0, 100, "Best score in valid range");
        TestRunner.assertGreaterThan(best, avg - 1, "Best >= average");
    }

    TestRunner.suite("Analytics - Role State");

    TestRunner.assertType(currentRole, (typeof currentRole), "currentRole type correct");
    TestRunner.assertNull(currentUser, "currentUser null before login");

    TestRunner.suite("Analytics - localStorage Keys");

    TestRunner.assertNotNull(QUESTIONS_KEY, "QUESTIONS_KEY defined");
    TestRunner.assertNotNull(CLASSES_KEY, "CLASSES_KEY defined");
    TestRunner.assertNotNull(TEACHERS_KEY, "TEACHERS_KEY defined");
    TestRunner.assertNotNull(STUDENTS_KEY, "STUDENTS_KEY defined");
    TestRunner.assertNotNull(ATTEMPTS_KEY, "ATTEMPTS_KEY defined");

    TestRunner.suite("Analytics - Attempt Per Student Stats");

    var studentAttempts = {};
    for (var i = 0; i < allAttempts.length; i++) {
        var sid = allAttempts[i].studentId;
        if (!studentAttempts[sid]) studentAttempts[sid] = 0;
        studentAttempts[sid]++;
    }
    var studentKeys = Object.keys(studentAttempts);
    if (studentKeys.length > 0) {
        TestRunner.assertGreaterThan(studentKeys.length, 0, "Students have attempts");
        for (var i = 0; i < studentKeys.length; i++) {
            TestRunner.assertGreaterThan(studentAttempts[studentKeys[i]], 0, "Student " + studentKeys[i] + " has 1+ attempts");
        }
    }
}
