// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    // Disable session timer for login page
    window.DISABLE_SESSION_TIMER = true;
    
    
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
    
    // Forgot Password Functionality
    initForgotPassword();
});

function initForgotPassword() {
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const verificationModal = document.getElementById('verificationModal');
    const resetPasswordModal = document.getElementById('resetPasswordModal');
    
    // Modal close buttons
    const closeForgotModal = document.getElementById('closeForgotModal');
    const closeVerificationModal = document.getElementById('closeVerificationModal');
    const closeResetModal = document.getElementById('closeResetModal');
    
    // Forms
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const verificationForm = document.getElementById('verificationForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    
    // Password confirmation
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const passwordMatchIndicator = document.getElementById('passwordMatchIndicator');
    const resetPasswordSubmit = document.getElementById('resetPasswordSubmit');
    
    // Resend code
    const resendCodeLink = document.getElementById('resendCodeLink');
    
    let currentEmail = '';
    
    // Open forgot password modal
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            forgotPasswordModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Close modals
    function closeAllModals() {
        forgotPasswordModal.classList.remove('show');
        verificationModal.classList.remove('show');
        resetPasswordModal.classList.remove('show');
        document.body.style.overflow = '';
    }
    
    if (closeForgotModal) closeForgotModal.addEventListener('click', closeAllModals);
    if (closeVerificationModal) closeVerificationModal.addEventListener('click', closeAllModals);
    if (closeResetModal) closeResetModal.addEventListener('click', closeAllModals);
    
    // Close modal when clicking outside
    [forgotPasswordModal, verificationModal, resetPasswordModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeAllModals();
                }
            });
        }
    });
    
    // Forgot password form submission
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('forgotEmail').value.trim();
            
            if (!email) {
                showError('E-posta adresi gereklidir');
                return;
            }
            
            try {
                const submitBtn = forgotPasswordForm.querySelector('.submit-btn');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';
                
                const response = await window.backendAPI.post('settings.php', {
                    action: 'forgot_password',
                    email: email
                });
                
                if (response.success) {
                    currentEmail = email;
                    forgotPasswordModal.classList.remove('show');
                    verificationModal.classList.add('show');
                    showSuccess('Doğrulama kodu e-posta adresinize gönderildi');
                } else {
                    showError(response.error || 'Bir hata oluştu');
                }
            } catch (error) {
                console.error('Forgot password error:', error);
                showError('Bir hata oluştu. Lütfen tekrar deneyin.');
            } finally {
                const submitBtn = forgotPasswordForm.querySelector('.submit-btn');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Kod Gönder';
            }
        });
    }
    
    // Verification form submission
    if (verificationForm) {
        verificationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const code = document.getElementById('verificationCode').value.trim();
            
            if (!code) {
                showError('Doğrulama kodu gereklidir');
                return;
            }
            
            if (code.length !== 6) {
                showError('Doğrulama kodu 6 haneli olmalıdır');
                return;
            }
            
            try {
                const submitBtn = verificationForm.querySelector('.submit-btn');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Doğrulanıyor...';
                
                // We'll verify the code during password reset
                verificationModal.classList.remove('show');
                resetPasswordModal.classList.add('show');
                
            } catch (error) {
                console.error('Verification error:', error);
                showError('Bir hata oluştu. Lütfen tekrar deneyin.');
            } finally {
                const submitBtn = verificationForm.querySelector('.submit-btn');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Kodu Doğrula';
            }
        });
    }
    
    // Reset password form submission
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newPass = newPassword.value.trim();
            const confirmPass = confirmPassword.value.trim();
            const code = document.getElementById('verificationCode').value.trim();
            
            if (!newPass || !confirmPass) {
                showError('Tüm alanları doldurun');
                return;
            }
            
            if (newPass.length < 6) {
                showError('Şifre en az 6 karakter olmalıdır');
                return;
            }
            
            if (newPass !== confirmPass) {
                showError('Şifreler eşleşmiyor');
                return;
            }
            
            try {
                const submitBtn = resetPasswordForm.querySelector('.submit-btn');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Güncelleniyor...';
                
                const response = await window.backendAPI.post('settings.php', {
                    action: 'reset_password',
                    email: currentEmail,
                    code: code,
                    new_password: newPass
                });
                
                if (response.success) {
                    closeAllModals();
                    showSuccess('Şifreniz başarıyla güncellendi. Artık yeni şifrenizle giriş yapabilirsiniz.');
                    // Clear form fields
                    document.getElementById('forgotEmail').value = '';
                    document.getElementById('verificationCode').value = '';
                    newPassword.value = '';
                    confirmPassword.value = '';
                    passwordMatchIndicator.style.display = 'none';
                } else {
                    showError(response.error || 'Şifre güncellenirken bir hata oluştu');
                }
            } catch (error) {
                console.error('Reset password error:', error);
                showError('Bir hata oluştu. Lütfen tekrar deneyin.');
            } finally {
                const submitBtn = resetPasswordForm.querySelector('.submit-btn');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Şifreyi Güncelle';
            }
        });
    }
    
    // Password confirmation check
    function checkPasswordMatch() {
        const newPass = newPassword.value.trim();
        const confirmPass = confirmPassword.value.trim();
        
        if (!newPass && !confirmPass) {
            passwordMatchIndicator.style.display = 'none';
            resetPasswordSubmit.disabled = false;
            return;
        }
        
        if (newPass && confirmPass) {
            if (newPass === confirmPass) {
                passwordMatchIndicator.className = 'password-match-indicator match';
                passwordMatchIndicator.textContent = '✓ Şifreler eşleşiyor';
                passwordMatchIndicator.style.display = 'block';
                resetPasswordSubmit.disabled = false;
            } else {
                passwordMatchIndicator.className = 'password-match-indicator no-match';
                passwordMatchIndicator.textContent = '✗ Şifreler eşleşmiyor';
                passwordMatchIndicator.style.display = 'block';
                resetPasswordSubmit.disabled = true;
            }
        } else {
            passwordMatchIndicator.style.display = 'none';
            resetPasswordSubmit.disabled = false;
        }
    }
    
    if (newPassword) newPassword.addEventListener('input', checkPasswordMatch);
    if (confirmPassword) confirmPassword.addEventListener('input', checkPasswordMatch);
    
    // Resend code
    if (resendCodeLink) {
        resendCodeLink.addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (!currentEmail) {
                showError('E-posta adresi bulunamadı');
                return;
            }
            
            try {
                resendCodeLink.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';
                
                const response = await window.backendAPI.post('settings.php', {
                    action: 'forgot_password',
                    email: currentEmail
                });
                
                if (response.success) {
                    showSuccess('Doğrulama kodu tekrar gönderildi');
                } else {
                    showError(response.error || 'Kod gönderilemedi');
                }
            } catch (error) {
                console.error('Resend code error:', error);
                showError('Bir hata oluştu. Lütfen tekrar deneyin.');
            } finally {
                resendCodeLink.innerHTML = 'Tekrar Gönder';
            }
        });
    }
}

function showSuccess(message) {
    const errorBubble = document.getElementById('errorBubble');
    const errorText = errorBubble.querySelector('.error-text');
    
    errorText.textContent = message;
    errorBubble.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    errorBubble.style.display = 'block';
    errorBubble.classList.remove('animate-out');
    errorBubble.classList.add('animate-in');
    
    setTimeout(() => {
        errorBubble.classList.remove('animate-in');
        errorBubble.classList.add('animate-out');
        setTimeout(() => {
            errorBubble.style.display = 'none';
            errorBubble.style.background = ''; // Reset background
        }, 400);
    }, 3000);
}

function showError(message) {
    const errorBubble = document.getElementById('errorBubble');
    const errorText = errorBubble.querySelector('.error-text');
    
    errorText.textContent = message;
    errorBubble.style.display = 'block';
    errorBubble.classList.remove('animate-out');
    errorBubble.classList.add('animate-in');
    
    setTimeout(() => {
        errorBubble.classList.remove('animate-in');
        errorBubble.classList.add('animate-out');
        setTimeout(() => {
            errorBubble.style.display = 'none';
        }, 400);
    }, 3000);
}
