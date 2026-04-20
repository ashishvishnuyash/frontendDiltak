"use client";

import { useState } from "react";
import {
  Droplets,
  Flame,
  Loader2,
  TrendingDown,
  TrendingUp,
  Utensils,
} from "lucide-react";
import { usePhysicalHealth } from "@/hooks/use-physical-health";
import type { TrendDirection, TrendPeriod } from "@/types/physical-health";

const PERIODS: { value: TrendPeriod; label: string }[] = [
  { value: "7d", label: "7D" },
  { value: "14d", label: "14D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
];

const PRIORITISE = [
  {
    name: "Lentils",
    color:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-300 dark:border-orange-800/30",
  },
  {
    name: "Leafy greens",
    color:
      "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800/30",
  },
  {
    name: "Whole grains",
    color:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-800/30",
  },
  {
    name: "Nuts",
    color:
      "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-300 dark:border-yellow-800/30",
  },
];

const LIMIT = [
  {
    name: "Fried snacks",
    color:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-800/30",
  },
  {
    name: "Sugary drinks",
    color:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-800/30",
  },
  {
    name: "Refined flour",
    color:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-800/30",
  },
];

const TIPS = [
  {
    icon: "🌈",
    title: "Eat the rainbow",
    description:
      "Include 5 different coloured vegetables weekly. Each colour delivers unique phytonutrients that processed foods cannot replicate.",
  },
  {
    icon: "⏰",
    title: "Meal timing matters",
    description:
      "Eating the largest meal before 2 PM and lighter meals after improves metabolic rate and reduces blood sugar spikes by up to 18%.",
  },
  {
    icon: "🍽️",
    title: "Plate method",
    description:
      "Fill your plate with vegetables, a quarter with protein, and a quarter with complex carbs. Simple, effective, no counting required.",
  },
  {
    icon: "💧",
    title: "Drink before meals",
    description:
      "500 ml of water 30 minutes before eating reduces meal calorie intake by an average of 13% and supports digestion.",
  },
];

function scoreStatus(score: number | null | undefined): {
  label: string;
  color: string;
  barColor: string;
} {
  if (score == null)
    return {
      label: "No data",
      color: "text-gray-400",
      barColor: "bg-gray-300",
    };
  if (score >= 7)
    return {
      label: "On track",
      color: "text-green-600 dark:text-green-400",
      barColor: "bg-green-500",
    };
  if (score >= 5)
    return {
      label: "Building",
      color: "text-yellow-600 dark:text-yellow-400",
      barColor: "bg-yellow-500",
    };
  return {
    label: "Low",
    color: "text-red-600 dark:text-red-400",
    barColor: "bg-red-500",
  };
}

function trendChip(dir: TrendDirection | string | undefined) {
  if (!dir) return null;
  if (dir === "improving") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300">
        <TrendingUp className="h-3 w-3" /> improving
      </span>
    );
  }
  if (dir === "declining") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300">
        <TrendingDown className="h-3 w-3" /> declining
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
      stable
    </span>
  );
}

export default function NutritionTab() {
  const [period, setPeriod] = useState<TrendPeriod>("30d");
  const { trends, trendsLoading, refreshTrends } = usePhysicalHealth({ period });

  const onSelectPeriod = (p: TrendPeriod) => {
    setPeriod(p);
    refreshTrends(p);
  };

  const avgNutrition = trends?.averages.nutrition_quality ?? null;
  const avgHydration = trends?.averages.hydration ?? null;
  const avgEnergy = trends?.averages.energy_level ?? null;

  const nutStatus = scoreStatus(avgNutrition);
  const hydStatus = scoreStatus(avgHydration);
  const energyStatus = scoreStatus(avgEnergy);

  const stats = [
    {
      label: "Avg nutrition quality",
      value: avgNutrition != null ? avgNutrition.toFixed(1) : "—",
      target: "/10",
      progress: avgNutrition != null ? (avgNutrition / 10) * 100 : 0,
      barColor: nutStatus.barColor,
      sub: nutStatus.label,
      statusColor: nutStatus.color,
      icon: Utensils,
    },
    {
      label: "Avg hydration",
      value: avgHydration != null ? avgHydration.toFixed(1) : "—",
      target: "/10",
      progress: avgHydration != null ? (avgHydration / 10) * 100 : 0,
      barColor: hydStatus.barColor,
      sub: hydStatus.label,
      statusColor: hydStatus.color,
      icon: Droplets,
    },
    {
      label: "Avg energy",
      value: avgEnergy != null ? avgEnergy.toFixed(1) : "—",
      target: "/10",
      progress: avgEnergy != null ? (avgEnergy / 10) * 100 : 0,
      barColor: energyStatus.barColor,
      sub: energyStatus.label,
      statusColor: energyStatus.color,
      icon: Flame,
    },
    {
      label: "Check-ins logged",
      value: String(trends?.total_checkins ?? 0),
      target: "",
      progress: Math.min(100, (trends?.total_checkins ?? 0) * 3),
      barColor: "bg-blue-500",
      sub: `over ${period}`,
      statusColor: "text-gray-500 dark:text-gray-400",
      icon: Flame,
    },
  ];

  const empty = !trends || trends.total_checkins === 0;

  return (
    <div className="space-y-5">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          Nutrition & hydration trends
        </h3>
        <div className="inline-flex items-center gap-1 bg-white dark:bg-gray-900 rounded-xl p-1 border border-gray-100 dark:border-gray-800 shadow-sm">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => onSelectPeriod(p.value)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                period === p.value
                  ? "bg-blue-500 text-white"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {trendsLoading && !trends ? (
        <div className="py-10 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      ) : empty ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No check-ins yet. Head to the Daily Check-in tab and start tracking
            to see nutrition trends here.
          </p>
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
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
                <span className={`text-xs mt-1 ${s.statusColor}`}>{s.sub}</span>
              </div>
            ))}
          </div>

          {/* Trend direction chips */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Direction over {period}
            </h3>
            <div className="flex flex-wrap gap-2">
              {trends.trend_direction &&
                Object.entries(trends.trend_direction).map(([metric, dir]) => (
                  <div
                    key={metric}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-800"
                  >
                    <span className="text-xs text-gray-600 dark:text-gray-300 capitalize">
                      {metric.replace(/_/g, " ")}
                    </span>
                    {trendChip(dir as TrendDirection | string)}
                  </div>
                ))}
            </div>
          </div>
        </>
      )}

      {/* Food suggestions */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Foods to prioritise
        </h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {PRIORITISE.map((f) => (
            <span
              key={f.name}
              className={`px-2.5 py-1 rounded-full text-xs border ${f.color}`}
            >
              {f.name}
            </span>
          ))}
        </div>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Foods to limit
        </h3>
        <div className="flex flex-wrap gap-2">
          {LIMIT.map((f) => (
            <span
              key={f.name}
              className={`px-2.5 py-1 rounded-full text-xs border ${f.color}`}
            >
              {f.name}
            </span>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Personalised nutrition tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TIPS.map((tip) => (
            <div
              key={tip.title}
              className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{tip.icon}</span>
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
