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

    TestRunner.assertType(Auth.getRole(), "object", "Auth.getRole returns a value");
    var userBeforeLogin = Auth.getUser();
    TestRunner.assertTrue(userBeforeLogin === null || userBeforeLogin === undefined, "Auth.getUser null before login");

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

    runAnalyticsModuleTests();
}

function runAnalyticsModuleTests() {
    TestRunner.suite("Analytics Module - getClassOverview Empty");

    var emptyOverview = Analytics.getClassOverview([]);
    TestRunner.assertEqual(emptyOverview.totalAttempts, 0, "Empty: totalAttempts is 0");
    TestRunner.assertEqual(emptyOverview.uniqueStudents, 0, "Empty: uniqueStudents is 0");
    TestRunner.assertEqual(emptyOverview.averageScore, 0, "Empty: averageScore is 0");
    TestRunner.assertEqual(emptyOverview.averagePercentage, 0, "Empty: averagePercentage is 0");
    TestRunner.assertEqual(emptyOverview.accuracy, 0, "Empty: accuracy is 0");

    var nullOverview = Analytics.getClassOverview(null);
    TestRunner.assertEqual(nullOverview.totalAttempts, 0, "Null input: totalAttempts is 0");

    TestRunner.suite("Analytics Module - getClassOverview With Data");

    var testAttempts = [
        {
            attemptId: "a1", studentId: "s1", timestamp: "2026-09-01T10:00:00Z", completedAt: "2026-09-01T10:00:00Z",
            score: 8, total: 10, percentage: 80, questions: [
                { questionId: "q1", correct: true, topic: "T1", difficulty: "easy", bloom: "knowledge" },
                { questionId: "q2", correct: false, topic: "T1", difficulty: "easy", bloom: "knowledge" },
                { questionId: "q3", correct: true, topic: "T2", difficulty: "medium", bloom: "comprehension" },
                { questionId: "q4", correct: true, topic: "T2", difficulty: "medium", bloom: "comprehension" },
                { questionId: "q5", correct: true, topic: "T3", difficulty: "hard", bloom: "application" },
                { questionId: "q6", correct: true, topic: "T3", difficulty: "hard", bloom: "application" },
                { questionId: "q7", correct: true, topic: "T1", difficulty: "easy", bloom: "knowledge" },
                { questionId: "q8", correct: true, topic: "T1", difficulty: "easy", bloom: "knowledge" },
                { questionId: "q9", correct: true, topic: "T2", difficulty: "medium", bloom: "comprehension" },
                { questionId: "q10", correct: true, topic: "T2", difficulty: "medium", bloom: "comprehension" }
            ]
        },
        {
            attemptId: "a2", studentId: "s2", timestamp: "2026-09-02T10:00:00Z", completedAt: "2026-09-02T10:00:00Z",
            score: 5, total: 10, percentage: 50, questions: [
                { questionId: "q1", correct: false, topic: "T1", difficulty: "easy", bloom: "knowledge" },
                { questionId: "q2", correct: true, topic: "T1", difficulty: "easy", bloom: "knowledge" },
                { questionId: "q3", correct: false, topic: "T2", difficulty: "medium", bloom: "comprehension" },
                { questionId: "q4", correct: false, topic: "T2", difficulty: "medium", bloom: "comprehension" },
                { questionId: "q5", correct: true, topic: "T3", difficulty: "hard", bloom: "application" },
                { questionId: "q6", correct: true, topic: "T3", difficulty: "hard", bloom: "application" },
                { questionId: "q7", correct: true, topic: "T1", difficulty: "easy", bloom: "knowledge" },
                { questionId: "q8", correct: false, topic: "T1", difficulty: "easy", bloom: "knowledge" },
                { questionId: "q9", correct: true, topic: "T2", difficulty: "medium", bloom: "comprehension" },
                { questionId: "q10", correct: false, topic: "T2", difficulty: "medium", bloom: "comprehension" }
            ]
        },
        {
            attemptId: "a3", studentId: "s1", timestamp: "2026-09-03T10:00:00Z", completedAt: "2026-09-03T10:00:00Z",
            score: 9, total: 10, percentage: 90, questions: [
                { questionId: "q1", correct: true, topic: "T1", difficulty: "easy", bloom: "knowledge" },
                { questionId: "q2", correct: true, topic: "T1", difficulty: "easy", bloom: "knowledge" },
                { questionId: "q3", correct: true, topic: "T2", difficulty: "medium", bloom: "comprehension" },
                { questionId: "q4", correct: true, topic: "T2", difficulty: "medium", bloom: "comprehension" },
                { questionId: "q5", correct: true, topic: "T3", difficulty: "hard", bloom: "application" },
                { questionId: "q6", correct: true, topic: "T3", difficulty: "hard", bloom: "application" },
                { questionId: "q7", correct: true, topic: "T1", difficulty: "easy", bloom: "knowledge" },
                { questionId: "q8", correct: true, topic: "T1", difficulty: "easy", bloom: "knowledge" },
                { questionId: "q9", correct: false, topic: "T2", difficulty: "medium", bloom: "comprehension" },
                { questionId: "q10", correct: true, topic: "T2", difficulty: "medium", bloom: "comprehension" }
            ]
        }
    ];

    var overview = Analytics.getClassOverview(testAttempts);
    TestRunner.assertEqual(overview.totalAttempts, 3, "Overview: 3 attempts");
    TestRunner.assertEqual(overview.uniqueStudents, 2, "Overview: 2 unique students");
    TestRunner.assertEqual(overview.averageScore, 7.33, "Overview: average score");
    TestRunner.assertEqual(overview.averagePercentage, 73.33, "Overview: average percentage");
    TestRunner.assertEqual(overview.totalQuestions, 30, "Overview: 30 total questions");
    TestRunner.assertEqual(overview.correctAnswers, 23, "Overview: 23 correct answers");
    TestRunner.assertEqual(overview.incorrectAnswers, 7, "Overview: 7 incorrect answers");
    TestRunner.assertEqual(overview.accuracy, 76.67, "Overview: accuracy");

    TestRunner.suite("Analytics Module - getStudentPerformance");

    var studentPerf = Analytics.getStudentPerformance("s1", testAttempts);
    TestRunner.assertEqual(studentPerf.studentId, "s1", "Student: correct studentId");
    TestRunner.assertEqual(studentPerf.totalAttempts, 2, "Student: 2 attempts for s1");
    TestRunner.assertEqual(studentPerf.averagePercentage, 85, "Student: s1 average percentage");
    TestRunner.assertEqual(studentPerf.bestPercentage, 90, "Student: s1 best percentage");
    TestRunner.assertEqual(studentPerf.lowestPercentage, 80, "Student: s1 lowest percentage");
    TestRunner.assertEqual(studentPerf.correctAnswers, 18, "Student: s1 18 correct");
    TestRunner.assertEqual(studentPerf.incorrectAnswers, 2, "Student: s1 2 incorrect");
    TestRunner.assertEqual(studentPerf.accuracy, 90, "Student: s1 accuracy 90%");

    var studentPerf2 = Analytics.getStudentPerformance("s2", testAttempts);
    TestRunner.assertEqual(studentPerf2.studentId, "s2", "Student: correct studentId for s2");
    TestRunner.assertEqual(studentPerf2.totalAttempts, 1, "Student: 1 attempt for s2");
    TestRunner.assertEqual(studentPerf2.averagePercentage, 50, "Student: s2 average percentage");

    var unknownPerf = Analytics.getStudentPerformance("unknown", testAttempts);
    TestRunner.assertEqual(unknownPerf.totalAttempts, 0, "Student: unknown student has 0 attempts");

    var nullPerf = Analytics.getStudentPerformance(null, testAttempts);
    TestRunner.assertEqual(nullPerf.totalAttempts, 0, "Student: null studentId returns empty");

    TestRunner.suite("Analytics Module - getStudentPerformance Topic Strengths/Weaknesses");

    if (studentPerf.topicStrengths.length > 0) {
        TestRunner.assertTrue(studentPerf.topicStrengths[0].accuracy >= 70, "Student: first strength >= 70%");
    }
    if (studentPerf.topicWeaknesses.length > 0) {
        TestRunner.assertTrue(studentPerf.topicWeaknesses[0].accuracy < 70, "Student: first weakness < 70%");
    }

    TestRunner.suite("Analytics Module - getTopicMastery");

    var topicMastery = Analytics.getTopicMastery(testAttempts);
    TestRunner.assertGreaterThan(topicMastery.length, 0, "Topic: has topics");
    var t1 = null;
    for (var i = 0; i < topicMastery.length; i++) {
        if (topicMastery[i].topic === "T1") { t1 = topicMastery[i]; break; }
    }
    TestRunner.assertNotNull(t1, "Topic: T1 found");
    TestRunner.assertEqual(t1.totalQuestions, 12, "Topic: T1 has 12 questions");
    TestRunner.assertEqual(t1.correctAnswers, 9, "Topic: T1 has 9 correct");
    TestRunner.assertEqual(t1.incorrectAnswers, 3, "Topic: T1 has 3 incorrect");
    TestRunner.assertEqual(t1.accuracy, 75, "Topic: T1 accuracy 75%");
    TestRunner.assertEqual(t1.masteryLevel, "Developing", "Topic: T1 is Developing");

    var t3 = null;
    for (var i = 0; i < topicMastery.length; i++) {
        if (topicMastery[i].topic === "T3") { t3 = topicMastery[i]; break; }
    }
    TestRunner.assertNotNull(t3, "Topic: T3 found");
    TestRunner.assertEqual(t3.accuracy, 100, "Topic: T3 accuracy 100%");
    TestRunner.assertEqual(t3.masteryLevel, "Strong", "Topic: T3 is Strong");

    var emptyTopics = Analytics.getTopicMastery([]);
    TestRunner.assertEqual(emptyTopics.length, 0, "Topic: empty returns empty array");

    TestRunner.suite("Analytics Module - getTopicMastery Mastery Levels");

    var masteryTests = [
        { topic: "Strong1", totalQuestions: 10, correctAnswers: 9, expectedLevel: "Strong" },
        { topic: "Dev1", totalQuestions: 10, correctAnswers: 7, expectedLevel: "Developing" },
        { topic: "Needs1", totalQuestions: 10, correctAnswers: 3, expectedLevel: "Needs Support" }
    ];
    for (var i = 0; i < masteryTests.length; i++) {
        var mt = masteryTests[i];
        var fakeAttempts = [{
            attemptId: "f1", studentId: "s1", questions: []
        }];
        for (var j = 0; j < mt.totalQuestions; j++) {
            fakeAttempts[0].questions.push({
                questionId: "q" + j, correct: j < mt.correctAnswers, topic: mt.topic
            });
        }
        var tm = Analytics.getTopicMastery(fakeAttempts);
        var found = null;
        for (var j = 0; j < tm.length; j++) {
            if (tm[j].topic === mt.topic) { found = tm[j]; break; }
        }
        TestRunner.assertNotNull(found, "Mastery: " + mt.topic + " found");
        TestRunner.assertEqual(found.masteryLevel, mt.expectedLevel, "Mastery: " + mt.topic + " is " + mt.expectedLevel);
    }

    TestRunner.suite("Analytics Module - getQuestionStatistics");

    var qStats = Analytics.getQuestionStatistics(testAttempts);
    TestRunner.assertGreaterThan(qStats.length, 0, "Questions: has stats");
    var q1Stat = null;
    for (var i = 0; i < qStats.length; i++) {
        if (qStats[i].questionId === "q1") { q1Stat = qStats[i]; break; }
    }
    TestRunner.assertNotNull(q1Stat, "Questions: q1 stats found");
    TestRunner.assertEqual(q1Stat.attempts, 3, "Questions: q1 attempted 3 times");
    TestRunner.assertEqual(q1Stat.correct, 2, "Questions: q1 correct 2 times");
    TestRunner.assertEqual(q1Stat.incorrect, 1, "Questions: q1 incorrect 1 time");
    TestRunner.assertEqual(q1Stat.accuracy, 66.67, "Questions: q1 accuracy 66.67%");
    TestRunner.assertEqual(q1Stat.difficulty, "easy", "Questions: q1 difficulty easy");
    TestRunner.assertEqual(q1Stat.topic, "T1", "Questions: q1 topic T1");

    var emptyQStats = Analytics.getQuestionStatistics([]);
    TestRunner.assertEqual(emptyQStats.length, 0, "Questions: empty returns empty array");

    TestRunner.suite("Analytics Module - getQuestionStatistics Difficult Questions");

    var difficultCount = 0;
    for (var i = 0; i < qStats.length; i++) {
        if (qStats[i].accuracy < 50) difficultCount++;
    }
    TestRunner.assertType(difficultCount, "number", "Questions: difficult count is number");

    TestRunner.suite("Analytics Module - getDifficultyPerformance");

    var diffPerf = Analytics.getDifficultyPerformance(testAttempts);
    TestRunner.assertGreaterThan(diffPerf.length, 0, "Difficulty: has entries");
    var easyPerf = null;
    var mediumPerf = null;
    var hardPerf = null;
    for (var i = 0; i < diffPerf.length; i++) {
        if (diffPerf[i].difficulty === "easy") easyPerf = diffPerf[i];
        if (diffPerf[i].difficulty === "medium") mediumPerf = diffPerf[i];
        if (diffPerf[i].difficulty === "hard") hardPerf = diffPerf[i];
    }
    TestRunner.assertNotNull(easyPerf, "Difficulty: easy found");
    TestRunner.assertNotNull(mediumPerf, "Difficulty: medium found");
    TestRunner.assertNotNull(hardPerf, "Difficulty: hard found");

    TestRunner.assertEqual(easyPerf.attempts, 12, "Difficulty: easy has 12 attempts");
    TestRunner.assertEqual(easyPerf.correct, 9, "Difficulty: easy has 9 correct");
    TestRunner.assertEqual(easyPerf.accuracy, 75, "Difficulty: easy accuracy 75%");

    TestRunner.assertEqual(mediumPerf.attempts, 12, "Difficulty: medium has 12 attempts");
    TestRunner.assertEqual(mediumPerf.correct, 8, "Difficulty: medium has 8 correct");
    TestRunner.assertEqual(mediumPerf.accuracy, 66.67, "Difficulty: medium accuracy 66.67%");

    TestRunner.assertEqual(hardPerf.attempts, 6, "Difficulty: hard has 6 attempts");
    TestRunner.assertEqual(hardPerf.correct, 6, "Difficulty: hard has 6 correct");
    TestRunner.assertEqual(hardPerf.accuracy, 100, "Difficulty: hard accuracy 100%");

    var emptyDiff = Analytics.getDifficultyPerformance([]);
    TestRunner.assertEqual(emptyDiff.length, 0, "Difficulty: empty returns empty array");

    TestRunner.suite("Analytics Module - getBloomPerformance");

    var bloomPerf = Analytics.getBloomPerformance(testAttempts);
    TestRunner.assertGreaterThan(bloomPerf.length, 0, "Bloom: has entries");
    var knowledgePerf = null;
    var comprehensionPerf = null;
    var applicationPerf = null;
    for (var i = 0; i < bloomPerf.length; i++) {
        if (bloomPerf[i].bloom === "knowledge") knowledgePerf = bloomPerf[i];
        if (bloomPerf[i].bloom === "comprehension") comprehensionPerf = bloomPerf[i];
        if (bloomPerf[i].bloom === "application") applicationPerf = bloomPerf[i];
    }
    TestRunner.assertNotNull(knowledgePerf, "Bloom: knowledge found");
    TestRunner.assertNotNull(comprehensionPerf, "Bloom: comprehension found");
    TestRunner.assertNotNull(applicationPerf, "Bloom: application found");

    TestRunner.assertEqual(knowledgePerf.attempts, 12, "Bloom: knowledge has 12 attempts");
    TestRunner.assertEqual(knowledgePerf.correct, 9, "Bloom: knowledge has 9 correct");
    TestRunner.assertEqual(knowledgePerf.accuracy, 75, "Bloom: knowledge accuracy 75%");

    var emptyBloom = Analytics.getBloomPerformance([]);
    TestRunner.assertEqual(emptyBloom.length, 0, "Bloom: empty returns empty array");

    TestRunner.suite("Analytics Module - getAssessmentTrend");

    var trend = Analytics.getAssessmentTrend(testAttempts);
    TestRunner.assertGreaterThan(trend.length, 0, "Trend: has entries");
    TestRunner.assertEqual(trend.length, 3, "Trend: 3 entries for 3 attempts");

    var chronological = true;
    for (var i = 1; i < trend.length; i++) {
        var prev = new Date(trend[i - 1].timestamp).getTime();
        var curr = new Date(trend[i].timestamp).getTime();
        if (curr < prev) { chronological = false; break; }
    }
    TestRunner.assertTrue(chronological, "Trend: entries are chronological");

    TestRunner.assertEqual(trend[0].attemptId, "a1", "Trend: first is a1");
    TestRunner.assertEqual(trend[0].percentage, 80, "Trend: first percentage 80");
    TestRunner.assertEqual(trend[0].score, 8, "Trend: first score 8");
    TestRunner.assertEqual(trend[0].total, 10, "Trend: first total 10");

    var emptyTrend = Analytics.getAssessmentTrend([]);
    TestRunner.assertEqual(emptyTrend.length, 0, "Trend: empty returns empty array");

    TestRunner.suite("Analytics Module - getAtRiskStudents");

    var atRisk = Analytics.getAtRiskStudents(testAttempts);
    TestRunner.assertType(atRisk, "object", "AtRisk: returns array");

    var lowPerfAttempts = [];
    for (var i = 0; i < 5; i++) {
        lowPerfAttempts.push({
            attemptId: "low" + i, studentId: "lowStudent", timestamp: "2026-09-0" + (i + 1) + "T10:00:00Z",
            completedAt: "2026-09-0" + (i + 1) + "T10:00:00Z",
            score: 2, total: 10, percentage: 20, questions: [
                { questionId: "q1", correct: false, topic: "T1" },
                { questionId: "q2", correct: false, topic: "T1" },
                { questionId: "q3", correct: true, topic: "T2" },
                { questionId: "q4", correct: false, topic: "T2" },
                { questionId: "q5", correct: false, topic: "T3" },
                { questionId: "q6", correct: false, topic: "T3" },
                { questionId: "q7", correct: false, topic: "T1" },
                { questionId: "q8", correct: false, topic: "T1" },
                { questionId: "q9", correct: false, topic: "T2" },
                { questionId: "q10", correct: false, topic: "T2" }
            ]
        });
    }
    var lowRisk = Analytics.getAtRiskStudents(lowPerfAttempts);
    TestRunner.assertGreaterThan(lowRisk.length, 0, "AtRisk: low performance student flagged");
    var lowStudentRisk = null;
    for (var i = 0; i < lowRisk.length; i++) {
        if (lowRisk[i].studentId === "lowStudent") { lowStudentRisk = lowRisk[i]; break; }
    }
    TestRunner.assertNotNull(lowRisk[0], "AtRisk: has flagged student");
    TestRunner.assertGreaterThan(lowRisk[0].reasons.length, 0, "AtRisk: has reasons");
    TestRunner.assertEqual(lowRisk[0].riskLevel, "high", "AtRisk: low student is high risk");

    var singleAttempt = Analytics.getAtRiskStudents([testAttempts[0]]);
    TestRunner.assertEqual(singleAttempt.length, 0, "AtRisk: single attempt not flagged");

    var emptyRisk = Analytics.getAtRiskStudents([]);
    TestRunner.assertEqual(emptyRisk.length, 0, "AtRisk: empty returns empty array");

    TestRunner.suite("Analytics Module - Data Safety");

    var malformedAttempts = [
        { attemptId: "m1" },
        { attemptId: "m2", questions: null },
        { attemptId: "m3", questions: "not-array" },
        { attemptId: "m4", questions: [null, undefined] },
        { attemptId: "m5", studentId: null, percentage: "invalid" },
        {}
    ];
    var safeOverview = Analytics.getClassOverview(malformedAttempts);
    TestRunner.assertType(safeOverview, "object", "Safety: overview handles malformed data");
    TestRunner.assertType(safeOverview.totalAttempts, "number", "Safety: totalAttempts is number");

    var safeTopics = Analytics.getTopicMastery(malformedAttempts);
    TestRunner.assertType(safeTopics, "object", "Safety: topicMastery handles malformed data");

    var safeDiff = Analytics.getDifficultyPerformance(malformedAttempts);
    TestRunner.assertType(safeDiff, "object", "Safety: difficultyPerf handles malformed data");

    var safeBloom = Analytics.getBloomPerformance(malformedAttempts);
    TestRunner.assertType(safeBloom, "object", "Safety: bloomPerf handles malformed data");

    var safeTrend = Analytics.getAssessmentTrend(malformedAttempts);
    TestRunner.assertType(safeTrend, "object", "Safety: trend handles malformed data");

    var safeRisk = Analytics.getAtRiskStudents(malformedAttempts);
    TestRunner.assertType(safeRisk, "object", "Safety: atRisk handles malformed data");

    var safeStudent = Analytics.getStudentPerformance("s1", malformedAttempts);
    TestRunner.assertType(safeStudent, "object", "Safety: studentPerf handles malformed data");

    var safeQStats = Analytics.getQuestionStatistics(malformedAttempts);
    TestRunner.assertType(safeQStats, "object", "Safety: questionStats handles malformed data");

    TestRunner.suite("Analytics Module - No Data Mutation");

    var originalAttempt = JSON.parse(JSON.stringify(testAttempts[0]));
    Analytics.getClassOverview(testAttempts);
    Analytics.getStudentPerformance("s1", testAttempts);
    Analytics.getTopicMastery(testAttempts);
    Analytics.getQuestionStatistics(testAttempts);
    Analytics.getDifficultyPerformance(testAttempts);
    Analytics.getBloomPerformance(testAttempts);
    Analytics.getAssessmentTrend(testAttempts);
    Analytics.getAtRiskStudents(testAttempts);
    TestRunner.assertEqual(JSON.stringify(testAttempts[0]), JSON.stringify(originalAttempt), "No mutation: attempts unchanged after all analytics");

    TestRunner.suite("Analytics Module - Backward Compatibility");

    var legacyAttempt = {
        attemptId: "legacy-1",
        timestamp: "2026-01-01T00:00:00.000Z",
        studentId: "legacy-student",
        score: 5,
        total: 10,
        percentage: 50,
        questions: [
            { questionId: "q1", selectedAnswer: "A", correct: true, timeUsed: 0 },
            { questionId: "q2", selectedAnswer: "B", correct: false, timeUsed: 0 }
        ]
    };
    var legacyOverview = Analytics.getClassOverview([legacyAttempt]);
    TestRunner.assertEqual(legacyOverview.totalAttempts, 1, "Legacy: overview works");
    TestRunner.assertEqual(legacyOverview.correctAnswers, 1, "Legacy: correct counted");

    var legacyStudent = Analytics.getStudentPerformance("legacy-student", [legacyAttempt]);
    TestRunner.assertEqual(legacyStudent.totalAttempts, 1, "Legacy: student perf works");

    var legacyTopics = Analytics.getTopicMastery([legacyAttempt]);
    TestRunner.assertType(legacyTopics, "object", "Legacy: topic mastery works");

    var legacyTrend = Analytics.getAssessmentTrend([legacyAttempt]);
    TestRunner.assertEqual(legacyTrend.length, 1, "Legacy: trend works");
}

