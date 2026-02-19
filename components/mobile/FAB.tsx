'use client';

import React from 'react';
import { Plus } from 'lucide-react';

/**
 * Floating Action Button (FAB)
 * - Fixed position in bottom-right corner
 * - 56px touch target (exceeds 44px minimum)
 * - Elevates on press with scale animation
 * - Safe area positioning
 */

interface FABProps {
  onClick?: () => void;
  icon?: React.ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  color?: 'primary' | 'secondary' | 'success' | 'danger';
  disabled?: boolean;
}

const colorClasses = {
  primary: 'bg-[#8b5cf6] hover:bg-[#7c3aed] active:bg-[#6d28d9]',
  secondary: 'bg-[#6b7280] hover:bg-[#475569] active:bg-[#334155]',
  success: 'bg-[#22c55e] hover:bg-[#16a34a] active:bg-[#15803d]',
  danger: 'bg-[#ef4444] hover:bg-[#dc2626] active:bg-[#b91c1c]',
};

export function FAB({
  onClick,
  icon = <Plus size={28} />,
  label,
  position = 'bottom-right',
  color = 'primary',
  disabled = false,
}: FABProps) {
  const positionClasses = {
    'bottom-right': 'right-4 md:right-6',
    'bottom-left': 'left-4 md:left-6',
    'bottom-center': 'left-1/2 -translate-x-1/2',
  };

  return (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`fixed z-40 ${positionClasses[position]}`}
      style={{ bottom: 'calc(16px + env(safe-area-inset-bottom))' }}
      aria-label={label || 'Add new item'}
      aria-disabled={disabled}
    >
      <span
        className={`flex items-center justify-center w-[56px] h-[56px] min-h-[44px] min-w-[44px]
                     rounded-2xl shadow-lg ${colorClasses[color]} transition-all duration-200
                     ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                     focus:outline-none focus:ring-4 focus:ring-[#8b5cf6]/30`}
      >
        <span
          className={`text-white ${disabled ? 'opacity-70' : ''}`}
          aria-hidden="true"
        >
          {icon}
        </span>
      </span>
    </button>
  );
}

export default FAB;
