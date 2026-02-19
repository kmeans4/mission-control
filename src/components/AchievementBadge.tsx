'use client';

import { Trophy, Glasses, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  type: 'task-master' | 'code-reviewer' | 'knowledge-explorer';
  unlocked: boolean;
}

const badgeConfig = {
  'task-master': {
    icon: Trophy,
    name: 'Task Master',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
  },
  'code-reviewer': {
    icon: Glasses,
    name: 'Code Reviewer',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  'knowledge-explorer': {
    icon: Compass,
    name: 'Knowledge Explorer',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
};

export default function AchievementBadge({ type, unlocked }: Props) {
  const config = badgeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        relative flex flex-col items-center justify-center p-4 rounded-xl border-2
        transition-all duration-300
        ${unlocked ? `${config.bgColor} ${config.borderColor}` : 'bg-gray-800/50 border-gray-700'}
        ${unlocked ? 'shadow-lg shadow-black/20' : ''}
      `}
    >
      <motion.div
        animate={unlocked ? { rotate: [0, -10, 10, -10, 0] } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`
          p-3 rounded-full mb-2
          ${unlocked ? config.bgColor : 'bg-gray-700'}
        `}
      >
        <Icon
          className={`
            w-8 h-8 transition-colors duration-300
            ${unlocked ? config.color : 'text-gray-500'}
          `}
        />
      </motion.div>

      <span
        className={`
          text-sm font-semibold text-center
          ${unlocked ? 'text-white' : 'text-gray-500'}
        `}
      >
        {config.name}
      </span>

      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 rounded-xl">
          <span className="text-xs text-gray-400 font-medium">Locked</span>
        </div>
      )}

      {unlocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"
        />
      )}
    </motion.div>
  );
}
