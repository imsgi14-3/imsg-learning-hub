var DataStore = (function() {
    var KEYS = {
        questions: "learningHub_questions",
        classes: "learningHub_classes",
        assignments: "learningHub_assignments",
        teachers: "learningHub_teachers",
        attendance: "learningHub_attendance",
        attempts: "learningHub_attempts",
        concepts: "learningHub_concepts",
        students: "learningHub_students",
        principal: "learningHub_principal"
    };

    var questions = [];
    var classes = [];
    var assignments = [];
    var teachers = [];
    var attendance = [];
    var allAttempts = [];
    var conceptStats = {};
    var studentAccounts = [];
    var principalAccount = { id: "ADMIN-001", name: "Principal", password: "yyJwe6sY", createdAt: Date.now() };

    function load() {
        questions = JSON.parse(localStorage.getItem(KEYS.questions)) || [];
        classes = JSON.parse(localStorage.getItem(KEYS.classes)) || [];
        assignments = JSON.parse(localStorage.getItem(KEYS.assignments)) || [];
        teachers = JSON.parse(localStorage.getItem(KEYS.teachers)) || [];
        attendance = JSON.parse(localStorage.getItem(KEYS.attendance)) || [];
        allAttempts = JSON.parse(localStorage.getItem(KEYS.attempts)) || [];
        conceptStats = JSON.parse(localStorage.getItem(KEYS.concepts)) || {};
        studentAccounts = JSON.parse(localStorage.getItem(KEYS.students)) || [];
        var sp = JSON.parse(localStorage.getItem(KEYS.principal));
        if (sp && sp.id === "ADMIN-001") principalAccount = sp;
        if (classes.length === 0) {
            classes = [
                { id: "CLASS-9A", name: "9A", grade: 9, section: "A" },
                { id: "CLASS-9B", name: "9B", grade: 9, section: "B" }
            ];
        }
    }

    function save() {
        localStorage.setItem(KEYS.questions, JSON.stringify(questions));
        localStorage.setItem(KEYS.classes, JSON.stringify(classes));
        localStorage.setItem(KEYS.assignments, JSON.stringify(assignments));
        localStorage.setItem(KEYS.teachers, JSON.stringify(teachers));
        localStorage.setItem(KEYS.attendance, JSON.stringify(attendance));
        localStorage.setItem(KEYS.attempts, JSON.stringify(allAttempts));
        localStorage.setItem(KEYS.concepts, JSON.stringify(conceptStats));
        localStorage.setItem(KEYS.students, JSON.stringify(studentAccounts));
        if (principalAccount) localStorage.setItem(KEYS.principal, JSON.stringify(principalAccount));
        saveToFirestore();
    }

    function saveToFirestore() {
        if (typeof db === "undefined") return;
        if (principalAccount) db.collection("teachers").doc("PRINCIPAL").set(principalAccount).catch(function() {});
        for (var i = 0; i < studentAccounts.length; i++) db.collection("students").doc(studentAccounts[i].id).set(studentAccounts[i]).catch(function() {});
        for (var i = 0; i < classes.length; i++) db.collection("classes").doc(classes[i].id).set(classes[i]).catch(function() {});
        for (var i = 0; i < questions.length; i++) db.collection("questions").doc(questions[i].id).set(questions[i]).catch(function() {});
        for (var i = 0; i < assignments.length; i++) db.collection("assignments").doc(assignments[i].id || ("a-" + i)).set(assignments[i]).catch(function() {});
        for (var i = 0; i < teachers.length; i++) db.collection("teachers").doc(teachers[i].id).set(teachers[i]).catch(function() {});
        for (var i = 0; i < allAttempts.length; i++) db.collection("attempts").doc(allAttempts[i].attemptId || ("att-" + i)).set(allAttempts[i]).catch(function() {});
    }

    function loadFromFirestore(callback) {
        if (typeof db === "undefined") { if (callback) callback(); return; }
        var loaded = 0, total = 6;
        function done() { loaded++; if (loaded >= total && callback) callback(); }
        db.collection("students").get().then(function(snap) {
            if (snap.size > 0) { studentAccounts = []; snap.forEach(function(doc) { studentAccounts.push(doc.data()); }); localStorage.setItem(KEYS.students, JSON.stringify(studentAccounts)); }
            done();
        }).catch(function() { done(); });
        db.collection("classes").get().then(function(snap) {
            if (snap.size > 0) { classes = []; snap.forEach(function(doc) { classes.push(doc.data()); }); localStorage.setItem(KEYS.classes, JSON.stringify(classes)); }
            done();
        }).catch(function() { done(); });
        db.collection("questions").get().then(function(snap) {
            if (snap.size > 0) {
                var byId = {};
                for (var i = 0; i < questions.length; i++) byId[questions[i].id] = i;
                snap.forEach(function(doc) {
                    var q = doc.data();
                    if (byId[q.id] !== undefined) { questions[byId[q.id]] = q; }
                    else { questions.push(q); byId[q.id] = questions.length - 1; }
                });
                localStorage.setItem(KEYS.questions, JSON.stringify(questions));
            }
            done();
        }).catch(function() { done(); });
        db.collection("assignments").get().then(function(snap) {
            if (snap.size > 0) { assignments = []; snap.forEach(function(doc) { assignments.push(doc.data()); }); localStorage.setItem(KEYS.assignments, JSON.stringify(assignments)); }
            done();
        }).catch(function() { done(); });
        db.collection("attempts").get().then(function(snap) {
            if (snap.size > 0) { allAttempts = []; snap.forEach(function(doc) { allAttempts.push(doc.data()); }); localStorage.setItem(KEYS.attempts, JSON.stringify(allAttempts)); }
            done();
        }).catch(function() { done(); });
        db.collection("teachers").get().then(function(snap) {
            if (snap.size > 0) {
                teachers = [];
                snap.forEach(function(doc) {
                    var d = doc.data();
                    if (d.id === "PRINCIPAL" || doc.id === "PRINCIPAL") { if (!principalAccount || principalAccount.id !== "ADMIN-001") principalAccount = d; }
                    else teachers.push(d);
                });
                localStorage.setItem(KEYS.teachers, JSON.stringify(teachers));
            }
            done();
        }).catch(function() { done(); });
    }

    function generateRandomPassword() {
        var chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        var pass = "";
        for (var i = 0; i < 8; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
        return pass;
    }

    function generateStudentId(classObj, rollNo) {
        var num = (rollNo < 10 ? "0" : "") + rollNo;
        return classObj.name + "-" + num;
    }

    function generateTeacherId() {
        var num = teachers.length + 1;
        var id = "T-" + (num < 10 ? "0" : "") + num;
        for (var i = 0; i < teachers.length; i++) {
            if (teachers[i].id === id) { num++; id = "T-" + (num < 10 ? "0" : "") + num; i = -1; }
        }
        return id;
    }

    function shuffleArray(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
        return a;
    }

    function getQuestionsBySubject(subject) {
        var result = [];
        for (var i = 0; i < questions.length; i++) {
            if (!subject || questions[i].subject === subject) result.push(questions[i]);
        }
        return result;
    }

    function getQuestionsByChapter(subject, chapter) {
        var result = [];
        for (var i = 0; i < questions.length; i++) {
            if (questions[i].subject === subject && questions[i].chapter === chapter) result.push(questions[i]);
        }
        return result;
    }

    function getQuestionsByTopic(subject, chapter, topic) {
        var result = [];
        for (var i = 0; i < questions.length; i++) {
            var q = questions[i];
            if (q.subject === subject && q.chapter === chapter && (topic === "all" || q.topic === topic)) result.push(q);
        }
        return result;
    }

    function getAttemptsByStudent(studentId) {
        var result = [];
        for (var i = 0; i < allAttempts.length; i++) {
            if (allAttempts[i].studentId === studentId) result.push(allAttempts[i]);
        }
        return result;
    }

    function getAttemptsByClass(classId) {
        var result = [];
        for (var i = 0; i < allAttempts.length; i++) {
            for (var j = 0; j < studentAccounts.length; j++) {
                if (studentAccounts[j].id === allAttempts[i].studentId && studentAccounts[j].classId === classId) {
                    result.push(allAttempts[i]);
                    break;
                }
            }
        }
        return result;
    }

    function getStudentCountByClass(classId) {
        var count = 0;
        for (var i = 0; i < studentAccounts.length; i++) {
            if (studentAccounts[i].classId === classId) count++;
        }
        return count;
    }

    function findStudentById(id) {
        for (var i = 0; i < studentAccounts.length; i++) {
            if (studentAccounts[i].id === id) return studentAccounts[i];
        }
        return null;
    }

    function findTeacherById(id) {
        for (var i = 0; i < teachers.length; i++) {
            if (teachers[i].id === id) return teachers[i];
        }
        return null;
    }

    function findClassById(id) {
        for (var i = 0; i < classes.length; i++) {
            if (classes[i].id === id) return classes[i];
        }
        return null;
    }

    function addStudent(student) { studentAccounts.push(student); save(); }
    function updateStudent(id, data) {
        for (var i = 0; i < studentAccounts.length; i++) {
            if (studentAccounts[i].id === id) { studentAccounts[i] = data; save(); return; }
        }
    }
    function removeStudent(id) { studentAccounts = studentAccounts.filter(function(s) { return s.id !== id; }); save(); }

    function addTeacher(teacher) { teachers.push(teacher); save(); }
    function updateTeacher(id, data) {
        for (var i = 0; i < teachers.length; i++) {
            if (teachers[i].id === id) { teachers[i] = data; save(); return; }
        }
    }
    function removeTeacher(id) { teachers = teachers.filter(function(t) { return t.id !== id; }); save(); }

    function addAttempt(attempt) { allAttempts.push(attempt); save(); }

    function getTopicAnalytics(studentId) {
        var topicData = {};
        for (var i = 0; i < allAttempts.length; i++) {
            var a = allAttempts[i];
            if (studentId && a.studentId !== studentId) continue;
            if (!a.questionResults) continue;
            for (var j = 0; j < a.questionResults.length; j++) {
                var r = a.questionResults[j];
                var topic = r.topic || "General";
                var subject = r.subject || a.subject || "Unknown";
                var key = subject + " > " + topic;
                if (!topicData[key]) topicData[key] = { correct: 0, total: 0, subject: subject, topic: topic };
                topicData[key].total++;
                if (r.isCorrect) topicData[key].correct++;
            }
        }
        return topicData;
    }

    function getWeakTopics(studentId, limit) {
        var topicData = getTopicAnalytics(studentId);
        var arr = [];
        var keys = Object.keys(topicData);
        for (var i = 0; i < keys.length; i++) {
            var t = topicData[keys[i]];
            var pct = t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0;
            arr.push({ key: keys[i], subject: t.subject, topic: t.topic, correct: t.correct, total: t.total, percentage: pct });
        }
        arr.sort(function(a, b) { return a.percentage - b.percentage; });
        return limit ? arr.slice(0, limit) : arr;
    }

    function getStrongTopics(studentId, limit) {
        var topicData = getTopicAnalytics(studentId);
        var arr = [];
        var keys = Object.keys(topicData);
        for (var i = 0; i < keys.length; i++) {
            var t = topicData[keys[i]];
            var pct = t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0;
            arr.push({ key: keys[i], subject: t.subject, topic: t.topic, correct: t.correct, total: t.total, percentage: pct });
        }
        arr.sort(function(a, b) { return b.percentage - a.percentage; });
        return limit ? arr.slice(0, limit) : arr;
    }

    return {
        KEYS: KEYS,
        get questions() { return questions; },
        set questions(v) { questions = v; },
        get classes() { return classes; },
        set classes(v) { classes = v; },
        get assignments() { return assignments; },
        set assignments(v) { assignments = v; },
        get teachers() { return teachers; },
        set teachers(v) { teachers = v; },
        get attendance() { return attendance; },
        set attendance(v) { attendance = v; },
        get allAttempts() { return allAttempts; },
        set allAttempts(v) { allAttempts = v; },
        get conceptStats() { return conceptStats; },
        set conceptStats(v) { conceptStats = v; },
        get studentAccounts() { return studentAccounts; },
        set studentAccounts(v) { studentAccounts = v; },
        get principalAccount() { return principalAccount; },
        set principalAccount(v) { principalAccount = v; },
        load: load,
        save: save,
        loadFromFirestore: loadFromFirestore,
        generateRandomPassword: generateRandomPassword,
        generateStudentId: generateStudentId,
        generateTeacherId: generateTeacherId,
        shuffleArray: shuffleArray,
        getQuestionsBySubject: getQuestionsBySubject,
        getQuestionsByChapter: getQuestionsByChapter,
        getQuestionsByTopic: getQuestionsByTopic,
        getAttemptsByStudent: getAttemptsByStudent,
        getAttemptsByClass: getAttemptsByClass,
        getStudentCountByClass: getStudentCountByClass,
        findStudentById: findStudentById,
        findTeacherById: findTeacherById,
        findClassById: findClassById,
        addStudent: addStudent,
        updateStudent: updateStudent,
        removeStudent: removeStudent,
        addTeacher: addTeacher,
        updateTeacher: updateTeacher,
        removeTeacher: removeTeacher,
        addAttempt: addAttempt,
        getTopicAnalytics: getTopicAnalytics,
        getWeakTopics: getWeakTopics,
        getStrongTopics: getStrongTopics
    };
})();
