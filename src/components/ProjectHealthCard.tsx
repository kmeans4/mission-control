'use client';

import React from 'react';
import { GitCommit, CheckCircle, XCircle, AlertCircle, Clock, ExternalLink } from 'lucide-react';

export type BuildStatus = 'passing' | 'failing' | 'unknown';

interface ProjectHealthCardProps {
  projectName: string;
  lastCommit?: {
    message: string;
    author: string;
    timestamp: string;
    hash: string;
  };
  buildStatus: BuildStatus;
  buildTime?: string;
  repositoryUrl?: string;
  className?: string;
}

const statusConfig: Record<BuildStatus, {
  icon: typeof CheckCircle;
  label: string;
  colorClass: string;
  bgClass: string;
  pulseClass: string;
}> = {
  passing: {
    icon: CheckCircle,
    label: 'Passing',
    colorClass: 'text-green-500',
    bgClass: 'bg-green-500/10',
    pulseClass: 'animate-pulse-green',
  },
  failing: {
    icon: XCircle,
    label: 'Failing',
    colorClass: 'text-red-500',
    bgClass: 'bg-red-500/10',
    pulseClass: 'animate-pulse-red',
  },
  unknown: {
    icon: AlertCircle,
    label: 'Unknown',
    colorClass: 'text-gray-400',
    bgClass: 'bg-gray-500/10',
    pulseClass: '',
  },
};

function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function ProjectHealthCard({
  projectName,
  lastCommit,
  buildStatus,
  buildTime,
  repositoryUrl,
  className = '',
}: ProjectHealthCardProps) {
  const status = statusConfig[buildStatus];
  const StatusIcon = status.icon;

  return (
    <div className={`glass-card p-5 hover:border-purple-500/30 transition-all duration-300 ${className}`}>
      {/* Header with project name and build status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{projectName}</h3>
          <p className="text-xs text-gray-400 mt-0.5">Build Status</p>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bgClass}`}>
          <StatusIcon className={`w-4 h-4 ${status.colorClass} ${status.pulseClass}`} />
          <span className={`text-xs font-medium ${status.colorClass}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Build time (if available) */}
      {buildTime && (
        <div className="mb-4 flex items-center gap-2 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          <span>Build time: {buildTime}</span>
        </div>
      )}

      {/* Last commit info */}
      {lastCommit ? (
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
              <GitCommit className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-300 truncate">{lastCommit.message}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <span className="font-medium text-gray-400">{lastCommit.author}</span>
                <span>•</span>
                <span>{formatTimeAgo(lastCommit.timestamp)}</span>
                {lastCommit.hash && (
                  <>
                    <span>•</span>
                    <code className="font-mono text-xs">{lastCommit.hash.slice(0, 7)}</code>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t border-white/10 pt-4 text-center text-sm text-gray-500">
          No recent commits
        </div>
      )}

      {/* Repository link */}
      {repositoryUrl && (
        <a
          href={repositoryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs text-gray-300"
        >
          <span>View Repository</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      )}

      {/* Custom CSS for pulse animations */}
      <style jsx>{`
        @keyframes pulse-green {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes pulse-red {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-green {
          animation: pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-pulse-red {
          animation: pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}

export default ProjectHealthCard;
