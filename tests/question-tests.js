function runQuestionTests() {
    TestRunner.suite("Question Bank - JSON Loading");

    TestRunner.assertType(questions, "object", "Questions is an array");
    TestRunner.assertGreaterThan(questions.length, 0, "Questions loaded");

    var chapterCounts = {};
    for (var i = 0; i < questions.length; i++) {
        var ch = questions[i].chapter;
        if (!chapterCounts[ch]) chapterCounts[ch] = 0;
        chapterCounts[ch]++;
    }
    TestRunner.assertGreaterThan(Object.keys(chapterCounts).length, 0, "Questions organized by chapter");

    TestRunner.suite("Question Bank - ID Uniqueness");

    var ids = {};
    var dupeCount = 0;
    for (var i = 0; i < questions.length; i++) {
        if (ids[questions[i].id]) dupeCount++;
        ids[questions[i].id] = true;
    }
    TestRunner.assertEqual(dupeCount, 0, "No duplicate question IDs");

    TestRunner.suite("Question Bank - Required Fields");

    var missingFields = 0;
    for (var i = 0; i < questions.length; i++) {
        var q = questions[i];
        if (!q.id || !q.question || !q.options || !q.answer || !q.topic) missingFields++;
    }
    TestRunner.assertEqual(missingFields, 0, "All questions have required fields (id, question, options, answer, topic)");

    TestRunner.suite("Question Bank - Options Count");

    var badOptions = 0;
    for (var i = 0; i < questions.length; i++) {
        if (!questions[i].options || questions[i].options.length !== 4) badOptions++;
    }
    TestRunner.assertEqual(badOptions, 0, "All questions have exactly 4 options");

    TestRunner.suite("Question Bank - Answer Validity");

    var badAnswers = 0;
    for (var i = 0; i < questions.length; i++) {
        var a = questions[i].answer;
        if (!a || a.length !== 1 || a.charCodeAt(0) < 65 || a.charCodeAt(0) > 68) badAnswers++;
    }
    TestRunner.assertEqual(badAnswers, 0, "All answers are A/B/C/D");

    TestRunner.suite("Question Bank - Topic Coverage");

    var topicQ = {};
    for (var i = 0; i < questions.length; i++) {
        var t = questions[i].topic;
        if (!topicQ[t]) topicQ[t] = 0;
        topicQ[t]++;
    }
    var topicKeys = Object.keys(topicQ);
    TestRunner.assertGreaterThan(topicKeys.length, 5, "Multiple topics covered");

    var topicsWithPair = 0;
    for (var i = 0; i < topicKeys.length; i++) {
        if (topicQ[topicKeys[i]] >= 2) topicsWithPair++;
    }
    TestRunner.assertGreaterThan(topicsWithPair, topicKeys.length * 0.5, "Majority of topics have 2+ questions");

    TestRunner.suite("Question Bank - Subject Data Config");

    TestRunner.assertNotNull(subjectsData, "SubjectsData exists");
    TestRunner.assertNotNull(subjectsData["Computer Science"], "CS subject configured");
    TestRunner.assertGreaterThan(subjectsData["Computer Science"].chapters.length, 0, "CS has chapters");

    var cs1 = subjectsData["Computer Science"].chapters[0];
    TestRunner.assertEqual(cs1.num, 1, "First chapter is chapter 1");
    TestRunner.assertGreaterThan(cs1.topics.length, 5, "Chapter 1 has 6+ topics");

    TestRunner.assertNotNull(subjectsData["Chemistry"], "Chemistry subject configured");
    TestRunner.assertEqual(subjectsData["Chemistry"].chapters.length, 19, "Chemistry has 19 chapters");

    var unknownSubject = 0, chemCount = 0;
    for (var i = 0; i < questions.length; i++) {
        if (!subjectsData[questions[i].subject]) unknownSubject++;
        if (questions[i].subject === "Chemistry") chemCount++;
    }
    TestRunner.assertEqual(unknownSubject, 0, "Every loaded question maps to a configured subject");
    TestRunner.assertGreaterThan(chemCount, 500, "Chemistry bank is loaded (500+ questions)");

    TestRunner.suite("Question Bank - QuestionLoader Module");

    TestRunner.assertType(QuestionLoader, "object", "QuestionLoader module exists");
    TestRunner.assertType(QuestionLoader.loadChapter, "function", "loadChapter function exists");
    TestRunner.assertType(QuestionLoader.loadAllChapters, "function", "loadAllChapters function exists");
    TestRunner.assertType(QuestionLoader.getAllQuestions, "function", "getAllQuestions function exists");
    TestRunner.assertType(QuestionLoader.getChapterQuestions, "function", "getChapterQuestions function exists");
    TestRunner.assertType(QuestionLoader.filterQuestions, "function", "filterQuestions function exists");
    TestRunner.assertType(QuestionLoader.getTopics, "function", "getTopics function exists");
    TestRunner.assertType(QuestionLoader.getStats, "function", "getStats function exists");
}
