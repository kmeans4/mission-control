'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Users, CheckSquare, FolderOpen, Activity } from 'lucide-react';

interface DashboardHeaderProps {
  agentCount: number;
  taskCount: number;
  projectCount: number;
  lastUpdated?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DashboardHeader({
  agentCount,
  taskCount,
  projectCount,
  lastUpdated,
  onRefresh,
  isRefreshing,
}: DashboardHeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }));
    
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  const formatLastUpdated = (date: string | undefined) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <header className="glass-card p-6 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 
                          flex items-center justify-center shadow-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Mission Control</h1>
              <p className="text-sm text-gray-400">OpenClaw Agent System Dashboard</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-gray-400">Agents:</span>
              <span className="font-semibold text-white">{agentCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-amber-400" />
              <span className="text-gray-400">Tasks:</span>
              <span className="font-semibold text-white">{taskCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-green-400" />
              <span className="text-gray-400">Projects:</span>
              <span className="font-semibold text-white">{projectCount}</span>
            </div>
          </div>

          <div className="h-8 w-px bg-white/10 mx-2" />

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              Last updated: {formatLastUpdated(lastUpdated)}
            </span>
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
