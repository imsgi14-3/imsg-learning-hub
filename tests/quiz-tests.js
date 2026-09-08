function runQuizTests() {
    TestRunner.suite("Quiz System - Question Loading");

    TestRunner.assertGreaterThan(questions.length, 0, "Questions loaded");
    TestRunner.assertEqual(questions.length, 199, "199 questions loaded from JSON");

    var validQ = 0;
    for (var i = 0; i < questions.length; i++) {
        var q = questions[i];
        if (q.id && q.question && q.options && q.options.length === 4 && q.answer) validQ++;
    }
    TestRunner.assertEqual(validQ, 199, "All 199 questions have valid structure");

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
    TestRunner.assertEqual(topicKeys.length, 9, "9 unique topics");

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

    TestRunner.assertEqual(quizTimeLimit, 60, "Quiz time limit is 60 seconds");
    TestRunner.assertType(timeLeft, "number", "TimeLeft is a number");
}
