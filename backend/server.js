// Mission Control - Backend API Server
// Provides endpoints for log streaming, metrics, and system health

const http = require('http');
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

const PORT = process.env.MC_PORT || 3001;
const WORKSPACE = process.env.WORKSPACE || '/Users/sam/.openclaw/workspace';
const LOGS_DIR = path.join(WORKSPACE, 'mission-control', 'logs');

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// In-memory stores (in production, use proper database)
let logs = [];
let errors = [];
let metrics = {
    tokenUsage: [],
    requestsPerMinute: [],
    responseTimes: [],
    memoryUsage: [],
    cpuUsage: []
};
let notifications = [];

// Event emitter for real-time updates
const logEmitter = new EventEmitter();

// Component health status
let componentHealth = {
    gateway: { status: 'online', lastCheck: Date.now() },
    ollama: { status: 'online', lastCheck: Date.now() },
    workspace: { status: 'online', lastCheck: Date.now() },
    browser: { status: 'online', lastCheck: Date.now() }
};

// Alert thresholds (loaded from config)
let thresholds = {
    tokenWarning: 10000,
    tokenCritical: 50000,
    memoryWarning: 80,
    cpuWarning: 80
};

// Load thresholds from config
function loadThresholds() {
    try {
        const configPath = path.join(WORKSPACE, 'mission-control', 'config', 'thresholds.json');
        if (fs.existsSync(configPath)) {
            thresholds = { ...thresholds, ...JSON.parse(fs.readFileSync(configPath, 'utf8')) };
        }
    } catch (e) {
        console.error('Failed to load thresholds:', e.message);
    }
}

// Log rotation utility
function rotateLogs(maxAgeDays = 7, maxSizeMB = 10) {
    const now = Date.now();
    const maxAge = maxAgeDays * 24 * 60 * 60 * 1000;
    const maxSize = maxSizeMB * 1024 * 1024;
    
    try {
        const files = fs.readdirSync(LOGS_DIR)
            .filter(f => f.endsWith('.log'))
            .map(f => ({
                name: f,
                path: path.join(LOGS_DIR, f),
                stat: fs.statSync(path.join(LOGS_DIR, f))
            }));
        
        // Remove old files
        files.forEach(file => {
            if (now - file.stat.mtimeMs > maxAge) {
                fs.unlinkSync(file.path);
                console.log(`Rotated out old log: ${file.name}`);
            }
        });
        
        // Check current log size
        const currentLogPath = path.join(LOGS_DIR, 'current.log');
        if (fs.existsSync(currentLogPath)) {
            const stat = fs.statSync(currentLogPath);
            if (stat.size > maxSize) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const newPath = path.join(LOGS_DIR, `archive-${timestamp}.log`);
                fs.renameSync(currentLogPath, newPath);
                console.log(`Rotated current.log to ${newPath}`);
            }
        }
    } catch (e) {
        console.error('Log rotation failed:', e.message);
    }
}

// Write log entry
function writeLog(entry) {
    const logLine = `${entry.timestamp} [${entry.level}] [${entry.agent || 'SYSTEM'}] ${entry.message}\n`;
    
    // Append to current log file
    const currentLogPath = path.join(LOGS_DIR, 'current.log');
    fs.appendFileSync(currentLogPath, logLine);
    
    // Also store in memory (limited)
    logs.push(entry);
    if (logs.length > 1000) logs.shift();
    
    // Emit for SSE
    logEmitter.emit('log', entry);
    
    // Track errors
    if (entry.level === 'ERROR') {
        errors.push({
            ...entry,
            stack: entry.stack || null,
            fixAvailable: entry.fixAvailable || false
        });
        if (errors.length > 500) errors.shift();
    }
}

// Collect system metrics
function collectMetrics() {
    // In production, get real metrics from system
    const metric = {
        timestamp: Date.now(),
        tokenRate: Math.floor(Math.random() * 5000) + 1000,
        requestsPerMinute: Math.floor(Math.random() * 100) + 20,
        avgResponseTime: Math.floor(Math.random() * 500) + 100,
        memoryPercent: Math.floor(Math.random() * 40) + 30,
        cpuPercent: Math.floor(Math.random() * 30) + 10,
        diskFreeGB: Math.floor(Math.random() * 100) + 200
    };
    
    metrics.tokenUsage.push({ t: metric.timestamp, v: metric.tokenRate });
    metrics.requestsPerMinute.push({ t: metric.timestamp, v: metric.requestsPerMinute });
    metrics.responseTimes.push({ t: metric.timestamp, v: metric.avgResponseTime });
    metrics.memoryUsage.push({ t: metric.timestamp, v: metric.memoryPercent });
    metrics.cpuUsage.push({ t: metric.timestamp, v: metric.cpuPercent });
    
    // Keep last 300 data points (5 hours at 1 min intervals)
    Object.values(metrics).forEach(arr => {
        if (arr.length > 300) arr.shift();
    });
    
    // Check thresholds and create alerts
    if (metric.tokenRate > thresholds.tokenCritical) {
        createNotification('error', `Critical: Token rate ${metric.tokenRate}/min exceeds threshold`);
    } else if (metric.tokenRate > thresholds.tokenWarning) {
        createNotification('warning', `Warning: High token usage ${metric.tokenRate}/min`);
    }
    
    return metric;
}

