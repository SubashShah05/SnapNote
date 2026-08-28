import React from 'react';
import { Flame, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const StreakWidget = ({ currentStreak, longestStreak }) => {
  return (
    <div className="bg-snap-card border border-snap-border rounded-2xl p-5 flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-semibold text-white-muted mb-1 flex items-center gap-2">
          <Flame size={16} className="text-orange-500" /> Current Streak
        </h3>
        <div className="flex items-baseline gap-2">
          <motion.span 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-bold text-white"
          >
            {currentStreak}
          </motion.span>
          <span className="text-sm text-white-muted">days</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-snap-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-white-muted">
          <Trophy size={14} className="text-yellow-500" />
          <span>Longest Streak</span>
        </div>
        <span className="font-semibold text-sm text-white">{longestStreak} days</span>
      </div>
    </div>
  );
};

export default StreakWidget;
