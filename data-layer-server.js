/**
 * Mission Control Data Layer - File Watcher & WebSocket Server
 * Watches workspace .md files and auto-rebuilds data.json on changes
 */

const chokidar = require('chokidar');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE = process.env.WORKSPACE || '/Users/sam/.openclaw/workspace';
const DATA_JSON_PATH = path.join(WORKSPACE, 'mission-control/data.json');
const SERVER_PORT = process.env.PORT || 3001;

// Cache management
const cache = {
  data: null,
  lastModified: null,
  version: 0,
  subscribers: new Set()
};

/**
 * Build comprehensive data.json from workspace files
 */
function buildDataJson() {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] 🔨 Building data.json...`);

  try {
    // Read all source files
    const agentsMd = safeRead(path.join(WORKSPACE, 'AGENTS.md'));
    const activeTasksMd = safeRead(path.join(WORKSPACE, 'active-tasks.md'));
    const projectsMd = safeRead(path.join(WORKSPACE, 'projects.md'));
    const soulFiles = readAllSoulFiles();
    
    // Get git analytics
    const gitAnalytics = buildGitAnalytics();

    // Build comprehensive data structure
    const data = {
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
        workspace: WORKSPACE,
        lastGitCommit: gitAnalytics.lastCommit?.hash || 'unknown',
        lastGitCommitDate: gitAnalytics.lastCommit?.date || 'unknown',
        buildTimeMs: Date.now() - startTime
      },
      agents: parseAgentsData(agentsMd, soulFiles),
      activeTasks: parseActiveTasks(activeTasksMd),
      projects: parseProjectsData(projectsMd),
      gitAnalytics: gitAnalytics,
      fileWatcherConfig: {
        watchPatterns: ['**/*.md', '!.git/**', '!node_modules/**', '!.next/**'],
        watchedDirectories: [WORKSPACE],
        debounceMs: 500,
        rebuildDelayMs: 1000,
        excludedFiles: ['package-lock.json', '*.log', '.DS_Store']
      },
      apiEndpoints: {
        dataJson: '/api/data',
        websocket: `ws://localhost:${SERVER_PORT}`,
        health: '/api/health',
        rebuild: '/api/rebuild'
      },
      cacheStrategy: {
        type: 'time-based-with-invalidation',
        ttlSeconds: 300,
        invalidationTriggers: ['file-change', 'git-commit', 'manual-rebuild'],
        cacheLocation: path.join(WORKSPACE, 'mission-control/.cache/')
      }
    };

    // Write data.json
    fs.writeFileSync(DATA_JSON_PATH, JSON.stringify(data, null, 2), 'utf-8');
    
    // Update cache
    cache.data = data;
    cache.lastModified = new Date();
    cache.version++;

    const buildTime = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ✅ data.json built in ${buildTime}ms (v${cache.version})`);

    // Notify all WebSocket clients
    broadcast({
      type: 'data-rebuilt',
      version: cache.version,
      timestamp: cache.lastModified.toISOString(),
      buildTimeMs: buildTime
    });

    return data;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Build failed:`, error.message);
    broadcast({
      type: 'build-error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

/**
 * Safely read file, return null if not found
 */
function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Read all agent SOUL.md files
 */
function readAllSoulFiles() {
  const soulFiles = {};
  const agentsDir = path.join(WORKSPACE, 'agents');
  
  if (!fs.existsSync(agentsDir)) return soulFiles;

  const agentDirs = fs.readdirSync(agentsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const agentDir of agentDirs) {
    // Check multiple possible locations for SOUL.md
    const possiblePaths = [
      path.join(agentsDir, agentDir, 'SOUL.md'),
      path.join(agentsDir, agentDir, 'agent', 'SOUL.md'),
      path.join(agentsDir, agentDir, 'agents', 'SOUL.md')
    ];

    for (const soulPath of possiblePaths) {
      const content = safeRead(soulPath);
      if (content) {
        soulFiles[agentDir] = {
          path: soulPath,
          content: content
        };
        break;
      }
    }
  }

  return soulFiles;
}

/**
 * Parse AGENTS.md and extract agent information
 */
function parseAgentsData(agentsMd, soulFiles) {
  const agents = {};
  
  if (!agentsMd) return agents;

  const lines = agentsMd.split('\n');
  let currentAgent = null;
  let inTable = false;

  for (const line of lines) {
    // Match table row: | **Name** | Role | Model | Responsibility |
    const tableMatch = line.match(/\|\s*\*\*([^*]+)\*\*\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\s*\|/);
    if (tableMatch) {
      const [, name, role, model, responsibility] = tableMatch;
      const key = name.toLowerCase().trim();
      currentAgent = key;
      
      agents[key] = {
        name: name.trim(),
        model: model.trim().toLowerCase(),
        role: role.trim(),
        responsibilities: [responsibility.trim()],
        skills: [],
        soul: null
      };
    } else if (currentAgent && line.match(/^\s*-\s*\*\*([^*]+)\*\*/)) {
      // Parse additional responsibilities in lists
      const [, item] = line.match(/^\s*-\s*\*\*([^*]+)\*\*/);
      agents[currentAgent].responsibilities.push(item.trim());
    }
  }

  // Merge SOUL.md data
  for (const [agentKey, soulData] of Object.entries(soulFiles)) {
    const matchingAgent = Object.keys(agents).find(key => 
      agentKey.includes(key) || key.includes(agentKey)
    );
    
    if (matchingAgent && agents[matchingAgent]) {
      agents[matchingAgent].soul = {
        content: soulData.content,
        path: soulData.path
      };
    }
  }

  return agents;
}

/**
 * Parse active-tasks.md
 */
function parseActiveTasks(content) {
  if (!content) return { lastUpdated: null, sections: {} };

  const tasks = {
    lastUpdated: extractDate(content),
    sections: {
      recentlyCompleted: [],
      inProgress: [],
      blocked: [],
      backlog: []
    }
  };

  let currentSection = null;

  for (const line of content.split('\n')) {
    if (line.includes('##')) {
      if (line.includes('Recently Completed')) currentSection = 'recentlyCompleted';
      else if (line.includes('In Progress')) currentSection = 'inProgress';
      else if (line.includes('Blocked')) currentSection = 'blocked';
      else if (line.includes('Backlog')) currentSection = 'backlog';
      else currentSection = null;
    } else if (currentSection && line.trim().startsWith('- [')) {
      tasks.sections[currentSection].push(parseTaskLine(line));
    }
  }

  return tasks;
}

/**
 * Parse projects.md
 */
function parseProjectsData(content) {
  if (!content) return {};

  const projects = {};
  let currentProject = null;

  for (const line of content.split('\n')) {
    const projectMatch = line.match(/^##\s+(.+)$/);
    if (projectMatch) {
      const [, name] = projectMatch;
      currentProject = name.trim().replace(/\s+/g, '').toLowerCase();
      projects[currentProject] = { name, status: 'Unknown', details: [] };
    } else if (currentProject && line.startsWith('**Status:**')) {
      projects[currentProject].status = line.replace('**Status:**', '').trim();
    } else if (currentProject && line.startsWith('**URL:**')) {
      projects[currentProject].url = line.replace('**URL:**', '').trim();
    } else if (currentProject && line.trim() && !line.startsWith('#')) {
      projects[currentProject].details?.push(line.trim());
    }
  }

  return projects;
}

/**
 * Build git analytics from repository
 */
function buildGitAnalytics() {
  try {
    const gitDir = path.join(WORKSPACE, '.git');
    if (!fs.existsSync(gitDir)) {
      return { error: 'Not a git repository' };
    }

    // Get recent commits
    const commitsRaw = execSync(
      `cd "${WORKSPACE}" && git log --format="%H|%an|%ae|%ad|%s" --date=iso --all -50`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );

    const commits = commitsRaw.split('\n').filter(Boolean).map(line => {
      const [hash, author, email, date, ...messageParts] = line.split('|');
      return {
        hash: hash.substring(0, 7),
        fullHash: hash,
        author: author.trim(),
        email: email.trim(),
        date: new Date(date.trim()).toISOString(),
        message: messageParts.join('|').trim()
      };
    });

    // Get last commit
    const lastCommit = commits[0] || null;

    // Get commit stats by author
    const authorStats = {};
    commits.forEach(commit => {
      if (!authorStats[commit.author]) {
        authorStats[commit.author] = {
          email: commit.email,
          commits: 0,
          firstCommit: commit.date,
          lastCommit: commit.date
        };
      }
      authorStats[commit.author].commits++;
      authorStats[commit.author].lastCommit = commit.date;
    });

    // Get contribution graph (commits per day)
    const contributionGraph = {};
    commits.forEach(commit => {
      const date = commit.date.split('T')[0];
      contributionGraph[date] = (contributionGraph[date] || 0) + 1;
    });

    // Get lines changed (approximate from git shortlog)
    let linesChanged = { total: { additions: 0, deletions: 0 }, byAgent: {} };
    try {
      const numstat = execSync(
        `cd "${WORKSPACE}" && git log --numstat --format="" --all`,
        { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
      );
      
      numstat.split('\n').filter(Boolean).forEach(line => {
        const [additions, deletions] = line.split(/\s+/);
        const add = parseInt(additions) || 0;
        const del = parseInt(deletions) || 0;
        if (!isNaN(add) && !isNaN(del)) {
          linesChanged.total.additions += add;
          linesChanged.total.deletions += del;
        }
      });
    } catch (error) {
      console.warn('Could not get line stats:', error.message);
    }

    return {
      repository: WORKSPACE,
      lastCommit,
      commitHistory: {
        total: commits.length,
        byAuthor: authorStats
      },
      recentCommits: commits.slice(0, 10),
      contributionGraph,
      linesChanged,
      lastActivityTimestamp: lastCommit?.date || null
    };
  } catch (error) {
    console.error('Git analytics error:', error.message);
    return { error: error.message };
  }
}

/**
 * Helper: Extract date from markdown content
 */
function extractDate(content) {
  const match = content.match(/Last updated:\s*(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

/**
 * Helper: Parse a task line from markdown
 */
function parseTaskLine(line) {
  const match = line.match(/-\s*\[([ x])\]\s*\*\*(.+?)\*\*\s*(?:—\s*(.+))?/);
  if (match) {
    const [, checked, title, details] = match;
    return {
      title: title.trim(),
      completed: checked === 'x',
      details: details?.trim() || null
    };
  }
  return { raw: line.trim() };
}

/**
 * Broadcast message to all WebSocket clients
 */
function broadcast(message) {
  const payload = JSON.stringify(message);
  cache.subscribers.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}

/**
 * Setup file watcher
 */
function setupWatcher() {
  const watcher = chokidar.watch(
    [
      path.join(WORKSPACE, '**/*.md'),
      path.join(WORKSPACE, 'agents/**')
    ],
    {
      ignored: [
        /(^|[\/\\])\../,
        /node_modules/,
        /.next/,
        /mission-control\/data.json$/
      ],
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100
      }
    }
  );

  let rebuildTimeout = null;

  watcher
    .on('add', filePath => scheduleRebuild('add', filePath))
    .on('change', filePath => scheduleRebuild('change', filePath))
    .on('unlink', filePath => scheduleRebuild('unlink', filePath))
    .on('error', error => console.error('Watcher error:', error));

  function scheduleRebuild(event, filePath) {
    const relativePath = path.relative(WORKSPACE, filePath);
    console.log(`[${new Date().toISOString()}] 📁 ${event.toUpperCase()}: ${relativePath}`);

    if (rebuildTimeout) clearTimeout(rebuildTimeout);
    
    rebuildTimeout = setTimeout(() => {
      buildDataJson();
    }, 1000);

    broadcast({
      type: 'file-change',
      event,
      path: relativePath,
      timestamp: new Date().toISOString()
    });
  }

  return watcher;
}

/**
 * Setup HTTP server for API endpoints
 */
function setupHttpServer() {
  const http = require('http');

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${SERVER_PORT}`);

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Route handling
    if (url.pathname === '/api/data' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify(cache.data || { error: 'No data available' }));
    } else if (url.pathname === '/api/health' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'ok',
        version: cache.version,
        lastModified: cache.lastModified,
        uptime: process.uptime(),
        subscribers: cache.subscribers.size
      }));
    } else if (url.pathname === '/api/rebuild' && req.method === 'POST') {
      try {
        const data = buildDataJson();
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, version: cache.version }));
      } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });

  server.listen(SERVER_PORT, () => {
    console.log(`🌐 HTTP API server running on http://localhost:${SERVER_PORT}`);
  });

  return server;
}

/**
 * Setup WebSocket server
 */
function setupWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', ws => {
    cache.subscribers.add(ws);
    console.log(`🔌 WebSocket client connected (${cache.subscribers.size} total)`);

    // Send current data on connect
    if (cache.data) {
      ws.send(JSON.stringify({
        type: 'connected',
        version: cache.version,
        data: cache.data
      }));
    }

    ws.on('close', () => {
      cache.subscribers.delete(ws);
      console.log(`🔌 WebSocket client disconnected (${cache.subscribers.size} total)`);
    });
  });

  return wss;
}

/**
 * Main entry point
 */
function main() {
  console.log('🚀 Mission Control Data Layer starting...');
  console.log(`📂 Workspace: ${WORKSPACE}`);
  console.log(`📄 Data file: ${DATA_JSON_PATH}`);
  console.log(`🌐 Server port: ${SERVER_PORT}`);

  // Initial build
  buildDataJson();

  // Setup servers
  const httpServer = setupHttpServer();
  setupWebSocketServer(httpServer);

  // Setup file watcher
  const watcher = setupWatcher();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down...');
    watcher.close();
    httpServer.close();
    process.exit(0);
  });

  console.log(`✅ Ready! Watching for changes...`);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { buildDataJson, cache, setupWatcher };
