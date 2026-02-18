// Types for Mission Control Dashboard

export interface Agent {
  id: string
  name: string
  role: string
  model: string
  responsibility: string
  status: 'active' | 'busy' | 'idle'
  lastActive?: string
  temperature?: string
  specialties?: string[]
  soul?: AgentSoul
}

export interface AgentSoul {
  personality: string
  specialties: string[]
  whenToUse: string[]
  systemPrompt: string
  boundaries: string[]
}

export interface Task {
  id: string
  title: string
  status: 'todo' | 'in-progress' | 'blocked' | 'completed'
  agent?: string
  priority?: 'high' | 'medium' | 'low'
  description?: string
  section: string
}

export interface Project {
  id: string
  name: string
  status: string
  url?: string
  description?: string
  techStack?: string[]
  features?: string[]
  pending?: string[]
  details: Record<string, string | string[]>
}

export interface WorkflowStep {
  name: string
  agent?: string
  description: string
}

export interface MissionControlData {
  agents: Agent[]
  tasks: Task[]
  projects: Project[]
  workflow: WorkflowStep[]
  memorySystem: {
    files: { file: string; purpose: string; readFrequency: string }[]
  }
  lastUpdated: string
}

export interface SpawnAgentRequest {
  agent: 'quinn' | 'dex' | 'mantis' | 'echo' | 'hawthorne'
  task: string
}

export interface AddTaskRequest {
  title: string
  section?: string
  priority?: 'high' | 'medium' | 'low'
  description?: string
}

export interface UpdateProjectRequest {
  projectId: string
  status?: string
  pending?: string[]
  details?: Record<string, string | string[]>
}
