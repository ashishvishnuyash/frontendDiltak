"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Info,
  Loader2,
} from "lucide-react";
import { usePhysicalHealth } from "@/hooks/use-physical-health";
import type {
  TrendDirection,
  TrendPeriod,
  TrendPoint,
} from "@/types/physical-health";

const PERIODS: { value: TrendPeriod; label: string }[] = [
  { value: "7d", label: "7D" },
  { value: "14d", label: "14D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
];

// `pain_level` is inverted at source (10 = no pain). We render it as
// `pain_relief` (same values) so "higher = better" holds for every line.
type MetricKey =
  | "energy_level"
  | "sleep_quality"
  | "sleep_hours"
  | "exercise_minutes"
  | "nutrition_quality"
  | "hydration"
  | "pain_relief";

interface MetricMeta {
  key: MetricKey;
  label: string;
  color: string;
  source: keyof TrendPoint;
  scale: "10" | "hours" | "minutes";
}

const METRICS: MetricMeta[] = [
  { key: "energy_level",      label: "Energy",       color: "#F59E0B", source: "energy_level",      scale: "10" },
  { key: "sleep_quality",     label: "Sleep quality", color: "#6366F1", source: "sleep_quality",     scale: "10" },
  { key: "sleep_hours",       label: "Sleep hours",  color: "#A855F7", source: "sleep_hours",       scale: "hours" },
  { key: "exercise_minutes",  label: "Exercise min", color: "#F97316", source: "exercise_minutes",  scale: "minutes" },
  { key: "nutrition_quality", label: "Nutrition",    color: "#22C55E", source: "nutrition_quality", scale: "10" },
  { key: "hydration",         label: "Hydration",    color: "#3B82F6", source: "hydration",         scale: "10" },
  { key: "pain_relief",       label: "Pain relief",  color: "#EF4444", source: "pain_level",        scale: "10" },
];

const METRIC_BY_KEY: Record<MetricKey, MetricMeta> = Object.fromEntries(
  METRICS.map((m) => [m.key, m]),
) as Record<MetricKey, MetricMeta>;

function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function trendIcon(dir: TrendDirection | string) {
  if (dir === "improving")
    return <ArrowUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />;
  if (dir === "declining")
    return <ArrowDown className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />;
  return <ArrowRight className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />;
}

function trendLabel(dir: TrendDirection | string): string {
  if (dir === "improving") return "Improving";
  if (dir === "declining") return "Declining";
  return "Stable";
}

function trendClass(dir: TrendDirection | string): string {
  if (dir === "improving")
    return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20";
  if (dir === "declining")
    return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20";
  return "text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800";
}

// Right-axis metrics (minutes, hours) plot on a separate scale so the 1–10 lines
// aren't flattened when a large-range metric is also selected.
function isRightAxis(key: MetricKey): boolean {
  return key === "exercise_minutes" || key === "sleep_hours";
}

export default function TrendsTab() {
  const { trends, trendsLoading, refreshTrends } = usePhysicalHealth();
  const [period, setPeriod] = useState<TrendPeriod>("30d");
  const [visible, setVisible] = useState<Set<MetricKey>>(
    () => new Set<MetricKey>(["energy_level", "sleep_quality"]),
  );

  const chartData = useMemo(() => {
    if (!trends) return [];
    return trends.data_points.map((dp) => {
      const row: Record<string, string | number | null> = {
        date: formatShortDate(dp.date),
      };
      for (const m of METRICS) {
        const raw = dp[m.source];
        row[m.key] = typeof raw === "number" ? raw : null;
      }
      return row;
    });
  }, [trends]);

  const onPeriod = async (p: TrendPeriod) => {
    setPeriod(p);
    await refreshTrends(p);
  };

  const toggleMetric = (key: MetricKey) => {
    setVisible((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size === 1) return prev; // always keep at least one
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const usesRight = Array.from(visible).some(isRightAxis);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-500" />
            Health trends
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Daily averages from your check-ins. Gaps mean no check-in that day.
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => onPeriod(p.value)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                period === p.value
                  ? "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric chips */}
      <div className="flex flex-wrap gap-2">
        {METRICS.map((m) => {
          const on = visible.has(m.key);
          return (
            <button
              key={m.key}
              onClick={() => toggleMetric(m.key)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                on
                  ? "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 shadow-sm"
                  : "bg-transparent border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500"
              }`}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: on ? m.color : "transparent", boxShadow: on ? "none" : `inset 0 0 0 1px ${m.color}` }}
              />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
        {trendsLoading && !trends ? (
          <div className="h-[320px] flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : !trends || trends.total_checkins === 0 ? (
          <div className="h-[320px] flex flex-col items-center justify-center text-center">
            <Info className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No check-ins yet for this period.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Submit a daily check-in and your trends will appear here.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: usesRight ? 10 : 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-100 dark:stroke-gray-800"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                className="text-gray-400 dark:text-gray-500"
              />
              <YAxis
                yAxisId="left"
                domain={[0, 10]}
                tick={{ fontSize: 11 }}
                className="text-gray-400 dark:text-gray-500"
              />
              {usesRight && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  className="text-gray-400 dark:text-gray-500"
                />
              )}
              <RechartsTooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 12,
                  borderColor: "rgba(0,0,0,0.08)",
                }}
              />
              {Array.from(visible).map((key) => {
                const m = METRIC_BY_KEY[key];
                return (
                  <Line
                    key={key}
                    yAxisId={isRightAxis(key) ? "right" : "left"}
                    type="monotone"
                    dataKey={key}
                    name={m.label}
                    stroke={m.color}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                    connectNulls={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Trend direction per metric */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Trend direction
        </h3>
        {!trends ? (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            No data yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {METRICS.map((m) => {
              // `pain_relief` maps back to the backend's `pain_level` key.
              const backendKey =
                m.key === "pain_relief" ? "pain_level" : m.key;
              const dir = trends.trend_direction[backendKey] ?? "stable";
              return (
                <div
                  key={m.key}
                  className="flex items-center justify-between px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: m.color }}
                    />
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                      {m.label}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${trendClass(dir)}`}
                  >
                    {trendIcon(dir)}
                    {trendLabel(dir)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Averages */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Period averages
        </h3>
        {!trends ? (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            No data yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <AverageCell label="Energy" value={trends.averages.energy_level} suffix="/10" />
            <AverageCell label="Sleep quality" value={trends.averages.sleep_quality} suffix="/10" />
            <AverageCell label="Sleep hours" value={trends.averages.sleep_hours} suffix="h" />
            <AverageCell label="Nutrition" value={trends.averages.nutrition_quality} suffix="/10" />
            <AverageCell label="Pain relief" value={trends.averages.pain_level} suffix="/10" />
            <AverageCell label="Hydration" value={trends.averages.hydration} suffix="/10" />
            <AverageCell
              label="Exercise days / wk"
              value={trends.averages.exercise_days_per_week}
              suffix=""
            />
            <AverageCell
              label="Total check-ins"
              value={trends.total_checkins}
              suffix=""
              isInt
            />
          </div>
        )}
      </div>
    </div>
  );
}

function AverageCell({
  label,
  value,
  suffix,
  isInt,
}: {
  label: string;
  value: number | undefined;
  suffix: string;
  isInt?: boolean;
}) {
  const v =
    typeof value === "number"
      ? isInt
        ? String(Math.round(value))
        : value.toFixed(1)
      : "—";
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-3">
      <p className="text-[11px] text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-base font-semibold text-gray-800 dark:text-gray-100 mt-0.5">
        {v}
        <span className="text-xs text-gray-400 dark:text-gray-500 font-normal ml-0.5">
          {suffix}
        </span>
      </p>
    </div>
  );
}
