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
}
