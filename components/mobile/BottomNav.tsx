'use client';

import React from 'react';
import { Home, Bot, CheckSquare, BarChart3, Settings } from 'lucide-react';

/**
 * Bottom navigation with 5 tabs optimized for mobile
 * - 44px+ touch targets (min-h-[44px] min-w-[44px])
 * - Safe area support for iPhone notched devices
 * - Fixed position at bottom with backdrop blur
 */

type Tab = 'home' | 'agents' | 'tasks' | 'analytics' | 'settings';

interface BottomNavProps {
  activeTab?: Tab;
  onTabChange?: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'Home', icon: <Home size={24} /> },
  { id: 'agents', label: 'Agents', icon: <Bot size={24} /> },
  { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={24} /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={24} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={24} /> },
];

export function BottomNav({ activeTab = 'home', onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="bg-[#12121a]/90 backdrop-blur-lg border-t border-white/10">
        <ul className="flex justify-around items-center">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id}>
                <button
                  onClick={() => onTabChange?.(tab.id)}
                  className="flex flex-col items-center justify-center gap-1 min-h-[44px] min-w-[44px] px-3 py-2 transition-colors"
                  aria-label={tab.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span
                    className={`transition-colors ${
                      isActive ? 'text-[#8b5cf6]' : 'text-gray-400'
                    }`}
                  >
                    {tab.icon}
                  </span>
                  <span
                    className={`text-[10px] font-medium transition-colors ${
                      isActive ? 'text-[#8b5cf6]' : 'text-gray-400'
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export default BottomNav;