function runTeacherAnalyticsFlowTests() {
    TestRunner.suite("Teacher Analytics Flow - Data Functions Exist");

    TestRunner.assertType(getAttemptsForTeacher, "function", "getAttemptsForTeacher exists");
    TestRunner.assertType(normalizeAttemptsForAnalytics, "function", "normalizeAttemptsForAnalytics exists");
    TestRunner.assertType(getTeacherAnalyticsData, "function", "getTeacherAnalyticsData exists");
    TestRunner.assertType(getTeacherClassIds, "function", "getTeacherClassIds exists");
    TestRunner.assertType(TeacherAnalytics, "object", "TeacherAnalytics module exists");

    TestRunner.suite("Teacher Analytics Flow - Test A: Attempts Reach Analytics");

    var testAttempts = [
        { attemptId: "ta1", studentId: "s1", subject: "Computer Science", score: 8, total: 10, percentage: 80, timestamp: "2026-09-01T10:00:00Z", completedAt: "2026-09-01T10:00:00Z", questions: [{ questionId: "q1", correct: true, topic: "T1", difficulty: "easy", bloom: "knowledge" }] },
        { attemptId: "ta2", studentId: "s2", subject: "Computer Science", score: 5, total: 10, percentage: 50, timestamp: "2026-09-02T10:00:00Z", completedAt: "2026-09-02T10:00:00Z", questions: [{ questionId: "q1", correct: false, topic: "T1", difficulty: "easy", bloom: "knowledge" }] }
    ];
    var originalAttempts = allAttempts.slice();
    allAttempts = testAttempts;
    var data = getTeacherAnalyticsData({});
    TestRunner.assertGreaterThan(data.attempts.length, 0, "Data flow: attempts retrieved");
    TestRunner.assertEqual(data.attempts.length, 2, "Data flow: 2 attempts");
    var overview = Analytics.getClassOverview(data.attempts);
    TestRunner.assertEqual(overview.totalAttempts, 2, "Data flow: analytics received 2 attempts");
    TestRunner.assertEqual(overview.averagePercentage, 65, "Data flow: analytics calculated correct average");
    allAttempts = originalAttempts;

    TestRunner.suite("Teacher Analytics Flow - Test B: Empty Data");

    var emptyData = getTeacherAnalyticsData({});
    TestRunner.assertEqual(emptyData.attempts.length, 0, "Empty data: 0 attempts");
    var emptyOverview = Analytics.getClassOverview(emptyData.attempts);
    TestRunner.assertEqual(emptyOverview.totalAttempts, 0, "Empty data: analytics returns 0");
    TestRunner.assertEqual(emptyOverview.averagePercentage, 0, "Empty data: analytics returns 0 average");

    TestRunner.suite("Teacher Analytics Flow - Test C: Legacy/Malformed Data");

    var legacyAttempts = [
        { attemptId: "legacy-1", studentId: "legacy-s1", score: 5, total: 10, percentage: 50, questions: [{ questionId: "q1", correct: true }] },
        { attemptId: "legacy-2", studentId: "legacy-s2", percentage: "invalid" },
        { attemptId: "legacy-3" },
        null,
        { questions: null }
    ];
    var origAttempts2 = allAttempts.slice();
    allAttempts = legacyAttempts;
    var legacyData = getTeacherAnalyticsData({});
    TestRunner.assertType(legacyData.attempts, "object", "Legacy: data flow returns array");
    var legacyOverview2 = Analytics.getClassOverview(legacyData.attempts);
    TestRunner.assertType(legacyOverview2.totalAttempts, "number", "Legacy: analytics handles malformed data");
    TestRunner.assertTrue(!isNaN(legacyOverview2.averagePercentage), "Legacy: no NaN in results");
    allAttempts = origAttempts2;

    TestRunner.suite("Teacher Analytics Flow - Test D: Teacher Scope");

    var scopeAttempts = [
        { attemptId: "sc1", studentId: "classA-s1", subject: "CS", score: 8, total: 10, percentage: 80, questions: [] },
        { attemptId: "sc2", studentId: "classA-s2", subject: "CS", score: 7, total: 10, percentage: 70, questions: [] },
        { attemptId: "sc3", studentId: "classB-s1", subject: "CS", score: 9, total: 10, percentage: 90, questions: [] }
    ];
    var origStudents = studentAccounts.slice();
    var origAttempts3 = allAttempts.slice();
    studentAccounts = [
        { id: "classA-s1", classId: "CLASS-A", name: "Student 1" },
        { id: "classA-s2", classId: "CLASS-A", name: "Student 2" },
        { id: "classB-s1", classId: "CLASS-B", name: "Student 3" }
    ];
    allAttempts = scopeAttempts;
    var classAData = getTeacherAnalyticsData({ classId: "CLASS-A" });
    TestRunner.assertEqual(classAData.attempts.length, 2, "Scope: class filter returns 2 attempts");
    var classAOverview = Analytics.getClassOverview(classAData.attempts);
    TestRunner.assertEqual(classAOverview.averagePercentage, 75, "Scope: class filter calculates correct average");
    var teacherScopeData = getTeacherAnalyticsData({ teacherClasses: ["CLASS-A"] });
    TestRunner.assertEqual(teacherScopeData.attempts.length, 2, "Scope: teacherClasses filter works");
    var allData = getTeacherAnalyticsData({});
    TestRunner.assertEqual(allData.attempts.length, 3, "Scope: no filter returns all");
    studentAccounts = origStudents;
    allAttempts = origAttempts3;

    TestRunner.suite("Teacher Analytics Flow - Test E: Backend Failure");

    var failOverview = TeacherAnalytics.getClassOverview({});
    TestRunner.assertType(failOverview, "object", "Backend fail: returns object");
    TestRunner.assertEqual(failOverview.totalAttempts, 0, "Backend fail: safe default");
    var failTopics = TeacherAnalytics.getTopicMastery({});
    TestRunner.assertType(failTopics, "object", "Backend fail: topics returns array");
    var failRisk = TeacherAnalytics.getAtRiskStudents({});
    TestRunner.assertType(failRisk, "object", "Backend fail: atRisk returns array");

    TestRunner.suite("Teacher Analytics Flow - Test F: Analytics Isolation");

    TestRunner.assertType(Analytics.getClassOverview, "function", "Isolation: Analytics.getClassOverview is function");
    TestRunner.assertType(Analytics.getStudentPerformance, "function", "Isolation: Analytics.getStudentPerformance is function");
    TestRunner.assertType(Analytics.getTopicMastery, "function", "Isolation: Analytics.getTopicMastery is function");

    var isolationAttempts = [{ attemptId: "i1", studentId: "s1", percentage: 80, questions: [{ questionId: "q1", correct: true, topic: "T1" }] }];
    var origAttempts4 = allAttempts.slice();
    allAttempts = isolationAttempts;
    var isoData = getTeacherAnalyticsData({});
    TestRunner.assertEqual(isoData.attempts.length, 1, "Isolation: data flow works");
    var isoOverview = Analytics.getClassOverview(isoData.attempts);
    TestRunner.assertEqual(isoOverview.totalAttempts, 1, "Isolation: analytics works on filtered data");
    TestRunner.assertEqual(isoOverview.averagePercentage, 80, "Isolation: analytics correct");
    allAttempts = origAttempts4;

    TestRunner.suite("Teacher Analytics Flow - Normalization");

    var normAttempts = [
        { attemptId: "n1", studentId: "s1", score: 8, total: 10, percentage: 80, questions: [{ questionId: "q1", correct: true, topic: "T1" }] },
        { attemptId: "n2", studentId: "s2" },
        { attemptId: "n3", studentId: "s3", questions: "not-array" }
    ];
    var origAttempts5 = allAttempts.slice();
    allAttempts = normAttempts;
    var normData = getTeacherAnalyticsData({});
    TestRunner.assertEqual(normData.attempts.length, 3, "Normalization: all attempts included");
    TestRunner.assertEqual(normData.attempts[1].score, 0, "Normalization: missing score defaults to 0");
    TestRunner.assertEqual(normData.attempts[1].percentage, 0, "Normalization: missing percentage defaults to 0");
    TestRunner.assertType(normData.attempts[2].questions, "object", "Normalization: invalid questions becomes array");
    TestRunner.assertEqual(normData.attempts[2].questions.length, 0, "Normalization: invalid questions is empty array");
    allAttempts = origAttempts5;

    TestRunner.suite("Teacher Analytics Flow - TeacherAnalytics Module");

    var origAttempts6 = allAttempts.slice();
    allAttempts = [
        { attemptId: "ta1", studentId: "s1", subject: "CS", score: 8, total: 10, percentage: 80, timestamp: "2026-09-01T10:00:00Z", completedAt: "2026-09-01T10:00:00Z", questions: [{ questionId: "q1", correct: true, topic: "T1", difficulty: "easy", bloom: "knowledge" }] }
    ];
    var taOverview = TeacherAnalytics.getClassOverview({});
    TestRunner.assertEqual(taOverview.totalAttempts, 1, "TeacherAnalytics: overview works");
    var taTopic = TeacherAnalytics.getTopicMastery({});
    TestRunner.assertGreaterThan(taTopic.length, 0, "TeacherAnalytics: topics works");
    var taTrend = TeacherAnalytics.getAssessmentTrend({});
    TestRunner.assertEqual(taTrend.length, 1, "TeacherAnalytics: trend works");
    var taFull = TeacherAnalytics.getFullAnalytics({});
    TestRunner.assertType(taFull.overview, "object", "TeacherAnalytics: full analytics has overview");
    TestRunner.assertType(taFull.topicMastery, "object", "TeacherAnalytics: full analytics has topics");
    allAttempts = origAttempts6;

    TestRunner.suite("Analytics - getTeacherOverview: Basic Functionality");

    var overviewTests = [
        { attemptId: "ov1", studentId: "s1", percentage: 80, score: 8, total: 10, completedAt: "2026-09-10T10:00:00Z", timestamp: "2026-09-10T10:00:00Z", questions: [{ questionId: "q1", correct: true }] },
        { attemptId: "ov2", studentId: "s2", percentage: 60, score: 6, total: 10, completedAt: "2026-09-11T10:00:00Z", timestamp: "2026-09-11T10:00:00Z", questions: [{ questionId: "q2", correct: false }] },
        { attemptId: "ov3", studentId: "s1", percentage: 90, score: 9, total: 10, completedAt: "2026-09-12T10:00:00Z", timestamp: "2026-09-12T10:00:00Z", questions: [{ questionId: "q3", correct: true }] }
    ];
    var origAttemptsOv = allAttempts.slice();
    allAttempts = overviewTests;

    var ov = Analytics.getTeacherOverview(allAttempts, 5);
    TestRunner.assertType(ov, "object", "getTeacherOverview returns object");
    TestRunner.assertEqual(ov.totalAttempts, 3, "getTeacherOverview: totalAttempts correct");
    TestRunner.assertEqual(ov.uniqueStudents, 2, "getTeacherOverview: uniqueStudents correct");
    TestRunner.assertEqual(ov.totalStudents, 5, "getTeacherOverview: totalStudents passed through");
    TestRunner.assertGreaterThan(ov.averagePercentage, 0, "getTeacherOverview: averagePercentage calculated");
    TestRunner.assertGreaterThan(ov.accuracy, 0, "getTeacherOverview: accuracy calculated");
    TestRunner.assertType(ov.activeStudents, "number", "getTeacherOverview: activeStudents is number");
    TestRunner.assertType(ov.participationRate, "number", "getTeacherOverview: participationRate is number");
    TestRunner.assertType(ov.trendDirection, "string", "getTeacherOverview: trendDirection is string");

    allAttempts = origAttemptsOv;

    TestRunner.suite("Analytics - getTeacherOverview: Empty Data");

    var emptyOv = Analytics.getTeacherOverview([], 0);
    TestRunner.assertEqual(emptyOv.totalAttempts, 0, "Empty overview: totalAttempts is 0");
    TestRunner.assertEqual(emptyOv.uniqueStudents, 0, "Empty overview: uniqueStudents is 0");
    TestRunner.assertEqual(emptyOv.totalStudents, 0, "Empty overview: totalStudents is 0");
    TestRunner.assertEqual(emptyOv.activeStudents, 0, "Empty overview: activeStudents is 0");
    TestRunner.assertEqual(emptyOv.participationRate, 0, "Empty overview: participationRate is 0");
    TestRunner.assertEqual(emptyOv.trendDirection, "stable", "Empty overview: trendDirection is stable");

    TestRunner.suite("Analytics - getTeacherOverview: Active Students");

    var activeTests = [
        { attemptId: "a1", studentId: "s1", percentage: 75, completedAt: new Date().toISOString(), timestamp: new Date().toISOString(), questions: [] },
        { attemptId: "a2", studentId: "s2", percentage: 80, completedAt: "2025-01-01T10:00:00Z", timestamp: "2025-01-01T10:00:00Z", questions: [] }
    ];
    var origAttemptsActive = allAttempts.slice();
    allAttempts = activeTests;

    var activeOv = Analytics.getTeacherOverview(allAttempts, 10);
    TestRunner.assertEqual(activeOv.activeStudents, 1, "Active students: only recent student counted");
    TestRunner.assertEqual(activeOv.participationRate, 10, "Participation rate: 1/10 = 10%");

    allAttempts = origAttemptsActive;

    TestRunner.suite("Analytics - getTeacherOverview: Trend Direction");

    // Create declining trend
    var decliningTests = [];
    for (var i = 0; i < 6; i++) {
        decliningTests.push({
            attemptId: "dt" + i,
            studentId: "s" + i,
            percentage: 90 - (i * 10),
            completedAt: "2026-09-" + (1 + i) + "T10:00:00Z",
            timestamp: "2026-09-" + (1 + i) + "T10:00:00Z",
            questions: []
        });
    }
    var origAttemptsDecline = allAttempts.slice();
    allAttempts = decliningTests;

    var declineOv = Analytics.getTeacherOverview(allAttempts, 5);
    TestRunner.assertEqual(declineOv.trendDirection, "declining", "Trend: declining detected");

    allAttempts = origAttemptsDecline;

    // Create improving trend
    var improvingTests = [];
    for (var i = 0; i < 6; i++) {
        improvingTests.push({
            attemptId: "it" + i,
            studentId: "s" + i,
            percentage: 40 + (i * 10),
            completedAt: "2026-09-" + (1 + i) + "T10:00:00Z",
            timestamp: "2026-09-" + (1 + i) + "T10:00:00Z",
            questions: []
        });
    }
    var origAttemptsImprove = allAttempts.slice();
    allAttempts = improvingTests;

    var improveOv = Analytics.getTeacherOverview(allAttempts, 5);
    TestRunner.assertEqual(improveOv.trendDirection, "improving", "Trend: improving detected");

    allAttempts = origAttemptsImprove;

    TestRunner.suite("Analytics - getTeacherOverview: Safe Defaults");

    var safeOv = Analytics.getTeacherOverview(null, null);
    TestRunner.assertEqual(safeOv.totalAttempts, 0, "Safe defaults: null attempts handled");
    TestRunner.assertEqual(safeOv.totalStudents, 0, "Safe defaults: null totalStudents handled");

    var safeOv2 = Analytics.getTeacherOverview("invalid", "invalid");
    TestRunner.assertEqual(safeOv2.totalAttempts, 0, "Safe defaults: invalid inputs handled");

    TestRunner.suite("TeacherAnalytics - getTeacherOverview: Integration");

    var origAttemptsTA = allAttempts.slice();
    var origStudentsTA = studentAccounts.slice();
    studentAccounts = [
        { id: "ta-s1", classId: "TA-CLASS", name: "TA Student 1" },
        { id: "ta-s2", classId: "TA-CLASS", name: "TA Student 2" }
    ];
    allAttempts = [
        { attemptId: "ta-ov1", studentId: "ta-s1", percentage: 85, completedAt: new Date().toISOString(), timestamp: new Date().toISOString(), questions: [{ correct: true }] }
    ];

    var taOv = TeacherAnalytics.getTeacherOverview({ teacherClasses: ["TA-CLASS"] });
    TestRunner.assertType(taOv, "object", "TeacherAnalytics.getTeacherOverview returns object");
    TestRunner.assertEqual(taOv.totalAttempts, 1, "TeacherAnalytics: totalAttempts correct");
    TestRunner.assertEqual(taOv.totalStudents, 2, "TeacherAnalytics: totalStudents from studentAccounts");

    studentAccounts = origStudentsTA;
    allAttempts = origAttemptsTA;

    TestRunner.suite("Analytics - getClassPerformanceDistribution: Basic Functionality");

    var distTests = [
        { attemptId: "d1", studentId: "s1", percentage: 90, questions: [] },
        { attemptId: "d2", studentId: "s2", percentage: 80, questions: [] },
        { attemptId: "d3", studentId: "s3", percentage: 65, questions: [] },
        { attemptId: "d4", studentId: "s4", percentage: 55, questions: [] },
        { attemptId: "d5", studentId: "s5", percentage: 40, questions: [] },
        { attemptId: "d6", studentId: "s6", percentage: 30, questions: [] }
    ];
    var origAttemptsDist = allAttempts.slice();
    allAttempts = distTests;

    var dist = Analytics.getClassPerformanceDistribution(allAttempts);
    TestRunner.assertType(dist, "object", "getClassPerformanceDistribution returns object");
    TestRunner.assertEqual(dist.totalAttempts, 6, "Distribution: totalAttempts correct");
    TestRunner.assertEqual(dist.strong, 2, "Distribution: strong count correct (80%+)");
    TestRunner.assertEqual(dist.developing, 2, "Distribution: developing count correct (50-79%)");
    TestRunner.assertEqual(dist.needsSupport, 2, "Distribution: needsSupport count correct (<50%)");
    TestRunner.assertEqual(dist.strongPct, 33.3, "Distribution: strongPct correct");
    TestRunner.assertEqual(dist.developingPct, 33.3, "Distribution: developingPct correct");
    TestRunner.assertEqual(dist.needsSupportPct, 33.3, "Distribution: needsSupportPct correct");
    TestRunner.assertEqual(dist.dominantLevel, "Strong", "Distribution: dominantLevel is Strong (tie broken by Strong)");

    allAttempts = origAttemptsDist;

    TestRunner.suite("Analytics - getClassPerformanceDistribution: Empty Data");

    var emptyDist = Analytics.getClassPerformanceDistribution([]);
    TestRunner.assertEqual(emptyDist.totalAttempts, 0, "Empty distribution: totalAttempts is 0");
    TestRunner.assertEqual(emptyDist.strong, 0, "Empty distribution: strong is 0");
    TestRunner.assertEqual(emptyDist.developing, 0, "Empty distribution: developing is 0");
    TestRunner.assertEqual(emptyDist.needsSupport, 0, "Empty distribution: needsSupport is 0");
    TestRunner.assertEqual(emptyDist.dominantLevel, "Developing", "Empty distribution: dominantLevel is Developing");

    TestRunner.suite("Analytics - getClassPerformanceDistribution: Safe Defaults");

    var safeDist = Analytics.getClassPerformanceDistribution(null);
    TestRunner.assertEqual(safeDist.totalAttempts, 0, "Safe distribution: null handled");

    var safeDist2 = Analytics.getClassPerformanceDistribution("invalid");
    TestRunner.assertEqual(safeDist2.totalAttempts, 0, "Safe distribution: invalid handled");

    TestRunner.suite("Analytics - getAssessmentComparison: Basic Functionality");

    var compTests = [
        { attemptId: "c1", studentId: "s1", percentage: 80, subject: "Math", title: "Math Quiz 1", questions: [{ correct: true }, { correct: false }] },
        { attemptId: "c2", studentId: "s2", percentage: 70, subject: "Math", title: "Math Quiz 1", questions: [{ correct: true }, { correct: true }] },
        { attemptId: "c3", studentId: "s1", percentage: 90, subject: "Science", title: "Science Test", questions: [{ correct: true }] }
    ];
    var origAttemptsComp = allAttempts.slice();
    allAttempts = compTests;

    var comp = Analytics.getAssessmentComparison(allAttempts);
    TestRunner.assertType(comp, "object", "getAssessmentComparison returns array");
    TestRunner.assertEqual(comp.length, 2, "Comparison: two assessments found");
    TestRunner.assertEqual(comp[0].label, "Science Test", "Comparison: higher avg first");
    TestRunner.assertEqual(comp[0].averagePercentage, 90, "Comparison: Science avg correct");
    TestRunner.assertEqual(comp[1].label, "Math Quiz 1", "Comparison: Math second");
    TestRunner.assertEqual(comp[1].averagePercentage, 75, "Comparison: Math avg correct");
    TestRunner.assertEqual(comp[1].attempts, 2, "Comparison: Math attempts correct");
    TestRunner.assertEqual(comp[1].totalQuestions, 4, "Comparison: Math total questions correct");
    TestRunner.assertEqual(comp[1].correctAnswers, 3, "Comparison: Math correct answers correct");

    allAttempts = origAttemptsComp;

    TestRunner.suite("Analytics - getAssessmentComparison: Empty Data");

    var emptyComp = Analytics.getAssessmentComparison([]);
    TestRunner.assertType(emptyComp, "object", "Empty comparison returns array");
    TestRunner.assertEqual(emptyComp.length, 0, "Empty comparison: no entries");

    TestRunner.suite("Analytics - getAssessmentComparison: Safe Defaults");

    var safeComp = Analytics.getAssessmentComparison(null);
    TestRunner.assertEqual(safeComp.length, 0, "Safe comparison: null handled");

    TestRunner.suite("TeacherAnalytics - getClassPerformanceDistribution: Integration");

    var origAttemptsDistTA = allAttempts.slice();
    var origStudentsDistTA = studentAccounts.slice();
    studentAccounts = [
        { id: "dist-s1", classId: "DIST-CLASS", name: "Dist Student 1" },
        { id: "dist-s2", classId: "DIST-CLASS", name: "Dist Student 2" }
    ];
    allAttempts = [
        { attemptId: "dist-a1", studentId: "dist-s1", percentage: 90, questions: [] },
        { attemptId: "dist-a2", studentId: "dist-s2", percentage: 45, questions: [] }
    ];

    var taDist = TeacherAnalytics.getClassPerformanceDistribution({ classId: "DIST-CLASS" });
    TestRunner.assertType(taDist, "object", "TeacherAnalytics.getClassPerformanceDistribution returns object");
    TestRunner.assertEqual(taDist.totalAttempts, 2, "TeacherAnalytics distribution: totalAttempts correct");
    TestRunner.assertEqual(taDist.strong, 1, "TeacherAnalytics distribution: strong correct");
    TestRunner.assertEqual(taDist.needsSupport, 1, "TeacherAnalytics distribution: needsSupport correct");

    studentAccounts = origStudentsDistTA;
    allAttempts = origAttemptsDistTA;

    TestRunner.suite("TeacherAnalytics - getAssessmentComparison: Integration");

    var origAttemptsCompTA = allAttempts.slice();
    allAttempts = [
        { attemptId: "comp-ta1", studentId: "s1", percentage: 80, subject: "English", questions: [{ correct: true }] },
        { attemptId: "comp-ta2", studentId: "s2", percentage: 60, subject: "English", questions: [{ correct: false }] }
    ];

    var taComp = TeacherAnalytics.getAssessmentComparison({});
    TestRunner.assertType(taComp, "object", "TeacherAnalytics.getAssessmentComparison returns array");
    TestRunner.assertGreaterThan(taComp.length, 0, "TeacherAnalytics comparison: has entries");

    allAttempts = origAttemptsCompTA;

    TestRunner.suite("Analytics - getTrendDirection: Basic Functionality");

    var trendTests = [
        { attemptId: "t1", studentId: "s1", percentage: 50, completedAt: "2026-09-01T10:00:00Z", timestamp: "2026-09-01T10:00:00Z" },
        { attemptId: "t2", studentId: "s2", percentage: 55, completedAt: "2026-09-02T10:00:00Z", timestamp: "2026-09-02T10:00:00Z" },
        { attemptId: "t3", studentId: "s3", percentage: 60, completedAt: "2026-09-03T10:00:00Z", timestamp: "2026-09-03T10:00:00Z" },
        { attemptId: "t4", studentId: "s4", percentage: 65, completedAt: "2026-09-04T10:00:00Z", timestamp: "2026-09-04T10:00:00Z" }
    ];
    var origAttemptsTrend = allAttempts.slice();
    allAttempts = trendTests;

    var improvingTrend = Analytics.getTrendDirection(allAttempts);
    TestRunner.assertEqual(improvingTrend, "improving", "Trend direction: improving detected");

    var decliningTests = [
        { attemptId: "d1", studentId: "s1", percentage: 80, completedAt: "2026-09-01T10:00:00Z", timestamp: "2026-09-01T10:00:00Z" },
        { attemptId: "d2", studentId: "s2", percentage: 70, completedAt: "2026-09-02T10:00:00Z", timestamp: "2026-09-02T10:00:00Z" },
        { attemptId: "d3", studentId: "s3", percentage: 60, completedAt: "2026-09-03T10:00:00Z", timestamp: "2026-09-03T10:00:00Z" },
        { attemptId: "d4", studentId: "s4", percentage: 50, completedAt: "2026-09-04T10:00:00Z", timestamp: "2026-09-04T10:00:00Z" }
    ];
    allAttempts = decliningTests;
    var decliningTrend = Analytics.getTrendDirection(allAttempts);
    TestRunner.assertEqual(decliningTrend, "declining", "Trend direction: declining detected");

    var stableTests = [
        { attemptId: "s1", studentId: "s1", percentage: 70, completedAt: "2026-09-01T10:00:00Z", timestamp: "2026-09-01T10:00:00Z" },
        { attemptId: "s2", studentId: "s2", percentage: 71, completedAt: "2026-09-02T10:00:00Z", timestamp: "2026-09-02T10:00:00Z" },
        { attemptId: "s3", studentId: "s3", percentage: 69, completedAt: "2026-09-03T10:00:00Z", timestamp: "2026-09-03T10:00:00Z" }
    ];
    allAttempts = stableTests;
    var stableTrend = Analytics.getTrendDirection(allAttempts);
    TestRunner.assertEqual(stableTrend, "stable", "Trend direction: stable detected");

    allAttempts = origAttemptsTrend;

    TestRunner.suite("Analytics - getTrendDirection: Insufficient Data");

    var singleTrend = Analytics.getTrendDirection([{ percentage: 70 }]);
    TestRunner.assertEqual(singleTrend, "insufficient_data", "Trend direction: insufficient data for 1 attempt");

    var emptyTrend = Analytics.getTrendDirection([]);
    TestRunner.assertEqual(emptyTrend, "insufficient_data", "Trend direction: insufficient data for 0 attempts");

    TestRunner.suite("Analytics - getTrendDirection: Safe Defaults");

    var nullTrend = Analytics.getTrendDirection(null);
    TestRunner.assertEqual(nullTrend, "insufficient_data", "Trend direction: null handled");

    var invalidTrend = Analytics.getTrendDirection("invalid");
    TestRunner.assertEqual(invalidTrend, "insufficient_data", "Trend direction: invalid handled");

    TestRunner.suite("Analytics - getTopicMastery: Basic Functionality");

    var topicTests = [
        { attemptId: "tm1", studentId: "s1", questions: [
            { questionId: "q1", topic: "Algorithms", correct: true },
            { questionId: "q2", topic: "Algorithms", correct: false },
            { questionId: "q3", topic: "Data Structures", correct: true }
        ]},
        { attemptId: "tm2", studentId: "s2", questions: [
            { questionId: "q1", topic: "Algorithms", correct: true },
            { questionId: "q4", topic: "Networks", correct: false },
            { questionId: "q5", topic: "Networks", correct: false }
        ]}
    ];
    var origAttemptsTopic = allAttempts.slice();
    allAttempts = topicTests;

    var topics = Analytics.getTopicMastery(allAttempts);
    TestRunner.assertType(topics, "object", "getTopicMastery returns array");
    TestRunner.assertEqual(topics.length, 3, "Topic mastery: 3 topics found");
    TestRunner.assertEqual(topics[0].topic, "Data Structures", "Topic mastery: strongest topic first");
    TestRunner.assertEqual(topics[0].masteryLevel, "Strong", "Topic mastery: Data Structures is Strong");
    TestRunner.assertEqual(topics[2].topic, "Networks", "Topic mastery: weakest topic last");
    TestRunner.assertEqual(topics[2].masteryLevel, "Needs Support", "Topic mastery: Networks is Needs Support");

    allAttempts = origAttemptsTopic;

    TestRunner.suite("Analytics - getTopicMastery: Empty Data");

    var emptyTopics = Analytics.getTopicMastery([]);
    TestRunner.assertType(emptyTopics, "object", "Empty topic mastery returns array");
    TestRunner.assertEqual(emptyTopics.length, 0, "Empty topic mastery: no topics");

    TestRunner.suite("Analytics - getTopicMastery: Safe Defaults");

    var nullTopics = Analytics.getTopicMastery(null);
    TestRunner.assertEqual(nullTopics.length, 0, "Safe topic mastery: null handled");

    TestRunner.suite("Analytics - getQuestionStatistics: Basic Functionality");

    var qStatsTests = [
        { attemptId: "qs1", studentId: "s1", questions: [
            { questionId: "Q-EASY", topic: "Basics", correct: true, difficulty: "easy", timeUsed: 10 },
            { questionId: "Q-EASY", topic: "Basics", correct: true, difficulty: "easy", timeUsed: 12 },
            { questionId: "Q-HARD", topic: "Algorithms", correct: false, difficulty: "hard", timeUsed: 45 },
            { questionId: "Q-HARD", topic: "Algorithms", correct: false, difficulty: "hard", timeUsed: 50 }
        ]},
        { attemptId: "qs2", studentId: "s2", questions: [
            { questionId: "Q-EASY", topic: "Basics", correct: true, difficulty: "easy", timeUsed: 8 },
            { questionId: "Q-HARD", topic: "Algorithms", correct: true, difficulty: "hard", timeUsed: 40 }
        ]}
    ];
    var origAttemptsQStats = allAttempts.slice();
    allAttempts = qStatsTests;

    var qStats = Analytics.getQuestionStatistics(allAttempts);
    TestRunner.assertType(qStats, "object", "getQuestionStatistics returns array");
    TestRunner.assertEqual(qStats.length, 2, "Question stats: 2 questions found");
    TestRunner.assertEqual(qStats[0].questionId, "Q-HARD", "Question stats: hardest question first");
    TestRunner.assertEqual(qStats[0].accuracy, 33.33, "Question stats: Q-HARD accuracy correct");
    TestRunner.assertEqual(qStats[0].attempts, 3, "Question stats: Q-HARD attempts correct");
    TestRunner.assertEqual(qStats[1].questionId, "Q-EASY", "Question stats: easiest question second");
    TestRunner.assertEqual(qStats[1].accuracy, 100, "Question stats: Q-EASY accuracy correct");

    allAttempts = origAttemptsQStats;

    TestRunner.suite("Analytics - getQuestionStatistics: Empty Data");

    var emptyQStats = Analytics.getQuestionStatistics([]);
    TestRunner.assertType(emptyQStats, "object", "Empty question stats returns array");
    TestRunner.assertEqual(emptyQStats.length, 0, "Empty question stats: no questions");

    TestRunner.suite("Analytics - getQuestionStatistics: Safe Defaults");

    var nullQStats = Analytics.getQuestionStatistics(null);
    TestRunner.assertEqual(nullQStats.length, 0, "Safe question stats: null handled");

    var malformedQStats = Analytics.getQuestionStatistics([{ questions: [null, { questionId: "q1" }, { noQuestionId: true }] }]);
    TestRunner.assertEqual(malformedQStats.length, 1, "Malformed question stats: only valid question counted");

    TestRunner.suite("TeacherAnalytics - getTopicMastery: Integration");

    var origAttemptsTopicTA = allAttempts.slice();
    allAttempts = [
        { attemptId: "tm-ta1", studentId: "s1", questions: [
            { questionId: "q1", topic: "Algorithms", correct: true },
            { questionId: "q2", topic: "Networks", correct: false }
        ]}
    ];

    var taTopics = TeacherAnalytics.getTopicMastery({});
    TestRunner.assertType(taTopics, "object", "TeacherAnalytics.getTopicMastery returns array");
    TestRunner.assertGreaterThan(taTopics.length, 0, "TeacherAnalytics topic mastery: has entries");

    allAttempts = origAttemptsTopicTA;

    TestRunner.suite("TeacherAnalytics - getQuestionStatistics: Integration");

    var origAttemptsQTA = allAttempts.slice();
    allAttempts = [
        { attemptId: "qs-ta1", studentId: "s1", questions: [
            { questionId: "Q-TEST", topic: "Basics", correct: false, timeUsed: 20 },
            { questionId: "Q-TEST", topic: "Basics", correct: false, timeUsed: 25 }
        ]}
    ];

    var taQStats = TeacherAnalytics.getQuestionStatistics({});
    TestRunner.assertType(taQStats, "object", "TeacherAnalytics.getQuestionStatistics returns array");
    TestRunner.assertGreaterThan(taQStats.length, 0, "TeacherAnalytics question stats: has entries");

    allAttempts = origAttemptsQTA;

    TestRunner.suite("Analytics - getStudentPerformance: Basic Functionality");

    var studentPerfTests = [
        { attemptId: "sp1", studentId: "stu1", percentage: 85, score: 8, questions: [
            { questionId: "q1", topic: "Algorithms", correct: true },
            { questionId: "q2", topic: "Networks", correct: true },
            { questionId: "q3", topic: "Algorithms", correct: false }
        ]},
        { attemptId: "sp2", studentId: "stu1", percentage: 70, score: 7, questions: [
            { questionId: "q4", topic: "Algorithms", correct: true },
            { questionId: "q5", topic: "Networks", correct: false }
        ]},
        { attemptId: "sp3", studentId: "stu2", percentage: 50, score: 5, questions: [
            { questionId: "q1", topic: "Algorithms", correct: false }
        ]}
    ];
    var origAttemptsSP = allAttempts.slice();
    allAttempts = studentPerfTests;

    var sp = Analytics.getStudentPerformance("stu1", allAttempts);
    TestRunner.assertType(sp, "object", "getStudentPerformance returns object");
    TestRunner.assertEqual(sp.studentId, "stu1", "Student performance: correct studentId");
    TestRunner.assertEqual(sp.totalAttempts, 2, "Student performance: 2 attempts for stu1");
    TestRunner.assertGreaterThan(sp.averagePercentage, 0, "Student performance: averagePercentage calculated");
    TestRunner.assertGreaterThan(sp.accuracy, 0, "Student performance: accuracy calculated");
    TestRunner.assertType(sp.topicStrengths, "object", "Student performance: topicStrengths is array");
    TestRunner.assertType(sp.topicWeaknesses, "object", "Student performance: topicWeaknesses is array");
    TestRunner.assertType(sp.recentPerformance, "object", "Student performance: recentPerformance is array");
    TestRunner.assertGreaterThan(sp.recentPerformance.length, 0, "Student performance: has recent performance entries");

    allAttempts = origAttemptsSP;

    TestRunner.suite("Analytics - getStudentPerformance: Empty Data");

    var emptySP = Analytics.getStudentPerformance("stu1", []);
    TestRunner.assertEqual(emptySP.totalAttempts, 0, "Empty student performance: totalAttempts is 0");
    TestRunner.assertEqual(emptySP.topicStrengths.length, 0, "Empty student performance: no strengths");
    TestRunner.assertEqual(emptySP.topicWeaknesses.length, 0, "Empty student performance: no weaknesses");

    TestRunner.suite("Analytics - getStudentPerformance: Null Student");

    var nullSP = Analytics.getStudentPerformance(null, allAttempts);
    TestRunner.assertEqual(nullSP.totalAttempts, 0, "Null student: totalAttempts is 0");

    TestRunner.suite("Analytics - getStudentPerformance: Strengths and Weaknesses");

    var swTests = [
        { attemptId: "sw1", studentId: "sw-stu", percentage: 75, questions: [
            { questionId: "q1", topic: "Strong Topic", correct: true },
            { questionId: "q2", topic: "Strong Topic", correct: true },
            { questionId: "q3", topic: "Strong Topic", correct: true },
            { questionId: "q4", topic: "Weak Topic", correct: false },
            { questionId: "q5", topic: "Weak Topic", correct: false }
        ]}
    ];
    var origAttemptsSW = allAttempts.slice();
    allAttempts = swTests;

    var sw = Analytics.getStudentPerformance("sw-stu", allAttempts);
    TestRunner.assertGreaterThan(sw.topicStrengths.length, 0, "Strengths: has at least one strength");
    TestRunner.assertGreaterThan(sw.topicWeaknesses.length, 0, "Weaknesses: has at least one weakness");
    TestRunner.assertEqual(sw.topicStrengths[0].topic, "Strong Topic", "Strengths: correct topic");
    TestRunner.assertEqual(sw.topicWeaknesses[0].topic, "Weak Topic", "Weaknesses: correct topic");

    allAttempts = origAttemptsSW;

    TestRunner.suite("TeacherAnalytics - getStudentPerformance: Integration");

    var origAttemptsStuTA = allAttempts.slice();
    allAttempts = [
        { attemptId: "stu-ta1", studentId: "stu-ta-s1", percentage: 80, questions: [
            { questionId: "q1", topic: "Algorithms", correct: true }
        ]},
        { attemptId: "stu-ta2", studentId: "stu-ta-s1", percentage: 60, questions: [
            { questionId: "q2", topic: "Networks", correct: false }
        ]}
    ];

    var taSP = TeacherAnalytics.getStudentPerformance("stu-ta-s1", {});
    TestRunner.assertType(taSP, "object", "TeacherAnalytics.getStudentPerformance returns object");
    TestRunner.assertEqual(taSP.totalAttempts, 2, "TeacherAnalytics student: 2 attempts");
    TestRunner.assertGreaterThan(taSP.averagePercentage, 0, "TeacherAnalytics student: average calculated");

    allAttempts = origAttemptsStuTA;

    TestRunner.suite("Contract - Student Isolation: Student A cannot affect Student B");

    var isolationTests = [
        { attemptId: "iso-a1", studentId: "student-A", percentage: 90, score: 9, questions: [
            { questionId: "q1", topic: "Algorithms", correct: true },
            { questionId: "q2", topic: "Networks", correct: true }
        ]},
        { attemptId: "iso-b1", studentId: "student-B", percentage: 40, score: 4, questions: [
            { questionId: "q3", topic: "Algorithms", correct: false },
            { questionId: "q4", topic: "Networks", correct: false }
        ]},
        { attemptId: "iso-b2", studentId: "student-B", percentage: 50, score: 5, questions: [
            { attemptId: "q5", topic: "Algorithms", correct: false }
        ]}
    ];
    var origAttemptsIso = allAttempts.slice();
    allAttempts = isolationTests;

    var perfA = Analytics.getStudentPerformance("student-A", allAttempts);
    var perfB = Analytics.getStudentPerformance("student-B", allAttempts);
    TestRunner.assertEqual(perfA.totalAttempts, 1, "Isolation: Student A has 1 attempt");
    TestRunner.assertEqual(perfB.totalAttempts, 2, "Isolation: Student B has 2 attempts");
    TestRunner.assertEqual(perfA.averagePercentage, 90, "Isolation: Student A average unaffected by B");
    TestRunner.assertEqual(perfB.averagePercentage, 45, "Isolation: Student B average unaffected by A");
    TestRunner.assertEqual(perfA.topicStrengths.length, 2, "Isolation: Student A strengths from A only");
    TestRunner.assertEqual(perfB.topicWeaknesses.length, 2, "Isolation: Student B weaknesses from B only");

    allAttempts = origAttemptsIso;

    TestRunner.suite("Contract - Empty Attempts: Returns safe predictable result");

    var emptyContract = Analytics.getStudentPerformance("any-student", []);
    TestRunner.assertEqual(emptyContract.studentId, "any-student", "Empty contract: studentId preserved");
    TestRunner.assertEqual(emptyContract.totalAttempts, 0, "Empty contract: totalAttempts is 0");
    TestRunner.assertEqual(emptyContract.averagePercentage, 0, "Empty contract: averagePercentage is 0");
    TestRunner.assertEqual(emptyContract.bestPercentage, 0, "Empty contract: bestPercentage is 0");
    TestRunner.assertEqual(emptyContract.lowestPercentage, 100, "Empty contract: lowestPercentage is 100");
    TestRunner.assertEqual(emptyContract.topicStrengths.length, 0, "Empty contract: no strengths");
    TestRunner.assertEqual(emptyContract.topicWeaknesses.length, 0, "Empty contract: no weaknesses");
    TestRunner.assertEqual(emptyContract.recentPerformance.length, 0, "Empty contract: no recent performance");

    TestRunner.suite("Contract - Null Student ID: Returns safe result");

    var nullContract = Analytics.getStudentPerformance(null, [{ percentage: 80 }]);
    TestRunner.assertEqual(nullContract.studentId, null, "Null student: studentId is null");
    TestRunner.assertEqual(nullContract.totalAttempts, 0, "Null student: totalAttempts is 0");

    TestRunner.suite("Contract - Legacy Attempt: Missing fields do not crash");

    var legacyTests = [
        { attemptId: "leg1", studentId: "legacy-stu" },
        { studentId: "legacy-stu", score: 5, total: 10 },
        { attemptId: "leg3", studentId: "legacy-stu", percentage: 75 },
        { attemptId: "leg4", studentId: "legacy-stu", percentage: 80, questions: null },
        { attemptId: "leg5", studentId: "legacy-stu", percentage: 60, questions: [null] }
    ];
    var origAttemptsLegacy = allAttempts.slice();
    allAttempts = legacyTests;

    var legacyPerf = Analytics.getStudentPerformance("legacy-stu", allAttempts);
    TestRunner.assertType(legacyPerf, "object", "Legacy: returns object without crashing");
    TestRunner.assertGreaterThan(legacyPerf.totalAttempts, 0, "Legacy: counted valid attempts");

    allAttempts = origAttemptsLegacy;

    TestRunner.suite("Contract - Predictable Result Shape: All fields present");

    var shapeTests = [
        { attemptId: "sh1", studentId: "shape-stu", percentage: 70, score: 7, questions: [
            { questionId: "q1", topic: "Topic A", correct: true }
        ]}
    ];
    var origAttemptsShape = allAttempts.slice();
    allAttempts = shapeTests;

    var shape = Analytics.getStudentPerformance("shape-stu", allAttempts);
    TestRunner.assertNotNull(shape.studentId, "Shape: studentId present");
    TestRunner.assertType(shape.totalAttempts, "number", "Shape: totalAttempts is number");
    TestRunner.assertType(shape.averageScore, "number", "Shape: averageScore is number");
    TestRunner.assertType(shape.averagePercentage, "number", "Shape: averagePercentage is number");
    TestRunner.assertType(shape.bestPercentage, "number", "Shape: bestPercentage is number");
    TestRunner.assertType(shape.lowestPercentage, "number", "Shape: lowestPercentage is number");
    TestRunner.assertType(shape.totalQuestions, "number", "Shape: totalQuestions is number");
    TestRunner.assertType(shape.correctAnswers, "number", "Shape: correctAnswers is number");
    TestRunner.assertType(shape.incorrectAnswers, "number", "Shape: incorrectAnswers is number");
    TestRunner.assertType(shape.accuracy, "number", "Shape: accuracy is number");
    TestRunner.assertType(shape.recentPerformance, "object", "Shape: recentPerformance is array");
    TestRunner.assertType(shape.topicStrengths, "object", "Shape: topicStrengths is array");
    TestRunner.assertType(shape.topicWeaknesses, "object", "Shape: topicWeaknesses is array");

    allAttempts = origAttemptsShape;

    TestRunner.suite("Contract - Topic Data: Only topics from source attempts");

    var topicTests = [
        { attemptId: "tp1", studentId: "topic-stu", percentage: 70, questions: [
            { questionId: "q1", topic: "Algorithms", correct: true },
            { questionId: "q2", topic: "Algorithms", correct: true },
            { questionId: "q3", topic: "Networks", correct: false }
        ]}
    ];
    var origAttemptsTopic = allAttempts.slice();
    allAttempts = topicTests;

    var topicPerf = Analytics.getStudentPerformance("topic-stu", allAttempts);
    var allTopics = topicPerf.topicStrengths.concat(topicPerf.topicWeaknesses);
    TestRunner.assertEqual(allTopics.length, 2, "Topics: only 2 topics from source attempts");
    var topicNames = [];
    for (var ti = 0; ti < allTopics.length; ti++) topicNames.push(allTopics[ti].topic);
    var hasAlgorithms = topicNames.indexOf("Algorithms") !== -1;
    var hasNetworks = topicNames.indexOf("Networks") !== -1;
    TestRunner.assertTrue(hasAlgorithms, "Topics: Algorithms present");
    TestRunner.assertTrue(hasNetworks, "Topics: Networks present");

    allAttempts = origAttemptsTopic;

    TestRunner.suite("Contract - Accuracy Calculation: Correct formula");

    var accTests = [
        { attemptId: "acc1", studentId: "acc-stu", percentage: 75, questions: [
            { questionId: "q1", correct: true },
            { questionId: "q2", correct: true },
            { questionId: "q3", correct: false }
        ]}
    ];
    var origAttemptsAcc = allAttempts.slice();
    allAttempts = accTests;

    var accPerf = Analytics.getStudentPerformance("acc-stu", allAttempts);
    TestRunner.assertEqual(accPerf.totalQuestions, 3, "Accuracy: 3 total questions");
    TestRunner.assertEqual(accPerf.correctAnswers, 2, "Accuracy: 2 correct");
    TestRunner.assertEqual(accPerf.incorrectAnswers, 1, "Accuracy: 1 incorrect");
    TestRunner.assertEqual(accPerf.accuracy, 66.67, "Accuracy: 66.67% correct");

    allAttempts = origAttemptsAcc;

    TestRunner.suite("Contract - Strength/Weakness Threshold: 70% boundary");

    var thresholdTests = [
        { attemptId: "th1", studentId: "thresh-stu", percentage: 70, questions: [
            { questionId: "q1", topic: "Exactly70", correct: true },
            { questionId: "q2", topic: "Exactly70", correct: true },
            { questionId: "q3", topic: "Exactly70", correct: true },
            { questionId: "q4", topic: "Exactly70", correct: true },
            { questionId: "q5", topic: "Exactly70", correct: true },
            { questionId: "q6", topic: "Exactly70", correct: true },
            { questionId: "q7", topic: "Exactly70", correct: true },
            { questionId: "q8", topic: "Exactly70", correct: false },
            { questionId: "q9", topic: "Exactly70", correct: false },
            { questionId: "q10", topic: "Exactly70", correct: false }
        ]}
    ];
    var origAttemptsThresh = allAttempts.slice();
    allAttempts = thresholdTests;

    var threshPerf = Analytics.getStudentPerformance("thresh-stu", allAttempts);
    var threshTopics = threshPerf.topicStrengths.concat(threshPerf.topicWeaknesses);
    TestRunner.assertEqual(threshTopics.length, 1, "Threshold: one topic");
    TestRunner.assertEqual(threshTopics[0].accuracy, 70, "Threshold: accuracy is 70%");
    var isStrength = false;
    for (var ti = 0; ti < threshPerf.topicStrengths.length; ti++) {
        if (threshPerf.topicStrengths[ti].topic === "Exactly70") isStrength = true;
    }
    TestRunner.assertTrue(isStrength, "Threshold: 70% accuracy is classified as strength");

    allAttempts = origAttemptsThresh;

    TestRunner.suite("Analytics - getTeacherInsights: Students Needing Support");

    var supportAtRisk = [
        { studentId: "risk1", riskLevel: "high", reasons: ["Low average"] },
        { studentId: "risk2", riskLevel: "medium", reasons: ["Below average"] }
    ];
    var supportTopics = [
        { topic: "Algorithms", accuracy: 85, masteryLevel: "Strong" }
    ];
    var supportInsights = Analytics.getTeacherInsights(supportAtRisk, supportTopics, "stable", {});
    TestRunner.assertGreaterThan(supportInsights.length, 0, "Support insights: has entries");
    TestRunner.assertEqual(supportInsights[0].category, "needs_support", "Support insights: first is needs_support");
    TestRunner.assertEqual(supportInsights[0].priority, 1, "Support insights: priority 1");
    TestRunner.assertTrue(supportInsights[0].message.indexOf("2 students") !== -1, "Support insights: message mentions 2 students");
    TestRunner.assertTrue(supportInsights[0].message.indexOf("1 at high risk") !== -1, "Support insights: message mentions high risk");

    TestRunner.suite("Analytics - getTeacherInsights: Weak Topic");

    var weakAtRisk = [];
    var weakTopics = [
        { topic: "Networks", accuracy: 35, masteryLevel: "Needs Support" },
        { topic: "Algorithms", accuracy: 85, masteryLevel: "Strong" }
    ];
    var weakInsights = Analytics.getTeacherInsights(weakAtRisk, weakTopics, "stable", {});
    var weakInsight = null;
    for (var wi = 0; wi < weakInsights.length; wi++) {
        if (weakInsights[wi].category === "weak_topic") { weakInsight = weakInsights[wi]; break; }
    }
    TestRunner.assertNotNull(weakInsight, "Weak topic insight: found");
    TestRunner.assertEqual(weakInsight.priority, 2, "Weak topic: priority 2");
    TestRunner.assertTrue(weakInsight.message.indexOf("Networks") !== -1, "Weak topic: mentions weakest topic");
    TestRunner.assertTrue(weakInsight.message.indexOf("35%") !== -1, "Weak topic: mentions accuracy");

    TestRunner.suite("Analytics - getTeacherInsights: Strong Topic");

    var strongAtRisk = [];
    var strongTopics = [
        { topic: "Programming Basics", accuracy: 92, masteryLevel: "Strong" },
        { topic: "Algorithms", accuracy: 85, masteryLevel: "Strong" }
    ];
    var strongInsights = Analytics.getTeacherInsights(strongAtRisk, strongTopics, "stable", {});
    var strongInsight = null;
    for (var si = 0; si < strongInsights.length; si++) {
        if (strongInsights[si].category === "strong_topic") { strongInsight = strongInsights[si]; break; }
    }
    TestRunner.assertNotNull(strongInsight, "Strong topic insight: found");
    TestRunner.assertEqual(strongInsight.priority, 4, "Strong topic: priority 4");
    TestRunner.assertTrue(strongInsight.message.indexOf("Programming Basics") !== -1, "Strong topic: mentions strongest");
    TestRunner.assertTrue(strongInsight.message.indexOf("2 topics") !== -1, "Strong topic: mentions count");

    TestRunner.suite("Analytics - getTeacherInsights: Trend");

    var trendInsights1 = Analytics.getTeacherInsights([], [], "declining", {});
    var decliningInsight = null;
    for (var di = 0; di < trendInsights1.length; di++) {
        if (trendInsights1[di].category === "declining") { decliningInsight = trendInsights1[di]; break; }
    }
    TestRunner.assertNotNull(decliningInsight, "Declining insight: found");
    TestRunner.assertEqual(decliningInsight.priority, 3, "Declining: priority 3");

    var trendInsights2 = Analytics.getTeacherInsights([], [], "improving", {});
    var improvingInsight = null;
    for (var ii = 0; ii < trendInsights2.length; ii++) {
        if (trendInsights2[ii].category === "improving") { improvingInsight = trendInsights2[ii]; break; }
    }
    TestRunner.assertNotNull(improvingInsight, "Improving insight: found");
    TestRunner.assertEqual(improvingInsight.priority, 5, "Improving: priority 5");

    TestRunner.suite("Analytics - getTeacherInsights: Priority Order");

    var priorityAtRisk = [
        { studentId: "p1", riskLevel: "high", reasons: ["Low average"] }
    ];
    var priorityTopics = [
        { topic: "Weak", accuracy: 30, masteryLevel: "Needs Support" },
        { topic: "Strong", accuracy: 95, masteryLevel: "Strong" }
    ];
    var priorityInsights = Analytics.getTeacherInsights(priorityAtRisk, priorityTopics, "improving", {});
    TestRunner.assertGreaterThan(priorityInsights.length, 1, "Priority: multiple insights");
    var lastPriority = 0;
    var priorityValid = true;
    for (var pi = 0; pi < priorityInsights.length; pi++) {
        if (priorityInsights[pi].priority < lastPriority) { priorityValid = false; break; }
        lastPriority = priorityInsights[pi].priority;
    }
    TestRunner.assertTrue(priorityValid, "Priority: insights ordered by priority");

    TestRunner.suite("Analytics - getTeacherInsights: Insight Limit");

    var limitAtRisk = [
        { studentId: "l1", riskLevel: "high", reasons: ["Low"] },
        { studentId: "l2", riskLevel: "high", reasons: ["Low"] },
        { studentId: "l3", riskLevel: "medium", reasons: ["Below"] }
    ];
    var limitTopics = [
        { topic: "W1", accuracy: 20, masteryLevel: "Needs Support" },
        { topic: "W2", accuracy: 25, masteryLevel: "Needs Support" },
        { topic: "W3", accuracy: 30, masteryLevel: "Needs Support" },
        { topic: "S1", accuracy: 90, masteryLevel: "Strong" },
        { topic: "S2", accuracy: 95, masteryLevel: "Strong" },
        { topic: "S3", accuracy: 98, masteryLevel: "Strong" }
    ];
    var limitInsights = Analytics.getTeacherInsights(limitAtRisk, limitTopics, "declining", {});
    TestRunner.assertGreaterThan(limitInsights.length, 0, "Limit: has insights");
    TestRunner.assertTrue(limitInsights.length <= 5, "Limit: max 5 insights");

    TestRunner.suite("Analytics - getTeacherInsights: Empty Data");

    var emptyInsights = Analytics.getTeacherInsights([], [], "stable", {});
    TestRunner.assertEqual(emptyInsights.length, 0, "Empty: no insights");

    TestRunner.suite("Analytics - getTeacherInsights: Null Inputs");

    var nullInsights = Analytics.getTeacherInsights(null, null, null, null);
    TestRunner.assertEqual(nullInsights.length, 0, "Null: no insights");

    TestRunner.suite("Analytics - getTeacherInsights: Navigation Targets");

    var navInsight = supportInsights[0];
    TestRunner.assertEqual(navInsight.actionTarget, "students", "Nav: needs_support targets students");
    TestRunner.assertNotNull(navInsight.actionLabel, "Nav: has actionLabel");

    TestRunner.suite("TeacherAnalytics - getTeacherInsights: Integration");

    var origInsightsAttempts = allAttempts.slice();
    allAttempts = [
        { attemptId: "ins1", studentId: "ins-s1", percentage: 30, questions: [
            { questionId: "q1", topic: "Hard Topic", correct: false },
            { questionId: "q2", topic: "Hard Topic", correct: false }
        ]},
        { attemptId: "ins2", studentId: "ins-s1", percentage: 25, questions: [
            { questionId: "q3", topic: "Hard Topic", correct: false }
        ]},
        { attemptId: "ins3", studentId: "ins-s2", percentage: 90, questions: [
            { questionId: "q4", topic: "Easy Topic", correct: true }
        ]},
        { attemptId: "ins4", studentId: "ins-s2", percentage: 95, questions: [
            { questionId: "q5", topic: "Easy Topic", correct: true }
        ]}
    ];

    var taInsights = TeacherAnalytics.getTeacherInsights({});
    TestRunner.assertType(taInsights, "object", "TeacherAnalytics insights: returns array");

    allAttempts = origInsightsAttempts;

    // ============================================================
    // Phase 5.1 — Advanced Question Analytics Tests
    // ============================================================

    TestRunner.suite("Analytics - getAdvancedQuestionAnalytics: Empty Data");

    var emptyAdv = Analytics.getAdvancedQuestionAnalytics([]);
    TestRunner.assertEqual(emptyAdv.length, 0, "Advanced QA: empty attempts returns empty");

    var nullAdv = Analytics.getAdvancedQuestionAnalytics(null);
    TestRunner.assertEqual(nullAdv.length, 0, "Advanced QA: null attempts returns empty");

    TestRunner.suite("Analytics - getAdvancedQuestionAnalytics: Basic Structure");

    var advAttempts = [
        { attemptId: "adv1", studentId: "stu-high1", percentage: 90, questions: [
            { questionId: "Q1", correct: true, selectedAnswer: "A", correctAnswer: "A", timeUsed: 10, difficulty: "easy", topic: "T1", bloom: "knowledge" },
            { questionId: "Q2", correct: true, selectedAnswer: "B", correctAnswer: "B", timeUsed: 15, difficulty: "medium", topic: "T2", bloom: "comprehension" },
            { questionId: "Q3", correct: false, selectedAnswer: "C", correctAnswer: "A", timeUsed: 20, difficulty: "hard", topic: "T3", bloom: "analysis" }
        ]},
        { attemptId: "adv2", studentId: "stu-high2", percentage: 85, questions: [
            { questionId: "Q1", correct: true, selectedAnswer: "A", correctAnswer: "A", timeUsed: 12, difficulty: "easy", topic: "T1", bloom: "knowledge" },
            { questionId: "Q2", correct: false, selectedAnswer: "C", correctAnswer: "B", timeUsed: 25, difficulty: "medium", topic: "T2", bloom: "comprehension" },
            { questionId: "Q3", correct: false, selectedAnswer: "B", correctAnswer: "A", timeUsed: 30, difficulty: "hard", topic: "T3", bloom: "analysis" }
        ]},
        { attemptId: "adv3", studentId: "stu-low1", percentage: 30, questions: [
            { questionId: "Q1", correct: false, selectedAnswer: "B", correctAnswer: "A", timeUsed: 30, difficulty: "easy", topic: "T1", bloom: "knowledge" },
            { questionId: "Q2", correct: false, selectedAnswer: "A", correctAnswer: "B", timeUsed: 35, difficulty: "medium", topic: "T2", bloom: "comprehension" },
            { questionId: "Q3", correct: false, selectedAnswer: "D", correctAnswer: "A", timeUsed: 40, difficulty: "hard", topic: "T3", bloom: "analysis" }
        ]},
        { attemptId: "adv4", studentId: "stu-low2", percentage: 25, questions: [
            { questionId: "Q1", correct: false, selectedAnswer: "C", correctAnswer: "A", timeUsed: 28, difficulty: "easy", topic: "T1", bloom: "knowledge" },
            { questionId: "Q2", correct: false, selectedAnswer: "D", correctAnswer: "B", timeUsed: 32, difficulty: "medium", topic: "T2", bloom: "comprehension" },
            { questionId: "Q3", correct: false, selectedAnswer: "B", correctAnswer: "A", timeUsed: 45, difficulty: "hard", topic: "T3", bloom: "analysis" }
        ]}
    ];

    var advResults = Analytics.getAdvancedQuestionAnalytics(advAttempts);
    TestRunner.assertType(advResults, "object", "Advanced QA: returns array");
    TestRunner.assertEqual(advResults.length, 3, "Advanced QA: 3 questions analyzed");

    // Check structure of first result
    var q1 = advResults[0];
    TestRunner.assertNotNull(q1.questionId, "Advanced QA: has questionId");
    TestRunner.assertType(q1.attempts, "number", "Advanced QA: has attempts");
    TestRunner.assertType(q1.accuracy, "number", "Advanced QA: has accuracy");
    TestRunner.assertType(q1.discrimination, "number", "Advanced QA: has discrimination");
    TestRunner.assertType(q1.hasDiscriminationData, "boolean", "Advanced QA: has hasDiscriminationData");
    TestRunner.assertType(q1.observedDifficulty, "string", "Advanced QA: has observedDifficulty");
    TestRunner.assertType(q1.difficultyAlignment, "string", "Advanced QA: has difficultyAlignment");
    TestRunner.assertType(q1.topDistractors, "object", "Advanced QA: has topDistractors");
    TestRunner.assertType(q1.sufficientSample, "boolean", "Advanced QA: has sufficientSample");

    TestRunner.suite("Analytics - getAdvancedQuestionAnalytics: Discrimination");

    // Q1: high students get it right (2/2), low students get it wrong (0/2) → high discrimination
    var q1Result = null;
    for (var i = 0; i < advResults.length; i++) {
        if (advResults[i].questionId === "Q1") { q1Result = advResults[i]; break; }
    }
    TestRunner.assertNotNull(q1Result, "Advanced QA: Q1 found");
    TestRunner.assertTrue(q1Result.discrimination > 0, "Advanced QA: Q1 has positive discrimination");
    TestRunner.assertTrue(q1Result.hasDiscriminationData, "Advanced QA: Q1 has discrimination data");

    // Q3: both high and low students get it wrong → low/no discrimination
    var q3Result = null;
    for (var i = 0; i < advResults.length; i++) {
        if (advResults[i].questionId === "Q3") { q3Result = advResults[i]; break; }
    }
    TestRunner.assertNotNull(q3Result, "Advanced QA: Q3 found");
    TestRunner.assertTrue(q3Result.discrimination <= 0, "Advanced QA: Q3 has low/negative discrimination");

    TestRunner.suite("Analytics - getAdvancedQuestionAnalytics: Observed Difficulty");

    // Q1: 50% accuracy (2/4) → observed medium
    TestRunner.assertEqual(q1Result.observedDifficulty, "medium", "Advanced QA: Q1 observed difficulty is medium");
    // Q1 metadata is "easy" but observed is "medium" → misaligned
    TestRunner.assertEqual(q1Result.difficultyAlignment, "misaligned", "Advanced QA: Q1 difficulty is misaligned");

    TestRunner.suite("Analytics - getAdvancedQuestionAnalytics: Distractors");

    // Q1: wrong answers are B (1), C (1) → top distractors
    TestRunner.assertTrue(q1Result.topDistractors.length > 0, "Advanced QA: Q1 has distractors");

    TestRunner.suite("Analytics - getAdvancedQuestionAnalytics: Sufficient Sample");

    // 4 attempts per question → sufficient (>= 5 threshold is NOT met)
    TestRunner.assertFalse(q1Result.sufficientSample, "Advanced QA: Q1 insufficient sample (4 < 5)");

    TestRunner.suite("Analytics - getAdvancedQuestionAnalytics: Insufficient Sample");

    var insufficientAttempts = [
        { attemptId: "is1", studentId: "s1", percentage: 80, questions: [
            { questionId: "Q-ONLY", correct: true, selectedAnswer: "A", correctAnswer: "A", timeUsed: 10 }
        ]}
    ];
    var insufResults = Analytics.getAdvancedQuestionAnalytics(insufficientAttempts);
    TestRunner.assertEqual(insufResults.length, 1, "Advanced QA insufficient: 1 question");
    TestRunner.assertFalse(insufResults[0].sufficientSample, "Advanced QA insufficient: not sufficient");
    TestRunner.assertFalse(insufResults[0].hasDiscriminationData, "Advanced QA insufficient: no discrimination data");

    TestRunner.suite("Analytics - getAdvancedQuestionAnalytics: Sorted by Discrimination");

    // Results should be sorted by discrimination (highest first)
    var sortedCorrectly = true;
    for (var i = 1; i < advResults.length; i++) {
        if (advResults[i].discrimination > advResults[i - 1].discrimination) {
            sortedCorrectly = false;
            break;
        }
    }
    TestRunner.assertTrue(sortedCorrectly, "Advanced QA: sorted by discrimination descending");

    TestRunner.suite("Analytics - getAdvancedQuestionAnalytics: Missing Fields");

    var missingFieldAttempts = [
        { attemptId: "mf1", studentId: "s1", percentage: 50, questions: [
            { questionId: "Q-MISS" }
        ]},
        { attemptId: "mf2", studentId: "s2", percentage: 60, questions: [
            { questionId: "Q-MISS", correct: true }
        ]}
    ];
    var mfResults = Analytics.getAdvancedQuestionAnalytics(missingFieldAttempts);
    TestRunner.assertEqual(mfResults.length, 1, "Advanced QA missing fields: 1 question");
    TestRunner.assertEqual(mfResults[0].attempts, 2, "Advanced QA missing fields: 2 attempts counted");
    TestRunner.assertEqual(mfResults[0].difficulty, null, "Advanced QA missing fields: difficulty is null");
    TestRunner.assertEqual(mfResults[0].topic, null, "Advanced QA missing fields: topic is null");

    TestRunner.suite("Analytics - getAdvancedQuestionAnalytics: Difficulty Alignment Aligned");

    var alignedAttempts = [
        { attemptId: "al1", studentId: "s1", percentage: 90, questions: [
            { questionId: "Q-EASY", correct: true, selectedAnswer: "A", correctAnswer: "A", difficulty: "easy" }
        ]},
        { attemptId: "al2", studentId: "s2", percentage: 85, questions: [
            { questionId: "Q-EASY", correct: true, selectedAnswer: "A", correctAnswer: "A", difficulty: "easy" }
        ]},
        { attemptId: "al3", studentId: "s3", percentage: 80, questions: [
            { questionId: "Q-EASY", correct: true, selectedAnswer: "B", correctAnswer: "A", difficulty: "easy" }
        ]}
    ];
    var alResults = Analytics.getAdvancedQuestionAnalytics(alignedAttempts);
    TestRunner.assertEqual(alResults.length, 1, "Aligned: 1 question");
    TestRunner.assertEqual(alResults[0].observedDifficulty, "easy", "Aligned: observed is easy");
    TestRunner.assertEqual(alResults[0].difficultyAlignment, "aligned", "Aligned: metadata matches");

    TestRunner.suite("Analytics - getAdvancedQuestionAnalytics: Difficult as Synonym for Hard");

    var difficultAttempts = [
        { attemptId: "dh1", studentId: "s1", percentage: 30, questions: [
            { questionId: "Q-DIFF", correct: false, selectedAnswer: "B", correctAnswer: "A", difficulty: "difficult" }
        ]},
        { attemptId: "dh2", studentId: "s2", percentage: 25, questions: [
            { questionId: "Q-DIFF", correct: false, selectedAnswer: "C", correctAnswer: "A", difficulty: "difficult" }
        ]},
        { attemptId: "dh3", studentId: "s3", percentage: 20, questions: [
            { questionId: "Q-DIFF", correct: false, selectedAnswer: "D", correctAnswer: "A", difficulty: "difficult" }
        ]}
    ];
    var dhResults = Analytics.getAdvancedQuestionAnalytics(difficultAttempts);
    TestRunner.assertEqual(dhResults.length, 1, "Difficult synonym: 1 question");
    TestRunner.assertEqual(dhResults[0].observedDifficulty, "hard", "Difficult synonym: observed is hard");
    TestRunner.assertEqual(dhResults[0].difficultyAlignment, "aligned", "Difficult synonym: 'difficult' treated as 'hard'");

    TestRunner.suite("Analytics - getAdvancedQuestionAnalytics: Multiple Students Multiple Questions");

    var multiAttempts = [];
    for (var mi = 0; mi < 10; mi++) {
        multiAttempts.push({
            attemptId: "multi-" + mi,
            studentId: "stu-" + (mi % 5),
            percentage: 50 + (mi * 5),
            questions: [
                { questionId: "MQ1", correct: mi < 5 ? false : true, selectedAnswer: mi < 5 ? "B" : "A", correctAnswer: "A", timeUsed: 10 + mi, difficulty: "medium", topic: "Topic1" },
                { questionId: "MQ2", correct: true, selectedAnswer: "A", correctAnswer: "A", timeUsed: 8 + mi, difficulty: "easy", topic: "Topic2" }
            ]
        });
    }
    var multiResults = Analytics.getAdvancedQuestionAnalytics(multiAttempts);
    TestRunner.assertEqual(multiResults.length, 2, "Multi: 2 questions");
    var mq1 = null;
    for (var mi = 0; mi < multiResults.length; mi++) {
        if (multiResults[mi].questionId === "MQ1") { mq1 = multiResults[mi]; break; }
    }
    TestRunner.assertNotNull(mq1, "Multi: MQ1 found");
    TestRunner.assertEqual(mq1.attempts, 10, "Multi: MQ1 has 10 attempts");
    TestRunner.assertTrue(mq1.hasDiscriminationData, "Multi: MQ1 has discrimination data");

    TestRunner.suite("Analytics - getAdvancedQuestionAnalytics: TeacherAnalytics Bridge");

    var origAdvAttempts = allAttempts.slice();
    allAttempts = advAttempts;
    var taAdvResults = TeacherAnalytics.getAdvancedQuestionAnalytics({});
    TestRunner.assertType(taAdvResults, "object", "TeacherAnalytics advanced QA: returns array");
    TestRunner.assertEqual(taAdvResults.length, 3, "TeacherAnalytics advanced QA: 3 questions");
    allAttempts = origAdvAttempts;

    // ============================================================
    // Phase 5.2 — Advanced Student Learning Analytics Tests
    // ============================================================
    TestRunner.suite("Analytics - getAdvancedStudentAnalytics");

    // 1. Empty data
    var emptyResult = Analytics.getAdvancedStudentAnalytics("s1", []);
    TestRunner.assertEqual(emptyResult.totalAttempts, 0, "Advanced student: empty attempts returns 0");
    TestRunner.assertEqual(emptyResult.confidence, "insufficient", "Advanced student: empty attempts confidence insufficient");
    TestRunner.assertEqual(emptyResult.consistency, null, "Advanced student: empty attempts no consistency");
    TestRunner.assertEqual(emptyResult.difficultyPerformance.length, 0, "Advanced student: empty attempts no difficulty");
    TestRunner.assertEqual(emptyResult.bloomPerformance.length, 0, "Advanced student: empty attempts no bloom");
    TestRunner.assertEqual(emptyResult.timeAccuracy, null, "Advanced student: empty attempts no timeAccuracy");
    TestRunner.assertEqual(emptyResult.modeComparison, null, "Advanced student: empty attempts no modeComparison");
    TestRunner.assertEqual(emptyResult.riskTrajectory, null, "Advanced student: empty attempts no riskTrajectory");

    // 2. Null studentId
    var nullIdResult = Analytics.getAdvancedStudentAnalytics(null, [{studentId:"s1",percentage:80,questions:[]}]);
    TestRunner.assertEqual(nullIdResult.studentId, null, "Advanced student: null studentId");
    TestRunner.assertEqual(nullIdResult.totalAttempts, 0, "Advanced student: null studentId 0 attempts");

    // 3. No matching student
    var noMatch = Analytics.getAdvancedStudentAnalytics("nonexistent", [{studentId:"s1",percentage:80,questions:[]}]);
    TestRunner.assertEqual(noMatch.totalAttempts, 0, "Advanced student: no matching student");

    // 4. One attempt — confidence low, no consistency, no riskTrajectory
    var oneAttempt = Analytics.getAdvancedStudentAnalytics("s1", [
        { studentId: "s1", percentage: 75, timestamp: "2026-01-01T00:00:00Z", questions: [
            { questionId: "q1", correct: true, topic: "Arrays", difficulty: "easy", bloom: "knowledge", timeUsed: 10 },
            { questionId: "q2", correct: false, topic: "Arrays", difficulty: "medium", bloom: "application", timeUsed: 20 }
        ]}
    ]);
    TestRunner.assertEqual(oneAttempt.totalAttempts, 1, "Advanced student: 1 attempt totalAttempts");
    TestRunner.assertEqual(oneAttempt.confidence, "insufficient", "Advanced student: 1 attempt confidence insufficient");
    TestRunner.assertEqual(oneAttempt.consistency, null, "Advanced student: 1 attempt no consistency");
    TestRunner.assertEqual(oneAttempt.riskTrajectory, null, "Advanced student: 1 attempt no riskTrajectory");
    TestRunner.assertEqual(oneAttempt.difficultyPerformance.length, 2, "Advanced student: 1 attempt 2 difficulties");
    TestRunner.assertEqual(oneAttempt.bloomPerformance.length, 2, "Advanced student: 1 attempt 2 blooms");

    // 5. Multiple attempts — consistency, confidence medium
    var multiAttempts = Analytics.getAdvancedStudentAnalytics("s1", [
        { studentId: "s1", percentage: 80, timestamp: "2026-01-01T00:00:00Z", questions: [
            { questionId: "q1", correct: true, topic: "Arrays", difficulty: "easy", bloom: "knowledge", timeUsed: 10 }
        ]},
        { studentId: "s1", percentage: 82, timestamp: "2026-01-02T00:00:00Z", questions: [
            { questionId: "q1", correct: true, topic: "Arrays", difficulty: "easy", bloom: "knowledge", timeUsed: 8 }
        ]},
        { studentId: "s1", percentage: 78, timestamp: "2026-01-03T00:00:00Z", questions: [
            { questionId: "q1", correct: true, topic: "Arrays", difficulty: "easy", bloom: "knowledge", timeUsed: 12 }
        ]},
        { studentId: "s1", percentage: 81, timestamp: "2026-01-04T00:00:00Z", questions: [
            { questionId: "q1", correct: true, topic: "Arrays", difficulty: "easy", bloom: "knowledge", timeUsed: 9 }
        ]},
        { studentId: "s1", percentage: 79, timestamp: "2026-01-05T00:00:00Z", questions: [
            { questionId: "q1", correct: true, topic: "Arrays", difficulty: "easy", bloom: "knowledge", timeUsed: 11 }
        ]}
    ]);
    TestRunner.assertEqual(multiAttempts.totalAttempts, 5, "Advanced student: 5 attempts totalAttempts");
    TestRunner.assertEqual(multiAttempts.confidence, "medium", "Advanced student: 5 attempts confidence medium");
    TestRunner.assertType(multiAttempts.consistency, "object", "Advanced student: consistency is object");
    TestRunner.assertEqual(multiAttempts.consistency.level, "consistent", "Advanced student: consistent performance");
    TestRunner.assertType(multiAttempts.riskTrajectory, "object", "Advanced student: riskTrajectory exists for 5 attempts");

    // 6. Variable performance
    var variablePerf = Analytics.getAdvancedStudentAnalytics("s1", [
        { studentId: "s1", percentage: 95, timestamp: "2026-01-01T00:00:00Z", questions: [] },
        { studentId: "s1", percentage: 30, timestamp: "2026-01-02T00:00:00Z", questions: [] },
        { studentId: "s1", percentage: 90, timestamp: "2026-01-03T00:00:00Z", questions: [] },
        { studentId: "s1", percentage: 35, timestamp: "2026-01-04T00:00:00Z", questions: [] },
        { studentId: "s1", percentage: 85, timestamp: "2026-01-05T00:00:00Z", questions: [] }
    ]);
    TestRunner.assertEqual(variablePerf.consistency.level, "variable", "Advanced student: variable performance");

    // 7. Difficulty breakdown with multiple levels
    var diffBreakdown = Analytics.getAdvancedStudentAnalytics("s1", [
        { studentId: "s1", percentage: 70, questions: [
            { questionId: "q1", correct: true, difficulty: "easy", topic: "T", bloom: "knowledge" },
            { questionId: "q2", correct: false, difficulty: "hard", topic: "T", bloom: "knowledge" },
            { questionId: "q3", correct: true, difficulty: "medium", topic: "T", bloom: "knowledge" }
        ]}
    ]);
    TestRunner.assertEqual(diffBreakdown.difficultyPerformance.length, 3, "Advanced student: 3 difficulty levels");
    var easyQ = diffBreakdown.difficultyPerformance.filter(function(d){ return d.difficulty === "easy"; })[0];
    var hardQ = diffBreakdown.difficultyPerformance.filter(function(d){ return d.difficulty === "hard"; })[0];
    TestRunner.assertEqual(easyQ.accuracy, 100, "Advanced student: easy 100% accuracy");
    TestRunner.assertEqual(hardQ.accuracy, 0, "Advanced student: hard 0% accuracy");

    // 8. Bloom breakdown with multiple levels
    var bloomBreakdown = Analytics.getAdvancedStudentAnalytics("s1", [
        { studentId: "s1", percentage: 60, questions: [
            { questionId: "q1", correct: true, difficulty: "easy", topic: "T", bloom: "knowledge" },
            { questionId: "q2", correct: false, difficulty: "easy", topic: "T", bloom: "application" },
            { questionId: "q3", correct: true, difficulty: "easy", topic: "T", bloom: "analysis" }
        ]}
    ]);
    TestRunner.assertEqual(bloomBreakdown.bloomPerformance.length, 3, "Advanced student: 3 bloom levels");
    var knowledgeBloom = bloomBreakdown.bloomPerformance.filter(function(b){ return b.bloom === "knowledge"; })[0];
    var applicationBloom = bloomBreakdown.bloomPerformance.filter(function(b){ return b.bloom === "application"; })[0];
    TestRunner.assertEqual(knowledgeBloom.accuracy, 100, "Advanced student: knowledge 100% accuracy");
    TestRunner.assertEqual(applicationBloom.accuracy, 0, "Advanced student: application 0% accuracy");

    // 9. Multiple quiz modes — modeComparison
    var modeResult = Analytics.getAdvancedStudentAnalytics("s1", [
        { studentId: "s1", percentage: 80, mode: "practice", questions: [
            { questionId: "q1", correct: true, difficulty: "easy", topic: "T", bloom: "knowledge", timeUsed: 10 }
        ]},
        { studentId: "s1", percentage: 85, mode: "practice", questions: [
            { questionId: "q1", correct: true, difficulty: "easy", topic: "T", bloom: "knowledge", timeUsed: 8 }
        ]},
        { studentId: "s1", percentage: 60, mode: "test", questions: [
            { questionId: "q1", correct: false, difficulty: "easy", topic: "T", bloom: "knowledge", timeUsed: 15 }
        ]},
        { studentId: "s1", percentage: 55, mode: "test", questions: [
            { questionId: "q1", correct: false, difficulty: "easy", topic: "T", bloom: "knowledge", timeUsed: 20 }
        ]}
    ]);
    TestRunner.assertType(modeResult.modeComparison, "object", "Advanced student: modeComparison exists");
    TestRunner.assertEqual(modeResult.modeComparison.practiceAttempts, 2, "Advanced student: 2 practice attempts");
    TestRunner.assertEqual(modeResult.modeComparison.assessmentAttempts, 2, "Advanced student: 2 assessment attempts");
    TestRunner.assertEqual(modeResult.modeComparison.pattern, "better_in_practice", "Advanced student: better in practice");

    // 10. Missing mode / legacy attempt
    var legacyResult = Analytics.getAdvancedStudentAnalytics("s1", [
        { studentId: "s1", percentage: 70, questions: [] },
        { studentId: "s1", percentage: 75, mode: "practice", questions: [] }
    ]);
    TestRunner.assertType(legacyResult.modeComparison, "object", "Advanced student: legacy mode treated as practice");

    // 11. Time-accuracy with sufficient data
    var timeResult = Analytics.getAdvancedStudentAnalytics("s1", [
        { studentId: "s1", percentage: 75, questions: [
            { questionId: "q1", correct: true, timeUsed: 5, difficulty: "easy", topic: "T", bloom: "knowledge" },
            { questionId: "q2", correct: false, timeUsed: 20, difficulty: "easy", topic: "T", bloom: "knowledge" },
            { questionId: "q3", correct: true, timeUsed: 3, difficulty: "easy", topic: "T", bloom: "knowledge" },
            { questionId: "q4", correct: true, timeUsed: 25, difficulty: "easy", topic: "T", bloom: "knowledge" }
        ]}
    ]);
    TestRunner.assertType(timeResult.timeAccuracy, "object", "Advanced student: timeAccuracy exists");
    TestRunner.assertEqual(timeResult.timeAccuracy.sufficientData, true, "Advanced student: time data sufficient");
    TestRunner.assertGreaterThan(timeResult.timeAccuracy.fastAccurate, 0, "Advanced student: has fastAccurate");
    TestRunner.assertGreaterThan(timeResult.timeAccuracy.slowAccurate, 0, "Advanced student: has slowAccurate");

    // 12. Missing timeUsed
    var noTimeResult = Analytics.getAdvancedStudentAnalytics("s1", [
        { studentId: "s1", percentage: 70, questions: [
            { questionId: "q1", correct: true, difficulty: "easy", topic: "T", bloom: "knowledge" },
            { questionId: "q2", correct: true, difficulty: "easy", topic: "T", bloom: "knowledge" }
        ]}
    ]);
    TestRunner.assertEqual(noTimeResult.timeAccuracy.sufficientData, false, "Advanced student: no timeUsed = insufficient");

    // 13. Malformed question data
    var malformedResult = Analytics.getAdvancedStudentAnalytics("s1", [
        { studentId: "s1", percentage: 70, questions: [null, { questionId: "q1", correct: true }] }
    ]);
    TestRunner.assertType(malformedResult, "object", "Advanced student: malformed questions handled");

    // 14. Multiple students — no cross-contamination
    var multiStudent = Analytics.getAdvancedStudentAnalytics("s1", [
        { studentId: "s1", percentage: 80, questions: [
            { questionId: "q1", correct: true, difficulty: "easy", topic: "Arrays", bloom: "knowledge", timeUsed: 10 }
        ]},
        { studentId: "s2", percentage: 40, questions: [
            { questionId: "q2", correct: false, difficulty: "hard", topic: "Strings", bloom: "analysis", timeUsed: 30 }
        ]},
        { studentId: "s1", percentage: 85, questions: [
            { questionId: "q3", correct: true, difficulty: "easy", topic: "Arrays", bloom: "knowledge", timeUsed: 8 }
        ]}
    ]);
    TestRunner.assertEqual(multiStudent.totalAttempts, 2, "Advanced student: s1 has 2 attempts, not 3");
    TestRunner.assertEqual(multiStudent.difficultyPerformance.length, 1, "Advanced student: s1 only easy difficulty");
    var onlyEasy = multiStudent.difficultyPerformance.filter(function(d){ return d.difficulty === "easy"; })[0];
    TestRunner.assertEqual(onlyEasy.correct, 2, "Advanced student: s1 2 correct easy");

    // 15. Risk trajectory — improving
    var improvingRisk = Analytics.getAdvancedStudentAnalytics("s1", [
        { studentId: "s1", percentage: 50, timestamp: "2026-01-01T00:00:00Z", questions: [] },
        { studentId: "s1", percentage: 55, timestamp: "2026-01-02T00:00:00Z", questions: [] },
        { studentId: "s1", percentage: 60, timestamp: "2026-01-03T00:00:00Z", questions: [] },
        { studentId: "s1", percentage: 80, timestamp: "2026-01-04T00:00:00Z", questions: [] },
        { studentId: "s1", percentage: 85, timestamp: "2026-01-05T00:00:00Z", questions: [] }
    ]);
    TestRunner.assertEqual(improvingRisk.riskTrajectory.trajectory, "improving", "Advanced student: improving trajectory");

    // 16. Risk trajectory — worsening
    var worseningRisk = Analytics.getAdvancedStudentAnalytics("s1", [
        { studentId: "s1", percentage: 90, timestamp: "2026-01-01T00:00:00Z", questions: [] },
        { studentId: "s1", percentage: 85, timestamp: "2026-01-02T00:00:00Z", questions: [] },
        { studentId: "s1", percentage: 80, timestamp: "2026-01-03T00:00:00Z", questions: [] },
        { studentId: "s1", percentage: 60, timestamp: "2026-01-04T00:00:00Z", questions: [] },
        { studentId: "s1", percentage: 55, timestamp: "2026-01-05T00:00:00Z", questions: [] }
    ]);
    TestRunner.assertEqual(worseningRisk.riskTrajectory.trajectory, "worsening", "Advanced student: worsening trajectory");

    // 17. Risk trajectory — stable
    var stableRisk = Analytics.getAdvancedStudentAnalytics("s1", [
        { studentId: "s1", percentage: 72, timestamp: "2026-01-01T00:00:00Z", questions: [] },
        { studentId: "s1", percentage: 73, timestamp: "2026-01-02T00:00:00Z", questions: [] },
        { studentId: "s1", percentage: 71, timestamp: "2026-01-03T00:00:00Z", questions: [] },
        { studentId: "s1", percentage: 74, timestamp: "2026-01-04T00:00:00Z", questions: [] },
        { studentId: "s1", percentage: 72, timestamp: "2026-01-05T00:00:00Z", questions: [] }
    ]);
    TestRunner.assertEqual(stableRisk.riskTrajectory.trajectory, "stable", "Advanced student: stable trajectory");

    // 18. Mode comparison — better in assessment
    var betterAssess = Analytics.getAdvancedStudentAnalytics("s1", [
        { studentId: "s1", percentage: 60, mode: "practice", questions: [{questionId:"q1",correct:false,difficulty:"easy",topic:"T",bloom:"knowledge"}] },
        { studentId: "s1", percentage: 65, mode: "practice", questions: [{questionId:"q1",correct:false,difficulty:"easy",topic:"T",bloom:"knowledge"}] },
        { studentId: "s1", percentage: 90, mode: "test", questions: [{questionId:"q1",correct:true,difficulty:"easy",topic:"T",bloom:"knowledge"}] },
        { studentId: "s1", percentage: 85, mode: "assignment", questions: [{questionId:"q1",correct:true,difficulty:"easy",topic:"T",bloom:"knowledge"}] }
    ]);
    TestRunner.assertEqual(betterAssess.modeComparison.pattern, "better_in_assessment", "Advanced student: better in assessment");

    // 19. Class-scoped analytics — only student's class
    var origAdvStuAttempts = allAttempts.slice();
    allAttempts = [
        { studentId: "s1", classId: "c1", percentage: 80, questions: [{questionId:"q1",correct:true,difficulty:"easy",topic:"T",bloom:"knowledge"}] },
        { studentId: "s1", classId: "c2", percentage: 40, questions: [{questionId:"q2",correct:false,difficulty:"hard",topic:"T2",bloom:"analysis"}] }
    ];
    var classScoped = TeacherAnalytics.getAdvancedStudentAnalytics("s1", {});
    TestRunner.assertEqual(classScoped.totalAttempts, 2, "Advanced student bridge: returns both (allAttempts not filtered by classId in bridge)");
    allAttempts = origAdvStuAttempts;

    // 20. Confidence high with 10+ attempts
    var highConfAttempts = [];
    for (var pi = 0; pi < 12; pi++) {
        highConfAttempts.push({ studentId: "s1", percentage: 75 + (pi % 3), timestamp: "2026-01-" + String(pi + 1).padStart(2, "0") + "T00:00:00Z", questions: [
            { questionId: "q" + pi, correct: pi % 3 !== 0, difficulty: "medium", topic: "T", bloom: "knowledge", timeUsed: 10 }
        ]});
    }
    var highConf = Analytics.getAdvancedStudentAnalytics("s1", highConfAttempts);
    TestRunner.assertEqual(highConf.confidence, "high", "Advanced student: 12 attempts = high confidence");

    // 21. Mixed difficulty + bloom in single student
    var mixedResult = Analytics.getAdvancedStudentAnalytics("s1", [
        { studentId: "s1", percentage: 70, questions: [
            { questionId: "q1", correct: true, difficulty: "easy", topic: "T", bloom: "knowledge", timeUsed: 5 },
            { questionId: "q2", correct: true, difficulty: "medium", topic: "T", bloom: "application", timeUsed: 10 },
            { questionId: "q3", correct: false, difficulty: "hard", topic: "T", bloom: "analysis", timeUsed: 20 }
        ]}
    ]);
    TestRunner.assertEqual(mixedResult.difficultyPerformance.length, 3, "Advanced student: 3 difficulty levels from mixed");
    TestRunner.assertEqual(mixedResult.bloomPerformance.length, 3, "Advanced student: 3 bloom levels from mixed");
    TestRunner.assertEqual(mixedResult.timeAccuracy.sufficientData, true, "Advanced student: time data from mixed questions");

    // 22. No cross-student contamination (reinforce)
    var s2Result = Analytics.getAdvancedStudentAnalytics("s2", [
        { studentId: "s1", percentage: 90, questions: [{questionId:"q1",correct:true,difficulty:"easy",topic:"A",bloom:"knowledge",timeUsed:5}] },
        { studentId: "s2", percentage: 50, questions: [{questionId:"q2",correct:false,difficulty:"hard",topic:"B",bloom:"analysis",timeUsed:25}] },
        { studentId: "s1", percentage: 85, questions: [{questionId:"q3",correct:true,difficulty:"easy",topic:"A",bloom:"knowledge",timeUsed:4}] }
    ]);
    TestRunner.assertEqual(s2Result.totalAttempts, 1, "Advanced student: s2 only 1 attempt");
    TestRunner.assertEqual(s2Result.studentId, "s2", "Advanced student: s2 studentId correct");
    var s2Difficulties = s2Result.difficultyPerformance.filter(function(d){ return d.difficulty === "hard"; });
    TestRunner.assertEqual(s2Difficulties.length, 1, "Advanced student: s2 only hard difficulty");

    // ============================================================
    // Phase 5.3 — Advanced Class & Learning-Pattern Analytics Tests
    // ============================================================
    TestRunner.suite("Analytics - getAdvancedClassAnalytics");

    // 1. Empty data
    var emptyClass = Analytics.getAdvancedClassAnalytics([], 0);
    TestRunner.assertEqual(emptyClass.totalAttempts, 0, "Advanced class: empty returns 0");
    TestRunner.assertEqual(emptyClass.confidence, "insufficient", "Advanced class: empty confidence insufficient");
    TestRunner.assertEqual(emptyClass.performanceSpread, null, "Advanced class: empty no spread");
    TestRunner.assertEqual(emptyClass.studentGroups, null, "Advanced class: empty no groups");
    TestRunner.assertEqual(emptyClass.practiceAssessment, null, "Advanced class: empty no practice/assessment");
    TestRunner.assertEqual(emptyClass.weakTopics.length, 0, "Advanced class: empty no weak topics");

    // 2. Null input
    var nullClass = Analytics.getAdvancedClassAnalytics(null, null);
    TestRunner.assertEqual(nullClass.totalAttempts, 0, "Advanced class: null input returns 0");

    // 3. One student — confidence low, no spread
    var oneStudentClass = Analytics.getAdvancedClassAnalytics([
        { studentId: "s1", percentage: 75, questions: [{questionId:"q1",correct:true,difficulty:"easy",topic:"T",bloom:"knowledge"}] }
    ], 1);
    TestRunner.assertEqual(oneStudentClass.totalAttempts, 1, "Advanced class: 1 student 1 attempt");
    TestRunner.assertEqual(oneStudentClass.uniqueStudents, 1, "Advanced class: 1 unique student");
    TestRunner.assertEqual(oneStudentClass.confidence, "insufficient", "Advanced class: 1 student = insufficient confidence");
    TestRunner.assertEqual(oneStudentClass.performanceSpread, null, "Advanced class: 1 student no spread");

    // 4. Multiple students — spread, groups, confidence
    var multiStudentClass = Analytics.getAdvancedClassAnalytics([
        { studentId: "s1", percentage: 90, questions: [] },
        { studentId: "s1", percentage: 85, questions: [] },
        { studentId: "s2", percentage: 60, questions: [] },
        { studentId: "s2", percentage: 55, questions: [] },
        { studentId: "s3", percentage: 40, questions: [] },
        { studentId: "s3", percentage: 35, questions: [] },
        { studentId: "s4", percentage: 70, questions: [] },
        { studentId: "s4", percentage: 75, questions: [] },
        { studentId: "s5", percentage: 80, questions: [] },
        { studentId: "s5", percentage: 82, questions: [] },
        { studentId: "s6", percentage: 65, questions: [] },
        { studentId: "s6", percentage: 68, questions: [] },
        { studentId: "s7", percentage: 50, questions: [] },
        { studentId: "s7", percentage: 52, questions: [] },
        { studentId: "s8", percentage: 88, questions: [] },
        { studentId: "s8", percentage: 85, questions: [] },
        { studentId: "s9", percentage: 72, questions: [] },
        { studentId: "s9", percentage: 70, questions: [] },
        { studentId: "s10", percentage: 45, questions: [] },
        { studentId: "s10", percentage: 48, questions: [] }
    ], 10);
    TestRunner.assertEqual(multiStudentClass.uniqueStudents, 10, "Advanced class: 10 unique students");
    TestRunner.assertEqual(multiStudentClass.confidence, "high", "Advanced class: 20 attempts 10 students = high");
    TestRunner.assertType(multiStudentClass.performanceSpread, "object", "Advanced class: spread exists");
    TestRunner.assertType(multiStudentClass.studentGroups, "object", "Advanced class: groups exist");
    TestRunner.assertEqual(multiStudentClass.studentGroups.total, 10, "Advanced class: groups total 10");
    TestRunner.assertEqual(multiStudentClass.studentGroups.strong + multiStudentClass.studentGroups.developing + multiStudentClass.studentGroups.needsSupport, 10, "Advanced class: groups sum to 10");

    // 5. Class isolation — different class attempts don't mix
    var isolatedClass = Analytics.getAdvancedClassAnalytics([
        { studentId: "s1", percentage: 90, questions: [] },
        { studentId: "s1", percentage: 85, questions: [] },
        { studentId: "s2", percentage: 60, questions: [] },
        { studentId: "s2", percentage: 55, questions: [] }
    ], 5);
    TestRunner.assertEqual(isolatedClass.uniqueStudents, 2, "Advanced class: only 2 students in this class");

    // 6. Multiple topics — weak topics detection
    var topicClass = Analytics.getAdvancedClassAnalytics([
        { studentId: "s1", percentage: 50, questions: [
            { questionId: "q1", correct: false, difficulty: "easy", topic: "WeakTopic", bloom: "knowledge" },
            { questionId: "q2", correct: false, difficulty: "easy", topic: "WeakTopic", bloom: "knowledge" },
            { questionId: "q3", correct: true, difficulty: "easy", topic: "WeakTopic", bloom: "knowledge" },
            { questionId: "q4", correct: true, difficulty: "easy", topic: "StrongTopic", bloom: "knowledge" },
            { questionId: "q5", correct: true, difficulty: "easy", topic: "StrongTopic", bloom: "knowledge" }
        ]},
        { studentId: "s2", percentage: 60, questions: [
            { questionId: "q6", correct: false, difficulty: "easy", topic: "WeakTopic", bloom: "knowledge" },
            { questionId: "q7", correct: false, difficulty: "easy", topic: "WeakTopic", bloom: "knowledge" },
            { questionId: "q8", correct: true, difficulty: "easy", topic: "StrongTopic", bloom: "knowledge" }
        ]}
    ], 2);
    var weakTopics = topicClass.weakTopics.filter(function(t){ return t.topic === "WeakTopic"; });
    TestRunner.assertGreaterThan(weakTopics.length, 0, "Advanced class: WeakTopic detected as weak");
    if (weakTopics.length > 0) {
        TestRunner.assertLessThan(weakTopics[0].accuracy, 60, "Advanced class: WeakTopic accuracy < 60%");
    }

    // 7. Multiple difficulty levels
    var diffClass = Analytics.getAdvancedClassAnalytics([
        { studentId: "s1", percentage: 70, questions: [
            { questionId: "q1", correct: true, difficulty: "easy", topic: "T", bloom: "knowledge" },
            { questionId: "q2", correct: false, difficulty: "hard", topic: "T", bloom: "knowledge" }
        ]},
        { studentId: "s2", percentage: 65, questions: [
            { questionId: "q3", correct: true, difficulty: "easy", topic: "T", bloom: "knowledge" },
            { questionId: "q4", correct: true, difficulty: "medium", topic: "T", bloom: "knowledge" }
        ]}
    ], 2);
    TestRunner.assertType(diffClass.performanceSpread, "object", "Advanced class: spread with mixed difficulties");

    // 8. Multiple Bloom levels
    var bloomClass = Analytics.getAdvancedClassAnalytics([
        { studentId: "s1", percentage: 70, questions: [
            { questionId: "q1", correct: true, difficulty: "easy", topic: "T", bloom: "knowledge" },
            { questionId: "q2", correct: false, difficulty: "easy", topic: "T", bloom: "analysis" }
        ]}
    ], 1);
    TestRunner.assertType(bloomClass, "object", "Advanced class: handles mixed bloom levels");

    // 9. Multiple quiz modes — practice vs assessment comparison
    var modeClass = Analytics.getAdvancedClassAnalytics([
        { studentId: "s1", percentage: 80, mode: "practice", questions: [{questionId:"q1",correct:true,difficulty:"easy",topic:"T",bloom:"knowledge"}] },
        { studentId: "s1", percentage: 85, mode: "practice", questions: [{questionId:"q2",correct:true,difficulty:"easy",topic:"T",bloom:"knowledge"}] },
        { studentId: "s2", percentage: 75, mode: "practice", questions: [{questionId:"q3",correct:true,difficulty:"easy",topic:"T",bloom:"knowledge"}] },
        { studentId: "s1", percentage: 55, mode: "test", questions: [{questionId:"q4",correct:false,difficulty:"easy",topic:"T",bloom:"knowledge"}] },
        { studentId: "s2", percentage: 50, mode: "test", questions: [{questionId:"q5",correct:false,difficulty:"easy",topic:"T",bloom:"knowledge"}] }
    ], 2);
    TestRunner.assertType(modeClass.practiceAssessment, "object", "Advanced class: practice/assessment comparison exists");
    TestRunner.assertEqual(modeClass.practiceAssessment.practiceAttempts, 3, "Advanced class: 3 practice attempts");
    TestRunner.assertEqual(modeClass.practiceAssessment.assessmentAttempts, 2, "Advanced class: 2 assessment attempts");
    TestRunner.assertEqual(modeClass.practiceAssessment.pattern, "better_in_practice", "Advanced class: better in practice");

    // 10. Legacy/missing mode
    var legacyClass = Analytics.getAdvancedClassAnalytics([
        { studentId: "s1", percentage: 70, questions: [] },
        { studentId: "s1", percentage: 75, mode: "practice", questions: [] },
        { studentId: "s2", percentage: 60, mode: "test", questions: [] }
    ], 2);
    TestRunner.assertType(legacyClass.practiceAssessment, "object", "Advanced class: legacy mode handled");

    // 11. Consistent class — low spread
    var consistentClass = Analytics.getAdvancedClassAnalytics([
        { studentId: "s1", percentage: 72, questions: [] },
        { studentId: "s2", percentage: 74, questions: [] },
        { studentId: "s3", percentage: 71, questions: [] },
        { studentId: "s4", percentage: 73, questions: [] },
        { studentId: "s5", percentage: 72, questions: [] }
    ], 5);
    TestRunner.assertEqual(consistentClass.performanceSpread.level, "consistent", "Advanced class: consistent performance");

    // 12. Variable class — high spread
    var variableClass = Analytics.getAdvancedClassAnalytics([
        { studentId: "s1", percentage: 95, questions: [] },
        { studentId: "s2", percentage: 30, questions: [] },
        { studentId: "s3", percentage: 90, questions: [] },
        { studentId: "s4", percentage: 35, questions: [] },
        { studentId: "s5", percentage: 85, questions: [] }
    ], 5);
    TestRunner.assertEqual(variableClass.performanceSpread.level, "highly_variable", "Advanced class: variable performance");

    // 13. High-performing class
    var highClass = Analytics.getAdvancedClassAnalytics([
        { studentId: "s1", percentage: 90, questions: [] },
        { studentId: "s2", percentage: 88, questions: [] },
        { studentId: "s3", percentage: 92, questions: [] },
        { studentId: "s4", percentage: 85, questions: [] },
        { studentId: "s5", percentage: 87, questions: [] }
    ], 5);
    TestRunner.assertEqual(highClass.studentGroups.strong, 5, "Advanced class: all 5 students strong");
    TestRunner.assertEqual(highClass.studentGroups.needsSupport, 0, "Advanced class: no students need support");

    // 14. Low-performing class
    var lowClass = Analytics.getAdvancedClassAnalytics([
        { studentId: "s1", percentage: 35, questions: [] },
        { studentId: "s2", percentage: 40, questions: [] },
        { studentId: "s3", percentage: 30, questions: [] },
        { studentId: "s4", percentage: 45, questions: [] },
        { studentId: "s5", percentage: 38, questions: [] }
    ], 5);
    TestRunner.assertEqual(lowClass.studentGroups.needsSupport, 5, "Advanced class: all 5 students need support");
    TestRunner.assertEqual(lowClass.studentGroups.strong, 0, "Advanced class: no strong students");

    // 15. Mixed performance class
    var mixedClass = Analytics.getAdvancedClassAnalytics([
        { studentId: "s1", percentage: 90, questions: [] },
        { studentId: "s2", percentage: 65, questions: [] },
        { studentId: "s3", percentage: 40, questions: [] },
        { studentId: "s4", percentage: 75, questions: [] },
        { studentId: "s5", percentage: 55, questions: [] }
    ], 5);
    TestRunner.assertEqual(mixedClass.studentGroups.strong, 1, "Advanced class: 1 strong");
    TestRunner.assertEqual(mixedClass.studentGroups.developing, 3, "Advanced class: 3 developing");
    TestRunner.assertEqual(mixedClass.studentGroups.needsSupport, 1, "Advanced class: 1 needs support");

    // 16. No cross-student contamination
    var noContam = Analytics.getAdvancedClassAnalytics([
        { studentId: "s1", percentage: 90, questions: [] },
        { studentId: "s2", percentage: 50, questions: [] }
    ], 3);
    TestRunner.assertEqual(noContam.uniqueStudents, 2, "Advanced class: 2 students not 3");
    TestRunner.assertEqual(noContam.studentGroups.total, 2, "Advanced class: groups total 2");

    // 17. Data sufficiency
    var suffClass = Analytics.getAdvancedClassAnalytics([
        { studentId: "s1", percentage: 70, questions: [] },
        { studentId: "s2", percentage: 65, questions: [] },
        { studentId: "s3", percentage: 60, questions: [] }
    ], 10);
    TestRunner.assertType(suffClass.dataSufficiency, "object", "Advanced class: dataSufficiency exists");
    TestRunner.assertEqual(suffClass.dataSufficiency.hasEnoughData, true, "Advanced class: 3 attempts 3 students = enough");
    TestRunner.assertEqual(suffClass.dataSufficiency.participationRate, 30, "Advanced class: 3/10 = 30%");

    // 18. Insufficient data
    var insuffClass = Analytics.getAdvancedClassAnalytics([
        { studentId: "s1", percentage: 70, questions: [] },
        { studentId: "s1", percentage: 72, questions: [] }
    ], 10);
    TestRunner.assertEqual(insuffClass.dataSufficiency.hasEnoughData, false, "Advanced class: 1 unique student not enough");

    // 19. Practice only — no comparison
    var practiceOnly = Analytics.getAdvancedClassAnalytics([
        { studentId: "s1", percentage: 80, mode: "practice", questions: [] },
        { studentId: "s1", percentage: 85, mode: "practice", questions: [] }
    ], 1);
    TestRunner.assertEqual(practiceOnly.practiceAssessment, null, "Advanced class: practice only = no comparison");

    // 20. Assessment only — no comparison
    var assessOnly = Analytics.getAdvancedClassAnalytics([
        { studentId: "s1", percentage: 60, mode: "test", questions: [] },
        { studentId: "s1", percentage: 55, mode: "test", questions: [] }
    ], 1);
    TestRunner.assertEqual(assessOnly.practiceAssessment, null, "Advanced class: assessment only = no comparison");

    // 21. Weak topics only appear with sufficient data (3+ questions)
    var weakTopicSuff = Analytics.getAdvancedClassAnalytics([
        { studentId: "s1", percentage: 30, questions: [
            { questionId: "q1", correct: false, difficulty: "easy", topic: "SparseTopic", bloom: "knowledge" },
            { questionId: "q2", correct: false, difficulty: "easy", topic: "SparseTopic", bloom: "knowledge" }
        ]}
    ], 1);
    var sparseWeak = weakTopicSuff.weakTopics.filter(function(t){ return t.topic === "SparseTopic"; });
    TestRunner.assertEqual(sparseWeak.length, 0, "Advanced class: SparseTopic with 2 questions not flagged as weak");

    // 22. No weak topics when all topics strong
    var noWeakClass = Analytics.getAdvancedClassAnalytics([
        { studentId: "s1", percentage: 85, questions: [
            { questionId: "q1", correct: true, difficulty: "easy", topic: "GoodTopic", bloom: "knowledge" },
            { questionId: "q2", correct: true, difficulty: "easy", topic: "GoodTopic", bloom: "knowledge" },
            { questionId: "q3", correct: true, difficulty: "easy", topic: "GoodTopic", bloom: "knowledge" }
        ]}
    ], 1);
    TestRunner.assertEqual(noWeakClass.weakTopics.length, 0, "Advanced class: no weak topics when all strong");

    // 23. Bridge test
    var origClassAttempts = allAttempts.slice();
    allAttempts = [
        { studentId: "s1", classId: "c1", percentage: 80, mode: "practice", questions: [{questionId:"q1",correct:true,difficulty:"easy",topic:"T",bloom:"knowledge"}] },
        { studentId: "s1", classId: "c1", percentage: 75, mode: "practice", questions: [{questionId:"q2",correct:true,difficulty:"easy",topic:"T",bloom:"knowledge"}] },
        { studentId: "s2", classId: "c1", percentage: 60, mode: "test", questions: [{questionId:"q3",correct:false,difficulty:"easy",topic:"T",bloom:"knowledge"}] },
        { studentId: "s2", classId: "c1", percentage: 55, mode: "test", questions: [{questionId:"q4",correct:false,difficulty:"easy",topic:"T",bloom:"knowledge"}] },
        { studentId: "s3", classId: "c2", percentage: 90, questions: [] }
    ];
    var taClassResult = TeacherAnalytics.getAdvancedClassAnalytics({ classId: "c1", teacherClasses: ["c1"] });
    TestRunner.assertType(taClassResult, "object", "Advanced class bridge: returns object");
    TestRunner.assertType(taClassResult.performanceSpread, "object", "Advanced class bridge: spread exists");
    allAttempts = origClassAttempts;
}
