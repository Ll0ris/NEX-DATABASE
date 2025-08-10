// Theme Loader - Must be loaded first to prevent flash
(function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Set initial theme icon class to prevent flash
    if (savedTheme === 'dark') {
        document.documentElement.style.setProperty('--initial-theme-icon', '"\\f186"'); // moon
    } else {
        document.documentElement.style.setProperty('--initial-theme-icon', '"\\f185"'); // sun
    }
})();
