'use client';

import React from 'react';
import { Coins, TrendingUp, AlertTriangle, Zap } from 'lucide-react';

export interface TokenUsage {
  agentId: string;
  agentName: string;
  used: number;
  limit: number;
  color: string;
}

interface TokenTrackerProps {
  usages: TokenUsage[];
  totalPool?: number;
  totalUsed?: number;
  resetDate?: string;
  className?: string;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

function formatPercentage(used: number, limit: number): number {
  if (limit === 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

function getUsageWarningLevel(percentage: number): 'low' | 'medium' | 'high' | 'critical' {
  if (percentage >= 90) return 'critical';
  if (percentage >= 75) return 'high';
  if (percentage >= 50) return 'medium';
  return 'low';
}

export function TokenTracker({
  usages,
  totalPool = 1000000,
  totalUsed,
  resetDate,
  className = '',
}: TokenTrackerProps) {
  const calculatedTotalUsed = totalUsed ?? usages.reduce((sum, u) => sum + u.used, 0);
  const remaining = totalPool - calculatedTotalUsed;
  const totalPercentage = formatPercentage(calculatedTotalUsed, totalPool);
  const warningLevel = getUsageWarningLevel(totalPercentage);

  const warningColors = {
    low: 'text-green-500',
    medium: 'text-yellow-500',
    high: 'text-orange-500',
    critical: 'text-red-500',
  };

  const barBgColors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    critical: 'bg-red-500',
  };

  const agentColors: Record<string, string> = {
    sam: 'bg-blue-500',
    quinn: 'bg-purple-500',
    dex: 'bg-green-500',
    mantis: 'bg-amber-500',
    echo: 'bg-cyan-500',
    hawthorne: 'bg-gray-500',
  };

  return (
    <div className={`glass-card p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
            <Coins className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Token Usage</h3>
            <p className="text-xs text-gray-400">Per-agent consumption</p>
          </div>
        </div>

        {/* Total Pool Display */}
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            {formatNumber(calculatedTotalUsed)}
            <span className="text-sm text-gray-400 font-normal"> / {formatNumber(totalPool)}</span>
          </div>
          <div className={`text-xs ${warningColors[warningLevel]}`}>
            {remaining >= 0 ? `${formatNumber(remaining)} remaining` : `${formatNumber(Math.abs(remaining))} over`}
          </div>
        </div>
      </div>

      {/* Total Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400">Total Pool Usage</span>
          </div>
          <span className={`text-xs font-medium ${warningColors[warningLevel]}`}>
            {totalPercentage}%
          </span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full ${barBgColors[warningLevel]} transition-all duration-500 ease-out rounded-full`}
            style={{ width: `${totalPercentage}%` }}
          />
        </div>
        {warningLevel === 'critical' && (
          <div className="flex items-center gap-1 mt-2 text-xs text-red-400">
            <AlertTriangle className="w-3 h-3" />
            <span>Critical: Consider upgrading your plan</span>
          </div>
        )}
      </div>

      {/* Per-Agent Usage Bars */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
          <Zap className="w-3 h-3" />
          <span>Agent Breakdown</span>
        </div>

        {usages.map((usage) => {
          const percentage = formatPercentage(usage.used, usage.limit);
          const agentWarningLevel = getUsageWarningLevel(percentage);
          const barColor = usage.color || agentColors[usage.agentId] || 'bg-blue-500';

          return (
            <div key={usage.agentId}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${barColor}`} />
                  <span className="text-sm text-gray-300">{usage.agentName}</span>
                </div>
                <div className="text-xs text-gray-400">
                  <span className="text-white font-medium">{formatNumber(usage.used)}</span>
                  {' / '}
                  <span>{formatNumber(usage.limit)}</span>
                  <span className={`ml-2 ${warningColors[agentWarningLevel]}`}>
                    ({percentage}%)
                  </span>
                </div>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor} transition-all duration-500 ease-out rounded-full`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Reset Date */}
      {resetDate && (
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <p className="text-xs text-gray-500">
            Usage resets on <span className="text-gray-400">{resetDate}</span>
          </p>
        </div>
      )}
    </div>
  );
}

export default TokenTracker;
