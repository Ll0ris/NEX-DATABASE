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
window.generateAuthToken = generateAuthToken;
window.checkExistingAuth = checkExistingAuth;
window.clearAuthData = clearAuthData;
