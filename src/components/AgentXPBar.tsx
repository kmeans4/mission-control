'use client';

import { motion } from 'framer-motion';

interface Props {
  agentName: string;
  currentXP: number;
  level: number;
  xpToNextLevel: number;
}

export default function AgentXPBar({
  agentName,
  currentXP,
  level,
  xpToNextLevel,
}: Props) {
  const progress = Math.min((currentXP / xpToNextLevel) * 100, 100);
  const remainingXP = xpToNextLevel - currentXP;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-gray-800/50 rounded-xl p-4 border border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg"
          >
            {level}
          </motion.div>
          <div>
            <h3 className="font-semibold text-white">{agentName}</h3>
            <p className="text-xs text-gray-400">Level {level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-purple-400">{currentXP.toLocaleString()} XP</p>
          <p className="text-xs text-gray-500">{remainingXP.toLocaleString()} to next level</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 rounded-full"
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </motion.div>
      </div>

      {/* XP Markers */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>0</span>
        <span>{Math.round(xpToNextLevel / 2).toLocaleString()}</span>
        <span>{xpToNextLevel.toLocaleString()}</span>
      </div>
    </motion.div>
  );
}
