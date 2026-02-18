'use client';

import React, { useState } from 'react';
import { Plus, CheckCircle } from 'lucide-react';

interface AddTaskFormProps {
  onAdd?: () => void;
}

export function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [section, setSection] = useState('To Do');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!title.trim()) return;

    const priorityTag = priority !== 'medium' ? ` [${priority.toUpperCase()}]` : '';
    const descLine = description.trim() ? `\n  ${description.trim()}` : '';
    const taskLine = `- [ ] **${title.trim()}**${priorityTag}${descLine}`;
    
    navigator.clipboard.writeText(taskLine);
    setCopiedText(taskLine);
    
    setTimeout(() => {
      setIsOpen(false);
      setTitle('');
      setDescription('');
      setCopiedText(null);
      onAdd?.();
    }, 1500);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 
                   text-sm font-medium transition-colors flex items-center justify-center gap-2
                   border border-dashed border-white/20 hover:border-purple-500/50
                   text-gray-400 hover:text-white"
      >
        <Plus className="w-4 h-4" />
        Add New Task
      </button>
    );
  }

  return (
    <div className="glass-card p-4 animate-fade-in">
      <h4 className="font-medium text-white mb-4">Add New Task</h4>
      
      <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Title <span className="text-red-400">*</span></label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg
                       text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
            autoFocus
          />
        </div>
        
        <div>
          <label className="block text-xs text-gray-500 mb-1">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Additional details..."
            rows={2}
            className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg
                       text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50
                       resize-none"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Section</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg
                         text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Blocked">Blocked</option>
              <option value="Done">Done</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-gray-500 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
              className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg
                         text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        
        {copiedText && (
          <div className="text-sm py-2 px-3 rounded-lg text-green-400 bg-green-400/10">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4" />
              <span>Task text copied to clipboard!</span>
            </div>
            <pre className="text-xs text-gray-400 bg-black/20 p-2 rounded overflow-x-auto">
              {copiedText}
            </pre>
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setTitle('');
              setDescription('');
              setCopiedText(null);
            }}
            className="flex-1 py-2.5 px-4 text-sm text-gray-400 hover:text-white 
                       bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={!title.trim() || copiedText !== null}
            className="flex-1 py-2.5 px-4 text-sm bg-purple-600 hover:bg-purple-500 
                       text-white rounded-xl transition-colors flex items-center justify-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <>
              <Plus className="w-4 h-4" />
              Copy Task
            </>
          </button>
        </div>
        
        <p className="text-[10px] text-gray-500 text-center">
          The task will be copied to your clipboard. Paste it into active-tasks.md to add.
        </p>
      </form>
    </div>
  );
}

export default AddTaskForm;