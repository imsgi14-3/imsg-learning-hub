var firebaseConfig = {
    apiKey: "AIzaSyBRyioNW3sY1e0A4u4LCo-WwvyYrTu37f0",
    authDomain: "imsg-learning-hub.firebaseapp.com",
    projectId: "imsg-learning-hub",
    storageBucket: "imsg-learning-hub.firebasestorage.app",
    messagingSenderId: "963066193732",
    appId: "1:963066193732:web:b958bfa988ffe86bd61911"
};
var fbApp = firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
var fbAuth = firebase.auth();
