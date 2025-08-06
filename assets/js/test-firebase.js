// Firebase Test Functions
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js';
import { getFirestore, collection, doc, getDoc, setDoc, addDoc, getDocs, query, where, updateDoc } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';

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

const resultDiv = document.getElementById('result');

document.getElementById('testUsers').addEventListener('click', async () => {
    try {
        const snapshot = await getDocs(collection(db, "users"));
        resultDiv.innerHTML = '<h3>Users Collection:</h3>';
        if (snapshot.empty) {
            resultDiv.innerHTML += '<p>No users found</p>';
        } else {
            snapshot.forEach((doc) => {
                const data = doc.data();
                resultDiv.innerHTML += `<p><strong>ID:</strong> ${doc.id}<br>
                                        <strong>Email:</strong> ${data.email}<br>
                                        <strong>Name:</strong> ${data.name}<br>
                                        <strong>Password:</strong> ${data.password}</p><hr>`;
            });
        }
    } catch (error) {
        resultDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
});

document.getElementById('addTestUser').addEventListener('click', async () => {
    try {
        await addDoc(collection(db, "users"), {
            email: "test@example.com",
            password: "123456",
            name: "Test Kullanıcı"
        });
        
        // localStorage'a kaydet
        localStorage.setItem('currentUserEmail', 'test@example.com');
        
        resultDiv.innerHTML = '<p style="color: green;">Test user added successfully! Email: test@example.com, Password: 123456</p>';
    } catch (error) {
        resultDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
});
