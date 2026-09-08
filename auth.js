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

    function loginFirebaseAuth(email, password, onSuccess, onError) {
        if (typeof fbAuth === "undefined" || !fbAuth) { onSuccess(); return; }
        fbAuth.signInWithEmailAndPassword(email, password)
            .then(function() { onSuccess(); })
            .catch(function(err) {
                if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
                    var strongPassword = password + "!Aa1";
                    fbAuth.createUserWithEmailAndPassword(email, strongPassword)
                        .then(function() { fbAuth.signOut().then(function() { fbAuth.signInWithEmailAndPassword(email, strongPassword).then(function() { onSuccess(); }).catch(function(e2) { onError(e2); }); }); })
                        .catch(function() { onError(err); });
                } else { onError(err); }
            });
    }

    function handleLogin(e) {
        if (e) e.preventDefault();
        var role = document.getElementById("roleSelect").value;
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
            var id = document.getElementById("studentId").value.trim();
            var password = document.getElementById("studentPassword").value.trim();
            if (!id || !password) { loginMsg.style.display = "block"; loginMsg.textContent = "Please enter ID and password"; return; }
            var student = DataStore.findStudentById(id);
            if (!student) { loginMsg.style.display = "block"; loginMsg.textContent = "Account not found. Please contact your teacher."; return; }
            var email = id.toLowerCase() + "@imsg.edu.pk";
            loginFirebaseAuth(email, password, function() {
                loginAs("student", student);
                UI.showDashboard();
            }, function() {
                loginMsg.style.display = "block";
                loginMsg.textContent = "Incorrect password or network error";
            });
        } else if (role === "parent") {
            var childIdVal = document.getElementById("childId").value.trim();
            var parentPass = document.getElementById("parentPassword").value.trim();
            if (!childIdVal || !parentPass) { loginMsg.style.display = "block"; loginMsg.textContent = "Please enter child ID and password"; return; }
            var childStudent = DataStore.findStudentById(childIdVal);
            if (!childStudent) { loginMsg.style.display = "block"; loginMsg.textContent = "Student account not found"; return; }
            var email = childIdVal.toLowerCase() + "@imsg.edu.pk";
            loginFirebaseAuth(email, parentPass, function() {
                loginAs("parent", childStudent);
                UI.showDashboard();
            }, function() {
                loginMsg.style.display = "block";
                loginMsg.textContent = "Incorrect password or network error";
            });
        } else if (role === "principal") {
            var adminId = document.getElementById("principalId").value.trim();
            var adminPass = document.getElementById("principalPassword").value.trim();
            if (!adminId || !adminPass) { loginMsg.style.display = "block"; loginMsg.textContent = "Please enter admin ID and password"; return; }
            var pAccount = DataStore.principalAccount;
            if (!pAccount || pAccount.password !== adminPass) { loginMsg.style.display = "block"; loginMsg.textContent = "Incorrect password"; return; }
            var email = adminId.toLowerCase() + "@imsg.edu.pk";
            loginFirebaseAuth(email, adminPass, function() {
                loginAs("principal", pAccount);
                UI.showDashboard();
            }, function() {
                loginMsg.style.display = "block";
                loginMsg.textContent = "Incorrect password or network error";
            });
        } else if (role === "teacher" || role === "classteacher") {
            var teacherId = document.getElementById("teacherId").value.trim();
            var teacherPass = document.getElementById("teacherPassword").value.trim();
            if (!teacherId || !teacherPass) { loginMsg.style.display = "block"; loginMsg.textContent = "Please enter teacher ID and password"; return; }
            var teacher = DataStore.findTeacherById(teacherId);
            if (!teacher) { loginMsg.style.display = "block"; loginMsg.textContent = "Account not found"; return; }
            var email = teacherId.toLowerCase() + "@imsg.edu.pk";
            loginFirebaseAuth(email, teacherPass, function() {
                loginAs("teacher", teacher);
                UI.showDashboard();
            }, function() {
                loginMsg.style.display = "block";
                loginMsg.textContent = "Incorrect password or network error";
            });
        }
    }

    function handleLogout() {
        logout();
        UI.showLogin();
    }

    return {
        getRole: getRole,
        getUser: getUser,
        isLoggedIn: isLoggedIn,
        loginAs: loginAs,
        logout: logout,
        restoreSession: restoreSession,
        handleLogin: handleLogin,
        handleLogout: handleLogout
    };
})();
