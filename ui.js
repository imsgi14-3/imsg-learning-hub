var UI = (function() {
    function $(id) { return document.getElementById(id); }

    function showLogin() {
        $("loginPage").style.display = "flex";
        $("studentDashboard").style.display = "none";
        $("teacherDashboard").style.display = "none";
        $("classTeacherDashboard").style.display = "none";
        $("parentDashboard").style.display = "none";
        $("principalDashboard").style.display = "none";
        $("quiz").style.display = "none";
        $("result").style.display = "none";
        $("review").style.display = "none";
        $("logoutBar").style.display = "none";
    }

    function showDashboard() {
        $("loginPage").style.display = "none";
        $("studentDashboard").style.display = "none";
        $("teacherDashboard").style.display = "none";
        $("classTeacherDashboard").style.display = "none";
        $("parentDashboard").style.display = "none";
        $("principalDashboard").style.display = "none";
        $("quiz").style.display = "none";
        $("result").style.display = "none";
        $("review").style.display = "none";
        $("logoutBar").style.display = "flex";

        var role = Auth.getRole();
        var user = Auth.getUser();
        if (role === "student" || role === "parent") {
            $("studentDashboard").style.display = "block";
            $("studentDisplayName").textContent = user ? user.name : "Student";
            $("loggedUser").textContent = (user ? user.name : "Student") + " (" + (user ? user.id : "") + ")";
            renderStudentDashboard();
        } else if (role === "teacher") {
            var isClassTeacher = user && (user.role === "class" || user.role === "both");
            if (isClassTeacher) {
                $("classTeacherDashboard").style.display = "block";
                $("ctDisplayName").textContent = user ? user.name : "Class Teacher";
                $("loggedUser").textContent = (user ? user.name : "Teacher") + " (" + (user ? user.id : "") + ")";
            } else {
                $("teacherDashboard").style.display = "block";
                $("teacherDisplayName").textContent = user ? user.name : "Teacher";
                $("teacherSubjectDisplay").textContent = user ? user.subject : "";
                $("loggedUser").textContent = (user ? user.name : "Teacher") + " (" + (user ? user.id : "") + ")";
            }
        } else if (role === "principal") {
            $("principalDashboard").style.display = "block";
            $("principalDisplayName").textContent = user ? user.name : "Principal";
            $("loggedUser").textContent = (user ? user.name : "Admin") + " (ADMIN-001)";
        }
    }

    function renderStudentDashboard() {
        var user = Auth.getUser();
        if (!user) return;
        var attempts = DataStore.getAttemptsByStudent(user.id);
        renderSubjects();
        renderStudentResults();
        renderStudentAssignments();
    }

    function renderSubjects() {
        var container = $("subjectGrid");
        if (!container) return;
        var subjects = {};
        for (var i = 0; i < DataStore.questions.length; i++) {
            var s = DataStore.questions[i].subject;
            if (!subjects[s]) subjects[s] = 0;
            subjects[s]++;
        }
        var html = "";
        var keys = Object.keys(subjects).sort();
        for (var i = 0; i < keys.length; i++) {
            var icon = "📚";
            if (keys[i].indexOf("Science") !== -1) icon = "🔬";
            if (keys[i].indexOf("Math") !== -1) icon = "📐";
            if (keys[i].indexOf("English") !== -1) icon = "📖";
            if (keys[i].indexOf("Urdu") !== -1) icon = "✍️";
            html += '<div class="quiz-mode-card" onclick="showSubjectChapters(\'' + keys[i].replace(/'/g, "\\'") + '\')">';
            html += '<div class="mode-icon">' + icon + '</div>';
            html += '<div class="mode-title">' + keys[i] + '</div>';
            html += '<div class="mode-desc">' + subjects[keys[i]] + ' questions</div></div>';
        }
        container.innerHTML = html || "<p>No questions available</p>";
    }

    function showSubjectChapters(subject) {
        $("subjectListView").style.display = "none";
        $("chapterListView").style.display = "block";
        $("chapterSubjectTitle").textContent = subject;
        var chapters = {};
        for (var i = 0; i < DataStore.questions.length; i++) {
            if (DataStore.questions[i].subject === subject) {
                var ch = DataStore.questions[i].chapter;
                if (!chapters[ch]) chapters[ch] = 0;
                chapters[ch]++;
            }
        }
        var keys = Object.keys(chapters).sort();
        var html = "";
        for (var i = 0; i < keys.length; i++) {
            html += '<div class="quiz-mode-card" onclick="showChapterQuizOptions(\'' + subject.replace(/'/g, "\\'") + '\', \'' + keys[i].replace(/'/g, "\\'") + '\')">';
            html += '<div class="mode-title">' + keys[i] + '</div>';
            html += '<div class="mode-desc">' + chapters[keys[i]] + ' questions</div></div>';
        }
        $("chapterGrid").innerHTML = html;
    }

    function showSubjectList() {
        $("subjectListView").style.display = "block";
        $("chapterListView").style.display = "none";
    }

    function showChapterQuizOptions(subject, chapter) {
        var container = $("chapterQuizOptions");
        if (!container) return;
        container.style.display = "block";
        var qs = DataStore.getQuestionsByChapter(subject, chapter);
        var topics = {};
        for (var i = 0; i < qs.length; i++) {
            var t = qs[i].topic || "General";
            if (!topics[t]) topics[t] = 0;
            topics[t]++;
        }
        var html = '<h4>Practice Options for ' + chapter + '</h4>';
        html += '<div class="quiz-mode-grid">';
        html += '<div class="quiz-mode-card" onclick="launchQuiz(\'' + subject.replace(/'/g, "\\'") + '\', \'' + chapter.replace(/'/g, "\\'") + '\', \'all\', 20)">';
        html += '<div class="mode-icon">📝</div><div class="mode-title">Quick Practice</div>';
        html += '<div class="mode-desc">20 random questions</div></div>';
        html += '<div class="quiz-mode-card" onclick="launchQuiz(\'' + subject.replace(/'/g, "\\'") + '\', \'' + chapter.replace(/'/g, "\\'") + '\', \'all\', ' + qs.length + ')">';
        html += '<div class="mode-icon">📋</div><div class="mode-title">Full Chapter</div>';
        html += '<div class="mode-desc">' + qs.length + ' questions</div></div>';
        html += '</div>';
        var topicKeys = Object.keys(topics).sort();
        if (topicKeys.length > 0) {
            html += '<h4 style="margin-top:15px;">Practice by Topic</h4><div class="quiz-mode-grid">';
            for (var i = 0; i < topicKeys.length; i++) {
                html += '<div class="quiz-mode-card" onclick="launchQuiz(\'' + subject.replace(/'/g, "\\'") + '\', \'' + chapter.replace(/'/g, "\\'") + '\', \'' + topicKeys[i].replace(/'/g, "\\'") + '\', ' + topics[topicKeys[i]] + ')">';
                html += '<div class="mode-title">' + topicKeys[i] + '</div>';
                html += '<div class="mode-desc">' + topics[topicKeys[i]] + ' questions</div></div>';
            }
            html += '</div>';
        }
        container.innerHTML = html;
    }

    function launchQuiz(subject, chapter, topic, count) {
        var qs = [];
        if (topic === "all") {
            qs = DataStore.getQuestionsByChapter(subject, chapter);
        } else {
            qs = DataStore.getQuestionsByTopic(subject, chapter, topic);
        }
        if (qs.length === 0) { alert("No questions available"); return; }
        qs = DataStore.shuffleArray(qs);
        if (count && qs.length > count) qs = qs.slice(0, count);
        QuizEngine.startQuiz(qs, "practice", subject, chapter);
        $("loginPage").style.display = "none";
        $("studentDashboard").style.display = "none";
        $("quiz").style.display = "block";
        displayQuestion();
        startTimer();
    }

    function startTimer() { QuizEngine.startTimer(); }
    function stopTimer() { QuizEngine.stopTimer(); }

    function displayQuestion() {
        var qs = QuizEngine.getQuizQuestions();
        var idx = QuizEngine.getCurrentQuestion();
        var q = qs[idx];
        var total = qs.length;
        $("questionNumber").textContent = "Question " + (idx + 1) + " of " + total;
        $("question").textContent = q.question;
        var opts = $("quizOptions").querySelectorAll(".option");
        var labels = ["A", "B", "C", "D"];
        for (var i = 0; i < opts.length; i++) {
            opts[i].textContent = labels[i] + ". " + (q.options[i] || "");
            opts[i].className = "option";
            opts[i].onclick = (function(index) {
                return function() { selectAnswer(index); };
            })(i);
        }
        var answered = QuizEngine.getUserAnswers();
        if (answered[idx] !== undefined) {
            opts[answered[idx]].classList.add("selected");
        }
        $("prevButton").style.display = idx > 0 ? "inline-block" : "none";
        $("skipButton").style.display = "inline-block";
        $("nextButton").style.display = idx < total - 1 ? "inline-block" : "none";
        if (idx === total - 1) {
            $("nextButton").textContent = "Finish Quiz";
            $("nextButton").style.display = "inline-block";
            $("skipButton").style.display = "none";
        } else {
            $("nextButton").textContent = "Next →";
        }
        renderPalette();
    }

    function renderPalette() {
        var container = $("questionPalette");
        if (!container) return;
        var qs = QuizEngine.getQuizQuestions();
        var answered = QuizEngine.getUserAnswers();
        var html = "";
        for (var i = 0; i < qs.length; i++) {
            var cls = "palette-btn";
            if (i === QuizEngine.getCurrentQuestion()) cls += " current";
            if (answered[i] !== undefined) cls += " answered";
            html += '<button class="' + cls + '" onclick="jumpToQuestion(' + i + ')">' + (i + 1) + '</button>';
        }
        container.innerHTML = html;
    }

    function selectAnswer(idx) {
        var opts = $("quizOptions").querySelectorAll(".option");
        for (var i = 0; i < opts.length; i++) opts[i].classList.remove("selected");
        opts[idx].classList.add("selected");
        QuizEngine.recordAnswer(QuizEngine.getCurrentQuestion(), idx);
        renderPalette();
    }

    function nextQuestion() {
        var qs = QuizEngine.getQuizQuestions();
        var idx = QuizEngine.getCurrentQuestion();
        if (idx === qs.length - 1) {
            var attempt = QuizEngine.finish();
            showResult(attempt);
            return;
        }
        QuizEngine.setCurrentQuestion(idx + 1);
        displayQuestion();
    }

    function prevQuestion() {
        var idx = QuizEngine.getCurrentQuestion();
        if (idx > 0) { QuizEngine.setCurrentQuestion(idx - 1); displayQuestion(); }
    }

    function skipQuestion() {
        var qs = QuizEngine.getQuizQuestions();
        var idx = QuizEngine.getCurrentQuestion();
        if (idx < qs.length - 1) { QuizEngine.setCurrentQuestion(idx + 1); displayQuestion(); }
    }

    function jumpToQuestion(idx) {
        QuizEngine.setCurrentQuestion(idx);
        displayQuestion();
    }

    function showResult(attempt) {
        QuizEngine.stopTimer();
        $("quiz").style.display = "none";
        $("result").style.display = "block";
        var score = attempt.score;
        var total = attempt.totalQuestions;
        var percentage = attempt.percentage;
        var timeUsed = attempt.timeUsed;
        $("finalScore").textContent = "Score: " + score + " / " + total;
        $("percentage").textContent = "Percentage: " + percentage + "%";
        $("timeTaken").textContent = "Time: " + timeUsed + " seconds";
        var feedback = "";
        if (percentage === 100) feedback = "Perfect Score! Outstanding!";
        else if (percentage >= 80) feedback = "Great Job! Keep it up!";
        else if (percentage >= 60) feedback = "Good effort! Practice more.";
        else if (percentage >= 40) feedback = "Needs improvement. Try again!";
        else feedback = "Keep practicing. You'll improve!";
        $("feedback").textContent = feedback;
    }

    function showReview() {
        var qs = QuizEngine.getQuizQuestions();
        var answers = QuizEngine.getUserAnswers();
        if (!qs || qs.length === 0) { alert("No quiz data to review"); return; }
        $("result").style.display = "none";
        $("review").style.display = "block";
        var html = "";
        for (var i = 0; i < qs.length; i++) {
            var q = qs[i];
            var userAns = answers[i];
            var isCorrect = userAns !== undefined && q.options[userAns] !== undefined &&
                (q.options[userAns] === q.options[q.answer.charCodeAt(0) - 65] || userAns === q.answer.charCodeAt(0) - 65);
            var correctIdx = q.answer.charCodeAt(0) - 65;
            html += '<div class="review-item ' + (isCorrect ? "correct" : "incorrect") + '">';
            html += '<div class="review-q"><strong>Q' + (i + 1) + ':</strong> ' + q.question + '</div>';
            for (var j = 0; j < q.options.length; j++) {
                var optCls = "";
                if (j === correctIdx) optCls = "correct-answer";
                if (j === userAns && !isCorrect) optCls = "wrong-answer";
                html += '<div class="review-option ' + optCls + '">' + String.fromCharCode(65 + j) + ". " + q.options[j] + '</div>';
            }
            if (q.explanation) html += '<div class="review-explanation">💡 ' + q.explanation + '</div>';
            html += '</div>';
        }
        $("reviewContent").innerHTML = html;
    }

    function backToDashboard() {
        QuizEngine.stopTimer();
        $("quiz").style.display = "none";
        $("result").style.display = "none";
        $("review").style.display = "none";
        showDashboard();
    }

    function renderBar(containerId, data, maxVal) {
        var container = $(containerId);
        if (!container) return;
        var html = '<div class="chart-bars">';
        var max = maxVal || 1;
        for (var i = 0; i < data.length; i++) {
            var pct = max > 0 ? (data[i].value / max * 100) : 0;
            html += '<div class="chart-bar-row">';
            html += '<div class="chart-bar-label">' + data[i].label + '</div>';
            html += '<div class="chart-bar-track"><div class="chart-bar-fill" style="width:' + Math.min(pct, 100) + '%"></div></div>';
            html += '<div class="chart-bar-value">' + data[i].value + '</div>';
            html += '</div>';
        }
        html += '</div>';
        container.innerHTML = html;
    }

    function renderDonut(containerId, data) {
        var container = $(containerId);
        if (!container) return;
        var total = 0;
        for (var i = 0; i < data.length; i++) total += data[i].value;
        if (total === 0) { container.innerHTML = "<p>No data</p>"; return; }
        var colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
        var html = '<div class="donut-chart"><div class="donut-center">' + total + '<span>Total</span></div><div class="donut-legend">';
        for (var i = 0; i < data.length; i++) {
            var pct = Math.round(data[i].value / total * 100);
            html += '<div class="legend-item"><span class="legend-color" style="background:' + colors[i % colors.length] + '"></span>' + data[i].label + ': ' + data[i].value + ' (' + pct + '%)</div>';
        }
        html += '</div></div>';
        container.innerHTML = html;
    }

    function renderStudentResults() {
        var user = Auth.getUser();
        var container = $("studentResultsList");
        if (!container || !user) return;
        var attempts = DataStore.getAttemptsByStudent(user.id);
        if (attempts.length === 0) { container.innerHTML = "<p>No quiz attempts yet. Start practicing!</p>"; return; }
        var html = '<div class="results-list">';
        for (var i = attempts.length - 1; i >= 0 && i >= attempts.length - 20; i--) {
            var a = attempts[i];
            var d = new Date(a.timestamp);
            html += '<div class="result-item">';
            html += '<div class="result-info"><div class="result-date">' + d.toLocaleDateString() + ' ' + d.toLocaleTimeString() + '</div>';
            html += '<div class="result-subject">' + (a.subject || "General") + ' - ' + (a.chapter || "") + '</div></div>';
            html += '<div class="result-score ' + (a.percentage >= 50 ? "pass" : "fail") + '">' + a.percentage + '%</div>';
            html += '</div>';
        }
        html += '</div>';
        container.innerHTML = html;
    }

    function renderStudentAssignments() {
        var container = $("studentAssignmentsList");
        if (!container) return;
        var user = Auth.getUser();
        if (!user) return;
        var html = "";
        var found = false;
        for (var i = 0; i < DataStore.assignments.length; i++) {
            var a = DataStore.assignments[i];
            if (a.classId === user.classId) {
                found = true;
                html += '<div class="assignment-item">';
                html += '<div class="assignment-info"><h4>' + (a.title || "Untitled") + '</h4>';
                html += '<p>' + (a.description || "") + '</p>';
                html += '<span class="assignment-meta">Due: ' + (a.dueDate || "None") + ' | ' + (a.questions ? a.questions.length : 0) + ' questions</span></div>';
                html += '<button class="action-btn" onclick="startAssignmentQuiz(' + i + ')">Start</button></div>';
            }
        }
        container.innerHTML = found ? html : "<p>No assignments for your class yet.</p>";
    }

    function startAssignmentQuiz(assignmentIdx) {
        var a = DataStore.assignments[assignmentIdx];
        if (!a || !a.questions || a.questions.length === 0) { alert("No questions in this assignment"); return; }
        var qs = DataStore.shuffleArray(a.questions);
        QuizEngine.startQuiz(qs, "assignment", a.classId || "", a.title || "");
        $("studentDashboard").style.display = "none";
        $("quiz").style.display = "block";
        displayQuestion();
        startTimer();
    }

    function renderTeacherDashboard() {
        var user = Auth.getUser();
        var teacherClasses = [];
        if (user && user.classIds) {
            for (var i = 0; i < DataStore.classes.length; i++) {
                for (var j = 0; j < user.classIds.length; j++) {
                    if (DataStore.classes[i].id === user.classIds[j]) teacherClasses.push(DataStore.classes[i]);
                }
            }
        }
        var list = $("classesList");
        if (list) {
            if (teacherClasses.length === 0) {
                list.innerHTML = "<p>No classes assigned yet.</p>";
            } else {
                var html = '<div class="classes-grid">';
                for (var i = 0; i < teacherClasses.length; i++) {
                    var cl = teacherClasses[i];
                    var count = DataStore.getStudentCountByClass(cl.id);
                    html += '<div class="class-card"><h3>' + cl.name + '</h3>';
                    html += '<p>Students: ' + count + '</p></div>';
                }
                html += '</div>';
                list.innerHTML = html;
            }
        }
        populateAnalyticsClassSelect();
        renderQuestions();
        renderAssignments();
    }

    function populateAnalyticsClassSelect() {
        var sel = $("analyticsClassSelect");
        if (!sel) return;
        var user = Auth.getUser();
        sel.innerHTML = '<option value="">Select a class</option>';
        var classList = DataStore.classes;
        if (user && user.classIds) {
            classList = [];
            for (var i = 0; i < DataStore.classes.length; i++) {
                for (var j = 0; j < user.classIds.length; j++) {
                    if (DataStore.classes[i].id === user.classIds[j]) classList.push(DataStore.classes[i]);
                }
            }
        }
        for (var i = 0; i < classList.length; i++) {
            sel.innerHTML += '<option value="' + classList[i].id + '">' + classList[i].name + '</option>';
        }
    }

    function loadClassAnalytics() {
        var classId = $("analyticsClassSelect") ? $("analyticsClassSelect").value : "";
        var container = $("classAnalyticsContent");
        if (!container) return;
        if (!classId) { container.innerHTML = "<p>Select a class to view analytics</p>"; return; }
        var attempts = DataStore.getAttemptsByClass(classId);
        if (attempts.length === 0) { container.innerHTML = "<p>No quiz data for this class yet.</p>"; return; }
        var avg = 0;
        var sum = 0;
        for (var i = 0; i < attempts.length; i++) sum += attempts[i].percentage;
        avg = Math.round(sum / attempts.length);
        var html = '<div class="stat-cards">';
        html += '<div class="stat-card blue"><div class="stat-number">' + attempts.length + '</div><div class="stat-label">Total Attempts</div></div>';
        html += '<div class="stat-card green"><div class="stat-number">' + avg + '%</div><div class="stat-label">Average Score</div></div>';
        html += '</div>';
        var chartData = [];
        for (var i = attempts.length - 1; i >= 0 && i >= attempts.length - 10; i--) {
            chartData.push({ label: "Attempt " + (i + 1), value: attempts[i].percentage });
        }
        html += '<h4 style="margin-top:15px;">Recent Attempts</h4>';
        container.innerHTML = html;
        renderBar(container.id, chartData, 100);
    }

    function renderQuestions() {
        var container = $("questionsTable");
        if (!container) return;
        var html = '<table class="data-table"><thead><tr><th>ID</th><th>Subject</th><th>Chapter</th><th>Question</th><th>Answer</th><th>Actions</th></tr></thead><tbody>';
        var show = DataStore.questions.slice(0, 50);
        for (var i = 0; i < show.length; i++) {
            var q = show[i];
            html += '<tr>';
            html += '<td>' + (q.id || "-") + '</td>';
            html += '<td>' + (q.subject || "-") + '</td>';
            html += '<td>' + (q.chapter || "-") + '</td>';
            html += '<td>' + (q.question || "").substring(0, 50) + '</td>';
            html += '<td>' + (q.answer || "-") + '</td>';
            html += '<td><button class="btn-sm" onclick="editQuestion(\'' + (q.id || "").replace(/'/g, "\\'") + '\')">Edit</button>';
            html += '<button class="btn-sm btn-danger" onclick="deleteQuestion(\'' + (q.id || "").replace(/'/g, "\\'") + '\')">Del</button></td>';
            html += '</tr>';
        }
        html += '</tbody></table>';
        if (DataStore.questions.length > 50) html += '<p>Showing first 50 of ' + DataStore.questions.length + '</p>';
        container.innerHTML = html;
    }

    function filterQuestions() {
        var search = $("qbSearch") ? $("qbSearch").value.toLowerCase() : "";
        var subject = $("qbFilterSubject") ? $("qbFilterSubject").value : "";
        var grade = $("qbFilterGrade") ? $("qbFilterGrade").value : "";
        var filtered = DataStore.questions;
        if (search) filtered = filtered.filter(function(q) { return (q.question || "").toLowerCase().indexOf(search) !== -1; });
        if (subject) filtered = filtered.filter(function(q) { return q.subject === subject; });
        if (grade) filtered = filtered.filter(function(q) { return String(q.grade) === grade; });
        var container = $("questionsTable");
        if (!container) return;
        var html = '<table class="data-table"><thead><tr><th>ID</th><th>Subject</th><th>Chapter</th><th>Question</th><th>Answer</th><th>Actions</th></tr></thead><tbody>';
        var show = filtered.slice(0, 50);
        for (var i = 0; i < show.length; i++) {
            var q = show[i];
            html += '<tr>';
            html += '<td>' + (q.id || "-") + '</td>';
            html += '<td>' + (q.subject || "-") + '</td>';
            html += '<td>' + (q.chapter || "-") + '</td>';
            html += '<td>' + (q.question || "").substring(0, 50) + '</td>';
            html += '<td>' + (q.answer || "-") + '</td>';
            html += '<td><button class="btn-sm" onclick="editQuestion(\'' + (q.id || "").replace(/'/g, "\\'") + '\')">Edit</button>';
            html += '<button class="btn-sm btn-danger" onclick="deleteQuestion(\'' + (q.id || "").replace(/'/g, "\\'") + '\')">Del</button></td>';
            html += '</tr>';
        }
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    function showAddQuestionModal() {
        $("questionModal").style.display = "block";
        $("modalOverlay").style.display = "block";
        $("qmModalTitle").textContent = "Add Question";
        if ($("questionForm")) $("questionForm").reset();
        if ($("qmQuestionId")) $("qmQuestionId").value = "";
    }

    function saveQuestion(e) {
        if (e) e.preventDefault();
        var q = {
            id: $("qmQuestionId").value || ("Q-" + Date.now()),
            subject: $("qmSubject").value,
            grade: parseInt($("qmGrade").value),
            chapter: $("qmChapter").value.trim(),
            topic: $("qmTopic").value.trim(),
            difficulty: $("qmDifficulty").value,
            type: "mcq",
            question: $("qmText").value.trim(),
            explanation: $("qmExplanation").value.trim(),
            options: [$("qmOptionA").value.trim(), $("qmOptionB").value.trim(), $("qmOptionC").value.trim(), $("qmOptionD").value.trim()],
            answer: $("qmAnswer").value,
            media: $("qmMedia").value.trim() || null
        };
        if (!q.question) { alert("Question text required"); return; }
        if ($("qmQuestionId").value) {
            for (var i = 0; i < DataStore.questions.length; i++) {
                if (DataStore.questions[i].id === q.id) { DataStore.questions[i] = q; break; }
            }
        } else {
            DataStore.questions.push(q);
        }
        DataStore.save();
        closeModal();
        renderQuestions();
    }

    function editQuestion(id) {
        for (var i = 0; i < DataStore.questions.length; i++) {
            if (DataStore.questions[i].id === id) {
                var q = DataStore.questions[i];
                showAddQuestionModal();
                $("qmModalTitle").textContent = "Edit Question";
                $("qmQuestionId").value = q.id;
                $("qmSubject").value = q.subject || "Computer Science";
                $("qmGrade").value = q.grade || 9;
                $("qmChapter").value = q.chapter || "";
                $("qmTopic").value = q.topic || "";
                $("qmDifficulty").value = q.difficulty || "easy";
                $("qmText").value = q.question || "";
                $("qmExplanation").value = q.explanation || "";
                if (q.options && q.options.length >= 4) {
                    $("qmOptionA").value = q.options[0];
                    $("qmOptionB").value = q.options[1];
                    $("qmOptionC").value = q.options[2];
                    $("qmOptionD").value = q.options[3];
                }
                $("qmAnswer").value = q.answer || "A";
                $("qmMedia").value = q.media || "";
                break;
            }
        }
    }

    function deleteQuestion(id) {
        if (!confirm("Delete this question?")) return;
        DataStore.questions = DataStore.questions.filter(function(q) { return q.id !== id; });
        DataStore.save();
        renderQuestions();
    }

    function renderAssignments() {
        var container = $("assignmentsList");
        if (!container) return;
        if (DataStore.assignments.length === 0) { container.innerHTML = "<p>No assignments yet.</p>"; return; }
        var html = "";
        for (var i = 0; i < DataStore.assignments.length; i++) {
            var a = DataStore.assignments[i];
            html += '<div class="assignment-item">';
            html += '<div class="assignment-info"><h4>' + (a.title || "Untitled") + '</h4>';
            html += '<p>' + (a.description || "") + '</p>';
            html += '<span class="assignment-meta">' + (a.questions ? a.questions.length : 0) + ' questions | Due: ' + (a.dueDate || "None") + '</span></div>';
            html += '<div class="assignment-actions">';
            html += '<button class="btn-sm" onclick="editAssignment(' + i + ')">Edit</button>';
            html += '<button class="btn-sm btn-danger" onclick="deleteAssignment(' + i + ')">Del</button>';
            html += '</div></div>';
        }
        container.innerHTML = html;
    }

    function showCreateAssignmentModal() {
        $("assignmentModal").style.display = "block";
        $("modalOverlay").style.display = "block";
    }

    function saveAssignment() {
        var title = $("aTitle") ? $("aTitle").value.trim() : "";
        var desc = $("aDesc") ? $("aDesc").value.trim() : "";
        var due = $("aDue") ? $("aDue").value : "";
        if (!title) { alert("Title required"); return; }
        var a = { id: "A-" + Date.now(), title: title, description: desc, dueDate: due, questions: [], createdAt: Date.now() };
        DataStore.assignments.push(a);
        DataStore.save();
        closeModal();
        renderAssignments();
    }

    function editAssignment(idx) { alert("Edit assignment " + idx); }
    function deleteAssignment(idx) {
        if (!confirm("Delete this assignment?")) return;
        DataStore.assignments.splice(idx, 1);
        DataStore.save();
        renderAssignments();
    }

    function renderPrincipalDashboard() {
        var totalStudents = DataStore.studentAccounts.length;
        var totalTeachers = DataStore.teachers.length;
        var totalClasses = DataStore.classes.length;
        var totalAttempts = DataStore.allAttempts.length;
        var avg = 0;
        if (totalAttempts > 0) { var sum = 0; for (var i = 0; i < DataStore.allAttempts.length; i++) sum += DataStore.allAttempts[i].percentage; avg = Math.round(sum / totalAttempts); }
        var container = $("principalSchoolContent");
        if (!container) return;
        var html = '<div class="stat-cards">';
        html += '<div class="stat-card blue"><div class="stat-number">' + totalStudents + '</div><div class="stat-label">Students</div></div>';
        html += '<div class="stat-card green"><div class="stat-number">' + totalTeachers + '</div><div class="stat-label">Teachers</div></div>';
        html += '<div class="stat-card purple"><div class="stat-number">' + totalClasses + '</div><div class="stat-label">Classes</div></div>';
        html += '<div class="stat-card orange"><div class="stat-number">' + totalAttempts + '</div><div class="stat-label">Attempts</div></div>';
        html += '<div class="stat-card green"><div class="stat-number">' + avg + '%</div><div class="stat-label">Avg Score</div></div>';
        html += '</div>';
        container.innerHTML = html;
    }

    function showPrincipalTab(tab) {
        var tabs = ["school", "classes", "teachers", "students", "analytics"];
        for (var i = 0; i < tabs.length; i++) {
            var el = $("principal" + tabs[i].charAt(0).toUpperCase() + tabs[i].slice(1) + "Tab");
            if (el) el.style.display = tabs[i] === tab ? "block" : "none";
        }
        var btns = document.querySelectorAll("#principalDashboard .tab-btn");
        for (var i = 0; i < btns.length; i++) btns[i].classList.remove("active");
        if (btns[tabs.indexOf(tab)]) btns[tabs.indexOf(tab)].classList.add("active");
        if (tab === "school") renderPrincipalDashboard();
        else if (tab === "classes") renderPrincipalClasses();
        else if (tab === "teachers") renderPrincipalTeachers();
        else if (tab === "students") renderPrincipalStudents();
        else if (tab === "analytics") renderPrincipalAnalytics();
    }

    function renderPrincipalClasses() {
        var container = $("principalClassesContent");
        if (!container) return;
        var html = '<div class="classes-grid">';
        for (var i = 0; i < DataStore.classes.length; i++) {
            var cl = DataStore.classes[i];
            var count = DataStore.getStudentCountByClass(cl.id);
            html += '<div class="class-card"><h3>' + cl.name + '</h3>';
            html += '<p>Grade: ' + cl.grade + ' | Section: ' + cl.section + '</p>';
            html += '<p>Students: ' + count + '</p>';
            html += '<div class="class-actions">';
            html += '<button class="btn-sm" onclick="editClass(' + i + ')">Edit</button>';
            html += '<button class="btn-sm btn-danger" onclick="deleteClass(' + i + ')">Del</button>';
            html += '</div></div>';
        }
        html += '</div>';
        html += '<button class="action-btn" onclick="showAddClassModal()">+ Add Class</button>';
        container.innerHTML = html;
    }

    function renderPrincipalTeachers() {
        var container = $("principalTeachersContent");
        if (!container) return;
        if (DataStore.teachers.length === 0) { container.innerHTML = "<p>No teachers.</p>"; return; }
        var html = '<table class="data-table"><thead><tr><th>ID</th><th>Name</th><th>Subject</th><th>Role</th><th>Actions</th></tr></thead><tbody>';
        for (var i = 0; i < DataStore.teachers.length; i++) {
            var t = DataStore.teachers[i];
            html += '<tr><td>' + t.id + '</td><td>' + (t.name || "-") + '</td><td>' + (t.subject || "-") + '</td><td>' + (t.role || "subject") + '</td>';
            html += '<td><button class="btn-sm" onclick="editTeacher(\'' + t.id + '\')">Edit</button>';
            html += '<button class="btn-sm btn-danger" onclick="deleteTeacher(\'' + t.id + '\')">Del</button></td></tr>';
        }
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    function renderPrincipalStudents() {
        var container = $("principalStudentsContent");
        if (!container) return;
        if (DataStore.studentAccounts.length === 0) { container.innerHTML = "<p>No students.</p>"; return; }
        var html = '<table class="data-table"><thead><tr><th>ID</th><th>Name</th><th>Class</th><th>Actions</th></tr></thead><tbody>';
        for (var i = 0; i < DataStore.studentAccounts.length; i++) {
            var s = DataStore.studentAccounts[i];
            var className = "";
            for (var j = 0; j < DataStore.classes.length; j++) {
                if (DataStore.classes[j].id === s.classId) { className = DataStore.classes[j].name; break; }
            }
            html += '<tr><td>' + s.id + '</td><td>' + (s.name || "-") + '</td><td>' + className + '</td>';
            html += '<td><button class="btn-sm" onclick="editStudent(\'' + s.id + '\')">Edit</button>';
            html += '<button class="btn-sm btn-danger" onclick="deleteStudent(\'' + s.id + '\')">Del</button></td></tr>';
        }
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    function renderPrincipalAnalytics() {
        var container = $("principalAnalyticsContent");
        if (!container) return;
        var attempts = DataStore.allAttempts;
        var avg = 0;
        if (attempts.length > 0) { var sum = 0; for (var i = 0; i < attempts.length; i++) sum += attempts[i].percentage; avg = Math.round(sum / attempts.length); }
        var html = '<div class="stat-cards">';
        html += '<div class="stat-card blue"><div class="stat-number">' + attempts.length + '</div><div class="stat-label">Total Attempts</div></div>';
        html += '<div class="stat-card green"><div class="stat-number">' + avg + '%</div><div class="stat-label">Average Score</div></div>';
        html += '<div class="stat-card purple"><div class="stat-number">' + DataStore.studentAccounts.length + '</div><div class="stat-label">Active Students</div></div>';
        html += '</div>';
        html += '<h4 style="margin-top:15px;">Score Distribution</h4><div id="principalScoreChart"></div>';
        html += '<h4 style="margin-top:15px;">Subject Performance</h4><div id="principalSubjectChart"></div>';
        container.innerHTML = html;
        var scoreData = [
            { label: "Excellent (80-100)", value: 0 },
            { label: "Good (60-79)", value: 0 },
            { label: "Average (40-59)", value: 0 },
            { label: "Below Avg (<40)", value: 0 }
        ];
        for (var i = 0; i < attempts.length; i++) {
            var p = attempts[i].percentage;
            if (p >= 80) scoreData[0].value++;
            else if (p >= 60) scoreData[1].value++;
            else if (p >= 40) scoreData[2].value++;
            else scoreData[3].value++;
        }
        renderDonut("principalScoreChart", scoreData);
        var subjectData = {};
        for (var i = 0; i < attempts.length; i++) {
            var sub = attempts[i].subject || "Unknown";
            if (!subjectData[sub]) subjectData[sub] = { total: 0, count: 0 };
            subjectData[sub].total += attempts[i].percentage;
            subjectData[sub].count++;
        }
        var subjectArr = [];
        var subKeys = Object.keys(subjectData);
        for (var i = 0; i < subKeys.length; i++) {
            subjectArr.push({ label: subKeys[i], value: Math.round(subjectData[subKeys[i]].total / subjectData[subKeys[i]].count) });
        }
        renderBar("principalSubjectChart", subjectArr, 100);
    }

    function showTeacherTab(tab) {
        var tabs = ["classes", "questionbank", "assignments", "analytics"];
        for (var i = 0; i < tabs.length; i++) {
            var el = $("teacher" + tabs[i].charAt(0).toUpperCase() + tabs[i].slice(1) + "Tab");
            if (el) el.style.display = tabs[i] === tab ? "block" : "none";
        }
        var btns = document.querySelectorAll("#teacherDashboard .tab-btn");
        for (var i = 0; i < btns.length; i++) btns[i].classList.remove("active");
        if (btns[tabs.indexOf(tab)]) btns[tabs.indexOf(tab)].classList.add("active");
    }

    function showStudentTab(tab) {
        var tabs = ["practice", "assignments", "results", "progress"];
        for (var i = 0; i < tabs.length; i++) {
            var el = $("student" + tabs[i].charAt(0).toUpperCase() + tabs[i].slice(1) + "Tab");
            if (el) el.style.display = tabs[i] === tab ? "block" : "none";
        }
        var btns = document.querySelectorAll("#studentDashboard .tab-btn");
        for (var i = 0; i < btns.length; i++) btns[i].classList.remove("active");
        if (btns[tabs.indexOf(tab)]) btns[tabs.indexOf(tab)].classList.add("active");
        if (tab === "practice") {
            $("subjectListView").style.display = "block";
            $("chapterListView").style.display = "none";
        }
    }

    function showCTTab(tab) {
        var tabs = ["overview", "students", "cross-subject"];
        for (var i = 0; i < tabs.length; i++) {
            var el = $("ct" + tabs[i].charAt(0).toUpperCase() + tabs[i].slice(1).replace("-", "") + "Tab");
            if (el) el.style.display = tabs[i] === tab ? "block" : "none";
        }
        var btns = document.querySelectorAll("#classTeacherDashboard .tab-btn");
        for (var i = 0; i < btns.length; i++) btns[i].classList.remove("active");
        if (btns[tabs.indexOf(tab)]) btns[tabs.indexOf(tab)].classList.add("active");
    }

    function showParentTab(tab) {
        var tabs = ["progress", "assignments", "results", "attendance"];
        for (var i = 0; i < tabs.length; i++) {
            var el = $("parent" + tabs[i].charAt(0).toUpperCase() + tabs[i].slice(1) + "Tab");
            if (el) el.style.display = tabs[i] === tab ? "block" : "none";
        }
        var btns = document.querySelectorAll("#parentDashboard .tab-btn");
        for (var i = 0; i < btns.length; i++) btns[i].classList.remove("active");
        if (btns[tabs.indexOf(tab)]) btns[tabs.indexOf(tab)].classList.add("active");
    }

    function showAddTeacherModal() {
        $("teacherModal").style.display = "block";
        $("modalOverlay").style.display = "block";
    }

    function saveTeacher() {
        var name = $("tName") ? $("tName").value.trim() : "";
        if (!name) { alert("Name required"); return; }
        var id = DataStore.generateTeacherId();
        var teacher = { id: id, name: name, subject: $("tSubject") ? $("tSubject").value : "", role: "subject", password: $("tPassword") ? $("tPassword").value.trim() || DataStore.generateRandomPassword() : DataStore.generateRandomPassword(), createdAt: Date.now() };
        DataStore.addTeacher(teacher);
        closeModal();
        renderPrincipalTeachers();
    }

    function editTeacher(id) { alert("Edit teacher " + id); }
    function deleteTeacher(id) {
        if (!confirm("Delete teacher " + id + "?")) return;
        DataStore.removeTeacher(id);
        renderPrincipalTeachers();
    }

    function showCreateStudentModal() {
        $("studentModal").style.display = "block";
        $("modalOverlay").style.display = "block";
    }

    function saveStudent() {
        var name = $("sName") ? $("sName").value.trim() : "";
        var classId = $("sClass") ? $("sClass").value : "";
        var roll = $("sRoll") ? parseInt($("sRoll").value) : 0;
        if (!name || !classId || !roll) { alert("All fields required"); return; }
        var classObj = DataStore.findClassById(classId);
        if (!classObj) { alert("Class not found"); return; }
        var id = DataStore.generateStudentId(classObj, roll);
        if (DataStore.findStudentById(id)) { alert("Student " + id + " already exists"); return; }
        var password = $("sPassword") ? $("sPassword").value.trim() || DataStore.generateRandomPassword() : DataStore.generateRandomPassword();
        var student = { id: id, name: name, classId: classId, rollNo: roll, password: password, createdAt: Date.now() };
        DataStore.addStudent(student);
        closeModal();
        renderPrincipalStudents();
    }

    function editStudent(id) { alert("Edit student " + id); }
    function deleteStudent(id) {
        if (!confirm("Delete student " + id + "?")) return;
        DataStore.removeStudent(id);
        renderPrincipalStudents();
    }

    function showAddClassModal() {
        $("classModal").style.display = "block";
        $("modalOverlay").style.display = "block";
    }

    function saveClass() {
        var grade = $("cGrade") ? parseInt($("cGrade").value) : 0;
        var section = $("cSection") ? $("cSection").value.trim() : "";
        if (!grade || !section) { alert("Grade and section required"); return; }
        var id = "CLASS-" + grade + section.toUpperCase();
        for (var i = 0; i < DataStore.classes.length; i++) {
            if (DataStore.classes[i].id === id) { alert("Class exists"); return; }
        }
        DataStore.classes.push({ id: id, name: grade + section.toUpperCase(), grade: grade, section: section.toUpperCase() });
        DataStore.save();
        closeModal();
        renderPrincipalClasses();
    }

    function editClass(idx) { alert("Edit class " + idx); }
    function deleteClass(idx) {
        if (!confirm("Delete this class?")) return;
        DataStore.classes.splice(idx, 1);
        DataStore.save();
        renderPrincipalClasses();
    }

    function showExcelImportModal() { alert("Excel import coming soon"); }
    function showStudentExcelModal() { alert("Student Excel import coming soon"); }
    function exportStudentCredentials() { alert("Export coming soon"); }
    function closeModal() {
        var modals = document.querySelectorAll(".modal");
        for (var i = 0; i < modals.length; i++) modals[i].style.display = "none";
        var overlay = $("modalOverlay");
        if (overlay) overlay.style.display = "none";
    }

    return {
        $: $,
        showLogin: showLogin,
        showDashboard: showDashboard,
        renderDashboard: renderDashboard,
        displayQuestion: displayQuestion,
        selectAnswer: selectAnswer,
        nextQuestion: nextQuestion,
        prevQuestion: prevQuestion,
        skipQuestion: skipQuestion,
        jumpToQuestion: jumpToQuestion,
        showResult: showResult,
        showReview: showReview,
        backToDashboard: backToDashboard,
        renderBar: renderBar,
        renderDonut: renderDonut,
        showStudentTab: showStudentTab,
        showTeacherTab: showTeacherTab,
        showCTTab: showCTTab,
        showParentTab: showParentTab,
        showPrincipalTab: showPrincipalTab,
        showSubjectChapters: showSubjectChapters,
        showSubjectList: showSubjectList,
        showChapterQuizOptions: showChapterQuizOptions,
        launchQuiz: launchQuiz,
        startAssignmentQuiz: startAssignmentQuiz,
        renderQuestions: renderQuestions,
        filterQuestions: filterQuestions,
        showAddQuestionModal: showAddQuestionModal,
        saveQuestion: saveQuestion,
        editQuestion: editQuestion,
        deleteQuestion: deleteQuestion,
        renderAssignments: renderAssignments,
        showCreateAssignmentModal: showCreateAssignmentModal,
        saveAssignment: saveAssignment,
        editAssignment: editAssignment,
        deleteAssignment: deleteAssignment,
        loadClassAnalytics: loadClassAnalytics,
        showAddTeacherModal: showAddTeacherModal,
        saveTeacher: saveTeacher,
        editTeacher: editTeacher,
        deleteTeacher: deleteTeacher,
        showCreateStudentModal: showCreateStudentModal,
        saveStudent: saveStudent,
        editStudent: editStudent,
        deleteStudent: deleteStudent,
        showAddClassModal: showAddClassModal,
        saveClass: saveClass,
        editClass: editClass,
        deleteClass: deleteClass,
        showExcelImportModal: showExcelImportModal,
        showStudentExcelModal: showStudentExcelModal,
        exportStudentCredentials: exportStudentCredentials,
        closeModal: closeModal
    };

    function renderDashboard() {
        var role = Auth.getRole();
        if (role === "student" || role === "parent") renderStudentDashboard();
        else if (role === "teacher") renderTeacherDashboard();
        else if (role === "principal") renderPrincipalDashboard();
    }
})();
