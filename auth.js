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

    function handleLogin() {
        var role = document.getElementById("loginRole").value;
        var id = document.getElementById("loginID").value.trim();
        var password = document.getElementById("loginPassword").value.trim();
        var loginMsg = document.getElementById("loginMsg");

        if (!id || !password) { loginMsg.style.display = "block"; loginMsg.textContent = "Please enter ID and password"; return; }
        loginMsg.style.display = "none";

        if (role === "student") {
            var student = DataStore.findStudentById(id);
            if (!student) { loginMsg.style.display = "block"; loginMsg.textContent = "Account not found"; return; }
            var email = id.toLowerCase() + "@imsg.edu.pk";
            loginFirebaseAuth(email, password, function() {
                loginAs("student", student);
                UI.showDashboard();
            }, function() {
                loginMsg.style.display = "block";
                loginMsg.textContent = "Incorrect password or network error";
            });
        } else if (role === "parent") {
            var parentStudent = DataStore.findStudentById(id);
            if (!parentStudent) { loginMsg.style.display = "block"; loginMsg.textContent = "Account not found"; return; }
            var parentEmail = id.toLowerCase() + "@imsg.edu.pk";
            loginFirebaseAuth(parentEmail, password, function() {
                loginAs("parent", parentStudent);
                UI.showDashboard();
            }, function() {
                loginMsg.style.display = "block";
                loginMsg.textContent = "Incorrect password or network error";
            });
        } else if (role === "principal") {
            var pAccount = DataStore.principalAccount;
            if (!pAccount || pAccount.password !== password) { loginMsg.style.display = "block"; loginMsg.textContent = "Incorrect password"; return; }
            var principalEmail = id.toLowerCase() + "@imsg.edu.pk";
            loginFirebaseAuth(principalEmail, password, function() {
                loginAs("principal", pAccount);
                UI.showDashboard();
            }, function() {
                loginMsg.style.display = "block";
                loginMsg.textContent = "Incorrect password or network error";
            });
        } else if (role === "teacher") {
            var teacher = DataStore.findTeacherById(id);
            if (!teacher) { loginMsg.style.display = "block"; loginMsg.textContent = "Account not found"; return; }
            var teacherEmail = id.toLowerCase() + "@imsg.edu.pk";
            loginFirebaseAuth(teacherEmail, password, function() {
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
