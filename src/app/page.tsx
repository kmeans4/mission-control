'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AgentCard } from '@/components/AgentCard';
import { TaskList } from '@/components/TaskList';
import { ProjectCard } from '@/components/ProjectCard';
import { AddTaskForm } from '@/components/AddTaskForm';
import { DashboardHeader } from '@/components/DashboardHeader';
import { SpawnAgentButton } from '@/components/SpawnAgentButton';
import type { MissionControlData } from '@/lib/types';
import { Bot, CheckSquare, FolderOpen } from 'lucide-react';

// Polling interval in milliseconds
const POLL_INTERVAL = 30000; // 30 seconds

export default function DashboardPage() {
  const [data, setData] = useState<MissionControlData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Fetch data from JSON file
  const fetchData = useCallback(async (showLoading = false) => {
    if (showLoading) setIsRefreshing(true);
    
    try {
      // Use relative path with cache busting for GitHub Pages
      const cacheBuster = `?_cb=${Date.now()}`;
      const response = await fetch(`./data/dashboard-data.json${cacheBuster}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newData = await response.json();
      setData(newData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling for updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchData]);

  // Filter subagents (exclude Sam)
  const subagents = data?.agents.filter(a => a.id !== 'sam' && a.id !== 'kevin') || [];
  const sam = data?.agents.find(a => a.id === 'sam');
  
  // Sort tasks by priority
  const sortedTasks = data?.tasks.sort((a, b) => {
    if ((a.priority || 'medium') !== (b.priority || 'medium')) {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority || 'medium'] - priorityOrder[a.priority || 'medium'];
    }
    return 0;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full 
                        animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading Mission Control...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="text-red-400 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-white mb-2">Failed to Load</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => fetchData(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg
                       transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader
          agentCount={data?.agents.length || 0}
          taskCount={data?.tasks.length || 0}
          projectCount={data?.projects.length || 0}
          lastUpdated={data?.lastUpdated}
          onRefresh={() => fetchData(true)}
          isRefreshing={isRefreshing}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agents Panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Agents</h2>
            </div>
            
            {/* Sam Card */}
            {sam && (
              <div className="mb-6">
                <AgentCard agent={sam} />
              </div>
            )}
            
            {/* Subagents */}
            <div className="space-y-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Available Agents</p>
              {subagents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onSpawn={() => setSelectedAgent(agent.id)}
                />
              ))}
            </div>
            
            {/* Spawn Agent Section */}
            {selectedAgent && (
              <div className="mt-4 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Spawn Agent</p>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="text-xs text-gray-500 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <SpawnAgentButton
                  agent={selectedAgent}
                  standalone={true}
                  onSpawn={() => {
                    setSelectedAgent(null);
                    fetchData();
                  }}
                />
              </div>
            )}
          </div>

          {/* Tasks Panel */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-white">Tasks</h2>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                {sortedTasks.length}
              </span>
            </div>
            
            <div className="space-y-4">
              <AddTaskForm onAdd={() => fetchData()} />
              
              <div className="max-h-[500px] overflow-y-auto pr-2">
                <TaskList
                  tasks={sortedTasks}
                  onToggle={() => fetchData()}
                />
              </div>
            </div>
          </div>

          {/* Projects Panel */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <FolderOpen className="w-5 h-5 text-green-400" />
              <h2 className="text-lg font-semibold text-white">Projects</h2>
            </div>
            
            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
              {data?.projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                />
              ))}
              
              {data?.projects.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No projects found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-white/5 text-center">
          <p className="text-sm text-gray-500">
            OpenClaw Mission Control • Auto-updates every 30s
          </p>
        </footer>
      </div>
    </div>
  );
}
