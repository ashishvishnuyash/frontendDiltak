'use client';

import React from 'react';

interface RingProps {
  value: number;
  max?: number;
  color: string;
  emoji: string;
  label: string;
  size?: number;
}

export const Ring: React.FC<RingProps> = ({
  value,
  max = 10,
  color,
  emoji,
  label,
  size = 96,
}) => {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / max) * circ;
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        className="relative" 
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <svg 
          className="w-full h-full -rotate-90" 
          viewBox="0 0 96 96"
        >
          <circle 
            cx="48" 
            cy="48" 
            r={r} 
            strokeWidth="6" 
            fill="none" 
            className="stroke-gray-100 dark:stroke-gray-800" 
          />
          <circle
            cx="48" 
            cy="48" 
            r={r} 
            strokeWidth="6" 
            fill="none"
            stroke={color} 
            strokeLinecap="round"
            strokeDasharray={circ} 
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {value}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-base">{emoji}</span>
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          {label}
        </span>
      </div>
    </div>
  );
};

export default Ring;
