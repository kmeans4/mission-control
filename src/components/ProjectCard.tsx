'use client';

import React, { useState } from 'react';
import { Folder, ExternalLink, ChevronDown, CheckSquare, Square, Layers } from 'lucide-react';
import type { Project } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
}

const statusColors: Record<string, string> = {
  'in-progress': 'text-amber-400 bg-amber-400/10 border-amber-500/30',
  'active': 'text-green-400 bg-green-400/10 border-green-500/30',
  'completed': 'text-blue-400 bg-blue-400/10 border-blue-500/30',
  'archived': 'text-gray-400 bg-gray-400/10 border-gray-500/30',
  'unknown': 'text-gray-400 bg-white/5 border-gray-500/30',
};

export function ProjectCard({ project }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const statusClass = statusColors[project.status?.toLowerCase()] || statusColors.unknown;

  return (
    <div className="glass-card overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <Folder className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="min-w-0">
              <h3 className="font-semibold text-white truncate">{project.name}</h3>
              
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${statusClass}`}>
                  {project.status}
                </span>
                
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              expanded ? 'rotate-180' : ''
            }`} />
          </button>
        </div>
        
        {project.description && (
          <p className="text-sm text-gray-400 mt-3 line-clamp-2">{project.description}</p>
        )}
      </div>
      
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3 animate-fade-in">
          {project.techStack && project.techStack.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Tech Stack</p>
              <div className="flex flex-wrap gap-1">
                {project.techStack.map((tech) => (
                  <span 
                    key={tech}
                    className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {project.features && project.features.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Features</p>
              <ul className="space-y-1">
                {project.features.map((feature) => (
                  <li key={feature} className="text-sm text-gray-400 flex items-start gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {project.pending && project.pending.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Pending</p>
              <ul className="space-y-1">
                {project.pending.map((item) => (
                  <li key={item} className="text-sm text-gray-400 flex items-start gap-2">
                    <Square className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {project.details && Object.keys(project.details).length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(project.details).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="text-xs">
                    <span className="text-gray-500">{key}:</span>{' '}
                    <span className="text-gray-300">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProjectCard;