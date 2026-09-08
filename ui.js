var UI = (function() {
    function $(id) { return document.getElementById(id); }

    function dashboardsHide() {
        var ids = ["studentDashboard", "teacherDashboard", "classTeacherDashboard", "parentDashboard", "principalDashboard"];
        for (var i = 0; i < ids.length; i++) {
            var el = document.getElementById(ids[i]);
            if (el) el.style.display = "none";
        }
    }

    function showLogin() {
        $("loginPage").style.display = "flex";
        dashboardsHide();
        $("quiz").style.display = "none";
        $("result").style.display = "none";
        $("review").style.display = "none";
        $("logoutBar").style.display = "none";
        $("homeBtn").style.display = "none";
    }

    function updateLoginFields() {
        var role = $("roleSelect").value;
        var ids = ["studentFields", "teacherFields", "parentFields", "principalFields"];
        for (var i = 0; i < ids.length; i++) { var el = $(ids[i]); if (el) el.style.display = "none"; }
        if (role === "student") $("studentFields").style.display = "block";
        else if (role === "teacher" || role === "classteacher") { $("teacherFields").style.display = "block"; }
        else if (role === "parent") $("parentFields").style.display = "block";
        else if (role === "principal") $("principalFields").style.display = "block";
    }

    function activateTab(containerSel, idx) {
        var btns = document.querySelectorAll(containerSel + " .tab-btn");
        for (var i = 0; i < btns.length; i++) {
            if (i === idx) btns[i].classList.add("active");
            else btns[i].classList.remove("active");
        }
    }

    function showStudentTab(tab) {
        var map = { practice: 0, assignments: 1, results: 2, progress: 3 };
        var ids = ["studentPracticeTab", "studentAssignmentsTab", "studentResultsTab", "studentProgressTab"];
        for (var i = 0; i < ids.length; i++) { var el = $(ids[i]); if (el) el.style.display = "none"; }
        activateTab("#studentDashboard", map[tab]);
        if (tab === "practice") { $("studentPracticeTab").style.display = "block"; renderSubjects(); showSubjectList(); }
        else if (tab === "assignments") { $("studentAssignmentsTab").style.display = "block"; refreshAssignmentsFromFirestore(function() { renderStudentAssignments(); }); }
        else if (tab === "results") { $("studentResultsTab").style.display = "block"; renderStudentResults(); }
        else if (tab === "progress") { $("studentProgressTab").style.display = "block"; renderStudentProgress(); }
    }

    function renderStudentDashboard() {
        var user = Auth.getUser();
        if (!user) return;
        var sd = $("studentDisplayName");
        if (sd) sd.textContent = user.name;
        var lu = $("loggedUser");
        if (lu) lu.textContent = user.name + " (Student)";
    }

    function renderStudentAssignments() {
        var c = $("studentAssignmentsList");
        if (!c) return;
        var sc = null;
        for (var i = 0; i < classes.length; i++) {
            if (Auth.getUser().classId === classes[i].id) { sc = classes[i]; break; }
        }
        if (!sc) { c.innerHTML = "<p>No class assigned.</p>"; return; }
        var my = [];
        for (var i = 0; i < assignments.length; i++) {
            if (assignments[i].classId === sc.id) my.push(assignments[i]);
        }
        if (my.length === 0) { c.innerHTML = "<p>No assignments yet.</p>"; return; }
        var h = '<table><thead><tr><th>Title</th><th>Subject</th><th>Due Date</th><th>Questions</th><th>Action</th></tr></thead><tbody>';
        for (var i = 0; i < my.length; i++) {
            var overdue = new Date(my[i].dueDate) < new Date();
            h += '<tr><td>' + my[i].title + '</td><td>' + my[i].subject + '</td><td>' + my[i].dueDate + (overdue ? ' <span class="badge badge-hard">Overdue</span>' : '') + '</td><td>' + my[i].questions.length + '</td><td><button onclick="startAssignmentQuiz(\'' + my[i].id + '\')" class="action-btn">Start Quiz</button></td></tr>';
        }
        c.innerHTML = h + '</tbody></table>';
    }

    function renderStudentResults() {
        var c = $("studentResultsList");
        if (!c) return;
        var user = Auth.getUser();
        refreshAttemptsFromFirestore(function() {
            var my = [];
            for (var i = 0; i < allAttempts.length; i++) {
                if (allAttempts[i].studentId === user.id) my.push(allAttempts[i]);
            }
            if (my.length === 0) { c.innerHTML = '<div class="empty-state"><h4>No results yet</h4><p>Complete a quiz to see your results here.</p></div>'; return; }
            my.sort(function(a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });
            var h = '<table class="history-table"><thead><tr><th>Date</th><th>Subject</th><th>Type</th><th>Score</th><th>%</th><th>Time</th></tr></thead><tbody>';
            for (var i = 0; i < my.length; i++) {
                var d = new Date(my[i].timestamp);
                var ts = my[i].timeSpent ? Math.floor(my[i].timeSpent / 60) + ":" + (my[i].timeSpent % 60 < 10 ? "0" : "") + (my[i].timeSpent % 60) : "-";
                var cls = my[i].percentage >= 70 ? "color:var(--success)" : my[i].percentage >= 50 ? "color:var(--accent)" : "color:var(--error)";
                var modeLabel = "Practice";
                if (my[i].mode === "assignment") modeLabel = "Assignment";
                else if (my[i].mode === "random") modeLabel = "Random Quiz";
                else if (my[i].mode === "quick") modeLabel = "Quick Practice";
                else if (my[i].mode === "chapter") modeLabel = "Chapter Test";
                else if (my[i].mode === "fullbook") modeLabel = "Full Book Test";
                else if (my[i].mode === "weak") modeLabel = "Weak Areas";
                var badge = modeLabel === "Assignment" ? ' <span class="badge badge-hard">Assignment</span>' : "";
                h += '<tr><td>' + d.toLocaleDateString() + '</td><td>' + my[i].subject + '</td><td>' + modeLabel + badge + '</td><td>' + my[i].score + '/' + my[i].total + '</td><td style="' + cls + ';font-weight:700;">' + my[i].percentage + '%</td><td>' + ts + '</td></tr>';
            }
            c.innerHTML = h + '</tbody></table>';
        });
    }

    function renderStudentProgress() {
        var c = $("studentProgressContent");
        if (!c) return;
        var user = Auth.getUser();
        var my = [];
        for (var i = 0; i < allAttempts.length; i++) {
            if (allAttempts[i].studentId === user.id) my.push(allAttempts[i]);
        }
        if (my.length === 0) { c.innerHTML = '<div class="empty-state"><h4>No progress data yet</h4><p>Complete a quiz to see your progress here.</p></div>'; return; }
        var avg = 0, best = 0, totalQ = 0;
        for (var i = 0; i < my.length; i++) { avg += my[i].percentage; if (my[i].percentage > best) best = my[i].percentage; totalQ += my[i].total; }
        avg = avg / my.length;
        var h = '<div class="analytics-grid">' +
            '<div class="analytics-card"><h4>Total Quizzes</h4><div class="analytics-value">' + my.length + '</div></div>' +
            '<div class="analytics-card"><h4>Average Score</h4><div class="analytics-value">' + avg.toFixed(0) + '%</div></div>' +
            '<div class="analytics-card"><h4>Best Score</h4><div class="analytics-value">' + best.toFixed(0) + '%</div></div>' +
            '<div class="analytics-card"><h4>Questions Done</h4><div class="analytics-value">' + totalQ + '</div></div>' +
            '</div>';
        var subs = {};
        for (var i = 0; i < my.length; i++) {
            var s = my[i].subject;
            if (!subs[s]) subs[s] = { n: 0, sum: 0 };
            subs[s].n++; subs[s].sum += my[i].percentage;
        }
        h += '<div class="panel-card"><h3>&#128202; Performance by Subject</h3>';
        for (var s in subs) {
            var pct = Math.round(subs[s].sum / subs[s].n);
            var cls = pct >= 70 ? "good" : pct >= 50 ? "avg" : "bad";
            h += renderBar(s, pct, cls);
        }
        h += '</div>';
        var topics = {};
        for (var i = 0; i < my.length; i++) {
            var tp = my[i].topicPerformance || {};
            for (var t in tp) {
                if (!topics[t]) topics[t] = { correct: 0, total: 0 };
                topics[t].correct += tp[t].correct;
                topics[t].total += tp[t].total;
            }
        }
        if (Object.keys(topics).length > 0) {
            h += '<div class="panel-card"><h3>&#128200; Performance by Topic</h3>';
            var sorted = [];
            for (var t in topics) sorted.push({ name: t, pct: Math.round(topics[t].correct / topics[t].total * 100), correct: topics[t].correct, total: topics[t].total });
            sorted.sort(function(a, b) { return b.pct - a.pct; });
            for (var i = 0; i < sorted.length; i++) {
                var cls = sorted[i].pct >= 70 ? "good" : sorted[i].pct >= 50 ? "avg" : "bad";
                h += renderBar(sorted[i].name + " (" + sorted[i].correct + "/" + sorted[i].total + ")", sorted[i].pct, cls);
            }
            h += '</div>';
        }
        var uid = user.id;
        var concepts = [];
        for (var key in conceptStats) {
            if (key.indexOf(uid + "_") === 0) {
                var cs = conceptStats[key];
                concepts.push({ name: cs.topic, subject: cs.subject, pct: Math.round(cs.correct / cs.total * 100), correct: cs.correct, total: cs.total });
            }
        }
        if (concepts.length > 0) {
            concepts.sort(function(a, b) { return a.pct - b.pct; });
            var strong = [];
            var weak = [];
            for (var i = 0; i < concepts.length; i++) {
                if (concepts[i].pct >= 70) strong.push(concepts[i]);
                else if (concepts[i].total >= 2 && concepts[i].pct < 60) weak.push(concepts[i]);
            }
            if (weak.length > 0) {
                h += '<div class="panel-card" style="border-left:4px solid var(--error);"><h3>&#9888; Weak Areas (Focus Here)</h3>';
                for (var i = 0; i < Math.min(5, weak.length); i++) {
                    h += renderBar(weak[i].name + " — " + weak[i].subject, weak[i].pct, "bad");
                }
                h += '</div>';
            }
            if (strong.length > 0) {
                h += '<div class="panel-card" style="border-left:4px solid var(--success);"><h3>&#9989; Strong Areas (Mastered)</h3>';
                for (var i = 0; i < Math.min(5, strong.length); i++) {
                    h += renderBar(strong[i].name + " — " + strong[i].subject, strong[i].pct, "good");
                }
                h += '</div>';
            }
        }
        h += '<div class="panel-card"><h3>&#128197; Recent Attempts</h3>';
        h += '<table class="history-table"><thead><tr><th>Date</th><th>Subject</th><th>Score</th><th>%</th><th>Time</th></tr></thead><tbody>';
        for (var i = my.length - 1; i >= Math.max(0, my.length - 10); i--) {
            var d = new Date(my[i].timestamp);
            var ts = my[i].timeSpent ? Math.floor(my[i].timeSpent / 60) + ":" + (my[i].timeSpent % 60 < 10 ? "0" : "") + (my[i].timeSpent % 60) : "-";
            h += '<tr><td>' + d.toLocaleDateString() + '</td><td>' + my[i].subject + '</td><td>' + my[i].score + '/' + my[i].total + '</td><td><strong>' + my[i].percentage + '%</strong></td><td>' + ts + '</td></tr>';
        }
        h += '</tbody></table></div>';
        c.innerHTML = h;
    }

    function renderBar(name, pct, cls) {
        var color = "var(--primary)";
        if (cls === "good") color = "var(--success)";
        else if (cls === "avg") color = "var(--accent)";
        else if (cls === "bad") color = "var(--error)";
        return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">' +
            '<div style="flex:0 0 120px;font-size:13px;text-align:right;">' + name + '</div>' +
            '<div style="flex:1;height:20px;background:var(--bg-tertiary,#e2e8f0);border-radius:10px;overflow:hidden;">' +
            '<div style="width:' + pct + '%;height:100%;background:' + color + ';border-radius:10px;transition:width 0.5s;"></div></div>' +
            '<div style="flex:0 0 40px;font-size:13px;font-weight:700;">' + pct + '%</div></div>';
    }

    function renderDonut(data, size) {
        size = size || 120;
        var total = 0;
        for (var i = 0; i < data.length; i++) total += data[i].value;
        if (total === 0) return "";
        var gradient = "";
        var angle = 0;
        for (var i = 0; i < data.length; i++) {
            var pct = (data[i].value / total) * 100;
            gradient += data[i].color + " " + angle + "% " + (angle + pct) + "%";
            angle += pct;
            if (i < data.length - 1) gradient += ", ";
        }
        return '<div class="donut-chart" style="width:' + size + 'px;height:' + size + 'px;background:conic-gradient(' + gradient + ');border-radius:50%;position:relative;">' +
            '<div style="position:absolute;top:25%;left:25%;width:50%;height:50%;background:var(--bg-card);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;">' + total + '</div></div>';
    }

    function renderSubjects() {
        var container = $("subjectGrid");
        if (!container) return;
        var html = "";
        var keys = Object.keys(subjectsData).sort();
        for (var i = 0; i < keys.length; i++) {
            var s = keys[i];
            var d = subjectsData[s];
            var qCount = 0;
            for (var j = 0; j < questions.length; j++) {
                if (questions[j].subject === s) qCount++;
            }
            html += '<div class="quiz-mode-card" onclick="showSubjectChapters(\'' + s.replace(/'/g, "\\'") + '\')">';
            html += '<div class="mode-icon">' + d.icon + '</div>';
            html += '<div class="mode-title">' + s + '</div>';
            html += '<div class="mode-desc">' + qCount + ' questions &bull; ' + d.chapters.length + ' chapters</div></div>';
        }
        container.innerHTML = html || "<p>No subjects available</p>";
    }

    function showSubjectChapters(subject) {
        $("subjectListView").style.display = "none";
        $("chapterListView").style.display = "block";
        $("chapterSubjectTitle").textContent = subject;
        var sData = subjectsData[subject];
        var html = "";
        if (sData && sData.chapters) {
            for (var i = 0; i < sData.chapters.length; i++) {
                var ch = sData.chapters[i];
                var qCount = 0;
                for (var j = 0; j < questions.length; j++) {
                    if (questions[j].subject === subject && questions[j].chapter == ch.num) qCount++;
                }
                html += '<div class="quiz-mode-card" onclick="showChapterQuizOptions(' + ch.num + ', \'' + subject.replace(/'/g, "\\'") + '\')">';
                html += '<div class="mode-title">Chapter ' + ch.num + ': ' + ch.title + '</div>';
                html += '<div class="mode-desc">' + qCount + ' questions &bull; ' + ch.topics.length + ' topics</div></div>';
            }
        } else {
            var chapters = {};
            for (var i = 0; i < questions.length; i++) {
                if (questions[i].subject === subject) {
                    var ch = questions[i].chapter;
                    if (!chapters[ch]) chapters[ch] = 0;
                    chapters[ch]++;
                }
            }
            var keys = Object.keys(chapters).sort(function(a, b) { return Number(a) - Number(b); });
            for (var i = 0; i < keys.length; i++) {
                html += '<div class="quiz-mode-card" onclick="showChapterQuizOptions(' + keys[i] + ', \'' + subject.replace(/'/g, "\\'") + '\')">';
                html += '<div class="mode-title">Chapter ' + keys[i] + '</div>';
                html += '<div class="mode-desc">' + chapters[keys[i]] + ' questions</div></div>';
            }
        }
        $("chapterGrid").innerHTML = html || "<p>No chapters available</p>";
        $("chapterGrid").style.display = "";
        $("chapterQuizOptions").style.display = "none";
    }

    function showSubjectList() {
        $("subjectListView").style.display = "block";
        $("chapterListView").style.display = "none";
    }

    function showChapterQuizOptions(chapterNum, subject) {
        var chapterQuestions = [];
        for (var i = 0; i < questions.length; i++) {
            if (questions[i].subject === subject && questions[i].chapter == chapterNum) {
                chapterQuestions.push(questions[i]);
            }
        }
        if (chapterQuestions.length === 0) { alert("No questions for this chapter."); return; }
        $("chapterGrid").style.display = "none";
        var panel = $("chapterQuizOptions");
        panel.style.display = "block";
        var topicCount = {};
        for (var i = 0; i < chapterQuestions.length; i++) {
            var t = chapterQuestions[i].topic || "General";
            if (!topicCount[t]) topicCount[t] = 0;
            topicCount[t]++;
        }
        var numTopics = Object.keys(topicCount).length;
        var html = '<button class="mode-back-btn" onclick="backToChapters()">&#8592; Back to Chapters</button>';
        html += '<h3>' + subject + ' — Chapter ' + chapterNum + '</h3>';
        html += '<p>' + chapterQuestions.length + ' questions &bull; ' + numTopics + ' topics</p>';
        html += '<div class="quiz-mode-grid">';
        html += '<div class="quiz-mode-card quiz-mode-random" onclick="launchRandomQuiz(' + chapterNum + ', \'' + subject.replace(/'/g, "\\'") + '\')">';
        html += '<div class="quiz-mode-icon">&#127922;</div>';
        html += '<h4>Random Quiz</h4>';
        html += '<p>' + Math.min(15, chapterQuestions.length) + ' questions &bull; 20 min<br>Mixed topics from this chapter</p>';
        html += '</div>';
        html += '<div class="quiz-mode-card" onclick="showTopicPicker(' + chapterNum + ', \'' + subject.replace(/'/g, "\\'") + '\')">';
        html += '<div class="quiz-mode-icon">&#9889;</div>';
        html += '<h4>Quick Practice</h4>';
        html += '<p>15 questions &bull; 20 min<br>Pick a topic to revise</p>';
        html += '</div>';
        html += '<div class="quiz-mode-card" onclick="launchChapterMode(' + chapterNum + ', \'' + subject.replace(/'/g, "\\'") + '\', \'test\')">';
        html += '<div class="quiz-mode-icon">&#128218;</div>';
        html += '<h4>Chapter Test</h4>';
        html += '<p>30 questions &bull; 40 min<br>67% straight + 33% scenario</p>';
        html += '</div>';
        html += '<div class="quiz-mode-card" onclick="launchChapterMode(' + chapterNum + ', \'' + subject.replace(/'/g, "\\'") + '\', \'weak\')">';
        html += '<div class="quiz-mode-icon">&#128200;</div>';
        html += '<h4>Weak Areas</h4>';
        html += '<p>Mistakes from this chapter<br>Fix your weak points</p>';
        html += '</div>';
        html += '</div>';
        panel.innerHTML = html;
    }

    function backToChapters() {
        $("chapterGrid").style.display = "";
        $("chapterQuizOptions").style.display = "none";
    }

    function showTopicPicker(chapterNum, subject) {
        var chapterQuestions = [];
        for (var i = 0; i < questions.length; i++) {
            if (questions[i].subject === subject && questions[i].chapter == chapterNum) {
                chapterQuestions.push(questions[i]);
            }
        }
        var topics = {};
        for (var i = 0; i < chapterQuestions.length; i++) {
            var t = chapterQuestions[i].topic || "General";
            if (!topics[t]) topics[t] = 0;
            topics[t]++;
        }
        var panel = $("chapterQuizOptions");
        var html = '<button class="mode-back-btn" onclick="showChapterQuizOptions(' + chapterNum + ', \'' + subject.replace(/'/g, "\\'") + '\')">&#8592; Back to Modes</button>';
        html += '<h3>&#9889; Quick Practice — Pick a Topic</h3>';
        html += '<p>Choose a topic from Chapter ' + chapterNum + '</p>';
        html += '<div class="quiz-mode-grid">';
        var topicKeys = Object.keys(topics).sort();
        for (var i = 0; i < topicKeys.length; i++) {
            html += '<div class="quiz-mode-card" onclick="launchTopicPractice(' + chapterNum + ', \'' + subject.replace(/'/g, "\\'") + '\', \'' + topicKeys[i].replace(/'/g, "\\'") + '\')">';
            html += '<div class="mode-title">' + topicKeys[i] + '</div>';
            html += '<div class="mode-desc">' + topics[topicKeys[i]] + ' questions</div></div>';
        }
        html += '<div class="quiz-mode-card" onclick="launchTopicPractice(' + chapterNum + ', \'' + subject.replace(/'/g, "\\'") + '\', \'all\')">';
        html += '<div class="mode-title">All Topics</div>';
        html += '<div class="mode-desc">' + chapterQuestions.length + ' questions</div></div>';
        html += '</div>';
        panel.innerHTML = html;
    }

    function launchTopicPractice(chapterNum, subject, topic) {
        var filtered = [];
        for (var i = 0; i < questions.length; i++) {
            var q = questions[i];
            if (q.subject === subject && q.chapter == chapterNum && (topic === "all" || q.topic === topic)) {
                filtered.push(q);
            }
        }
        if (filtered.length === 0) { alert("No questions available."); return; }
        var count = Math.min(15, filtered.length);
        var selected = shuffleArray(filtered).slice(0, count);
        startQuizUI(selected, 20, "practice", subject, chapterNum);
    }

    function launchChapterMode(chapterNum, subject, mode) {
        var filtered = [];
        for (var i = 0; i < questions.length; i++) {
            if (questions[i].subject === subject && questions[i].chapter == chapterNum) {
                filtered.push(questions[i]);
            }
        }
        if (filtered.length === 0) { alert("No questions available for this chapter."); return; }
        var count, time;
        if (mode === "test") {
            count = Math.min(30, filtered.length);
            time = 40;
        } else if (mode === "weak") {
            var weak = getWeakQuestions();
            var chapterWeak = [];
            for (var i = 0; i < weak.length; i++) {
                if (weak[i].subject === subject && weak[i].chapter == chapterNum) chapterWeak.push(weak[i]);
            }
            if (chapterWeak.length === 0) { alert("No weak areas found for this chapter. Complete some quizzes first!"); return; }
            count = Math.min(15, chapterWeak.length);
            time = 20;
            filtered = chapterWeak;
        } else {
            count = Math.min(15, filtered.length);
            time = 20;
        }
        var selected = balancedSelect(filtered, count);
        startQuizUI(selected, time, mode, subject, chapterNum);
    }

    function balancedSelect(pool, count) {
        var straight = [];
        var scenario = [];
        for (var i = 0; i < pool.length; i++) {
            if (pool[i].mode === "scenario") scenario.push(pool[i]);
            else straight.push(pool[i]);
        }
        straight = shuffleArray(straight);
        scenario = shuffleArray(scenario);
        var straightCount = Math.round(count * 0.6667);
        var scenarioCount = count - straightCount;
        var result = [];
        for (var i = 0; i < straightCount && i < straight.length; i++) result.push(straight[i]);
        for (var i = 0; i < scenarioCount && i < scenario.length; i++) result.push(scenario[i]);
        var remaining = count - result.length;
        if (remaining > 0) {
            var used = {};
            for (var i = 0; i < result.length; i++) used[result[i].id] = true;
            for (var i = 0; i < pool.length && remaining > 0; i++) {
                if (!used[pool[i].id]) { result.push(pool[i]); remaining--; }
            }
        }
        return shuffleArray(result);
    }

    function getWeakQuestions() {
        var wrongIds = {};
        for (var i = 0; i < allAttempts.length; i++) {
            var a = allAttempts[i];
            if (a.questions && a.questions.length) {
                for (var j = 0; j < a.questions.length; j++) {
                    if (a.questions[j].correct === false) wrongIds[a.questions[j].questionId] = true;
                }
            }
        }
        var weak = [];
        for (var i = 0; i < questions.length; i++) {
            if (wrongIds[questions[i].id]) weak.push(questions[i]);
        }
        return weak;
    }

    function showModeDetail(mode) {
        var panel = $("modeDetailPanel");
        if (!panel) return;
        var html = "";
        if (mode === "quick") {
            html = '<div class="mode-detail">';
            html += '<h4>&#9889; Quick Practice</h4>';
            html += '<p class="mode-desc">Fast revision session. Pick a subject or do all.</p>';
            html += '<div class="mode-info">';
            html += '<div class="mode-info-item"><strong>10</strong> questions</div>';
            html += '<div class="mode-info-item"><strong>15 min</strong> time limit</div>';
            html += '<div class="mode-info-item">Instant feedback</div>';
            html += '</div>';
            html += '<div class="mode-subject-select"><label>Subject</label>';
            html += '<select id="quickSubject"><option value="all">All Subjects</option>';
            var subs = {};
            for (var i = 0; i < questions.length; i++) {
                var s = questions[i].subject;
                if (!subs[s]) subs[s] = 0;
                subs[s]++;
            }
            var skeys = Object.keys(subs).sort();
            for (var i = 0; i < skeys.length; i++) {
                html += '<option value="' + skeys[i] + '">' + skeys[i] + ' (' + subs[skeys[i]] + ')</option>';
            }
            html += '</select></div>';
            html += '<button class="mode-start-btn" onclick="launchQuickPractice()">Start Practice</button>';
            html += '<button class="mode-back-btn" onclick="hideModeDetail()">Back</button>';
            html += '</div>';
        } else if (mode === "chapter") {
            var subjectCounts = {};
            for (var i = 0; i < questions.length; i++) {
                var s = questions[i].subject;
                subjectCounts[s] = (subjectCounts[s] || 0) + 1;
            }
            html = '<div class="mode-detail">';
            html += '<h4>&#128218; Chapter Test</h4>';
            html += '<p class="mode-desc">Assessment covering one full subject. Balanced topic coverage.</p>';
            html += '<div class="mode-info">';
            html += '<div class="mode-info-item"><strong>30</strong> questions</div>';
            html += '<div class="mode-info-item"><strong>40 min</strong> time limit</div>';
            html += '<div class="mode-info-item">Score + review</div>';
            html += '</div>';
            html += '<div class="mode-subject-select"><label>Select Subject</label>';
            html += '<select id="chapterSubject">';
            var skeys = Object.keys(subjectCounts).sort();
            for (var i = 0; i < skeys.length; i++) {
                html += '<option value="' + skeys[i] + '">' + skeys[i] + ' (' + subjectCounts[skeys[i]] + ')</option>';
            }
            html += '</select></div>';
            html += '<button class="mode-start-btn" onclick="launchChapterTest()">Start Test</button>';
            html += '<button class="mode-back-btn" onclick="hideModeDetail()">Back</button>';
            html += '</div>';
        } else if (mode === "fullbook") {
            var total = questions.length;
            html = '<div class="mode-detail">';
            html += '<h4>&#128214; Full Book Test</h4>';
            html += '<p class="mode-desc">Comprehensive exam. All chapters, balanced difficulty.</p>';
            html += '<div class="mode-info">';
            html += '<div class="mode-info-item"><strong>50</strong> questions</div>';
            html += '<div class="mode-info-item"><strong>60 min</strong> time limit</div>';
            html += '<div class="mode-info-item">Full review + weak analysis</div>';
            html += '</div>';
            html += '<button class="mode-start-btn" onclick="launchFullBookTest()">Start Test</button>';
            html += '<button class="mode-back-btn" onclick="hideModeDetail()">Back</button>';
            html += '</div>';
        } else if (mode === "weak") {
            var weakCount = getWeakQuestions().length;
            html = '<div class="mode-detail">';
            html += '<h4>&#128200; Weak Areas</h4>';
            html += '<p class="mode-desc">Questions you got wrong before. Focus on improvement.</p>';
            html += '<div class="mode-info">';
            html += '<div class="mode-info-item"><strong>' + Math.min(10, weakCount) + '</strong> questions</div>';
            html += '<div class="mode-info-item"><strong>15 min</strong> time limit</div>';
            html += '<div class="mode-info-item">Targeted practice</div>';
            html += '</div>';
            html += '<button class="mode-start-btn" onclick="launchWeakPractice()">Start Practice</button>';
            html += '<button class="mode-back-btn" onclick="hideModeDetail()">Back</button>';
            html += '</div>';
        }
        panel.innerHTML = html;
        panel.style.display = "block";
    }

    function hideModeDetail() {
        var panel = $("modeDetailPanel");
        if (panel) panel.style.display = "none";
    }

    function launchQuickPractice() {
        var sel = $("quickSubject");
        var f = sel ? sel.value : "all";
        var filtered = [];
        for (var i = 0; i < questions.length; i++) {
            if (f === "all" || questions[i].subject === f) filtered.push(questions[i]);
        }
        if (filtered.length < 5) { alert("Not enough questions. Need at least 5."); return; }
        var selected = shuffleArray(filtered).slice(0, Math.min(10, filtered.length));
        startQuizUI(selected, 15, "quick", f, "all");
    }

    function launchChapterTest() {
        var sel = $("chapterSubject");
        var subject = sel ? sel.value : "Computer Science";
        var filtered = [];
        for (var i = 0; i < questions.length; i++) {
            if (questions[i].subject === subject) filtered.push(questions[i]);
        }
        if (filtered.length < 10) { alert("Not enough questions for this subject. Need at least 10."); return; }
        var selected = balancedSelect(filtered, Math.min(30, filtered.length));
        startQuizUI(selected, 40, "chapter", subject, "all");
    }

    function launchFullBookTest() {
        if (questions.length < 20) { alert("Not enough questions. Need at least 20."); return; }
        var selected = balancedSelect(questions, Math.min(50, questions.length));
        startQuizUI(selected, 60, "fullbook", "all", "all");
    }

    function launchWeakPractice() {
        var weak = getWeakQuestions();
        if (weak.length === 0) { alert("No weak areas found. Complete some quizzes first!"); return; }
        var selected = shuffleArray(weak).slice(0, Math.min(10, weak.length));
        startQuizUI(selected, 15, "weak", "all", "all");
    }

    function launchRandomQuiz(chapterNum, subject) {
        var filtered = [];
        for (var i = 0; i < questions.length; i++) {
            if (questions[i].subject === subject && questions[i].chapter == chapterNum) filtered.push(questions[i]);
        }
        if (filtered.length === 0) { alert("No questions available for this chapter."); return; }
        var byTopic = {};
        for (var i = 0; i < filtered.length; i++) {
            var t = filtered[i].topic || "General";
            if (!byTopic[t]) byTopic[t] = [];
            byTopic[t].push(filtered[i]);
        }
        var topicKeys = Object.keys(byTopic);
        var count = Math.min(15, filtered.length);
        var selected = [];
        var perTopic = Math.max(1, Math.floor(count / topicKeys.length));
        for (var i = 0; i < topicKeys.length && selected.length < count; i++) {
            var pool = shuffleArray(byTopic[topicKeys[i]]);
            var take = Math.min(perTopic, pool.length, count - selected.length);
            for (var j = 0; j < take; j++) selected.push(pool[j]);
        }
        if (selected.length < count) {
            var remaining = [];
            var used = {};
            for (var i = 0; i < selected.length; i++) used[selected[i].id] = true;
            for (var i = 0; i < filtered.length; i++) {
                if (!used[filtered[i].id]) remaining.push(filtered[i]);
            }
            remaining = shuffleArray(remaining);
            while (selected.length < count && remaining.length > 0) selected.push(remaining.shift());
        }
        selected = shuffleArray(selected);
        startQuizUI(selected, 20, "random", subject, chapterNum);
    }

    function startQuizUI(selected, timeMinutes, mode, subject, chapter, aId) {
        QuizEngine.startQuiz(selected, mode, subject || "all", chapter || "all", aId || "");
        QuizEngine.setTimerMinutes(timeMinutes);
        $("loginPage").style.display = "none";
        $("studentDashboard").style.display = "none";
        $("quiz").style.display = "block";
        $("result").style.display = "none";
        $("review").style.display = "none";
        $("homeBtn").style.display = "inline-block";
        QuizEngine.displayQuestion();
        QuizEngine.startTimer();
    }

    function launchQuiz(subject, chapter, topic, count) {
        var qs = [];
        if (topic === "all") {
            qs = getQuestionsByChapter(subject, chapter);
        } else {
            qs = getQuestionsByTopic(subject, chapter, topic);
        }
        if (qs.length === 0) { alert("No questions available"); return; }
        qs = shuffleArray(qs);
        if (count && qs.length > count) qs = qs.slice(0, count);
        startQuizUI(qs, 20, "practice", subject, chapter);
    }

    function startPractice() {
        var el = $("practiceSubject");
        var f = el ? el.value : "all";
        var filtered = [];
        for (var i = 0; i < questions.length; i++) {
            if (f === "all" || questions[i].subject === f) filtered.push(questions[i]);
        }
        if (filtered.length === 0) { alert("No questions available for this subject."); return; }
        startQuizUI(shuffleArray(filtered), 60, "practice", f, "all");
    }

    function startAssignmentQuiz(aid) {
        var a = null;
        for (var i = 0; i < assignments.length; i++) { if (assignments[i].id === aid) { a = assignments[i]; break; } }
        if (!a || a.questions.length === 0) { alert("This assignment has no questions."); return; }
        var activeQuizQuestions = [];
        for (var i = 0; i < a.questions.length; i++) {
            for (var j = 0; j < questions.length; j++) {
                if (questions[j].id === a.questions[i]) { activeQuizQuestions.push(questions[j]); break; }
            }
        }
        activeQuizQuestions = shuffleArray(activeQuizQuestions);
        if (activeQuizQuestions.length === 0) { alert("Assignment questions not found."); return; }
        startQuizUI(activeQuizQuestions, 60, "assignment", a.subject, "all", aid);
    }

    function showTeacherTab(tab) {
        var map = { classes: 0, questionbank: 1, assignments: 2, analytics: 3 };
        var ids = ["teacherClassesTab", "teacherQuestionBankTab", "teacherAssignmentsTab", "teacherAnalyticsTab"];
        for (var i = 0; i < ids.length; i++) { var el = $(ids[i]); if (el) el.style.display = "none"; }
        activateTab("#teacherDashboard", map[tab]);
        if (tab === "classes") { $("teacherClassesTab").style.display = "block"; renderClasses(); }
        else if (tab === "questionbank") {
            $("teacherQuestionBankTab").style.display = "block";
            var user = Auth.getUser();
            var mySubjects = (user && user.subjects) ? user.subjects : (user && user.subject ? [user.subject] : []);
            var sel = $("qbFilterSubject");
            if (mySubjects.length === 1) {
                sel.value = mySubjects[0];
            } else if (mySubjects.length > 1) {
                var opts = sel.options;
                for (var i = 1; i < opts.length; i++) {
                    opts[i].style.display = mySubjects.indexOf(opts[i].value) !== -1 ? "" : "none";
                }
            }
            renderQuestions();
        }
        else if (tab === "assignments") { $("teacherAssignmentsTab").style.display = "block"; renderAssignments(); }
        else if (tab === "analytics") { $("teacherAnalyticsTab").style.display = "block"; populateAnalyticsClassSelect(); }
    }

    function populateAnalyticsClassSelect() {
        var sel = $("analyticsClassSelect");
        if (!sel) return;
        var user = Auth.getUser();
        var myClassIds = (user && user.classes) ? user.classes : [];
        sel.innerHTML = '<option value="">Select a class</option>';
        for (var i = 0; i < classes.length; i++) {
            if (myClassIds.length === 0 || myClassIds.indexOf(classes[i].id) !== -1) {
                sel.innerHTML += '<option value="' + classes[i].id + '">' + classes[i].name + '</option>';
            }
        }
    }

    function renderClasses() {
        var c = $("classesList");
        if (!c) return;
        var user = Auth.getUser();
        var myClassIds = (user && user.classes) ? user.classes : [];
        var myClasses = [];
        for (var i = 0; i < classes.length; i++) {
            if (myClassIds.length === 0 || myClassIds.indexOf(classes[i].id) !== -1) myClasses.push(classes[i]);
        }
        if (myClasses.length === 0) { c.innerHTML = "<p>No classes assigned to you.</p>"; return; }
        var totalStudents = 0;
        var totalAttempts = 0;
        var avg = 0;
        for (var i = 0; i < myClasses.length; i++) {
            for (var j = 0; j < studentAccounts.length; j++) {
                if (studentAccounts[j].classId === myClasses[i].id) totalStudents++;
            }
        }
        for (var i = 0; i < allAttempts.length; i++) {
            var isMyClass = false;
            for (var j = 0; j < studentAccounts.length; j++) {
                if (studentAccounts[j].id === allAttempts[i].studentId && myClassIds.indexOf(studentAccounts[j].classId) !== -1) { isMyClass = true; break; }
            }
            if (isMyClass) { totalAttempts++; avg += allAttempts[i].percentage; }
        }
        avg = totalAttempts > 0 ? avg / totalAttempts : 0;
        var h = '<div class="overview-cards">' +
            '<div class="overview-card classes"><div class="card-icon">&#127979;</div><div class="card-value">' + myClasses.length + '</div><div class="card-label">My Classes</div></div>' +
            '<div class="overview-card students"><div class="card-icon">&#128100;</div><div class="card-value">' + totalStudents + '</div><div class="card-label">Students</div></div>' +
            '<div class="overview-card quizzes"><div class="card-icon">&#128221;</div><div class="card-value">' + totalAttempts + '</div><div class="card-label">Quizzes Taken</div></div>' +
            '<div class="overview-card average"><div class="card-icon">&#128200;</div><div class="card-value">' + avg.toFixed(0) + '%</div><div class="card-label">Average Score</div></div>' +
            '</div>';
        h += '<table><thead><tr><th>Class</th><th>Grade</th><th>Section</th><th>Students</th></tr></thead><tbody>';
        for (var i = 0; i < myClasses.length; i++) {
            var cl = myClasses[i];
            var count = 0;
            for (var j = 0; j < studentAccounts.length; j++) {
                if (studentAccounts[j].classId === cl.id) count++;
            }
            h += '<tr><td>' + cl.name + '</td><td>' + cl.grade + '</td><td>' + cl.section + '</td><td>' + count + '</td></tr>';
        }
        c.innerHTML = h + '</tbody></table>';
    }

    function editClass(cid) {
        var cl = null;
        for (var i = 0; i < classes.length; i++) { if (classes[i].id === cid) { cl = classes[i]; break; } }
        if (!cl) return;
        $("cmClassId").value = cl.id;
        $("cmName").value = cl.name;
        $("cmGrade").value = cl.grade;
        $("cmSection").value = cl.section;
        $("cmStudents").value = cl.students ? cl.students.join("\n") : "";
        $("classModalTitle").textContent = "Edit Class";
        $("classModal").classList.add("active");
        $("modalOverlay").classList.add("active");
    }

    function deleteClass(cid) {
        if (!confirm("Delete this class?")) return;
        classes = classes.filter(function(c) { return c.id !== cid; });
        saveAll(); renderClasses();
    }

    function showCreateClassModal() {
        $("classForm").reset();
        $("cmClassId").value = "";
        $("classModalTitle").textContent = "Create New Class";
        $("classModal").classList.add("active");
        $("modalOverlay").classList.add("active");
    }

    function saveClass(e) {
        e.preventDefault();
        var cid = $("cmClassId").value;
        var d = { id: cid || "CLASS-" + $("cmName").value.toUpperCase(), name: $("cmName").value, grade: parseInt($("cmGrade").value), section: $("cmSection").value, students: $("cmStudents").value.split("\n").filter(function(l) { return l.trim(); }) };
        if (cid) { for (var i = 0; i < classes.length; i++) { if (classes[i].id === cid) { classes[i] = d; break; } } }
        else classes.push(d);
        saveAll(); closeModal(); renderClasses();
    }

    function renderQuestions() {
        var c = $("questionsTable");
        if (!c) return;
        var user = Auth.getUser();
        var mySubjects = (user && user.subjects) ? user.subjects : (user && user.subject ? [user.subject] : []);
        var st = ($("qbSearch").value || "").toLowerCase();
        var fs = $("qbFilterSubject").value;
        var fc = $("qbFilterChapter").value;
        var ft = $("qbFilterTopic").value;
        var fg = $("qbFilterGrade").value;
        var chapters = {};
        var topics = {};
        var f = [];
        for (var i = 0; i < questions.length; i++) {
            var q = questions[i];
            var ok = true;
            if (mySubjects.length > 0 && mySubjects.indexOf(q.subject) === -1) ok = false;
            if (st && (q.text || q.question || "").toLowerCase().indexOf(st) === -1 && q.id.toLowerCase().indexOf(st) === -1) ok = false;
            if (fs && q.subject !== fs) ok = false;
            if (fc && q.chapter != parseInt(fc)) ok = false;
            if (ft && q.topic !== ft) ok = false;
            if (fg && q.grade !== parseInt(fg)) ok = false;
            if (ok) f.push(q);
            if (q.subject === (fs || (mySubjects.length === 1 ? mySubjects[0] : ""))) {
                if (q.chapter) chapters[q.chapter] = true;
                if (q.topic) topics[q.topic] = true;
            }
        }
        var chSelect = $("qbFilterChapter");
        var chVal = chSelect.value;
        var chHTML = '<option value="">All Chapters</option>';
        var chKeys = Object.keys(chapters).sort(function(a, b) { return Number(a) - Number(b); });
        for (var i = 0; i < chKeys.length; i++) {
            chHTML += '<option value="' + chKeys[i] + '"' + (chVal === chKeys[i] ? ' selected' : '') + '>Chapter ' + chKeys[i] + '</option>';
        }
        chSelect.innerHTML = chHTML;
        var tpSelect = $("qbFilterTopic");
        var tpVal = tpSelect.value;
        var tpHTML = '<option value="">All Topics</option>';
        var tpKeys = Object.keys(topics).sort();
        for (var i = 0; i < tpKeys.length; i++) {
            tpHTML += '<option value="' + tpKeys[i].replace(/"/g, '&quot;') + '"' + (tpVal === tpKeys[i] ? ' selected' : '') + '>' + tpKeys[i] + '</option>';
        }
        tpSelect.innerHTML = tpHTML;
        if (f.length === 0) { c.innerHTML = "<p>No questions found.</p>"; return; }
        var h = '<table><thead><tr><th>ID</th><th>Subject</th><th>Ch</th><th>Topic</th><th>Difficulty</th><th>Actions</th></tr></thead><tbody>';
        for (var i = 0; i < f.length; i++) {
            var q = f[i];
            h += '<tr><td>' + q.id + '</td><td>' + q.subject + '</td><td>' + q.chapter + '</td><td>' + q.topic + '</td><td>' + q.difficulty + '</td><td><button onclick="editQuestion(\'' + q.id + '\')" class="action-btn">Edit</button> <button onclick="deleteQuestion(\'' + q.id + '\')" class="action-btn danger">Delete</button></td></tr>';
        }
        c.innerHTML = h + '</tbody></table>';
    }

    function filterQuestions() { renderQuestions(); }

    function showAddQuestionModal() {
        $("questionForm").reset();
        $("qmQuestionId").value = "";
        $("qmModalTitle").textContent = "Add Question";
        $("questionModal").classList.add("active");
        $("modalOverlay").classList.add("active");
    }

    function editQuestion(qid) {
        var q = null;
        for (var i = 0; i < questions.length; i++) { if (questions[i].id === qid) { q = questions[i]; break; } }
        if (!q) return;
        $("qmQuestionId").value = q.id;
        $("qmSubject").value = q.subject;
        $("qmGrade").value = q.grade;
        $("qmChapter").value = q.chapter;
        $("qmTopic").value = q.topic;
        $("qmDifficulty").value = q.difficulty;
        $("qmText").value = q.text || q.question || "";
        $("qmExplanation").value = q.explanation || "";
        $("qmOptionA").value = q.options[0];
        $("qmOptionB").value = q.options[1];
        $("qmOptionC").value = q.options[2];
        $("qmOptionD").value = q.options[3];
        $("qmAnswer").value = q.answer;
        $("qmMedia").value = q.media || "";
        $("qmModalTitle").textContent = "Edit Question";
        $("questionModal").classList.add("active");
        $("modalOverlay").classList.add("active");
    }

    function deleteQuestion(qid) {
        if (!confirm("Delete this question?")) return;
        questions = questions.filter(function(q) { return q.id !== qid; });
        saveAll(); renderQuestions();
    }

    function saveQuestion(e) {
        e.preventDefault();
        var id = $("qmQuestionId").value;
        var d = { id: id || "Q-" + Date.now(), subject: $("qmSubject").value, grade: parseInt($("qmGrade").value), chapter: $("qmChapter").value, topic: $("qmTopic").value, type: "mcq", text: $("qmText").value, options: [$("qmOptionA").value, $("qmOptionB").value, $("qmOptionC").value, $("qmOptionD").value], answer: $("qmAnswer").value, explanation: $("qmExplanation").value, difficulty: $("qmDifficulty").value, media: $("qmMedia").value || null };
        if (id) { for (var i = 0; i < questions.length; i++) { if (questions[i].id === id) { questions[i] = d; break; } } }
        else questions.push(d);
        saveAll(); closeModal(); renderQuestions();
    }

    function renderAssignments() {
        var c = $("assignmentsList");
        if (!c) return;
        var user = Auth.getUser();
        var myClassIds = (user && user.classes) ? user.classes : [];
        var mySubjects = (user && user.subjects) ? user.subjects : [];
        var my = [];
        for (var i = 0; i < assignments.length; i++) {
            var matchClass = myClassIds.length === 0 || myClassIds.indexOf(assignments[i].classId) !== -1;
            var matchSub = mySubjects.length === 0 || mySubjects.indexOf(assignments[i].subject) !== -1;
            if (matchClass && matchSub) my.push(assignments[i]);
        }
        if (my.length === 0) { c.innerHTML = "<p>No assignments for your classes/subjects.</p>"; return; }
        var h = '<table><thead><tr><th>Title</th><th>Subject</th><th>Class</th><th>Due Date</th><th>Questions</th><th>Actions</th></tr></thead><tbody>';
        for (var i = 0; i < my.length; i++) {
            var a = my[i], cl = null;
            for (var j = 0; j < classes.length; j++) { if (classes[j].id === a.classId) { cl = classes[j]; break; } }
            h += '<tr><td>' + a.title + '</td><td>' + a.subject + '</td><td>' + (cl ? cl.name : "N/A") + '</td><td>' + a.dueDate + '</td><td>' + a.questions.length + '</td><td><button onclick="editAssignment(\'' + a.id + '\')" class="action-btn">Edit</button> <button onclick="showAssignmentStatus(\'' + a.id + '\')" class="action-btn">Status</button> <button onclick="deleteAssignment(\'' + a.id + '\')" class="action-btn danger">Delete</button></td></tr>';
        }
        c.innerHTML = h + '</tbody></table>';
    }

    function showAssignmentStatus(aid) {
        var panel = $("assignmentStatusPanel");
        if (!panel) return;
        refreshAttemptsFromFirestore(function() {
            var a = null;
            for (var i = 0; i < assignments.length; i++) { if (assignments[i].id === aid) { a = assignments[i]; break; } }
            if (!a) { panel.style.display = "none"; return; }
            var cl = null;
            for (var j = 0; j < classes.length; j++) { if (classes[j].id === a.classId) { cl = classes[j]; break; } }
            var classStudents = [];
            for (var i = 0; i < studentAccounts.length; i++) {
                if (studentAccounts[i].classId === a.classId) classStudents.push(studentAccounts[i]);
            }
            var attempted = {};
            for (var i = 0; i < allAttempts.length; i++) {
                var att = allAttempts[i];
                if (att.assignmentId === aid && att.studentId) attempted[att.studentId] = att;
            }
            var html = '<button class="mode-back-btn" onclick="hideAssignmentStatus()">&#8592; Back to Assignments</button>';
            html += '<h3>' + a.title + ' — ' + a.subject + '</h3>';
            html += '<p>Class: ' + (cl ? cl.name : "N/A") + ' &bull; Due: ' + a.dueDate + ' &bull; Questions: ' + a.questions.length + '</p>';
            html += '<div class="overview-cards">';
            html += '<div class="overview-card quizzes"><div class="card-icon">&#9989;</div><div class="card-value">' + Object.keys(attempted).length + '</div><div class="card-label">Attempted</div></div>';
            html += '<div class="overview-card students"><div class="card-icon">&#9203;</div><div class="card-value">' + Math.max(0, classStudents.length - Object.keys(attempted).length) + '</div><div class="card-label">Not Attempted</div></div>';
            html += '<div class="overview-card average"><div class="card-icon">&#128100;</div><div class="card-value">' + classStudents.length + '</div><div class="card-label">Total Students</div></div>';
            html += '</div>';
            html += '<table class="history-table"><thead><tr><th>Student</th><th>Status</th><th>Score</th><th>%</th><th>Date</th></tr></thead><tbody>';
            for (var i = 0; i < classStudents.length; i++) {
                var s = classStudents[i];
                var att = attempted[s.id];
                if (att) {
                    var cls = att.percentage >= 70 ? "color:var(--success)" : att.percentage >= 50 ? "color:var(--accent)" : "color:var(--error)";
                    html += '<tr><td>' + s.id + ' - ' + (s.name || "N/A") + '</td><td><span style="color:var(--success);">&#9989; Attempted</span></td><td>' + att.score + '/' + att.total + '</td><td style="' + cls + ';font-weight:700;">' + att.percentage + '%</td><td>' + new Date(att.timestamp).toLocaleDateString() + '</td></tr>';
                } else {
                    html += '<tr><td>' + s.id + ' - ' + (s.name || "N/A") + '</td><td><span style="color:var(--error);">&#9203; Not Attempted</span></td><td>-</td><td>-</td><td>-</td></tr>';
                }
            }
            html += '</tbody></table>';
            panel.innerHTML = html;
            panel.style.display = "block";
        });
    }

    function hideAssignmentStatus() {
        var panel = $("assignmentStatusPanel");
        if (panel) panel.style.display = "none";
    }

    function showCreateAssignmentModal() {
        $("assignmentForm").reset();
        $("amAssignmentId").value = "";
        $("amModalTitle").textContent = "Create Assignment";
        var user = Auth.getUser();
        var myClassIds = (user && user.classes) ? user.classes : [];
        var cs = $("amClass");
        cs.innerHTML = '<option value="">Select a class</option>';
        for (var i = 0; i < classes.length; i++) {
            if (myClassIds.length === 0 || myClassIds.indexOf(classes[i].id) !== -1) {
                cs.innerHTML += '<option value="' + classes[i].id + '">' + classes[i].name + '</option>';
            }
        }
        if (user && user.subjects && user.subjects.length === 1) {
            $("amSubject").value = user.subjects[0];
        } else if (user && user.subjects && user.subjects.length > 1) {
            var amSel = $("amSubject");
            for (var i = 0; i < amSel.options.length; i++) {
                amSel.options[i].style.display = user.subjects.indexOf(amSel.options[i].value) !== -1 ? "" : "none";
            }
        }
        updateAssignmentQuestionList();
        $("assignmentModal").classList.add("active");
        $("modalOverlay").classList.add("active");
    }

    function updateAssignmentQuestionList() {
        var c = $("amQuestionSelector");
        if (!c) return;
        var st = ($("amQSearch").value || "").toLowerCase();
        var sub = $("amSubject").value;
        var f = [];
        for (var i = 0; i < questions.length; i++) {
            var q = questions[i];
            var qtxt = (q.text || q.question || "").toLowerCase();
            if (q.subject === sub && (!st || qtxt.indexOf(st) !== -1 || q.id.toLowerCase().indexOf(st) !== -1)) f.push(q);
        }
        if (f.length === 0) { c.innerHTML = "<p>No questions found for this subject.</p>"; return; }
        var h = '<div class="question-select-list">';
        for (var i = 0; i < f.length; i++) {
            var txt = (f[i].text || f[i].question || "").substring(0, 60);
            h += '<label class="question-select-item"><input type="checkbox" class="am-q-checkbox" value="' + f[i].id + '"> <strong>' + f[i].id + '</strong> - ' + txt + '... (' + f[i].difficulty + ')</label>';
        }
        c.innerHTML = h + '</div>';
    }

    function editAssignment(aid) {
        var a = null;
        for (var i = 0; i < assignments.length; i++) { if (assignments[i].id === aid) { a = assignments[i]; break; } }
        if (!a) return;
        $("amAssignmentId").value = a.id;
        $("amTitleInput").value = a.title;
        $("amSubject").value = a.subject;
        $("amClass").value = a.classId;
        $("amDueDate").value = a.dueDate;
        $("amModalTitle").textContent = "Edit Assignment";
        var cs = $("amClass");
        cs.innerHTML = '<option value="">Select a class</option>';
        for (var i = 0; i < classes.length; i++) {
            cs.innerHTML += '<option value="' + classes[i].id + '">' + classes[i].name + '</option>';
        }
        cs.value = a.classId;
        updateAssignmentQuestionList();
        for (var i = 0; i < a.questions.length; i++) {
            var cbs = document.querySelectorAll('.am-q-checkbox');
            for (var j = 0; j < cbs.length; j++) { if (cbs[j].value === a.questions[i]) cbs[j].checked = true; }
        }
        $("assignmentModal").classList.add("active");
        $("modalOverlay").classList.add("active");
    }

    function deleteAssignment(aid) {
        if (!confirm("Delete this assignment?")) return;
        assignments = assignments.filter(function(a) { return a.id !== aid; });
        saveAll(); renderAssignments();
    }

    function saveAssignment(e) {
        e.preventDefault();
        var id = $("amAssignmentId").value;
        var sel = [];
        var cbs = document.querySelectorAll(".am-q-checkbox:checked");
        for (var i = 0; i < cbs.length; i++) sel.push(cbs[i].value);
        if (sel.length === 0) { alert("Please select at least one question."); return; }
        var d = { id: id || "ASSIGN-" + Date.now(), title: $("amTitleInput").value, subject: $("amSubject").value, classId: $("amClass").value, dueDate: $("amDueDate").value, questions: sel, createdBy: Auth.getUser() ? Auth.getUser().id : "unknown", createdAt: new Date().toISOString() };
        if (id) { for (var i = 0; i < assignments.length; i++) { if (assignments[i].id === id) { assignments[i] = d; break; } } }
        else assignments.push(d);
        saveAll(); closeModal(); renderAssignments();
    }

    function loadClassAnalytics() {
        var cid = $("analyticsClassSelect").value;
        var c = $("classAnalyticsContent");
        if (!c) return;
        if (!cid) { c.innerHTML = "<p>Select a class to view analytics.</p>"; return; }
        var cl = null;
        for (var i = 0; i < classes.length; i++) { if (classes[i].id === cid) { cl = classes[i]; break; } }
        if (!cl) return;
        refreshAttemptsFromFirestore(function() {
            var ca = [];
            for (var i = 0; i < allAttempts.length; i++) {
                var sId = allAttempts[i].studentId;
                for (var j = 0; j < studentAccounts.length; j++) {
                    if (studentAccounts[j].id === sId && studentAccounts[j].classId === cid) { ca.push(allAttempts[i]); break; }
                }
            }
            if (ca.length === 0) { c.innerHTML = '<div class="chart-section"><p style="color:var(--text-muted);text-align:center;padding:20px;">No quiz attempts for this class yet.</p></div>'; return; }
            var avg = 0; var best = 0;
            for (var i = 0; i < ca.length; i++) { avg += ca[i].percentage; if (ca[i].percentage > best) best = ca[i].percentage; }
            avg = avg / ca.length;
            var modeCounts = {};
            for (var i = 0; i < ca.length; i++) {
                var m = ca[i].mode || "practice";
                if (!modeCounts[m]) modeCounts[m] = 0;
                modeCounts[m]++;
            }
            var h = '<div class="overview-cards">' +
                '<div class="overview-card quizzes"><div class="card-icon">&#128221;</div><div class="card-value">' + ca.length + '</div><div class="card-label">Total Attempts</div></div>' +
                '<div class="overview-card average"><div class="card-icon">&#128200;</div><div class="card-value">' + avg.toFixed(0) + '%</div><div class="card-label">Average</div></div>' +
                '<div class="overview-card students"><div class="card-icon">&#127942;</div><div class="card-value">' + best + '%</div><div class="card-label">Best Score</div></div>' +
                '</div>';
            h += '<div class="chart-section"><h4>&#128202; Attempt Types</h4><div style="display:flex;gap:12px;flex-wrap:wrap;">';
            var modeLabels = { practice: "Practice", assignment: "Assignment", random: "Random Quiz", quick: "Quick Practice", chapter: "Chapter Test", fullbook: "Full Book Test", weak: "Weak Areas" };
            for (var m in modeCounts) {
                var label = modeLabels[m] || m;
                h += '<div style="background:var(--bg-tertiary,#e2e8f0);padding:8px 16px;border-radius:8px;font-size:13px;"><strong>' + modeCounts[m] + '</strong> ' + label + '</div>';
            }
            h += '</div></div>';
            var diffCount = { excellent: 0, good: 0, needs: 0 };
            for (var i = 0; i < ca.length; i++) {
                if (ca[i].percentage >= 80) diffCount.excellent++;
                else if (ca[i].percentage >= 50) diffCount.good++;
                else diffCount.needs++;
            }
            var total = diffCount.excellent + diffCount.good + diffCount.needs;
            var ePct = total > 0 ? (diffCount.excellent / total * 100) : 0;
            var gPct = total > 0 ? (diffCount.good / total * 100) : 0;
            h += '<div class="chart-section"><h4>&#128202; Results Distribution</h4><div class="donut-container">' +
                '<div class="donut-chart" style="background: conic-gradient(#10b981 0% ' + ePct + '%, #f59e0b ' + ePct + '% ' + (ePct + gPct) + '%, #ef4444 ' + (ePct + gPct) + '% 100%)">' +
                '<div class="donut-center"><span class="donut-value">' + total + '</span><span class="donut-label">Total</span></div></div>' +
                '<div class="donut-legend">' +
                '<div class="legend-item"><span class="legend-dot" style="background:#10b981"></span>Excellent (80%+): ' + diffCount.excellent + '</div>' +
                '<div class="legend-item"><span class="legend-dot" style="background:#f59e0b"></span>Good (50-79%): ' + diffCount.good + '</div>' +
                '<div class="legend-item"><span class="legend-dot" style="background:#ef4444"></span>Needs Work (&lt;50%): ' + diffCount.needs + '</div>' +
                '</div></div></div>';
            c.innerHTML = h;
        });
    }

    function showCTTab(tab) {
        var map = { overview: 0, students: 1, "cross-subject": 2 };
        var ids = ["ctOverviewTab", "ctStudentsTab", "ctCrossSubjectTab"];
        for (var i = 0; i < ids.length; i++) { var el = $(ids[i]); if (el) el.style.display = "none"; }
        activateTab("#classTeacherDashboard", map[tab]);
        if (tab === "overview") { $("ctOverviewTab").style.display = "block"; renderCTOverview(); }
        else if (tab === "students") { $("ctStudentsTab").style.display = "block"; renderCTStudents(); }
        else if (tab === "cross-subject") { $("ctCrossSubjectTab").style.display = "block"; renderCTCrossSubject(); }
    }

    function renderCTOverview() {
        var c = $("ctOverviewContent");
        if (!c) return;
        var user = Auth.getUser();
        var ctClassId = user ? user.classId : null;
        var ts = 0;
        var className = "All Classes";
        for (var i = 0; i < studentAccounts.length; i++) {
            if (!ctClassId || studentAccounts[i].classId === ctClassId) ts++;
        }
        if (ctClassId) {
            for (var i = 0; i < classes.length; i++) {
                if (classes[i].id === ctClassId) { className = classes[i].name; break; }
            }
        }
        refreshAttemptsFromFirestore(function() {
            var sa = [];
            for (var i = 0; i < allAttempts.length; i++) {
                if (ctClassId) {
                    var isClass = false;
                    for (var j = 0; j < studentAccounts.length; j++) {
                        if (studentAccounts[j].id === allAttempts[i].studentId && studentAccounts[j].classId === ctClassId) { isClass = true; break; }
                    }
                    if (isClass) sa.push(allAttempts[i]);
                } else {
                    sa.push(allAttempts[i]);
                }
            }
            var avg = sa.length > 0 ? sa.reduce(function(s, a) { return s + a.percentage; }, 0) / sa.length : 0;
            var best = sa.length > 0 ? Math.max.apply(null, sa.map(function(a) { return a.percentage; })) : 0;
            var modeCounts = {};
            for (var i = 0; i < sa.length; i++) {
                var m = sa[i].mode || "practice";
                if (!modeCounts[m]) modeCounts[m] = 0;
                modeCounts[m]++;
            }
            var h = '<div class="overview-cards">' +
                '<div class="overview-card classes"><div class="card-icon">&#127979;</div><div class="card-value">' + className + '</div><div class="card-label">Class</div></div>' +
                '<div class="overview-card students"><div class="card-icon">&#128100;</div><div class="card-value">' + ts + '</div><div class="card-label">Students</div></div>' +
                '<div class="overview-card quizzes"><div class="card-icon">&#128221;</div><div class="card-value">' + sa.length + '</div><div class="card-label">Attempts</div></div>' +
                '<div class="overview-card average"><div class="card-icon">&#128200;</div><div class="card-value">' + avg.toFixed(0) + '%</div><div class="card-label">Average</div></div>' +
                '<div class="overview-card questions"><div class="card-icon">&#127942;</div><div class="card-value">' + best + '%</div><div class="card-label">Best Score</div></div>' +
                '</div>';
            var modeLabels = { practice: "Practice", assignment: "Assignment", random: "Random Quiz", quick: "Quick Practice", chapter: "Chapter Test", fullbook: "Full Book Test", weak: "Weak Areas" };
            h += '<div class="chart-section"><h4>&#128202; Attempt Types</h4><div style="display:flex;gap:12px;flex-wrap:wrap;">';
            for (var m in modeCounts) {
                h += '<div style="background:var(--bg-tertiary,#e2e8f0);padding:8px 16px;border-radius:8px;font-size:13px;"><strong>' + modeCounts[m] + '</strong> ' + (modeLabels[m] || m) + '</div>';
            }
            h += '</div></div>';
            if (sa.length > 0) {
                var diffCount = { excellent: 0, good: 0, needs: 0 };
                for (var i = 0; i < sa.length; i++) {
                    if (sa[i].percentage >= 80) diffCount.excellent++;
                    else if (sa[i].percentage >= 50) diffCount.good++;
                    else diffCount.needs++;
                }
                var total = diffCount.excellent + diffCount.good + diffCount.needs;
                var ePct = total > 0 ? (diffCount.excellent / total * 100) : 0;
                var gPct = total > 0 ? (diffCount.good / total * 100) : 0;
                h += '<div class="chart-section"><h4>&#128202; Results Distribution</h4><div class="donut-container">' +
                    '<div class="donut-chart" style="background: conic-gradient(#10b981 0% ' + ePct + '%, #f59e0b ' + ePct + '% ' + (ePct + gPct) + '%, #ef4444 ' + (ePct + gPct) + '% 100%)">' +
                    '<div class="donut-center"><span class="donut-value">' + total + '</span><span class="donut-label">Total</span></div></div>' +
                    '<div class="donut-legend">' +
                    '<div class="legend-item"><span class="legend-dot" style="background:#10b981"></span>Excellent (80%+): ' + diffCount.excellent + '</div>' +
                    '<div class="legend-item"><span class="legend-dot" style="background:#f59e0b"></span>Good (50-79%): ' + diffCount.good + '</div>' +
                    '<div class="legend-item"><span class="legend-dot" style="background:#ef4444"></span>Needs Work (&lt;50%): ' + diffCount.needs + '</div>' +
                    '</div></div></div>';
            }
            c.innerHTML = h;
        });
    }

    function renderCTStudents() {
        var c = $("ctStudentsList");
        if (!c) return;
        var user = Auth.getUser();
        var ctClassId = user ? user.classId : null;
        var h = '<table><thead><tr><th>ID</th><th>Name</th><th>Father Name</th><th>Roll No</th><th>Attempts</th><th>Average</th><th>Actions</th></tr></thead><tbody>';
        var found = false;
        for (var i = 0; i < studentAccounts.length; i++) {
            var s = studentAccounts[i];
            if (ctClassId && s.classId !== ctClassId) continue;
            found = true;
            var sa = [];
            for (var k = 0; k < allAttempts.length; k++) { if (allAttempts[k].studentId === s.id) sa.push(allAttempts[k]); }
            var avg = sa.length > 0 ? sa.reduce(function(sum, a) { return sum + a.percentage; }, 0) / sa.length : 0;
            h += '<tr><td>' + s.id + '</td><td>' + s.name + '</td><td>' + (s.fatherName || "-") + '</td><td>' + (s.rollNo || "-") + '</td><td>' + sa.length + '</td><td>' + avg.toFixed(1) + '%</td>' +
                '<td><button onclick="editStudentAccount(\'' + s.id + '\')" class="action-btn">Edit</button> ' +
                '<button onclick="showStudentPassword(\'' + s.id + '\')" class="action-btn">Show Pass</button> ' +
                '<button onclick="deleteStudentAccount(\'' + s.id + '\')" class="action-btn danger">Delete</button></td></tr>';
        }
        if (!found) { c.innerHTML = "<p>No students in your class yet.</p>"; return; }
        c.innerHTML = h + '</tbody></table>';
    }

    function renderCTCrossSubject() {
        var c = $("ctCrossSubjectContent");
        if (!c) return;
        var user = Auth.getUser();
        var ctClassId = user ? user.classId : null;
        refreshAttemptsFromFirestore(function() {
            var sa = [];
            for (var i = 0; i < allAttempts.length; i++) {
                if (ctClassId) {
                    var isClass = false;
                    for (var j = 0; j < studentAccounts.length; j++) {
                        if (studentAccounts[j].id === allAttempts[i].studentId && studentAccounts[j].classId === ctClassId) { isClass = true; break; }
                    }
                    if (isClass) sa.push(allAttempts[i]);
                } else {
                    sa.push(allAttempts[i]);
                }
            }
            if (sa.length === 0) { c.innerHTML = "<p>No quiz data yet for your class.</p>"; return; }
            var bySubject = {};
            for (var i = 0; i < sa.length; i++) {
                var sub = sa[i].subject || "General";
                if (!bySubject[sub]) bySubject[sub] = { attempts: 0, totalPct: 0, best: 0, students: {}, modes: {} };
                bySubject[sub].attempts++;
                bySubject[sub].totalPct += sa[i].percentage;
                if (sa[i].percentage > bySubject[sub].best) bySubject[sub].best = sa[i].percentage;
                bySubject[sub].students[sa[i].studentId] = true;
                var m = sa[i].mode || "practice";
                if (!bySubject[sub].modes[m]) bySubject[sub].modes[m] = 0;
                bySubject[sub].modes[m]++;
            }
            var h = '<div class="overview-cards">';
            var totalAttempts = sa.length;
            var avgAll = 0;
            for (var i = 0; i < sa.length; i++) avgAll += sa[i].percentage;
            avgAll = sa.length > 0 ? (avgAll / sa.length).toFixed(0) : 0;
            var uniqueStudents = {};
            for (var i = 0; i < sa.length; i++) uniqueStudents[sa[i].studentId] = true;
            h += '<div class="overview-card quizzes"><div class="card-icon">&#128221;</div><div class="card-value">' + totalAttempts + '</div><div class="card-label">Total Attempts</div></div>';
            h += '<div class="overview-card average"><div class="card-icon">&#128200;</div><div class="card-value">' + avgAll + '%</div><div class="card-label">Class Average</div></div>';
            h += '<div class="overview-card students"><div class="card-icon">&#128100;</div><div class="card-value">' + Object.keys(uniqueStudents).length + '</div><div class="card-label">Active Students</div></div>';
            h += '</div>';
            h += '<div class="chart-section"><h4>&#128218; Performance by Subject</h4>';
            h += '<table class="history-table"><thead><tr><th>Subject</th><th>Avg %</th><th>Best %</th><th>Attempts</th><th>Students</th></tr></thead><tbody>';
            var subjects = Object.keys(bySubject).sort();
            for (var i = 0; i < subjects.length; i++) {
                var s = bySubject[subjects[i]];
                var avg = (s.totalPct / s.attempts).toFixed(1);
                var cls = avg >= 70 ? "color:var(--success)" : avg >= 50 ? "color:var(--accent)" : "color:var(--error)";
                h += '<tr><td><strong>' + subjects[i] + '</strong></td><td style="' + cls + ';font-weight:700;">' + avg + '%</td><td>' + s.best + '%</td><td>' + s.attempts + '</td><td>' + Object.keys(s.students).length + '</td></tr>';
            }
            h += '</tbody></table></div>';
            h += '<div class="chart-section"><h4>&#128202; Mode Breakdown Across Subjects</h4>';
            var modeLabels = { practice: "Practice", assignment: "Assignment", random: "Random Quiz", quick: "Quick Practice", chapter: "Chapter Test", fullbook: "Full Book Test", weak: "Weak Areas" };
            var globalModes = {};
            for (var i = 0; i < sa.length; i++) {
                var m = sa[i].mode || "practice";
                if (!globalModes[m]) globalModes[m] = 0;
                globalModes[m]++;
            }
            h += '<div style="display:flex;gap:12px;flex-wrap:wrap;">';
            for (var m in globalModes) {
                h += '<div style="background:var(--bg-tertiary,#e2e8f0);padding:8px 16px;border-radius:8px;font-size:13px;"><strong>' + globalModes[m] + '</strong> ' + (modeLabels[m] || m) + '</div>';
            }
            h += '</div></div>';
            var perStudent = {};
            for (var i = 0; i < sa.length; i++) {
                var sid = sa[i].studentId;
                if (!perStudent[sid]) perStudent[sid] = { name: sid, total: 0, sum: 0, subjects: {} };
                perStudent[sid].total++;
                perStudent[sid].sum += sa[i].percentage;
                var sub = sa[i].subject || "General";
                if (!perStudent[sid].subjects[sub]) perStudent[sid].subjects[sub] = { sum: 0, n: 0 };
                perStudent[sid].subjects[sub].sum += sa[i].percentage;
                perStudent[sid].subjects[sub].n++;
            }
            h += '<div class="chart-section"><h4>&#128100; Student Performance Summary</h4>';
            h += '<table class="history-table"><thead><tr><th>Student</th><th>Overall Avg</th><th>Attempts</th>';
            for (var i = 0; i < subjects.length; i++) h += '<th>' + subjects[i] + '</th>';
            h += '</tr></thead><tbody>';
            var sids = Object.keys(perStudent).sort();
            for (var i = 0; i < sids.length; i++) {
                var st = perStudent[sids[i]];
                var overallAvg = (st.sum / st.total).toFixed(0);
                var cls = overallAvg >= 70 ? "color:var(--success)" : overallAvg >= 50 ? "color:var(--accent)" : "color:var(--error)";
                h += '<tr><td><strong>' + sids[i] + '</strong></td><td style="' + cls + ';font-weight:700;">' + overallAvg + '%</td><td>' + st.total + '</td>';
                for (var j = 0; j < subjects.length; j++) {
                    var subData = st.subjects[subjects[j]];
                    if (subData) {
                        var subAvg = (subData.sum / subData.n).toFixed(0);
                        var subCls = subAvg >= 70 ? "color:var(--success)" : subAvg >= 50 ? "color:var(--accent)" : "color:var(--error)";
                        h += '<td style="' + subCls + ';">' + subAvg + '% (' + subData.n + ')</td>';
                    } else {
                        h += '<td style="color:var(--text-muted);">-</td>';
                    }
                }
                h += '</tr>';
            }
            h += '</tbody></table></div>';
            c.innerHTML = h;
        });
    }

    function renderCTAttendance() {
        var c = $("ctAttendanceContent");
        if (!c) return;
        c.innerHTML = '<p>Select a date and click "Mark Attendance" to record attendance.</p>';
    }

    function markAttendance() {
        var dl = $("attDate");
        if (dl) dl.value = new Date().toISOString().split("T")[0];
        var lc = $("attendanceStudentList");
        if (!lc) return;
        var h = "";
        for (var i = 0; i < studentAccounts.length; i++) {
            var s = studentAccounts[i];
            var className = "";
            for (var j = 0; j < classes.length; j++) {
                if (classes[j].id === s.classId) { className = classes[j].name; break; }
            }
            h += '<label class="attendance-item"><span>' + s.name + ' (' + className + ')</span><select class="att-status" data-student="' + s.id + '"><option value="present">Present</option><option value="absent">Absent</option><option value="late">Late</option></select></label>';
        }
        lc.innerHTML = h;
        $("attendanceModal").classList.add("active");
        $("modalOverlay").classList.add("active");
    }

    function saveAttendance(e) {
        e.preventDefault();
        var date = $("attDate").value;
        var rec = {};
        var sels = document.querySelectorAll(".att-status");
        for (var i = 0; i < sels.length; i++) rec[sels[i].dataset.student] = sels[i].value;
        var found = false;
        for (var i = 0; i < attendance.length; i++) { if (attendance[i].date === date) { attendance[i].records = rec; found = true; break; } }
        if (!found) attendance.push({ date: date, records: rec });
        saveAll(); closeModal(); renderCTAttendance();
    }

    function showParentTab(tab) {
        var map = { progress: 0, assignments: 1, results: 2, attendance: 3 };
        var ids = ["parentProgressTab", "parentAssignmentsTab", "parentResultsTab", "parentAttendanceTab"];
        for (var i = 0; i < ids.length; i++) { var el = $(ids[i]); if (el) el.style.display = "none"; }
        activateTab("#parentDashboard", map[tab]);
        if (tab === "progress") { $("parentProgressTab").style.display = "block"; renderParentProgress(); }
        else if (tab === "assignments") { $("parentAssignmentsTab").style.display = "block"; renderParentAssignments(); }
        else if (tab === "results") { $("parentResultsTab").style.display = "block"; renderParentResults(); }
        else if (tab === "attendance") { $("parentAttendanceTab").style.display = "block"; renderParentAttendance(); }
    }

    function renderParentProgress() {
        var c = $("parentProgressContent");
        if (!c) return;
        var user = Auth.getUser();
        var childId = user ? user.childId : null;
        var my = [];
        for (var i = 0; i < allAttempts.length; i++) { if (allAttempts[i].studentId === childId) my.push(allAttempts[i]); }
        if (my.length === 0) { c.innerHTML = '<div class="empty-state"><h4>No progress data yet</h4><p>Your child hasn\'t completed any quizzes yet.</p></div>'; return; }
        var avg = 0, best = 0, totalQ = 0;
        for (var i = 0; i < my.length; i++) { avg += my[i].percentage; if (my[i].percentage > best) best = my[i].percentage; totalQ += my[i].total; }
        avg = avg / my.length;
        var h = '<div class="analytics-grid">' +
            '<div class="analytics-card"><h4>Total Quizzes</h4><div class="analytics-value">' + my.length + '</div></div>' +
            '<div class="analytics-card"><h4>Average Score</h4><div class="analytics-value">' + avg.toFixed(0) + '%</div></div>' +
            '<div class="analytics-card"><h4>Best Score</h4><div class="analytics-value">' + best.toFixed(0) + '%</div></div>' +
            '<div class="analytics-card"><h4>Questions Done</h4><div class="analytics-value">' + totalQ + '</div></div>' +
            '</div>';
        var subs = {};
        for (var i = 0; i < my.length; i++) {
            var s = my[i].subject;
            if (!subs[s]) subs[s] = { n: 0, sum: 0 };
            subs[s].n++; subs[s].sum += my[i].percentage;
        }
        h += '<div class="panel-card"><h3>&#128202; Performance by Subject</h3>';
        for (var s in subs) {
            var pct = Math.round(subs[s].sum / subs[s].n);
            var cls = pct >= 70 ? "good" : pct >= 50 ? "avg" : "bad";
            h += renderBar(s, pct, cls);
        }
        h += '</div>';
        var topics = {};
        for (var i = 0; i < my.length; i++) {
            var tp = my[i].topicPerformance || {};
            for (var t in tp) {
                if (!topics[t]) topics[t] = { correct: 0, total: 0 };
                topics[t].correct += tp[t].correct;
                topics[t].total += tp[t].total;
            }
        }
        if (Object.keys(topics).length > 0) {
            h += '<div class="panel-card"><h3>&#128200; Performance by Topic</h3>';
            var sorted = [];
            for (var t in topics) sorted.push({ name: t, pct: Math.round(topics[t].correct / topics[t].total * 100), correct: topics[t].correct, total: topics[t].total });
            sorted.sort(function(a, b) { return b.pct - a.pct; });
            for (var i = 0; i < sorted.length; i++) {
                var cls = sorted[i].pct >= 70 ? "good" : sorted[i].pct >= 50 ? "avg" : "bad";
                h += renderBar(sorted[i].name + " (" + sorted[i].correct + "/" + sorted[i].total + ")", sorted[i].pct, cls);
            }
            h += '</div>';
        }
        h += '<div class="panel-card"><h3>&#128197; Recent Attempts</h3>';
        h += '<table class="history-table"><thead><tr><th>Date</th><th>Subject</th><th>Score</th><th>%</th></tr></thead><tbody>';
        for (var i = my.length - 1; i >= Math.max(0, my.length - 10); i--) {
            var d = new Date(my[i].timestamp);
            h += '<tr><td>' + d.toLocaleDateString() + '</td><td>' + my[i].subject + '</td><td>' + my[i].score + '/' + my[i].total + '</td><td><strong>' + my[i].percentage + '%</strong></td></tr>';
        }
        h += '</tbody></table></div>';
        c.innerHTML = h;
    }

    function renderParentAssignments() {
        var c = $("parentAssignmentsContent");
        if (!c) return;
        var user = Auth.getUser();
        var childId = user ? user.childId : null;
        var sc = null;
        for (var i = 0; i < classes.length; i++) {
            for (var j = 0; j < studentAccounts.length; j++) {
                if (studentAccounts[j].id === childId && studentAccounts[j].classId === classes[i].id) { sc = classes[i]; break; }
            }
            if (sc) break;
        }
        if (!sc) { c.innerHTML = "<p>No class info found.</p>"; return; }
        var my = [];
        for (var i = 0; i < assignments.length; i++) { if (assignments[i].classId === sc.id) my.push(assignments[i]); }
        if (my.length === 0) { c.innerHTML = "<p>No assignments yet.</p>"; return; }
        var h = '<table><thead><tr><th>Title</th><th>Subject</th><th>Due Date</th><th>Questions</th></tr></thead><tbody>';
        for (var i = 0; i < my.length; i++) {
            var od = new Date(my[i].dueDate) < new Date();
            h += '<tr><td>' + my[i].title + '</td><td>' + my[i].subject + '</td><td>' + my[i].dueDate + (od ? ' <span class="badge badge-hard">Overdue</span>' : '') + '</td><td>' + my[i].questions.length + '</td></tr>';
        }
        c.innerHTML = h + '</tbody></table>';
    }

    function renderParentResults() {
        var c = $("parentResultsContent");
        if (!c) return;
        var user = Auth.getUser();
        var childId = user ? user.childId : null;
        var my = [];
        for (var i = 0; i < allAttempts.length; i++) { if (allAttempts[i].studentId === childId) my.push(allAttempts[i]); }
        if (my.length === 0) { c.innerHTML = "<p>No results yet.</p>"; return; }
        my.sort(function(a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });
        var h = '<table><thead><tr><th>Date</th><th>Subject</th><th>Score</th><th>Percentage</th></tr></thead><tbody>';
        for (var i = 0; i < my.length; i++) {
            h += '<tr><td>' + new Date(my[i].timestamp).toLocaleDateString() + '</td><td>' + my[i].subject + '</td><td>' + my[i].score + '/' + my[i].total + '</td><td>' + my[i].percentage + '%</td></tr>';
        }
        c.innerHTML = h + '</tbody></table>';
    }

    function renderParentAttendance() {
        var c = $("parentAttendanceContent");
        if (!c) return;
        var user = Auth.getUser();
        var cid = user ? user.childId : null;
        var rec = [];
        for (var i = 0; i < attendance.length; i++) {
            if (attendance[i].records && attendance[i].records[cid]) rec.push({ date: attendance[i].date, status: attendance[i].records[cid] });
        }
        if (rec.length === 0) { c.innerHTML = "<p>No attendance records.</p>"; return; }
        rec.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
        var pr = 0, ab = 0, lt = 0;
        for (var i = 0; i < rec.length; i++) { if (rec[i].status === "present") pr++; else if (rec[i].status === "absent") ab++; else lt++; }
        var h = '<div class="analytics-card"><h4>Attendance Summary</h4><p>Present: <strong>' + pr + '</strong></p><p>Absent: <strong>' + ab + '</strong></p><p>Late: <strong>' + lt + '</strong></p><p>Rate: <strong>' + (rec.length > 0 ? (pr / rec.length * 100).toFixed(1) : 0) + '%</strong></p></div>';
        h += '<table><thead><tr><th>Date</th><th>Status</th></tr></thead><tbody>';
        for (var i = 0; i < rec.length; i++) {
            var sc = rec[i].status === "present" ? "badge-easy" : rec[i].status === "late" ? "badge-medium" : "badge-hard";
            h += '<tr><td>' + rec[i].date + '</td><td><span class="badge ' + sc + '">' + rec[i].status + '</span></td></tr>';
        }
        c.innerHTML = h + '</tbody></table>';
    }

    function showPrincipalTab(tab) {
        var map = { school: 0, classes: 1, teachers: 2, students: 3, analytics: 4 };
        var ids = ["principalSchoolTab", "principalClassesTab", "principalTeachersTab", "principalStudentsTab", "principalAnalyticsTab"];
        for (var i = 0; i < ids.length; i++) { var el = $(ids[i]); if (el) el.style.display = "none"; }
        activateTab("#principalDashboard", map[tab]);
        if (tab === "school") { $("principalSchoolTab").style.display = "block"; renderPrincipalSchool(); }
        else if (tab === "classes") { $("principalClassesTab").style.display = "block"; renderPrincipalClasses(); }
        else if (tab === "teachers") { $("principalTeachersTab").style.display = "block"; renderPrincipalTeachers(); }
        else if (tab === "students") { $("principalStudentsTab").style.display = "block"; renderPrincipalStudents(); }
        else if (tab === "analytics") { $("principalAnalyticsTab").style.display = "block"; renderPrincipalAnalytics(); }
    }

    function renderPrincipalSchool() {
        var c = $("principalSchoolContent");
        if (!c) return;
        var ts = studentAccounts.length;
        var tc = teachers.length;
        var tq = questions.length;
        var ta = allAttempts.length;
        var avg = ta > 0 ? allAttempts.reduce(function(s, a) { return s + a.percentage; }, 0) / ta : 0;
        var h = '<div class="overview-cards">' +
            '<div class="overview-card classes"><div class="card-icon">&#127979;</div><div class="card-value">' + classes.length + '</div><div class="card-label">Classes</div></div>' +
            '<div class="overview-card students"><div class="card-icon">&#128100;</div><div class="card-value">' + ts + '</div><div class="card-label">Students</div></div>' +
            '<div class="overview-card teachers"><div class="card-icon">&#128105;&#8205;&#127979;</div><div class="card-value">' + tc + '</div><div class="card-label">Teachers</div></div>' +
            '<div class="overview-card questions"><div class="card-icon">&#128218;</div><div class="card-value">' + tq + '</div><div class="card-label">Questions</div></div>' +
            '<div class="overview-card quizzes"><div class="card-icon">&#128221;</div><div class="card-value">' + ta + '</div><div class="card-label">Quizzes Taken</div></div>' +
            '<div class="overview-card average"><div class="card-icon">&#128200;</div><div class="card-value">' + avg.toFixed(0) + '%</div><div class="card-label">Average Score</div></div>' +
            '</div>';
        c.innerHTML = h;
    }

    function renderPrincipalClasses() {
        var c = $("principalClassesContent");
        if (!c) return;
        var h = '<table><thead><tr><th>Class</th><th>Grade</th><th>Section</th><th>Students</th></tr></thead><tbody>';
        for (var i = 0; i < classes.length; i++) {
            var count = 0;
            for (var j = 0; j < studentAccounts.length; j++) {
                if (studentAccounts[j].classId === classes[i].id) count++;
            }
            h += '<tr><td>' + classes[i].name + '</td><td>' + classes[i].grade + '</td><td>' + classes[i].section + '</td><td>' + count + '</td></tr>';
        }
        c.innerHTML = h + '</tbody></table>';
    }

    function renderPrincipalTeachers() {
        var c = $("principalTeachersContent");
        if (!c) return;
        if (teachers.length === 0) { c.innerHTML = "<p>No teachers added yet.</p>"; return; }
        var h = '<table><thead><tr><th>ID</th><th>Name</th><th>Subjects</th><th>Classes</th><th>Role</th><th>Password</th><th>Actions</th></tr></thead><tbody>';
        for (var i = 0; i < teachers.length; i++) {
            var t = teachers[i];
            var roleLabel = "";
            if (t.isClassTeacher) roleLabel = "Class Teacher";
            else roleLabel = "Subject Teacher";
            var subs = t.subjects || (t.subject ? [t.subject] : []);
            var cls = t.classes || (t.classId ? [t.classId] : []);
            var classLabels = [];
            for (var j = 0; j < cls.length; j++) {
                for (var k = 0; k < classes.length; k++) {
                    if (classes[k].id === cls[j]) { classLabels.push(classes[k].name); break; }
                }
            }
            h += '<tr><td>' + t.id + '</td><td>' + t.name + '</td><td>' + subs.join(", ") + '</td><td>' + (classLabels.join(", ") || "-") + '</td><td>' + roleLabel + '</td><td>' + (t.password || "-") + '</td><td><button onclick="editTeacher(\'' + t.id + '\')" class="action-btn">Edit</button> <button onclick="deleteTeacher(\'' + t.id + '\')" class="action-btn danger">Delete</button></td></tr>';
        }
        c.innerHTML = h + '</tbody></table>';
    }

    function toggleCTClassField() {
        var isCT = $("tmIsClassTeacher").checked;
        $("tmClassTeacherField").style.display = isCT ? "block" : "none";
        if (isCT) {
            var cbs = document.querySelectorAll("#tmClassesList .tm-class-cb:checked");
            var sel = $("tmClassTeacherList");
            sel.innerHTML = "";
            for (var i = 0; i < cbs.length; i++) {
                sel.innerHTML += '<label style="display:flex;align-items:center;gap:4px;font-weight:normal;font-size:13px;"><input type="checkbox" class="tm-ctof-cb" value="' + cbs[i].value + '"' + (cbs[i].dataset.wasct === "true" ? " checked" : "") + '> ' + cbs[i].dataset.name + '</label>';
            }
        }
    }

    function showAddTeacherModal() {
        $("teacherForm").reset();
        $("tmEditId").value = "";
        var subs = document.querySelectorAll(".tm-subject-cb");
        for (var i = 0; i < subs.length; i++) subs[i].checked = false;
        $("tmIsClassTeacher").checked = false;
        $("tmClassTeacherField").style.display = "none";
        $("teacherModalTitle").textContent = "Add Teacher";
        renderTeacherClassCheckboxes([], []);
        $("teacherModal").classList.add("active");
        $("modalOverlay").classList.add("active");
    }

    function renderTeacherClassCheckboxes(selectedClassIds, ctOfClassIds) {
        var c = $("tmClassesList");
        c.innerHTML = "";
        for (var i = 0; i < classes.length; i++) {
            var checked = selectedClassIds.indexOf(classes[i].id) !== -1;
            var wasCT = ctOfClassIds.indexOf(classes[i].id) !== -1;
            c.innerHTML += '<label style="display:flex;align-items:center;gap:4px;font-weight:normal;font-size:13px;"><input type="checkbox" class="tm-class-cb" value="' + classes[i].id + '" data-name="' + classes[i].name + '" data-wasct="' + wasCT + '"' + (checked ? " checked" : "") + ' onchange="toggleCTClassField()"> ' + classes[i].name + '</label>';
        }
    }

    function editTeacher(tid) {
        var t = null;
        for (var i = 0; i < teachers.length; i++) { if (teachers[i].id === tid) { t = teachers[i]; break; } }
        if (!t) return;
        $("tmEditId").value = t.id;
        $("tmName").value = t.name;
        var subs = document.querySelectorAll(".tm-subject-cb");
        for (var i = 0; i < subs.length; i++) subs[i].checked = (t.subjects || []).indexOf(subs[i].value) !== -1;
        var tClasses = t.classes || (t.classId ? [t.classId] : []);
        var ctOf = t.classTeacherOf || (t.isClassTeacher && t.classId ? [t.classId] : []);
        renderTeacherClassCheckboxes(tClasses, ctOf);
        $("tmIsClassTeacher").checked = t.isClassTeacher === true;
        toggleCTClassField();
        $("teacherModalTitle").textContent = "Edit Teacher";
        $("teacherModal").classList.add("active");
        $("modalOverlay").classList.add("active");
    }

    function deleteTeacher(tid) {
        if (!confirm("Delete this teacher?")) return;
        teachers = teachers.filter(function(t) { return t.id !== tid; });
        saveAll(); renderPrincipalTeachers();
    }

    function saveTeacher(e) {
        e.preventDefault();
        var editId = $("tmEditId").value;
        var name = $("tmName").value.trim();
        var subCbs = document.querySelectorAll(".tm-subject-cb:checked");
        var subjects = [];
        for (var i = 0; i < subCbs.length; i++) subjects.push(subCbs[i].value);
        var classCbs = document.querySelectorAll(".tm-class-cb:checked");
        var classIds = [];
        for (var i = 0; i < classCbs.length; i++) classIds.push(classCbs[i].value);
        var isClassTeacher = $("tmIsClassTeacher").checked;
        var ctOfCbs = document.querySelectorAll(".tm-ctof-cb:checked");
        var classTeacherOf = [];
        for (var i = 0; i < ctOfCbs.length; i++) classTeacherOf.push(ctOfCbs[i].value);
        if (subjects.length === 0) { alert("Please select at least one subject."); return; }
        if (classIds.length === 0) { alert("Please select at least one class."); return; }
        if (editId) {
            for (var i = 0; i < teachers.length; i++) {
                if (teachers[i].id === editId) {
                    teachers[i].name = name;
                    teachers[i].subjects = subjects;
                    teachers[i].subject = subjects[0] || "";
                    teachers[i].classes = classIds;
                    teachers[i].classId = classIds[0] || "";
                    teachers[i].isSubjectTeacher = true;
                    teachers[i].isClassTeacher = isClassTeacher;
                    teachers[i].classTeacherOf = classTeacherOf;
                    break;
                }
            }
        } else {
            var tid = generateTeacherId();
            var password = generateRandomPassword();
            teachers.push({ id: tid, name: name, subjects: subjects, subject: subjects[0] || "", classes: classIds, classId: classIds[0] || "", password: password, isSubjectTeacher: true, isClassTeacher: isClassTeacher, classTeacherOf: classTeacherOf, createdAt: Date.now() });
            var email = tid.toLowerCase() + "@imsg.edu.pk";
            Auth.loginFirebaseAuth(email, password, function() {});
            alert("Teacher added!\n\nID: " + tid + "\nPassword: " + password + "\n\nShare these with the teacher.");
        }
        saveAll(); closeModal(); renderPrincipalTeachers();
    }

    function renderPrincipalStudents() {
        var c = $("principalStudentsContent");
        if (!c) return;
        if (studentAccounts.length === 0) { c.innerHTML = "<p>No students yet. Click 'Add Student' or 'Import Excel' to add students.</p>"; return; }
        var h = '<table><thead><tr><th>ID</th><th>Name</th><th>Father Name</th><th>Class</th><th>Roll No</th><th>Password</th><th>Actions</th></tr></thead><tbody>';
        for (var i = 0; i < studentAccounts.length; i++) {
            var s = studentAccounts[i];
            var className = "N/A";
            for (var j = 0; j < classes.length; j++) {
                if (classes[j].id === s.classId) { className = classes[j].name; break; }
            }
            h += '<tr><td>' + s.id + '</td><td>' + s.name + '</td><td>' + (s.fatherName || "-") + '</td><td>' + className + '</td><td>' + (s.rollNo || "-") + '</td><td>' + s.password + '</td>' +
                '<td><button onclick="editStudentAccount(\'' + s.id + '\')" class="action-btn">Edit</button> ' +
                '<button onclick="showStudentPassword(\'' + s.id + '\')" class="action-btn">Show Pass</button> ' +
                '<button onclick="deleteStudentAccount(\'' + s.id + '\')" class="action-btn danger">Delete</button></td></tr>';
        }
        c.innerHTML = h + '</tbody></table>';
    }

    function showStudentPassword(sid) {
        for (var i = 0; i < studentAccounts.length; i++) {
            if (studentAccounts[i].id === sid) {
                alert("Student: " + studentAccounts[i].name + "\nID: " + studentAccounts[i].id + "\nPassword: " + studentAccounts[i].password);
                return;
            }
        }
    }

    function exportStudentCredentials() {
        doExportCredentials();
    }

    function doExportCredentials() {
        var list = studentAccounts.slice();
        if (list.length === 0) { alert("No students to export."); return; }
        var data = [["Student ID", "Name", "Father Name", "Class", "Roll No", "Password"]];
        for (var i = 0; i < list.length; i++) {
            var s = list[i];
            var className = "";
            for (var j = 0; j < classes.length; j++) { if (classes[j].id === s.classId) { className = classes[j].name; break; } }
            data.push([s.id, s.name, s.fatherName || "", className, s.rollNo || "", s.password]);
        }
        if (typeof XLSX !== "undefined") {
            var ws = XLSX.utils.aoa_to_sheet(data);
            ws["!cols"] = [{ wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 12 }];
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Credentials");
            XLSX.writeFile(wb, "student_credentials.xlsx");
        } else {
            alert("SheetJS library not loaded.");
        }
    }

    function showCreateStudentModal() {
        $("studentForm").reset();
        $("smEditId").value = "";
        var infoDiv = $("smGeneratedInfo");
        if (infoDiv) infoDiv.style.display = "none";
        $("studentModalTitle").textContent = "Add Student";
        var sel = $("smClassId");
        sel.innerHTML = "";
        for (var i = 0; i < classes.length; i++) {
            sel.innerHTML += '<option value="' + classes[i].id + '">' + classes[i].name + '</option>';
        }
        updateStudentPreview();
        $("studentModal").classList.add("active");
        $("modalOverlay").classList.add("active");
    }

    function updateStudentPreview() {
        var classId = $("smClassId").value;
        var rollNo = $("smRollNo").value;
        var infoDiv = $("smGeneratedInfo");
        if (!classId || !rollNo || !infoDiv) { if (infoDiv) infoDiv.style.display = "none"; return; }
        var classObj = null;
        for (var i = 0; i < classes.length; i++) { if (classes[i].id === classId) { classObj = classes[i]; break; } }
        if (!classObj) { infoDiv.style.display = "none"; return; }
        var sid = generateStudentId(classObj, parseInt(rollNo));
        $("smPreviewId").textContent = "Student ID: " + sid;
        $("smPreviewPass").textContent = "Password: (auto-generated 8-digit)";
        infoDiv.style.display = "block";
    }

    function editStudentAccount(sid) {
        var s = null;
        for (var i = 0; i < studentAccounts.length; i++) {
            if (studentAccounts[i].id === sid) { s = studentAccounts[i]; break; }
        }
        if (!s) return;
        $("smEditId").value = s.id;
        $("smName").value = s.name;
        $("smFatherName").value = s.fatherName || "";
        $("smRollNo").value = s.rollNo || "";
        $("studentModalTitle").textContent = "Edit Student";
        var infoDiv = $("smGeneratedInfo");
        if (infoDiv) infoDiv.style.display = "none";
        var sel = $("smClassId");
        sel.innerHTML = "";
        for (var i = 0; i < classes.length; i++) {
            var selected = classes[i].id === s.classId ? " selected" : "";
            sel.innerHTML += '<option value="' + classes[i].id + '"' + selected + '>' + classes[i].name + '</option>';
        }
        $("studentModal").classList.add("active");
        $("modalOverlay").classList.add("active");
    }

    function saveStudentAccount(e) {
        e.preventDefault();
        var editId = $("smEditId").value;
        var name = $("smName").value.trim();
        var fatherName = $("smFatherName").value.trim();
        var classId = $("smClassId").value;
        var rollNo = parseInt($("smRollNo").value);
        if (!name || !fatherName || !classId || !rollNo) { alert("Please fill in all fields."); return; }
        var classObj = null;
        for (var i = 0; i < classes.length; i++) { if (classes[i].id === classId) { classObj = classes[i]; break; } }
        if (!classObj) { alert("Invalid class selected."); return; }
        if (editId) {
            for (var i = 0; i < studentAccounts.length; i++) {
                if (studentAccounts[i].id === editId) {
                    studentAccounts[i].name = name;
                    studentAccounts[i].fatherName = fatherName;
                    studentAccounts[i].classId = classId;
                    studentAccounts[i].rollNo = rollNo;
                    break;
                }
            }
        } else {
            var newId = generateStudentId(classObj, rollNo);
            for (var i = 0; i < studentAccounts.length; i++) {
                if (studentAccounts[i].id === newId) { alert("A student with ID " + newId + " already exists in this class!"); return; }
            }
            var newPass = generateRandomPassword();
            studentAccounts.push({ id: newId, name: name, fatherName: fatherName, classId: classId, rollNo: rollNo, password: newPass });
            var email = newId.toLowerCase() + "@imsg.edu.pk";
            Auth.loginFirebaseAuth(email, newPass, function() {});
            alert("Student created!\n\nID: " + newId + "\nPassword: " + newPass + "\n\nPlease share these credentials with the student.");
        }
        saveAll();
        closeModal();
        refreshStudentLists();
    }

    function deleteStudentAccount(sid) {
        if (!confirm("Delete student account " + sid + "?")) return;
        for (var i = 0; i < studentAccounts.length; i++) {
            if (studentAccounts[i].id === sid) { studentAccounts.splice(i, 1); break; }
        }
        saveAll();
        refreshStudentLists();
    }

    function refreshStudentLists() {
        var role = Auth.getRole();
        if (role === "principal") renderPrincipalStudents();
        if (role === "classteacher") renderCTStudents();
    }

    function renderPrincipalAnalytics() {
        var c = $("principalAnalyticsContent");
        if (!c) return;
        var ta = allAttempts.length;
        var avg = ta > 0 ? allAttempts.reduce(function(s, a) { return s + a.percentage; }, 0) / ta : 0;
        var best = ta > 0 ? Math.max.apply(null, allAttempts.map(function(a) { return a.percentage; })) : 0;
        var h = '<div class="overview-cards">' +
            '<div class="overview-card quizzes"><div class="card-icon">&#128221;</div><div class="card-value">' + ta + '</div><div class="card-label">Total Attempts</div></div>' +
            '<div class="overview-card average"><div class="card-icon">&#128200;</div><div class="card-value">' + avg.toFixed(0) + '%</div><div class="card-label">Average Score</div></div>' +
            '<div class="overview-card students"><div class="card-icon">&#127942;</div><div class="card-value">' + best + '%</div><div class="card-label">Best Score</div></div>' +
            '<div class="overview-card questions"><div class="card-icon">&#128218;</div><div class="card-value">' + questions.length + '</div><div class="card-label">Total Questions</div></div>' +
            '</div>';
        c.innerHTML = h;
    }

    function showExcelImportModal() {
        $("excelForm").reset();
        $("importResult").style.display = "none";
        $("importPreview").style.display = "none";
        $("excelModal").classList.add("active");
        $("modalOverlay").classList.add("active");
    }

    function importExcel(e) {
        e.preventDefault();
        var file = $("excelFile").files[0];
        if (!file) return;
        if (typeof XLSX === "undefined") { alert("SheetJS library not loaded. Please refresh the page."); return; }
        var reader = new FileReader();
        reader.onload = function(ev) {
            var data = new Uint8Array(ev.target.result);
            var workbook = XLSX.read(data, { type: "array" });
            var sheetName = workbook.SheetNames[0];
            var sheet = workbook.Sheets[sheetName];
            var rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
            if (rows.length === 0) { alert("File is empty or has no data rows."); return; }
            pendingImportData = [];
            var errors = [];
            var valid = 0;
            for (var i = 0; i < rows.length; i++) {
                var r = rows[i];
                var row = i + 2;
                var id = (r.id || "").toString().trim();
                var question = (r.question || r.text || "").toString().trim();
                var answer = (r.answer || "").toString().trim();
                if (!id) { errors.push("Row " + row + ": Missing ID"); continue; }
                if (!question) { errors.push("Row " + row + ": Missing question text"); continue; }
                if (!answer) { errors.push("Row " + row + ": Missing answer"); continue; }
                var dup = false;
                for (var j = 0; j < questions.length; j++) { if (questions[j].id === id) { dup = true; break; } }
                if (dup) { errors.push("Row " + row + ": Duplicate ID '" + id + "'"); continue; }
                var optA = (r.optionA || r.option_a || r.A || "").toString().trim();
                var optB = (r.optionB || r.option_b || r.B || "").toString().trim();
                var optC = (r.optionC || r.option_c || r.C || "").toString().trim();
                var optD = (r.optionD || r.option_d || r.D || "").toString().trim();
                var qObj = {
                    id: id, chapter: parseInt(r.chapter) || 1, topic: (r.topic || "General").toString().trim(),
                    type: (r.type || "mcq").toString().trim().toLowerCase(),
                    mode: (r.mode || "straight").toString().trim().toLowerCase(),
                    difficulty: (r.difficulty || "medium").toString().trim().toLowerCase(),
                    question: question, options: [optA, optB, optC, optD],
                    answer: answer.toUpperCase(), explanation: (r.explanation || "").toString().trim(),
                    bloom: (r.bloom || "Remembering").toString().trim(),
                    source: (r.source || "Excel Import").toString().trim(),
                    subject: (r.subject || "Computer Science").toString().trim(),
                    grade: parseInt(r.grade) || 9
                };
                pendingImportData.push(qObj);
                valid++;
            }
            $("importPreview").style.display = "block";
            $("importResult").style.display = "none";
            var html = '<table class="history-table"><thead><tr><th>ID</th><th>Topic</th><th>Q (first 50 chars)</th><th>Answer</th><th>Difficulty</th></tr></thead><tbody>';
            var show = Math.min(5, pendingImportData.length);
            for (var i = 0; i < show; i++) {
                var q = pendingImportData[i];
                html += '<tr><td>' + q.id + '</td><td>' + q.topic + '</td><td>' + q.question.substring(0, 50) + '...</td><td>' + q.answer + '</td><td>' + q.difficulty + '</td></tr>';
            }
            html += '</tbody></table>';
            $("importPreviewTable").innerHTML = html;
            var statsHtml = '<p style="color:var(--success);">Valid questions: <strong>' + valid + '</strong></p>';
            if (errors.length > 0) {
                statsHtml += '<p style="color:var(--error);">Errors: <strong>' + errors.length + '</strong></p><div style="max-height:100px;overflow-y:auto;font-size:12px;color:#666;">';
                for (var i = 0; i < Math.min(10, errors.length); i++) statsHtml += '<p>' + errors[i] + '</p>';
                if (errors.length > 10) statsHtml += '<p>...and ' + (errors.length - 10) + ' more</p>';
                statsHtml += '</div>';
            }
            $("importStats").innerHTML = statsHtml;
        };
        reader.readAsArrayBuffer(file);
    }

    function confirmImport() {
        if (pendingImportData.length === 0) return;
        for (var i = 0; i < pendingImportData.length; i++) {
            questions.push(pendingImportData[i]);
        }
        saveAll();
        pendingImportData = [];
        $("importResult").style.display = "block";
        $("importPreview").style.display = "none";
        $("importResult").innerHTML = '<p style="color:var(--success);font-size:16px;">&#9989; Successfully imported questions into the question bank!</p>';
        renderQuestions();
    }

    function showStudentExcelModal() {
        $("studentExcelFile").value = "";
        $("studentExcelPreview").innerHTML = "";
        $("studentExcelConfirmBtn").style.display = "none";
        $("studentExcelModal").classList.add("active");
        $("modalOverlay").classList.add("active");
    }

    function previewStudentExcel(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
            try {
                var wb = XLSX.read(ev.target.result, { type: "binary" });
                var ws = wb.Sheets[wb.SheetNames[0]];
                var data = XLSX.utils.sheet_to_json(ws, { header: 1 });
                if (data.length < 2) { alert("Excel file is empty or has no data rows."); return; }
                var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
                var nameIdx = headers.indexOf("name");
                var fatherIdx = headers.indexOf("father name");
                var classIdx = headers.indexOf("class");
                var rollIdx = headers.indexOf("roll no");
                if (nameIdx === -1 || fatherIdx === -1 || classIdx === -1 || rollIdx === -1) {
                    alert("Excel must have columns: Name, Father Name, Class, Roll No");
                    return;
                }
                pendingStudentExcelData = [];
                var errors = [];
                var existingIds = {};
                for (var i = 0; i < studentAccounts.length; i++) existingIds[studentAccounts[i].id] = true;
                for (var i = 1; i < data.length; i++) {
                    var row = data[i];
                    if (!row || !row[nameIdx]) continue;
                    var sname = String(row[nameIdx]).trim();
                    var sfather = String(row[fatherIdx]).trim();
                    var sclass = String(row[classIdx]).trim();
                    var sroll = parseInt(row[rollIdx]);
                    if (!sname || !sfather || !sclass || !sroll) { errors.push("Row " + (i + 1) + ": Missing data."); continue; }
                    var matchedClass = null;
                    for (var j = 0; j < classes.length; j++) {
                        if (classes[j].name === sclass) { matchedClass = classes[j]; break; }
                    }
                    if (!matchedClass) {
                        var gradeNum = parseInt(sclass) || 9;
                        var sectionChar = sclass.replace(/[0-9]/g, "").toUpperCase() || "A";
                        matchedClass = { id: "CLASS-" + sclass, name: sclass, grade: gradeNum, section: sectionChar, students: [] };
                        classes.push(matchedClass);
                    }
                    var genId = generateStudentId(matchedClass, sroll);
                    if (existingIds[genId]) { errors.push("Row " + (i + 1) + ": ID " + genId + " already exists (skipped)."); continue; }
                    var genPass = generateRandomPassword();
                    pendingStudentExcelData.push({ id: genId, name: sname, fatherName: sfather, classId: matchedClass.id, rollNo: sroll, password: genPass });
                    existingIds[genId] = true;
                }
                var h = '<p><b>' + pendingStudentExcelData.length + '</b> students ready to import.</p>';
                if (errors.length > 0) h += '<p style="color:#e74c3c;">' + errors.join("<br>") + '</p>';
                if (pendingStudentExcelData.length > 0) {
                    h += '<table><thead><tr><th>ID</th><th>Name</th><th>Father Name</th><th>Class</th><th>Roll No</th><th>Password</th></tr></thead><tbody>';
                    for (var i = 0; i < pendingStudentExcelData.length; i++) {
                        var s = pendingStudentExcelData[i];
                        var cn = "N/A";
                        for (var j = 0; j < classes.length; j++) { if (classes[j].id === s.classId) { cn = classes[j].name; break; } }
                        h += '<tr><td>' + s.id + '</td><td>' + s.name + '</td><td>' + s.fatherName + '</td><td>' + cn + '</td><td>' + s.rollNo + '</td><td>' + s.password + '</td></tr>';
                    }
                    h += '</tbody></table>';
                    $("studentExcelConfirmBtn").style.display = "inline-block";
                } else {
                    $("studentExcelConfirmBtn").style.display = "none";
                }
                $("studentExcelPreview").innerHTML = h;
            } catch (ex) { alert("Error reading Excel file: " + ex.message); }
        };
        reader.readAsBinaryString(file);
    }

    function confirmStudentExcelImport() {
        if (pendingStudentExcelData.length === 0) return;
        var count = pendingStudentExcelData.length;
        for (var i = 0; i < pendingStudentExcelData.length; i++) {
            studentAccounts.push(pendingStudentExcelData[i]);
        }
        saveAll();
        pendingStudentExcelData = [];
        closeModal();
        refreshStudentLists();
        alert(count + " students imported successfully!");
    }

    function closeModal() {
        var ids = ["questionModal", "classModal", "assignmentModal", "excelModal", "teacherModal", "attendanceModal", "studentModal", "studentExcelModal", "exportCredentialsModal"];
        for (var i = 0; i < ids.length; i++) { var el = $(ids[i]); if (el) el.classList.remove("active"); }
        var overlay = $("modalOverlay");
        if (overlay) overlay.classList.remove("active");
    }

    function renderDashboard() {
        showDashboard();
    }

    function showDashboard() {
        $("loginPage").style.display = "none";
        dashboardsHide();
        $("quiz").style.display = "none";
        $("result").style.display = "none";
        $("review").style.display = "none";
        $("logoutBar").style.display = "flex";
        $("homeBtn").style.display = "inline-block";
        var role = Auth.getRole();
        var user = Auth.getUser();
        if (role === "student") {
            $("studentDashboard").style.display = "block";
            $("studentDisplayName").textContent = user ? user.name : "Student";
            $("loggedUser").textContent = user ? user.name + " (Student)" : "Student";
            showStudentTab("practice");
        } else if (role === "teacher") {
            $("teacherDashboard").style.display = "block";
            $("teacherDisplayName").textContent = user ? user.name : "Teacher";
            var tSubs = (user && user.subjects) ? user.subjects : (user && user.subject ? [user.subject] : []);
            $("teacherSubjectDisplay").textContent = tSubs.join(", ") || "N/A";
            $("loggedUser").textContent = user ? user.name + " (Teacher)" : "Teacher";
            showTeacherTab("classes");
        } else if (role === "classteacher") {
            $("classTeacherDashboard").style.display = "block";
            $("ctDisplayName").textContent = user ? user.name : "Class Teacher";
            $("loggedUser").textContent = user ? user.name + " (Class Teacher)" : "Class Teacher";
            showCTTab("overview");
        } else if (role === "parent") {
            $("parentDashboard").style.display = "block";
            $("parentDisplayName").textContent = user ? user.name : "Parent";
            $("loggedUser").textContent = user ? user.name : "Parent";
            showParentTab("progress");
        } else if (role === "principal") {
            $("principalDashboard").style.display = "block";
            $("principalDisplayName").textContent = user ? user.name : "Admin";
            $("loggedUser").textContent = user ? user.name + " (Admin)" : "Admin";
            showPrincipalTab("school");
        }
        history.pushState({ page: "dashboard" }, "", "#dashboard");
    }

    return {
        $: $,
        dashboardsHide: dashboardsHide,
        showLogin: showLogin,
        showDashboard: showDashboard,
        renderDashboard: renderDashboard,
        updateLoginFields: updateLoginFields,
        activateTab: activateTab,
        showStudentTab: showStudentTab,
        renderStudentDashboard: renderStudentDashboard,
        renderStudentAssignments: renderStudentAssignments,
        renderStudentResults: renderStudentResults,
        renderStudentProgress: renderStudentProgress,
        renderSubjects: renderSubjects,
        showSubjectChapters: showSubjectChapters,
        showSubjectList: showSubjectList,
        showChapterQuizOptions: showChapterQuizOptions,
        backToChapters: backToChapters,
        showTopicPicker: showTopicPicker,
        launchTopicPractice: launchTopicPractice,
        launchChapterMode: launchChapterMode,
        balancedSelect: balancedSelect,
        getWeakQuestions: getWeakQuestions,
        showModeDetail: showModeDetail,
        hideModeDetail: hideModeDetail,
        launchQuickPractice: launchQuickPractice,
        launchChapterTest: launchChapterTest,
        launchFullBookTest: launchFullBookTest,
        launchWeakPractice: launchWeakPractice,
        launchRandomQuiz: launchRandomQuiz,
        startQuizUI: startQuizUI,
        launchQuiz: launchQuiz,
        startPractice: startPractice,
        startAssignmentQuiz: startAssignmentQuiz,
        showTeacherTab: showTeacherTab,
        populateAnalyticsClassSelect: populateAnalyticsClassSelect,
        renderClasses: renderClasses,
        editClass: editClass,
        deleteClass: deleteClass,
        showCreateClassModal: showCreateClassModal,
        saveClass: saveClass,
        renderQuestions: renderQuestions,
        filterQuestions: filterQuestions,
        showAddQuestionModal: showAddQuestionModal,
        editQuestion: editQuestion,
        deleteQuestion: deleteQuestion,
        saveQuestion: saveQuestion,
        renderAssignments: renderAssignments,
        showCreateAssignmentModal: showCreateAssignmentModal,
        updateAssignmentQuestionList: updateAssignmentQuestionList,
        editAssignment: editAssignment,
        deleteAssignment: deleteAssignment,
        saveAssignment: saveAssignment,
        showAssignmentStatus: showAssignmentStatus,
        hideAssignmentStatus: hideAssignmentStatus,
        loadClassAnalytics: loadClassAnalytics,
        showCTTab: showCTTab,
        renderCTOverview: renderCTOverview,
        renderCTStudents: renderCTStudents,
        renderCTCrossSubject: renderCTCrossSubject,
        renderCTAttendance: renderCTAttendance,
        markAttendance: markAttendance,
        saveAttendance: saveAttendance,
        showParentTab: showParentTab,
        renderParentProgress: renderParentProgress,
        renderParentAssignments: renderParentAssignments,
        renderParentResults: renderParentResults,
        renderParentAttendance: renderParentAttendance,
        showPrincipalTab: showPrincipalTab,
        renderPrincipalSchool: renderPrincipalSchool,
        renderPrincipalClasses: renderPrincipalClasses,
        renderPrincipalTeachers: renderPrincipalTeachers,
        toggleCTClassField: toggleCTClassField,
        showAddTeacherModal: showAddTeacherModal,
        editTeacher: editTeacher,
        deleteTeacher: deleteTeacher,
        saveTeacher: saveTeacher,
        renderPrincipalStudents: renderPrincipalStudents,
        showStudentPassword: showStudentPassword,
        exportStudentCredentials: exportStudentCredentials,
        doExportCredentials: doExportCredentials,
        showCreateStudentModal: showCreateStudentModal,
        updateStudentPreview: updateStudentPreview,
        editStudentAccount: editStudentAccount,
        saveStudentAccount: saveStudentAccount,
        deleteStudentAccount: deleteStudentAccount,
        refreshStudentLists: refreshStudentLists,
        renderPrincipalAnalytics: renderPrincipalAnalytics,
        showExcelImportModal: showExcelImportModal,
        importExcel: importExcel,
        confirmImport: confirmImport,
        showStudentExcelModal: showStudentExcelModal,
        previewStudentExcel: previewStudentExcel,
        confirmStudentExcelImport: confirmStudentExcelImport,
        closeModal: closeModal,
        renderBar: renderBar,
        renderDonut: renderDonut
    };
})();