// Check component health
function checkComponentHealth() {
    // In production, actually check each component
    Object.keys(componentHealth).forEach(component => {
        // Simulate health check
        const isHealthy = Math.random() > 0.05; // 95% uptime simulation
        componentHealth[component] = {
            status: isHealthy ? 'online' : (Math.random() > 0.5 ? 'degraded' : 'offline'),
            lastCheck: Date.now()
        };
    });
    
    return componentHealth;
}

// Create notification
function createNotification(type, message) {
    const notification = {
        id: Date.now().toString(),
        type,
        message,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    notifications.push(notification);
    if (notifications.length > 100) notifications.shift();
    
    return notification;
}

// Load recent logs from file
function loadRecentLogs(limit = 100) {
    const currentLogPath = path.join(LOGS_DIR, 'current.log');
    if (!fs.existsSync(currentLogPath)) return [];
    
    try {
        const content = fs.readFileSync(currentLogPath, 'utf8');
        const lines = content.split('\n').filter(l => l.trim()).slice(-limit);
        
        return lines.map(line => {
            const match = line.match(/^(\S+) \[(\w+)\] \[(\w+)\] (.+)$/);
            if (match) {
                return {
                    timestamp: match[1],
                    level: match[2],
                    agent: match[3],
                    message: match[4]
                };
            }
            return { timestamp: new Date().toISOString(), level: 'INFO', agent: 'SYSTEM', message: line };
        });
    } catch (e) {
        console.error('Failed to load logs:', e.message);
        return [];
    }
}

// HTTP Server
const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = url.pathname;
    
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    
    // API Routes
    if (pathname.startsWith('/api/')) {
        handleApi(req, res, url);
    } else if (pathname === '/sse/logs') {
        handleSSE(req, res);
    } else {
        // Serve static files
        serveStatic(req, res, pathname);
    }
});

