// General Firebase Configuration for simple pages
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js';
import { getFirestore, collection, doc, getDoc, setDoc, addDoc, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyCkCL0MJWOvv6cKCsnleL6EgIH1JsF_rzU",
    authDomain: "nex-database.firebaseapp.com",
    projectId: "nex-database",
    storageBucket: "nex-database.appspot.com",
    messagingSenderId: "532729129753",
    appId: "1:532729129753:web:4af9c4bb3ff18c9902f388"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.firebaseApp = app;
window.firestoreDb = db;
window.firestoreFunctions = {
    collection, doc, getDoc, setDoc, addDoc, getDocs, query, where
};
