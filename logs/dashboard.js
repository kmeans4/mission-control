// Mission Control - Logs & Monitoring Dashboard
// Real-time monitoring and log viewer

// Configuration
const CONFIG = {
    refreshIntervals: {
        logs: 1000,
        metrics: 5000,
        health: 30000
    },
    maxLogs: 1000,
    apiBase: '/api'
};

// State
let logs = [];
let errors = [];
let notifications = [];
let charts = {};
let refreshTimers = {};
let autoScroll = true;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    initializeCharts();
    startRefreshCycles();
    loadNotifications();
    simulateInitialData();
});

// Tab switching
function switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('active'));
    
    document.querySelector(`[onclick="switchTab('${tabId}')"]`).classList.add('active');
    document.getElementById(`${tabId}-panel`).classList.add('active');
}

// Log Viewer Functions
function addLogEntry(entry) {
    logs.unshift(entry);
    if (logs.length > CONFIG.maxLogs) {
        logs.pop();
    }
    renderLogs();
}

function renderLogs() {
    const viewer = document.getElementById('logViewer');
    const agentFilter = document.getElementById('agentFilter').value;
    const levelFilter = document.getElementById('levelFilter').value;
    const searchTerm = document.getElementById('searchLogs').value.toLowerCase();

    const filteredLogs = logs.filter(log => {
        if (agentFilter && log.agent !== agentFilter) return false;
        if (levelFilter && log.level !== levelFilter) return false;
        if (searchTerm && !log.message.toLowerCase().includes(searchTerm)) return false;
        return true;
    });

    viewer.innerHTML = filteredLogs.map(log => `
        <div class="log-entry ${log.level.toLowerCase()}">
            <span class="log-timestamp">${log.timestamp}</span>
            <span class="log-level">${log.level}</span>
            <span class="log-agent">[${log.agent || 'SYSTEM'}]</span>
            <span class="log-message">${escapeHtml(log.message)}</span>
        </div>
    `).join('');

    if (autoScroll) {
        viewer.scrollTop = 0;
    }

    document.getElementById('logUpdateTime').textContent = new Date().toLocaleTimeString();
}

function filterLogs() {
    renderLogs();
}

function clearLogs() {
    logs = [];
    renderLogs();
    showToast('Logs cleared', 'info');
}

