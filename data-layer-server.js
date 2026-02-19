/**
 * Mission Control Data Layer - File Watcher & WebSocket Server
 * Watches workspace .md files and auto-rebuilds data.json on changes
 */

const chokidar = require('chokidar');
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE = process.env.WORKSPACE || '/Users/sam/.openclaw/workspace';
const DATA_DIR = path.join(WORKSPACE, 'mission-control');
const DATA_JSON_PATH = path.join(DATA_DIR, 'data.json');
const SERVER_PORT = process.env.PORT || 3001;

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

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
    const userMd = safeRead(path.join(WORKSPACE, 'USER.md'));
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
      user: parseUserData(userMd),
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
        cacheLocation: path.join(DATA_DIR, '.cache/')
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
    const soulPath = path.join(agentsDir, agentDir, 'SOUL.md');
    const content = safeRead(soulPath);
    if (content) {
      soulFiles[agentDir] = { path: soulPath, content };
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

  // Parse the agent table from AGENTS.md
  const lines = agentsMd.split('\n');
  let inAgentTable = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for table header
    if (line.includes('| **Name**') || line.includes('| Name |')) {
      inAgentTable = true;
      continue;
    }
    
    // Skip separator lines
    if (line.match(/^\|[-\s|]+$/)) continue;
    
    // Parse table rows
    if (inAgentTable && line.startsWith('|')) {
      const parts = line.split('|').map(p => p.trim()).filter(Boolean);
      if (parts.length >= 3) {
        const name = parts[0].replace(/\*\*/g, '').trim();
        const role = parts[1] || '';
        const model = parts[2] || '';
        const responsibilities = parts[3] || '';
        
        const key = name.toLowerCase();
        agents[key] = {
          name,
          model: model.toLowerCase(),
          role,
          responsibilities: responsibilities ? [responsibilities] : [],
          skills: [],
          soul: null
        };
      }
    }
    
    // Exit table on non-table line
    if (inAgentTable && !line.startsWith('|') && line.trim()) {
      inAgentTable = false;
    }
  }

  // Merge SOUL.md data
  for (const [agentKey, soulData] of Object.entries(soulFiles)) {
    const matchingAgent = Object.keys(agents).find(key => 
      agentKey.toLowerCase().includes(key) || key.includes(agentKey.toLowerCase())
    );
    
    if (matchingAgent && agents[matchingAgent]) {
      agents[matchingAgent].soul = parseSoulContent(soulData.content);
      agents[matchingAgent].soulPath = soulData.path;
    }
  }

  return agents;
}

/**
 * Parse SOUL.md content into structured data
 */
