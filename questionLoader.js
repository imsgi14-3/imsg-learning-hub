var QuestionLoader = (function() {
    var allQuestions = [];
    var loadedChapters = {};
    // Pages served from a sub-folder (e.g. tests/test-runner.html) set
    // QUESTION_BANK_BASE = "../" before this script so bank URLs resolve correctly.
    var bankBase = (typeof QUESTION_BANK_BASE !== "undefined" && QUESTION_BANK_BASE) ? QUESTION_BANK_BASE : "";

    var chapterConfig = {
        1: { chapter: 1, chapterTitle: "Computer Systems", subject: "Computer Science", grade: 9, source: "NBF Grade 9 Computer Science, Unit 1", file: "question-bank/grade9/computer-science/chapter1.json" },
        2: { chapter: 2, chapterTitle: "Computational Thinking & Algorithms", subject: "Computer Science", grade: 9, source: "NBF Grade 9 Computer Science, Unit 2", file: "question-bank/grade9/computer-science/chapter2.json" },
        3: { chapter: 3, chapterTitle: "Programming Fundamentals", subject: "Computer Science", grade: 9, source: "NBF Grade 9 Computer Science, Unit 3", file: "question-bank/grade9/computer-science/chapter3.json" },
        4: { chapter: 4, chapterTitle: "Data and Analysis", subject: "Computer Science", grade: 9, source: "NBF Grade 9 Computer Science, Unit 4", file: "question-bank/grade9/computer-science/chapter4.json" },
        5: { chapter: 5, chapterTitle: "Applications of Computer Science", subject: "Computer Science", grade: 9, source: "NBF Grade 9 Computer Science, Unit 5", file: "question-bank/grade9/computer-science/chapter5.json" },
        6: { chapter: 6, chapterTitle: "Impacts of Computing", subject: "Computer Science", grade: 9, source: "NBF Grade 9 Computer Science, Unit 6", file: "question-bank/grade9/computer-science/chapter6.json" },
        7: { chapter: 7, chapterTitle: "Entrepreneurship", subject: "Computer Science", grade: 9, source: "NBF Grade 9 Computer Science, Unit 7", file: "question-bank/grade9/computer-science/chapter7.json" },
        "chemistry-1": { chapter: 1, chapterTitle: "Nature of Science in Chemistry", subject: "Chemistry", grade: 9, source: "FBISE Chemistry Grade IX, Curriculum 2022-23", file: "question-bank/grade9/chemistry/chapter1.json" },
        "chemistry-2": { chapter: 2, chapterTitle: "Matter", subject: "Chemistry", grade: 9, source: "FBISE Chemistry Grade IX, Curriculum 2022-23", file: "question-bank/grade9/chemistry/chapter2.json" },
        "chemistry-3": { chapter: 3, chapterTitle: "Atomic Structure", subject: "Chemistry", grade: 9, source: "FBISE Chemistry Grade IX, Curriculum 2022-23", file: "question-bank/grade9/chemistry/chapter3.json" },
        "chemistry-4": { chapter: 4, chapterTitle: "Periodic Table and Periodicity of Properties", subject: "Chemistry", grade: 9, source: "FBISE Chemistry Grade IX, Curriculum 2022-23", file: "question-bank/grade9/chemistry/chapter4.json" },
        "chemistry-5": { chapter: 5, chapterTitle: "Chemical Bonding", subject: "Chemistry", grade: 9, source: "FBISE Chemistry Grade IX, Curriculum 2022-23", file: "question-bank/grade9/chemistry/chapter5.json" },
        "chemistry-6": { chapter: 6, chapterTitle: "Stoichiometry", subject: "Chemistry", grade: 9, source: "FBISE Chemistry Grade IX, Curriculum 2022-23", file: "question-bank/grade9/chemistry/chapter6.json" },
        "chemistry-7": { chapter: 7, chapterTitle: "Electrochemistry", subject: "Chemistry", grade: 9, source: "FBISE Chemistry Grade IX, Curriculum 2022-23", file: "question-bank/grade9/chemistry/chapter7.json" },
        "chemistry-8": { chapter: 8, chapterTitle: "Energetics", subject: "Chemistry", grade: 9, source: "FBISE Chemistry Grade IX, Curriculum 2022-23", file: "question-bank/grade9/chemistry/chapter8.json" },
        "chemistry-9": { chapter: 9, chapterTitle: "Chemical Equilibrium", subject: "Chemistry", grade: 9, source: "FBISE Chemistry Grade IX, Curriculum 2022-23", file: "question-bank/grade9/chemistry/chapter9.json" },
        "chemistry-10": { chapter: 10, chapterTitle: "Acids, Bases, and Salts", subject: "Chemistry", grade: 9, source: "FBISE Chemistry Grade IX, Curriculum 2022-23", file: "question-bank/grade9/chemistry/chapter10.json" },
        "chemistry-11": { chapter: 11, chapterTitle: "Environmental Chemistry\u2014Air", subject: "Chemistry", grade: 9, source: "FBISE Chemistry Grade IX, Curriculum 2022-23", file: "question-bank/grade9/chemistry/chapter11.json" },
        "chemistry-12": { chapter: 12, chapterTitle: "Environmental Chemistry\u2014Water", subject: "Chemistry", grade: 9, source: "FBISE Chemistry Grade IX, Curriculum 2022-23", file: "question-bank/grade9/chemistry/chapter12.json" },
        "chemistry-13": { chapter: 13, chapterTitle: "Organic Chemistry", subject: "Chemistry", grade: 9, source: "FBISE Chemistry Grade IX, Curriculum 2022-23", file: "question-bank/grade9/chemistry/chapter13.json" },
        "chemistry-14": { chapter: 14, chapterTitle: "Hydrocarbons", subject: "Chemistry", grade: 9, source: "FBISE Chemistry Grade IX, Curriculum 2022-23", file: "question-bank/grade9/chemistry/chapter14.json" },
        "chemistry-15": { chapter: 15, chapterTitle: "Biochemistry", subject: "Chemistry", grade: 9, source: "FBISE Chemistry Grade IX, Curriculum 2022-23", file: "question-bank/grade9/chemistry/chapter15.json" },
        "chemistry-16": { chapter: 16, chapterTitle: "Empirical Data Collection and Analysis", subject: "Chemistry", grade: 9, source: "FBISE Chemistry Grade IX, Curriculum 2022-23", file: "question-bank/grade9/chemistry/chapter16.json" },
        "chemistry-17": { chapter: 17, chapterTitle: "Separation Techniques", subject: "Chemistry", grade: 9, source: "FBISE Chemistry Grade IX, Curriculum 2022-23", file: "question-bank/grade9/chemistry/chapter17.json" },
        "chemistry-18": { chapter: 18, chapterTitle: "Qualitative Analysis", subject: "Chemistry", grade: 9, source: "FBISE Chemistry Grade IX, Curriculum 2022-23", file: "question-bank/grade9/chemistry/chapter18.json" },
        "chemistry-19": { chapter: 19, chapterTitle: "Chromatography", subject: "Chemistry", grade: 9, source: "FBISE Chemistry Grade IX, Curriculum 2022-23", file: "question-bank/grade9/chemistry/chapter19.json" }
    };

    function loadChapter(chapterNum, callback) {
        if (loadedChapters[chapterNum]) {
            if (callback) callback(loadedChapters[chapterNum]);
            return;
        }
        var config = chapterConfig[chapterNum];
        if (!config) { if (callback) callback(null); return; }
        var url = bankBase + (config.file || ("question-bank/grade9/computer-science/chapter" + chapterNum + ".json"));
        url += "?v=" + Date.now();
        fetch(url)
            .then(function(resp) {
                if (!resp.ok) throw new Error("File not found");
                return resp.json();
            })
            .then(function(data) {
                var meta = chapterConfig[chapterNum] || data;
                // Bank files may be { questions: [...] } or a bare array.
                var qs = Array.isArray(data) ? data : (data.questions || []);
                for (var i = 0; i < qs.length; i++) {
                    if (!qs[i].subject) qs[i].subject = meta.subject;
                    if (!qs[i].grade) qs[i].grade = meta.grade;
                    if (!qs[i].chapter) qs[i].chapter = meta.chapter;
                    if (!qs[i].scenario) qs[i].scenario = qs[i].stimulus || qs[i].scenario_stimulus || "";
                    allQuestions.push(qs[i]);
                }
                loadedChapters[chapterNum] = { questions: qs, subject: meta.subject, grade: meta.grade, chapter: meta.chapter, chapterTitle: meta.chapterTitle || meta.chapterTitle };
                console.log("Loaded " + qs.length + " questions from Chapter " + meta.chapter + (meta.subject && meta.subject !== "Computer Science" ? " (" + meta.subject + ")" : ""));
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
        var chapters = Object.keys(chapterConfig);
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
