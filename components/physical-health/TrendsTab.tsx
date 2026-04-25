"use client";

import { useMemo, useState, useEffect } from "react";
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
import axios from "axios";
import ServerAddress from "@/constent/ServerAddress";
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

interface TrendsData {
  period: string;
  data_points: TrendPoint[];
  averages: {
    energy_level: number;
    sleep_quality: number;
    sleep_hours: number;
    exercise_minutes: number;
    nutrition_quality: number;
    pain_level: number;
    hydration: number;
    exercise_days_per_week: number;
  };
  trend_direction: {
    energy_level: TrendDirection;
    sleep_quality: TrendDirection;
    sleep_hours: TrendDirection;
    exercise_minutes: TrendDirection;
    nutrition_quality: TrendDirection;
    pain_level: TrendDirection;
    hydration: TrendDirection;
  };
  total_checkins: number;
}

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
    return <ArrowUp className="h-3.5 w-3.5 text-success" />;
  if (dir === "declining")
    return <ArrowDown className="h-3.5 w-3.5 text-destructive" />;
  return <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />;
}

function trendLabel(dir: TrendDirection | string): string {
  if (dir === "improving") return "Improving";
  if (dir === "declining") return "Declining";
  return "Stable";
}

function trendClass(dir: TrendDirection | string): string {
  if (dir === "improving")
    return "text-success bg-success/10";
  if (dir === "declining")
    return "text-destructive bg-destructive/10";
  return "text-muted-foreground bg-muted";
}

// Right-axis metrics (minutes, hours) plot on a separate scale so the 1–10 lines
// aren't flattened when a large-range metric is also selected.
function isRightAxis(key: MetricKey): boolean {
  return key === "exercise_minutes" || key === "sleep_hours";
}

export default function TrendsTab() {
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [trendsLoading, setTrendsLoading] = useState(true);
  const [period, setPeriod] = useState<TrendPeriod>("30d");
  const [visible, setVisible] = useState<Set<MetricKey>>(
    () => new Set<MetricKey>(["energy_level", "sleep_quality"]),
  );

  const fetchTrends = async (periodValue: TrendPeriod) => {
    try {
      setTrendsLoading(true);
      const token = localStorage.getItem('access_token');
      
      const response = await axios.get(`${ServerAddress}/physical-health/trends`, {
        params: { period: periodValue },
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
      setTrends(response.data);
    } catch (err) {
      console.error('Error fetching trends:', err);
    } finally {
      setTrendsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends(period);
  }, [period]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <BarChart3 className="h-5 w-5 text-primary" />
            Health trends
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Daily averages from your check-ins. Gaps mean no check-in that day.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-muted p-1 self-start sm:self-auto">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => onPeriod(p.value)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                period === p.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
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
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                on
                  ? "border-border bg-card text-foreground shadow-sm"
                  : "border-border bg-transparent text-muted-foreground"
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
      <div className="rounded-lg border border-border bg-card p-3 sm:p-5 shadow-sm">
        {trendsLoading && !trends ? (
          <div className="flex h-[240px] sm:h-[320px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !trends || trends.total_checkins === 0 ? (
          <div className="flex h-[240px] sm:h-[320px] flex-col items-center justify-center text-center">
            <Info className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No check-ins yet for this period.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
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
                className="stroke-border"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <YAxis
                yAxisId="left"
                domain={[0, 10]}
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              {usesRight && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  className="text-muted-foreground"
                />
              )}
              <RechartsTooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  borderColor: "hsl(var(--border))",
                  backgroundColor: "hsl(var(--background))",
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

      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-foreground">
          Trend direction
        </h3>
        {!trends ? (
          <p className="text-xs text-muted-foreground">
            No data yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {METRICS.map((m) => {
              // `pain_relief` maps back to the backend's `pain_level` key.
              const backendKey =
                m.key === "pain_relief" ? "pain_level" : m.key;
              const dir = trends.trend_direction[backendKey as keyof typeof trends.trend_direction] ?? "stable";
              return (
                <div
                  key={m.key}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: m.color }}
                    />
                    <span className="text-xs text-foreground">
                      {m.label}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${trendClass(dir)}`}
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

      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-foreground">
          Period averages
        </h3>
        {!trends ? (
          <p className="text-xs text-muted-foreground">
            No data yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
    <div className="rounded-lg border border-border p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-base font-semibold text-foreground">
        {v}
        <span className="ml-0.5 text-xs font-normal text-muted-foreground">
          {suffix}
        </span>
      </p>
    </div>
  );
}