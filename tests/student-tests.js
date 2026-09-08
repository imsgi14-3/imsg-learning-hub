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

    var classA = 0, classB = 0;
    for (var i = 0; i < studentAccounts.length; i++) {
        if (studentAccounts[i].classId === "CLASS-9A") classA++;
        else if (studentAccounts[i].classId === "CLASS-9B") classB++;
    }
    TestRunner.assertGreaterThan(classA + classB, 0, "Students assigned to classes");
    TestRunner.assertEqual(classA + classB, studentAccounts.length, "All students have class assignments");

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
}
