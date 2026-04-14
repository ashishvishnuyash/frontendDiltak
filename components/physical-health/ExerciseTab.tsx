"use client";

import {
  Footprints,
  StretchHorizontal,
  Heart,
} from "lucide-react";

// ─── Static mock data ────────────────────────────────────────────────────────

const EXERCISE_STATS = [
  {
    label: "Steps today",
    value: "7,240",
    target: "/10K",
    status: "Almost there",
    statusColor: "text-yellow-600 dark:text-yellow-400",
    progress: 72,
    barColor: "bg-blue-500",
  },
  {
    label: "Active minutes",
    value: "28",
    target: "/30",
    status: "Almost there",
    statusColor: "text-yellow-600 dark:text-yellow-400",
    progress: 93,
    barColor: "bg-green-500",
  },
  {
    label: "Calories burned",
    value: "340",
    target: " cal",
    status: "On track",
    statusColor: "text-green-600 dark:text-green-400",
    progress: 68,
    barColor: "bg-orange-500",
  },
  {
    label: "Streak",
    value: "5",
    target: " days",
    status: "Keep going!",
    statusColor: "text-green-600 dark:text-green-400",
    progress: 100,
    barColor: "bg-purple-500",
  },
];

const WORKOUTS = [
  {
    title: "Morning desk-break stretch (5 mins)",
    badge: "Energy boost",
    badgeColor: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300",
    description:
      "Reduces stiffness from prolonged sitting, improves circulation, and increases focus within 20 minutes. Best performed at your desk or in a quiet corner.",
    steps: [
      "Neck rolls — 5 slow circles each side",
      "Shoulder shrugs — 10 reps, hold at top for 2 seconds",
      "Seated spinal twist — 30 seconds each side",
      "Hand and calf raises — 15 reps",
    ],
    icon: StretchHorizontal,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/20",
  },
  {
    title: "Lunchtime walk programme",
    badge: "Fat burn",
    badgeColor: "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-300",
    description:
      "15 minutes of brisk walking after lunch improves post-meal blood sugar by up to 22%, reduces afternoon energy dips, and contributes 1,300-2,000 steps to your daily goal.",
    steps: [
      "Walk at a pace that raises your heart rate slightly — you should be able to hold a conversation but feel slightly warm",
      "Swing your arms naturally — this increases calorie burn by 10% compared to hands-in-pockets walking",
      "Take stairs on the return — adds 1 minute of elevated heart rate and strengthens your legs",
    ],
    icon: Footprints,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/20",
  },
  {
    title: "Evening wind-down yoga (5 mins)",
    badge: "Sleep prep",
    badgeColor: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-300",
    description:
      "Gentle yoga before bed activates the parasympathetic nervous system, reducing cortisol by up to 12% and helping you fall asleep faster with better sleep quality.",
    steps: [
      "Child's pose — 2 minutes, deep nasal breathing",
      "Legs up the wall — 1 minute, improves circulation back to the heart",
      "Supine spinal twist — 90 seconds each side, releases lower back tension from sitting",
      "Savasana with 4-7-8 breathing — 4 minutes to lower heart rate",
    ],
    icon: Heart,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/20",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function ExerciseTab() {
  return (
    <div className="space-y-5">
      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {EXERCISE_STATS.map((s) => (
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
                {s.target}
              </span>
            </div>
            <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${s.barColor}`}
                style={{ width: `${s.progress}%` }}
              />
            </div>
            <span className={`text-xs mt-1 ${s.statusColor}`}>{s.status}</span>
          </div>
        ))}
      </div>

      {/* Recommended Workouts */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Recommended Workouts for You
        </h3>
        <div className="space-y-4">
          {WORKOUTS.map((w) => (
            <div
              key={w.title}
              className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm"
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-xl ${w.bg} flex items-center justify-center flex-shrink-0`}
                >
                  <w.icon className={`h-5 w-5 ${w.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {w.title}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${w.badgeColor}`}
                    >
                      {w.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {w.description}
                  </p>
                </div>
              </div>
              <div className="space-y-1.5 pl-[52px]">
                {w.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0">
                      {i + 1}.
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
