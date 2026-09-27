function runAssignmentTests() {
    TestRunner.suite("Assignments - Due Date Restrictions");

    var openAssign = { id: "TEST-OPEN-1", title: "Open Assignment", classId: "CLASS-TEST", dueDate: "2099-12-31", questions: ["q1"] };
    var closedAssign = { id: "TEST-CLOSED-1", title: "Old Assignment", classId: "CLASS-TEST", dueDate: "2000-01-01", questions: ["q1"] };

    TestRunner.assertType(isAssignmentClosed, "function", "isAssignmentClosed exists");
    TestRunner.assertType(getAssignmentState, "function", "getAssignmentState exists");
    TestRunner.assertType(getAssignmentAttempt, "function", "getAssignmentAttempt exists");
    TestRunner.assertType(getAttemptTypeLabel, "function", "getAttemptTypeLabel exists");

    TestRunner.assertFalse(isAssignmentClosed(openAssign), "Future due date is not closed");
    TestRunner.assertTrue(isAssignmentClosed(closedAssign), "Past due date is closed");

    var today = new Date();
    var todayYmd = today.getFullYear() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2);
    TestRunner.assertFalse(isAssignmentClosed({ dueDate: todayYmd }), "Assignment due today stays open until end of day");
    TestRunner.assertTrue(isAssignmentClosed({ dueDate: todayYmd }, Date.now() + 86400000), "Assignment closes after end of due day");

    TestRunner.suite("Assignments - Attempt State (single attempt)");

    TestRunner.assertEqual(getAssignmentState(openAssign, "s-anyone"), "available", "Open assignment with no attempt is available");
    TestRunner.assertEqual(getAssignmentState(closedAssign, "s-anyone"), "closed", "Past-due assignment with no attempt is closed");
    TestRunner.assertEqual(getAssignmentState(null, "s-anyone"), "available", "Missing assignment is safe");

    var savedAttempts = allAttempts;
    try {
        allAttempts = [
            { attemptId: "test-att-open", studentId: "s-test-1", assignmentId: "TEST-OPEN-1", score: 16, total: 20, percentage: 80 },
            { attemptId: "test-att-closed", studentId: "s-test-2", assignmentId: "TEST-CLOSED-1", score: 10, total: 20, percentage: 50 },
            { attemptId: "test-att-plain", studentId: "s-test-1", assignmentId: "", score: 5, total: 10, percentage: 50 }
        ];

        TestRunner.assertEqual(getAssignmentState(openAssign, "s-test-1"), "submitted", "Attempted assignment is submitted");
        TestRunner.assertEqual(getAssignmentState(closedAssign, "s-test-1"), "closed", "Student without attempt on closed assignment stays closed");
        TestRunner.assertEqual(getAssignmentState(closedAssign, "s-test-2"), "submitted", "Submitted takes precedence over closed");
        TestRunner.assertEqual(getAssignmentState(openAssign, "s-other"), "available", "Attempt by one student does not affect another");

        var found = getAssignmentAttempt("TEST-OPEN-1", "s-test-1");
        TestRunner.assertNotNull(found, "getAssignmentAttempt finds matching attempt");
        TestRunner.assertEqual(found.percentage, 80, "Found attempt has correct data");
        TestRunner.assertEqual(getAssignmentAttempt("TEST-MISSING", "s-test-1"), null, "getAssignmentAttempt returns null when no match");
        TestRunner.assertEqual(getAssignmentAttempt("TEST-OPEN-1", "nobody"), null, "getAssignmentAttempt returns null for other student");
    } finally {
        allAttempts = savedAttempts;
    }

    TestRunner.suite("Assignments - Result Type Labels");

    var lbl1 = getAttemptTypeLabel({ mode: "practice", topicPerformance: { "Network Topologies": { correct: 3, total: 5 } } });
    TestRunner.assertEqual(lbl1, "Network Topologies", "Single topic shows topic name");

    var lbl2 = getAttemptTypeLabel({ mode: "practice", questions: [{ topic: "Loops" }, { topic: "Loops" }] });
    TestRunner.assertEqual(lbl2, "Loops", "Topic derived from questions when topicPerformance missing");

    var lbl3 = getAttemptTypeLabel({ mode: "practice", topicPerformance: { TopicA: {}, TopicB: {} } });
    TestRunner.assertEqual(lbl3, "Practice", "Multiple topics without chapter info fall back to mode label");

    var lbl4 = getAttemptTypeLabel({ mode: "practice", topicPerformance: { General: {} } });
    TestRunner.assertEqual(lbl4, "Practice", "General-only topicPerformance falls back to mode label");

    var lbl4b = getAttemptTypeLabel({ mode: "practice", topicPerformance: { "7.1 HTML Structure": {}, "7.2 CSS Styling": {} } });
    TestRunner.assertEqual(lbl4b, "Chapter 7: Website Development", "Multiple topics show chapter name");

    try {
        assignments.push({ id: "TEST-LABEL-1", title: "Chapter 1 Quiz", classId: "CLASS-TEST" });
        var lbl5 = getAttemptTypeLabel({ mode: "assignment", assignmentId: "TEST-LABEL-1" });
        TestRunner.assertEqual(lbl5, "Chapter 1 Quiz", "Assignment shows teacher-created assignment name");
    } finally {
        assignments.pop();
    }

    var lbl6 = getAttemptTypeLabel({ mode: "assignment", assignmentId: "DELETED-ASSIGN" });
    TestRunner.assertEqual(lbl6, "Assignment", "Missing assignment falls back to mode label");

    var lbl7 = getAttemptTypeLabel({ mode: "weak" });
    TestRunner.assertEqual(lbl7, "Weak Areas", "Mode label uses Analytics.MODE_LABELS");

    var lbl8 = getAttemptTypeLabel(null);
    TestRunner.assertEqual(lbl8, "", "Null attempt returns empty label safely");
}
