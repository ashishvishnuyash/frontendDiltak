'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ShieldCheck, Zap, Info, ArrowUpRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EmployerEarlyWarnings } from '@/types';

interface EarlyWarningsProps {
  data?: EmployerEarlyWarnings;
  loading?: boolean;
}

export const EarlyWarnings: React.FC<EarlyWarningsProps> = ({ data, loading }) => {
  if (loading) {
    return <div className="h-[280px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse" />;
  }
  if (!data) return null;

  const riskBadge: Record<string, string> = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };
  const confidenceBadge: Record<string, string> = {
    high: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 min-h-[280px]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Early Warnings
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors">
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[240px] text-xs p-3 rounded-xl">
                  AI-modeled signals across the entire cohort. No attribution to individuals. Max 5 active alerts shown.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h2>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${riskBadge[data.overall_risk?.toLowerCase()] ?? riskBadge.low}`}>
            {data.overall_risk} risk
          </span>
        </div>

        <div className="space-y-2">
          {data.alerts.length > 0 ? (
            data.alerts.slice(0, 5).map((alert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 * i }}
                className="group flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-700 transition-all cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 shrink-0">
                  {alert.signal.toLowerCase().includes('stress') ? (
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">{alert.signal}</p>
                    <span className={`shrink-0 text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${confidenceBadge[alert.confidence] ?? confidenceBadge.medium}`}>
                      {alert.confidence}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">{alert.description}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{alert.period}</p>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors shrink-0 mt-0.5" />
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center py-8 gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
              <ShieldCheck className="h-8 w-8 text-emerald-300 dark:text-emerald-700" />
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">No Active Warnings</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EarlyWarnings;
