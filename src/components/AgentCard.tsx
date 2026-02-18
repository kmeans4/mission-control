'use client';

import React, { useState } from 'react';
import { Bot, Cpu, Sparkles, Info } from 'lucide-react';
import type { Agent } from '@/lib/types';

interface AgentCardProps {
  agent: Agent;
  onSpawn?: (agentId: string) => void;
}

const agentIcons: Record<string, typeof Bot> = {
  sam: Sparkles,
  quinn: Cpu,
  dex: Bot,
  mantis: Bot,
  echo: Bot,
  hawthorne: Bot,
};

const agentColors: Record<string, string> = {
  sam: 'agent-sam',
  quinn: 'agent-quinn',
  dex: 'agent-dex',
  mantis: 'agent-mantis',
  echo: 'agent-echo',
  hawthorne: 'agent-hawthorne',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  busy: 'Busy',
  idle: 'Idle',
};

export function AgentCard({ agent, onSpawn }: AgentCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const Icon = agentIcons[agent.id] || Bot;
  const colorClass = agentColors[agent.id] || 'text-gray-400';
  const isSubagent = agent.id !== 'sam';

  return (
    <div className="glass-card p-4 hover:border-purple-500/30 transition-all duration-300 group">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-opacity-20 ${colorClass} bg-current`}>
          <Icon className="w-6 h-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white truncate">{agent.name}</h3>
            <div className={`status-dot ${agent.status || 'idle'}`} />
          </div>
          
          <p className={`text-sm ${colorClass} font-medium`}>{agent.role}</p>
          
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">{agent.model}</span>
            <span className="text-xs text-gray-600">•</span>
            <span className={`text-xs ${
              agent.status === 'active' ? 'text-green-400' :
              agent.status === 'busy' ? 'text-amber-400' :
              'text-gray-400'
            }`}>
              {statusLabels[agent.status] || 'Idle'}
            </span>
          </div>
        </div>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          title="View details"
        >
          <Info className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      
      <div className={`mt-4 transition-all duration-300 ${showDetails ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
        <p className="text-sm text-gray-400 leading-relaxed">{agent.responsibility}</p>
        
        {agent.soul?.specialties && agent.soul.specialties.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">Specialties:</p>
            <div className="flex flex-wrap gap-1">
              {agent.soul.specialties.map((specialty) => (
                <span 
                  key={specialty} 
                  className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-300"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {isSubagent && onSpawn && (
        <button
          onClick={() => onSpawn(agent.id)}
          className="w-full mt-3 py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 
                     text-sm font-medium transition-colors flex items-center justify-center gap-2
                     group-hover:border-purple-500/30 border border-transparent"
        >
          <Bot className="w-4 h-4" />
          Spawn Agent
        </button>
      )}
    </div>
  );
}

export default AgentCard;