function parseSoulContent(content) {
  const soul = {
    model: null,
    base: null,
    purpose: null,
    personality: null,
    specialties: [],
    whenToUse: [],
    coreTruths: []
  };

  const lines = content.split('\n');
  let currentSection = null;

  for (const line of lines) {
    // Parse headers
    const headerMatch = line.match(/^#+\s+(.+)$/);
    if (headerMatch) {
      currentSection = headerMatch[1].toLowerCase();
      continue;
    }

    // Parse key-value pairs (Model:, Base:, Purpose:, etc.)
    const kvMatch = line.match(/\*\*(Model|Base|Purpose):\*\*\s*(.+)/);
    if (kvMatch) {
      const [, key, value] = kvMatch;
      soul[key.toLowerCase()] = value.trim();
      continue;
    }

    // Parse personality description
    if (line.includes('**Personality**') || currentSection === 'personality') {
      const personalityMatch = line.match(/\*\*Personality\*\*[:\s-]*(.+)/);
      if (personalityMatch) {
        soul.personality = personalityMatch[1].trim();
      } else if (line.trim().startsWith('-') && currentSection === 'personality') {
        const trait = line.replace(/^\s*-\s*/, '').trim();
        if (!soul.personality) soul.personality = '';
        soul.personality += (soul.personality ? '; ' : '') + trait;
      }
    }

    // Parse specialties/when to use
    if ((line.includes('**Specialties**') || line.includes('**When to Use**')) && line.match(/\*\*.+\*\*/)) {
      currentSection = line.toLowerCase().includes('specialty') ? 'specialties' : 'whentouse';
      continue;
    }

    if (line.trim().startsWith('-')) {
      const item = line.replace(/^\s*-\s*/, '').trim();
      if (currentSection === 'specialties') {
        soul.specialties.push(item);
      } else if (currentSection === 'whentouse') {
        soul.whenToUse.push(item);
      } else if (currentSection === 'personality') {
        if (!soul.personality) soul.personality = '';
        soul.personality += (soul.personality ? '; ' : '') + item;
      }
    }

    // Parse core truths
    if (line.includes('Core Truth') || currentSection === 'core truths') {
      currentSection = 'core truths';
      if (line.trim().startsWith('-')) {
        const truth = line.replace(/^\s*-\s*/, '').trim();
        soul.coreTruths.push(truth);
      }
    }
  }

  return soul;
}

/**
 * Parse active-tasks.md
 */
function parseActiveTasks(content) {
  if (!content) {
    return { 
      lastUpdated: null, 
      sections: {
        recentlyCompleted: [],
        inProgress: [],
        blocked: [],
        backlog: []
      },
      note: 'active-tasks.md not found - file will be created when tasks are added'
    };
  }

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
 * Parse individual task line
 */
function parseTaskLine(line) {
  const checkboxMatch = line.match(/- \[([ x])\]\s*(.+)/);
  if (!checkboxMatch) return null;

  const [, checked, text] = checkboxMatch;
  
  // Parse priority tags
  const priorityMatch = text.match(/\[([Pp][0-3])\]/);
  const priority = priorityMatch ? priorityMatch[1].toUpperCase() : null;
  
  // Parse assignee
  const assigneeMatch = text.match(/@(\w+)/);
  const assignee = assigneeMatch ? assigneeMatch[1] : null;
  
  // Clean text
  let cleanText = text
    .replace(/\[[Pp][0-3]\]/g, '')
    .replace(/@\w+/g, '')
    .trim();

  return {
    text: cleanText,
    completed: checked === 'x',
    priority,
    assignee,
    raw: line.trim()
  };
}

/**
 * Parse projects.md
 */
function parseProjectsData(content) {
  if (!content) {
    return {
      note: 'projects.md not found - file will be created when projects are added'
    };
  }

  const projects = {};
  let currentProject = null;

  for (const line of content.split('\n')) {
    const projectMatch = line.match(/^##\s+(.+)$/);
    if (projectMatch) {
      const [, name] = projectMatch;
      currentProject = name.trim().replace(/\s+/g, '_').toLowerCase();
      projects[currentProject] = { 
        name, 
        status: 'Unknown', 
        techStack: [],
        urls: {},
        details: [] 
      };
    } else if (currentProject && line.startsWith('**Status:**')) {
      projects[currentProject].status = line.replace('**Status:**', '').trim();
    } else if (currentProject && line.startsWith('**URL:**')) {
      const url = line.replace('**URL:**', '').trim();
      projects[currentProject].urls.main = url;
    } else if (currentProject && line.startsWith('**Tech Stack:**')) {
      const tech = line.replace('**Tech Stack:**', '').trim();
      projects[currentProject].techStack = tech.split(',').map(t => t.trim()).filter(Boolean);
    } else if (currentProject && line.trim() && !line.startsWith('#')) {
      projects[currentProject].details.push(line.trim());
    }
  }

  return projects;
}

/**
 * Parse USER.md for user preferences
 */
function parseUserData(content) {
  if (!content) return null;
  
  const user = {
    name: null,
    preferences: {},
    raw: content.substring(0, 500) // First 500 chars
  };

  const lines = content.split('\n');
  for (const line of lines) {
    if (line.includes('**Name:**') || line.includes('Name:')) {
      user.name = line.replace(/.*Name[:\*]*/, '').trim();
    }
  }

  return user;
}

/**
 * Extract date from content
 */
function extractDate(content) {
  const dateMatch = content.match(/(\d{4}-\d{2}-\d{2})/);
  return dateMatch ? dateMatch[1] : null;
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
          commits: 0,
          lastCommit: null,
          emails: new Set()
        };
      }
      authorStats[commit.author].commits++;
      authorStats[commit.author].emails.add(commit.email);
      if (!authorStats[commit.author].lastCommit || 
          new Date(commit.date) > new Date(authorStats[commit.author].lastCommit)) {
        authorStats[commit.author].lastCommit = commit.date;
      }
    });

    // Convert Sets to Arrays for JSON
    const serializableAuthorStats = {};
    for (const [author, stats] of Object.entries(authorStats)) {
      serializableAuthorStats[author] = {
        commits: stats.commits,
        lastCommit: stats.lastCommit,
        emails: Array.from(stats.emails)
      };
    }

    return {
      lastCommit,
      recentCommits: commits,
      authorStats: serializableAuthorStats,
      totalCommits: commits.length,
      repository: path.basename(WORKSPACE)
    };
  } catch (error) {
    console.error('Git analytics error:', error.message);
    return { error: error.message };
  }
}

/**
 * Broadcast message to all WebSocket clients
 */
