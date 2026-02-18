import React from 'react';
import { useQuickActions } from './useQuickActions';
import { ActionButton } from './ActionButton';
import { ConfirmationModal } from './ConfirmationModal';
import { ToastContainer } from './Toast';

interface QuickActionsPanelProps {
  className?: string;
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({ className = '' }) => {
  const {
    actions,
    actionsCompleted,
    isLoading,
    toasts,
    pendingAction,
    handleActionClick,
    confirmAction,
    cancelAction,
    dismissToast,
    resetCounter,
  } = useQuickActions();

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your system with one tap</p>
        </div>
        
        {/* Gamification Counter */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm font-medium">{actionsCompleted} completed</span>
          {actionsCompleted > 0 && (
            <button
              onClick={resetCounter}
              className="ml-1 text-xs opacity-70 hover:opacity-100"
              title="Reset counter"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {actions.map((action) => (
          <ActionButton
            key={action.id}
            action={action}
            onClick={() => handleActionClick(action)}
            disabled={isLoading[action.id]}
            isMobile={isMobile}
          />
        ))}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!pendingAction}
        title={pendingAction?.label || 'Confirm Action'}
        message={pendingAction?.confirmationMessage || 'Are you sure you want to proceed?'}
        confirmLabel={pendingAction?.label}
        isDestructive={pendingAction?.variant === 'destructive'}
        onConfirm={confirmAction}
        onCancel={cancelAction}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Mobile Hint */}
      {isMobile && (
        <p className="mt-4 text-xs text-center text-slate-400">
          Long-press any button for more options
        </p>
      )}
    </div>
  );
};
