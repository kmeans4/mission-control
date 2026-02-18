'use client';

import React from 'react';
import { CheckSquare, Square, Clock, AlertCircle, Circle } from 'lucide-react';
import type { Task } from '@/lib/types';

interface TaskListProps {
  tasks: Task[];
  onToggle?: (taskId: string) => void;
}

const statusIcons = {
  todo: Circle,
  'in-progress': Clock,
  blocked: AlertCircle,
  completed: CheckSquare,
};

const statusColors = {
  todo: 'text-gray-400',
  'in-progress': 'text-amber-400',
  blocked: 'text-red-400',
  completed: 'text-green-400',
};

const priorityColors = {
  high: 'text-red-400 bg-red-400/10',
  medium: 'text-amber-400 bg-amber-400/10',
  low: 'text-gray-400 bg-gray-400/10',
};

export function TaskList({ tasks, onToggle }: TaskListProps) {
  // Group tasks by section
  const grouped = tasks.reduce((acc, task) => {
    const section = task.section || 'Uncategorized';
    if (!acc[section]) acc[section] = [];
    acc[section].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Sort sections: To Do/In Progress first, then others
  const sectionOrder = [
    'In Progress',
    'To Do',
    'Blocked',
    'Done',
    'Completed',
  ];
  
  const sortedSections = Object.keys(grouped).sort((a, b) => {
    const aIndex = sectionOrder.findIndex(s => a.toLowerCase().includes(s.toLowerCase()));
    const bIndex = sectionOrder.findIndex(s => b.toLowerCase().includes(s.toLowerCase()));
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  });

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Circle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No tasks found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedSections.map((section) => {
        const sectionTasks = grouped[section];
        return (
          <div key={section} className="animate-fade-in">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {section}
              <span className="ml-2 px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                {sectionTasks.length}
              </span>
            </h4>
            
            <div className="space-y-2">
              {sectionTasks.map((task) => {
                const StatusIcon = statusIcons[task.status] || Circle;
                const isDone = task.status === 'completed';
                
                return (
                  <div
                    key={task.id}
                    className={`glass-card p-3 flex items-start gap-3 group cursor-pointer
                               hover:border-purple-500/30 transition-all duration-200
                               ${isDone ? 'opacity-50' : ''}`}
                    onClick={() => onToggle?.(task.id)}
                  >
                    <div className="pt-0.5">
                      <StatusIcon className={`w-5 h-5 ${statusColors[task.status]}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${isDone ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                        {task.title}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-1">
                        {task.priority && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${priorityColors[task.priority]}`}>
                            {task.priority.toUpperCase()}
                          </span>
                        )}
                        {task.agent && (
                          <span className="text-[10px] text-purple-400">
                            @{task.agent}
                          </span>
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TaskList;