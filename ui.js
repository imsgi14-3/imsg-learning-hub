var UI = (function() {
    function $(id) { return document.getElementById(id); }

    function showLogin() {
        $("loginContainer").style.display = "flex";
        $("homeContainer").style.display = "none";
        $("quizContainer").style.display = "none";
        $("resultContainer").style.display = "none";
    }

    function showDashboard() {
        $("loginContainer").style.display = "none";
        $("homeContainer").style.display = "block";
        $("quizContainer").style.display = "none";
        $("resultContainer").style.display = "none";
        renderDashboard();
    }

    function showQuiz() {
        $("loginContainer").style.display = "none";
        $("homeContainer").style.display = "none";
        $("quizContainer").style.display = "block";
        $("resultContainer").style.display = "none";
    }

    function showResult() {
        $("loginContainer").style.display = "none";
        $("homeContainer").style.display = "none";
        $("quizContainer").style.display = "none";
        $("resultContainer").style.display = "block";
    }

    function renderDashboard() {
        var role = Auth.getRole();
        var dashboards = $("dashboards");
        if (role === "student" || role === "parent") renderStudentDashboard();
        else if (role === "teacher") renderTeacherDashboard();
        else if (role === "principal") renderPrincipalDashboard();
    }

    function renderStudentDashboard() {
        var user = Auth.getUser();
        var name = user ? user.name : "Student";
        var attempts = DataStore.getAttemptsByStudent(user ? user.id : "");
        var avg = 0;
        if (attempts.length > 0) { var sum = 0; for (var i = 0; i < attempts.length; i++) sum += attempts[i].percentage; avg = Math.round(sum / attempts.length); }
        var dashboards = $("dashboards");
        var html = '<div class="dashboard-section"><div class="section-header"><h2>Welcome, ' + name + '</h2></div>';
        html += '<div class="stat-cards"><div class="stat-card blue"><div class="stat-number">' + attempts.length + '</div><div class="stat-label">Quizzes Taken</div></div>';
        html += '<div class="stat-card green"><div class="stat-number">' + avg + '%</div><div class="stat-label">Average Score</div></div></div>';
        html += '<div class="action-buttons">';
        html += '<button onclick="UI.startPracticeFromDashboard(\'all\')" class="btn-action green">Practice All Subjects</button>';
        html += '<button onclick="UI.startPracticeFromDashboard(\'subject\')" class="btn-action blue">Practice by Subject</button>';
        html += '<button onclick="UI.showResults()" class="btn-action purple">View Results</button>';
        html += '</div></div>';
        dashboards.innerHTML = html;
        dashboards.style.display = "block";
    }

    function renderTeacherDashboard() {
        var user = Auth.getUser();
        var name = user ? user.name : "Teacher";
        var teacherClasses = [];
        if (user && user.classIds) {
            for (var i = 0; i < DataStore.classes.length; i++) {
                for (var j = 0; j < user.classIds.length; j++) {
                    if (DataStore.classes[i].id === user.classIds[j]) teacherClasses.push(DataStore.classes[i]);
                }
            }
        }
        var dashboards = $("dashboards");
        var html = '<div class="dashboard-section"><div class="section-header"><h2>Welcome, ' + name + '</h2></div>';
        html += '<div class="stat-cards">';
        html += '<div class="stat-card blue"><div class="stat-number">' + DataStore.questions.length + '</div><div class="stat-label">Questions</div></div>';
        html += '<div class="stat-card green"><div class="stat-number">' + DataStore.assignments.length + '</div><div class="stat-label">Assignments</div></div>';
        html += '<div class="stat-card purple"><div class="stat-number">' + teacherClasses.length + '</div><div class="stat-label">Classes</div></div>';
        html += '</div>';
        html += '<div class="action-buttons">';
        html += '<button onclick="UI.showTeacherQuestions()" class="btn-action blue">Manage Questions</button>';
        html += '<button onclick="UI.showTeacherAssignments()" class="btn-action purple">Manage Assignments</button>';
        html += '<button onclick="UI.showTeacherAnalytics()" class="btn-action green">Analytics</button>';
        html += '</div></div>';
        dashboards.innerHTML = html;
        dashboards.style.display = "block";
    }

    function renderPrincipalDashboard() {
        var totalStudents = DataStore.studentAccounts.length;
        var totalTeachers = DataStore.teachers.length;
        var totalClasses = DataStore.classes.length;
        var totalAttempts = DataStore.allAttempts.length;
        var avg = 0;
        if (totalAttempts > 0) { var sum = 0; for (var i = 0; i < DataStore.allAttempts.length; i++) sum += DataStore.allAttempts[i].percentage; avg = Math.round(sum / totalAttempts); }
        var dashboards = $("dashboards");
        var html = '<div class="dashboard-section"><div class="section-header"><h2>Principal Dashboard</h2></div>';
        html += '<div class="stat-cards">';
        html += '<div class="stat-card blue"><div class="stat-number">' + totalStudents + '</div><div class="stat-label">Students</div></div>';
        html += '<div class="stat-card green"><div class="stat-number">' + totalTeachers + '</div><div class="stat-label">Teachers</div></div>';
        html += '<div class="stat-card purple"><div class="stat-number">' + totalClasses + '</div><div class="stat-label">Classes</div></div>';
        html += '<div class="stat-card orange"><div class="stat-number">' + totalAttempts + '</div><div class="stat-label">Attempts</div></div>';
        html += '<div class="stat-card green"><div class="stat-number">' + avg + '%</div><div class="stat-label">Avg Score</div></div>';
        html += '</div>';
        html += '<div class="action-buttons">';
        html += '<button onclick="UI.showPrincipalStudents()" class="btn-action blue">Students</button>';
        html += '<button onclick="UI.showPrincipalTeachers()" class="btn-action green">Teachers</button>';
        html += '<button onclick="UI.showPrincipalClasses()" class="btn-action purple">Classes</button>';
        html += '<button onclick="UI.showPrincipalAnalytics()" class="btn-action orange">Analytics</button>';
        html += '</div></div>';
        dashboards.innerHTML = html;
        dashboards.style.display = "block";
    }

    function startPracticeFromDashboard(mode) {
        if (mode === "all") { launchFullPractice(); return; }
        showSubjectPicker();
    }

    function showSubjectPicker() {
        var subjects = {};
        for (var i = 0; i < DataStore.questions.length; i++) {
            if (!subjects[DataStore.questions[i].subject]) subjects[DataStore.questions[i].subject] = 0;
            subjects[DataStore.questions[i].subject]++;
        }
        var keys = Object.keys(subjects);
        var dashboards = $("dashboards");
        var html = '<div class="dashboard-section"><div class="section-header"><h2>Select Subject</h2>';
        html += '<button onclick="renderDashboard()" class="btn-back">Back</button></div>';
        html += '<div class="subject-grid">';
        for (var i = 0; i < keys.length; i++) {
            var icon = "📚";
            if (keys[i].toLowerCase().indexOf("science") !== -1) icon = "🔬";
            if (keys[i].toLowerCase().indexOf("math") !== -1) icon = "📐";
            if (keys[i].toLowerCase().indexOf("english") !== -1) icon = "📖";
            if (keys[i].toLowerCase().indexOf("urdu") !== -1) icon = "✍️";
            if (keys[i].toLowerCase().indexOf("social") !== -1) icon = "🌍";
            if (keys[i].toLowerCase().indexOf("islam") !== -1) icon = "🕌";
            html += '<div class="subject-card" onclick="UI.showChaptersForSubject(\'' + keys[i].replace(/'/g, "\\'") + '\')">';
            html += '<div class="subject-icon">' + icon + '</div>';
            html += '<div class="subject-name">' + keys[i] + '</div>';
            html += '<div class="subject-count">' + subjects[keys[i]] + ' questions</div></div>';
        }
        html += '</div></div>';
        dashboards.innerHTML = html;
        dashboards.style.display = "block";
    }

    function showChaptersForSubject(subject) {
        var chapters = {};
        for (var i = 0; i < DataStore.questions.length; i++) {
            if (DataStore.questions[i].subject === subject) {
                var ch = DataStore.questions[i].chapter;
                if (!chapters[ch]) chapters[ch] = 0;
                chapters[ch]++;
            }
        }
        var keys = Object.keys(chapters).sort();
        var dashboards = $("dashboards");
        var html = '<div class="dashboard-section"><div class="section-header"><h2>' + subject + ' - Chapters</h2>';
        html += '<button onclick="UI.showSubjectPicker()" class="btn-back">Back</button></div>';
        html += '<div class="chapter-list">';
        for (var i = 0; i < keys.length; i++) {
            html += '<div class="chapter-item" onclick="UI.showChapterDetail(\'' + subject.replace(/'/g, "\\'") + '\', \'' + keys[i].replace(/'/g, "\\'") + '\')">';
            html += '<div class="chapter-name">' + keys[i] + '</div>';
            html += '<div class="chapter-count">' + chapters[keys[i]] + ' questions</div>';
            html += '<button onclick="event.stopPropagation(); UI.quickPracticeChapter(\'' + subject.replace(/'/g, "\\'") + '\', \'' + keys[i].replace(/'/g, "\\'") + '\')" class="btn-action green btn-sm">Quick Practice</button>';
            html += '</div>';
        }
        html += '</div></div>';
        dashboards.innerHTML = html;
        dashboards.style.display = "block";
    }

    function showChapterDetail(subject, chapter) {
        var topics = {};
        for (var i = 0; i < DataStore.questions.length; i++) {
            var q = DataStore.questions[i];
            if (q.subject === subject && q.chapter === chapter) {
                var t = q.topic || "General";
                if (!topics[t]) topics[t] = 0;
                topics[t]++;
            }
        }
        var keys = Object.keys(topics).sort();
        var dashboards = $("dashboards");
        var html = '<div class="dashboard-section"><div class="section-header"><h2>' + chapter + '</h2>';
        html += '<button onclick="UI.showChaptersForSubject(\'' + subject.replace(/'/g, "\\'") + '\')" class="btn-back">Back</button></div>';
        html += '<div class="topic-list">';
        html += '<div class="topic-item" onclick="UI.quickPracticeChapter(\'' + subject.replace(/'/g, "\\'") + '\', \'' + chapter.replace(/'/g, "\\'") + '\')">';
        html += '<div class="topic-name"><strong>All Topics</strong></div>';
        html += '<button class="btn-action green btn-sm">Start Practice</button></div>';
        for (var i = 0; i < keys.length; i++) {
            html += '<div class="topic-item" onclick="UI.quickPracticeTopic(\'' + subject.replace(/'/g, "\\'") + '\', \'' + chapter.replace(/'/g, "\\'") + '\', \'' + keys[i].replace(/'/g, "\\'") + '\')">';
            html += '<div class="topic-name">' + keys[i] + '</div>';
            html += '<div class="topic-count">' + topics[keys[i]] + ' questions</div>';
            html += '<button class="btn-action green btn-sm">Practice</button></div>';
        }
        html += '</div></div>';
        dashboards.innerHTML = html;
        dashboards.style.display = "block";
    }

    function launchFullPractice() {
        var qs = DataStore.shuffleArray(DataStore.questions).slice(0, 20);
        if (qs.length === 0) { alert("No questions available"); return; }
        QuizEngine.startQuiz(qs, "fullPractice", "all", "all");
        currentQuestion = 0;
        displayQuestion();
        showQuiz();
        startTimer();
    }

    function quickPracticeChapter(subject, chapter) {
        var qs = DataStore.getQuestionsByChapter(subject, chapter);
        if (qs.length === 0) { alert("No questions in this chapter"); return; }
        qs = DataStore.shuffleArray(qs).slice(0, 20);
        QuizEngine.startQuiz(qs, "chapterPractice", subject, chapter);
        currentQuestion = 0;
        displayQuestion();
        showQuiz();
        startTimer();
    }

    function quickPracticeTopic(subject, chapter, topic) {
        var qs = DataStore.getQuestionsByTopic(subject, chapter, topic);
        if (qs.length === 0) { alert("No questions in this topic"); return; }
        qs = DataStore.shuffleArray(qs).slice(0, 20);
        QuizEngine.startQuiz(qs, "topicPractice", subject, chapter);
        currentQuestion = 0;
        displayQuestion();
        showQuiz();
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
        $("questionText").textContent = q.question;
        var optionsHtml = "";
        var opts = ["A", "B", "C", "D"];
        for (var i = 0; i < q.options.length; i++) {
            optionsHtml += '<button class="option-btn" onclick="UI.selectAnswer(' + i + ')" id="opt' + i + '">' + opts[i] + '. ' + q.options[i] + '</button>';
        }
        $("optionsContainer").innerHTML = optionsHtml;
        var prevBtn = $("prevBtn");
        var nextBtn = $("nextBtn");
        if (prevBtn) prevBtn.style.display = idx > 0 ? "inline-block" : "none";
        if (nextBtn) nextBtn.textContent = idx === total - 1 ? "Finish" : "Next →";
    }

    function selectAnswer(idx) {
        var opts = document.querySelectorAll(".option-btn");
        for (var i = 0; i < opts.length; i++) opts[i].classList.remove("selected");
        opts[idx].classList.add("selected");
        QuizEngine.recordAnswer(QuizEngine.getCurrentQuestion(), idx);
    }

    function nextQuestion() {
        var qs = QuizEngine.getQuizQuestions();
        var idx = QuizEngine.getCurrentQuestion();
        if (idx === qs.length - 1) {
            var attempt = QuizEngine.finish();
            showQuizResult(attempt);
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

    function showQuizResult(attempt) {
        var score = attempt.score;
        var total = attempt.totalQuestions;
        var percentage = attempt.percentage;
        var timeUsed = attempt.timeUsed;
        $("finalScore").textContent = score + " / " + total;
        $("percentage").textContent = percentage + "%";
        var message = "";
        if (percentage === 100) message = "Perfect Score! 🎉";
        else if (percentage >= 80) message = "Great Job! 👍";
        else if (percentage >= 60) message = "Good Effort! Keep practicing.";
        else if (percentage >= 40) message = "Needs improvement. Try again!";
        else message = "Keep practicing. You'll improve!";
        $("scoreMessage").textContent = message;
        $("quizTime").textContent = "Time: " + timeUsed + " seconds";
        showResult();
    }

    function backToDashboard() {
        stopTimer();
        showDashboard();
    }

    function showResults() {
        var user = Auth.getUser();
        var attempts = DataStore.getAttemptsByStudent(user ? user.id : "");
        var html = '<div class="dashboard-section"><div class="section-header"><h2>Your Results</h2>';
        html += '<button onclick="renderDashboard()" class="btn-back">Back</button></div>';
        if (attempts.length === 0) {
            html += '<p>No quiz attempts yet.</p>';
        } else {
            html += '<div class="results-list">';
            for (var i = attempts.length - 1; i >= 0 && i >= attempts.length - 20; i--) {
                var a = attempts[i];
                var d = new Date(a.timestamp);
                var dateStr = d.toLocaleDateString();
                var timeStr = d.toLocaleTimeString();
                html += '<div class="result-item">';
                html += '<div class="result-info">';
                html += '<div class="result-date">' + dateStr + ' ' + timeStr + '</div>';
                html += '<div class="result-subject">' + (a.subject || "General") + ' - ' + (a.mode || "practice") + '</div>';
                html += '</div>';
                html += '<div class="result-score ' + (a.percentage >= 50 ? "pass" : "fail") + '">' + a.percentage + '%</div>';
                html += '</div>';
            }
            html += '</div>';
        }
        html += '</div>';
        var dashboards = $("dashboards");
        dashboards.innerHTML = html;
        dashboards.style.display = "block";
        $("homeContainer").style.display = "block";
        $("quizContainer").style.display = "none";
        $("resultContainer").style.display = "none";
    }

    function updateTimerDisplay(seconds) {
        var timerEl = $("timer");
        if (timerEl) timerEl.textContent = "Time: " + seconds + "s";
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

    function showTeacherQuestions() {
        var html = '<div class="dashboard-section"><div class="section-header"><h2>Question Bank</h2>';
        html += '<button onclick="renderDashboard()" class="btn-back">Back</button>';
        html += '<button onclick="UI.showAddQuestionModal()" class="btn-action green">+ Add Question</button></div>';
        html += '<div class="filter-bar"><select id="filterSubject" onchange="UI.renderFilteredQuestions()"><option value="">All Subjects</option></select>';
        html += '<select id="filterChapter" onchange="UI.renderFilteredQuestions()"><option value="">All Chapters</option></select></div>';
        html += '<div id="questionsList"></div></div>';
        var dashboards = $("dashboards");
        dashboards.innerHTML = html;
        dashboards.style.display = "block";
        var subjects = {};
        for (var i = 0; i < DataStore.questions.length; i++) {
            if (!subjects[DataStore.questions[i].subject]) subjects[DataStore.questions[i].subject] = 1;
            else subjects[DataStore.questions[i].subject]++;
        }
        var sel = $("filterSubject");
        var keys = Object.keys(subjects).sort();
        for (var i = 0; i < keys.length; i++) {
            sel.innerHTML += '<option value="' + keys[i] + '">' + keys[i] + ' (' + subjects[keys[i]] + ')</option>';
        }
        renderFilteredQuestions();
    }

    function renderFilteredQuestions() {
        var subject = $("filterSubject") ? $("filterSubject").value : "";
        var chapter = $("filterChapter") ? $("filterChapter").value : "";
        var filtered = DataStore.questions;
        if (subject) filtered = filtered.filter(function(q) { return q.subject === subject; });
        if (chapter) filtered = filtered.filter(function(q) { return q.chapter === chapter; });
        var html = '<div class="questions-table"><table><thead><tr><th>ID</th><th>Subject</th><th>Chapter</th><th>Question</th><th>Options</th><th>Answer</th><th>Actions</th></tr></thead><tbody>';
        var display = filtered.slice(0, 100);
        for (var i = 0; i < display.length; i++) {
            var q = display[i];
            html += '<tr>';
            html += '<td>' + (q.id || "-") + '</td>';
            html += '<td>' + (q.subject || "-") + '</td>';
            html += '<td>' + (q.chapter || "-") + '</td>';
            html += '<td>' + (q.question || "").substring(0, 60) + '</td>';
            html += '<td>' + (q.options ? q.options.length : 0) + ' opts</td>';
            html += '<td>' + (q.answer || "-") + '</td>';
            html += '<td><button onclick="UI.editQuestion(\'' + (q.id || "").replace(/'/g, "\\'") + '\')" class="btn-sm">Edit</button>';
            html += '<button onclick="UI.deleteQuestion(\'' + (q.id || "").replace(/'/g, "\\'") + '\')" class="btn-sm btn-danger">Del</button></td>';
            html += '</tr>';
        }
        html += '</tbody></table></div>';
        if (filtered.length > 100) html += '<p>Showing first 100 of ' + filtered.length + ' questions</p>';
        var container = $("questionsList");
        if (container) container.innerHTML = html;
    }

    function showAddQuestionModal() {
        var modal = $("questionModal");
        if (!modal) return;
        var html = '<div class="modal-content">';
        html += '<div class="modal-header"><h3>Add Question</h3><span class="modal-close" onclick="UI.closeModal()">&times;</span></div>';
        html += '<div class="modal-body">';
        html += '<div class="form-row"><label>Subject:</label><input type="text" id="qSubject" value="Computer Science"></div>';
        html += '<div class="form-row"><label>Chapter:</label><input type="text" id="qChapter" value="Chapter 1"></div>';
        html += '<div class="form-row"><label>Topic:</label><input type="text" id="qTopic"></div>';
        html += '<div class="form-row"><label>Question:</label><textarea id="qText" rows="3"></textarea></div>';
        html += '<div class="form-row"><label>Option A:</label><input type="text" id="qOptA"></div>';
        html += '<div class="form-row"><label>Option B:</label><input type="text" id="qOptB"></div>';
        html += '<div class="form-row"><label>Option C:</label><input type="text" id="qOptC"></div>';
        html += '<div class="form-row"><label>Option D:</label><input type="text" id="qOptD"></div>';
        html += '<div class="form-row"><label>Correct (A/B/C/D):</label><select id="qAnswer"><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option></select></div>';
        html += '<div class="form-row"><label>Explanation:</label><textarea id="qExplanation" rows="2"></textarea></div>';
        html += '<div class="modal-actions"><button onclick="UI.saveQuestion()" class="btn-action green">Save</button>';
        html += '<button onclick="UI.closeModal()" class="btn-action">Cancel</button></div>';
        html += '</div></div>';
        modal.innerHTML = html;
        modal.style.display = "flex";
    }

    function saveQuestion() {
        var q = {
            id: "Q-" + Date.now(),
            subject: $("qSubject").value.trim(),
            chapter: $("qChapter").value.trim(),
            topic: $("qTopic").value.trim(),
            question: $("qText").value.trim(),
            options: [$("qOptA").value.trim(), $("qOptB").value.trim(), $("qOptC").value.trim(), $("qOptD").value.trim()],
            answer: $("qAnswer").value,
            explanation: $("qExplanation").value.trim()
        };
        if (!q.question || !q.subject || !q.chapter) { alert("Fill all required fields"); return; }
        DataStore.questions.push(q);
        DataStore.save();
        closeModal();
        renderFilteredQuestions();
    }

    function editQuestion(id) {
        var q = null;
        for (var i = 0; i < DataStore.questions.length; i++) {
            if (DataStore.questions[i].id === id) { q = DataStore.questions[i]; break; }
        }
        if (!q) return;
        showAddQuestionModal();
        $("qSubject").value = q.subject || "";
        $("qChapter").value = q.chapter || "";
        $("qTopic").value = q.topic || "";
        $("qText").value = q.question || "";
        if (q.options && q.options.length >= 4) {
            $("qOptA").value = q.options[0];
            $("qOptB").value = q.options[1];
            $("qOptC").value = q.options[2];
            $("qOptD").value = q.options[3];
        }
        $("qAnswer").value = q.answer || "A";
        $("qExplanation").value = q.explanation || "";
        document.querySelector(".modal-header h3").textContent = "Edit Question";
        document.querySelector(".modal-actions .btn-green").onclick = function() { updateQuestion(id); };
    }

    function updateQuestion(id) {
        for (var i = 0; i < DataStore.questions.length; i++) {
            if (DataStore.questions[i].id === id) {
                DataStore.questions[i].subject = $("qSubject").value.trim();
                DataStore.questions[i].chapter = $("qChapter").value.trim();
                DataStore.questions[i].topic = $("qTopic").value.trim();
                DataStore.questions[i].question = $("qText").value.trim();
                DataStore.questions[i].options = [$("qOptA").value.trim(), $("qOptB").value.trim(), $("qOptC").value.trim(), $("qOptD").value.trim()];
                DataStore.questions[i].answer = $("qAnswer").value;
                DataStore.questions[i].explanation = $("qExplanation").value.trim();
                break;
            }
        }
        DataStore.save();
        closeModal();
        renderFilteredQuestions();
    }

    function deleteQuestion(id) {
        if (!confirm("Delete this question?")) return;
        DataStore.questions = DataStore.questions.filter(function(q) { return q.id !== id; });
        DataStore.save();
        renderFilteredQuestions();
    }

    function showTeacherAssignments() {
        var html = '<div class="dashboard-section"><div class="section-header"><h2>Assignments</h2>';
        html += '<button onclick="renderDashboard()" class="btn-back">Back</button>';
        html += '<button onclick="UI.showCreateAssignmentModal()" class="btn-action green">+ Create Assignment</button></div>';
        html += '<div id="assignmentsList"></div></div>';
        var dashboards = $("dashboards");
        dashboards.innerHTML = html;
        dashboards.style.display = "block";
        var container = $("assignmentsList");
        if (DataStore.assignments.length === 0) { container.innerHTML = "<p>No assignments yet.</p>"; return; }
        var html2 = '<div class="assignments-list">';
        for (var i = 0; i < DataStore.assignments.length; i++) {
            var a = DataStore.assignments[i];
            html2 += '<div class="assignment-item">';
            html2 += '<div class="assignment-info"><h4>' + (a.title || "Untitled") + '</h4>';
            html2 += '<p>' + (a.description || "") + '</p>';
            html2 += '<span class="assignment-meta">' + (a.questions ? a.questions.length : 0) + ' questions | Due: ' + (a.dueDate || "None") + '</span></div>';
            html2 += '<div class="assignment-actions">';
            html2 += '<button onclick="UI.editAssignment(' + i + ')" class="btn-sm">Edit</button>';
            html2 += '<button onclick="UI.deleteAssignment(' + i + ')" class="btn-sm btn-danger">Delete</button>';
            html2 += '</div></div>';
        }
        html2 += '</div>';
        container.innerHTML = html2;
    }

    function showCreateAssignmentModal() {
        var modal = $("assignmentModal");
        if (!modal) return;
        var html = '<div class="modal-content">';
        html += '<div class="modal-header"><h3>Create Assignment</h3><span class="modal-close" onclick="UI.closeModal()">&times;</span></div>';
        html += '<div class="modal-body">';
        html += '<div class="form-row"><label>Title:</label><input type="text" id="aTitle"></div>';
        html += '<div class="form-row"><label>Description:</label><textarea id="aDesc" rows="2"></textarea></div>';
        html += '<div class="form-row"><label>Due Date:</label><input type="date" id="aDue"></div>';
        html += '<div class="form-row"><label>Class:</label><select id="aClass">';
        for (var i = 0; i < DataStore.classes.length; i++) {
            html += '<option value="' + DataStore.classes[i].id + '">' + DataStore.classes[i].name + '</option>';
        }
        html += '</select></div>';
        html += '<div class="form-row"><label>Select Questions:</label><div id="aQuestionList"></div></div>';
        html += '<div class="modal-actions"><button onclick="UI.saveAssignment()" class="btn-action green">Save</button>';
        html += '<button onclick="UI.closeModal()" class="btn-action">Cancel</button></div>';
        html += '</div></div>';
        modal.innerHTML = html;
        modal.style.display = "flex";
        var qList = $("aQuestionList");
        var qHtml = '<div class="question-select-list">';
        var show = DataStore.questions.slice(0, 50);
        for (var i = 0; i < show.length; i++) {
            qHtml += '<label class="question-select-item"><input type="checkbox" value="' + i + '"> ' + (show[i].question || "").substring(0, 50) + '...</label>';
        }
        qHtml += '</div>';
        qList.innerHTML = qHtml;
    }

    function saveAssignment() {
        var a = {
            id: "A-" + Date.now(),
            title: $("aTitle").value.trim(),
            description: $("aDesc").value.trim(),
            dueDate: $("aDue").value,
            classId: $("aClass").value,
            questions: [],
            createdAt: Date.now()
        };
        if (!a.title) { alert("Title required"); return; }
        var checkboxes = document.querySelectorAll("#aQuestionList input[type='checkbox']:checked");
        for (var i = 0; i < checkboxes.length; i++) {
            var idx = parseInt(checkboxes[i].value);
            if (DataStore.questions[idx]) a.questions.push(DataStore.questions[idx]);
        }
        DataStore.assignments.push(a);
        DataStore.save();
        closeModal();
        showTeacherAssignments();
    }

    function editAssignment(idx) {
        showCreateAssignmentModal();
        var a = DataStore.assignments[idx];
        $("aTitle").value = a.title || "";
        $("aDesc").value = a.description || "";
        $("aDue").value = a.dueDate || "";
        $("aClass").value = a.classId || "";
        document.querySelector(".modal-header h3").textContent = "Edit Assignment";
    }

    function deleteAssignment(idx) {
        if (!confirm("Delete this assignment?")) return;
        DataStore.assignments.splice(idx, 1);
        DataStore.save();
        showTeacherAssignments();
    }

    function showTeacherAnalytics() {
        var attempts = DataStore.allAttempts;
        var avg = 0;
        if (attempts.length > 0) { var sum = 0; for (var i = 0; i < attempts.length; i++) sum += attempts[i].percentage; avg = Math.round(sum / attempts.length); }
        var html = '<div class="dashboard-section"><div class="section-header"><h2>Analytics</h2>';
        html += '<button onclick="renderDashboard()" class="btn-back">Back</button></div>';
        html += '<div class="stat-cards"><div class="stat-card blue"><div class="stat-number">' + attempts.length + '</div><div class="stat-label">Total Attempts</div></div>';
        html += '<div class="stat-card green"><div class="stat-number">' + avg + '%</div><div class="stat-label">Average Score</div></div></div>';
        html += '<div class="chart-section"><h3>Recent Attempts</h3><div id="attemptsChart"></div></div></div>';
        var dashboards = $("dashboards");
        dashboards.innerHTML = html;
        dashboards.style.display = "block";
        var chartData = [];
        var recent = attempts.slice(-10);
        for (var i = 0; i < recent.length; i++) {
            chartData.push({ label: "Attempt " + (i + 1), value: recent[i].percentage });
        }
        renderBar("attemptsChart", chartData, 100);
    }

    function showPrincipalStudents() {
        var html = '<div class="dashboard-section"><div class="section-header"><h2>Students</h2>';
        html += '<button onclick="renderDashboard()" class="btn-back">Back</button>';
        html += '<button onclick="UI.showAddStudentModal()" class="btn-action green">+ Add Student</button>';
        html += '<button onclick="UI.showExcelImportModal()" class="btn-action blue">Import Excel</button></div>';
        html += '<div class="filter-bar"><select id="filterClass" onchange="UI.renderStudentList()"><option value="">All Classes</option>';
        for (var i = 0; i < DataStore.classes.length; i++) {
            html += '<option value="' + DataStore.classes[i].id + '">' + DataStore.classes[i].name + '</option>';
        }
        html += '</select></div>';
        html += '<div id="studentList"></div></div>';
        var dashboards = $("dashboards");
        dashboards.innerHTML = html;
        dashboards.style.display = "block";
        renderStudentList();
    }

    function renderStudentList() {
        var classId = $("filterClass") ? $("filterClass").value : "";
        var filtered = DataStore.studentAccounts;
        if (classId) filtered = filtered.filter(function(s) { return s.classId === classId; });
        var container = $("studentList");
        if (!container) return;
        if (filtered.length === 0) { container.innerHTML = "<p>No students found.</p>"; return; }
        var html = '<div class="students-table"><table><thead><tr><th>ID</th><th>Name</th><th>Class</th><th>Password</th><th>Actions</th></tr></thead><tbody>';
        for (var i = 0; i < filtered.length; i++) {
            var s = filtered[i];
            var className = "";
            for (var j = 0; j < DataStore.classes.length; j++) {
                if (DataStore.classes[j].id === s.classId) { className = DataStore.classes[j].name; break; }
            }
            html += '<tr>';
            html += '<td>' + s.id + '</td>';
            html += '<td>' + (s.name || "-") + '</td>';
            html += '<td>' + className + '</td>';
            html += '<td>••••••••</td>';
            html += '<td><button onclick="UI.editStudent(\'' + s.id + '\')" class="btn-sm">Edit</button>';
            html += '<button onclick="UI.deleteStudent(\'' + s.id + '\')" class="btn-sm btn-danger">Del</button></td>';
            html += '</tr>';
        }
        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    function showAddStudentModal() {
        var modal = $("studentModal");
        if (!modal) return;
        var html = '<div class="modal-content">';
        html += '<div class="modal-header"><h3>Add Student</h3><span class="modal-close" onclick="UI.closeModal()">&times;</span></div>';
        html += '<div class="modal-body">';
        html += '<div class="form-row"><label>Class:</label><select id="sClass">';
        for (var i = 0; i < DataStore.classes.length; i++) {
            html += '<option value="' + DataStore.classes[i].id + '">' + DataStore.classes[i].name + '</option>';
        }
        html += '</select></div>';
        html += '<div class="form-row"><label>Name:</label><input type="text" id="sName"></div>';
        html += '<div class="form-row"><label>Roll No:</label><input type="number" id="sRoll" min="1"></div>';
        html += '<div class="form-row"><label>Password:</label><input type="text" id="sPassword"></div>';
        html += '<div class="modal-actions"><button onclick="UI.saveStudent()" class="btn-action green">Save</button>';
        html += '<button onclick="UI.closeModal()" class="btn-action">Cancel</button></div>';
        html += '</div></div>';
        modal.innerHTML = html;
        modal.style.display = "flex";
    }

    function saveStudent() {
        var classId = $("sClass").value;
        var name = $("sName").value.trim();
        var roll = parseInt($("sRoll").value);
        var password = $("sPassword").value.trim() || DataStore.generateRandomPassword();
        if (!name || !roll) { alert("Name and roll required"); return; }
        var classObj = DataStore.findClassById(classId);
        if (!classObj) { alert("Class not found"); return; }
        var id = DataStore.generateStudentId(classObj, roll);
        var existing = DataStore.findStudentById(id);
        if (existing) { alert("Student with ID " + id + " already exists"); return; }
        var student = { id: id, name: name, classId: classId, rollNo: roll, password: password, createdAt: Date.now() };
        DataStore.addStudent(student);
        var email = id.toLowerCase() + "@imsg.edu.pk";
        if (typeof fbAuth !== "undefined" && fbAuth) {
            fbAuth.createUserWithEmailAndPassword(email, password + "!Aa1").catch(function() {});
        }
        closeModal();
        renderStudentList();
    }

    function editStudent(id) {
        var s = DataStore.findStudentById(id);
        if (!s) return;
        showAddStudentModal();
        $("sName").value = s.name || "";
        $("sClass").value = s.classId || "";
        $("sPassword").value = s.password || "";
        document.querySelector(".modal-header h3").textContent = "Edit Student";
    }

    function deleteStudent(id) {
        if (!confirm("Delete student " + id + "?")) return;
        DataStore.removeStudent(id);
        renderStudentList();
    }

    function showAddTeacherModal() {
        var modal = $("teacherModal");
        if (!modal) return;
        var html = '<div class="modal-content">';
        html += '<div class="modal-header"><h3>Add Teacher</h3><span class="modal-close" onclick="UI.closeModal()">&times;</span></div>';
        html += '<div class="modal-body">';
        html += '<div class="form-row"><label>Name:</label><input type="text" id="tName"></div>';
        html += '<div class="form-row"><label>Subject:</label><input type="text" id="tSubject"></div>';
        html += '<div class="form-row"><label>Role:</label><select id="tRole"><option value="subject">Subject Teacher</option><option value="class">Class Teacher</option><option value="both">Both</option></select></div>';
        html += '<div class="form-row" id="tClassRow"><label>Class:</label><select id="tClass">';
        for (var i = 0; i < DataStore.classes.length; i++) {
            html += '<option value="' + DataStore.classes[i].id + '">' + DataStore.classes[i].name + '</option>';
        }
        html += '</select></div>';
        html += '<div class="form-row"><label>Password:</label><input type="text" id="tPassword"></div>';
        html += '<div class="modal-actions"><button onclick="UI.saveTeacher()" class="btn-action green">Save</button>';
        html += '<button onclick="UI.closeModal()" class="btn-action">Cancel</button></div>';
        html += '</div></div>';
        modal.innerHTML = html;
        modal.style.display = "flex";
    }

    function saveTeacher() {
        var name = $("tName").value.trim();
        var subject = $("tSubject").value.trim();
        var role = $("tRole").value;
        var classId = $("tClass").value;
        var password = $("tPassword").value.trim() || DataStore.generateRandomPassword();
        if (!name) { alert("Name required"); return; }
        var id = DataStore.generateTeacherId();
        var teacher = { id: id, name: name, subject: subject, role: role, classId: role !== "subject" ? classId : "", password: password, createdAt: Date.now() };
        DataStore.addTeacher(teacher);
        var email = id.toLowerCase() + "@imsg.edu.pk";
        if (typeof fbAuth !== "undefined" && fbAuth) {
            fbAuth.createUserWithEmailAndPassword(email, password + "!Aa1").catch(function() {});
        }
        closeModal();
        renderTeacherList();
    }

    function showPrincipalTeachers() {
        var html = '<div class="dashboard-section"><div class="section-header"><h2>Teachers</h2>';
        html += '<button onclick="renderDashboard()" class="btn-back">Back</button>';
        html += '<button onclick="UI.showAddTeacherModal()" class="btn-action green">+ Add Teacher</button></div>';
        html += '<div id="teacherList"></div></div>';
        var dashboards = $("dashboards");
        dashboards.innerHTML = html;
        dashboards.style.display = "block";
        renderTeacherList();
    }

    function renderTeacherList() {
        var container = $("teacherList");
        if (!container) return;
        if (DataStore.teachers.length === 0) { container.innerHTML = "<p>No teachers.</p>"; return; }
        var html = '<div class="teachers-table"><table><thead><tr><th>ID</th><th>Name</th><th>Subject</th><th>Role</th><th>Class</th><th>Actions</th></tr></thead><tbody>';
        for (var i = 0; i < DataStore.teachers.length; i++) {
            var t = DataStore.teachers[i];
            var className = "";
            if (t.classId) {
                for (var j = 0; j < DataStore.classes.length; j++) {
                    if (DataStore.classes[j].id === t.classId) { className = DataStore.classes[j].name; break; }
                }
            }
            html += '<tr>';
            html += '<td>' + t.id + '</td>';
            html += '<td>' + (t.name || "-") + '</td>';
            html += '<td>' + (t.subject || "-") + '</td>';
            html += '<td>' + (t.role || "subject") + '</td>';
            html += '<td>' + className + '</td>';
            html += '<td><button onclick="UI.editTeacher(\'' + t.id + '\')" class="btn-sm">Edit</button>';
            html += '<button onclick="UI.deleteTeacher(\'' + t.id + '\')" class="btn-sm btn-danger">Del</button></td>';
            html += '</tr>';
        }
        html += '</tbody></table></div>';
        container.innerHTML = html;
    }

    function editTeacher(id) {
        var t = DataStore.findTeacherById(id);
        if (!t) return;
        showAddTeacherModal();
        $("tName").value = t.name || "";
        $("tSubject").value = t.subject || "";
        $("tRole").value = t.role || "subject";
        $("tClass").value = t.classId || "";
        $("tPassword").value = t.password || "";
        document.querySelector(".modal-header h3").textContent = "Edit Teacher";
    }

    function deleteTeacher(id) {
        if (!confirm("Delete teacher " + id + "?")) return;
        DataStore.removeTeacher(id);
        renderTeacherList();
    }

    function showPrincipalClasses() {
        var html = '<div class="dashboard-section"><div class="section-header"><h2>Classes</h2>';
        html += '<button onclick="renderDashboard()" class="btn-back">Back</button>';
        html += '<button onclick="UI.showAddClassModal()" class="btn-action green">+ Add Class</button></div>';
        html += '<div id="classList"></div></div>';
        var dashboards = $("dashboards");
        dashboards.innerHTML = html;
        dashboards.style.display = "block";
        renderClassList();
    }

    function renderClassList() {
        var container = $("classList");
        if (!container) return;
        var html = '<div class="classes-grid">';
        for (var i = 0; i < DataStore.classes.length; i++) {
            var cl = DataStore.classes[i];
            var count = DataStore.getStudentCountByClass(cl.id);
            html += '<div class="class-card">';
            html += '<h3>' + cl.name + '</h3>';
            html += '<p>Grade: ' + cl.grade + ' | Section: ' + cl.section + '</p>';
            html += '<p>Students: ' + count + '</p>';
            html += '<div class="class-actions">';
            html += '<button onclick="UI.editClass(' + i + ')" class="btn-sm">Edit</button>';
            html += '<button onclick="UI.deleteClass(' + i + ')" class="btn-sm btn-danger">Del</button>';
            html += '</div></div>';
        }
        html += '</div>';
        container.innerHTML = html;
    }

    function showAddClassModal() {
        var modal = $("classModal");
        if (!modal) return;
        var html = '<div class="modal-content">';
        html += '<div class="modal-header"><h3>Add Class</h3><span class="modal-close" onclick="UI.closeModal()">&times;</span></div>';
        html += '<div class="modal-body">';
        html += '<div class="form-row"><label>Grade:</label><input type="number" id="cGrade" value="9"></div>';
        html += '<div class="form-row"><label>Section:</label><input type="text" id="cSection" placeholder="A"></div>';
        html += '<div class="modal-actions"><button onclick="UI.saveClass()" class="btn-action green">Save</button>';
        html += '<button onclick="UI.closeModal()" class="btn-action">Cancel</button></div>';
        html += '</div></div>';
        modal.innerHTML = html;
        modal.style.display = "flex";
    }

    function saveClass() {
        var grade = parseInt($("cGrade").value);
        var section = $("cSection").value.trim().toUpperCase();
        if (!grade || !section) { alert("Grade and section required"); return; }
        var id = "CLASS-" + grade + section;
        for (var i = 0; i < DataStore.classes.length; i++) {
            if (DataStore.classes[i].id === id) { alert("Class already exists"); return; }
        }
        DataStore.classes.push({ id: id, name: grade + section, grade: grade, section: section });
        DataStore.save();
        closeModal();
        renderClassList();
    }

    function editClass(idx) {
        var cl = DataStore.classes[idx];
        showAddClassModal();
        $("cGrade").value = cl.grade;
        $("cSection").value = cl.section;
        document.querySelector(".modal-header h3").textContent = "Edit Class";
    }

    function deleteClass(idx) {
        if (!confirm("Delete this class?")) return;
        DataStore.classes.splice(idx, 1);
        DataStore.save();
        renderClassList();
    }

    function showPrincipalAnalytics() {
        var attempts = DataStore.allAttempts;
        var avg = 0;
        if (attempts.length > 0) { var sum = 0; for (var i = 0; i < attempts.length; i++) sum += attempts[i].percentage; avg = Math.round(sum / attempts.length); }
        var html = '<div class="dashboard-section"><div class="section-header"><h2>School Analytics</h2>';
        html += '<button onclick="renderDashboard()" class="btn-back">Back</button></div>';
        html += '<div class="stat-cards">';
        html += '<div class="stat-card blue"><div class="stat-number">' + attempts.length + '</div><div class="stat-label">Total Attempts</div></div>';
        html += '<div class="stat-card green"><div class="stat-number">' + avg + '%</div><div class="stat-label">Average Score</div></div>';
        html += '<div class="stat-card purple"><div class="stat-number">' + DataStore.studentAccounts.length + '</div><div class="stat-label">Active Students</div></div>';
        html += '</div>';
        html += '<div class="chart-section"><h3>Score Distribution</h3><div id="scoreChart"></div></div>';
        html += '<div class="chart-section"><h3>Subject Performance</h3><div id="subjectChart"></div></div></div>';
        var dashboards = $("dashboards");
        dashboards.innerHTML = html;
        dashboards.style.display = "block";
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
        renderDonut("scoreChart", scoreData);
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
        renderBar("subjectChart", subjectArr, 100);
    }

    function showExcelImportModal() {
        var modal = $("excelModal");
        if (!modal) return;
        var html = '<div class="modal-content">';
        html += '<div class="modal-header"><h3>Import Students from Excel</h3><span class="modal-close" onclick="UI.closeModal()">&times;</span></div>';
        html += '<div class="modal-body">';
        html += '<div class="form-row"><label>Select Excel File:</label><input type="file" id="excelFile" accept=".xlsx,.xls,.csv"></div>';
        html += '<div id="excelPreview"></div>';
        html += '<div class="modal-actions"><button onclick="UI.previewExcel()" class="btn-action blue">Preview</button>';
        html += '<button onclick="UI.confirmExcelImport()" class="btn-action green">Import</button>';
        html += '<button onclick="UI.closeModal()" class="btn-action">Cancel</button></div>';
        html += '</div></div>';
        modal.innerHTML = html;
        modal.style.display = "flex";
    }

    var excelData = [];
    function previewExcel() {
        var file = $("excelFile").files[0];
        if (!file) { alert("Select a file"); return; }
        var reader = new FileReader();
        reader.onload = function(e) {
            try {
                var wb = XLSX.read(e.target.result, { type: "array" });
                var ws = wb.Sheets[wb.SheetNames[0]];
                var data = XLSX.utils.sheet_to_json(ws, { header: 1 });
                excelData = [];
                var html = '<table><thead><tr>';
                if (data.length > 0) {
                    for (var j = 0; j < data[0].length; j++) html += '<th>' + (data[0][j] || "") + '</th>';
                    html += '</tr></thead><tbody>';
                    for (var i = 1; i < data.length && i <= 20; i++) {
                        html += '<tr>';
                        var row = {};
                        for (var j = 0; j < data[i].length; j++) {
                            html += '<td>' + (data[i][j] || "") + '</td>';
                            if (data[0] && data[0][j]) row[data[0][j]] = data[i][j];
                        }
                        excelData.push(row);
                        html += '</tr>';
                    }
                    html += '</tbody></table>';
                    html += '<p>' + (data.length - 1) + ' rows found. Showing first 20.</p>';
                } else {
                    html = '<p>No data found</p>';
                }
                $("excelPreview").innerHTML = html;
            } catch(err) { alert("Error reading file: " + err.message); }
        };
        reader.readAsArrayBuffer(file);
    }

    function confirmExcelImport() {
        if (excelData.length === 0) { alert("Preview first"); return; }
        var count = 0;
        for (var i = 0; i < excelData.length; i++) {
            var row = excelData[i];
            var name = row.name || row.Name || row.STUDENT_NAME || "";
            var className = row.class || row.Class || row.CLASS || row.className || "";
            var roll = row.roll || row.ROLL || row.rollNo || row.RollNo || "";
            var password = row.password || row.PASSWORD || DataStore.generateRandomPassword();
            if (!name || !className) continue;
            var classObj = null;
            for (var j = 0; j < DataStore.classes.length; j++) {
                if (DataStore.classes[j].name === className || DataStore.classes[j].id === className) { classObj = DataStore.classes[j]; break; }
            }
            if (!classObj) {
                var grade = parseInt(className);
                var section = className.replace(/[0-9]/g, "") || "A";
                classObj = { id: "CLASS-" + grade + section, name: className, grade: grade || 9, section: section };
                DataStore.classes.push(classObj);
            }
            var id = DataStore.generateStudentId(classObj, parseInt(roll) || (DataStore.studentAccounts.length + 1));
            var existing = DataStore.findStudentById(id);
            if (existing) continue;
            var student = { id: id, name: name, classId: classObj.id, rollNo: parseInt(roll) || (DataStore.studentAccounts.length + 1), password: password, createdAt: Date.now() };
            DataStore.addStudent(student);
            var email = id.toLowerCase() + "@imsg.edu.pk";
            if (typeof fbAuth !== "undefined" && fbAuth) {
                fbAuth.createUserWithEmailAndPassword(email, password + "!Aa1").catch(function() {});
            }
            count++;
        }
        DataStore.save();
        excelData = [];
        closeModal();
        alert("Imported " + count + " students");
        renderStudentList();
    }

    function closeModal() {
        var modals = document.querySelectorAll(".modal");
        for (var i = 0; i < modals.length; i++) modals[i].style.display = "none";
    }

    return {
        $: $,
        showLogin: showLogin,
        showDashboard: showDashboard,
        showQuiz: showQuiz,
        showResult: showResult,
        renderDashboard: renderDashboard,
        startPracticeFromDashboard: startPracticeFromDashboard,
        showSubjectPicker: showSubjectPicker,
        showChaptersForSubject: showChaptersForSubject,
        showChapterDetail: showChapterDetail,
        launchFullPractice: launchFullPractice,
        quickPracticeChapter: quickPracticeChapter,
        quickPracticeTopic: quickPracticeTopic,
        displayQuestion: displayQuestion,
        selectAnswer: selectAnswer,
        nextQuestion: nextQuestion,
        prevQuestion: prevQuestion,
        skipQuestion: skipQuestion,
        showQuizResult: showQuizResult,
        backToDashboard: backToDashboard,
        showResults: showResults,
        updateTimerDisplay: updateTimerDisplay,
        renderBar: renderBar,
        renderDonut: renderDonut,
        showTeacherQuestions: showTeacherQuestions,
        renderFilteredQuestions: renderFilteredQuestions,
        showAddQuestionModal: showAddQuestionModal,
        saveQuestion: saveQuestion,
        editQuestion: editQuestion,
        deleteQuestion: deleteQuestion,
        showTeacherAssignments: showTeacherAssignments,
        showCreateAssignmentModal: showCreateAssignmentModal,
        saveAssignment: saveAssignment,
        editAssignment: editAssignment,
        deleteAssignment: deleteAssignment,
        showTeacherAnalytics: showTeacherAnalytics,
        showPrincipalStudents: showPrincipalStudents,
        renderStudentList: renderStudentList,
        showAddStudentModal: showAddStudentModal,
        saveStudent: saveStudent,
        editStudent: editStudent,
        deleteStudent: deleteStudent,
        showAddTeacherModal: showAddTeacherModal,
        saveTeacher: saveTeacher,
        showPrincipalTeachers: showPrincipalTeachers,
        renderTeacherList: renderTeacherList,
        editTeacher: editTeacher,
        deleteTeacher: deleteTeacher,
        showPrincipalClasses: showPrincipalClasses,
        renderClassList: renderClassList,
        showAddClassModal: showAddClassModal,
        saveClass: saveClass,
        editClass: editClass,
        deleteClass: deleteClass,
        showPrincipalAnalytics: showPrincipalAnalytics,
        showExcelImportModal: showExcelImportModal,
        previewExcel: previewExcel,
        confirmExcelImport: confirmExcelImport,
        closeModal: closeModal
    };
})();
