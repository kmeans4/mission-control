#!/usr/bin/env node
// Log Rotation and Cleanup Utility for Mission Control
// Run manually or via cron for log maintenance

const fs = require('fs');
const path = require('path');

const WORKSPACE = process.env.WORKSPACE || '/Users/sam/.openclaw/workspace';
const LOGS_DIR = path.join(WORKSPACE, 'mission-control', 'logs');

// Configuration
const CONFIG = {
    maxAgeDays: parseInt(process.env.LOG_MAX_AGE_DAYS) || 7,
    maxSizeMB: parseInt(process.env.LOG_MAX_SIZE_MB) || 10,
    maxArchiveFiles: parseInt(process.env.LOG_MAX_ARCHIVES) || 30,
    compressArchives: process.env.LOG_COMPRESS === 'true'
};

// Ensure gzip is available if compression enabled
const { gzip } = require('zlib');

async function rotateLogs() {
    console.log('Starting log rotation...');
    console.log(`Configuration: maxAge=${CONFIG.maxAgeDays}d, maxSize=${CONFIG.maxSizeMB}MB, maxArchives=${CONFIG.maxArchiveFiles}`);
    
    if (!fs.existsSync(LOGS_DIR)) {
        console.log('Logs directory does not exist. Creating...');
        fs.mkdirSync(LOGS_DIR, { recursive: true });
        return;
    }
    
    const now = Date.now();
    const maxAge = CONFIG.maxAgeDays * 24 * 60 * 60 * 1000;
    const maxSize = CONFIG.maxSizeMB * 1024 * 1024;
    
    let rotated = 0;
    let deleted = 0;
    let compressed = 0;
    
    // Get all log files
    const files = fs.readdirSync(LOGS_DIR)
        .filter(f => f.endsWith('.log') || f.endsWith('.log.gz'))
        .map(f => {
            const filePath = path.join(LOGS_DIR, f);
            const stat = fs.statSync(filePath);
            return {
                name: f,
                path: filePath,
                stat,
                mtime: stat.mtimeMs,
                size: stat.size,
                isArchive: f.startsWith('archive-'),
                isCompressed: f.endsWith('.gz')
            };
        });
    
    // Remove old files based on age
    files.forEach(file => {
        if (now - file.mtime > maxAge) {
            console.log(`🗑️  Deleting old log: ${file.name} (${Math.round((now - file.mtime) / 86400000)} days old)`);
            fs.unlinkSync(file.path);
            deleted++;
        }
    });
    
    // Check current log size and rotate if needed
    const currentLogPath = path.join(LOGS_DIR, 'current.log');
    if (fs.existsSync(currentLogPath)) {
        const stat = fs.statSync(currentLogPath);
        
        if (stat.size > maxSize) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const archiveName = `archive-${timestamp}.log`;
            const archivePath = path.join(LOGS_DIR, archiveName);
            
            console.log(`📦 Rotating current.log (${formatBytes(stat.size)}) to ${archiveName}`);
            
            // Move current log to archive
            fs.renameSync(currentLogPath, archivePath);
            
            // Compress if enabled
            if (CONFIG.compressArchives) {
                compressFile(archivePath);
                compressed++;
            }
            
            rotated++;
        } else {
            console.log(`✓ Current log size OK: ${formatBytes(stat.size)}`);
        }
    }
    
    // Limit number of archive files
    const archives = files
        .filter(f => f.isArchive && !f.name.includes('current'))
        .sort((a, b) => b.mtime - a.mtime);
    
    if (archives.length > CONFIG.maxArchiveFiles) {
        console.log(`📚 Archive count (${archives.length}) exceeds limit (${CONFIG.maxArchiveFiles})`);
        
        const toDelete = archives.slice(CONFIG.maxArchiveFiles);
        toDelete.forEach(file => {
            console.log(`🗑️  Removing excess archive: ${file.name}`);
            fs.unlinkSync(file.path);
            deleted++;
        });
    }
    
    // Summary
    console.log('\n📊 Rotation Summary:');
    console.log(`   Rotated: ${rotated}`);
    console.log(`   Deleted: ${deleted}`);
    console.log(`   Compressed: ${compressed}`);
    console.log(`   Space freed: ${formatBytes(calculateSpaceFreed(files, deleted))}`);
    
    // Check total disk usage
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    console.log(`   Total log storage: ${formatBytes(totalSize)}`);
}

