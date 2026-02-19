const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3456;
const TASKS_FILE = path.join(__dirname, 'tasks.json');
const ACTIVE_TASKS_FILE = path.join(__dirname, '..', 'active-tasks.md');

// Load tasks from JSON
function loadTasks() {
  try {
    const data = fs.readFileSync(TASKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return { tasks: [], teams: [], projects: [] };
  }
}

// Save tasks to JSON (atomic)
function saveTasks(data) {
  const tempFile = TASKS_FILE + '.tmp';
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2));
  fs.renameSync(tempFile, TASKS_FILE);
}

// Load active-tasks.md
function loadActiveTasks() {
  try {
    const content = fs.readFileSync(ACTIVE_TASKS_FILE, 'utf8');
    return content;
  } catch {
    return '';
  }
}

// Parse tasks from active-tasks.md markdown
function parseActiveTasksMarkdown(content) {
  const tasks = [];
  const lines = content.split('\n');
  
  // Simple parser for markdown task format
  lines.forEach(line => {
    const match = line.match(/^\s*-\s*\[([ x])\]\s*\*\*(.+?)\*\*(?:\s*—\s*(.+))?/);
    if (match) {
      tasks.push({
        completed: match[1] === 'x',
        title: match[2],
        description: match[3] || '',
        source: 'active-tasks.md'
      });
    }
  });
  
  return tasks;
}

// Update active-tasks.md with task
function upsertActiveTask(task, status) {
  let content = loadActiveTasks();
  const lines = content.split('\n');
  const newTaskLine = `- [${status === 'done' ? 'x' : ' '}] **${task.title}** — ${task.description || ''}`;
  
  // Find existing task
  let found = false;
  const sectionRegex = /## (In Progress|Backlog|Recently Completed)/;
  let targetSection = 'In Progress';
  if (status === 'done') targetSection = 'Recently Completed';
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(task.title)) {
      // Update existing
      const sectionMatch = sectionRegex.exec(content);
      if (sectionMatch) {
        lines[i] = newTaskLine;
      }
      found = true;
      break;
    }
  }
  
  if (!found && status !== 'done') {
    // Add to In Progress section
    const insertIdx = lines.findIndex(l => l.match(/^## In Progress/));
    if (insertIdx !== -1) {
      lines.splice(insertIdx + 2, 0, newTaskLine);
    }
  }
  
  // Atomic write
  const tempFile = ACTIVE_TASKS_FILE + '.tmp';
  fs.writeFileSync(tempFile, lines.join('\n'));
  fs.renameSync(tempFile, ACTIVE_TASKS_FILE);
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // GET /api/tasks
  if (req.url === '/api/tasks' && req.method === 'GET') {
    const data = loadTasks();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
    return;
  }

  // POST /api/tasks
  if (req.url === '/api/tasks' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        saveTasks(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // GET /api/active-tasks
  if (req.url === '/api/active-tasks' && req.method === 'GET') {
    const content = loadActiveTasks();
    const tasks = parseActiveTasksMarkdown(content);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ content, tasks }));
    return;
  }

  // POST /api/active-tasks
  if (req.url === '/api/active-tasks' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        upsertActiveTask(data.task, data.status);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Serve tasks.html
  if (req.url === '/tasks' || req.url === '/tasks.html') {
    const htmlPath = path.join(__dirname, 'tasks.html');
    fs.readFile(htmlPath, 'utf8', (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading tasks.html');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }

  // 404
  res.writeHead(404);
  res.end('Not found');
});

// File watcher for live updates
let lastContent = loadTasks();
fs.watch(TASKS_FILE, (eventType) => {
  if (eventType === 'change') {
    const current = loadTasks();
    if (JSON.stringify(current) !== JSON.stringify(lastContent)) {
      lastContent = current;
      console.log('📄 tasks.md changed - broadcasting to clients');
      // Could implement WebSocket for real-time push
    }
  }
});

server.listen(PORT, () => {
  console.log(`📋 Mission Control API running at http://localhost:${PORT}`);
  console.log(`   GET  /api/tasks - Get all tasks`);
  console.log(`   POST /api/tasks - Save tasks`);
  console.log(`   GET  /api/active-tasks - Read active-tasks.md`);
  console.log(`   POST /api/active-tasks - Update active-tasks.md`);
  console.log(`   /tasks.html - Kanban board UI`);
});
