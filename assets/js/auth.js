// Firebase Authentication and Backend Logic
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js';
import { getFirestore, collection, doc, getDoc, setDoc, addDoc, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCkCL0MJWOvv6cKCsnleL6EgIH1JsF_rzU",
    authDomain: "nex-database.firebaseapp.com",
    projectId: "nex-database",
    storageBucket: "nex-database.appspot.com",
    messagingSenderId: "532729129753",
    appId: "1:532729129753:web:4af9c4bb3ff18c9902f388"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Make functions global for use in other scripts
window.firebaseApp = app;
window.firestoreDb = db;
window.firestoreFunctions = {
    collection,
    doc,
    getDoc,
    setDoc,
    addDoc,
    getDocs,
    query,
    where
};

// Firebase kullanıcı kontrolü
function checkUserByEmailInFirebase(email, password) {
    // Wait for Firebase to be ready with timeout
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 50;
        
        function waitForFirebase() {
            if (window.firestoreDb && window.firestoreFunctions) {
                // Firebase hazır, kullanıcı kontrolü yap
                performUserCheck(email, password, resolve, reject);
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(waitForFirebase, 100);
            } else {
                reject(new Error('Firebase connection timeout'));
            }
        }
        
        waitForFirebase();
    });
}

function performUserCheck(email, password, resolve, reject) {
    const { collection, query, where, getDocs } = window.firestoreFunctions;

    // Email ile sorgu (case insensitive için toLowerCase kullan)
    const q = query(collection(window.firestoreDb, "users"), where("email", "==", email.toLowerCase()));
    getDocs(q)
    .then(snapshot => {
        if (!snapshot.empty) {
            const userData = snapshot.docs[0].data();
            resolve(userData.password === password);
        } else {
            resolve(false);
        }
    })
    .catch(error => {
        reject(error);
    });
}

// Generate authentication token
function generateAuthToken(email) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const tokenData = btoa(`${email}:${timestamp}:${randomString}`);
    return tokenData;
}

// Check if user is already authenticated
function checkExistingAuth() {
    const authToken = localStorage.getItem('authToken');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (authToken && tokenExpiry && isAuthenticated === 'true') {
        const currentTime = Date.now();
        if (currentTime < parseInt(tokenExpiry)) {
            // Token is still valid
            return true;
        } else {
            // Token expired, clear auth data
            clearAuthData();
        }
    }
    return false;
}

// Clear authentication data
function clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUserEmail');
}

// Giriş sayfasında admin mode'u sıfırla ve güvenli moda geç
function resetToSafeMode() {
    localStorage.setItem('adminMode', 'safe');
    localStorage.setItem('adminModeText', 'Güvenli Mod');
    document.body.classList.remove('admin-user');
}

// Export functions to global scope
window.checkUserByEmailInFirebase = checkUserByEmailInFirebase;
window.generateAuthToken = generateAuthToken;
window.checkExistingAuth = checkExistingAuth;
window.clearAuthData = clearAuthData;
window.resetToSafeMode = resetToSafeMode;
