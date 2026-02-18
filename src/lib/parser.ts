import * as fs from 'fs';
import * as path from 'path';
import type { Agent, Task, Project, AgentSoul, MissionControlData } from './types';

const WORKSPACE = process.env.WORKSPACE_PATH || '/Users/sam/.openclaw/workspace';

/**
 * Parse markdown table to structured data
 */
function parseMarkdownTable(content: string): Record<string, string>[] {
  const lines = content.split('\n');
  const rows: Record<string, string>[] = [];
  let headers: string[] = [];
  let foundHeader = false;

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) continue;
    
    // Header row (first non-empty line with content | content)
    if (!foundHeader && trimmed.includes('|')) {
      const cells = trimmed.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length > 0) {
        headers = cells.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, '_'));
        foundHeader = true;
      }
      continue;
    }
    
    // Separator row (---|---|---)
    if (foundHeader && /^[\|\s\-:]+$/.test(trimmed)) {
      continue;
    }
    
    // Data row
    if (foundHeader && trimmed.includes('|')) {
      const cells = trimmed.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length > 0) {
        const row: Record<string, string> = {};
        headers.forEach((h, i) => {
          row[h] = cells[i] || '';
        });
        rows.push(row);
      }
    }
  }
  
  return rows;
}

/**
 * Extract text from markdown, removing formatting
 */
