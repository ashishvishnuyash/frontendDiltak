'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertTriangle, Info, Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EmployerBurnoutTrend } from '@/types';

interface BurnoutTrendChartProps { data?: EmployerBurnoutTrend; loading?: boolean; }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-lg min-w-[150px]">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
            <span className="text-xs text-gray-500 dark:text-gray-400">{p.name}</span>
          </div>
          <span className="text-xs font-bold text-gray-800 dark:text-gray-100">{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

const BurnoutTrendChart: React.FC<BurnoutTrendChartProps> = ({ data, loading }) => {
  if (loading) {
    return <div className="h-[380px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse" />;
  }

  if (!data || data.weekly_distribution.length === 0) {
    return (
      <div className="h-[380px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center p-8 text-center">
        <Shield className="h-10 w-10 text-gray-200 dark:text-gray-700 mb-3" />
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Privacy Gradient Active</h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs mt-1">
          Weekly burnout distributions require a larger cohort to maintain k-anonymity guardrails.
        </p>
      </div>
    );
  }

  const alertBadge: Record<string, string> = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };

  const getTrendIcon = (t: string) => {
    if (t === 'improving') return <TrendingUp className="h-3 w-3 text-emerald-500" />;
    if (t === 'declining') return <TrendingDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-400" />;
  };

  const bucketColors = ['#10B981', '#F59E0B', '#EF4444'];
  const bucketBgs = [
    'bg-green-50 dark:bg-green-950/20',
    'bg-yellow-50 dark:bg-yellow-950/20',
    'bg-red-50 dark:bg-red-950/20',
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            Burnout Risk Trend
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors">
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[240px] text-xs p-3 rounded-xl">
                  Low/Medium/High risk distribution over time. Bucketed cohorts, no drill-down to individuals.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h2>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${alertBadge[data.alert_level] ?? alertBadge.low}`}>
            <AlertTriangle className="h-3 w-3" />
            {data.alert_level} alert
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {data.buckets.map((bucket, i) => (
            <div key={i} className={`p-3 rounded-xl ${bucketBgs[i]} border border-gray-100 dark:border-gray-700`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{bucket.label}</p>
                {getTrendIcon(bucket.trend)}
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-bold text-gray-800 dark:text-gray-100">{bucket.percentage}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">%</span>
              </div>
              <div className="mt-1.5 h-1 rounded-full bg-gray-200 dark:bg-gray-700">
                <div className="h-1 rounded-full" style={{ width: `${bucket.percentage}%`, backgroundColor: bucketColors[i] }} />
              </div>
            </div>
          ))}
        </div>

        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.weekly_distribution} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF' }} dy={6} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#9CA3AF' }} />
              <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '10px', paddingTop: '8px', color: '#9CA3AF' }} />
              <Bar dataKey="low" name="Low" stackId="a" fill="#10B981" />
              <Bar dataKey="medium" name="Medium" stackId="a" fill="#F59E0B" />
              <Bar dataKey="high" name="High" stackId="a" fill="#EF4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export { BurnoutTrendChart };
export default BurnoutTrendChart;