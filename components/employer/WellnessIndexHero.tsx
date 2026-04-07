'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Info, TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EmployerWellnessIndex } from '@/types';

interface WellnessIndexHeroProps {
  data?: EmployerWellnessIndex;
  loading?: boolean;
}

export const WellnessIndexHero: React.FC<WellnessIndexHeroProps> = ({ data, loading }) => {
  const isPrivacySuppressed = !data || (data.wellness_index === 0 && data.check_in_participation_pct === 0);

  if (loading) {
    return (
      <div className="h-[280px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse" />
    );
  }

  if (isPrivacySuppressed) {
    return (
      <div className="h-[280px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center p-8 text-center">
        <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 border border-gray-100 dark:border-gray-700">
          <Shield className="h-7 w-7 text-gray-300 dark:text-gray-600" />
        </div>
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1">Insights Protected</h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs leading-relaxed">
          Group too small to display (min. 10 members). Data suppressed to maintain k-anonymity.
        </p>
      </div>
    );
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-5 w-5 text-emerald-500" />;
    if (trend < 0) return <TrendingDown className="h-5 w-5 text-red-500" />;
    return <Minus className="h-5 w-5 text-gray-400" />;
  };

  const getIndexColor = (score: number) => {
    if (score >= 70) return '#10B981';
    if (score >= 40) return '#F59E0B';
    return '#EF4444';
  };

  const indexColor = getIndexColor(data.wellness_index);
  const circumference = 2 * Math.PI * 38;
  const dashOffset = circumference - (circumference * data.wellness_index) / 100;

  const qualityBadge: Record<string, string> = {
    high: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 min-h-[280px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-500" />
            Team Wellness Index
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors">
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[260px] text-xs p-3 rounded-xl">
                  Composite score: stress signals (30%), engagement (25%), sleep proxies (20%), check-in frequency (25%). Aggregated — no individual data exposed.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h2>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${qualityBadge[data.data_quality] ?? qualityBadge.medium}`}>
              {data.data_quality} confidence
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{data.period_days}d</span>
          </div>
        </div>

        {/* Main content */}
        <div className="bg-green-50/60 dark:bg-green-950/10 rounded-2xl p-5 flex items-center justify-around flex-wrap gap-6">
          {/* Circular gauge */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-[96px] h-[96px]">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="38" strokeWidth="6" fill="none" className="stroke-gray-100 dark:stroke-gray-700" />
                <motion.circle
                  cx="48" cy="48" r="38" strokeWidth="6" fill="none"
                  stroke={indexColor} strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: dashOffset }}
                  transition={{ duration: 1.5, ease: 'circOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{data.wellness_index}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon(data.trend_vs_prior_period)}
              <span className="text-xs font-semibold" style={{ color: data.trend_vs_prior_period >= 0 ? '#10B981' : '#EF4444' }}>
                {data.trend_vs_prior_period >= 0 ? '+' : ''}{data.trend_vs_prior_period}%
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">vs prior</span>
            </div>
          </div>

          {/* Sub-metrics */}
          {[
            { label: 'Stress Signal', value: `${data.stress_score}%`, emoji: '🌸' },
            { label: 'Engagement', value: `${data.engagement_score}%`, emoji: '⚡' },
            { label: 'Check-in Uptake', value: `${data.check_in_participation_pct}%`, emoji: '✅' },
          ].map(m => (
            <div key={m.label} className="flex flex-col items-center gap-1">
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-xl font-bold text-gray-800 dark:text-gray-100">{m.value}</span>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default WellnessIndexHero;
