'use client';

import React, { useState } from 'react';
import { Bot, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface SpawnAgentButtonProps {
  agent: string;
  onSpawn?: () => void;
  standalone?: boolean;
}

export function SpawnAgentButton({ agent, onSpawn, standalone }: SpawnAgentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [task, setTask] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string }>({});
  const [copiedCommand, setCopiedCommand] = useState(false);

  const agentLabels: Record<string, string> = {
    quinn: 'Code Architect',
    dex: 'Implementer',
    mantis: 'Research & QA',
    echo: 'Reporter',
    hawthorne: 'Context Pruner',
  };

  const handleGenerateCommand = () => {
    if (!task.trim()) return;
    
    const command = `openclaw agent run ${agent} "${task.replace(/"/g, '\\"')}"`;
    navigator.clipboard.writeText(command);
    setCopiedCommand(true);
    
    setTimeout(() => {
      setCopiedCommand(false);
      setIsOpen(false);
      setTask('');
      onSpawn?.();
    }, 1500);
  };

  if (!isOpen) {
    if (standalone) {
      return (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 
                     text-sm font-medium transition-colors flex items-center justify-center gap-2
                     border border-transparent hover:border-purple-500/30"
        >
          <Bot className="w-4 h-4" />
          Spawn {agent.charAt(0).toUpperCase() + agent.slice(1)}
        </button>
      );
    }
    return null;
  }

  return (
    <div className="animate-fade-in">
      <div className="space-y-3">
        <p className="text-xs text-gray-400">
          Spawning: <span className="text-purple-400">{agentLabels[agent] || agent}</span>
        </p>
        
        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Describe the task..."
          rows={3}
          className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg
                     text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50
                     resize-none"
        />
        
        {copiedCommand && (
          <div className="flex items-center gap-2 text-xs text-green-400">
            <CheckCircle className="w-4 h-4" />
            Command copied to clipboard!
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setTask('');
              setCopiedCommand(false);
            }}
            className="flex-1 py-2 px-3 text-sm text-gray-400 hover:text-white 
                       bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            Cancel
          </button>
          
          <button
            onClick={handleGenerateCommand}
            disabled={!task.trim() || copiedCommand}
            className="flex-1 py-2 px-3 text-sm bg-purple-600 hover:bg-purple-500 
                       text-white rounded-lg transition-colors flex items-center justify-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copiedCommand ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Bot className="w-4 h-4" />
                Copy Command
              </>
            )}
          </button>
        </div>
        
        <p className="text-[10px] text-gray-500 text-center">
          The command will be copied to your clipboard. Paste in terminal to spawn.
        </p>
      </div>
    </div>
  );
}

export default SpawnAgentButton;