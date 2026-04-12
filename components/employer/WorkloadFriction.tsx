'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Moon, MessageSquareWarning, ZapOff, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EmployerWorkloadFriction } from '@/types';

interface WorkloadFrictionProps { data?: EmployerWorkloadFriction; loading?: boolean; }

export const WorkloadFriction: React.FC<WorkloadFrictionProps> = ({ data, loading }) => {
  if (loading) return <div className="h-[280px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse" />;
  if (!data) return null;

  const riskBadge: Record<string, string> = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    none: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };
  const overloadPct = Math.round(data.overload_pattern_score * 10);
  const overloadColor = overloadPct > 60 ? '#EF4444' : overloadPct > 35 ? '#F59E0B' : '#10B981';

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            Workload Friction
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"><Info className="h-3.5 w-3.5" /></button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[240px] text-xs p-3 rounded-xl">Signals derived from sentiment shifts + activity timing patterns (e.g. late-night spikes). Pattern-level only — no individual attribution.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h2>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${riskBadge[data.risk_level] ?? riskBadge.low}`}>
            {data.risk_level} friction
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex-shrink-0">
              <Moon className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Late Night</p>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-gray-800 dark:text-gray-100">{data.late_night_activity_pct}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">%</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex-shrink-0">
              <MessageSquareWarning className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Sentiment Shifts</p>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-gray-800 dark:text-gray-100">{data.sentiment_shift_events}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">events</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ZapOff className="h-5 w-5 text-amber-500" />
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Overload Pattern Score</p>
            </div>
            <span className="text-xl font-bold text-gray-800 dark:text-gray-100">{overloadPct}<span className="text-xs text-gray-400 dark:text-gray-500 ml-1">/100</span></span>
          </div>
          <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: overloadColor }}
              initial={{ width: 0 }}
              animate={{ width: `${overloadPct}%` }}
              transition={{ duration: 1.2, ease: 'circOut' }}
            />
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            {overloadPct > 60 ? 'Rising workload friction — consider reviewing team workload and after-hours expectations.' : 'Stable workload friction levels detected.'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default WorkloadFriction;
