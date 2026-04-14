"use client";

import { TrendingUp } from "lucide-react";

// ─── Static mock data ────────────────────────────────────────────────────────

const DIMENSIONS = [
  { name: "Cardiovascular", score: 80, color: "bg-red-500" },
  { name: "Nutrition", score: 65, color: "bg-green-500" },
  { name: "Sleep quality", score: 68, color: "bg-indigo-500" },
  { name: "Physical activity", score: 70, color: "bg-blue-500" },
  { name: "Medication adherence", score: 83, color: "bg-amber-500" },
  { name: "Weight & BMI", score: 72, color: "bg-purple-500" },
];

const ACTIONS = [
  {
    icon: "🛏️",
    title: "Consistent bedtime (+4 pts)",
    description:
      "Setting a fixed bedtime within a 30-minute window every night — including weekends — is the single highest-impact change you can make right now.",
  },
  {
    icon: "🥬",
    title: "Add one more vegetable daily (+4 pts)",
    description:
      "Your fibre and micronutrient intake is just below target. A single serving of leafy greens at dinner closes most of the gap within a week.",
  },
  {
    icon: "💧",
    title: "Reach 2.5L of water daily (+3 pts)",
    description:
      "You are consistently under your hydration target. Keep a 1L bottle visible at your desk and aim to finish it by 1 PM, then refill.",
  },
  {
    icon: "🐟",
    title: "Improve Omega-3 adherence (+3 pts)",
    description:
      "Link your evening Omega-3 to an existing habit — dinner, teeth brushing, or your evening screen-off time — to lift adherence from 71% to 90%+.",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function HealthScoreTab() {
  const overallScore = 72;

  return (
    <div className="space-y-5">
      {/* Overall Score */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
        <div className="relative inline-flex items-center justify-center mb-5">
          <svg className="w-60 h-60" viewBox="0 0 200 200">
            {/* Background track */}
            <circle
              cx="100"
              cy="100"
              r="85"
              strokeWidth="14"
              fill="none"
              className="stroke-gray-100 dark:stroke-gray-700"
            />
            {/* Score arc */}
            <circle
              cx="100"
              cy="100"
              r="85"
         
              strokeWidth="14"
              fill="none"
              stroke="#22c55e"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 85}`}
              strokeDashoffset={`${2 * Math.PI * 85 * (1 - overallScore / 100)}`}
              transform="rotate(-90 100 100)"
              style={{ transition: "stroke-dashoffset 1s ease " }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
              {overallScore}
            </span>
            <span className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              / 100
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-base font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 px-3 py-1 rounded-full">
            Good
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
          Your overall physical wellness score is composed of 6 dimensions. You
          are performing well on vitals and exercise, with room to improve on
          sleep consistency and nutrition variety.
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            Up 4 points this month
          </span>
        </div>
      </div>

      {/* Dimension Breakdown */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Dimension Breakdown
        </h3>
        <div className="space-y-3">
          {DIMENSIONS.map((d) => (
            <div key={d.name} className="grid grid-cols-[140px_1fr_32px] items-center gap-3">
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {d.name}
              </span>
              <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${d.color} transition-all duration-500`}
                  style={{ width: `${d.score}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-right">
                {d.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Actions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Your Top 3 Actions to Improve Score
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ACTIONS.map((a) => (
            <div
              key={a.title}
              className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{a.icon}</span>
                <div>
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1">
                    {a.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {a.description}
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
