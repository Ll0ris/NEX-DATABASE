// Server Status Page Functions
// Auto-refresh metrics every 30 seconds
setInterval(updateMetrics, 30000);

function updateMetrics() {
    // Simulate real-time metric updates
    const cpuUsage = Math.floor(Math.random() * 20) + 40; // 40-60%
    const memoryUsage = Math.floor(Math.random() * 15) + 70; // 70-85%
    const diskUsage = Math.floor(Math.random() * 10) + 30; // 30-40%
    const networkSpeed = Math.floor(Math.random() * 10) + 8; // 8-18 MB/s

    // Update CPU
    const cpuValue = document.querySelector('.metric-card:nth-child(1) .metric-value');
    const cpuProgress = document.querySelector('.metric-card:nth-child(1) .progress');
    cpuValue.textContent = `${cpuUsage}%`;
    cpuProgress.style.width = `${cpuUsage}%`;

    // Update Memory
    const memoryValue = document.querySelector('.metric-card:nth-child(2) .metric-value');
    const memoryProgress = document.querySelector('.metric-card:nth-child(2) .progress');
    memoryValue.textContent = `${memoryUsage}%`;
    memoryProgress.style.width = `${memoryUsage}%`;
    
    // Add warning class if usage is high
    if (memoryUsage > 75) {
        memoryValue.classList.add('warning');
        memoryProgress.classList.add('warning');
    } else {
        memoryValue.classList.remove('warning');
        memoryProgress.classList.remove('warning');
    }

    // Update Network
    const networkValue = document.querySelector('.metric-card:nth-child(4) .metric-value');
    networkValue.textContent = `${networkSpeed} MB/s`;
}

function refreshServices() {
    // Simulate service refresh
    const button = event.target.closest('.btn-refresh');
    const icon = button.querySelector('i');
    
    icon.style.animation = 'spin 1s linear infinite';
    button.disabled = true;
    
    setTimeout(() => {
        icon.style.animation = '';
        button.disabled = false;
        
        // Show success message
        showNotification('Servisler başarıyla yenilendi', 'success');
    }, 2000);
}

function viewAllEvents() {
    // Simulate navigation to full events page
    showNotification('Tüm olaylar görüntüleniyor...', 'info');
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
        <span>${message}</span>
    `;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Service action handlers
document.addEventListener('click', function(e) {
    if (e.target.closest('.btn-restart')) {
        showNotification('Servis yeniden başlatılıyor...', 'info');
    } else if (e.target.closest('.btn-test')) {
        showNotification('Bağlantı testi başarılı', 'success');
    } else if (e.target.closest('.btn-start')) {
        showNotification('Servis başlatılıyor...', 'info');
    }
});

// Initialize metrics update
updateMetrics();

// Export functions to global scope
window.updateMetrics = updateMetrics;
window.refreshServices = refreshServices;
window.viewAllEvents = viewAllEvents;
window.showNotification = showNotification;
