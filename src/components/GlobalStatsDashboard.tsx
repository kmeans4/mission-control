'use client';

import { CheckCircle, Users, Activity, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  color: string;
  bgColor: string;
  trend?: { value: number; isPositive: boolean };
}

function StatCard({ icon: Icon, title, value, color, bgColor, trend }: StatCardProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${bgColor}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        {trend && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              trend.isPositive 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </motion.span>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-gray-400">{title}</p>
    </motion.div>
  );
}

interface SparklineProps {
  data: number[];
  color: string;
}

function Sparkline({ data, color }: SparklineProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 40;
  const width = 120;
  const pointSpacing = width / (data.length - 1);

  const points = data.map((value, index) => {
    const x = index * pointSpacing;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const fillPath = `0,${height} ${points} ${width},${height}`;

  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      width={width}
      height={height}
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        d={`M ${fillPath} Z`}
        fill={`url(#gradient-${color})`}
      />
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        d={`M ${points}`}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((value, index) => {
        const x = index * pointSpacing;
        const y = height - ((value - min) / range) * height;
        return (
          <motion.circle
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            cx={x}
            cy={y}
            r="3"
            fill={color}
          />
        );
      })}
    </motion.svg>
  );
}

interface GlobalStatsDashboardProps {
  totalTasks?: number;
  activeAgents?: number;
  weeklyActivity?: number[];
  topAgent?: { name: string; score: number };
}

export default function GlobalStatsDashboard({
  totalTasks = 1247,
  activeAgents = 23,
  weeklyActivity = [45, 52, 38, 65, 72, 58, 81],
  topAgent = { name: 'Quinn', score: 9850 },
}: GlobalStatsDashboardProps) {
  return (
    <div className="w-full">
      {/* Title */}
      <motion.h2
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-xl font-bold text-white mb-4"
      >
        Mission Control Overview
      </motion.h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CheckCircle}
          title="Total Tasks"
          value={totalTasks.toLocaleString()}
          color="text-green-500"
          bgColor="bg-green-500/20"
          trend={{ value: 12, isPositive: true }}
        />

        <StatCard
          icon={Users}
          title="Active Agents"
          value={activeAgents}
          color="text-blue-500"
          bgColor="bg-blue-500/20"
          trend={{ value: 5, isPositive: true }}
        />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-lg bg-purple-500/20">
              <Activity className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-300 mb-2">Weekly Activity</p>
          <Sparkline data={weeklyActivity} color="#a855f7" />
        </motion.div>

        <StatCard
          icon={Trophy}
          title="Top Agent"
          value={topAgent.name}
          color="text-yellow-500"
          bgColor="bg-yellow-500/20"
          trend={undefined}
        />
      </div>

      {/* Top Agent Score */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="mt-4 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-300">Leading with</span>
            <span className="font-bold text-yellow-400">{topAgent.score.toLocaleString()} XP</span>
          </div>
          <span className="text-xs text-gray-500">This week</span>
        </div>
      </motion.div>
    </div>
  );
}
