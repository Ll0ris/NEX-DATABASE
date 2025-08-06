// Reports Page Functions
// Download report function
function downloadReport(type) {
    // Simulated download - replace with actual implementation
    const fileName = `nex_rapor_${new Date().toISOString().split('T')[0]}.${type}`;
    
    // Create a temporary link for download simulation
    const link = document.createElement('a');
    link.href = '#';
    link.download = fileName;
    
    // Show success message
    alert(`${type.toUpperCase()} raporu indirilmeye başladı: ${fileName}`);
    
    // Here you would implement actual report generation and download
    console.log(`Downloading ${type} report: ${fileName}`);
}

// Load statistics
function loadStatistics() {
    // Simulated data - replace with actual Firebase data
    document.getElementById('totalMembers').textContent = '127';
    document.getElementById('activeMembers').textContent = '98';
    document.getElementById('newMembers').textContent = '12';
    document.getElementById('totalRecords').textContent = '2,456';
    document.getElementById('weeklyRecords').textContent = '34';
    document.getElementById('dataSize').textContent = '15.7 MB';
}

// Load statistics when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadStatistics();
});

// Export functions to global scope
window.downloadReport = downloadReport;
window.loadStatistics = loadStatistics;