function broadcast(message) {
  const messageStr = JSON.stringify(message);
  cache.subscribers.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(messageStr);
    }
  });
}

/**
 * Setup file watcher
 */
function setupFileWatcher() {
  const watchPaths = [
    path.join(WORKSPACE, '*.md'),
    path.join(WORKSPACE, 'agents/*/SOUL.md'),
    path.join(WORKSPACE, 'memory/*.md')
  ];

  console.log(`[${new Date().toISOString()}] 👁️ Setting up file watcher...`);
  console.log(`[${new Date().toISOString()}] 📁 Watching: ${watchPaths.join(', ')}`);

  const watcher = chokidar.watch(watchPaths, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 500,
      pollInterval: 100
    }
  });

  let rebuildTimeout = null;

  watcher
    .on('change', filePath => {
      console.log(`[${new Date().toISOString()}] 📝 File changed: ${path.relative(WORKSPACE, filePath)}`);
      
      // Debounce rebuilds
      clearTimeout(rebuildTimeout);
      rebuildTimeout = setTimeout(() => {
        console.log(`[${new Date().toISOString()}] 🔄 Triggering rebuild...`);
        try {
          buildDataJson();
        } catch (error) {
          console.error('Rebuild failed:', error.message);
        }
      }, 1000);
    })
    .on('add', filePath => {
      console.log(`[${new Date().toISOString()}] ➕ File added: ${path.relative(WORKSPACE, filePath)}`);
    })
    .on('unlink', filePath => {
      console.log(`[${new Date().toISOString()}] ➖ File removed: ${path.relative(WORKSPACE, filePath)}`);
    })
    .on('error', error => {
      console.error(`[${new Date().toISOString()}] ⚠️ Watcher error:`, error);
    })
    .on('ready', () => {
      console.log(`[${new Date().toISOString()}] ✅ File watcher ready`);
    });

  return watcher;
}

/**
 * Setup HTTP server
 */
function setupHttpServer() {
  const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://localhost:${SERVER_PORT}`);

    // API: Get data.json
    if (url.pathname === '/api/data' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(cache.data || buildDataJson(), null, 2));
      return;
    }

    // API: Health check
    if (url.pathname === '/api/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'healthy',
        version: cache.version,
        lastModified: cache.lastModified?.toISOString(),
        uptime: process.uptime()
      }));
      return;
    }

    // API: Manual rebuild
    if (url.pathname === '/api/rebuild' && req.method === 'POST') {
      try {
        const data = buildDataJson();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          version: cache.version,
          buildTimeMs: data.metadata.buildTimeMs
        }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
      return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  return server;
}

/**
 * Setup WebSocket server
 */
function setupWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    console.log(`[${new Date().toISOString()}] 🔌 WebSocket client connected`);
    
    // Add to subscribers
    cache.subscribers.add(ws);

    // Send current data
    ws.send(JSON.stringify({
      type: 'initial',
      version: cache.version,
      timestamp: cache.lastModified?.toISOString(),
      data: cache.data
    }));

    ws.on('close', () => {
      console.log(`[${new Date().toISOString()}] 🔌 WebSocket client disconnected`);
      cache.subscribers.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error.message);
      cache.subscribers.delete(ws);
    });
  });

  return wss;
}

/**
 * Main initialization
 */
function main() {
  console.log(`[${new Date().toISOString()}] 🚀 Mission Control Data Layer Starting...`);
  console.log(`[${new Date().toISOString()}] 📁 Workspace: ${WORKSPACE}`);
  console.log(`[${new Date().toISOString()}] 💾 Data path: ${DATA_JSON_PATH}`);

  // Initial build
  try {
    buildDataJson();
  } catch (error) {
    console.error('Initial build failed:', error);
    process.exit(1);
  }

  // Setup file watcher
  setupFileWatcher();

  // Setup HTTP server
  const server = setupHttpServer();

  // Setup WebSocket
  setupWebSocketServer(server);

  // Start server
  server.listen(SERVER_PORT, () => {
    console.log(`[${new Date().toISOString()}] ✅ Server running on port ${SERVER_PORT}`);
    console.log(`[${new Date().toISOString()}] 📊 API: http://localhost:${SERVER_PORT}/api/data`);
    console.log(`[${new Date().toISOString()}] 💓 Health: http://localhost:${SERVER_PORT}/api/health`);
    console.log(`[${new Date().toISOString()}] 🔄 WebSocket: ws://localhost:${SERVER_PORT}`);
  });
}

// Run if executed directly
if (require.main === module) {
  main();
}

// Export for testing
module.exports = {
  buildDataJson,
  parseAgentsData,
  parseActiveTasks,
  parseProjectsData,
  buildGitAnalytics
};