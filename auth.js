var Auth = (function() {
    var currentRole = null;
    var currentUser = null;

    function getRole() { return currentRole; }
    function getUser() { return currentUser; }
    function isLoggedIn() { return currentUser !== null; }

    function loginAs(role, user) {
        currentRole = role;
        currentUser = user;
        localStorage.setItem("learningHub_user", JSON.stringify({ role: role, user: user }));
    }

    function logout() {
        currentRole = null;
        currentUser = null;
        localStorage.removeItem("learningHub_user");
    }

    function restoreSession() {
        var saved = localStorage.getItem("learningHub_user");
        if (saved) {
            try {
                var parsed = JSON.parse(saved);
                currentRole = parsed.role;
                currentUser = parsed.user;
            } catch(e) { logout(); }
        }
    }

    function loginFirebaseAuth(email, password, onSuccess) {
        if (typeof fbAuth === "undefined" || !fbAuth) { onSuccess(); return; }
        var strongPassword = password + "!Aa1";
        fbAuth.signInWithEmailAndPassword(email, password)
            .then(function() { onSuccess(); })
            .catch(function() {
                fbAuth.signInWithEmailAndPassword(email, strongPassword)
                    .then(function() { onSuccess(); })
                    .catch(function() {
                        fbAuth.createUserWithEmailAndPassword(email, strongPassword)
                            .then(function() {
                                fbAuth.signOut().then(function() {
                                    fbAuth.signInWithEmailAndPassword(email, strongPassword)
                                        .then(function() { onSuccess(); })
                                        .catch(function() { onSuccess(); });
                                });
                            })
                            .catch(function() { onSuccess(); });
                    });
            });
    }

    function handleLogin(e) {
        e.preventDefault();
        var role = document.getElementById("roleSelect").value;
        var name = "", id = "", password = "";
        var loginMsg = document.getElementById("loginMsg");
        if (!loginMsg) {
            loginMsg = document.createElement("p");
            loginMsg.id = "loginMsg";
            loginMsg.style.cssText = "color:#ef4444;text-align:center;margin-top:10px;display:none;";
            var form = document.getElementById("loginForm");
            if (form) form.parentNode.insertBefore(loginMsg, form.nextSibling);
        }
        loginMsg.style.display = "none";

        if (role === "student") {
            id = document.getElementById("studentId").value.trim();
            name = document.getElementById("studentName").value.trim();
            password = document.getElementById("studentPassword").value;
            if (!id || !password) { loginMsg.style.display = "block"; loginMsg.textContent = "Please enter Student ID and Password."; return; }
            var found = null;
            for (var i = 0; i < studentAccounts.length; i++) {
                if (studentAccounts[i].id === id) { found = studentAccounts[i]; break; }
            }
            if (!found) { loginMsg.style.display = "block"; loginMsg.textContent = "Student ID not found. Contact admin to create your account."; return; }
            if (found.password !== password) { loginMsg.style.display = "block"; loginMsg.textContent = "Incorrect password."; return; }
            var email = id.toLowerCase() + "@imsg.edu.pk";
            var loginSuccess = function() {
                name = name || found.name;
                currentUser = { id: found.id, name: found.name, role: "student", subject: null, childId: null, classId: found.classId, grade: found.grade };
                currentRole = "student";
                document.getElementById("loginPage").style.display = "none";
                document.getElementById("logoutBar").style.display = "flex";
                document.getElementById("homeBtn").style.display = "inline-block";
                document.getElementById("loggedUser").textContent = found.name + " (Student)";
                dashboardsHide();
                document.getElementById("studentDashboard").style.display = "block";
                document.getElementById("studentDisplayName").textContent = found.name;
                showStudentTab("practice");
                history.pushState({ page: "dashboard" }, "", "#dashboard");
            };
            loginFirebaseAuth(email, password, loginSuccess);
        } else if (role === "teacher") {
            id = document.getElementById("teacherId").value.trim().toLowerCase();
            password = document.getElementById("teacherPassword").value;
            if (!id || !password) { loginMsg.style.display = "block"; loginMsg.textContent = "Please enter Teacher ID and Password."; return; }
            console.log("Teacher login attempt, id:", id, "teachers count:", teachers.length, "teacher ids:", teachers.map(function(t) { return t.id; }));
            var teacher = null;
            for (var i = 0; i < teachers.length; i++) {
                if (teachers[i].id === id) { teacher = teachers[i]; break; }
            }
            if (!teacher) { loginMsg.style.display = "block"; loginMsg.textContent = "Teacher ID not found."; console.warn("Teacher not found:", id, "available:", teachers.map(function(t) { return t.id; })); return; }
            if (teacher.password !== password) { loginMsg.style.display = "block"; loginMsg.textContent = "Incorrect password."; return; }
            var tClasses = teacher.classes || (teacher.classId ? [teacher.classId] : []);
            var tSubjects = teacher.subjects || (teacher.subject ? [teacher.subject] : []);
            var classSubjects = teacher.classSubjects || {};
            var email = id.toLowerCase() + "@imsg.edu.pk";
            var loginSuccess = function() {
                currentUser = { id: teacher.id, name: teacher.name, role: "teacher", subject: tSubjects[0] || "", subjects: tSubjects, classes: tClasses, classId: tClasses[0] || "", classSubjects: classSubjects, childId: null, isClassTeacher: teacher.isClassTeacher === true, classTeacherOf: teacher.classTeacherOf || [] };
                currentRole = "teacher";
                document.getElementById("loginPage").style.display = "none";
                document.getElementById("logoutBar").style.display = "flex";
                document.getElementById("homeBtn").style.display = "inline-block";
                var sb = document.getElementById("syncBtn"); if (sb) sb.style.display = "inline-block";
                document.getElementById("loggedUser").textContent = teacher.name + " (Teacher)";
                dashboardsHide();
                document.getElementById("teacherDashboard").style.display = "block";
                showTeacherTab("classes");
                history.pushState({ page: "dashboard" }, "", "#dashboard");
            };
            loginFirebaseAuth(email, password, loginSuccess);
        } else if (role === "classteacher") {
            id = document.getElementById("teacherId").value.trim().toLowerCase();
            password = document.getElementById("teacherPassword").value;
            if (!id || !password) { loginMsg.style.display = "block"; loginMsg.textContent = "Please enter Teacher ID and Password."; return; }
            console.log("ClassTeacher login attempt, id:", id, "teachers count:", teachers.length);
            var teacher = null;
            for (var i = 0; i < teachers.length; i++) {
                if (teachers[i].id === id) { teacher = teachers[i]; break; }
            }
            if (!teacher) { loginMsg.style.display = "block"; loginMsg.textContent = "Teacher ID not found."; console.warn("ClassTeacher not found:", id, "available:", teachers.map(function(t) { return t.id; })); return; }
            if (teacher.password !== password) { loginMsg.style.display = "block"; loginMsg.textContent = "Incorrect password."; return; }
            var ctOf = teacher.classTeacherOf || (teacher.isClassTeacher && teacher.classId ? [teacher.classId] : []);
            var ctClassId = ctOf.length > 0 ? ctOf[0] : (teacher.classes || [teacher.classId || ""])[0];
            var tSubjects = teacher.subjects || (teacher.subject ? [teacher.subject] : []);
            var tClasses = teacher.classes || (teacher.classId ? [teacher.classId] : []);
            var classSubjects = teacher.classSubjects || {};
            var email = id.toLowerCase() + "@imsg.edu.pk";
            var loginSuccess = function() {
                currentUser = { id: teacher.id, name: teacher.name, role: "classteacher", subject: tSubjects[0] || "", subjects: tSubjects, classes: tClasses, classId: ctClassId, classSubjects: classSubjects, childId: null, isClassTeacher: true, classTeacherOf: ctOf };
                currentRole = "classteacher";
                document.getElementById("loginPage").style.display = "none";
                document.getElementById("logoutBar").style.display = "flex";
                document.getElementById("homeBtn").style.display = "inline-block";
                var sb = document.getElementById("syncBtn"); if (sb) sb.style.display = "inline-block";
                document.getElementById("loggedUser").textContent = teacher.name + " (Class Teacher)";
                dashboardsHide();
                document.getElementById("classTeacherDashboard").style.display = "block";
                showCTTab("overview");
                history.pushState({ page: "dashboard" }, "", "#dashboard");
            };
            loginFirebaseAuth(email, password, loginSuccess);
        } else if (role === "parent") {
            id = document.getElementById("childId").value.trim();
            password = document.getElementById("parentPassword").value;
            if (!id || !password) { loginMsg.style.display = "block"; loginMsg.textContent = "Please enter Child ID and Password."; return; }
            var childStudent = null;
            for (var i = 0; i < studentAccounts.length; i++) {
                if (studentAccounts[i].id === id) { childStudent = studentAccounts[i]; break; }
            }
            if (!childStudent) { loginMsg.style.display = "block"; loginMsg.textContent = "Student account not found."; return; }
            var email = id.toLowerCase() + "@imsg.edu.pk";
            var loginSuccess = function() {
                currentUser = { id: "PARENT-" + id, name: "Parent of " + childStudent.name, role: "parent", subject: null, childId: id, classId: childStudent.classId };
                currentRole = "parent";
                document.getElementById("loginPage").style.display = "none";
                document.getElementById("logoutBar").style.display = "flex";
                document.getElementById("homeBtn").style.display = "inline-block";
                document.getElementById("loggedUser").textContent = "Parent of " + childStudent.name;
                dashboardsHide();
                document.getElementById("parentDashboard").style.display = "block";
                showParentTab("progress");
                history.pushState({ page: "dashboard" }, "", "#dashboard");
            };
            loginFirebaseAuth(email, password, loginSuccess);
        } else if (role === "principal") {
            id = document.getElementById("principalId").value.trim().toLowerCase();
            password = document.getElementById("principalPassword").value;
            if (!id || !password) { loginMsg.style.display = "block"; loginMsg.textContent = "Please enter Admin ID and Password."; return; }
            if (id !== "admin-001") { loginMsg.style.display = "block"; loginMsg.textContent = "Invalid Admin ID."; return; }
            if (password !== principalAccount.password) { loginMsg.style.display = "block"; loginMsg.textContent = "Incorrect password."; return; }
            var email = id.toLowerCase() + "@imsg.edu.pk";
            var loginSuccess = function() {
                currentUser = { id: principalAccount.id, name: principalAccount.name, role: "principal", subject: null, childId: null, classId: null };
                currentRole = "principal";
                document.getElementById("loginPage").style.display = "none";
                document.getElementById("logoutBar").style.display = "flex";
                document.getElementById("homeBtn").style.display = "inline-block";
                var sb = document.getElementById("syncBtn"); if (sb) sb.style.display = "inline-block";
                document.getElementById("loggedUser").textContent = principalAccount.name + " (Admin)";
                dashboardsHide();
                document.getElementById("principalDashboard").style.display = "block";
                showPrincipalTab("school");
                history.pushState({ page: "dashboard" }, "", "#dashboard");
            };
            loginFirebaseAuth(email, password, loginSuccess);
        }
    }

    function handleLogout() {
        logout();
        document.getElementById("loginPage").style.display = "flex";
        document.getElementById("logoutBar").style.display = "none";
        document.getElementById("homeBtn").style.display = "none";
        dashboardsHide();
        history.pushState({ page: "login" }, "", "#login");
    }

    return {
        getRole: getRole,
        getUser: getUser,
        isLoggedIn: isLoggedIn,
        loginAs: loginAs,
        logout: logout,
        restoreSession: restoreSession,
        loginFirebaseAuth: loginFirebaseAuth,
        handleLogin: handleLogin,
        handleLogout: handleLogout
    };
})();
