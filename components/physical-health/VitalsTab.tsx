"use client";

import {
  Heart,
  Droplets,
  Activity,
  Scale,
  TrendingDown,
  Footprints,
  Wind,
} from "lucide-react";

// ─── Static mock data ────────────────────────────────────────────────────────

const VITALS = [
  {
    label: "Blood pressure",
    value: "118",
    unit: "/76",
    status: "Optimal",
    statusColor: "text-green-600 dark:text-green-400",
    icon: Heart,
    iconBg: "bg-red-500",
  },
  {
    label: "Blood sugar",
    value: "104",
    unit: " mg/dL",
    status: "Borderline",
    statusColor: "text-yellow-600 dark:text-yellow-400",
    icon: Droplets,
    iconBg: "bg-blue-500",
  },
  {
    label: "Heart rate",
    value: "72",
    unit: " bpm",
    status: "Normal",
    statusColor: "text-green-600 dark:text-green-400",
    icon: Activity,
    iconBg: "bg-purple-500",
  },
  {
    label: "Weight",
    value: "74",
    unit: " kg",
    status: "BMI 23.1",
    statusColor: "text-green-600 dark:text-green-400",
    icon: Scale,
    iconBg: "bg-amber-500",
  },
];

const BP_GUIDE = [
  { range: "Optimal", systolic: "below 120/80", color: "bg-green-500" },
  { range: "Normal", systolic: "120-129", color: "bg-blue-500" },
  { range: "Elevated", systolic: "130-139", color: "bg-yellow-500" },
  { range: "Stage 1 High", systolic: "140-159", color: "bg-red-500" },
];

const SUGAR_CONTEXT = [
  { range: "Normal", value: "70-99", color: "bg-green-500" },
  { range: "Pre-diabetic", value: "100-125", color: "bg-yellow-500" },
  { range: "Diabetic", value: "126+", color: "bg-red-500" },
];

const HEALTH_TIPS = [
  {
    icon: TrendingDown,
    title: "Reduce sodium intake",
    description:
      "Aim for under 2,300 mg/day. Swap table salt for herbs and lemon to season food naturally.",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/20",
  },
  {
    icon: Footprints,
    title: "Post-meal walks",
    description:
      "A 10-15 minute walk after eating lowers post-meal blood sugar by up to 25% in most people.",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/20",
  },
  {
    icon: Droplets,
    title: "Hydration & water intake",
    description:
      "Drinking 500 ml of water can lower systolic BP by up to 8 mmHg within 30 minutes.",
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-950/20",
  },
  {
    icon: Wind,
    title: "Deep breathing reduces HR",
    description:
      "5 minutes of slow, deep breathing (4-7-8 pattern) can reduce resting heart rate by 5-10 bpm.",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/20",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function VitalsTab() {
  return (
    <div className="space-y-5">
      {/* Vital cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {VITALS.map((v) => (
          <div
            key={v.label}
            className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {v.label}
              </span>
              <div
                className={`w-8 h-8 rounded-xl ${v.iconBg} flex items-center justify-center`}
              >
                <v.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {v.value}
              </span>
              <span className="text-sm text-gray-400 dark:text-gray-500">
                {v.unit}
              </span>
            </div>
            <span className={`text-xs mt-1 ${v.statusColor}`}>{v.status}</span>
          </div>
        ))}
      </div>

      {/* Guides */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Blood Pressure Guide */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Blood Pressure Guide
          </h3>
          <div className="space-y-2.5">
            {BP_GUIDE.map((g) => (
              <div key={g.range} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${g.color}`} />
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    {g.range}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {g.systolic}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Blood Sugar Context */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
            Blood Sugar Context
          </h3>
          <div className="space-y-2.5">
            {SUGAR_CONTEXT.map((s) => (
              <div key={s.range} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    {s.range}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl border border-yellow-200 dark:border-yellow-800/30">
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              Your sugar is at the upper pre-diabetic boundary. Reduce sugary
              drinks, add a 10-minute walk after lunch, and re-test in 7 days.
            </p>
          </div>
        </div>
      </div>

      {/* Reading interpretation */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800/30">
          <p className="text-xs text-green-700 dark:text-green-300">
            Your reading of 118/76 is in the optimal range. Continue monitoring
            weekly and avoid high-sodium meals before readings.
          </p>
        </div>
      </div>

      {/* Health Tips */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Vitals Health Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {HEALTH_TIPS.map((tip) => (
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
