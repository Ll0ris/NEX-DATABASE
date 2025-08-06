// Debug Auth Functions
function updateDisplay() {
    const authData = {
        authToken: localStorage.getItem('authToken'),
        tokenExpiry: localStorage.getItem('tokenExpiry'),
        isAuthenticated: localStorage.getItem('isAuthenticated'),
        currentUserId: localStorage.getItem('currentUserId'),
        currentUserEmail: localStorage.getItem('currentUserEmail'),
        rememberMe: localStorage.getItem('rememberMe'),
        rememberMeExpiry: localStorage.getItem('rememberMeExpiry')
    };
    
    // Tarihleri okunabilir hale getir
    if (authData.tokenExpiry) {
        authData.tokenExpiryDate = new Date(parseInt(authData.tokenExpiry)).toLocaleString('tr-TR');
    }
    if (authData.rememberMeExpiry) {
        authData.rememberMeExpiryDate = new Date(parseInt(authData.rememberMeExpiry)).toLocaleString('tr-TR');
        const remainingDays = Math.ceil((parseInt(authData.rememberMeExpiry) - Date.now()) / (24 * 60 * 60 * 1000));
        authData.remainingDays = remainingDays > 0 ? `${remainingDays} gün kaldı` : 'Süresi dolmuş';
    }
    
    document.getElementById('currentAuth').innerHTML = '<pre>' + JSON.stringify(authData, null, 2) + '</pre>';
}

function setTestAuth() {
    const email = 'test@example.com';
    const authToken = btoa(`${email}:${Date.now()}:testtoken123`);
    const tokenExpiry = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 gün
    const rememberMeExpiry = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 gün
    
    localStorage.setItem('currentUserId', email);
    localStorage.setItem('currentUserEmail', email);
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('tokenExpiry', tokenExpiry.toString());
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('rememberMe', 'true');
    localStorage.setItem('rememberMeExpiry', rememberMeExpiry.toString());
    
    console.log('✅ Test auth verileri ayarlandı (30 gün geçerli)');
    updateDisplay();
}

function clearAuth() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUserEmail');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('rememberMeExpiry');
    
    console.log('🗑️ Auth verileri temizlendi');
    updateDisplay();
}

function checkAuth() {
    const authToken = localStorage.getItem('authToken');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    console.log('Auth kontrol:', {
        hasToken: !!authToken,
        hasExpiry: !!tokenExpiry,
        isAuth: isAuthenticated,
        currentTime: Date.now(),
        expiryTime: tokenExpiry ? parseInt(tokenExpiry) : null,
        isValid: authToken && tokenExpiry && isAuthenticated === 'true' && Date.now() < parseInt(tokenExpiry)
    });
}

function goToDatabase() {
    window.location.href = 'pages/database.html';
}

// Sayfa yüklendiğinde mevcut durumu göster
updateDisplay();
setInterval(updateDisplay, 1000); // Her saniye güncelle
