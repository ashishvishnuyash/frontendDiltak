'use client';

import { motion } from 'framer-motion';

interface AnalyticsData {
  mood_rating: number;
  stress_level: number;
  energy_level: number;
  work_satisfaction: number;
  work_life_balance: number;
  anxiety_level: number;
  confidence_level: number;
  sleep_quality: number;
  overall_wellness: number;
}

interface InteractiveAnalyticsProps {
  data: AnalyticsData;
  showComparison?: boolean;
  previousData?: AnalyticsData;
}

// ─── Circular ring matching the image design ──────────────────────────────────
function Ring({
  value,
  maxValue = 10,
  size = 80,
  strokeWidth = 6,
  color = '#10B981',
  label,
  emoji = '🙂',
}: {
  value: number;
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  emoji?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const pct = Math.min(value / maxValue, 1);
  const offset = circumference - pct * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" style={{ transform: 'rotate(-90deg)' }}>
          {/* track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke="#D1FAE5" strokeWidth={strokeWidth} fill="none"
          />
          {/* progress */}
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={color} strokeWidth={strokeWidth} fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
          />
        </svg>
        {/* center score */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-bold text-gray-800 dark:text-gray-100">{value}</span>
        </div>
      </div>
      {label && (
        <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
          <span>{emoji}</span>
          <span className="uppercase tracking-wide font-medium">{label}</span>
        </div>
      )}
    </div>
  );
}

// ─── Card wrapper matching image style ────────────────────────────────────────
function AnalyticsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function InteractiveAnalytics({ data }: InteractiveAnalyticsProps) {
  const teal = '#10B981';
  const yellow = '#F59E0B';

  const wellnessMetrics = [
    { label: 'MOOD',       value: data.mood_rating,       emoji: '🙂', color: teal },
    { label: 'ENERGY',     value: data.energy_level,      emoji: '⚡', color: teal },
    { label: 'STRESS',     value: data.stress_level,      emoji: '😓', color: teal },
    { label: 'MOOD',       value: data.mood_rating,       emoji: '🙂', color: teal },
    { label: 'ENERGY',     value: data.energy_level,      emoji: '⚡', color: teal },
    { label: 'STRESS',     value: data.stress_level,      emoji: '😓', color: teal },
  ];

  const distributionMetrics = [
    { label: 'MOOD', value: data.mood_rating, emoji: '🙂', color: teal },
  ];

  const stressMetrics = [
    { label: 'Stress',        value: data.stress_level,  emoji: '😓', color: yellow },
    { label: 'Anxiety Level', value: data.anxiety_level, emoji: '😰', color: teal  },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      {/* Overall Wellness Score */}
      <AnalyticsCard title="Overall Wellness Score">
        <div className="flex items-center justify-center py-6">
          <Ring
            value={data.overall_wellness}
            size={100}
            strokeWidth={8}
            color={teal}
            label="MOOD"
            emoji="🙂"
          />
        </div>
      </AnalyticsCard>

      {/* Wellness Metrics */}
      <AnalyticsCard title="Wellness Metrics">
        <div className="grid grid-cols-3 gap-4 py-2">
          {wellnessMetrics.map((m, i) => (
            <div key={i} className="flex justify-center">
              <Ring value={m.value} size={72} strokeWidth={6} color={m.color} label={m.label} emoji={m.emoji} />
            </div>
          ))}
        </div>
      </AnalyticsCard>

      {/* Wellness Distribution */}
      <AnalyticsCard title="Wellness Distribution">
        <div className="flex items-center justify-center py-6">
          <Ring
            value={data.mood_rating}
            size={100}
            strokeWidth={8}
            color={teal}
            label="MOOD"
            emoji="🙂"
          />
        </div>
      </AnalyticsCard>

      {/* Stress Indicators */}
      <AnalyticsCard title="Stress Indicators">
        <div className="flex items-center justify-center gap-10 py-6">
          {stressMetrics.map((m, i) => (
            <Ring key={i} value={m.value} size={100} strokeWidth={8} color={m.color} label={m.label} emoji={m.emoji} />
          ))}
        </div>
      </AnalyticsCard>
    </motion.div>
  );
}
