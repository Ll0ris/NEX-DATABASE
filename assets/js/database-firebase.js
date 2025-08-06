// Database Page Firebase Configuration with Auth Check
// Hemen localStorage kontrol et
function quickAuthCheck() {
    return new Promise((resolve) => {
        function checkAuth() {
            const authToken = localStorage.getItem('authToken');
            const tokenExpiry = localStorage.getItem('tokenExpiry');
            const isAuthenticated = localStorage.getItem('isAuthenticated');
            
            if (!authToken || !tokenExpiry || isAuthenticated !== 'true') {
                // Eğer localStorage boşsa, biraz bekle ve tekrar dene
                if (Object.keys(localStorage).length === 0) {
                    setTimeout(checkAuth, 200);
                    return;
                }
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 500);
                resolve(false);
                return;
            }
            
            const currentTime = Date.now();
            if (currentTime >= parseInt(tokenExpiry)) {
                localStorage.clear();
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 500);
                resolve(false);
                return;
            }
            
            resolve(true);
        }
        
        checkAuth();
    });
}

// Hemen kontrol et
quickAuthCheck().then(authResult => {
    if (authResult) {
        // Auth başarılıysa Firebase'i yükle
        initializeFirebase();
    } else {
        // Auth başarısızsa Firebase'i yükleme ve dur
        console.error('Authentication failed, stopping page load...');
    }
});

function initializeFirebase() {
    // Import Firebase functions
    import('https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js').then(({ initializeApp }) => {
        import('https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js').then(({ getFirestore, collection, doc, getDoc, setDoc, addDoc, getDocs, query, where, updateDoc }) => {
            
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
                where,
                updateDoc
            };
        });
    });
}
