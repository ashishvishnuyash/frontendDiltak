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
import {
  generateReport,
  getReport,
  listReports,
} from "@/lib/physical-health-service";
import { toast } from "@/hooks/use-toast";
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
  if (score >= 7.5) return "text-green-600 dark:text-green-400";
  if (score >= 5) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function trendIcon(trend: string) {
  if (trend === "improving") {
    return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
  }
  if (trend === "declining") {
    return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
  }
  return <BarChart3 className="h-4 w-4 text-gray-500" />;
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
      const res = await listReports({ page: 1, limit: 30 });
      setList(res.reports);
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
      const res = await generateReport({ report_type: reportType, days });
      setGenerated(res);
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

  const toggleExpand = async (reportId: string) => {
    if (expandedId === reportId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(reportId);
    if (!detailCache[reportId]) {
      try {
        const detail = await getReport(reportId);
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
        className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Generate a new report
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              AI-generated summary of your check-ins, averages, and
              recommendations over a chosen period.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
              Report type
            </label>
            <select
              value={reportType}
              onChange={(e) => onReportTypeChange(e.target.value as ReportType)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {REPORT_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
              Period (days)
            </label>
            <input
              type="number"
              min={7}
              max={365}
              step={1}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={generating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors w-full justify-center"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>

        {notEnoughData && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
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
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            Past reports
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {list.length} report{list.length === 1 ? "" : "s"}
          </span>
        </div>

        {loadingList ? (
          <div className="py-10 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : list.length === 0 ? (
          <div className="py-10 text-center">
            <FileSpreadsheet className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              No reports yet. Generate your first one above.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {list.map((r) => {
              const isOpen = expandedId === r.report_id;
              const detail = detailCache[r.report_id];
              return (
                <li key={r.report_id} className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => toggleExpand(r.report_id)}
                    className="w-full flex items-center gap-3 text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <FileSpreadsheet className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100 capitalize">
                          {r.report_type.replace("_", " ")} report
                        </span>
                        <span
                          className={`text-sm font-semibold ${scoreColor(r.overall_score)}`}
                        >
                          {r.overall_score.toFixed(1)}/10
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                          {trendIcon(r.trend)}
                          {r.trend}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
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
                          <span className="text-amber-600 dark:text-amber-400">
                            • follow-up suggested
                          </span>
                        )}
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="mt-4 ml-12">
                      {detail ? (
                        <ReportCard report={detail} embedded />
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
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
          : "bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4"
      }
    >
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 capitalize">
              {report.report_type.replace("_", " ")} report
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(report.period_start)} →{" "}
              {formatDate(report.period_end)}
            </p>
          </div>
          <div className="text-right">
            <div
              className={`text-2xl font-bold ${scoreColor(report.overall_score)}`}
            >
              {report.overall_score.toFixed(1)}
              <span className="text-sm text-gray-400 dark:text-gray-500">
                /10
              </span>
            </div>
            <div className="flex items-center justify-end gap-1 text-[11px] text-gray-500 dark:text-gray-400">
              {trendIcon(report.trend)}
              {report.trend}
            </div>
          </div>
        </div>
      )}

      {report.summary && (
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          {report.summary}
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-gray-100 dark:border-gray-800 p-3"
          >
            <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {m.label}
            </div>
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-100 mt-0.5">
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {report.strengths.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">
            Strengths
          </h4>
          <ul className="list-disc pl-5 space-y-0.5 text-xs text-gray-600 dark:text-gray-300">
            {report.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {report.concerns.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
            Concerns
          </h4>
          <ul className="list-disc pl-5 space-y-0.5 text-xs text-gray-600 dark:text-gray-300">
            {report.concerns.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {report.recommendations.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
            Recommendations
          </h4>
          <ul className="list-disc pl-5 space-y-0.5 text-xs text-gray-600 dark:text-gray-300">
            {report.recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {report.follow_up_suggested && (
        <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800/30">
          Consider booking a follow-up — trends suggest some areas worth a
          closer look.
        </div>
      )}
    </div>
  );
}
