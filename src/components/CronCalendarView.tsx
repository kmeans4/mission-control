'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Play, Pause, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export type JobStatus = 'scheduled' | 'running' | 'completed' | 'failed' | 'skipped';

interface CronJob {
  id: string;
  name: string;
  schedule: string; // Cron expression or human-readable
  nextRun: string; // ISO timestamp
  lastRun?: {
    timestamp: string;
    status: JobStatus;
    duration?: string;
  };
  status: JobStatus;
  description?: string;
}

interface CronCalendarViewProps {
  jobs: CronJob[];
  onViewJob?: (job: CronJob) => void;
  onToggleJob?: (jobId: string) => void;
  className?: string;
}

const statusConfig: Record<JobStatus, {
  icon: typeof CheckCircle;
  label: string;
  colorClass: string;
  bgClass: string;
}> = {
  scheduled: {
    icon: Clock,
    label: 'Scheduled',
    colorClass: 'text-blue-400',
    bgClass: 'bg-blue-500/10',
  },
  running: {
    icon: Play,
    label: 'Running',
    colorClass: 'text-purple-400',
    bgClass: 'bg-purple-500/10',
  },
  completed: {
    icon: CheckCircle,
    label: 'Completed',
    colorClass: 'text-green-400',
    bgClass: 'bg-green-500/10',
  },
  failed: {
    icon: XCircle,
    label: 'Failed',
    colorClass: 'text-red-400',
    bgClass: 'bg-red-500/10',
  },
  skipped: {
    icon: AlertCircle,
    label: 'Skipped',
    colorClass: 'text-gray-400',
    bgClass: 'bg-gray-500/10',
  },
};

function formatNextRun(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  
  if (diffMs < 0) return 'Overdue';
  if (diffMs < 60000) return 'Any second now';
  
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `in ${diffMins}m`;
  if (diffHours < 24) return `in ${diffHours}h ${diffMins % 60}m`;
  if (diffDays < 7) return `in ${diffDays}d ${diffHours % 24}h`;
  
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function parseSchedule(schedule: string): string {
  // Convert cron expression to human-readable if needed
  const cronPatterns: Record<string, string> = {
    '0 * * * *': 'Every hour',
    '0 0 * * *': 'Daily at midnight',
    '0 9 * * *': 'Daily at 9 AM',
    '0 0 * * 0': 'Weekly on Sunday',
    '0 0 1 * *': 'Monthly on the 1st',
    '*/5 * * * *': 'Every 5 minutes',
    '*/15 * * * *': 'Every 15 minutes',
    '0 */6 * * *': 'Every 6 hours',
  };
  
  return cronPatterns[schedule] || schedule;
}

export function CronCalendarView({
  jobs,
  onViewJob,
  onToggleJob,
  className = '',
}: CronCalendarViewProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Update current time every minute for countdown accuracy
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Group jobs by next run date
  const jobsByDate = jobs.reduce((acc, job) => {
    const date = new Date(job.nextRun).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(job);
    return acc;
  }, {} as Record<string, CronJob[]>);

  const dates = Object.keys(jobsByDate).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  return (
    <div className={`glass-card p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Scheduled Jobs</h3>
            <p className="text-xs text-gray-400">{jobs.length} jobs scheduled</p>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() - 1);
              setSelectedDate(newDate);
            }}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </button>
          <span className="text-sm text-gray-300 min-w-[120px] text-center">
            {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <button
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() + 1);
              setSelectedDate(newDate);
            }}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Timeline View */}
      <div className="space-y-4">
        {dates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No scheduled jobs</p>
          </div>
        ) : (
          dates.map((date) => (
            <div key={date}>
              {/* Date Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  {date}
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Jobs for this date */}
              <div className="space-y-2">
                {jobsByDate[date].map((job) => {
                  const status = statusConfig[job.status];
                  const StatusIcon = status.icon;
                  const lastStatus = job.lastRun ? statusConfig[job.lastRun.status] : null;
                  const LastStatusIcon = lastStatus?.icon || AlertCircle;

                  return (
                    <div
                      key={job.id}
                      className="group p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                      onClick={() => onViewJob?.(job)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Status Indicator */}
                          <div className={`w-2 h-2 rounded-full mt-2 ${status.colorClass.replace('text-', 'bg-')}`} />

                          {/* Job Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium text-white">{job.name}</h4>
                              {job.status === 'running' && (
                                <span className="flex h-2 w-2">
                                  <span className={`animate-ping absolute inline-flex h-2 w-2 rounded-full ${status.bgClass} opacity-75`} />
                                  <span className={`relative inline-flex rounded-full h-2 w-2 ${status.colorClass.replace('text-', 'bg-')}`} />
                                </span>
                              )}
                            </div>

                            {job.description && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate">{job.description}</p>
                            )}

                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              {/* Schedule */}
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {parseSchedule(job.schedule)}
                              </span>

                              {/* Next Run Countdown */}
                              <span className={`flex items-center gap-1 ${
                                job.nextRun && new Date(job.nextRun).getTime() - currentTime.getTime() < 300000
                                  ? 'text-orange-400'
                                  : ''
                              }`}>
                                <Play className="w-3 h-3" />
                                {formatNextRun(job.nextRun)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions & Status */}
                        <div className="flex items-center gap-2">
                          {/* Last Run Status */}
                          {job.lastRun && (
                            <div className={`flex items-center gap-1 px-2 py-1 rounded ${lastStatus!.bgClass}`}>
                              <LastStatusIcon className={`w-3 h-3 ${lastStatus!.colorClass}`} />
                              {job.lastRun.duration && (
                                <span className="text-xs text-gray-400">{job.lastRun.duration}</span>
                              )}
                            </div>
                          )}

                          {/* Toggle Button */}
                          {onToggleJob && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleJob(job.id);
                              }}
                              className={`p-2 rounded-lg transition-colors ${
                                job.status === 'running'
                                  ? 'hover:bg-red-500/20 text-red-400'
                                  : 'hover:bg-green-500/20 text-green-400'
                              }`}
                              title={job.status === 'running' ? 'Pause job' : 'Start job'}
                            >
                              {job.status === 'running' ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex flex-wrap gap-4 justify-center">
          {Object.entries(statusConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <div key={key} className="flex items-center gap-2 text-xs text-gray-400">
                <Icon className={`w-3 h-3 ${config.colorClass}`} />
                <span>{config.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CronCalendarView;
