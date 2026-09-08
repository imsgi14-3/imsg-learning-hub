var QuizEngine = (function() {
    var currentQuestion = 0;
    var score = 0;
    var timeLeft = 60;
    var quizTimeLimit = 60;
    var timer = null;
    var quizQuestions = [];
    var userAnswers = [];
    var quizMode = "";
    var quizSubject = "";
    var quizChapter = "";
    var questionStartTime = 0;
    var answered = false;

    function getQuizQuestions() { return quizQuestions; }
    function getUserAnswers() { return userAnswers; }
    function getCurrentQuestion() { return currentQuestion; }
    function setCurrentQuestion(v) { currentQuestion = v; }
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
        timeLeft = quizTimeLimit;
        userAnswers = [];
        answered = false;
        clearTimer();
    }

    function setTimerMinutes(minutes) {
        quizTimeLimit = minutes * 60;
        timeLeft = quizTimeLimit;
    }

    function clearTimer() {
        if (timer) { clearInterval(timer); timer = null; }
    }

    function startTimer() {
        clearTimer();
        timeLeft = quizTimeLimit;
        updateTimerDisplay();
        var timerEl = document.getElementById("timer");
        if (timerEl) { timerEl.classList.remove("warning"); timerEl.style.color = ""; timerEl.style.background = ""; timerEl.style.animation = ""; }
        timer = setInterval(function() {
            timeLeft--;
            updateTimerDisplay();
            if (timerEl && timeLeft <= 300) timerEl.classList.add("warning");
            if (timeLeft <= 0) { clearTimer(); alert("Time is up! Quiz submitted."); showResult(); }
        }, 1000);
    }

    function stopTimer() { clearTimer(); }

    function updateTimerDisplay() {
        var m = Math.floor(timeLeft / 60);
        var s = timeLeft % 60;
        var mm = m < 10 ? "0" + m : "" + m;
        var ss = s < 10 ? "0" + s : "" + s;
        var timerEl = document.getElementById("timer");
        if (timerEl) timerEl.textContent = "Time: " + mm + ":" + ss;
    }

    function renderPalette() {
        var palette = document.getElementById("questionPalette");
        if (!palette) return;
        var html = "";
        for (var i = 0; i < quizQuestions.length; i++) {
            var cls = "palette-btn";
            if (i === currentQuestion) cls += " current";
            if (userAnswers[i] !== undefined && userAnswers[i] !== null) cls += " answered";
            html += '<button class="' + cls + '" onclick="QuizEngine.jumpToQuestion(' + i + ')">' + (i + 1) + '</button>';
        }
        palette.innerHTML = html;
    }

    function jumpToQuestion(idx) {
        currentQuestion = idx;
        answered = userAnswers[idx] !== undefined && userAnswers[idx] !== null;
        displayQuestion();
    }

    function prevQuestion() {
        if (currentQuestion > 0) {
            currentQuestion--;
            answered = userAnswers[currentQuestion] !== undefined && userAnswers[currentQuestion] !== null;
            displayQuestion();
        }
    }

    function skipQuestion() {
        if (currentQuestion < quizQuestions.length - 1) {
            currentQuestion++;
            answered = userAnswers[currentQuestion] !== undefined && userAnswers[currentQuestion] !== null;
            displayQuestion();
        }
    }

    function displayQuestion() {
        questionStartTime = Date.now();
        var q = quizQuestions[currentQuestion];
        var qNum = document.getElementById("questionNumber");
        if (qNum) qNum.textContent = "Question " + (currentQuestion + 1) + " of " + quizQuestions.length;
        var pBar = document.getElementById("progressBar");
        if (pBar) pBar.style.width = ((currentQuestion + 1) / quizQuestions.length * 100) + "%";
        var qText = document.getElementById("question");
        if (qText) qText.textContent = q.text || q.question;
        var md = document.getElementById("quizMedia");
        if (md) {
            md.innerHTML = "";
            if (q.media) md.innerHTML = '<img src="' + q.media + '" alt="Question image" style="max-width:100%;border-radius:8px;margin-bottom:15px;">';
            if (q.scenario) md.innerHTML += '<div style="background:#f0f4ff;padding:12px;border-radius:8px;margin-bottom:15px;border-left:4px solid var(--primary);"><strong>Scenario:</strong> ' + q.scenario + '</div>';
        }
        var opts = q.options;
        var labels = ["A", "B", "C", "D"];
        var btns = document.querySelectorAll("#quizOptions .option");
        for (var i = 0; i < btns.length; i++) {
            btns[i].innerHTML = '<span class="opt-label">' + labels[i] + '</span><span class="opt-text">' + opts[i] + '</span>';
            btns[i].className = "option";
            if (answered) {
                btns[i].onclick = null;
                var optText = opts[i];
                if (optText === q.answer) btns[i].classList.add("correct");
                else if (userAnswers[currentQuestion] === optText) btns[i].classList.add("incorrect");
            } else {
                btns[i].onclick = (function(txt) { return function() { checkAnswer(txt); }; })(opts[i]);
            }
        }
        var nextBtn = document.getElementById("nextButton");
        if (nextBtn) {
            nextBtn.style.display = answered ? "block" : "none";
            nextBtn.textContent = (currentQuestion === quizQuestions.length - 1) ? "Finish Quiz" : "Next Question";
        }
        var prevBtn = document.getElementById("prevButton");
        if (prevBtn) prevBtn.style.display = (currentQuestion > 0) ? "inline-block" : "none";
        var skipBtn = document.getElementById("skipButton");
        if (skipBtn) skipBtn.style.display = (currentQuestion === quizQuestions.length - 1) ? "none" : "inline-block";
        var scoreEl = document.getElementById("score");
        if (scoreEl) scoreEl.textContent = "Score: " + score;
        renderPalette();
    }

    function checkAnswer(sel) {
        if (answered) return;
        answered = true;
        var q = quizQuestions[currentQuestion];
        var answerIndex = "ABCD".indexOf(String(q.answer).toUpperCase());
        var correctAnswerText = "";
        if (answerIndex >= 0 && q.options && q.options[answerIndex]) {
            correctAnswerText = q.options[answerIndex];
        } else {
            correctAnswerText = q.answer;
        }
        var correct = sel === correctAnswerText;
        if (correct) score++;
        userAnswers[currentQuestion] = sel;
        var scoreEl = document.getElementById("score");
        if (scoreEl) scoreEl.textContent = "Score: " + score;
        var btns = document.querySelectorAll("#quizOptions .option");
        for (var i = 0; i < btns.length; i++) {
            btns[i].onclick = null;
            var optText = btns[i].querySelector(".opt-text").textContent;
            if (optText === correctAnswerText) {
                btns[i].classList.add("correct");
            } else if (optText === sel && !correct) {
                btns[i].classList.add("incorrect");
            }
        }
        var nextBtn = document.getElementById("nextButton");
        if (nextBtn) nextBtn.style.display = "block";
        renderPalette();
    }

    function nextQuestion() {
        if (currentQuestion === quizQuestions.length - 1) { showResult(); return; }
        currentQuestion++;
        answered = userAnswers[currentQuestion] !== undefined && userAnswers[currentQuestion] !== null;
        var nextBtn = document.getElementById("nextButton");
        if (nextBtn) nextBtn.style.display = "none";
        displayQuestion();
    }

    function showResult() {
        clearInterval(timer);
        document.getElementById("quiz").style.display = "none";
        document.getElementById("result").style.display = "block";
        document.getElementById("review").style.display = "none";
        var nextBtn = document.getElementById("nextButton");
        if (nextBtn) nextBtn.style.display = "none";
        history.pushState({ page: "result" }, "", "#result");
        var finalScoreEl = document.getElementById("finalScore");
        if (finalScoreEl) finalScoreEl.textContent = "Score: " + score + " / " + quizQuestions.length;
        var pct = quizQuestions.length > 0 ? Number(((score / quizQuestions.length) * 100).toFixed(2)) : 0;
        var pctEl = document.getElementById("percentage");
        if (pctEl) pctEl.textContent = "Percentage: " + pct + "%";
        var timeSpent = quizTimeLimit - timeLeft;
        var tm = Math.floor(timeSpent / 60);
        var ts = timeSpent % 60;
        var timeStr = (tm < 10 ? "0" + tm : tm) + ":" + (ts < 10 ? "0" + ts : ts);
        var timeEl = document.getElementById("timeTaken");
        if (timeEl) timeEl.textContent = "Time: " + timeStr;
        var fb;
        if (pct >= 90) fb = "Excellent! You've mastered this topic!";
        else if (pct >= 70) fb = "Good job! A little more practice will make you stronger.";
        else if (pct >= 50) fb = "Keep practicing. You're getting there!";
        else fb = "Don't give up! Review the topic and try again.";
        var fbEl = document.getElementById("feedback");
        if (fbEl) fbEl.textContent = fb;
        var user = Auth.getUser();
        var attempt = {
            attemptId: "attempt-" + Date.now(),
            timestamp: new Date().toISOString(),
            studentId: user ? user.id : "unknown",
            subject: quizQuestions[0] ? quizQuestions[0].subject : "General",
            grade: quizQuestions[0] ? quizQuestions[0].grade : 9,
            score: score,
            total: quizQuestions.length,
            percentage: pct,
            timeSpent: timeSpent,
            questions: [],
            topicPerformance: {}
        };
        for (var i = 0; i < quizQuestions.length; i++) {
            var q = quizQuestions[i];
            var selected = userAnswers[i] || null;
            var correctIdx = "ABCD".indexOf(String(q.answer).toUpperCase());
            var correctText = (correctIdx >= 0 && q.options[correctIdx]) ? q.options[correctIdx] : q.answer;
            var isCorrect = selected === correctText;
            attempt.questions.push({
                questionId: q.id,
                selectedAnswer: selected,
                correctAnswer: q.answer,
                correctAnswerText: correctText,
                correct: isCorrect,
                timeUsed: 0
            });
            var topic = q.topic || "General";
            if (!attempt.topicPerformance[topic]) attempt.topicPerformance[topic] = { correct: 0, total: 0 };
            attempt.topicPerformance[topic].total++;
            if (isCorrect) attempt.topicPerformance[topic].correct++;
        }
        for (var t in attempt.topicPerformance) {
            var tp = attempt.topicPerformance[t];
            tp.percentage = tp.total > 0 ? Number(((tp.correct / tp.total) * 100).toFixed(2)) : 0;
        }
        allAttempts.push(attempt);
        var uid = user ? user.id : "unknown";
        for (var i = 0; i < quizQuestions.length; i++) {
            var q = quizQuestions[i];
            var selected = userAnswers[i] || null;
            var correctIdx = "ABCD".indexOf(String(q.answer).toUpperCase());
            var correctText = (correctIdx >= 0 && q.options[correctIdx]) ? q.options[correctIdx] : q.answer;
            var isCorrect = selected === correctText;
            var topic = q.topic || "General";
            var key = uid + "_" + topic;
            if (!conceptStats[key]) conceptStats[key] = { correct: 0, total: 0, topic: topic, subject: q.subject };
            conceptStats[key].total++;
            if (isCorrect) conceptStats[key].correct++;
        }
        saveAll();
        var tsDiv = document.createElement("div");
        tsDiv.className = "topic-summary";
        var topicNames = Object.keys(attempt.topicPerformance);
        if (topicNames.length > 0) {
            var topicHTML = "<h3>Topic Performance</h3>";
            for (var i = 0; i < topicNames.length; i++) {
                var topic = topicNames[i];
                var tst = attempt.topicPerformance[topic];
                topicHTML += "<p>" + topic + ": <strong>" + tst.correct + "/" + tst.total + "</strong> (" + tst.percentage + "%)</p>";
            }
            tsDiv.innerHTML = topicHTML;
        }
        var rc = document.querySelector(".result-card");
        if (rc) {
            var es = rc.querySelector(".topic-summary");
            if (es) es.remove();
            if (fbEl && fbEl.nextSibling) {
                rc.insertBefore(tsDiv, fbEl.nextSibling);
            } else {
                rc.appendChild(tsDiv);
            }
        }
        return attempt;
    }

    function showReview() {
        document.getElementById("result").style.display = "none";
        document.getElementById("review").style.display = "block";
        history.pushState({ page: "review" }, "", "#review");
        var rc = document.getElementById("reviewContent");
        rc.innerHTML = "";
        for (var i = 0; i < quizQuestions.length; i++) {
            var q = quizQuestions[i];
            var selected = userAnswers[i] || null;
            var correctIdx = "ABCD".indexOf(String(q.answer).toUpperCase());
            var correctAnswer = (correctIdx >= 0 && q.options[correctIdx]) ? q.options[correctIdx] : q.answer;
            var isCorrect = selected === correctAnswer;
            var d = document.createElement("div");
            d.className = "review-item";
            var resultText = isCorrect ? "Correct" : "Incorrect";
            d.innerHTML =
                "<h3>Question " + (i + 1) + "</h3>" +
                "<p><strong>ID:</strong> " + (q.id || "?") + "</p>" +
                "<p>" + (q.text || q.question) + "</p>" +
                "<p><strong>Your answer:</strong> " + (selected || "Skipped") + "</p>" +
                "<p><strong>Correct answer:</strong> " + correctAnswer + "</p>" +
                (q.explanation ? "<p><strong>Explanation:</strong> " + q.explanation + "</p>" : "") +
                "<p><strong>" + resultText + "</strong></p>";
            rc.appendChild(d);
        }
    }

    function backToDashboard() {
        document.getElementById("quiz").style.display = "none";
        document.getElementById("result").style.display = "none";
        document.getElementById("review").style.display = "none";
        var mdp = document.getElementById("modeDetailPanel");
        if (mdp) mdp.style.display = "none";
        clearInterval(timer);
        dashboardsHide();
        var role = Auth.getRole();
        if (role === "student") {
            document.getElementById("studentDashboard").style.display = "block";
            showStudentTab("practice");
        } else if (role === "teacher") {
            document.getElementById("teacherDashboard").style.display = "block";
            showTeacherTab("classes");
        } else if (role === "classteacher") {
            document.getElementById("classTeacherDashboard").style.display = "block";
            showCTTab("overview");
        } else if (role === "parent") {
            document.getElementById("parentDashboard").style.display = "block";
            showParentTab("progress");
        } else if (role === "principal") {
            document.getElementById("principalDashboard").style.display = "block";
            showPrincipalTab("school");
        }
        history.pushState({ page: "dashboard" }, "", "#dashboard");
    }

    return {
        getQuizQuestions: getQuizQuestions,
        getUserAnswers: getUserAnswers,
        getCurrentQuestion: getCurrentQuestion,
        setCurrentQuestion: setCurrentQuestion,
        getScore: getScore,
        getTimeLeft: getTimeLeft,
        getQuizMode: getQuizMode,
        getQuizSubject: getQuizSubject,
        getQuizChapter: getQuizChapter,
        getTimer: getTimer,
        startQuiz: startQuiz,
        setTimerMinutes: setTimerMinutes,
        startTimer: startTimer,
        stopTimer: stopTimer,
        clearTimer: clearTimer,
        updateTimerDisplay: updateTimerDisplay,
        displayQuestion: displayQuestion,
        checkAnswer: checkAnswer,
        nextQuestion: nextQuestion,
        prevQuestion: prevQuestion,
        skipQuestion: skipQuestion,
        jumpToQuestion: jumpToQuestion,
        showResult: showResult,
        showReview: showReview,
        backToDashboard: backToDashboard,
        renderPalette: renderPalette
    };
})();