export function extractPlainText(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[(.*?)]\(.*?\)/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extract sections from markdown content
 */
function extractSections(content: string): Map<string, string> {
  const sections = new Map<string, string>();
  const lines = content.split('\n');
  let currentSection = 'header';
  let currentContent: string[] = [];
  
  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      if (currentContent.length > 0) {
        sections.set(currentSection, currentContent.join('\n'));
      }
      currentSection = match[2].trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  
  if (currentContent.length > 0) {
    sections.set(currentSection, currentContent.join('\n'));
  }
  
  return sections;
}

/**
 * Parse AGENTS.md
 */
export function parseAgents(content: string): Agent[] {
  const agents: Agent[] = [];
  
  // Parse agent table
  const tableMatch = content.match(/\|\s*Agent\s*\|([\s\S]*?)\n\n/);
  if (tableMatch) {
    const rows = parseMarkdownTable(tableMatch[0]);
    
    for (const row of rows) {
      const name = (row['agent'] || '').replace(/\*\*/g, '').trim();
      if (!name) continue;
      
      const agent: Agent = {
        id: name.toLowerCase(),
        name: name,
        role: (row['role'] || '').replace(/\*\*/g, ''),
        model: (row['model'] || '').replace(/\*\*/g, ''),
        responsibility: (row['responsibility'] || '').replace(/\*\*/g, ''),
        status: 'idle',
      };
      
      // Extract temperature if mentioned
      const tempMatch = content.match(/(?:Sam operates at|temperature).*?(\d+\.\d+)/i);
      if (tempMatch && name.toLowerCase() === 'sam') {
        agent.temperature = tempMatch[1];
      }
      
      agents.push(agent);
    }
  }
  
  return agents;
}

/**
 * Parse agent SOUL.md
 */
export function parseAgentSoul(content: string): AgentSoul {
  const soul: AgentSoul = {
    personality: '',
    specialties: [],
    whenToUse: [],
    systemPrompt: '',
    boundaries: [],
  };
  
  const sections = extractSections(content);
  
  // Extract specialties
  const specialtiesMatch = content.match(/##\s*Specialties([\s\S]*?)(?=##|$)/i);
  if (specialtiesMatch) {
    soul.specialties = specialtiesMatch[1]
      .split('\n')
      .filter(l => l.trim().startsWith('-'))
      .map(l => l.replace(/^-\s*/, '').trim());
  }
  
  // Extract personality from Core Truths
  const truthsMatch = content.match(/##\s*Core\s*Truths([\s\S]*?)(?=##|$)/i);
  if (truthsMatch) {
    soul.personality = extractPlainText(truthsMatch[1]).slice(0, 500);
  }
  
  // Extract system prompt
  const systemMatch = content.match(/##\s*System\s*Prompt([\s\S]*?)(?=##|$)/i);
  if (systemMatch) {
    soul.systemPrompt = extractPlainText(systemMatch[1]).slice(0, 500);
  }
  
  return soul;
}

/**
 * Parse active-tasks.md
 */
export function parseActiveTasks(content: string): Task[] {
  const tasks: Task[] = [];
  const lines = content.split('\n');
  let currentSection = '';
  
  for (const line of lines) {
    const sectionMatch = line.match(/^##+\s+(.+)$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      continue;
    }
    
    const taskMatch = line.match(/^- \[([x\s])\]\s+\*\*(.+?)\*\*/);
    if (taskMatch) {
      const isDone = taskMatch[1] === 'x';
      const title = taskMatch[2];
      
      tasks.push({
        id: `task-${tasks.length}`,
        title,
        status: isDone ? 'completed' : 
                currentSection.toLowerCase().includes('in progress') ? 'in-progress' :
                currentSection.toLowerCase().includes('blocked') ? 'blocked' : 'todo',
        section: currentSection,
      });
    }
  }
  
  return tasks;
}

/**
 * Parse projects.md
 */
export function parseProjects(content: string): Project[] {
  const projects: Project[] = [];
  const sections = content.split('##');
  
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    const lines = section.split('\n').filter(Boolean);
    
    if (lines.length === 0) continue;
    
    const name = lines[0].trim();
    const project: Project = {
      id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name,
      status: 'unknown',
      details: {},
    };
    
    for (const line of lines) {
      const statusMatch = line.match(/\*\*Status:\*\*\s*(.+)/i);
      if (statusMatch) {
        project.status = statusMatch[1].trim();
      }
      
      const urlMatch = line.match(/\*\*URL:\*\*\s*(.+)/i);
      if (urlMatch) {
        project.url = urlMatch[1].trim();
      }
      
      const purposeMatch = line.match(/\*\*Purpose:\*\*\s*(.+)/i);
      if (purposeMatch) {
        project.description = purposeMatch[1].trim();
      }
      
      const techMatch = line.match(/\*\*Tech Stack:\*\*\s*(.+)/i);
      if (techMatch) {
        project.techStack = techMatch[1].split(',').map(s => s.trim());
      }
    }
    
    projects.push(project);
  }
  
  return projects;
}

/**
 * Load all agent data including SOUL.md files
 */
export function loadAgentData(): Agent[] {
  const agentsFile = path.join(WORKSPACE, 'AGENTS.md');
  const agents: Agent[] = [];
  
  if (fs.existsSync(agentsFile)) {
    const content = fs.readFileSync(agentsFile, 'utf-8');
    agents.push(...parseAgents(content));
  }
  
  // Load SOUL.md for each agent
  const agentDirs = ['quinn', 'dex', 'mantis', 'echo', 'hawthorne'];
  
  for (const agentDir of agentDirs) {
    const soulPath = path.join(WORKSPACE, 'agents', agentDir, 'SOUL.md');
    const agentId = agentDir === 'qwen-coder' ? 'quinn' : 
                    agentDir === 'qwen-implementer' ? 'dex' :
                    agentDir === 'phi-reporter' ? 'echo' :
                    agentDir === 'pruner' ? 'hawthorne' : 
                    agentDir;
    
    if (fs.existsSync(soulPath)) {
      const soulContent = fs.readFileSync(soulPath, 'utf-8');
      const soul = parseAgentSoul(soulContent);
      
      const agent = agents.find(a => a.id === agentId);
      if (agent) {
        agent.soul = soul;
      } else {
        // Create agent entry if not in table
        agents.push({
          id: agentId,
          name: agentId.charAt(0).toUpperCase() + agentId.slice(1),
          role: 'Subagent',
          model: 'unknown',
          responsibility: 'See SOUL.md',
          status: 'idle',
          soul,
        });
      }
    }
  }
  
  return agents;
}

/**
 * Build complete data file
 */
export function buildData(): MissionControlData {
  const agents = loadAgentData();
  
  // Parse tasks
  const tasksFile = path.join(WORKSPACE, 'active-tasks.md');
  const tasks: Task[] = [];
  if (fs.existsSync(tasksFile)) {
    const content = fs.readFileSync(tasksFile, 'utf-8');
    tasks.push(...parseActiveTasks(content));
  }
  
  // Parse projects
  const projectsFile = path.join(WORKSPACE, 'projects.md');
  const projects: Project[] = [];
  if (fs.existsSync(projectsFile)){
    const content = fs.readFileSync(projectsFile, 'utf-8');
    projects.push(...parseProjects(content));
  }
  
  // Parse workflow from AGENTS.md
  const workflow = [
    { name: 'Kevin\'s Request', description: 'Task received from user', agent: 'kevin' },
    { name: 'Orchestration', description: 'Sam routes to appropriate agent', agent: 'sam' },
    { name: 'Execution', description: 'Subagent performs task', agent: 'subagent' },
    { name: 'QA Gate', description: 'Mantis verifies output', agent: 'mantis' },
    { name: 'Final Update', description: 'Sam reports to Kevin', agent: 'sam' },
  ];
  
  return {
    agents,
    tasks,
    projects,
    workflow,
    memorySystem: {
      files: [
        { file: 'active-tasks.md', purpose: 'Current work, priorities', readFrequency: 'Every startup FIRST' },
        { file: 'projects.md', purpose: 'Project status', readFrequency: 'When delegating' },
        { file: 'SOUL.md', purpose: 'Agent identity', readFrequency: 'Every session' },
        { file: 'AGENTS.md', purpose: 'Agent network overview', readFrequency: 'Reference' },
        { file: 'MEMORY.md', purpose: 'Curated wisdom', readFrequency: 'When needed' },
      ],
    },
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Save data to JSON file
 */
export function saveData(data: MissionControlData, outputPath: string): void {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
}

// CLI usage
if (require.main === module) {
  const data = buildData();
  const outputPath = path.join(__dirname, '..', 'data', 'mission-control.json');
  saveData(data, outputPath);
  console.log(`Data saved to ${outputPath}`);
}
