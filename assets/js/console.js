// Console Page Functions
let commandHistory = [];
let historyIndex = -1;

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const tabName = this.dataset.tab;
        
        // Remove active class from all tabs and contents
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        this.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// Command input handling
document.getElementById('commandInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const command = this.value.trim();
        if (command) {
            executeCommand(command);
            commandHistory.unshift(command);
            historyIndex = -1;
            this.value = '';
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            this.value = commandHistory[historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            this.value = commandHistory[historyIndex];
        } else if (historyIndex === 0) {
            historyIndex = -1;
            this.value = '';
        }
    }
});

function executeCommand(command) {
    const output = document.getElementById('terminalOutput');
    const timestamp = new Date().toLocaleString('tr-TR');
    
    // Add command to output
    const commandEntry = document.createElement('div');
    commandEntry.className = 'log-entry';
    commandEntry.innerHTML = `
        <span class="timestamp">[${timestamp}]</span>
        <span class="prompt">nex@database:~$</span>
        <span class="message">${command}</span>
    `;
    output.appendChild(commandEntry);
    
    // Process command
    let response = '';
    switch (command.toLowerCase()) {
        case 'help':
            response = `Mevcut komutlar:
help - Bu yardım menüsünü gösterir
status - Sistem durumunu gösterir
users - Kullanıcı listesini gösterir
clear - Terminali temizler
backup - Veritabanı yedeği oluşturur
logs - Son 10 log kaydını gösterir`;
            break;
        case 'status':
            response = `Sistem Durumu:
- Firebase: Bağlı ✓
- Kullanıcılar: 127 aktif
- Bellek: %78 kullanımda
- Disk: %45 dolu
- Çalışma süresi: 24 gün`;
            break;
        case 'users':
            response = `Son kullanıcılar:
- admin@nex.com (Çevrimiçi)
- user@nex.com (2 saat önce)
- test@nex.com (1 gün önce)`;
            break;
        case 'clear':
            clearConsole();
            return;
        case 'backup':
            response = 'Veritabanı yedeği başlatıldı... Bu işlem birkaç dakika sürebilir.';
            break;
        case 'logs':
            response = `Son log kayıtları:
[10:30] INFO: Sistem başlatıldı
[10:25] WARNING: Yüksek bellek kullanımı
[10:20] ERROR: Giriş hatası
[10:15] SUCCESS: Yedekleme tamamlandı`;
            break;
        default:
            response = `Bilinmeyen komut: ${command}. 'help' yazarak mevcut komutları görebilirsiniz.`;
    }
    
    // Add response to output
    const responseEntry = document.createElement('div');
    responseEntry.className = 'log-entry';
    responseEntry.innerHTML = `
        <span class="timestamp">[${timestamp}]</span>
        <span class="level info">SYSTEM</span>
        <span class="message" style="white-space: pre-line;">${response}</span>
    `;
    output.appendChild(responseEntry);
    
    // Scroll to bottom
    output.scrollTop = output.scrollHeight;
}

function clearConsole() {
    document.getElementById('terminalOutput').innerHTML = `
        <div class="log-entry system">
            <span class="timestamp">[${new Date().toLocaleString('tr-TR')}]</span>
            <span class="level info">INFO</span>
            <span class="message">Terminal temizlendi</span>
        </div>
    `;
}

function filterLogs() {
    // Simulated log filtering
    const level = document.getElementById('logLevel').value;
    const date = document.getElementById('logDate').value;
    
    console.log(`Filtering logs: Level=${level}, Date=${date}`);
    alert(`Loglar filtrelendi: ${level === 'all' ? 'Tüm seviyeler' : level}, Tarih: ${date}`);
}

function executeQuery() {
    const query = document.getElementById('sqlQuery').value;
    const output = document.getElementById('queryOutput');
    
    output.innerHTML = `
        <div class="log-entry">
            <span class="timestamp">[${new Date().toLocaleString('tr-TR')}]</span>
            <span class="level info">QUERY</span>
            <span class="message">Sorgu çalıştırılıyor...</span>
        </div>
        <div class="log-entry">
            <span class="timestamp">[${new Date().toLocaleString('tr-TR')}]</span>
            <span class="level success">RESULT</span>
            <span class="message">3 kayıt bulundu</span>
        </div>
        <div style="margin-top: 10px; color: #888;">
            Örnek sonuç:
            {
                "users": [
                    {"id": "1", "email": "admin@nex.com", "role": "admin"},
                    {"id": "2", "email": "user@nex.com", "role": "user"},
                    {"id": "3", "email": "test@nex.com", "role": "user"}
                ]
            }
        </div>
    `;
}

function exportLogs() {
    // Simulated log export
    const fileName = `nex_logs_${new Date().toISOString().split('T')[0]}.txt`;
    alert(`Loglar dışa aktarıldı: ${fileName}`);
}

// Export functions to global scope
window.executeCommand = executeCommand;
window.clearConsole = clearConsole;
window.filterLogs = filterLogs;
window.executeQuery = executeQuery;
window.exportLogs = exportLogs;
