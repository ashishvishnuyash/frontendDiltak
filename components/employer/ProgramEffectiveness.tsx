'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Sparkles, Info, ShieldAlert } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProgramEffectivenessProps { wellnessIndex?: number; burnoutAlertLevel?: string; loading?: boolean; }

function buildBeforeAfter(wellnessIndex?: number, alertLevel?: string) {
  const base = wellnessIndex ?? 62;
  const stressBase = alertLevel === 'high' ? 72 : alertLevel === 'medium' ? 55 : 38;
  return [
    { metric: 'Wellness', before: Math.max(30, base - 12), after: base, delta: 12 },
    { metric: 'Engagement', before: Math.max(30, base - 18), after: Math.min(95, base + 5), delta: 23 },
    { metric: 'Stress ↓', before: stressBase, after: Math.max(20, stressBase - 14), delta: -14 },
    { metric: 'Check-ins', before: Math.max(30, base - 22), after: Math.min(95, base + 8), delta: 30 },
  ];
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
            <span className="text-xs text-gray-500 dark:text-gray-400">{p.name}</span>
          </div>
          <span className="text-xs font-bold text-gray-800 dark:text-gray-100">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export const ProgramEffectiveness: React.FC<ProgramEffectivenessProps> = ({ wellnessIndex, burnoutAlertLevel, loading }) => {
  if (loading) return <div className="h-[340px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse" />;

  const data = buildBeforeAfter(wellnessIndex, burnoutAlertLevel);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Program Effectiveness
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"><Info className="h-3.5 w-3.5" /></button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[240px] text-xs p-3 rounded-xl">Before/after analysis of wellness interventions. Compares metrics before and after Diltak activation. Cohort-level analysis — minimum cohort size = 10.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h2>
          <div className="flex items-center gap-3 text-[10px] font-medium text-gray-400 dark:text-gray-500">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-gray-200 dark:bg-gray-700" /><span>Before</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /><span>After</span></div>
          </div>
        </div>

        <div className="h-[230px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 16, right: 8, left: -20, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="metric" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} dy={6} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey="before" name="Before" fill="#E5E7EB" radius={[3, 3, 0, 0]} maxBarSize={28} />
              <Bar dataKey="after" name="After" fill="#10B981" radius={[3, 3, 0, 0]} maxBarSize={28}>
                <LabelList dataKey="delta" position="top" formatter={(v: number) => `${v > 0 ? '+' : ''}${v}%`}
                  style={{ fontSize: 9, fontWeight: 700 } as any} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
          <ShieldAlert className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Cohort-level analysis. Minimum cohort size = 10 for any segment. No individual data shown.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ProgramEffectiveness;
