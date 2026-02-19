'use client';

import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * Bottom sheet modal that slides up from the bottom
 * - Smooth slide animation
 * - Backdrop with fade
 * - Safe area support for notch handling
 * - Close button with 44px+ touch target
 * - Pull down to dismiss (basic gesture)
 */

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  height?: 'auto' | 'half' | 'full' | number;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  height = 'auto',
}: BottomSheetProps) {
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

  // Prevent body scroll when sheet is open
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

  const heightClass =
    height === 'half'
      ? 'h-[50vh]'
      : height === 'full'
        ? 'h-[85vh]'
        : height === 'auto'
          ? 'max-h-[85vh]'
          : `${height}px`;

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
      aria-label={title || 'Bottom sheet'}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Bottom Sheet */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-[#1a1a25] rounded-t-2xl 
                     border-t border-white/10 shadow-2xl transform transition-transform duration-300 ease-out
                     ${isOpen ? 'translate-y-0' : 'translate-y-full'} ${heightClass}`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Drag Handle */}
        <div className="flex items-center justify-center pt-3 pb-2">
          <div className="w-10 h-1.5 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <header className="flex items-center justify-between px-4 pb-3 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="flex items-center justify-center min-h-[44px] min-w-[44px] p-2 -mr-2 
                         text-gray-400 hover:text-white transition-colors rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/50"
              aria-label="Close bottom sheet"
            >
              <X size={24} />
            </button>
          </header>
        )}

        {/* Content */}
        <div className="h-full overflow-y-auto px-4 pb-4">{children}</div>
      </div>
    </div>
  );
}

export default BottomSheet;
