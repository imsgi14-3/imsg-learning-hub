var QuizEngine = (function() {
    var currentQuestion = 0;
    var score = 0;
    var timeLeft = 60;
    var timer = null;
    var quizQuestions = [];
    var userAnswers = [];
    var quizMode = "";
    var quizSubject = "";
    var quizChapter = "";

    function getQuizQuestions() { return quizQuestions; }
    function getUserAnswers() { return userAnswers; }
    function getCurrentQuestion() { return currentQuestion; }
    function getScore() { return score; }
    function getTimeLeft() { return timeLeft; }
    function getQuizMode() { return quizMode; }
    function getQuizSubject() { return quizSubject; }
    function getQuizChapter() { return quizChapter; }
    function getTimer() { return timer; }

    function startQuiz(questions, mode, subject, chapter) {
        quizQuestions = questions;
        quizMode = mode || "practice";
        quizSubject = subject || "";
        quizChapter = chapter || "";
        currentQuestion = 0;
        score = 0;
        timeLeft = 60;
        userAnswers = [];
        clearTimer();
    }

    function clearTimer() {
        if (timer) { clearInterval(timer); timer = null; }
    }

    function startTimer() {
        clearTimer();
        timer = setInterval(function() {
            timeLeft--;
            UI.updateTimerDisplay(timeLeft);
            if (timeLeft <= 0) {
                clearTimer();
                var attempt = finish();
                UI.showQuizResult(attempt);
            }
        }, 1000);
    }

    function stopTimer() { clearTimer(); }

    function recordAnswer(questionIndex, selectedAnswer) {
        userAnswers[questionIndex] = selectedAnswer;
        var q = quizQuestions[questionIndex];
        var opts = ["A", "B", "C", "D"];
        var correctIdx = opts.indexOf(q.answer);
        if (selectedAnswer === correctIdx) score++;
    }

    function buildQuestionResults() {
        var results = [];
        var opts = ["A", "B", "C", "D"];
        for (var i = 0; i < quizQuestions.length; i++) {
            var q = quizQuestions[i];
            var selectedIdx = userAnswers[i];
            var selectedLetter = (selectedIdx !== undefined && selectedIdx !== null) ? opts[selectedIdx] : null;
            var correctIdx = opts.indexOf(q.answer);
            results.push({
                questionId: q.id || ("Q-" + i),
                questionText: q.question || "",
                options: q.options ? q.options.slice() : [],
                selectedAnswer: selectedLetter,
                selectedAnswerIndex: (selectedIdx !== undefined && selectedIdx !== null) ? selectedIdx : -1,
                correctAnswer: q.answer,
                correctAnswerIndex: correctIdx,
                isCorrect: selectedLetter === q.answer,
                topic: q.topic || "General",
                difficulty: q.difficulty || "medium",
                chapter: q.chapter || "",
                subject: q.subject || "",
                explanation: q.explanation || ""
            });
        }
        return results;
    }

    function finish() {
        clearTimer();
        var total = quizQuestions.length;
        var percentage = total > 0 ? Number(((score / total) * 100).toFixed(2)) : 0;
        var wrong = total - score;
        var timeUsed = 60 - timeLeft;
        var questionResults = buildQuestionResults();

        var user = Auth.getUser();
        var attempt = {
            studentId: user ? user.id : "unknown",
            subject: quizSubject,
            chapter: quizChapter,
            mode: quizMode,
            totalQuestions: total,
            score: score,
            wrong: wrong,
            timeUsed: timeUsed,
            percentage: percentage,
            questionResults: questionResults,
            timestamp: Date.now()
        };

        if (typeof db !== "undefined" && db) {
            attempt.attemptId = "att_" + (user ? user.id : "anon") + "_" + Date.now();
            db.collection("attempts").doc(attempt.attemptId).set(attempt).catch(function() {});
        }
        DataStore.addAttempt(attempt);

        return attempt;
    }

    return {
        getQuizQuestions: getQuizQuestions,
        getUserAnswers: getUserAnswers,
        getCurrentQuestion: function() { return currentQuestion; },
        setCurrentQuestion: function(v) { currentQuestion = v; },
        getScore: function() { return score; },
        getTimeLeft: getTimeLeft,
        getQuizMode: getQuizMode,
        getQuizSubject: getQuizSubject,
        getQuizChapter: getQuizChapter,
        getTimer: getTimer,
        startQuiz: startQuiz,
        startTimer: startTimer,
        stopTimer: stopTimer,
        recordAnswer: recordAnswer,
        finish: finish
    };
})();
