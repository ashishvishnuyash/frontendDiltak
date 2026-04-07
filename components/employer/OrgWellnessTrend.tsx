'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';
import { TrendingUp, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OrgWellnessTrendProps {
  data?: { engagement_trend: number[]; period_label: string[]; correlation_note: string; data_quality: string; computed_at: string; };
  wellnessIndex?: number;
  loading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value ?? 0;
  const zone = val >= 70 ? 'Healthy' : val >= 40 ? 'Moderate' : 'At Risk';
  const zoneColor = val >= 70 ? '#10B981' : val >= 40 ? '#F59E0B' : '#EF4444';
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-lg min-w-[130px]">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{val}<span className="text-xs text-gray-400 ml-1">/100</span></p>
      <p className="text-[10px] font-semibold mt-1" style={{ color: zoneColor }}>{zone} Zone</p>
    </div>
  );
};

export const OrgWellnessTrend: React.FC<OrgWellnessTrendProps> = ({ data, wellnessIndex, loading }) => {
  const [range, setRange] = useState<'4w' | '8w' | '12w'>('12w');

  if (loading) return <div className="h-[360px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse" />;

  let chartData: { week: string; score: number }[] = [];
  if (data?.engagement_trend?.length) {
    chartData = data.engagement_trend.map((val, i) => ({ week: data.period_label[i] || `W${i + 1}`, score: Math.round(val) }));
  } else {
    const base = wellnessIndex ?? 65;
    chartData = Array.from({ length: 12 }, (_, i) => ({ week: `W${i + 1}`, score: Math.max(10, Math.min(100, Math.round(base + (Math.random() - 0.5) * 14))) }));
  }

  const sliceMap = { '4w': -4, '8w': -8, '12w': -12 };
  const displayed = chartData.slice(sliceMap[range]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            Org Wellness Trend
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"><Info className="h-3.5 w-3.5" /></button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[240px] text-xs p-3 rounded-xl">Company-wide wellness index over time. Bands: 70–100 healthy, 40–69 moderate, 0–39 at risk. All data aggregated across org.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h2>
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-1">
            {(['4w', '8w', '12w'] as const).map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all ${range === r ? 'bg-emerald-500 text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-3">
          {[{ label: 'Healthy (70–100)', color: '#10B981' }, { label: 'Moderate (40–69)', color: '#F59E0B' }, { label: 'At Risk (0–39)', color: '#EF4444' }].map(z => (
            <div key={z.label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm opacity-50" style={{ backgroundColor: z.color }} />
              <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">{z.label}</span>
            </div>
          ))}
        </div>

        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayed} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <ReferenceArea y1={70} y2={100} fill="#10B981" fillOpacity={0.06} />
              <ReferenceArea y1={40} y2={70} fill="#F59E0B" fillOpacity={0.05} />
              <ReferenceArea y1={0} y2={40} fill="#EF4444" fillOpacity={0.06} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} dy={6} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#10B981', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <ReferenceLine y={70} stroke="#10B981" strokeDasharray="4 4" strokeWidth={1} />
              <ReferenceLine y={40} stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={1} />
              <Line type="monotone" dataKey="score" stroke="#10B981" strokeWidth={2.5} dot={{ fill: '#10B981', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default OrgWellnessTrend;
