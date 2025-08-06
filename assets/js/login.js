// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    // Disable session timer for login page
    window.DISABLE_SESSION_TIMER = true;
    
    resetToSafeMode();
    
    const form = document.querySelector('.login-form');
    const errorBubble = document.getElementById('errorBubble');
    
    // Form submit handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const rememberMe = document.getElementById('remember').checked;

        // Firestore'da email ile arama
        checkUserByEmailInFirebase(email, password)
        .then(isValid => {
            if (isValid) {
                // Generate authentication token
                const authToken = generateAuthToken(email);
                
                // "Beni hatırla" seçeneğine göre token süresi belirleme
                let tokenExpiry;
                if (rememberMe) {
                    // Beni hatırla aktifse 30 gün
                    tokenExpiry = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 gün
                } else {
                    // Beni hatırla kapalıysa 24 saat
                    tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 saat
                }
                
                // Store authentication data
                localStorage.setItem('currentUserId', email);
                localStorage.setItem('currentUserEmail', email);
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('tokenExpiry', tokenExpiry.toString());
                localStorage.setItem('isAuthenticated', 'true');
                
                // "Beni hatırla" seçeneği kontrolü
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                    localStorage.setItem('rememberMeExpiry', (Date.now() + (30 * 24 * 60 * 60 * 1000)).toString()); // 30 gün sonra
                } else {
                    localStorage.removeItem('rememberMe');
                    localStorage.removeItem('rememberMeExpiry');
                }
                
                document.getElementById('loadingScreen').style.display = 'flex';
                
                setTimeout(function() {
                    window.location.href = 'database.html';
                }, 1500);
            } else {
                errorBubble.classList.remove('hide');
                errorBubble.classList.add('show');
                errorBubble.style.display = 'block';
                setTimeout(function() {
                    errorBubble.classList.remove('show');
                    errorBubble.classList.add('hide');
                    setTimeout(() => {
                        errorBubble.style.display = 'none';
                    }, 400); // CSS transition süresi
                }, 3000); // 3 saniye göster
            }
        })
        .catch(error => {
            console.error('🔥 Giriş hatası:', error);
            errorBubble.classList.remove('hide');
            errorBubble.classList.add('show');
            errorBubble.style.display = 'block';
            setTimeout(function() {
                errorBubble.classList.remove('show');
                errorBubble.classList.add('hide');
                setTimeout(() => {
                    errorBubble.style.display = 'none';
                }, 400);
            }, 3000);
        });
    });
    
    // Check if user is already authenticated and remember me is enabled
    if (checkExistingAuth()) {
        const rememberMe = localStorage.getItem('rememberMe');
        const rememberMeExpiry = localStorage.getItem('rememberMeExpiry');
        
        if (rememberMe === 'true') {
            // "Beni hatırla" aktif ama süresini kontrol et
            if (rememberMeExpiry && Date.now() < parseInt(rememberMeExpiry)) {
                // Beni hatırla süresi henüz dolmamış - direkt siteye yönlendir
                document.getElementById('loadingScreen').style.display = 'flex';
                setTimeout(function() {
                    window.location.href = 'database.html';
                }, 800);
                return;
            } else {
                // Beni hatırla süresi dolmuş - temizle
                clearAuthData();
            }
        } else {
            // Beni hatırla aktif değil - token'ı temizle ve giriş formu göster
            clearAuthData();
        }
    }
});