function compressFile(filePath) {
    return new Promise((resolve, reject) => {
        const content = fs.readFileSync(filePath);
        const compressedPath = filePath + '.gz';
        
        gzip(content, (err, compressed) => {
            if (err) {
                console.error(`Compression failed for ${filePath}:`, err.message);
                reject(err);
                return;
            }
            
            fs.writeFileSync(compressedPath, compressed);
            fs.unlinkSync(filePath);
            
            const originalSize = content.length;
            const compressedSize = compressed.length;
            const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
            
            console.log(`🗜️  Compressed: ${path.basename(filePath)} (${ratio}% reduction)`);
            resolve();
        });
    });
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function calculateSpaceFreed(files, deletedCount) {
    // Estimate based on average file size
    if (files.length === 0) return 0;
    const avgSize = files.reduce((sum, f) => sum + f.size, 0) / files.length;
    return avgSize * deletedCount;
}

// Cleanup function for specific agent logs
function cleanupAgentLogs(agentName, keepDays = 3) {
    console.log(`Cleaning up logs for agent: ${agentName}`);
    
    const files = fs.readdirSync(LOGS_DIR)
        .filter(f => f.includes(agentName.toLowerCase()))
        .map(f => ({
            name: f,
            path: path.join(LOGS_DIR, f),
            mtime: fs.statSync(path.join(LOGS_DIR, f)).mtimeMs
        }));
    
    const now = Date.now();
    const maxAge = keepDays * 24 * 60 * 60 * 1000;
    
    files.forEach(file => {
        if (now - file.mtime > maxAge) {
            console.log(`🗑️  Deleting old ${agentName} log: ${file.name}`);
            fs.unlinkSync(file.path);
        }
    });
}

// Error log compaction
function compactErrorLogs() {
    const errorLogPath = path.join(LOGS_DIR, 'errors.log');
    
    if (!fs.existsSync(errorLogPath)) return;
    
    const content = fs.readFileSync(errorLogPath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim());
    
    // Keep only last 1000 error entries
    if (lines.length > 1000) {
        const compacted = lines.slice(-1000).join('\n');
        fs.writeFileSync(errorLogPath, compacted);
        console.log(`✓ Compacted errors.log from ${lines.length} to 1000 entries`);
    }
}

// Main execution
if (require.main === module) {
    const command = process.argv[2];
    
    switch (command) {
        case 'rotate':
            rotateLogs();
            break;
        case 'cleanup-agent':
            if (!process.argv[3]) {
                console.error('Usage: node log-rotation.js cleanup-agent <agent-name> [days]');
                process.exit(1);
            }
            cleanupAgentLogs(process.argv[3], parseInt(process.argv[4]) || 3);
            break;
        case 'compact-errors':
            compactErrorLogs();
            break;
        case 'status':
            console.log('Log Directory Status:');
            if (fs.existsSync(LOGS_DIR)) {
                const files = fs.readdirSync(LOGS_DIR);
                const totalSize = files.reduce((sum, f) => {
                    return sum + fs.statSync(path.join(LOGS_DIR, f)).size;
                }, 0);
                console.log(`   Files: ${files.length}`);
                console.log(`   Total Size: ${formatBytes(totalSize)}`);
                console.log(`   Config: maxAge=${CONFIG.maxAgeDays}d, maxSize=${CONFIG.maxSizeMB}MB`);
            } else {
                console.log('   Directory does not exist');
            }
            break;
        default:
            console.log('Log Rotation Utility');
            console.log('');
            console.log('Usage:');
            console.log('  node log-rotation.js rotate           - Perform log rotation');
            console.log('  node log-rotation.js cleanup-agent <name> [days] - Clean agent logs');
            console.log('  node log-rotation.js compact-errors   - Compact error log');
            console.log('  node log-rotation.js status           - Show log directory status');
            console.log('');
            console.log('Environment Variables:');
            console.log('  LOG_MAX_AGE_DAYS     - Maximum log age (default: 7)');
            console.log('  LOG_MAX_SIZE_MB      - Max log size before rotation (default: 10)');
            console.log('  LOG_MAX_ARCHIVES     - Max archive files to keep (default: 30)');
            console.log('  LOG_COMPRESS         - Compress archives (true/false)');
    }
}

module.exports = { rotateLogs, cleanupAgentLogs, compactErrorLogs };
