// Settings Page Script

class SettingsManager {
    constructor() {
        this.currentStep = {
            email: 1,
            password: 1
        };
        this.emailVerificationState = {
            currentEmailVerified: false,
            newEmailSet: false
        };
        this.passwordVerificationState = {
            currentPasswordVerified: false
        };
        this.tempData = {};
        
        this.init();
    }

    init() {
        this.loadCurrentEmail();
        this.bindEvents();
        this.initPasswordValidation();
    }

    async loadCurrentEmail() {
        try {
            // Get current user email from localStorage or API
            const currentEmail = localStorage.getItem('currentUserEmail');
            if (currentEmail) {
                const emailDisplay = document.getElementById('currentEmailDisplay').querySelector('.email-text');
                emailDisplay.textContent = currentEmail;
            }
        } catch (error) {
            console.error('Error loading current email:', error);
        }
    }

    bindEvents() {
        // Email change events
        document.getElementById('sendCurrentEmailCode').addEventListener('click', () => this.sendCurrentEmailCode());
        document.getElementById('verifyCurrentEmailCode').addEventListener('click', () => this.verifyCurrentEmailCode());
        document.getElementById('resendCurrentEmailCode').addEventListener('click', () => this.sendCurrentEmailCode());
        
        document.getElementById('sendNewEmailCode').addEventListener('click', () => this.sendNewEmailCode());
        document.getElementById('changeEmail').addEventListener('click', () => this.changeEmail());
        document.getElementById('resendNewEmailCode').addEventListener('click', () => this.sendNewEmailCode());
        
        document.getElementById('resetEmailForm').addEventListener('click', () => this.resetEmailForm());

        // Password change events
        document.getElementById('validateCurrentPassword').addEventListener('click', () => this.validateCurrentPassword());
        document.getElementById('sendPasswordChangeCode').addEventListener('click', () => this.sendPasswordChangeCode());
        document.getElementById('changePassword').addEventListener('click', () => this.changePassword());
        document.getElementById('resendPasswordChangeCode').addEventListener('click', () => this.sendPasswordChangeCode());
        
        document.getElementById('resetPasswordForm').addEventListener('click', () => this.resetPasswordForm());

        // Input events
        document.getElementById('currentEmailCode').addEventListener('input', (e) => {
            this.formatCodeInput(e.target);
        });
        
        document.getElementById('newEmailCode').addEventListener('input', (e) => {
            this.formatCodeInput(e.target);
        });
        
        document.getElementById('passwordChangeCode').addEventListener('input', (e) => {
            this.formatCodeInput(e.target);
        });

        // Enter key events
        document.getElementById('currentEmailCode').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.verifyCurrentEmailCode();
        });
        
        document.getElementById('newEmailCode').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.changeEmail();
        });
        
        document.getElementById('passwordChangeCode').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.changePassword();
        });
        
        document.getElementById('currentPassword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.validateCurrentPassword();
        });
    }

    initPasswordValidation() {
        const newPasswordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        
        newPasswordInput.addEventListener('input', () => this.validatePassword());
        confirmPasswordInput.addEventListener('input', () => this.validatePasswordMatch());
    }

    // Email Change Methods
    async sendCurrentEmailCode() {
        const button = document.getElementById('sendCurrentEmailCode');
        const codeGroup = document.getElementById('currentEmailCodeGroup');
        
        try {
            this.showLoading();
            this.setButtonLoading(button, 'Kod gönderiliyor...');
            
            const response = await window.backendAPI.post('settings.php', {
                action: 'send_current_email_code'
            });
            
            if (response.success) {
                this.showToast('success', 'Doğrulama Kodu Gönderildi', 'Mevcut e-posta adresinizi kontrol edin');
                codeGroup.style.display = 'block';
                document.getElementById('currentEmailCode').focus();
            } else {
                this.showToast('error', 'Kod Gönderilemedi', response.message || 'Bir hata oluştu');
            }
        } catch (error) {
            console.error('Error sending current email code:', error);
            this.showToast('error', 'Bağlantı Hatası', 'Sunucu ile bağlantı kurulamadı');
        } finally {
            this.hideLoading();
            this.resetButtonLoading(button, 'Mevcut E-postaya Kod Gönder');
        }
    }

    async verifyCurrentEmailCode() {
        const code = document.getElementById('currentEmailCode').value.trim();
        const button = document.getElementById('verifyCurrentEmailCode');
        
        if (!code || code.length !== 6) {
            this.showToast('warning', 'Geçersiz Kod', 'Lütfen 6 haneli doğrulama kodunu girin');
            return;
        }

        // Debug: Log the code being sent
        console.log('Verifying email code:', code);

        try {
            this.showLoading();
            this.setButtonLoading(button, 'Doğrulanıyor...');
            
            const response = await window.backendAPI.post('settings.php', {
                action: 'verify_current_email',
                code: code
            });
            
            // Debug: Log the full response
            console.log('Email verification response:', response);
            
            if (response.success) {
                this.emailVerificationState.currentEmailVerified = true;
                this.showToast('success', 'E-posta Doğrulandı', 'Şimdi yeni e-posta adresinizi girebilirsiniz');
                this.showEmailStep(2);
            } else {
                // More detailed error message
                const errorMsg = response.message || response.error || 'Geçersiz kod';
                console.error('Email verification failed:', response);
                this.showToast('error', 'Doğrulama Başarısız', errorMsg);
                document.getElementById('currentEmailCode').value = '';
                document.getElementById('currentEmailCode').focus();
            }
        } catch (error) {
            console.error('Error verifying current email code:', error);
            this.showToast('error', 'Bağlantı Hatası', 'Sunucu ile bağlantı kurulamadı');
        } finally {
            this.hideLoading();
            this.resetButtonLoading(button, 'Doğrula');
        }
    }

    async sendNewEmailCode() {
        const newEmail = document.getElementById('newEmail').value.trim();
        const button = document.getElementById('sendNewEmailCode');
        const codeGroup = document.getElementById('newEmailCodeGroup');
        
        if (!this.isValidEmail(newEmail)) {
            this.showToast('warning', 'Geçersiz E-posta', 'Lütfen geçerli bir e-posta adresi girin');
            return;
        }

        try {
            this.showLoading();
            this.setButtonLoading(button, 'Kod gönderiliyor...');
            
            const response = await window.backendAPI.post('settings.php', {
                action: 'send_new_email_code',
                new_email: newEmail
            });
            
            if (response.success) {
                this.tempData.newEmail = newEmail;
                this.showToast('success', 'Doğrulama Kodu Gönderildi', `${newEmail} adresini kontrol edin`);
                codeGroup.style.display = 'block';
                document.getElementById('newEmailCode').focus();
            } else {
                this.showToast('error', 'Kod Gönderilemedi', response.message || 'Bir hata oluştu');
            }
        } catch (error) {
            console.error('Error sending new email code:', error);
            this.showToast('error', 'Bağlantı Hatası', 'Sunucu ile bağlantı kurulamadı');
        } finally {
            this.hideLoading();
            this.resetButtonLoading(button, 'Yeni E-postaya Kod Gönder');
        }
    }

    async changeEmail() {
        const newEmail = this.tempData.newEmail;
        const code = document.getElementById('newEmailCode').value.trim();
        const button = document.getElementById('changeEmail');
        
        if (!code || code.length !== 6) {
            this.showToast('warning', 'Geçersiz Kod', 'Lütfen 6 haneli doğrulama kodunu girin');
            return;
        }

        // Debug: Log the code being sent
        console.log('Changing email with code:', code, 'to new email:', newEmail);

        try {
            this.showLoading();
            this.setButtonLoading(button, 'E-posta değiştiriliyor...');
            
            const response = await window.backendAPI.post('settings.php', {
                action: 'change_email',
                new_email: newEmail,
                code: code
            });
            
            // Debug: Log the full response
            console.log('Email change response:', response);
            
            if (response.success) {
                // Update displayed email
                const emailDisplay = document.getElementById('currentEmailDisplay').querySelector('.email-text');
                emailDisplay.textContent = newEmail;
                
                // Update localStorage
                localStorage.setItem('currentUserEmail', newEmail);
                
                this.showToast('success', 'E-posta Değiştirildi', 'E-posta adresiniz başarıyla güncellendi');
                this.resetEmailForm();
            } else {
                // More detailed error message
                const errorMsg = response.message || response.error || 'Geçersiz kod';
                console.error('Email change failed:', response);
                this.showToast('error', 'E-posta Değiştirilemedi', errorMsg);
                document.getElementById('newEmailCode').value = '';
                document.getElementById('newEmailCode').focus();
            }
        } catch (error) {
            console.error('Error changing email:', error);
            this.showToast('error', 'Bağlantı Hatası', 'Sunucu ile bağlantı kurulamadı');
        } finally {
            this.hideLoading();
            this.resetButtonLoading(button, 'E-postayı Değiştir');
        }
    }

    // Password Change Methods
    async validateCurrentPassword() {
        const currentPassword = document.getElementById('currentPassword').value.trim();
        const button = document.getElementById('validateCurrentPassword');
        
        if (!currentPassword) {
            this.showToast('warning', 'Şifre Gerekli', 'Lütfen mevcut şifrenizi girin');
            return;
        }

        try {
            this.showLoading();
            this.setButtonLoading(button, 'Şifre doğrulanıyor...');
            
            const response = await window.backendAPI.post('settings.php', {
                action: 'validate_current_password',
                current_password: currentPassword
            });
            
            if (response.success) {
                this.passwordVerificationState.currentPasswordVerified = true;
                this.showToast('success', 'Şifre Doğrulandı', 'Şimdi yeni şifrenizi belirleyebilirsiniz');
                this.showPasswordStep(2);
            } else {
                this.showToast('error', 'Şifre Hatalı', response.message || 'Mevcut şifre yanlış');
                document.getElementById('currentPassword').value = '';
                document.getElementById('currentPassword').focus();
            }
        } catch (error) {
            console.error('Error validating current password:', error);
            this.showToast('error', 'Bağlantı Hatası', 'Sunucu ile bağlantı kurulamadı');
        } finally {
            this.hideLoading();
            this.resetButtonLoading(button, 'Şifreyi Doğrula');
        }
    }

    async sendPasswordChangeCode() {
        const newPassword = document.getElementById('newPassword').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();
        const button = document.getElementById('sendPasswordChangeCode');
        const codeGroup = document.getElementById('passwordCodeGroup');
        
        if (!this.validatePasswordRequirements(newPassword)) {
            this.showToast('warning', 'Şifre Gereksinimleri', 'Şifre gereksinimlerini karşılamıyor');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            this.showToast('warning', 'Şifreler Eşleşmiyor', 'Yeni şifre ve tekrarı aynı olmalı');
            return;
        }

        try {
            this.showLoading();
            this.setButtonLoading(button, 'Kod gönderiliyor...');
            
            const response = await window.backendAPI.post('settings.php', {
                action: 'send_password_change_code'
            });
            
            if (response.success) {
                this.tempData.newPassword = newPassword;
                this.showToast('success', 'Doğrulama Kodu Gönderildi', 'E-posta adresinizi kontrol edin');
                codeGroup.style.display = 'block';
                document.getElementById('passwordChangeCode').focus();
            } else {
                this.showToast('error', 'Kod Gönderilemedi', response.message || 'Bir hata oluştu');
            }
        } catch (error) {
            console.error('Error sending password change code:', error);
            this.showToast('error', 'Bağlantı Hatası', 'Sunucu ile bağlantı kurulamadı');
        } finally {
            this.hideLoading();
            this.resetButtonLoading(button, 'Doğrulama Kodu Gönder');
        }
    }

    async changePassword() {
        const newPassword = this.tempData.newPassword;
        const code = document.getElementById('passwordChangeCode').value.trim();
        const button = document.getElementById('changePassword');
        
        if (!code || code.length !== 6) {
            this.showToast('warning', 'Geçersiz Kod', 'Lütfen 6 haneli doğrulama kodunu girin');
            return;
        }

        // Debug: Log the code being sent
        console.log('Changing password with code:', code);

        try {
            this.showLoading();
            this.setButtonLoading(button, 'Şifre değiştiriliyor...');
            
            const response = await window.backendAPI.post('settings.php', {
                action: 'change_password',
                new_password: newPassword,
                code: code
            });
            
            // Debug: Log the full response
            console.log('Password change response:', response);
            
            if (response.success) {
                this.showToast('success', 'Şifre Değiştirildi', 'Şifreniz başarıyla güncellendi');
                this.resetPasswordForm();
            } else {
                // More detailed error message
                const errorMsg = response.message || response.error || 'Geçersiz kod';
                console.error('Password change failed:', response);
                this.showToast('error', 'Şifre Değiştirilemedi', errorMsg);
                document.getElementById('passwordChangeCode').value = '';
                document.getElementById('passwordChangeCode').focus();
            }
        } catch (error) {
            console.error('Error changing password:', error);
            this.showToast('error', 'Bağlantı Hatası', 'Sunucu ile bağlantı kurulamadı');
        } finally {
            this.hideLoading();
            this.resetButtonLoading(button, 'Şifreyi Değiştir');
        }
    }

    // Step Management
    showEmailStep(step) {
        document.getElementById('emailStep1').style.display = step === 1 ? 'block' : 'none';
        document.getElementById('emailStep2').style.display = step === 2 ? 'block' : 'none';
        this.currentStep.email = step;
    }

    showPasswordStep(step) {
        document.getElementById('passwordStep1').style.display = step === 1 ? 'block' : 'none';
        document.getElementById('passwordStep2').style.display = step === 2 ? 'block' : 'none';
        this.currentStep.password = step;
    }

    // Reset Forms
    resetEmailForm() {
        this.showEmailStep(1);
        this.emailVerificationState = {
            currentEmailVerified: false,
            newEmailSet: false
        };
        this.tempData.newEmail = null;
        
        document.getElementById('currentEmailCode').value = '';
        document.getElementById('newEmail').value = '';
        document.getElementById('newEmailCode').value = '';
        document.getElementById('currentEmailCodeGroup').style.display = 'none';
        document.getElementById('newEmailCodeGroup').style.display = 'none';
    }

    resetPasswordForm() {
        this.showPasswordStep(1);
        this.passwordVerificationState = {
            currentPasswordVerified: false
        };
        this.tempData.newPassword = null;
        
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        document.getElementById('passwordChangeCode').value = '';
        document.getElementById('passwordCodeGroup').style.display = 'none';
        
        // Reset password requirements display
        this.updatePasswordRequirements('');
    }

    // Validation Methods
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePasswordRequirements(password) {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        return Object.values(requirements).every(req => req);
    }

    validatePassword() {
        const password = document.getElementById('newPassword').value;
        this.updatePasswordRequirements(password);
    }

    validatePasswordMatch() {
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const confirmInput = document.getElementById('confirmPassword');
        
        if (confirmPassword && newPassword !== confirmPassword) {
            confirmInput.style.borderColor = '#ef4444';
        } else {
            confirmInput.style.borderColor = 'var(--border-color)';
        }
    }

    updatePasswordRequirements(password) {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        Object.keys(requirements).forEach(rule => {
            const element = document.querySelector(`[data-rule="${rule}"]`);
            if (element) {
                if (requirements[rule]) {
                    element.classList.add('valid');
                } else {
                    element.classList.remove('valid');
                }
            }
        });
    }

    // Utility Methods
    formatCodeInput(input) {
        let value = input.value.replace(/[^0-9]/g, '');
        if (value.length > 6) {
            value = value.slice(0, 6);
        }
        input.value = value;
    }

    setButtonLoading(button, text) {
        button.disabled = true;
        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
    }

    resetButtonLoading(button, originalText) {
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-${this.getButtonIcon(originalText)}"></i> ${originalText}`;
    }

    getButtonIcon(text) {
        if (text.includes('Gönder')) return 'paper-plane';
        if (text.includes('Doğrula')) return 'check';
        if (text.includes('Değiştir')) return 'save';
        return 'cog';
    }

    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    showToast(type, title, message) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${icons[type]}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => this.removeToast(toast), 5000);
        
        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.removeToast(toast);
        });
    }

    removeToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
}

// Password visibility toggle
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new SettingsManager();
});