function handleApi(req, res, url) {
    const pathname = url.pathname;
    
    if (req.method !== 'GET' && req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }
    
    try {
        // Logs endpoints
        if (pathname === '/api/logs') {
            const limit = parseInt(url.searchParams.get('limit')) || 100;
            const level = url.searchParams.get('level');
            const agent = url.searchParams.get('agent');
            
            let result = logs.slice(-limit);
            if (level) result = result.filter(l => l.level === level);
            if (agent) result = result.filter(l => l.agent === agent);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
            return;
        }
        
        if (pathname === '/api/logs/recent') {
            const result = loadRecentLogs(parseInt(url.searchParams.get('limit')) || 100);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
            return;
        }
        
        // Errors endpoints
        if (pathname === '/api/errors') {
            const limit = parseInt(url.searchParams.get('limit')) || 50;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(errors.slice(-limit)));
            return;
        }
        
        if (pathname === '/api/errors/stats') {
            const hourAgo = Date.now() - 3600000;
            const recentErrors = errors.filter(e => new Date(e.timestamp).getTime() > hourAgo);
            const autoFixed = errors.filter(e => e.fixAvailable && e.autoFixed).length;
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                current: recentErrors.length,
                perHour: recentErrors.length,
                autoFixed
            }));
            return;
        }
        
        // Metrics endpoints
        if (pathname === '/api/metrics') {
            const data = collectMetrics();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
            return;
        }
        
        if (pathname === '/api/metrics/history') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(metrics));
            return;
        }
        
        // Health endpoints
        if (pathname === '/api/health') {
            const health = checkComponentHealth();
            const allOnline = Object.values(health).every(c => c.status === 'online');
            const anyOffline = Object.values(health).some(c => c.status === 'offline');
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                components: health,
                overall: allOnline ? 'healthy' : (anyOffline ? 'critical' : 'degraded')
            }));
            return;
        }
        
        if (pathname === '/api/health/diagnostics') {
            // Run diagnostics
            const results = [];
            const checks = [
                { name: 'Gateway Health', check: () => componentHealth.gateway.status === 'online' },
                { name: 'Ollama Connection', check: () => componentHealth.ollama.status === 'online' },
                { name: 'Workspace Access', check: () => componentHealth.workspace.status === 'online' },
                { name: 'Browser Availability', check: () => componentHealth.browser.status === 'online' },
                { name: 'Disk Space', check: () => true },
                { name: 'Memory Usage', check: () => true }
            ];
            
            checks.forEach(check => {
                try {
                    const passed = check.check();
                    results.push({
                        name: check.name,
                        passed,
                        result: passed ? 'PASS' : 'FAIL'
                    });
                } catch (e) {
                    results.push({
                        name: check.name,
                        passed: false,
                        result: `ERROR: ${e.message}`
                    });
                }
            });
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ results, allPassed: results.every(r => r.passed) }));
            return;
        }
        
        // Notifications endpoints
        if (pathname === '/api/notifications') {
            if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', () => {
                    try {
                        const { type, message } = JSON.parse(body);
                        const notification = createNotification(type, message);
                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(notification));
                    } catch (e) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid JSON' }));
                    }
                });
                return;
            }
            
            const unreadOnly = url.searchParams.get('unread') === 'true';
            let result = notifications;
            if (unreadOnly) result = notifications.filter(n => !n.read);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
            return;
        }
        
        if (pathname === '/api/notifications/mark-read') {
            notifications.forEach(n => n.read = true);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
            return;
        }
        
        // Config endpoints
        if (pathname === '/api/config/thresholds') {
            if (req.method === 'GET') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(thresholds));
            } else if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', () => {
                    try {
                        thresholds = { ...thresholds, ...JSON.parse(body) };
                        saveThresholds();
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(thresholds));
                    } catch (e) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid JSON' }));
                    }
                });
            }
            return;
        }
        
        // 404 for unknown routes
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
        
    } catch (e) {
        console.error('API error:', e.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
    }
}

function handleSSE(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });
    
    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', time: Date.now() })}\n\n`);
    
    // Send recent logs
    const recentLogs = loadRecentLogs(50);
    res.write(`data: ${JSON.stringify({ type: 'logs', data: recentLogs })}\n\n`);
    
    // Listen for new logs
    const logHandler = (log) => {
        res.write(`data: ${JSON.stringify({ type: 'log', data: log })}\n\n`);
    };
    logEmitter.on('log', logHandler);
    
    // Send metrics periodically
    const metricsInterval = setInterval(() => {
        const metric = collectMetrics();
        res.write(`data: ${JSON.stringify({ type: 'metrics', data: metric })}\n\n`);
    }, 5000);
    
    // Send health updates
    const healthInterval = setInterval(() => {
        const health = checkComponentHealth();
        res.write(`data: ${JSON.stringify({ type: 'health', data: health })}\n\n`);
    }, 30000);
    
    // Cleanup on client disconnect
    req.on('close', () => {
        logEmitter.removeListener('log', logHandler);
        clearInterval(metricsInterval);
        clearInterval(healthInterval);
    });
}

function serveStatic(req, res, pathname) {
    if (pathname === '/') pathname = '/dashboard.html';
    
    const filePath = path.join(LOGS_DIR, pathname.replace('/logs', ''));
    const ext = path.extname(filePath);
    
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
    };
    
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not found');
            return;
        }
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

function saveThresholds() {
    try {
        const configDir = path.join(WORKSPACE, 'mission-control', 'config');
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        
        fs.writeFileSync(
            path.join(configDir, 'thresholds.json'),
            JSON.stringify(thresholds, null, 2)
        );
    } catch (e) {
        console.error('Failed to save thresholds:', e.message);
    }
}

// Start server
server.listen(PORT, () => {
    console.log(`Mission Control API server running on http://localhost:${PORT}`);
    console.log(`Dashboard: http://localhost:${PORT}/logs/dashboard.html`);
    console.log(`SSE endpoint: ws://localhost:${PORT}/sse/logs`);
    
    // Load existing logs
    logs = loadRecentLogs(100);
    loadThresholds();
    
    // Start log rotation (daily)
    setInterval(() => rotateLogs(), 24 * 60 * 60 * 1000);
    
    // Initial metrics collection
    collectMetrics();
});

// Export for use in other modules
module.exports = {
    writeLog,
    createNotification,
    loadThresholds,
    rotateLogs
};
