function runRecommendationTests() {
    TestRunner.suite("Recommendations - Module Existence");

    TestRunner.assertType(Recommendations, "object", "Recommendations module exists");
    TestRunner.assertType(Recommendations.generate, "function", "Recommendations.generate is function");
    TestRunner.assertType(Recommendations.hasSufficientData, "function", "Recommendations.hasSufficientData is function");
    TestRunner.assertType(Recommendations.getEmptyRecommendations, "function", "Recommendations.getEmptyRecommendations is function");
    TestRunner.assertType(Recommendations.getTopicRecommendations, "function", "Recommendations.getTopicRecommendations is function");
    TestRunner.assertType(Recommendations.getStudentRecommendations, "function", "Recommendations.getStudentRecommendations is function");
    TestRunner.assertType(Recommendations.getQuestionRecommendations, "function", "Recommendations.getQuestionRecommendations is function");
    TestRunner.assertType(Recommendations.getDifficultyRecommendations, "function", "Recommendations.getDifficultyRecommendations is function");
    TestRunner.assertType(Recommendations.getBloomRecommendations, "function", "Recommendations.getBloomRecommendations is function");
    TestRunner.assertType(Recommendations.getTrendRecommendations, "function", "Recommendations.getTrendRecommendations is function");
    TestRunner.assertType(Recommendations.deduplicateRecommendations, "function", "Recommendations.deduplicateRecommendations is function");
    TestRunner.assertType(Recommendations.sortAndLimit, "function", "Recommendations.sortAndLimit is function");

    TestRunner.suite("Recommendations - Empty Data");

    var emptyRecs = Recommendations.generate({});
    TestRunner.assertEqual(emptyRecs.length, 0, "Empty data: no recommendations");

    var nullRecs = Recommendations.generate(null);
    TestRunner.assertEqual(nullRecs.length, 0, "Null input: no recommendations");

    var emptyRecs2 = Recommendations.getEmptyRecommendations();
    TestRunner.assertEqual(emptyRecs2.length, 0, "getEmptyRecommendations returns empty array");

    TestRunner.suite("Recommendations - hasSufficientData");

    TestRunner.assertFalse(Recommendations.hasSufficientData({}), "No data: insufficient");
    TestRunner.assertFalse(Recommendations.hasSufficientData({ totalAttempts: 0 }), "Zero attempts: insufficient");
    TestRunner.assertFalse(Recommendations.hasSufficientData({ topicMastery: [] }), "Empty topics and no attempts: insufficient");
    TestRunner.assertTrue(Recommendations.hasSufficientData({ totalAttempts: 5 }), "Has attempts: sufficient");
    TestRunner.assertTrue(Recommendations.hasSufficientData({ topicMastery: [{ topic: "T1" }] }), "Has topics: sufficient");

    TestRunner.suite("Recommendations - Topic Intervention");

    var weakTopics = [
        { topic: "Networks", accuracy: 30, totalQuestions: 20, correctAnswers: 6, incorrectAnswers: 14, masteryLevel: "Needs Support" },
        { topic: "Algorithms", accuracy: 85, totalQuestions: 15, correctAnswers: 13, incorrectAnswers: 2, masteryLevel: "Strong" }
    ];
    var topicRecs = Recommendations.getTopicRecommendations(weakTopics);
    TestRunner.assertGreaterThan(topicRecs.length, 0, "Weak topics: has recommendations");
    var interventionRec = null;
    for (var i = 0; i < topicRecs.length; i++) {
        if (topicRecs[i].type === "topic_intervention") { interventionRec = topicRecs[i]; break; }
    }
    TestRunner.assertNotNull(interventionRec, "Topic intervention recommendation found");
    TestRunner.assertEqual(interventionRec.priority, 2, "Topic intervention: priority 2");
    TestRunner.assertTrue(interventionRec.message.indexOf("Networks") !== -1, "Topic intervention: mentions Networks");
    TestRunner.assertTrue(interventionRec.message.indexOf("30%") !== -1, "Topic intervention: mentions accuracy");
    TestRunner.assertEqual(interventionRec.actionTarget, "topics", "Topic intervention: targets topics");

    TestRunner.suite("Recommendations - Topic Strength");

    var strengthRecs = Recommendations.getTopicRecommendations(weakTopics);
    var strengthRec = null;
    for (var i = 0; i < strengthRecs.length; i++) {
        if (strengthRecs[i].type === "positive_strength") { strengthRec = strengthRecs[i]; break; }
    }
    TestRunner.assertNotNull(strengthRec, "Strength recommendation found");
    TestRunner.assertEqual(strengthRec.priority, 6, "Strength: priority 6");
    TestRunner.assertTrue(strengthRec.message.indexOf("Algorithms") !== -1, "Strength: mentions Algorithms");

    TestRunner.suite("Recommendations - Student Support");

    var atRiskStudents = [
        { studentId: "stu1", riskLevel: "high", reasons: ["Low average (35%)"] },
        { studentId: "stu2", riskLevel: "medium", reasons: ["Below average (58%)"] }
    ];
    var studentRecs = Recommendations.getStudentRecommendations(atRiskStudents);
    TestRunner.assertEqual(studentRecs.length, 1, "Student support: one recommendation");
    TestRunner.assertEqual(studentRecs[0].type, "student_support", "Student support: correct type");
    TestRunner.assertEqual(studentRecs[0].priority, 1, "Student support: priority 1 (highest)");
    TestRunner.assertTrue(studentRecs[0].message.indexOf("2 students") !== -1, "Student support: mentions 2 students");
    TestRunner.assertTrue(studentRecs[0].message.indexOf("1 at high risk") !== -1, "Student support: mentions high risk");
    TestRunner.assertEqual(studentRecs[0].actionTarget, "students", "Student support: targets students");
    TestRunner.assertGreaterThan(studentRecs[0].evidence.length, 0, "Student support: has evidence");
    TestRunner.assertTrue(studentRecs[0].evidence[0].indexOf("stu1") !== -1, "Student support: evidence mentions student");

    TestRunner.suite("Recommendations - Student Support Empty");

    var emptyStudentRecs = Recommendations.getStudentRecommendations([]);
    TestRunner.assertEqual(emptyStudentRecs.length, 0, "No at-risk students: no recommendation");

    TestRunner.suite("Recommendations - Question Review");

    var questionStats = [
        { questionId: "Q-HARD", attempts: 10, correct: 2, incorrect: 8, accuracy: 20, averageTimeUsed: 45, difficulty: "hard", topic: "Algorithms", bloom: "analysis" },
        { questionId: "Q-EASY", attempts: 10, correct: 9, incorrect: 1, accuracy: 90, averageTimeUsed: 10, difficulty: "easy", topic: "Basics", bloom: "knowledge" },
        { questionId: "Q-MED", attempts: 2, correct: 0, incorrect: 2, accuracy: 0, averageTimeUsed: 30, difficulty: "medium", topic: "Networks", bloom: "comprehension" }
    ];
    var qRecs = Recommendations.getQuestionRecommendations(questionStats);
    TestRunner.assertEqual(qRecs.length, 1, "Question review: one recommendation");
    TestRunner.assertEqual(qRecs[0].type, "question_review", "Question review: correct type");
    TestRunner.assertEqual(qRecs[0].priority, 3, "Question review: priority 3");
    TestRunner.assertTrue(qRecs[0].message.indexOf("1 question") !== -1, "Question review: mentions 1 question");
    TestRunner.assertEqual(qRecs[0].actionTarget, "questions", "Question review: targets questions");
    TestRunner.assertGreaterThan(qRecs[0].evidence.length, 0, "Question review: has evidence");
    TestRunner.assertTrue(qRecs[0].evidence[0].indexOf("Q-HARD") !== -1, "Question review: evidence mentions Q-HARD");

    TestRunner.suite("Recommendations - Question Review Low Attempts");

    var lowAttemptStats = [
        { questionId: "Q-LOW", attempts: 1, correct: 0, incorrect: 1, accuracy: 0, difficulty: "hard", topic: "T1" }
    ];
    var lowQRecs = Recommendations.getQuestionRecommendations(lowAttemptStats);
    TestRunner.assertEqual(lowQRecs.length, 0, "Question with low attempts: no recommendation");

    TestRunner.suite("Recommendations - Difficulty Review");

    var difficultyPerf = [
        { difficulty: "easy", attempts: 20, correct: 18, incorrect: 2, accuracy: 90 },
        { difficulty: "medium", attempts: 20, correct: 12, incorrect: 8, accuracy: 60 },
        { difficulty: "hard", attempts: 15, correct: 4, incorrect: 11, accuracy: 26.67 }
    ];
    var diffRecs = Recommendations.getDifficultyRecommendations(difficultyPerf);
    TestRunner.assertEqual(diffRecs.length, 1, "Difficulty review: one recommendation");
    TestRunner.assertEqual(diffRecs[0].type, "difficulty_review", "Difficulty review: correct type");
    TestRunner.assertEqual(diffRecs[0].priority, 4, "Difficulty review: priority 4");
    TestRunner.assertTrue(diffRecs[0].message.indexOf("hard") !== -1, "Difficulty review: mentions hard");

    TestRunner.suite("Recommendations - Difficulty Review No Low");

    var goodDiffPerf = [
        { difficulty: "easy", attempts: 20, correct: 18, accuracy: 90 },
        { difficulty: "hard", attempts: 15, correct: 10, accuracy: 66.67 }
    ];
    var goodDiffRecs = Recommendations.getDifficultyRecommendations(goodDiffPerf);
    TestRunner.assertEqual(goodDiffRecs.length, 0, "No low difficulty: no recommendation");

    TestRunner.suite("Recommendations - Bloom Review");

    var bloomPerf = [
        { bloom: "knowledge", attempts: 20, correct: 18, accuracy: 90 },
        { bloom: "comprehension", attempts: 15, correct: 10, accuracy: 66.67 },
        { bloom: "analysis", attempts: 10, correct: 3, accuracy: 30 }
    ];
    var bloomRecs = Recommendations.getBloomRecommendations(bloomPerf);
    TestRunner.assertEqual(bloomRecs.length, 1, "Bloom review: one recommendation");
    TestRunner.assertEqual(bloomRecs[0].type, "bloom_review", "Bloom review: correct type");
    TestRunner.assertEqual(bloomRecs[0].priority, 5, "Bloom review: priority 5");
    TestRunner.assertTrue(bloomRecs[0].message.indexOf("higher-order") !== -1 || bloomRecs[0].message.indexOf("Higher-order") !== -1, "Bloom review: mentions higher-order thinking");

    TestRunner.suite("Recommendations - Bloom Review No High Order");

    var lowBloomPerf = [
        { bloom: "knowledge", attempts: 10, correct: 3, accuracy: 30 }
    ];
    var lowBloomRecs = Recommendations.getBloomRecommendations(lowBloomPerf);
    TestRunner.assertEqual(lowBloomRecs.length, 0, "No high-order bloom: no recommendation");

    TestRunner.suite("Recommendations - Trend Declining");

    var decliningTrendRecs = Recommendations.getTrendRecommendations("declining", { averagePercentage: 55 });
    TestRunner.assertEqual(decliningTrendRecs.length, 1, "Declining trend: one recommendation");
    TestRunner.assertEqual(decliningTrendRecs[0].type, "declining_performance", "Declining: correct type");
    TestRunner.assertEqual(decliningTrendRecs[0].priority, 3, "Declining: priority 3");
    TestRunner.assertTrue(decliningTrendRecs[0].message.indexOf("declining") !== -1, "Declining: mentions declining");

    TestRunner.suite("Recommendations - Trend Improving");

    var improvingTrendRecs = Recommendations.getTrendRecommendations("improving", { averagePercentage: 75 });
    TestRunner.assertEqual(improvingTrendRecs.length, 1, "Improving trend: one recommendation");
    TestRunner.assertEqual(improvingTrendRecs[0].type, "improving_performance", "Improving: correct type");
    TestRunner.assertEqual(improvingTrendRecs[0].priority, 6, "Improving: priority 6");

    TestRunner.suite("Recommendations - Trend Stable");

    var stableTrendRecs = Recommendations.getTrendRecommendations("stable", {});
    TestRunner.assertEqual(stableTrendRecs.length, 0, "Stable trend: no recommendation");

    TestRunner.suite("Recommendations - Priority Ordering");

    var priorityRecs = Recommendations.generate({
        topicMastery: [{ topic: "Weak", accuracy: 30, totalQuestions: 10, correctAnswers: 3, incorrectAnswers: 7, masteryLevel: "Needs Support" }],
        atRiskStudents: [{ studentId: "s1", riskLevel: "high", reasons: ["Low average"] }],
        questionStatistics: [{ questionId: "Q1", attempts: 10, correct: 2, incorrect: 8, accuracy: 20, difficulty: "hard", topic: "Weak" }],
        difficultyPerformance: [{ difficulty: "hard", attempts: 10, correct: 2, accuracy: 20 }],
        trendDirection: "declining",
        classOverview: { totalAttempts: 10 }
    });
    TestRunner.assertGreaterThan(priorityRecs.length, 1, "Priority: multiple recommendations");
    var lastPriority = 0;
    var ordered = true;
    for (var i = 0; i < priorityRecs.length; i++) {
        if (priorityRecs[i].priority < lastPriority) { ordered = false; break; }
        lastPriority = priorityRecs[i].priority;
    }
    TestRunner.assertTrue(ordered, "Priority: recommendations ordered by priority");

    TestRunner.suite("Recommendations - Recommendation Limit");

    var limitRecs = Recommendations.sortAndLimit(priorityRecs, 3);
    TestRunner.assertGreaterThan(limitRecs.length, 0, "Limit: has recommendations");
    TestRunner.assertTrue(limitRecs.length <= 3, "Limit: max 3 recommendations");

    var unlimitedRecs = Recommendations.sortAndLimit(priorityRecs, 0);
    TestRunner.assertEqual(unlimitedRecs.length, priorityRecs.length, "Limit 0: no limit applied");

    TestRunner.suite("Recommendations - Deduplication");

    var topicRec1 = { type: "topic_intervention", priority: 2, title: "Topic A", message: "A", evidence: ["e1"], action: "a1", actionTarget: "topics" };
    var topicRec2 = { type: "topic_intervention", priority: 2, title: "Topic B", message: "B", evidence: ["e2"], action: "a2", actionTarget: "topics" };
    var studentRec = { type: "student_support", priority: 1, title: "Students", message: "S", evidence: ["e3"], action: "a3", actionTarget: "students" };
    var deduped = Recommendations.deduplicateRecommendations([topicRec1, topicRec2, studentRec]);
    TestRunner.assertEqual(deduped.length, 2, "Dedup: 2 unique types from 3");
    var hasMergedTopics = false;
    for (var i = 0; i < deduped.length; i++) {
        if (deduped[i].type === "topic_intervention" && deduped[i].evidence.length === 2) hasMergedTopics = true;
    }
    TestRunner.assertTrue(hasMergedTopics, "Dedup: topic recommendations merged");

    TestRunner.suite("Recommendations - Evidence Requirements");

    var recsWithEvidence = Recommendations.generate({
        topicMastery: [{ topic: "Weak", accuracy: 30, totalQuestions: 10, correctAnswers: 3, incorrectAnswers: 7, masteryLevel: "Needs Support" }],
        atRiskStudents: [{ studentId: "s1", riskLevel: "high", reasons: ["Low average"] }],
        classOverview: { totalAttempts: 5 }
    });
    for (var i = 0; i < recsWithEvidence.length; i++) {
        TestRunner.assertType(recsWithEvidence[i].evidence, "object", "Evidence: " + recsWithEvidence[i].type + " has evidence array");
        TestRunner.assertGreaterThan(recsWithEvidence[i].evidence.length, 0, "Evidence: " + recsWithEvidence[i].type + " has at least one evidence line");
    }

    TestRunner.suite("Recommendations - No AI/ML Fields");

    var noAIRecs = Recommendations.generate({
        topicMastery: [{ topic: "Weak", accuracy: 30, totalQuestions: 10, correctAnswers: 3, incorrectAnswers: 7, masteryLevel: "Needs Support" }],
        classOverview: { totalAttempts: 5 }
    });
    for (var i = 0; i < noAIRecs.length; i++) {
        var r = noAIRecs[i];
        TestRunner.assertFalse(r.hasOwnProperty("confidence_score"), "No AI: " + r.type + " has no confidence_score");
        TestRunner.assertFalse(r.hasOwnProperty("probability"), "No AI: " + r.type + " has no probability");
        TestRunner.assertFalse(r.hasOwnProperty("prediction"), "No AI: " + r.type + " has no prediction");
    }

    TestRunner.suite("Recommendations - Safe Defaults");

    var safeRecs = Recommendations.getTopicRecommendations(null);
    TestRunner.assertEqual(safeRecs.length, 0, "Safe: null topicMastery returns empty");

    var safeRecs2 = Recommendations.getStudentRecommendations(null);
    TestRunner.assertEqual(safeRecs2.length, 0, "Safe: null atRiskStudents returns empty");

    var safeRecs3 = Recommendations.getQuestionRecommendations(null);
    TestRunner.assertEqual(safeRecs3.length, 0, "Safe: null questionStats returns empty");

    var safeRecs4 = Recommendations.getDifficultyRecommendations(null);
    TestRunner.assertEqual(safeRecs4.length, 0, "Safe: null difficultyPerf returns empty");

    var safeRecs5 = Recommendations.getBloomRecommendations(null);
    TestRunner.assertEqual(safeRecs5.length, 0, "Safe: null bloomPerf returns empty");

    var safeRecs6 = Recommendations.getTrendRecommendations(null, null);
    TestRunner.assertEqual(safeRecs6.length, 0, "Safe: null trend returns empty");

    TestRunner.suite("Recommendations - No Data Mutation");

    var origTopics = [{ topic: "T1", accuracy: 30, totalQuestions: 10, correctAnswers: 3, incorrectAnswers: 7, masteryLevel: "Needs Support" }];
    var origTopicsCopy = JSON.parse(JSON.stringify(origTopics));
    Recommendations.getTopicRecommendations(origTopics);
    TestRunner.assertEqual(JSON.stringify(origTopics), JSON.stringify(origTopicsCopy), "No mutation: topics unchanged");

    var origRisk = [{ studentId: "s1", riskLevel: "high", reasons: ["Low"] }];
    var origRiskCopy = JSON.parse(JSON.stringify(origRisk));
    Recommendations.getStudentRecommendations(origRisk);
    TestRunner.assertEqual(JSON.stringify(origRisk), JSON.stringify(origRiskCopy), "No mutation: atRiskStudents unchanged");

    var origQStats = [{ questionId: "Q1", attempts: 10, correct: 2, accuracy: 20, difficulty: "hard", topic: "T1" }];
    var origQStatsCopy = JSON.parse(JSON.stringify(origQStats));
    Recommendations.getQuestionRecommendations(origQStats);
    TestRunner.assertEqual(JSON.stringify(origQStats), JSON.stringify(origQStatsCopy), "No mutation: questionStats unchanged");

    TestRunner.suite("Recommendations - Generate Integration");

    var fullAnalytics = {
        topicMastery: [
            { topic: "Algorithms", accuracy: 30, totalQuestions: 20, correctAnswers: 6, incorrectAnswers: 14, masteryLevel: "Needs Support" },
            { topic: "Networks", accuracy: 85, totalQuestions: 15, correctAnswers: 13, incorrectAnswers: 2, masteryLevel: "Strong" }
        ],
        atRiskStudents: [
            { studentId: "stu1", riskLevel: "high", reasons: ["Low average (30%)"] }
        ],
        questionStatistics: [
            { questionId: "Q-HARD", attempts: 10, correct: 2, incorrect: 8, accuracy: 20, difficulty: "hard", topic: "Algorithms" }
        ],
        difficultyPerformance: [
            { difficulty: "easy", attempts: 20, correct: 18, accuracy: 90 },
            { difficulty: "hard", attempts: 15, correct: 4, accuracy: 26.67 }
        ],
        bloomPerformance: [
            { bloom: "knowledge", attempts: 20, correct: 18, accuracy: 90 },
            { bloom: "analysis", attempts: 10, correct: 3, accuracy: 30 }
        ],
        trendDirection: "declining",
        classOverview: { totalAttempts: 30, averagePercentage: 50 }
    };
    var fullRecs = Recommendations.generate(fullAnalytics);
    TestRunner.assertGreaterThan(fullRecs.length, 0, "Full integration: has recommendations");
    TestRunner.assertTrue(fullRecs.length <= 5, "Full integration: max 5 recommendations");

    var types = [];
    for (var i = 0; i < fullRecs.length; i++) types.push(fullRecs[i].type);
    var hasStudentSupport = types.indexOf("student_support") !== -1;
    var hasTopicIntervention = types.indexOf("topic_intervention") !== -1;
    var hasQuestionReview = types.indexOf("question_review") !== -1;
    var hasDeclining = types.indexOf("declining_performance") !== -1;
    TestRunner.assertTrue(hasStudentSupport, "Full integration: has student_support");
    TestRunner.assertTrue(hasTopicIntervention, "Full integration: has topic_intervention");
    TestRunner.assertTrue(hasQuestionReview, "Full integration: has question_review");
    TestRunner.assertTrue(hasDeclining, "Full integration: has declining_performance");

    TestRunner.suite("Recommendations - TeacherAnalytics Bridge");

    var origAttemptsBridge = allAttempts.slice();
    var origStudentsBridge = studentAccounts.slice();
    studentAccounts = [
        { id: "bridge-s1", classId: "BRIDGE-CLASS", name: "Bridge Student 1" },
        { id: "bridge-s2", classId: "BRIDGE-CLASS", name: "Bridge Student 2" }
    ];
    allAttempts = [
        { attemptId: "br1", studentId: "bridge-s1", percentage: 30, questions: [
            { questionId: "q1", topic: "Weak Topic", correct: false, difficulty: "hard" },
            { questionId: "q2", topic: "Weak Topic", correct: false, difficulty: "hard" }
        ]},
        { attemptId: "br2", studentId: "bridge-s1", percentage: 25, questions: [
            { questionId: "q3", topic: "Weak Topic", correct: false, difficulty: "hard" }
        ]},
        { attemptId: "br3", studentId: "bridge-s2", percentage: 90, questions: [
            { questionId: "q4", topic: "Strong Topic", correct: true, difficulty: "easy" }
        ]}
    ];

    var bridgeRecs = TeacherAnalytics.getRecommendations({ classId: "BRIDGE-CLASS" });
    TestRunner.assertType(bridgeRecs, "object", "TeacherAnalytics.getRecommendations returns array");

    studentAccounts = origStudentsBridge;
    allAttempts = origAttemptsBridge;

    TestRunner.suite("Recommendations - TeacherAnalytics Bridge Empty");

    var emptyBridgeRecs = TeacherAnalytics.getRecommendations({});
    TestRunner.assertEqual(emptyBridgeRecs.length, 0, "TeacherAnalytics empty: no recommendations");
}
