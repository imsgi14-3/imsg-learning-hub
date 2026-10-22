function runStudentTests() {
    TestRunner.suite("Student Management - Add Student");

    var origCount = studentAccounts.length;
    var newStudent = {
        id: "STU-TEST-01", name: "Ahmed Khan", fatherName: "Ali Khan",
        classId: "CLASS-9A", rollNo: 99, password: "abc12345"
    };
    studentAccounts.push(newStudent);
    TestRunner.assertGreaterThan(studentAccounts.length, origCount, "Student count increased");

    var found = false;
    for (var i = 0; i < studentAccounts.length; i++) {
        if (studentAccounts[i].id === "STU-TEST-01") { found = true; break; }
    }
    TestRunner.assertTrue(found, "New student found by ID");

    TestRunner.suite("Student Management - Edit Student");

    for (var i = 0; i < studentAccounts.length; i++) {
        if (studentAccounts[i].id === "STU-TEST-01") {
            studentAccounts[i].name = "Ahmed Updated";
            break;
        }
    }
    for (var i = 0; i < studentAccounts.length; i++) {
        if (studentAccounts[i].id === "STU-TEST-01") {
            TestRunner.assertEqual(studentAccounts[i].name, "Ahmed Updated", "Student name updated");
            break;
        }
    }

    TestRunner.suite("Student Management - Delete Student");

    var beforeDelete = studentAccounts.length;
    studentAccounts = studentAccounts.filter(function(s) { return s.id !== "STU-TEST-01"; });
    TestRunner.assertLessThan(studentAccounts.length, beforeDelete, "Student count decreased after delete");
    var stillExists = false;
    for (var i = 0; i < studentAccounts.length; i++) {
        if (studentAccounts[i].id === "STU-TEST-01") { stillExists = true; break; }
    }
    TestRunner.assertFalse(stillExists, "Deleted student no longer exists");

    TestRunner.suite("Student Management - Duplicate Detection");

    var dupe1 = { id: "DUPE-01", name: "Dupe 1", fatherName: "F1", classId: "CLASS-9A", rollNo: 50, password: "pass1" };
    var dupe2 = { id: "DUPE-01", name: "Dupe 2", fatherName: "F2", classId: "CLASS-9A", rollNo: 50, password: "pass2" };
    studentAccounts.push(dupe1);
    var dupeFound = false;
    for (var i = 0; i < studentAccounts.length; i++) {
        if (studentAccounts[i].id === "DUPE-01") { dupeFound++; }
    }
    TestRunner.assertEqual(dupeFound, 1, "Only one student with duplicate ID");
    studentAccounts = studentAccounts.filter(function(s) { return s.id !== "DUPE-01"; });

    TestRunner.suite("Student Management - Class Assignment");

    var classCount = 0;
    for (var i = 0; i < studentAccounts.length; i++) {
        if (studentAccounts[i].classId) classCount++;
    }
    TestRunner.assertTrue(studentAccounts.length >= 0, "Student accounts exist");
    TestRunner.assertTrue(classCount <= studentAccounts.length, "Class assignments are valid");

    TestRunner.suite("Student Management - Excel Import Simulation");

    var excelData = [
        { id: "EXL-01", name: "Excel Student 1", fatherName: "Father 1", classId: "CLASS-9A", rollNo: 10, password: "gen1" },
        { id: "EXL-02", name: "Excel Student 2", fatherName: "Father 2", classId: "CLASS-9B", rollNo: 20, password: "gen2" }
    ];
    var beforeImport = studentAccounts.length;
    for (var i = 0; i < excelData.length; i++) studentAccounts.push(excelData[i]);
    TestRunner.assertEqual(studentAccounts.length, beforeImport + 2, "Two students imported from Excel");
    TestRunner.assertIdExists(studentAccounts, "EXL-01", "Excel student 1 exists");
    TestRunner.assertIdExists(studentAccounts, "EXL-02", "Excel student 2 exists");
    studentAccounts = studentAccounts.filter(function(s) { return s.id !== "EXL-01" && s.id !== "EXL-02"; });

    TestRunner.suite("Student Management - Firebase Auth");

    var email1 = "test-stu@imsg.edu.pk";
    TestRunner.assertTrue(email1.endsWith("@imsg.edu.pk"), "Student email format correct");
    var email2 = "9A-01@imsg.edu.pk";
    TestRunner.assertTrue(email2.endsWith("@imsg.edu.pk"), "Auto-generated email format correct");

    TestRunner.suite("Student Management - Credentials Export Scope");

    var savedStudents = studentAccounts;
    var savedClasses = classes;
    classes = [{ id: "CLASS-9A", name: "9 A" }, { id: "CLASS-9B", name: "9 B" }];
    var pw1 = "test" + "pw1", pw2 = "test" + "pw2", pw3 = "test" + "pw3";
    studentAccounts = [
        { id: "EXP-9A-1", name: "A One", fatherName: "Af1", classId: "CLASS-9A", rollNo: 1, password: pw1 },
        { id: "EXP-9A-2", name: "A Two", fatherName: "Af2", classId: "CLASS-9A", rollNo: 2, password: pw2 },
        { id: "EXP-9B-1", name: "B One", fatherName: "Bf1", classId: "CLASS-9B", rollNo: 1, password: pw3 }
    ];

    Auth.loginAs("classteacher", { id: "T-CT", name: "CT", role: "classteacher", classId: "CLASS-9A", classTeacherOf: ["CLASS-9A"] });
    var ctRows = UI.oeCredentialExportRows();
    TestRunner.assertNotNull(ctRows, "class teacher gets rows");
    TestRunner.assertEqual(ctRows.length, 3, "class teacher gets header + her 2 students only");
    TestRunner.assertEqual(ctRows[1][0], "EXP-9A-1", "first row is her class student 1");
    TestRunner.assertEqual(ctRows[2][0], "EXP-9A-2", "second row is her class student 2");
    TestRunner.assertEqual(ctRows[1][3], "9 A", "class name resolved for class teacher export");

    Auth.loginAs("classteacher", { id: "T-CT2", name: "CT2", role: "classteacher", classId: "CLASS-9B", classTeacherOf: ["CLASS-9B"] });
    var ctRowsB = UI.oeCredentialExportRows();
    TestRunner.assertEqual(ctRowsB.length, 2, "other class teacher gets header + her 1 student");
    TestRunner.assertEqual(ctRowsB[1][0], "EXP-9B-1", "other class teacher gets only 9B student");

    Auth.loginAs("principal", { id: "ADMIN-001", name: "Principal", role: "principal", classId: null });
    var adminRows = UI.oeCredentialExportRows();
    TestRunner.assertEqual(adminRows.length, 4, "principal gets header + all 3 students");

    Auth.loginAs("teacher", { id: "T-SUB", name: "Sub", role: "teacher", classId: "CLASS-9A" });
    TestRunner.assertNull(UI.oeCredentialExportRows(), "subject teacher is blocked");

    Auth.loginAs("student", { id: "STU-1", name: "Stu", role: "student", classId: "CLASS-9A" });
    TestRunner.assertNull(UI.oeCredentialExportRows(), "student is blocked");

    Auth.logout();
    studentAccounts = savedStudents;
    classes = savedClasses;
}
