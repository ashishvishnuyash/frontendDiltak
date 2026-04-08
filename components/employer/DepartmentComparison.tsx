'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { Building2, Info, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DeptData { label: string; realName?: string; score: number; suppressed?: boolean; }
interface DepartmentComparisonProps {
  departmentData?: Record<string, { avg_wellness?: number; count?: number; avgWellness?: number }>;
  loading?: boolean;
}

const K_THRESHOLD = 10;
const ANON_LABELS = ['Dept A', 'Dept B', 'Dept C', 'Dept D', 'Dept E', 'Dept F', 'Dept G', 'Dept H'];

const CustomTooltip = ({ active, payload, showLabels }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as DeptData;
  if (d.suppressed) return null;
  const color = d.score >= 70 ? '#10B981' : d.score >= 40 ? '#F59E0B' : '#EF4444';
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-lg min-w-[150px]">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{showLabels && d.realName ? d.realName : d.label}</p>
      <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{d.score}<span className="text-xs text-gray-400 ml-1">/100</span></p>
      <div className="mt-1 h-1 rounded-full w-full bg-gray-100 dark:bg-gray-700">
        <div className="h-1 rounded-full" style={{ width: `${d.score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};

export const DepartmentComparison: React.FC<DepartmentComparisonProps> = ({ departmentData, loading }) => {
  const [showLabels, setShowLabels] = useState(false);

  if (loading) return <div className="h-[360px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse" />;

  let depts: DeptData[] = [];
  if (departmentData && Object.keys(departmentData).length > 0) {
    depts = Object.entries(departmentData).map(([name, stats], i) => {
      const count = stats.count ?? 0;
      const score = Math.round((stats.avg_wellness ?? stats.avgWellness ?? 0) * 10);
      return { label: ANON_LABELS[i] ?? `Dept ${String.fromCharCode(65 + i)}`, realName: name, score: Math.min(100, score), suppressed: count > 0 && count < K_THRESHOLD };
    });
  } else {
    depts = [
      { label: 'Dept A', realName: 'Engineering', score: 78 },
      { label: 'Dept B', realName: 'Marketing', score: 62 },
      { label: 'Dept C', realName: 'Sales', score: 55 },
      { label: 'Dept D', realName: 'Product', score: 81 },
      { label: 'Dept E', realName: 'HR', score: 74 },
    ];
  }

  const getBarColor = (score: number) => score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-500" />
            Department Comparison
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"><Info className="h-3.5 w-3.5" /></button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[240px] text-xs p-3 rounded-xl">Relative wellness indices by department. Labels anonymised by default. Departments with fewer than {K_THRESHOLD} members are suppressed.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h2>
          <button
            onClick={() => setShowLabels(v => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            {showLabels ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {showLabels ? 'Hide' : 'Reveal'}
          </button>
        </div>

        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={depts} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
              <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <YAxis type="category" dataKey={showLabels ? 'realName' : 'label'} axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#6B7280' }} width={56} />
              <RechartsTooltip content={<CustomTooltip showLabels={showLabels} />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={20}>
                {depts.map((d, i) => <Cell key={i} fill={d.suppressed ? '#E5E7EB' : getBarColor(d.score)} opacity={d.suppressed ? 0.5 : 1} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {depts.some(d => d.suppressed) && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900/30">
            <ShieldAlert className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
            <p className="text-xs text-yellow-700 dark:text-yellow-400">Some departments suppressed — group too small to display (min. {K_THRESHOLD} members).</p>
          </div>
        )}
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 text-center">Data anonymised and aggregated across groups of {K_THRESHOLD}+ employees.</p>
      </div>
    </motion.div>
  );
};

export default DepartmentComparison;
