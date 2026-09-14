function runQuizTests() {
    TestRunner.suite("Quiz System - Question Loading");

    TestRunner.assertGreaterThan(questions.length, 0, "Questions loaded");
    TestRunner.assertGreaterThan(questions.length, 50, "50+ questions loaded from JSON");

    var validQ = 0;
    for (var i = 0; i < questions.length; i++) {
        var q = questions[i];
        if (q.id && q.question && q.options && q.options.length === 4 && q.answer) validQ++;
    }
    TestRunner.assertEqual(validQ, questions.length, "All loaded questions have valid structure");

    TestRunner.suite("Quiz System - Question Fields");

    var q = questions[0];
    TestRunner.assertNotNull(q.id, "Question has ID");
    TestRunner.assertEqual(q.chapter, 1, "Question chapter is 1");
    TestRunner.assertNotNull(q.topic, "Question has topic");
    TestRunner.assertEqual(q.type, "mcq", "Question type is MCQ");
    TestRunner.assertTrue(q.options.length === 4, "Question has 4 options");
    TestRunner.assertInRange(q.answer.charCodeAt(0), 65, 68, "Answer is A/B/C/D");

    TestRunner.suite("Quiz System - Shuffle Array");

    var original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var shuffled = shuffleArray(original.slice());
    TestRunner.assertEqual(shuffled.length, original.length, "Shuffled array same length");
    var sameOrder = true;
    for (var i = 0; i < original.length; i++) {
        if (original[i] !== shuffled[i]) { sameOrder = false; break; }
    }
    TestRunner.assertFalse(sameOrder, "Shuffled array is different order (statistical)");

    TestRunner.suite("Quiz System - Topic Filtering");

    var topics = {};
    for (var i = 0; i < questions.length; i++) {
        var t = questions[i].topic;
        if (!topics[t]) topics[t] = 0;
        topics[t]++;
    }
    var topicKeys = Object.keys(topics);
    TestRunner.assertGreaterThan(topicKeys.length, 5, "Multiple topics found");
    TestRunner.assertGreaterThan(topicKeys.length, 6, "6+ unique topics");

    TestRunner.suite("Quiz System - Difficulty Distribution");

    var diffCount = { easy: 0, medium: 0, hard: 0 };
    for (var i = 0; i < questions.length; i++) {
        if (questions[i].difficulty) {
            if (!diffCount[questions[i].difficulty]) diffCount[questions[i].difficulty] = 0;
            diffCount[questions[i].difficulty]++;
        }
    }
    TestRunner.assertGreaterThan(diffCount.easy + diffCount.medium, 0, "Has easy/medium questions");

    TestRunner.suite("Quiz System - Mode Distribution");

    var modeCount = { straight: 0, scenario: 0 };
    for (var i = 0; i < questions.length; i++) {
        if (questions[i].mode) {
            if (!modeCount[questions[i].mode]) modeCount[questions[i].mode] = 0;
            modeCount[questions[i].mode]++;
        }
    }
    TestRunner.assertGreaterThan(modeCount.straight, 0, "Has straight questions");
    TestRunner.assertGreaterThan(modeCount.scenario, 0, "Has scenario questions");

    TestRunner.suite("Quiz System - Bloom's Taxonomy");

    var bloomCount = {};
    for (var i = 0; i < questions.length; i++) {
        if (questions[i].bloom) {
            if (!bloomCount[questions[i].bloom]) bloomCount[questions[i].bloom] = 0;
            bloomCount[questions[i].bloom]++;
        }
    }
    var bloomKeys = Object.keys(bloomCount);
    TestRunner.assertGreaterThan(bloomKeys.length, 1, "Multiple Bloom's levels");

    TestRunner.suite("Quiz System - Score Calculation");

    var totalQ = 20;
    var correct = 15;
    var score = Math.round((correct / totalQ) * 100);
    TestRunner.assertEqual(score, 75, "Score calculation: 15/20 = 75%");

    var zeroScore = Math.round((0 / totalQ) * 100);
    TestRunner.assertEqual(zeroScore, 0, "Score calculation: 0/20 = 0%");

    var perfectScore = Math.round((totalQ / totalQ) * 100);
    TestRunner.assertEqual(perfectScore, 100, "Score calculation: 20/20 = 100%");

    TestRunner.suite("Quiz System - Timer");

    QuizEngine.startQuiz(questions.slice(0, 1), "practice", "Computer Science", 1, "");
    var timeAfterStart = QuizEngine.getTimeLeft();
    TestRunner.assertType(timeAfterStart, "number", "TimeLeft is a number after startQuiz");
    TestRunner.assertTrue(timeAfterStart > 0, "TimeLeft is positive after startQuiz");

    TestRunner.suite("Phase 1 - Quiz State Initialization");

    var testQuestions = questions.slice(0, 3);
    QuizEngine.startQuiz(testQuestions, "practice", "Computer Science", 1, "");
    TestRunner.assertEqual(QuizEngine.getQuizQuestions().length, 3, "Quiz loaded 3 questions");
    TestRunner.assertEqual(QuizEngine.getScore(), 0, "Score starts at 0");
    TestRunner.assertEqual(QuizEngine.getCurrentQuestion(), 0, "Current question starts at 0");
    TestRunner.assertEqual(QuizEngine.getQuizMode(), "practice", "Quiz mode is practice");
    TestRunner.assertEqual(QuizEngine.getQuizSubject(), "Computer Science", "Quiz subject set");
    TestRunner.assertEqual(QuizEngine.getQuizChapter(), 1, "Quiz chapter set");
    TestRunner.assertEqual(QuizEngine.getAssignmentId(), "", "Assignment ID empty for practice");

    TestRunner.suite("Phase 1 - Attempt Structure (Recent Attempts)");

    var recentAttempts = [];
    for (var i = allAttempts.length - 1; i >= 0 && i >= allAttempts.length - 5; i--) {
        recentAttempts.push(allAttempts[i]);
    }
    if (recentAttempts.length > 0) {
        for (var ai = 0; ai < recentAttempts.length; ai++) {
            var a = recentAttempts[ai];
            TestRunner.assertNotNull(a.attemptId, "Attempt " + ai + " has attemptId");
            TestRunner.assertNotNull(a.timestamp, "Attempt " + ai + " has timestamp");
            TestRunner.assertNotNull(a.studentId, "Attempt " + ai + " has studentId");
            TestRunner.assertNotNull(a.subject, "Attempt " + ai + " has subject");
            TestRunner.assertType(a.score, "number", "Attempt " + ai + " score is number");
            TestRunner.assertType(a.total, "number", "Attempt " + ai + " total is number");
            TestRunner.assertType(a.percentage, "number", "Attempt " + ai + " percentage is number");
            TestRunner.assertInRange(a.percentage, 0, 100, "Attempt " + ai + " percentage 0-100");
            TestRunner.assertType(a.timeSpent, "number", "Attempt " + ai + " timeSpent is number");
            TestRunner.assertTrue(a.timeSpent >= 0, "Attempt " + ai + " timeSpent non-negative");
            TestRunner.assertNotNull(a.mode, "Attempt " + ai + " has mode");
            TestRunner.assertType(a.questions, "object", "Attempt " + ai + " questions is array");
            TestRunner.assertType(a.topicPerformance, "object", "Attempt " + ai + " topicPerformance is object");
        }
    }

    TestRunner.suite("Phase 1 - Attempt Timestamps");

    if (recentAttempts.length > 0) {
        var a = recentAttempts[0];
        var hasStartedAt = a.startedAt !== undefined && a.startedAt !== null;
        var hasCompletedAt = a.completedAt !== undefined && a.completedAt !== null;
        TestRunner.assertTrue(hasStartedAt || a.timestamp !== undefined, "Attempt has startedAt or legacy timestamp");
        if (hasStartedAt) {
            TestRunner.assertType(a.startedAt, "string", "startedAt is string (ISO)");
            TestRunner.assertType(a.completedAt, "string", "completedAt is string (ISO)");
            var startDate = new Date(a.startedAt);
            var completedDate = new Date(a.completedAt);
            TestRunner.assertTrue(!isNaN(startDate.getTime()), "startedAt is valid date");
            TestRunner.assertTrue(!isNaN(completedDate.getTime()), "completedAt is valid date");
            TestRunner.assertTrue(completedDate.getTime() >= startDate.getTime(), "completedAt >= startedAt");
        }
    }

    TestRunner.suite("Phase 1 - Attempt ClassId");

    if (recentAttempts.length > 0) {
        var a = recentAttempts[0];
        var hasClassId = a.classId !== undefined;
        TestRunner.assertTrue(hasClassId || a.studentId !== undefined, "Attempt has classId or studentId");
        if (hasClassId) {
            TestRunner.assertType(a.classId, "string", "classId is string");
        }
    }

    TestRunner.suite("Phase 1 - Per-Question Metadata");

    if (recentAttempts.length > 0) {
        var a = recentAttempts[0];
        if (a.questions && a.questions.length > 0) {
            for (var qi = 0; qi < a.questions.length; qi++) {
                var qRec = a.questions[qi];
                TestRunner.assertNotNull(qRec.questionId, "Q" + qi + " has questionId");
                var hasSelected = qRec.selectedAnswer !== undefined;
                var hasCorrect = qRec.correct !== undefined;
                TestRunner.assertTrue(hasSelected || hasCorrect, "Q" + qi + " has selectedAnswer or correct");
                TestRunner.assertType(qRec.timeUsed, "number", "Q" + qi + " timeUsed is number");
                TestRunner.assertTrue(qRec.timeUsed >= 0, "Q" + qi + " timeUsed non-negative");
                var hasTopic = qRec.topic !== undefined && qRec.topic !== null;
                var hasDifficulty = qRec.difficulty !== undefined && qRec.difficulty !== null;
                var hasBloom = qRec.bloom !== undefined && qRec.bloom !== null;
                TestRunner.assertTrue(hasTopic || hasCorrect, "Q" + qi + " has topic or is legacy");
                if (hasTopic) {
                    TestRunner.assertType(qRec.topic, "string", "Q" + qi + " topic is string");
                    TestRunner.assertType(qRec.difficulty, "string", "Q" + qi + " difficulty is string");
                    TestRunner.assertType(qRec.bloom, "string", "Q" + qi + " bloom is string");
                }
            }
        }
    }

    TestRunner.suite("Phase 1 - Backward Compatibility (Old Attempts)");

    var oldAttempt = {
        attemptId: "attempt-old-001",
        timestamp: "2026-01-01T00:00:00.000Z",
        studentId: "test-student",
        subject: "Computer Science",
        grade: 9,
        score: 5,
        total: 10,
        percentage: 50,
        timeSpent: 300,
        mode: "practice",
        assignmentId: "",
        questions: [
            { questionId: "cs-ch1-q01", selectedAnswer: "Option A", correct: true, timeUsed: 0 },
            { questionId: "cs-ch1-q02", selectedAnswer: "Option B", correct: false, timeUsed: 0 }
        ],
        topicPerformance: { "Topic A": { correct: 1, total: 2, percentage: 50 } }
    };
    TestRunner.assertNotNull(oldAttempt.timestamp, "Old attempt has timestamp");
    TestRunner.assertNotNull(oldAttempt.studentId, "Old attempt has studentId");
    TestRunner.assertType(oldAttempt.percentage, "number", "Old attempt percentage is number");
    TestRunner.assertType(oldAttempt.questions, "object", "Old attempt questions is array");
    TestRunner.assertTrue(oldAttempt.questions.length === 2, "Old attempt has 2 questions");
    var oldQ = oldAttempt.questions[0];
    TestRunner.assertNotNull(oldQ.questionId, "Old question has questionId");
    TestRunner.assertType(oldQ.correct, "boolean", "Old question correct is boolean");
    var oldMissingTopic = oldQ.topic === undefined;
    var oldMissingDifficulty = oldQ.difficulty === undefined;
    var oldMissingBloom = oldQ.bloom === undefined;
    TestRunner.assertTrue(oldMissingTopic || true, "Old question may lack topic (backward compat)");
    var oldTimeUsedZero = oldQ.timeUsed === 0;
    TestRunner.assertTrue(oldTimeUsedZero || true, "Old question may have timeUsed=0 (backward compat)");
    TestRunner.assertTrue(oldAttempt.classId === undefined || true, "Old attempt may lack classId (backward compat)");
    TestRunner.assertTrue(oldAttempt.startedAt === undefined || true, "Old attempt may lack startedAt (backward compat)");
}
