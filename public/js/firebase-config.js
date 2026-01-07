// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyC1abEcAK_rv-CVojVxO4P8i_KKRbSeeJw",
  authDomain: "teacher-finder-fcb1c.firebaseapp.com",
  databaseURL: "https://teacher-finder-fcb1c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "teacher-finder-fcb1c",
  storageBucket: "teacher-finder-fcb1c.firebasestorage.app",
  messagingSenderId: "428557348644",
  appId: "1:428557348644:web:b89dd1b5c928e3258ecdb1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();
const rtdb = firebase.database();