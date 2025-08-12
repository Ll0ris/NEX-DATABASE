// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    // Disable session timer for login page
    window.DISABLE_SESSION_TIMER = true;
    
    resetToSafeMode();
    
    const form = document.querySelector('.login-form');
    const errorBubble = document.getElementById('errorBubble');
    
    // Form submit handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const rememberMe = document.getElementById('remember').checked;

        try {
            // Backend baseURL dinamik ayar: window.__BACKEND_BASE_URL__ veya localStorage üzerinden
            if (window.backendAPI) {
                const stored = localStorage.getItem('backendBaseURL');
                if (typeof window.__BACKEND_BASE_URL__ === 'string' && window.__BACKEND_BASE_URL__.length > 0) {
                    window.backendAPI.baseURL = window.__BACKEND_BASE_URL__;
                } else if (stored) {
                    window.backendAPI.baseURL = stored;
                }
            }

            // Ortak Backend API'yi kullan
            const data = await window.backendAPI.post('login.php', { email, password, rememberMe });

            if (data && data.success) {
                const authToken = data.token || generateAuthToken(email);

                let tokenExpiry;
                if (data.tokenExpiry) {
                    tokenExpiry = parseInt(data.tokenExpiry, 10);
                } else if (rememberMe) {
                    tokenExpiry = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 gün
                } else {
                    tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 saat
                }

                const user = data.user || {};
                const resolvedUserId = data.userId || user.id || email;
                const resolvedEmail = data.email || user.email || email;
                const resolvedRoleRaw = data.role || user.role || '';
                const resolvedRole = typeof resolvedRoleRaw === 'string' ? resolvedRoleRaw.toLowerCase() : '';

                localStorage.setItem('currentUserId', resolvedUserId);
                localStorage.setItem('currentUserEmail', resolvedEmail);
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('tokenExpiry', tokenExpiry.toString());
                localStorage.setItem('isAuthenticated', 'true');

                // Role kaydı: 'admin' ya da 'Admin' durumlarında admin erişimi aç
                if (resolvedRole === 'admin') {
                    localStorage.setItem('userRole', 'admin');
                    localStorage.setItem('realAdminAccess', 'true');
                }else {
                    // Varsayılan kullanıcı
                    localStorage.setItem('userRole', 'user');
                    localStorage.removeItem('realAdminAccess');
                }

                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                    const rememberExpiry = Date.now() + (30 * 24 * 60 * 60 * 1000);
                    localStorage.setItem('rememberMeExpiry', rememberExpiry.toString());
                } else {
                    localStorage.removeItem('rememberMe');
                    localStorage.removeItem('rememberMeExpiry');
                }

                document.getElementById('loadingScreen').style.display = 'flex';

                setTimeout(function() {
                    window.location.href = 'database.html';
                }, 1500);
            } else {
                console.error('Login failed:', data && data.message);
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
            }
        } catch (error) {
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
        }
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
