var QuestionLoader = (function() {
    var allQuestions = [];
    var loadedChapters = {};

    var chapterConfig = {
        1: { chapter: 1, chapterTitle: "Computer Systems", subject: "Computer Science", grade: 9, source: "NBF Grade 9 Computer Science, Unit 1", file: "question-bank/grade9/computer-science/chapter1.json" },
        2: { chapter: 2, chapterTitle: "Networks and Communication", subject: "Computer Science", grade: 9, source: "NBF Grade 9 Computer Science, Unit 2", file: "question-bank/grade9/computer-science/chapter2.json" },
        3: { chapter: 3, chapterTitle: "Data and Privacy", subject: "Computer Science", grade: 9, source: "NBF Grade 9 Computer Science, Unit 3", file: "question-bank/grade9/computer-science/chapter3.json" },
        4: { chapter: 4, chapterTitle: "Programming Basics", subject: "Computer Science", grade: 9, source: "NBF Grade 9 Computer Science, Unit 4", file: "question-bank/grade9/computer-science/chapter4.json" },
        5: { chapter: 5, chapterTitle: "Problem Solving", subject: "Computer Science", grade: 9, source: "NBF Grade 9 Computer Science, Unit 5", file: "question-bank/grade9/computer-science/chapter5.json" },
        6: { chapter: 6, chapterTitle: "Arrays and Lists", subject: "Computer Science", grade: 9, source: "NBF Grade 9 Computer Science, Unit 6", file: "question-bank/grade9/computer-science/chapter6.json" },
        7: { chapter: 7, chapterTitle: "Website Development", subject: "Computer Science", grade: 9, source: "NBF Grade 9 Computer Science, Unit 7", file: "question-bank/grade9/computer-science/chapter7.json" }
    };

    function loadChapter(chapterNum, callback) {
        if (loadedChapters[chapterNum]) {
            if (callback) callback(loadedChapters[chapterNum]);
            return;
        }
        var config = chapterConfig[chapterNum];
        if (!config) { if (callback) callback(null); return; }
        var url = config.file || ("question-bank/grade9/computer-science/chapter" + chapterNum + ".json");
        fetch(url)
            .then(function(resp) {
                if (!resp.ok) throw new Error("File not found");
                return resp.json();
            })
            .then(function(data) {
                var meta = chapterConfig[chapterNum] || data;
                var qs = data.questions || [];
                for (var i = 0; i < qs.length; i++) {
                    if (!qs[i].subject) qs[i].subject = meta.subject;
                    if (!qs[i].grade) qs[i].grade = meta.grade;
                    if (!qs[i].chapter) qs[i].chapter = meta.chapter;
                    allQuestions.push(qs[i]);
                }
                loadedChapters[chapterNum] = { questions: qs, subject: meta.subject, grade: meta.grade, chapter: meta.chapter, chapterTitle: meta.chapterTitle || meta.chapterTitle };
                console.log("Loaded " + qs.length + " questions from Chapter " + chapterNum);
                if (callback) callback(loadedChapters[chapterNum]);
            })
            .catch(function(err) {
                console.log("Could not load chapter " + chapterNum + ": " + err.message);
                if (callback) callback(null);
            });
    }

    function loadMultipleChapters(chapters, callback) {
        var remaining = chapters.length;
        if (remaining === 0) { if (callback) callback(allQuestions); return; }
        for (var i = 0; i < chapters.length; i++) {
            loadChapter(chapters[i], function() {
                remaining--;
                if (remaining === 0 && callback) callback(allQuestions);
            });
        }
    }

    function loadAllChapters(callback) {
        var chapters = Object.keys(chapterConfig).map(Number);
        loadMultipleChapters(chapters, callback);
    }

    function getAllQuestions() { return allQuestions; }

    function getChapterQuestions(chapterNum) {
        return loadedChapters[chapterNum] ? loadedChapters[chapterNum].questions : [];
    }

    function filterQuestions(filters) {
        var result = allQuestions;
        if (filters.chapter) result = result.filter(function(q) { return q.chapter === filters.chapter; });
        if (filters.topic) result = result.filter(function(q) { return q.topic === filters.topic; });
        if (filters.difficulty) result = result.filter(function(q) { return q.difficulty === filters.difficulty; });
        if (filters.mode) result = result.filter(function(q) { return q.mode === filters.mode; });
        if (filters.bloom) result = result.filter(function(q) { return q.bloom === filters.bloom; });
        return result;
    }

    function getTopics(chapterNum) {
        var qs = chapterNum ? getChapterQuestions(chapterNum) : allQuestions;
        var topics = {};
        for (var i = 0; i < qs.length; i++) topics[qs[i].topic] = true;
        return Object.keys(topics);
    }

    function getStats() {
        var stats = { total: allQuestions.length, byChapter: {}, byDifficulty: {}, byMode: {}, byTopic: {} };
        for (var i = 0; i < allQuestions.length; i++) {
            var q = allQuestions[i];
            var ch = "Chapter " + q.chapter;
            if (!stats.byChapter[ch]) stats.byChapter[ch] = 0;
            stats.byChapter[ch]++;
            if (!stats.byDifficulty[q.difficulty]) stats.byDifficulty[q.difficulty] = 0;
            stats.byDifficulty[q.difficulty]++;
            if (!stats.byMode[q.mode]) stats.byMode[q.mode] = 0;
            stats.byMode[q.mode]++;
            if (!stats.byTopic[q.topic]) stats.byTopic[q.topic] = 0;
            stats.byTopic[q.topic]++;
        }
        return stats;
    }

    function getChapterConfig() { return chapterConfig; }

    return {
        loadChapter: loadChapter,
        loadMultipleChapters: loadMultipleChapters,
        loadAllChapters: loadAllChapters,
        getAllQuestions: getAllQuestions,
        getChapterQuestions: getChapterQuestions,
        filterQuestions: filterQuestions,
        getTopics: getTopics,
        getStats: getStats,
        getChapterConfig: getChapterConfig
    };
})();
