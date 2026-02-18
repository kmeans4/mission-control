import { useState, useCallback, useEffect } from 'react';
import { QuickAction, Toast } from './types';

const ACTIONS: QuickAction[] = [
  {
    id: 'restart-gateway',
    label: 'Restart Gateway',
    icon: 'restart',
    variant: 'destructive',
    requiresConfirmation: true,
    confirmationMessage: 'This will temporarily disconnect all agents. Are you sure?',
  },
  {
    id: 'trigger-heartbeat',
    label: 'Trigger Heartbeat',
    icon: 'heartbeat',
    variant: 'primary',
  },
  {
    id: 'run-daily-brief',
    label: 'Run Daily Brief',
    icon: 'brief',
    variant: 'default',
  },
  {
    id: 'pause-resume-crons',
    label: 'Pause/Resume Crons',
    icon: 'cron',
    variant: 'destructive',
    requiresConfirmation: true,
    confirmationMessage: 'This will affect all scheduled tasks. Continue?',
  },
  {
    id: 'clear-sessions',
    label: 'Clear Sessions',
    icon: 'clear',
    variant: 'destructive',
    requiresConfirmation: true,
    confirmationMessage: 'All active sessions will be terminated. This cannot be undone.',
  },
];

const STORAGE_KEY = 'mc-quick-actions-completed';

export const useQuickActions = () => {
  const [actionsCompleted, setActionsCompleted] = useState(0);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pendingAction, setPendingAction] = useState<QuickAction | null>(null);

  // Load actions completed count from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setActionsCompleted(parseInt(stored, 10) || 0);
    }
  }, []);

  // Save to localStorage when count changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, actionsCompleted.toString());
  }, [actionsCompleted]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type, duration: 3000 }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const executeAction = useCallback(async (action: QuickAction) => {
    setIsLoading((prev) => ({ ...prev, [action.id]: true }));

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Increment actions completed counter (gamification)
      setActionsCompleted((prev) => prev + 1);

      addToast(`${action.label} completed successfully`, 'success');
    } catch (error) {
      addToast(`Failed to ${action.label.toLowerCase()}`, 'error');
    } finally {
      setIsLoading((prev) => ({ ...prev, [action.id]: false }));
    }
  }, [addToast]);

  const handleActionClick = useCallback((action: QuickAction) => {
    if (action.requiresConfirmation) {
      setPendingAction(action);
    } else {
      executeAction(action);
    }
  }, [executeAction]);

  const confirmAction = useCallback(() => {
    if (pendingAction) {
      executeAction(pendingAction);
      setPendingAction(null);
    }
  }, [pendingAction, executeAction]);

  const cancelAction = useCallback(() => {
    setPendingAction(null);
  }, []);

  const resetCounter = useCallback(() => {
    setActionsCompleted(0);
    addToast('Actions counter reset', 'info');
  }, [addToast]);

  return {
    actions: ACTIONS,
    actionsCompleted,
    isLoading,
    toasts,
    pendingAction,
    handleActionClick,
    confirmAction,
    cancelAction,
    dismissToast,
    resetCounter,
  };
};
