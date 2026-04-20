"use client";

import { useState } from "react";
import { Coffee, Loader2, Smartphone, Sun, Thermometer } from "lucide-react";
import { usePhysicalHealth } from "@/hooks/use-physical-health";
import type { TrendPeriod } from "@/types/physical-health";

const PERIODS: { value: TrendPeriod; label: string }[] = [
  { value: "7d", label: "7D" },
  { value: "14d", label: "14D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
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

function hoursColor(h: number): string {
  if (h >= 7) return "bg-green-500";
  if (h >= 6) return "bg-yellow-500";
  return "bg-red-500";
}

function hoursStatus(h: number | null | undefined): string {
  if (h == null) return "No data";
  if (h >= 7) return "On target";
  if (h >= 6) return "Slightly low";
  return "Low";
}

function statusColor(h: number | null | undefined): string {
  if (h == null) return "text-gray-400";
  if (h >= 7) return "text-green-600 dark:text-green-400";
  if (h >= 6) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function formatDay(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { weekday: "short" });
  } catch {
    return iso.slice(5, 10);
  }
}

export default function SleepTab() {
  const [period, setPeriod] = useState<TrendPeriod>("30d");
  const { trends, trendsLoading, refreshTrends } = usePhysicalHealth({ period });

  const onSelectPeriod = (p: TrendPeriod) => {
    setPeriod(p);
    refreshTrends(p);
  };

  const maxHours = 9;
  const points = trends?.data_points ?? [];
  const sleepPoints = points.filter((p) => p.sleep_hours != null);
  const latest = sleepPoints[sleepPoints.length - 1];
  const avgHours = trends?.averages.sleep_hours ?? null;
  const avgQuality = trends?.averages.sleep_quality ?? null;

  const stats = [
    {
      label: "Last logged",
      value: latest?.sleep_hours != null ? latest.sleep_hours.toFixed(1) : "—",
      unit: "hrs",
      status: hoursStatus(latest?.sleep_hours ?? null),
      statusColor: statusColor(latest?.sleep_hours ?? null),
    },
    {
      label: "Avg sleep hours",
      value: avgHours != null ? avgHours.toFixed(1) : "—",
      unit: "hrs",
      status: hoursStatus(avgHours),
      statusColor: statusColor(avgHours),
    },
    {
      label: "Avg sleep quality",
      value: avgQuality != null ? avgQuality.toFixed(1) : "—",
      unit: "/10",
      status:
        avgQuality == null
          ? "No data"
          : avgQuality >= 7
            ? "Good"
            : avgQuality >= 5
              ? "Fair"
              : "Low",
      statusColor:
        avgQuality == null
          ? "text-gray-400"
          : avgQuality >= 7
            ? "text-green-600 dark:text-green-400"
            : avgQuality >= 5
              ? "text-yellow-600 dark:text-yellow-400"
              : "text-red-600 dark:text-red-400",
    },
    {
      label: "Check-ins logged",
      value: String(trends?.total_checkins ?? 0),
      unit: "",
      status: `over ${period}`,
      statusColor: "text-gray-500 dark:text-gray-400",
    },
  ];

  // Week view — last 7 points with sleep_hours
  const weekPoints = sleepPoints.slice(-7);

  return (
    <div className="space-y-5">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          Sleep trends
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
      ) : !trends || trends.total_checkins === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No check-ins yet. Head to the Daily Check-in tab and start tracking
            to see sleep trends here.
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
                    {s.unit}
                  </span>
                </div>
                <span className={`text-xs ${s.statusColor}`}>{s.status}</span>
              </div>
            ))}
          </div>

          {/* Weekly pattern */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Recent sleep pattern
            </h3>
            {weekPoints.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 py-6 text-center">
                Not enough data to render a pattern yet.
              </p>
            ) : (
              <>
                <div className="flex items-end justify-between gap-2 h-32">
                  {weekPoints.map((d) => {
                    const h = d.sleep_hours ?? 0;
                    return (
                      <div
                        key={d.date}
                        className="flex flex-col items-center flex-1 gap-1"
                      >
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                          {h.toFixed(1)}h
                        </span>
                        <div className="w-full flex flex-col justify-end h-24">
                          <div
                            className={`w-full rounded-t-md ${hoursColor(h)}`}
                            style={{ height: `${(h / maxHours) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                          {formatDay(d.date)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" /> 7+ hrs
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" /> 6-7
                    hrs
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" /> under 6
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Improvement tips */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Sleep improvement programme
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
