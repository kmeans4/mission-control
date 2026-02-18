import * as fs from 'fs';
import * as path from 'path';
import { buildData, saveData, parseActiveTasks, parseProjects, loadAgentData } from './parser';
import type { MissionControlData, Task, Project, Agent } from './types';

const WORKSPACE = process.env.WORKSPACE_PATH || '/Users/sam/.openclaw/workspace';
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'mission-control.json');

// In-memory cache
let dataCache: MissionControlData | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 5000; // 5 seconds

/**
 * Ensure data directory exists
 */
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Load data from JSON file or build if missing
 */
export function loadData(): MissionControlData {
  ensureDataDir();
  
  // Check memory cache first
  const now = Date.now();
  if (dataCache && (now - lastCacheTime) < CACHE_TTL) {
    return dataCache;
  }
  
  // Try to load from file
  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(content) as MissionControlData;
      dataCache = data;
      lastCacheTime = now;
      return data;
    } catch (error) {
      console.error('Error loading data file, rebuilding:', error);
    }
  }
  
  // Build fresh data
  return rebuildData();
}

/**
 * Rebuild data from markdown files
 */
export function rebuildData(): MissionControlData {
  ensureDataDir();
  const data = buildData();
  saveData(data, DATA_FILE);
  dataCache = data;
  lastCacheTime = Date.now();
  return data;
}

/**
 * Get cached data without rebuilding
 */
export function getCachedData(): MissionControlData | null {
  return dataCache;
}

/**
 * Clear cache
 */
export function clearCache(): void {
  dataCache = null;
  lastCacheTime = 0;
}

/**
 * Get agents
 */
export function getAgents(): Agent[] {
  return loadData().agents;
}

/**
 * Get tasks
 */
export function getTasks(): Task[] {
  return loadData().tasks;
}

/**
 * Get projects
 */
export function getProjects(): Project[] {
  return loadData().projects;
}

/**
 * Add a new task to active-tasks.md
 */
export function addTask(task: Omit<Task, 'id'>): Task {
  const tasksFile = path.join(WORKSPACE, 'active-tasks.md');
  
  if (!fs.existsSync(tasksFile)) {
    throw new Error('active-tasks.md not found');
  }
  
  let content = fs.readFileSync(tasksFile, 'utf-8');
  
  // Find or create section
  const section = task.section || 'To Do';
  const sectionPattern = new RegExp(`##+\\s*${section}\\s*\\n`, 'i');
  
  if (!sectionPattern.test(content)) {
    // Add new section at end
    content += `\\n\\n## ${section}\\n\\n`;
  }
  
  // Create task entry
  const priority = task.priority ? ` [${task.priority.toUpperCase()}]` : '';
  const agent = task.agent ? ` @${task.agent}` : '';
  const description = task.description ? `\\n  ${task.description}` : '';
  const taskLine = `- [ ] **${task.title}**${priority}${agent}${description}\\n`;
  
  // Insert after section header
  const sectionMatch = content.match(new RegExp(`(##+\\s*${section}\\s*\\n)`));
  if (sectionMatch) {
    const insertPos = sectionMatch.index! + sectionMatch[0].length;
    content = content.slice(0, insertPos) + taskLine + content.slice(insertPos);
  } else {
    content += taskLine;
  }
  
  fs.writeFileSync(tasksFile, content, 'utf-8');
  
  // Rebuild data
  const data = rebuildData();
  const newTask = data.tasks[data.tasks.length - 1];
  return newTask || { ...task, id: `task-${Date.now()}` };
}

/**
 * Update task status
 */
export function updateTaskStatus(taskId: string, status: Task['status']): boolean {
  const tasksFile = path.join(WORKSPACE, 'active-tasks.md');
  
  if (!fs.existsSync(tasksFile)) {
    return false;
  }
  
  let content = fs.readFileSync(tasksFile, 'utf-8');
  const lines = content.split('\\n');
  
  let taskIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(taskId) || 
        (taskId.startsWith('task-') && lines[i].includes(taskId.replace('task-', '')))) {
      taskIndex = i;
      break;
    }
  }
  
  if (taskIndex === -1) return false;
  
  // Update checkbox
  const isDone = status === 'completed';
  const checkbox = isDone ? '[x]' : '[ ]';
  lines[taskIndex] = lines[taskIndex].replace(/\\[[x \\]\\]/, checkbox);
  
  fs.writeFileSync(tasksFile, lines.join('\\n'), 'utf-8');
  rebuildData();
  return true;
}

/**
 * Update project
 */
export function updateProject(projectId: string, updates: Partial<Project>): boolean {
  const projectsFile = path.join(WORKSPACE, 'projects.md');
  
  if (!fs.existsSync(projectsFile)) {
    return false;
  }
  
  let content = fs.readFileSync(projectsFile, 'utf-8');
  
  // Find project section
  const projectPattern = new RegExp(`##\\s*${projectId.replace(/-/g, '[^\\w]*')}.*?\\n(?=##|$)`, 'is');
  const match = content.match(projectPattern);
  
  if (!match) return false;
  
  let projectSection = match[0];
  
  // Update fields
  if (updates.status) {
    if (projectSection.includes('**Status:**')) {
      projectSection = projectSection.replace(
        /\\*\\*Status:\\*\\*.*/,
        `**Status:** ${updates.status}`
      );
    } else {
      projectSection += `\\n**Status:** ${updates.status}`;
    }
  }
  
  if (updates.pending && updates.pending.length > 0) {
    const pendingList = updates.pending.map(p => `- ${p}`).join('\\n');
    if (projectSection.includes('**Pending:**')) {
      // Replace existing pending section
      projectSection = projectSection.replace(
        /\\*\\*Pending:\\*\\*[\\s\\S]*?(?=\\n##|$)/,
        `**Pending:**\\n${pendingList}`
      );
    } else {
      projectSection += `\\n\\n**Pending:**\\n${pendingList}`;
    }
  }
  
  // Replace in content
  content = content.replace(match[0], projectSection);
  fs.writeFileSync(projectsFile, content, 'utf-8');
  
  rebuildData();
  return true;
}

/**
 * Get data file path
 */
export function getDataFilePath(): string {
  return DATA_FILE;
}