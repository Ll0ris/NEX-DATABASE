// Test Setup Functions
function setupTestUser() {
    localStorage.setItem('currentUserEmail', 'test@example.com');
    document.getElementById('result').innerHTML = '<p style="color: green;">Test user email set to: test@example.com</p>';
}

function checkCurrentUser() {
    const email = localStorage.getItem('currentUserEmail');
    document.getElementById('result').innerHTML = `<p>Current user email: ${email || 'Not set'}</p>`;
}
