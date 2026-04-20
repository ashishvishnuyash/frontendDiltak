"use client";

import { CalendarCheck, Flame, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { usePhysicalHealth } from "@/hooks/use-physical-health";
import type { PhysicalHealthTabId } from "@/app/employee/physical-health/page";

interface HealthScoreTabProps {
  onNavigate?: (tabId: PhysicalHealthTabId) => void;
}

// Overall score from backend is on 0-10; scale to 0-100 for the ring.

function levelStyle(level: string): string {
  const l = level.toLowerCase();
  if (l === "high")
    return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20";
  if (l === "medium")
    return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20";
  return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20";
}

function scoreStroke(score: number): string {
  if (score >= 7.5) return "#22c55e";
  if (score >= 5) return "#f59e0b";
  return "#ef4444";
}

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

export default function HealthScoreTab({ onNavigate }: HealthScoreTabProps = {}) {
  const { score, scoreLoading } = usePhysicalHealth();

  if (scoreLoading && !score) {
    return (
      <div className="py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!score) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No health score yet. Submit a few daily check-ins to see your score.
        </p>
      </div>
    );
  }

  const overall = score.score;
  const percent = Math.max(0, Math.min(100, (overall / 10) * 100));
  const stroke = scoreStroke(overall);
  const circumference = 2 * Math.PI * 85;

  const needsCheckIn =
    score.days_since_checkin == null || score.days_since_checkin > 1;

  return (
    <div className="space-y-5">
      {needsCheckIn && (
        <button
          type="button"
          onClick={() => onNavigate?.("check-in")}
          className="w-full text-left bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:bg-amber-100/60 dark:hover:bg-amber-950/30 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
            <CalendarCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Check in today to keep your score accurate
            </p>
            <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-0.5">
              {score.days_since_checkin == null
                ? "No check-ins yet — take a minute to log today."
                : `It's been ${score.days_since_checkin} day${score.days_since_checkin === 1 ? "" : "s"} since your last check-in.`}
            </p>
          </div>
          <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
            Check in →
          </span>
        </button>
      )}

      {/* Overall Score */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
        <div className="relative inline-flex items-center justify-center mb-5">
          <svg className="w-60 h-60" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="85"
              strokeWidth="14"
              fill="none"
              className="stroke-gray-100 dark:stroke-gray-700"
            />
            <circle
              cx="100"
              cy="100"
              r="85"
              strokeWidth="14"
              fill="none"
              stroke={stroke}
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${circumference * (1 - percent / 100)}`}
              transform="rotate(-90 100 100)"
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-gray-800 dark:text-gray-100">
              {overall.toFixed(1)}
            </span>
            <span className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              / 10
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span
            className={`text-sm font-semibold px-3 py-1 rounded-full capitalize ${levelStyle(
              score.level,
            )}`}
          >
            {score.level}
          </span>
          {score.streak_days > 0 ? (
            <span className="inline-flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400">
              <Flame className="h-4 w-4" />
              {score.streak_days}-day streak
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              <Flame className="h-4 w-4" />
              Start your streak — check in today!
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center justify-center gap-2">
          {score.last_checkin_date && (
            <span>Last check-in: {formatDate(score.last_checkin_date)}</span>
          )}
          {score.days_since_checkin != null && (
            <span>
              {score.days_since_checkin === 0
                ? "(today)"
                : `(${score.days_since_checkin}d ago)`}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Highlights */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Highlights
            </h3>
          </div>
          {score.highlights.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Keep checking in — highlights will appear once we have enough
              data.
            </p>
          ) : (
            <ul className="space-y-2">
              {score.highlights.map((h, i) => (
                <li
                  key={i}
                  className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed flex gap-2"
                >
                  <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Concerns */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Areas to improve
            </h3>
          </div>
          {score.concerns.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Nothing flagged — keep it up.
            </p>
          ) : (
            <ul className="space-y-2">
              {score.concerns.map((c, i) => (
                <li
                  key={i}
                  className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed flex gap-2"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-2" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
