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

    // ============================================================
    // Phase 5.4 — Actionable Teacher Insights Tests
    // ============================================================
    TestRunner.suite("Actionable Insights - Module Existence");

    TestRunner.assertType(Recommendations.generateActionableInsights, "function", "generateActionableInsights is function");

    TestRunner.suite("Actionable Insights - Empty Data");

    var emptyInsights = Recommendations.generateActionableInsights({});
    TestRunner.assertEqual(emptyInsights.length, 0, "Empty data: no insights");

    var nullInsights = Recommendations.generateActionableInsights(null);
    TestRunner.assertEqual(nullInsights.length, 0, "Null input: no insights");

    TestRunner.suite("Actionable Insights - Topic-Student Cross-Level");

    var topicStudentResults = Recommendations.generateActionableInsights({
        topicMastery: [
            { topic: "Networks", accuracy: 30, totalQuestions: 20, correctAnswers: 6, incorrectAnswers: 14, masteryLevel: "Needs Support" },
            { topic: "Algorithms", accuracy: 85, totalQuestions: 15, correctAnswers: 13, incorrectAnswers: 2, masteryLevel: "Strong" }
        ],
        atRiskStudents: [],
        questionStatistics: [
            { questionId: "Q1", attempts: 5, correct: 1, accuracy: 20, topic: "Networks" },
            { questionId: "Q2", attempts: 5, correct: 4, accuracy: 80, topic: "Algorithms" }
        ],
        difficultyPerformance: [],
        bloomPerformance: [],
        trendDirection: "stable",
        classOverview: { totalAttempts: 20, uniqueStudents: 5 },
        totalStudents: 5,
        attempts: [
            { studentId: "s1", percentage: 40, questions: [
                { questionId: "Q1", correct: false, topic: "Networks" },
                { questionId: "Q2", correct: true, topic: "Algorithms" }
            ]},
            { studentId: "s2", percentage: 45, questions: [
                { questionId: "Q1", correct: false, topic: "Networks" },
                { questionId: "Q2", correct: true, topic: "Algorithms" }
            ]},
            { studentId: "s3", percentage: 80, questions: [
                { questionId: "Q1", correct: true, topic: "Networks" },
                { questionId: "Q2", correct: true, topic: "Algorithms" }
            ]}
        ]
    });
    TestRunner.assertGreaterThan(topicStudentResults.length, 0, "Topic-student: has insights");
    var topicInsight = null;
    for (var i = 0; i < topicStudentResults.length; i++) {
        if (topicStudentResults[i].type === "topic_student_support") { topicInsight = topicStudentResults[i]; break; }
    }
    TestRunner.assertNotNull(topicInsight, "Topic-student insight found");
    TestRunner.assertTrue(topicInsight.title.indexOf("Networks") !== -1, "Topic-student: mentions Networks");
    TestRunner.assertType(topicInsight.data, "object", "Topic-student: has data");
    TestRunner.assertType(topicInsight.data.affectedStudentIds, "object", "Topic-student: has affectedStudentIds");
    TestRunner.assertType(topicInsight.data.affectedTopics, "object", "Topic-student: has affectedTopics");
    TestRunner.assertType(topicInsight.data.affectedQuestionIds, "object", "Topic-student: has affectedQuestionIds");
    TestRunner.assertType(topicInsight.data.priorityCalculation, "object", "Topic-student: has priorityCalculation");
    TestRunner.assertType(topicInsight.data.priorityCalculation.impactScore, "number", "Topic-student: impactScore is number");
    TestRunner.assertType(topicInsight.data.priorityCalculation.confidence, "string", "Topic-student: confidence is string");
    TestRunner.assertType(topicInsight.explanation, "string", "Topic-student: has explanation");

    TestRunner.suite("Actionable Insights - Impact-Based Priority");

    var highImpactResults = Recommendations.generateActionableInsights({
        topicMastery: [
            { topic: "Weak", accuracy: 20, totalQuestions: 30, correctAnswers: 6, incorrectAnswers: 24, masteryLevel: "Needs Support" }
        ],
        atRiskStudents: [],
        questionStatistics: [],
        difficultyPerformance: [],
        bloomPerformance: [],
        trendDirection: "stable",
        classOverview: { totalAttempts: 30, uniqueStudents: 10 },
        totalStudents: 10,
        attempts: [
            { studentId: "s1", percentage: 25, questions: [{ questionId: "Q1", correct: false, topic: "Weak" }] },
            { studentId: "s2", percentage: 30, questions: [{ questionId: "Q2", correct: false, topic: "Weak" }] },
            { studentId: "s3", percentage: 20, questions: [{ questionId: "Q3", correct: false, topic: "Weak" }] },
            { studentId: "s4", percentage: 80, questions: [{ questionId: "Q4", correct: true, topic: "Weak" }] },
            { studentId: "s5", percentage: 85, questions: [{ questionId: "Q5", correct: true, topic: "Weak" }] }
        ]
    });
    TestRunner.assertGreaterThan(highImpactResults.length, 0, "High impact: has insights");
    var firstInsight = highImpactResults[0];
    TestRunner.assertType(firstInsight.data.priorityCalculation, "object", "High impact: has priorityCalculation");
    TestRunner.assertGreaterThan(firstInsight.data.priorityCalculation.impactScore, 0, "High impact: impactScore > 0");

    TestRunner.suite("Actionable Insights - Student Risk Alert");

    var riskAlertResults = Recommendations.generateActionableInsights({
        topicMastery: [],
        atRiskStudents: [
            { studentId: "s1", riskLevel: "high", reasons: ["Low average (30%)"] },
            { studentId: "s2", riskLevel: "high", reasons: ["Low average (25%)"] }
        ],
        questionStatistics: [],
        difficultyPerformance: [],
        bloomPerformance: [],
        trendDirection: "stable",
        classOverview: { totalAttempts: 10, uniqueStudents: 5 },
        totalStudents: 5,
        attempts: []
    });
    var riskInsight = null;
    for (var i = 0; i < riskAlertResults.length; i++) {
        if (riskAlertResults[i].type === "student_risk_alert") { riskInsight = riskAlertResults[i]; break; }
    }
    TestRunner.assertNotNull(riskInsight, "Risk alert found");
    TestRunner.assertEqual(riskInsight.data.affectedStudentIds.length, 2, "Risk alert: 2 affected students");
    TestRunner.assertEqual(riskInsight.data.riskLevel, "high", "Risk alert: high risk level");
    TestRunner.assertType(riskInsight.data.priorityCalculation, "object", "Risk alert: has priorityCalculation");

    TestRunner.suite("Actionable Insights - Question Review with Cross-Level");

    var questionReviewResults = Recommendations.generateActionableInsights({
        topicMastery: [],
        atRiskStudents: [],
        questionStatistics: [
            { questionId: "Q-HARD", attempts: 8, correct: 1, accuracy: 12.5, topic: "Networks", difficulty: "hard" },
            { questionId: "Q-HARD2", attempts: 6, correct: 2, accuracy: 33.3, topic: "Networks", difficulty: "hard" }
        ],
        difficultyPerformance: [],
        bloomPerformance: [],
        trendDirection: "stable",
        classOverview: { totalAttempts: 15, uniqueStudents: 5 },
        totalStudents: 5,
        attempts: []
    });
    var qReviewInsight = null;
    for (var i = 0; i < questionReviewResults.length; i++) {
        if (questionReviewResults[i].type === "question_review_needed") { qReviewInsight = questionReviewResults[i]; break; }
    }
    TestRunner.assertNotNull(qReviewInsight, "Question review insight found");
    TestRunner.assertEqual(qReviewInsight.data.affectedQuestionIds.length, 2, "Question review: 2 affected questions");
    TestRunner.assertType(qReviewInsight.data.affectedTopics, "object", "Question review: has affectedTopics");

    TestRunner.suite("Actionable Insights - Declining Trend");

    var decliningResults = Recommendations.generateActionableInsights({
        topicMastery: [],
        atRiskStudents: [],
        questionStatistics: [],
        difficultyPerformance: [],
        bloomPerformance: [],
        trendDirection: "declining",
        classOverview: { totalAttempts: 10, uniqueStudents: 5, averagePercentage: 55 },
        totalStudents: 5,
        attempts: []
    });
    var decliningInsight = null;
    for (var i = 0; i < decliningResults.length; i++) {
        if (decliningResults[i].type === "declining_trend_alert") { decliningInsight = decliningResults[i]; break; }
    }
    TestRunner.assertNotNull(decliningInsight, "Declining insight found");
    TestRunner.assertTrue(decliningInsight.explanation.indexOf("declining") !== -1, "Declining: mentions declining");
    TestRunner.assertType(decliningInsight.data.priorityCalculation, "object", "Declining: has priorityCalculation");

    TestRunner.suite("Actionable Insights - Difficulty Concern");

    var difficultyResults = Recommendations.generateActionableInsights({
        topicMastery: [],
        atRiskStudents: [],
        questionStatistics: [],
        difficultyPerformance: [
            { difficulty: "easy", attempts: 20, correct: 18, accuracy: 90 },
            { difficulty: "hard", attempts: 15, correct: 4, accuracy: 26.67 }
        ],
        bloomPerformance: [],
        trendDirection: "stable",
        classOverview: { totalAttempts: 20, uniqueStudents: 5 },
        totalStudents: 5,
        attempts: []
    });
    var diffInsight = null;
    for (var i = 0; i < difficultyResults.length; i++) {
        if (difficultyResults[i].type === "difficulty_concern") { diffInsight = difficultyResults[i]; break; }
    }
    TestRunner.assertNotNull(diffInsight, "Difficulty insight found");
    TestRunner.assertTrue(diffInsight.title.indexOf("hard") !== -1, "Difficulty: mentions hard");

    TestRunner.suite("Actionable Insights - Bloom Concern");

    var bloomResults = Recommendations.generateActionableInsights({
        topicMastery: [],
        atRiskStudents: [],
        questionStatistics: [],
        difficultyPerformance: [],
        bloomPerformance: [
            { bloom: "knowledge", attempts: 20, correct: 18, accuracy: 90 },
            { bloom: "analysis", attempts: 10, correct: 3, accuracy: 30 }
        ],
        trendDirection: "stable",
        classOverview: { totalAttempts: 20, uniqueStudents: 5 },
        totalStudents: 5,
        attempts: []
    });
    var bloomInsight = null;
    for (var i = 0; i < bloomResults.length; i++) {
        if (bloomResults[i].type === "bloom_concern") { bloomInsight = bloomResults[i]; break; }
    }
    TestRunner.assertNotNull(bloomInsight, "Bloom insight found");
    TestRunner.assertTrue(bloomInsight.title.indexOf("thinking") !== -1, "Bloom: mentions thinking");

    TestRunner.suite("Actionable Insights - Priority Ordering");

    var orderedInsights = Recommendations.generateActionableInsights({
        topicMastery: [
            { topic: "Weak", accuracy: 20, totalQuestions: 30, correctAnswers: 6, incorrectAnswers: 24, masteryLevel: "Needs Support" }
        ],
        atRiskStudents: [
            { studentId: "s1", riskLevel: "high", reasons: ["Low average"] }
        ],
        questionStatistics: [
            { questionId: "Q1", attempts: 5, correct: 1, accuracy: 20, topic: "Weak" }
        ],
        difficultyPerformance: [
            { difficulty: "hard", attempts: 10, correct: 2, accuracy: 20 }
        ],
        bloomPerformance: [
            { bloom: "analysis", attempts: 8, correct: 2, accuracy: 25 }
        ],
        trendDirection: "declining",
        classOverview: { totalAttempts: 30, uniqueStudents: 8, averagePercentage: 40 },
        totalStudents: 8,
        attempts: []
    });
    TestRunner.assertGreaterThan(orderedInsights.length, 1, "Ordering: multiple insights");
    var prevScore = Infinity;
    var isOrdered = true;
    for (var i = 0; i < orderedInsights.length; i++) {
        var score = orderedInsights[i].data && orderedInsights[i].data.priorityCalculation ? orderedInsights[i].data.priorityCalculation.impactScore : 0;
        if (score > prevScore) { isOrdered = false; break; }
        prevScore = score;
    }
    TestRunner.assertTrue(isOrdered, "Ordering: insights sorted by impact score descending");

    TestRunner.suite("Actionable Insights - Confidence Levels");

    var confResults = Recommendations.generateActionableInsights({
        topicMastery: [
            { topic: "T", accuracy: 30, totalQuestions: 5, correctAnswers: 2, incorrectAnswers: 3, masteryLevel: "Needs Support" }
        ],
        atRiskStudents: [],
        questionStatistics: [],
        difficultyPerformance: [],
        bloomPerformance: [],
        trendDirection: "stable",
        classOverview: { totalAttempts: 5, uniqueStudents: 2 },
        totalStudents: 2,
        attempts: []
    });
    TestRunner.assertGreaterThan(confResults.length, 0, "Confidence: has insights");
    var confInsight = confResults[0];
    TestRunner.assertType(confInsight.dataSufficiency, "string", "Confidence: dataSufficiency is string");
    TestRunner.assertTrue(confInsight.dataSufficiency === "low" || confInsight.dataSufficiency === "medium" || confInsight.dataSufficiency === "high" || confInsight.dataSufficiency === "insufficient", "Confidence: valid confidence level");

    TestRunner.suite("Actionable Insights - No Cross-Contamination");

    var noContamResults = Recommendations.generateActionableInsights({
        topicMastery: [
            { topic: "ClassATopic", accuracy: 30, totalQuestions: 10, correctAnswers: 3, incorrectAnswers: 7, masteryLevel: "Needs Support" }
        ],
        atRiskStudents: [],
        questionStatistics: [],
        difficultyPerformance: [],
        bloomPerformance: [],
        trendDirection: "stable",
        classOverview: { totalAttempts: 10, uniqueStudents: 3 },
        totalStudents: 3,
        attempts: [
            { studentId: "s1", percentage: 40, questions: [{ questionId: "Q1", correct: false, topic: "ClassATopic" }] }
        ]
    });
    TestRunner.assertGreaterThan(noContamResults.length, 0, "No contamination: has insights");
    var ncInsight = noContamResults[0];
    TestRunner.assertEqual(ncInsight.data.affectedTopics.length, 1, "No contamination: 1 topic");
    TestRunner.assertEqual(ncInsight.data.affectedTopics[0], "ClassATopic", "No contamination: correct topic");

    TestRunner.suite("Actionable Insights - Legacy Attempts");

    var legacyResults = Recommendations.generateActionableInsights({
        topicMastery: [
            { topic: "T", accuracy: 40, totalQuestions: 5, correctAnswers: 2, incorrectAnswers: 3, masteryLevel: "Needs Support" }
        ],
        atRiskStudents: [],
        questionStatistics: [],
        difficultyPerformance: [],
        bloomPerformance: [],
        trendDirection: "stable",
        classOverview: { totalAttempts: 5, uniqueStudents: 2 },
        totalStudents: 2,
        attempts: [
            { studentId: "s1", questions: [{ correct: false, topic: "T" }] }
        ]
    });
    TestRunner.assertType(legacyResults, "object", "Legacy: handles attempts without questionId");

    TestRunner.suite("Actionable Insights - Bridge");

    var origAttemptsForBridge = allAttempts.slice();
    var origStudentsForBridge = studentAccounts.slice();
    studentAccounts = [
        { id: "ins-s1", classId: "INS-CLASS", name: "Insight Student 1" },
        { id: "ins-s2", classId: "INS-CLASS", name: "Insight Student 2" }
    ];
    allAttempts = [
        { studentId: "ins-s1", classId: "INS-CLASS", percentage: 30, questions: [
            { questionId: "q1", topic: "Weak", correct: false, difficulty: "hard" },
            { questionId: "q2", topic: "Weak", correct: false, difficulty: "hard" }
        ]},
        { studentId: "ins-s2", classId: "INS-CLASS", percentage: 80, questions: [
            { questionId: "q3", topic: "Strong", correct: true, difficulty: "easy" }
        ]}
    ];
    var bridgeInsights = TeacherAnalytics.getActionableInsights({ classId: "INS-CLASS", teacherClasses: ["INS-CLASS"] });
    TestRunner.assertType(bridgeInsights, "object", "Bridge: returns array");
    for (var bi = 0; bi < bridgeInsights.length; bi++) {
        TestRunner.assertType(bridgeInsights[bi].data.priorityCalculation, "object", "Bridge: insight " + bi + " has priorityCalculation");
        TestRunner.assertType(bridgeInsights[bi].dataSufficiency, "string", "Bridge: insight " + bi + " has dataSufficiency");
    }
    studentAccounts = origStudentsForBridge;
    allAttempts = origAttemptsForBridge;

    TestRunner.suite("Actionable Insights - Bridge Empty");

    var emptyBridgeInsights = TeacherAnalytics.getActionableInsights({});
    TestRunner.assertEqual(emptyBridgeInsights.length, 0, "Bridge empty: no insights");
}