function downloadLogs() {
    const content = logs.map(log => 
        `${log.timestamp} [${log.level}] [${log.agent || 'SYSTEM'}] ${log.message}`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mission-control-logs-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// Error Dashboard Functions
function addError(error) {
    errors.unshift(error);
    updateErrorStats();
    renderErrorList();
    updateErrorChart();
    
    if (shouldNotify('error')) {
        showToast(error.message, 'error');
        addNotification({
            type: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

function updateErrorStats() {
    document.getElementById('errorCount').textContent = errors.filter(e => 
        new Date(e.timestamp) > new Date(Date.now() - 3600000)
    ).length;
    
    const errorsPerHour = errors.filter(e => 
        new Date(e.timestamp) > new Date(Date.now() - 3600000)
    ).length;
    document.getElementById('errorRate').textContent = errorsPerHour;
    
    const autoFixed = errors.filter(e => e.autoFixed).length;
    document.getElementById('errorFixes').textContent = autoFixed;
}

function renderErrorList() {
    const list = document.getElementById('errorList');
    list.innerHTML = errors.slice(0, 20).map((error, index) => `
        <div class="error-item" onclick="toggleError(this)">
            <div class="error-header">
                <span class="error-message">${escapeHtml(error.message)}</span>
                <span class="error-time">${new Date(error.timestamp).toLocaleString()}</span>
            </div>
            ${error.stack ? `<div class="stack-trace">${escapeHtml(error.stack)}</div>` : ''}
            ${error.fixAvailable ? `<button onclick="applyFix(${index})" style="margin-top: 8px;">🔧 Apply Fix</button>` : ''}
        </div>
    `).join('');
}

function toggleError(element) {
    element.classList.toggle('expanded');
}

function applyFix(index) {
    errors[index].autoFixed = true;
    updateErrorStats();
    showToast('Fix applied successfully', 'success');
}

function exportErrors() {
    const content = `Error Report - ${new Date().toISOString()}\n\n` +
        errors.map(error => 
            `[${error.timestamp}] ${error.message}\n${error.stack ? error.stack + '\n' : ''}`
        ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// Performance Monitor Functions
function updateMetrics() {
    // Simulated metrics - in production, fetch from API
    const metrics = {
        tokenRate: Math.floor(Math.random() * 5000) + 1000,
        requestsMin: Math.floor(Math.random() * 100) + 20,
        avgResponse: Math.floor(Math.random() * 500) + 100,
        memory: Math.floor(Math.random() * 40) + 30,
        cpu: Math.floor(Math.random() * 30) + 10,
        disk: Math.floor(Math.random() * 100) + 200
    };

    document.getElementById('tokenRate').textContent = metrics.tokenRate.toLocaleString();
    document.getElementById('requestsMin').textContent = metrics.requestsMin;
    document.getElementById('avgResponse').textContent = metrics.avgResponse + 'ms';
    document.getElementById('memoryUsage').textContent = metrics.memory + '%';
    document.getElementById('cpuUsage').textContent = metrics.cpu + '%';
    document.getElementById('diskSpace').textContent = metrics.disk + 'GB';

    // Update chart
    updateTokenChart(metrics);

    // Check thresholds
    checkThresholds(metrics);

    document.getElementById('perfUpdateTime').textContent = new Date().toLocaleTimeString();
}

function checkThresholds(metrics) {
    const tokenWarning = parseInt(document.getElementById('tokenWarning').value);
    const tokenCritical = parseInt(document.getElementById('tokenCritical').value);
    const memoryWarning = parseInt(document.getElementById('memoryWarning').value);
    const cpuWarning = parseInt(document.getElementById('cpuWarning').value);

    if (metrics.tokenRate > tokenCritical) {
        showToast('Critical: Token rate exceeded!', 'error');
    } else if (metrics.tokenRate > tokenWarning) {
        showToast('Warning: High token usage', 'warning');
    }

    if (metrics.memory > memoryWarning) {
        showToast('Warning: High memory usage', 'warning');
    }

    if (metrics.cpu > cpuWarning) {
        showToast('Warning: High CPU usage', 'warning');
    }
}

function saveThresholds() {
    const thresholds = {
        tokenWarning: document.getElementById('tokenWarning').value,
        tokenCritical: document.getElementById('tokenCritical').value,
        memoryWarning: document.getElementById('memoryWarning').value,
        cpuWarning: document.getElementById('cpuWarning').value
    };
    
    localStorage.setItem('mc_thresholds', JSON.stringify(thresholds));
    showToast('Thresholds saved', 'success');
}

// Notifications Functions
function addNotification(notification) {
    notifications.unshift(notification);
    if (notifications.length > 50) notifications.pop();
    renderNotificationHistory();
    saveNotifications();
}

function renderNotificationHistory() {
    const history = document.getElementById('notificationHistory');
    history.innerHTML = notifications.slice(0, 20).map(notif => `
        <div class="notification-item">
            <div class="notification-icon ${notif.type}">
                ${notif.type === 'error' ? '⚠️' : notif.type === 'warning' ? '⚡' : 'ℹ️'}
            </div>
            <div>
                <div>${escapeHtml(notif.message)}</div>
                <div style="font-size: 12px; color: var(--text-secondary);">
                    ${new Date(notif.timestamp).toLocaleString()}
                </div>
            </div>
        </div>
    `).join('');
}

function loadNotifications() {
    const saved = localStorage.getItem('mc_notifications');
    if (saved) {
        notifications = JSON.parse(saved);
        renderNotificationHistory();
    }
}

function saveNotifications() {
    localStorage.setItem('mc_notifications', JSON.stringify(notifications));
}

function shouldNotify(type) {
    const eventType = document.querySelector(`.eventType[data-type="${type}"]`);
    return eventType && eventType.checked;
}

function showToast(message, type = 'info') {
    if (!document.getElementById('toastEnabled').checked) return;
    
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;
    
    container.appendChild(toast);
    
    if (document.getElementById('soundEnabled').checked && type === 'error') {
        playAlertSound();
    }
    
    setTimeout(() => toast.remove(), 5000);
}

function playAlertSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Health Status Functions
function updateHealthStatus() {
    // Simulated health check - in production, fetch from API
    const components = [
        { name: 'Gateway', status: 'online' },
        { name: 'Ollama', status: Math.random() > 0.1 ? 'online' : 'degraded' },
        { name: 'Workspace', status: 'online' },
        { name: 'Browser', status: 'online' }
    ];

    const container = document.getElementById('componentStatus');
    container.innerHTML = components.map(comp => `
        <div class="component-card">
            <span class="component-name">${comp.name}</span>
            <div class="component-status-dot ${comp.status}"></div>
        </div>
    `).join('');

    // Update overall health
    const allOnline = components.every(c => c.status === 'online');
    const anyOffline = components.some(c => c.status === 'offline');
    
    const healthDot = document.getElementById('healthDot');
    const healthStatus = document.getElementById('healthStatus');
    
    if (allOnline) {
        healthDot.className = 'health-dot healthy';
        healthStatus.textContent = 'System Healthy';
    } else if (anyOffline) {
        healthDot.className = 'health-dot critical';
        healthStatus.textContent = 'System Critical';
    } else {
        healthDot.className = 'health-dot warning';
        healthStatus.textContent = 'System Degraded';
    }

    document.getElementById('healthUpdateTime').textContent = new Date().toLocaleTimeString();
}

function runDiagnostics() {
    const output = document.getElementById('diagnosticsOutput');
    output.classList.add('visible');
    output.innerHTML = 'Running diagnostics...\n';
    
    const checks = [
        { name: 'Gateway Health', result: '✓ PASS' },
        { name: 'Ollama Connection', result: '✓ PASS' },
        { name: 'Workspace Access', result: '✓ PASS' },
        { name: 'Browser Availability', result: '✓ PASS' },
        { name: 'Disk Space', result: '✓ PASS (245GB free)' },
        { name: 'Memory Usage', result: '✓ PASS (42% used)' }
    ];
    
    let delay = 500;
    checks.forEach((check, index) => {
        setTimeout(() => {
            output.innerHTML += `\n${check.name}: ${check.result}`;
            output.scrollTop = output.scrollHeight;
        }, delay);
        delay += 300;
    });
    
    setTimeout(() => {
        output.innerHTML += '\n\nDiagnostics complete. All systems operational.';
    }, delay);
}

function fixCommonIssues() {
    showToast('Scanning for common issues...', 'info');
    
    setTimeout(() => {
        const issues = [];
        if (Math.random() > 0.7) issues.push('Cleared log cache');
        if (Math.random() > 0.8) issues.push('Restarted browser controller');
        if (Math.random() > 0.9) issues.push('Reset connection pool');
        
        if (issues.length > 0) {
            showToast(`Fixed: ${issues.join(', ')}`, 'success');
            addNotification({
                type: 'info',
                message: `Auto-fixed issues: ${issues.join(', ')}`,
                timestamp: new Date().toISOString()
            });
        } else {
            showToast('No issues found', 'success');
        }
    }, 2000);
}

// Charts
function initializeCharts() {
    // Error Frequency Chart
    const errorCtx = document.getElementById('errorFrequencyChart').getContext('2d');
    charts.error = new Chart(errorCtx, {
        type: 'line',
        data: {
            labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
            datasets: [{
                label: 'Errors per Hour',
                data: Array.from({ length: 24 }, () => Math.floor(Math.random() * 10)),
                borderColor: '#f85149',
                backgroundColor: 'rgba(248, 81, 73, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#30363d' },
                    ticks: { color: '#8b949e' }
                },
                x: {
                    grid: { color: '#30363d' },
                    ticks: { color: '#8b949e' }
                }
            }
        }
    });

    // Token Usage Chart
    const tokenCtx = document.getElementById('tokenUsageChart').getContext('2d');
    charts.token = new Chart(tokenCtx, {
        type: 'line',
        data: {
            labels: Array.from({ length: 30 }, (_, i) => i),
            datasets: [{
                label: 'Tokens/min',
                data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 3000) + 1000),
                borderColor: '#58a6ff',
                backgroundColor: 'rgba(88, 166, 255, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#30363d' },
                    ticks: { color: '#8b949e' }
                },
                x: {
                    display: false,
                    grid: { color: '#30363d' }
                }
            }
        }
    });
}

function updateTokenChart(metrics) {
    if (!charts.token) return;
    
    const data = charts.token.data.datasets[0].data;
    data.shift();
    data.push(metrics.tokenRate);
    charts.token.update('none');
}

function updateErrorChart() {
    if (!charts.error) return;
    
    // Update with recent error counts per hour
    const hourlyErrors = Array.from({ length: 24 }, (_, hour) => {
        const hourAgo = new Date(Date.now() - (23 - hour) * 3600000);
        return errors.filter(e => {
            const eTime = new Date(e.timestamp);
            return eTime.getHours() === hourAgo.getHours() &&
                   eTime.getDate() === hourAgo.getDate();
        }).length;
    });
    
    charts.error.data.datasets[0].data = hourlyErrors;
    charts.error.update('none');
}

// Refresh Cycles
function startRefreshCycles() {
    // Logs refresh
    refreshTimers.logs = setInterval(() => {
        // In production: fetchLogs()
        simulateNewLog();
    }, CONFIG.refreshIntervals.logs);

    // Metrics refresh
    refreshTimers.metrics = setInterval(() => {
        updateMetrics();
    }, CONFIG.refreshIntervals.metrics);

    // Health refresh
    refreshTimers.health = setInterval(() => {
        updateHealthStatus();
    }, CONFIG.refreshIntervals.health);
}

function stopRefreshCycles() {
    Object.values(refreshTimers).forEach(timer => clearInterval(timer));
}

// Simulation (for demo purposes)
function simulateInitialData() {
    // Generate sample logs
    const sampleLogs = [
        { level: 'INFO', agent: 'sam', message: 'Mission Control initialized' },
        { level: 'INFO', agent: 'dex', message: 'Dashboard loaded successfully' },
        { level: 'INFO', agent: 'quinn', message: 'Code review complete' },
        { level: 'WARN', agent: 'mantis', message: 'High latency detected in API calls' },
        { level: 'ERROR', agent: 'echo', message: 'Failed to send notification: timeout' },
        { level: 'INFO', agent: 'sam', message: 'Task delegated to subagent' },
        { level: 'INFO', agent: 'dex', message: 'CRUD operation completed' },
        { level: 'WARN', agent: 'system', message: 'Disk usage above 70%' }
    ];

    sampleLogs.forEach((log, i) => {
        setTimeout(() => {
            addLogEntry({
                ...log,
                timestamp: new Date(Date.now() - (sampleLogs.length - i) * 5000).toISOString()
            });
        }, i * 200);
    });

    // Generate sample errors
    const sampleErrors = [
        { message: 'Connection timeout to Ollama', stack: 'Error: Connection timeout\n    at OllamaClient.request (client.js:45)\n    at Agent.execute (agent.js:123)' },
        { message: 'Rate limit exceeded', stack: null },
        { message: 'Failed to write to workspace', stack: 'Error: EACCES\n    at fs.writeFile (fs.js:234)' }
    ];

    sampleErrors.forEach(error => {
        addError({
            ...error,
            timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
            fixAvailable: Math.random() > 0.5
        });
    });
}

function simulateNewLog() {
    const agents = ['sam', 'quinn', 'dex', 'mantis', 'echo', 'system'];
    const levels = ['INFO', 'INFO', 'INFO', 'WARN', 'ERROR'];
    const messages = [
        'Processing task queue',
        'Agent spawned successfully',
        'Task completed in 2.3s',
        'Token usage: 1,234 tokens',
        'Connection established',
        'Cache hit for request',
        'Retrying failed operation',
        'Memory usage at 45%',
        'Session timeout warning'
    ];

    if (Math.random() > 0.3) {
        addLogEntry({
            timestamp: new Date().toISOString(),
            level: levels[Math.floor(Math.random() * levels.length)],
            agent: agents[Math.floor(Math.random() * agents.length)],
            message: messages[Math.floor(Math.random() * messages.length)]
        });
    }
}

// Utilities
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function loadConfig() {
    const saved = localStorage.getItem('mc_thresholds');
    if (saved) {
        const thresholds = JSON.parse(saved);
        document.getElementById('tokenWarning').value = thresholds.tokenWarning;
        document.getElementById('tokenCritical').value = thresholds.tokenCritical;
        document.getElementById('memoryWarning').value = thresholds.memoryWarning;
        document.getElementById('cpuWarning').value = thresholds.cpuWarning;
    }
}

// Cleanup on page unload
window.addEventListener('unload', () => {
    stopRefreshCycles();
});
