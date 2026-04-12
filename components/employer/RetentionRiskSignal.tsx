'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { UserMinus, Info, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RetentionRiskSignalProps {
  burnoutData?: { buckets?: { label: string; percentage: number; trend: string }[]; weekly_distribution?: any[]; alert_level?: string; period_weeks?: number; };
  loading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-lg min-w-[150px]">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{p.name}</span>
          </div>
          <span className="text-xs font-bold text-gray-800 dark:text-gray-100">{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

function buildRetentionData(burnoutData?: RetentionRiskSignalProps['burnoutData']) {
  if (!burnoutData?.weekly_distribution?.length) return [];
  return burnoutData.weekly_distribution.map((week: any) => {
    const high = week.high ?? week.high_pct ?? 0;
    const medium = week.medium ?? week.medium_pct ?? 0;
    const low = week.low ?? week.low_pct ?? Math.max(0, 100 - high - medium);
    return { month: week.week ?? '', low: Math.round(low), medium: Math.round(medium), high: Math.round(high) };
  });
}

export const RetentionRiskSignal: React.FC<RetentionRiskSignalProps> = ({ burnoutData, loading }) => {
  if (loading) return <div className="h-[360px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse" />;

  const chartData = buildRetentionData(burnoutData);
  const alertLevel = burnoutData?.alert_level ?? 'low';

  if (chartData.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <UserMinus className="h-5 w-5 text-purple-500" />
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Retention Risk Signal</h2>
          </div>
          <div className="flex flex-col items-center py-12 gap-2">
            <UserMinus className="h-10 w-10 text-gray-200 dark:text-gray-700" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Not enough data yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Retention risk modelling requires burnout trend data over multiple weeks.</p>
          </div>
        </div>
      </motion.div>
    );
  }
  const alertBadge: Record<string, string> = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <UserMinus className="h-5 w-5 text-purple-500" />
            Retention Risk Signal
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"><Info className="h-3.5 w-3.5" /></button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[240px] text-xs p-3 rounded-xl">Modelled attrition risk bands (Low/Medium/High) derived from burnout and engagement signals. Cohort-level predictions only — no individual risk scores.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h2>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${alertBadge[alertLevel] ?? alertBadge.low}`}>
            <AlertCircle className="h-3 w-3" />{alertLevel} risk
          </span>
        </div>

        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradLow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="gradMed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="gradHigh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} dy={6} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#10B981', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '10px', paddingTop: '8px', color: '#9CA3AF' }} />
              <Area type="monotone" dataKey="low" name="Low" stackId="1" stroke="#10B981" fill="url(#gradLow)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="medium" name="Medium" stackId="1" stroke="#F59E0B" fill="url(#gradMed)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="high" name="High" stackId="1" stroke="#EF4444" fill="url(#gradHigh)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-400 dark:text-gray-500">This is a predictive model, not a deterministic score. Use in conjunction with other data.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default RetentionRiskSignal;
