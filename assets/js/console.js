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

async function executeCommand(command) {
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

    // Local-only commands
    if (command.toLowerCase() === 'clear') {
        clearConsole();
        return;
    }

    // Defer command execution to backend
    let response = '';
    try {
        const payload = { action: 'execute', command };
        // baseURL is managed by backend-api.js
        const data = await (window.backendAPI
            ? window.backendAPI.post('console.php', payload)
            : fetch('console.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
              }).then(r => r.json()));

        if (data && data.success) {
            if (Array.isArray(data.lines)) {
                response = data.lines.join('\n');
            } else if (typeof data.message === 'string') {
                response = data.message;
            } else {
                response = JSON.stringify(data, null, 2);
            }
        } else {
            const err = (data && (data.error || data.message)) || 'Komut çalıştırılamadı';
            response = `Hata: ${err}`;
        }
    } catch (e) {
        response = `Hata: ${(e && e.message) || e}`;
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

async function filterLogs() {
    const level = document.getElementById('logLevel').value;
    const date = document.getElementById('logDate').value;
    const output = document.getElementById('terminalOutput');
    const ts = new Date().toLocaleString('tr-TR');

    try {
        const payload = { action: 'logs', level, date };
        const data = await (window.backendAPI
            ? window.backendAPI.post('console.php', payload)
            : fetch('console.php', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload)
              }).then(r => r.json()));
        const lines = (data && data.success && Array.isArray(data.lines)) ? data.lines : [ (data && (data.message || data.error)) || 'Log bulunamadı' ];
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `
            <span class="timestamp">[${ts}]</span>
            <span class="level info">LOGS</span>
            <span class="message" style="white-space: pre-line;">${lines.join('\n')}</span>
        `;
        output.appendChild(entry);
        output.scrollTop = output.scrollHeight;
    } catch (e) {
        alert('Loglar alınamadı: ' + (e && e.message ? e.message : e));
    }
}

async function executeQuery() {
    const sql = document.getElementById('sqlQuery').value;
    const output = document.getElementById('queryOutput');
    const ts = new Date().toLocaleString('tr-TR');

    output.innerHTML = `
        <div class="log-entry">
            <span class="timestamp">[${ts}]</span>
            <span class="level info">QUERY</span>
            <span class="message">Sorgu çalıştırılıyor...</span>
        </div>
    `;

    try {
        const payload = { action: 'query', sql };
        const data = await (window.backendAPI
            ? window.backendAPI.post('console.php', payload)
            : fetch('console.php', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload)
              }).then(r => r.json()));

        const success = data && data.success;
        const rows = Array.isArray(data?.rows) ? data.rows : [];
        const rowCount = typeof data?.rowCount === 'number' ? data.rowCount : rows.length;
        const text = success ? `${rowCount} kayıt bulundu` : `Hata: ${(data && (data.error || data.message)) || 'Sorgu hatası'}`;

        const result = document.createElement('div');
        result.className = 'log-entry';
        result.innerHTML = `
            <span class="timestamp">[${new Date().toLocaleString('tr-TR')}]</span>
            <span class="level ${success ? 'success' : 'error'}">RESULT</span>
            <span class="message" style="white-space: pre-line;">${text}\n${success ? JSON.stringify(rows.slice(0, 10), null, 2) : ''}</span>
        `;
        output.appendChild(result);
    } catch (e) {
        const err = document.createElement('div');
        err.className = 'log-entry';
        err.innerHTML = `
            <span class="timestamp">[${new Date().toLocaleString('tr-TR')}]</span>
            <span class="level error">ERROR</span>
            <span class="message">${(e && e.message) || e}</span>
        `;
        output.appendChild(err);
    }
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
