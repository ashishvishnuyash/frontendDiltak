"use client";

import { Smartphone, Thermometer, Coffee, Sun } from "lucide-react";

// ─── Static mock data ────────────────────────────────────────────────────────

const SLEEP_STATS = [
  {
    label: "Last night",
    value: "6.8",
    unit: "hrs",
    status: "Near target",
    statusColor: "text-yellow-600 dark:text-yellow-400",
  },
  {
    label: "Deep sleep",
    value: "1.4",
    unit: "hrs",
    status: "Good",
    statusColor: "text-green-600 dark:text-green-400",
  },
  {
    label: "Sleep score",
    value: "74",
    unit: "/100",
    status: "Fair",
    statusColor: "text-yellow-600 dark:text-yellow-400",
  },
  {
    label: "7-day average",
    value: "6.4",
    unit: "hrs",
    status: "Slightly low",
    statusColor: "text-yellow-600 dark:text-yellow-400",
  },
];

const WEEK_PATTERN = [
  { day: "Mo", hours: 6.2, color: "bg-yellow-500" },
  { day: "Tu", hours: 5.8, color: "bg-red-500" },
  { day: "We", hours: 6.4, color: "bg-yellow-500" },
  { day: "Th", hours: 6.5, color: "bg-yellow-500" },
  { day: "Fr", hours: 5.7, color: "bg-red-500" },
  { day: "Sa", hours: 7.8, color: "bg-green-500" },
  { day: "Su", hours: 6.9, color: "bg-green-500" },
];

const STAGE_BREAKDOWN = [
  { stage: "Awake", hours: "0.3 hrs", percent: 4, color: "bg-red-400" },
  { stage: "Light sleep", hours: "3.1 hrs", percent: 46, color: "bg-blue-400" },
  { stage: "Deep sleep", hours: "1.4 hrs", percent: 21, color: "bg-indigo-500" },
  { stage: "REM sleep", hours: "2.0 hrs", percent: 29, color: "bg-purple-500" },
];

const IMPROVEMENT_TIPS = [
  {
    icon: Smartphone,
    title: "Digital sunset protocol",
    description:
      "Stop all screens 60 minutes before bed. Blue light suppresses melatonin production by up to 50%, delaying your natural sleep onset by 1-2 hours.",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/20",
  },
  {
    icon: Thermometer,
    title: "Room temperature",
    description:
      "The ideal sleep temperature is 18-20°C (65-68°F). A cooler room signals the brain to lower core body temperature, triggering deeper sleep faster.",
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-950/20",
  },
  {
    icon: Coffee,
    title: "Caffeine cutoff",
    description:
      "Caffeine has a 6-hour half-life. Your 4 PM coffee is still 25% active at 10 PM. Move your last caffeine intake before 2 PM for noticeably better sleep quality.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/20",
  },
  {
    icon: Sun,
    title: "Morning light exposure",
    description:
      "10 minutes of natural light within 30 minutes of waking sets your circadian clock and improves sleep quality that same night by strengthening your melatonin cycle.",
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function SleepTab() {
  const maxHours = 9;

  return (
    <div className="space-y-5">
      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SLEEP_STATS.map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {s.label}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {s.value}
              </span>
              <span className="text-sm text-gray-400 dark:text-gray-500">
                {s.unit}
              </span>
            </div>
            <span className={`text-xs ${s.statusColor}`}>{s.status}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly pattern */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Sleep Pattern This Week
          </h3>
          <div className="flex items-end justify-between gap-2 h-32">
            {WEEK_PATTERN.map((d) => (
              <div
                key={d.day}
                className="flex flex-col items-center flex-1 gap-1"
              >
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  {d.hours}h
                </span>
                <div className="w-full flex flex-col justify-end h-24">
                  <div
                    className={`w-full rounded-t-md ${d.color}`}
                    style={{ height: `${(d.hours / maxHours) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  {d.day}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" /> 7+ hrs
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500" /> 6-7 hrs
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" /> under 6
            </div>
          </div>
        </div>

        {/* Stage breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Sleep Stage Breakdown
          </h3>
          <div className="space-y-3">
            {STAGE_BREAKDOWN.map((s) => (
              <div key={s.stage} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-400 w-20">
                  {s.stage}
                </span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.color}`}
                    style={{ width: `${s.percent}%` }}
                  />
                </div>
                <span className="text-xs text-gray-700 dark:text-gray-300 w-14 text-right">
                  {s.hours}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200 dark:border-indigo-800/30">
            <p className="text-xs text-indigo-700 dark:text-indigo-300">
              Deep sleep is the restoration phase. Adults need 1.5-2 hrs. Avoid
              screens and large meals within 90 minutes of bed to increase your
              deep sleep share.
            </p>
          </div>
        </div>
      </div>

      {/* Consistency note */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl border border-yellow-200 dark:border-yellow-800/30">
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            Your sleep is inconsistent — strong weekends but weaker weekdays. Aim
            to align bedtime within a 30-minute window every night, including
            weekends.
          </p>
        </div>
      </div>

      {/* Improvement tips */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Sleep Improvement Programme
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {IMPROVEMENT_TIPS.map((tip) => (
            <div
              key={tip.title}
              className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl ${tip.bg} flex items-center justify-center flex-shrink-0`}
                >
                  <tip.icon className={`h-5 w-5 ${tip.color}`} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1">
                    {tip.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
