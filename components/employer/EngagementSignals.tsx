'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Info, CheckCircle2, Zap, BarChart3 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EmployerEngagementSignals } from '@/types';

interface EngagementSignalsProps { data?: EmployerEngagementSignals; loading?: boolean; }

interface MetricCardProps {
  title: string; value: number; unit?: string; icon: React.ElementType;
  accentColor: string; iconBg: string; explanation: string; subLabel: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit = '%', icon: Icon, accentColor, iconBg, explanation, subLabel }) => (
  <div className="flex flex-col gap-3 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-700 transition-all group">
    <div className="flex items-center justify-between">
      <div className={`p-2.5 rounded-xl ${iconBg} group-hover:scale-105 transition-transform flex-shrink-0`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"><Info className="h-3.5 w-3.5" /></button>
          </TooltipTrigger>
          <TooltipContent className="max-w-[220px] text-xs p-3 rounded-xl">{explanation}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    <div>
      <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{title}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">{value}</span>
        <span className="text-sm font-semibold text-gray-400 dark:text-gray-500">{unit}</span>
      </div>
    </div>
    <div>
      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mb-1">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: accentColor }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, value)}%` }}
          transition={{ duration: 1.2, ease: 'circOut' }}
        />
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500">{subLabel}</p>
    </div>
  </div>
);

export const EngagementSignals: React.FC<EngagementSignalsProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-[180px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse" />)}
      </div>
    );
  }
  if (!data) return null;

  const metrics = [
    { title: 'Check-in Completion', value: data.check_in_completion_pct, unit: '%', icon: CheckCircle2, accentColor: '#10B981', iconBg: 'bg-emerald-500', explanation: 'Proxy for support uptake: percentage of assigned check-ins completed in the period.', subLabel: 'Completion rate this period' },
    { title: 'Session Depth', value: Math.round(data.avg_session_depth_score * 10), unit: '%', icon: Zap, accentColor: '#8B5CF6', iconBg: 'bg-purple-500', explanation: 'Higher depth indicates users are finding value in deeper, more meaningful conversations.', subLabel: 'Avg meaningful interaction score' },
    { title: 'Daily Active (DAU)', value: data.dau_pct, unit: '%', icon: Users, accentColor: '#3B82F6', iconBg: 'bg-blue-500', explanation: 'Percentage of users active on a given day. Proxy for daily engagement with Diltak.', subLabel: 'Daily engagement rate' },
    { title: 'Weekly Active (WAU)', value: data.wau_pct, unit: '%', icon: BarChart3, accentColor: '#F59E0B', iconBg: 'bg-amber-500', explanation: 'Percentage of users active within the week. Broader engagement signal.', subLabel: 'Weekly engagement rate' },
  ];

  return (
    <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
      {metrics.map(m => <MetricCard key={m.title} {...m} />)}
    </motion.div>
  );
};

export default EngagementSignals;
