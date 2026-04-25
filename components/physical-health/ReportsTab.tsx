"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Info,
  Loader2,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import ServerAddress from "@/constent/ServerAddress";
import type {
  PeriodicReportResponse,
  ReportListItem,
  ReportType,
} from "@/types/physical-health";

const REPORT_TYPE_OPTIONS: { value: ReportType; label: string; days: number }[] =
  [
    { value: "weekly", label: "Weekly", days: 7 },
    { value: "monthly", label: "Monthly", days: 30 },
    { value: "on_demand", label: "On demand", days: 14 },
  ];

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function scoreColor(score: number): string {
  if (score >= 7.5) return "text-success";
  if (score >= 5) return "text-warning";
  return "text-destructive";
}

function trendIcon(trend: string) {
  if (trend === "improving") {
    return <TrendingUp className="h-5 w-5 text-success" />;
  }
  if (trend === "declining") {
    return <TrendingDown className="h-5 w-5 text-destructive" />;
  }
  return <BarChart3 className="h-5 w-5 text-muted-foreground" />;
}

function isNotEnoughData(msg: string): boolean {
  const m = msg.toLowerCase();
  return (
    m.includes("not enough") ||
    m.includes("at least 3") ||
    m.includes("insufficient")
  );
}

export default function ReportsTab() {
  const [reportType, setReportType] = useState<ReportType>("weekly");
  const [days, setDays] = useState<number>(7);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<PeriodicReportResponse | null>(
    null,
  );
  const [notEnoughData, setNotEnoughData] = useState(false);

  const [list, setList] = useState<ReportListItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailCache, setDetailCache] = useState<
    Record<string, PeriodicReportResponse>
  >({});

  const loadList = useCallback(async () => {
    setLoadingList(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${ServerAddress}/physical-health/reports`, {
        params: { page: 1, limit: 30 },
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
      setList(response.data.reports || []);
    } catch (e) {
      toast({
        title: "Could not load reports",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const onReportTypeChange = (t: ReportType) => {
    setReportType(t);
    const preset = REPORT_TYPE_OPTIONS.find((o) => o.value === t);
    if (preset) setDays(preset.days);
  };

  const onGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (days < 7 || days > 365) {
      toast({
        title: "Invalid period",
        description: "Days must be between 7 and 365.",
        variant: "destructive",
      });
      return;
    }
    setGenerating(true);
    setNotEnoughData(false);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(`${ServerAddress}/physical-health/reports/generate`, 
        { report_type: reportType, days },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );
      
      setGenerated(response.data);
      toast({
        title: "Report generated",
      });
      await loadList();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      if (isNotEnoughData(msg)) {
        setNotEnoughData(true);
        setGenerated(null);
      } else {
        toast({
          title: "Could not generate report",
          description: msg,
          variant: "destructive",
        });
      }
    } finally {
      setGenerating(false);
    }
  };

  const getReportDetail = async (reportId: string) => {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(`${ServerAddress}/physical-health/reports/${reportId}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return response.data;
  };

  const toggleExpand = async (reportId: string) => {
    if (expandedId === reportId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(reportId);
    if (!detailCache[reportId]) {
      try {
        const detail = await getReportDetail(reportId);
        setDetailCache((prev) => ({ ...prev, [reportId]: detail }));
      } catch (e) {
        toast({
          title: "Could not load report",
          description: e instanceof Error ? e.message : "Unknown error",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Generator */}
      <form
        onSubmit={onGenerate}
        className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-4"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="mb-1 text-base font-semibold text-foreground">
              Generate a new report
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              AI-generated summary of your check-ins, averages, and
              recommendations over a chosen period.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Report type
            </label>
            <select
              value={reportType}
              onChange={(e) => onReportTypeChange(e.target.value as ReportType)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {REPORT_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Period (days)
            </label>
            <input
              type="number"
              min={7}
              max={365}
              step={1}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={generating}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>

        {notEnoughData && (
          <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-3">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-warning" />
            <div className="text-xs leading-relaxed text-warning">
              You need at least 3 check-ins in this period to generate a
              report. Head to the{" "}
              <span className="font-medium">Daily Check-in</span> tab and log a
              few days first.
            </div>
          </div>
        )}
      </form>

      {/* Just-generated report preview */}
      {generated && <ReportCard report={generated} />}

      {/* Historical list */}
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-base font-semibold text-foreground">
            Past reports
          </h3>
          <span className="text-xs text-muted-foreground">
            {list.length} report{list.length === 1 ? "" : "s"}
          </span>
        </div>

        {loadingList ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : list.length === 0 ? (
          <div className="py-10 text-center">
            <FileSpreadsheet className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              No reports yet. Generate your first one above.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {list.map((r) => {
              const isOpen = expandedId === r.report_id;
              const detail = detailCache[r.report_id];
              return (
                <li key={r.report_id} className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => toggleExpand(r.report_id)}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                      <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-foreground capitalize">
                          {r.report_type.replace("_", " ")} report
                        </span>
                        <span
                          className={`text-sm font-semibold ${scoreColor(r.overall_score)}`}
                        >
                          {r.overall_score.toFixed(1)}/10
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          {trendIcon(r.trend)}
                          {r.trend}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{formatDate(r.period_start)}</span>
                        <span>→</span>
                        <span>{formatDate(r.period_end)}</span>
                        {r.generated_at && (
                          <>
                            <span>•</span>
                            <span>Generated {formatDate(r.generated_at)}</span>
                          </>
                        )}
                        {r.follow_up_suggested && (
                          <span className="text-warning">
                            • follow-up suggested
                          </span>
                        )}
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="ml-0 sm:ml-12 mt-4">
                      {detail ? (
                        <ReportCard report={detail} embedded />
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Loading…
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function ReportCard({
  report,
  embedded = false,
}: {
  report: PeriodicReportResponse;
  embedded?: boolean;
}) {
  const metrics: { label: string; value: string }[] = [
    { label: "Energy", value: report.avg_energy.toFixed(1) },
    { label: "Sleep quality", value: report.avg_sleep_quality.toFixed(1) },
    { label: "Sleep hours", value: report.avg_sleep_hours.toFixed(1) },
    {
      label: "Exercise min/day",
      value: report.avg_exercise_minutes_daily.toFixed(0),
    },
    { label: "Nutrition", value: report.avg_nutrition_quality.toFixed(1) },
    { label: "Pain (higher = less)", value: report.avg_pain_level.toFixed(1) },
    { label: "Exercise days", value: String(report.exercise_days) },
  ];

  return (
    <div
      className={
        embedded
          ? "space-y-3"
          : "space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm"
      }
    >
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="mb-1 text-base font-semibold text-foreground capitalize">
              {report.report_type.replace("_", " ")} report
            </h3>
            <p className="text-xs text-muted-foreground">
              {formatDate(report.period_start)} →{" "}
              {formatDate(report.period_end)}
            </p>
          </div>
          <div className="text-right">
            <div
              className={`text-2xl font-bold ${scoreColor(report.overall_score)}`}
            >
              {report.overall_score.toFixed(1)}
              <span className="text-sm text-muted-foreground">
                /10
              </span>
            </div>
            <div className="flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
              {trendIcon(report.trend)}
              {report.trend}
            </div>
          </div>
        </div>
      )}

      {report.summary && (
        <p className="text-xs leading-relaxed text-foreground/80">
          {report.summary}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-lg border border-border p-3"
          >
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {m.label}
            </div>
            <div className="mt-0.5 text-sm font-semibold text-foreground">
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {report.strengths.length > 0 && (
        <div>
          <h4 className="mb-1 text-xs font-semibold text-success">
            Strengths
          </h4>
          <ul className="list-inside list-disc space-y-0.5 text-xs text-foreground/80">
            {report.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {report.concerns.length > 0 && (
        <div>
          <h4 className="mb-1 text-xs font-semibold text-warning">
            Concerns
          </h4>
          <ul className="list-inside list-disc space-y-0.5 text-xs text-foreground/80">
            {report.concerns.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {report.recommendations.length > 0 && (
        <div>
          <h4 className="mb-1 text-xs font-semibold text-info">
            Recommendations
          </h4>
          <ul className="list-inside list-disc space-y-0.5 text-xs text-foreground/80">
            {report.recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {report.follow_up_suggested && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
          Consider booking a follow-up — trends suggest some areas worth a
          closer look.
        </div>
      )}
    </div>
  );
}