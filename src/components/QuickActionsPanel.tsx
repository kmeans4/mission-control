'use client';

import React, { useState } from 'react';
import { 
  RotateCcw, 
  Trash2, 
  Settings, 
  Zap, 
  Shield, 
  Database, 
  Cloud, 
  Bot,
  CheckCircle,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: 'restart' | 'clear' | 'settings' | 'deploy' | 'backup' | 'sync' | 'agents' | 'cache';
  variant?: 'default' | 'destructive' | 'primary';
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  disabled?: boolean;
}

export interface QuickActionsPanelProps {
  actions?: QuickAction[];
  onAction?: (actionId: string) => Promise<void> | void;
  completedCount?: number;
  onResetCount?: () => void;
  className?: string;
}

const actionIcons: Record<QuickAction['icon'], typeof RotateCcw> = {
  restart: RotateCcw,
  clear: Trash2,
  settings: Settings,
  deploy: Zap,
  backup: Database,
  sync: Cloud,
  agents: Bot,
  cache: Shield,
};

const variantStyles = {
  default: 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border-white/10',
  destructive: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border-red-500/20',
  primary: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 border-blue-500/20',
};

// Default admin-focused actions
const defaultActions: QuickAction[] = [
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

export function QuickActionsPanel({
  actions = defaultActions,
  onAction,
  completedCount = 0,
  onResetCount,
  className = '',
}: QuickActionsPanelProps) {
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());
  const [pendingAction, setPendingAction] = useState<QuickAction | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleActionClick = async (action: QuickAction) => {
    if (action.disabled || !onAction) return;

    if (action.requiresConfirmation) {
      setPendingAction(action);
      return;
    }

    await executeAction(action);
  };

  const executeAction = async (action: QuickAction) => {
    setLoadingActions(prev => new Set(prev).add(action.id));
    
    try {
      await onAction?.(action.id);
      addToast(`${action.label} completed successfully`, 'success');
    } catch (error) {
      addToast(`${action.label} failed: ${(error as Error).message}`, 'error');
    } finally {
      setLoadingActions(prev => {
        const next = new Set(prev);
        next.delete(action.id);
        return next;
      });
    }
  };

  const confirmAction = async () => {
    if (pendingAction) {
      await executeAction(pendingAction);
      setPendingAction(null);
    }
  };

  const cancelAction = () => {
    setPendingAction(null);
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Admin shortcuts and system controls</p>
        </div>
        
        {/* Gamification Counter */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{completedCount} completed</span>
          {completedCount > 0 && onResetCount && (
            <button
              onClick={onResetCount}
              className="ml-1 text-xs opacity-70 hover:opacity-100"
              title="Reset counter"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {actions.map((action) => {
          const Icon = actionIcons[action.icon];
          const isLoading = loadingActions.has(action.id);
          const style = variantStyles[action.variant || 'default'];

          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              disabled={isLoading || action.disabled}
              className={`
                relative p-4 rounded-xl border transition-all duration-200
                ${style}
                ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${isLoading ? 'pointer-events-none' : ''}
                hover:scale-[1.02] active:scale-[0.98]
              `}
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-3">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              {/* Label */}
              <div className="text-left">
                <div className="text-sm font-medium">{action.label}</div>
                <div className="text-xs opacity-70 mt-0.5 line-clamp-1">{action.description}</div>
              </div>

              {/* Loading Overlay */}
              {isLoading && (
                <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {pendingAction && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                pendingAction.variant === 'destructive' 
                  ? 'bg-red-500/10 text-red-500' 
                  : 'bg-blue-500/10 text-blue-500'
              }`}>
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Confirm Action
              </h3>
            </div>

            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {pendingAction.confirmationMessage || 'Are you sure you want to proceed?'}
            </p>

            <div className="flex gap-3">
              <button
                onClick={cancelAction}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                  pendingAction.variant === 'destructive'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {pendingAction.label}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
              ${toast.type === 'success' ? 'bg-green-500 text-white' : ''}
              ${toast.type === 'error' ? 'bg-red-500 text-white' : ''}
              ${toast.type === 'info' ? 'bg-slate-800 text-white' : ''}
              animate-in slide-in-from-right-full
            `}
          >
            {toast.type === 'success' && <CheckCircle className="w-4 h-4" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4" />}
            {toast.type === 'info' && <AlertCircle className="w-4 h-4" />}
            <span className="text-sm">{toast.message}</span>
            <button onClick={() => dismissToast(toast.id)} className="ml-2 hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuickActionsPanel;
