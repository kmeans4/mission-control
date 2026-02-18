import React, { useState, useRef, useCallback } from 'react';
import { QuickAction } from './types';

interface ActionButtonProps {
  action: QuickAction;
  onClick: () => void;
  disabled?: boolean;
  isMobile?: boolean;
}

const ICONS: Record<string, React.ReactNode> = {
  restart: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  heartbeat: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  brief: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  cron: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  clear: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  action,
  onClick,
  disabled = false,
  isMobile = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleTouchStart = useCallback(() => {
    setIsPressed(true);
    if (isMobile) {
      longPressTimer.current = setTimeout(() => {
        setContextMenuOpen(true);
      }, 600);
    }
  }, [isMobile]);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    if (!contextMenuOpen) {
      onClick();
    }
    setContextMenuOpen(false);
  }, [contextMenuOpen, onClick]);

  const baseClasses = `
    relative flex flex-col items-center justify-center
    min-w-[48px] min-h-[48px] p-3 rounded-xl
    transition-all duration-150 ease-out
    active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed
    ${isPressed ? 'scale-95' : ''}
  `;

  const variantClasses = {
    default: 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300',
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    destructive: 'bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400',
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[action.variant]}`}
      aria-label={action.label}
    >
      <span className="mb-1">{ICONS[action.icon] || ICONS.restart}</span>
      <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
      
      {contextMenuOpen && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10">
          Long press detected
        </div>
      )}
    </button>
  );
};
