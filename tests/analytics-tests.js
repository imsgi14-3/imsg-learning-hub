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
