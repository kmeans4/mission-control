export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  variant: 'default' | 'destructive' | 'primary';
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

export interface QuickActionsState {
  actionsCompleted: number;
  isLoading: boolean;
}
