import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  Zap,
  Target,
  Trophy,
  Flame,
  GitCommit,
  ListTodo,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

// Types
interface Insight {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  timestamp: Date;
  project?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  metric?: {
    value: string;
    trend: 'up' | 'down' | 'neutral';
  };
}

interface InsightStreak {
  current: number;
  longest: number;
  lastInsightDate: Date;
}

// Insight Card Component
const InsightCard: React.FC<{ 
  insight: Insight; 
  onDismiss: (id: string) => void;
  index: number;
}> = ({ insight, onDismiss, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  const priorityConfig = {
    critical: {
      icon: AlertTriangle,
      gradient: 'from-red-500/20 to-rose-600/10',
      border: 'border-red-500/30',
      badge: 'bg-red-500/20 text-red-300 border-red-500/30',
      glow: 'shadow-red-500/20',
      iconColor: 'text-red-400'
    },
    warning: {
      icon: AlertCircle,
      gradient: 'from-amber-500/20 to-orange-600/10',
      border: 'border-amber-500/30',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      glow: 'shadow-amber-500/20',
      iconColor: 'text-amber-400'
    },
    info: {
      icon: Info,
      gradient: 'from-blue-500/20 to-cyan-600/10',
      border: 'border-blue-500/30',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      glow: 'shadow-blue-500/20',
      iconColor: 'text-blue-400'
    },
    success: {
      icon: CheckCircle2,
      gradient: 'from-emerald-500/20 to-green-600/10',
      border: 'border-emerald-500/30',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      glow: 'shadow-emerald-500/20',
      iconColor: 'text-emerald-400'
    }
  };

  const config = priorityConfig[insight.type];
  const Icon = config.icon;

  const TrendIcon = insight.metric?.trend === 'up' ? TrendingUp : 
                   insight.metric?.trend === 'down' ? TrendingUp : null;

  return (
    <div
      className={`
        relative group rounded-xl border backdrop-blur-md
        bg-gradient-to-br ${config.gradient} ${config.border}
        transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${isHovered ? `shadow-xl ${config.glow}` : 'shadow-md'}
        hover:scale-[1.02]
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Priority Indicator Stripe */}
      <div className={`
        absolute left-0 top-0 bottom-0 w-1 rounded-l-xl
        ${insight.type === 'critical' ? 'bg-red-500' : ''}
        ${insight.type === 'warning' ? 'bg-amber-500' : ''}
        ${insight.type === 'info' ? 'bg-blue-500' : ''}
        ${insight.type === 'success' ? 'bg-emerald-500' : ''}
      `} />

      <div className="p-4 pl-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`
              p-1.5 rounded-lg ${config.badge}
              transition-transform duration-300
              ${isHovered ? 'scale-110' : ''}
            `}>
              <Icon size={16} className={config.iconColor} />
            </div>
            <span className={`
              text-xs font-semibold uppercase tracking-wider
              px-2 py-0.5 rounded-full border ${config.badge}
            `}>
              {insight.type}
            </span>
            {insight.project && (
              <span className="text-xs text-slate-400">
                {insight.project}
              </span>
            )}
          </div>
          <button
            onClick={() => onDismiss(insight.id)}
            className="
              p-1 rounded-lg text-slate-400 hover:text-slate-200
              hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100
            "
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="mb-3">
          <h4 className="text-slate-100 font-semibold mb-1 text-sm">
            {insight.title}
          </h4>
          <p className="text-slate-400 text-xs leading-relaxed">
            {insight.description}
          </p>
        </div>

        {/* Metric Badge */}
        {insight.metric && (
          <div className="flex items-center gap-2 mb-3">
            <div className={`
              inline-flex items-center gap-1.5 px-2 py-1 rounded-lg
              bg-white/5 border border-white/10 text-xs
              ${insight.metric.trend === 'up' ? 'text-emerald-400' : ''}
              ${insight.metric.trend === 'down' ? 'text-rose-400' : ''}
            `}>
              {TrendIcon && <TrendIcon size={12} className={
                insight.metric.trend === 'down' ? 'rotate-180' : ''
              } />}
              <span className="font-mono font-bold">{insight.metric.value}</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500">
            {insight.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          
          {insight.action && (
            <button
              onClick={insight.action.onClick}
              className="
                flex items-center gap-1 text-xs font-medium
                text-slate-300 hover:text-white
                px-3 py-1.5 rounded-lg
                bg-white/5 hover:bg-white/10
                border border-white/10 hover:border-white/20
                transition-all duration-200
                group/btn
              "
            >
              {insight.action.label}
              <ChevronRight size={12} className="
                transition-transform duration-200
                group-hover/btn:translate-x-0.5
              " />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Insight Hunter Streak Component
const InsightStreakBadge: React.FC<{ streak: InsightStreak }> = ({ streak }) => {
  const milestones = [7, 14, 30, 50, 100];
  const currentMilestone = milestones.find(m => streak.current < m) || milestones[milestones.length - 1];
  const progress = (streak.current / currentMilestone) * 100;

  return (
    <div className="
      relative overflow-hidden rounded-2xl border border-amber-500/30
      bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-600/10
      backdrop-blur-md p-4
    ">
      {/* Animated glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent animate-pulse" />
      
      <div className="relative flex items-center gap-4">
        <div className="
          relative p-3 rounded-xl
          bg-gradient-to-br from-amber-500/20 to-orange-600/20
          border border-amber-500/30
        ">
          <Flame size={28} className="text-amber-400" />
          {streak.current >= 7 && (
            <div className="
              absolute -top-1 -right-1 w-4 h-4
              bg-amber-500 rounded-full flex items-center justify-center
              text-[8px] font-bold text-black
            ">
              🔥
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={14} className="text-amber-400" />
            <span className="text-amber-300 text-xs font-semibold uppercase tracking-wider">
              Insight Hunter
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {streak.current}
            </span>
            <span className="text-sm text-slate-400">day streak</span>
          </div>
          
          {/* Progress bar */}
          <div className="mt-2 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1">
            {currentMilestone - streak.current} days to next milestone
          </span>
        </div>
      </div>
    </div>
  );
};

// Main Insights Panel
const InsightsPanel: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Stalled Activity',
      description: 'PhenoFarm has no commits in 3 days. Consider checking project health.',
      timestamp: new Date(),
      project: 'PhenoFarm',
      action: {
        label: 'View Project',
        onClick: () => console.log('View PhenoFarm')
      },
      metric: { value: '3 days', trend: 'neutral' }
    },
    {
      id: '2',
      type: 'info',
      title: 'Queue Status',
      description: 'Dex has 12 tasks queued for processing. ETA: 45 minutes.',
      timestamp: new Date(Date.now() - 3600000),
      project: 'Dex',
      action: {
        label: 'View Queue',
        onClick: () => console.log('View queue')
      },
      metric: { value: '12 tasks', trend: 'up' }
    },
    {
      id: '3',
      type: 'critical',
      title: 'Token Spike Alert',
      description: 'Token usage increased 80% in the last 24 hours. Review efficiency metrics.',
      timestamp: new Date(Date.now() - 7200000),
      metric: { value: '+80%', trend: 'up' },
      action: {
        label: 'Analyze Usage',
        onClick: () => console.log('Analyze tokens')
      }
    },
    {
      id: '4',
      type: 'success',
      title: 'Agent Performance',
      description: 'Mantis completed 15 research tasks with 98% accuracy rate.',
      timestamp: new Date(Date.now() - 10800000),
      project: 'Mantis',
      metric: { value: '98%', trend: 'up' }
    }
  ]);

  const [streak, setStreak] = useState<InsightStreak>({
    current: 5,
    longest: 12,
    lastInsightDate: new Date()
  });

  const [filter, setFilter] = useState<Insight['type'] | 'all'>('all');

  const dismissInsight = (id: string) => {
    setInsights(prev => prev.filter(i => i.id !== id));
  };

  const filteredInsights = filter === 'all' 
    ? insights 
    : insights.filter(i => i.type === filter);

  const filterButtons: { key: Insight['type'] | 'all'; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: insights.length },
    { key: 'critical', label: 'Critical', count: insights.filter(i => i.type === 'critical').length },
    { key: 'warning', label: 'Warning', count: insights.filter(i => i.type === 'warning').length },
    { key: 'info', label: 'Info', count: insights.filter(i => i.type === 'info').length }
  ];

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-amber-400" />
          <h2 className="text-lg font-bold text-white">Smart Insights</h2>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Target size={12} />
          <span>Live</span>
        </div>
      </div>

      {/* Streak Badge */}
      <div className="mb-4">
        <InsightStreakBadge streak={streak} />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {filterButtons.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap
              transition-all duration-200 border
              ${filter === key 
                ? 'bg-white/10 text-white border-white/20' 
                : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
              }
            `}
          >
            {label}
            <span className="ml-1.5 text-slate-500">{count}</span>
          </button>
        ))}
      </div>

      {/* Insights Grid */}
      <div className="space-y-3">
        {filteredInsights.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <CheckCircle2 size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">All caught up!</p>
          </div>
        ) : (
          filteredInsights.map((insight, index) => (
            <InsightCard 
              key={insight.id} 
              insight={insight} 
              onDismiss={dismissInsight}
              index={index}
            />
          ))
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-4 flex justify-between items-center">
        <span className="text-xs text-slate-500">
          {insights.length} active insight{insights.length !== 1 ? 's' : ''}
        </span>
        <button className="
          flex items-center gap-1 text-xs text-slate-400 hover:text-white
          transition-colors group
        ">
          View All History
          <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default InsightsPanel;
