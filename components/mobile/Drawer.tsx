'use client';

import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * Full-screen slide-in navigation drawer
 * - Slide in from left edge
 * - Backdrop with fade
 * - Safe area support
 * - Touch-optimized close button (44px+)
 * - Esc key to close
 */

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function Drawer({ isOpen, onClose, children, title }: DrawerProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
      aria-label={title || 'Navigation drawer'}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Drawer Panel */}
      <aside
        className={`absolute top-0 left-0 h-full w-[85%] max-w-[320px] bg-[#12121a] 
                     border-r border-white/10 shadow-2xl transform transition-transform duration-300 ease-out
                     ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ paddingLeft: 'env(safe-area-inset-left)' }}
      >
        {/* Header */}
        <header className="flex items-center justify-between min-h-[44px] px-4 py-3 border-b border-white/10">
          {title && (
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          )}
          <button
            onClick={onClose}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] p-2 -mr-2 
                       text-gray-400 hover:text-white transition-colors rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50"
            aria-label="Close drawer"
          >
            <X size={24} />
          </button>
        </header>

        {/* Content */}
        <div className="h-full overflow-y-auto pb-4" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
          {children}
        </div>
      </aside>
    </div>
  );
}

export default Drawer;
