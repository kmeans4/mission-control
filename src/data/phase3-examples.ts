// Phase 3 Example Data - For testing and demonstration

import type { CronJob, TokenUsage, QuickAction } from '@/lib/types';

// Mock Token Usage Data
export const mockTokenUsages: TokenUsage[] = [
  {
    agentId: 'sam',
    agentName: 'Sam (Main Agent)',
    used: 245000,
    limit: 500000,
    color: 'bg-blue-500',
  },
  {
    agentId: 'quinn',
    agentName: 'Quinn (Code Agent)',
    used: 380000,
    limit: 500000,
    color: 'bg-purple-500',
  },
  {
    agentId: 'dex',
    agentName: 'Dex (Research Agent)',
    used: 125000,
    limit: 300000,
    color: 'bg-green-500',
  },
  {
    agentId: 'mantis',
    agentName: 'Mantis (QA Agent)',
    used: 95000,
    limit: 200000,
    color: 'bg-amber-500',
  },
  {
    agentId: 'echo',
    agentName: 'Echo (Voice Agent)',
    used: 45000,
    limit: 100000,
    color: 'bg-cyan-500',
  },
];

// Mock Cron Jobs Data
export const mockCronJobs: CronJob[] = [
  {
    id: 'daily-backup',
    name: 'Daily Database Backup',
    schedule: '0 2 * * *',
    nextRun: new Date(Date.now() + 6 * 3600 * 1000).toISOString(), // 6 hours from now
    lastRun: {
      timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      status: 'completed',
      duration: '4m 32s',
    },
    status: 'scheduled',
    description: 'Automated backup of all databases',
  },
  {
    id: 'hourly-sync',
    name: 'Agent State Sync',
    schedule: '0 * * * *',
    nextRun: new Date(Date.now() + 35 * 60 * 1000).toISOString(), // 35 minutes from now
    lastRun: {
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      status: 'completed',
      duration: '12s',
    },
    status: 'scheduled',
    description: 'Sync agent states across nodes',
  },
  {
    id: 'memory-cleanup',
    name: 'Memory Cleanup',
    schedule: '0 0 * * 0',
    nextRun: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(), // 3 days from now
    lastRun: {
      timestamp: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
      status: 'completed',
      duration: '1m 45s',
    },
    status: 'scheduled',
    description: 'Clean up old memory files',
  },
  {
    id: 'health-check',
    name: 'System Health Check',
    schedule: '*/15 * * * *',
    nextRun: new Date(Date.now() + 8 * 60 * 1000).toISOString(), // 8 minutes from now
    lastRun: {
      timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
      status: 'completed',
      duration: '3s',
    },
    status: 'scheduled',
    description: 'Check all system components',
  },
  {
    id: 'report-gen',
    name: 'Weekly Report Generation',
    schedule: '0 9 * * 1',
    nextRun: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(), // 5 days from now
    lastRun: {
      timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      status: 'failed',
      duration: '45s',
    },
    status: 'scheduled',
    description: 'Generate weekly activity reports',
  },
  {
    id: 'token-reset',
    name: 'Monthly Token Reset',
    schedule: '0 0 1 * *',
    nextRun: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString(), // 10 days from now
    lastRun: {
      timestamp: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
      status: 'completed',
      duration: '2s',
    },
    status: 'scheduled',
    description: 'Reset monthly token quotas',
  },
];

// Mock Quick Actions
export const mockQuickActions: QuickAction[] = [
  {
    id: 'gateway-restart',
    label: 'Restart Gateway',
    description: 'Restart the OpenClaw Gateway daemon',
    icon: 'restart',
    variant: 'primary',
    requiresConfirmation: true,
    confirmationMessage: 'This will temporarily disconnect all active sessions. Continue?',
  },
  {
    id: 'clear-sessions',
    label: 'Clear Sessions',
    description: 'Clear all active agent sessions',
    icon: 'clear',
    variant: 'destructive',
    requiresConfirmation: true,
    confirmationMessage: 'This will terminate all active sessions. Unsaved work will be lost. Continue?',
  },
  {
    id: 'cache-clear',
    label: 'Clear Cache',
    description: 'Clear application cache',
    icon: 'cache',
    variant: 'default',
    requiresConfirmation: false,
  },
  {
    id: 'sync-agents',
    label: 'Sync Agents',
    description: 'Re-sync all agent configurations',
    icon: 'agents',
    variant: 'default',
    requiresConfirmation: false,
  },
  {
    id: 'deploy-prod',
    label: 'Deploy',
    description: 'Deploy to production',
    icon: 'deploy',
    variant: 'primary',
    requiresConfirmation: true,
    confirmationMessage: 'Deploying to production will affect all users. Continue?',
  },
  {
    id: 'backup-db',
    label: 'Backup DB',
    description: 'Create database backup',
    icon: 'backup',
    variant: 'default',
    requiresConfirmation: false,
  },
  {
    id: 'cloud-sync',
    label: 'Cloud Sync',
    description: 'Sync with cloud storage',
    icon: 'sync',
    variant: 'default',
    requiresConfirmation: false,
  },
  {
    id: 'admin-settings',
    label: 'Admin Settings',
    description: 'Open admin panel',
    icon: 'settings',
    variant: 'default',
    requiresConfirmation: false,
  },
];

// Mock Project Health Data
export const mockProjectHealth = {
  'mission-control': {
    lastCommit: {
      message: 'Add Phase 3 gamification components',
      author: 'Sam',
      timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      hash: 'a3f7b2c',
    },
    buildStatus: 'passing' as const,
    buildTime: '2m 34s',
    repositoryUrl: 'https://github.com/openclaw/mission-control',
  },
  'cashedbets-v2': {
    lastCommit: {
      message: 'Fix betting calculation edge case',
      author: 'Quinn',
      timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      hash: 'b8e4d1f',
    },
    buildStatus: 'passing' as const,
    buildTime: '4m 12s',
    repositoryUrl: 'https://github.com/openclaw/cashedbets-v2',
  },
  'phenofarm-mvp': {
    lastCommit: {
      message: 'Update grower dashboard layout',
      author: 'Dex',
      timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      hash: 'c2a9e5d',
    },
    buildStatus: 'failing' as const,
    buildTime: '3m 45s',
    repositoryUrl: 'https://github.com/openclaw/phenofarm-mvp',
  },
  'agent-dashboard': {
    lastCommit: {
      message: 'Initial setup',
      author: 'Sam',
      timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      hash: 'd7c3f1a',
    },
    buildStatus: 'unknown' as const,
    buildTime: undefined,
    repositoryUrl: 'https://github.com/openclaw/agent-dashboard',
  },
};

export default {
  mockTokenUsages,
  mockCronJobs,
  mockQuickActions,
  mockProjectHealth,
};
