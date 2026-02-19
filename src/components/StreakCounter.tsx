'use client';

import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  days: number;
  type: 'daily' | 'weekly';
}

export default function StreakCounter({ days, type }: Props) {
  const isHotStreak = days >= 7;
  const label = type === 'daily' ? 'Day Streak' : 'Week Streak';
  const displayValue = type === 'weekly' ? Math.floor(days / 7) : days;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        relative flex items-center gap-3 px-4 py-3 rounded-xl border
        ${isHotStreak 
          ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/50' 
          : 'bg-gray-800/50 border-gray-700'}
      `}
    >
      {/* Flame Icon */}
      <motion.div
        animate={isHotStreak ? { 
          scale: [1, 1.1, 1],
          rotate: [-5, 5, -5, 5, 0]
        } : {}}
        transition={{ 
          duration: isHotStreak ? 0.5 : 0, 
          repeat: isHotStreak ? Infinity : 0,
          repeatDelay: 0.5
        }}
        className={`
          p-2 rounded-lg
          ${isHotStreak ? 'bg-orange-500/20' : 'bg-gray-700'}
        `}
      >
        <motion.div
          animate={isHotStreak ? {
            filter: ['drop-shadow(0 0 2px #f97316)', 'drop-shadow(0 0 8px #f97316)', 'drop-shadow(0 0 4px #f97316)']
          } : {}}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
        >
          <Flame
            className={`
              w-6 h-6 transition-colors duration-300
              ${isHotStreak ? 'text-orange-500' : 'text-gray-500'}
            `}
          />
        </motion.div>
      </motion.div>

      {/* Stats */}
      <div>
        <motion.p
          key={displayValue}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`
            text-2xl font-bold
            ${isHotStreak ? 'text-orange-400' : 'text-white'}
          `}
        >
          {displayValue}
        </motion.p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>

      {/* Heat Effect Overlay */}
      {isHotStreak && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-orange-500/10 rounded-xl pointer-events-none"
        />
      )}

      {/* Fire Particles for Hot Streak */}
      {isHotStreak && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 0, 
                y: 0, 
                x: 0,
                scale: 0 
              }}
              animate={{ 
                opacity: [0, 0.8, 0], 
                y: -20 - i * 10, 
                x: (i - 1) * 10,
                scale: [0, 1, 0]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: i * 0.4,
                repeatDelay: 0.5
              }}
              className="absolute w-1 h-1 bg-orange-500 rounded-full"
              style={{ left: '50%', top: '20%' }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}
