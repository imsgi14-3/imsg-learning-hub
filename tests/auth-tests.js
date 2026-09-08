function runAuthTests() {
    TestRunner.suite("Authentication - Principal");

    TestRunner assertNotNull(principalAccount, "Principal account exists");
    TestRunner.assertEqual(principalAccount.id, "ADMIN-001", "Principal ID is ADMIN-001");
    TestRunner.assertNotNull(principalAccount.password, "Principal has a password");
    TestRunner.assertGreaterThan(principalAccount.password.length, 5, "Password is at least 6 chars");

    TestRunner.suite("Authentication - Student Accounts");

    var testStudent = {
        id: "TEST-01", name: "Test Student", fatherName: "Test Father",
        classId: "CLASS-9A", rollNo: 1, password: "test1234"
    };
    studentAccounts.push(testStudent);
    TestRunner.assertIdExists(studentAccounts, "TEST-01", "Student added to accounts");
    TestRunner.assertEqual(studentAccounts[studentAccounts.length - 1].name, "Test Student", "Student name correct");
    TestRunner.assertEqual(studentAccounts[studentAccounts.length - 1].password, "test1234", "Student password stored");

    studentAccounts = studentAccounts.filter(function(s) { return s.id !== "TEST-01"; });

    TestRunner.suite("Authentication - Teacher Accounts");

    var testTeacher = {
        id: "T-TEST", name: "Test Teacher", subject: "Computer Science",
        password: "pass123", isSubjectTeacher: true, isClassTeacher: false, classId: ""
    };
    teachers.push(testTeacher);
    TestRunner.assertIdExists(teachers, "T-TEST", "Teacher added to accounts");
    TestRunner.assertEqual(teachers[teachers.length - 1].subject, "Computer Science", "Teacher subject correct");

    teachers = teachers.filter(function(t) { return t.id !== "T-TEST"; });

    TestRunner.suite("Authentication - Password Generation");

    var pass1 = generateRandomPassword();
    var pass2 = generateRandomPassword();
    TestRunner.assertEqual(pass1.length, 8, "Generated password is 8 chars");
    TestRunner.assertNotEqual(pass1, pass2, "Two generated passwords are different");
    TestRunner.assertTrue(/^[A-Za-z0-9]+$/.test(pass1), "Password contains only alphanumeric chars");

    TestRunner.suite("Authentication - Student ID Generation");

    var mockClass = { id: "CLASS-9A", name: "9A", grade: 9, section: "A" };
    var id1 = generateStudentId(mockClass, 1);
    var id2 = generateStudentId(mockClass, 15);
    TestRunner.assertEqual(id1, "9A-01", "Student ID for roll 1");
    TestRunner.assertEqual(id2, "9A-15", "Student ID for roll 15");

    TestRunner.suite("Authentication - Teacher ID Generation");

    var tid1 = generateTeacherId();
    TestRunner.assertNotNull(tid1, "Teacher ID generated");
    TestRunner.assertTrue(tid1.startsWith("T-"), "Teacher ID starts with T-");
}
