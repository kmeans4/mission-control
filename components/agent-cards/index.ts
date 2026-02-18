/**
 * Agent Cards Component - TypeScript Definitions
 * Mission Control Dashboard Agent Fleet Interface
 */

export type AgentStatus = 'online' | 'idle' | 'offline';

export interface TokenUsage {
  today: string;
  week: string;
  total: string;
  todayPct: number;
  weekPct: number;
  totalPct: number;
}

export interface Agent {
  name: string;
  emoji: string;
  role: string;
  model: string;
  status: AgentStatus;
  statusDisplay: string;
  bio: string;
  skills: string[];
  tokens: TokenUsage;
}

export type AgentId = 'sam' | 'quinn' | 'dex' | 'mantis' | 'echo' | 'hawthorne';

export interface AgentData {
  sam: Agent;
  quinn: Agent;
  dex: Agent;
  mantis: Agent;
  echo: Agent;
  hawthorne: Agent;
}

export type SpawnAction = 'spawn-task' | 'spawn-subagent' | 'send-message' | 'refresh-status';

export interface AgentCardsAPI {
  updateStatus(agentId: AgentId, status: AgentStatus): void;
  updateTokens(agentId: AgentId, usage: Partial<TokenUsage>): void;
  getAgent(agentId: AgentId): Agent | undefined;
  getAllAgents(): AgentId[];
}

declare global {
  interface Window {
    AgentCards: AgentCardsAPI;
  }
}

export {};
