function runTeacherTests() {
    TestRunner.suite("Teacher Management - Add Teacher");

    var origCount = teachers.length;
    var newTeacher = {
        id: "T-TEST", name: "Test Teacher", subject: "Physics",
        password: "teach123", isSubjectTeacher: true, isClassTeacher: false,
        classId: "", createdAt: Date.now()
    };
    teachers.push(newTeacher);
    TestRunner.assertGreaterThan(teachers.length, origCount, "Teacher count increased");
    TestRunner.assertIdExists(teachers, "T-TEST", "New teacher found by ID");

    TestRunner.suite("Teacher Management - Edit Teacher");

    for (var i = 0; i < teachers.length; i++) {
        if (teachers[i].id === "T-TEST") {
            teachers[i].subject = "Mathematics";
            teachers[i].isClassTeacher = true;
            teachers[i].classId = "CLASS-9A";
            break;
        }
    }
    for (var i = 0; i < teachers.length; i++) {
        if (teachers[i].id === "T-TEST") {
            TestRunner.assertEqual(teachers[i].subject, "Mathematics", "Subject updated");
            TestRunner.assertTrue(teachers[i].isClassTeacher, "Class teacher flag set");
            TestRunner.assertEqual(teachers[i].classId, "CLASS-9A", "Class assigned");
            break;
        }
    }

    TestRunner.suite("Teacher Management - Delete Teacher");

    var beforeDelete = teachers.length;
    teachers = teachers.filter(function(t) { return t.id !== "T-TEST"; });
    TestRunner.assertLessThan(teachers.length, beforeDelete, "Teacher count decreased");
    var stillExists = false;
    for (var i = 0; i < teachers.length; i++) {
        if (teachers[i].id === "T-TEST") { stillExists = true; break; }
    }
    TestRunner.assertFalse(stillExists, "Deleted teacher no longer exists");

    TestRunner.suite("Teacher Management - Role Types");

    var subjectOnly = { id: "T-S1", name: "Subject Only", subject: "CS", password: "p", isSubjectTeacher: true, isClassTeacher: false, classId: "" };
    var classOnly = { id: "T-C1", name: "Class Only", subject: "All", password: "p", isSubjectTeacher: false, isClassTeacher: true, classId: "CLASS-9A" };
    var both = { id: "T-B1", name: "Both Roles", subject: "CS", password: "p", isSubjectTeacher: true, isClassTeacher: true, classId: "CLASS-9B" };

    TestRunner.assertTrue(subjectOnly.isSubjectTeacher, "Subject teacher flag true");
    TestRunner.assertFalse(subjectOnly.isClassTeacher, "Subject teacher not class teacher");
    TestRunner.assertTrue(classOnly.isClassTeacher, "Class teacher flag true");
    TestRunner.assertFalse(classOnly.isSubjectTeacher, "Class teacher not subject teacher");
    TestRunner.assertTrue(both.isSubjectTeacher, "Both roles: subject true");
    TestRunner.assertTrue(both.isClassTeacher, "Both roles: class true");

    TestRunner.suite("Teacher Management - Auto ID Generation");

    var tid = generateTeacherId();
    TestRunner.assertNotNull(tid, "Auto teacher ID not null");
    TestRunner.assertTrue(tid.startsWith("T-"), "Auto ID starts with T-");
    TestRunner.assertGreaterThan(tid.length, 2, "Auto ID has meaningful length");

    TestRunner.suite("Teacher Management - Class Teacher with Class");

    var ct = { id: "T-CT1", name: "Class Teacher", subject: "All", password: "p", isSubjectTeacher: false, isClassTeacher: true, classId: "CLASS-9A" };
    TestRunner.assertEqual(ct.classId, "CLASS-9A", "Class teacher has class assignment");
    var classFound = false;
    for (var i = 0; i < classes.length; i++) {
        if (classes[i].id === ct.classId) { classFound = true; break; }
    }
    TestRunner.assertTrue(classFound, "Assigned class exists in classes array");
}
