

"use client";

import { CalendarCheck, Flame, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import type { PhysicalHealthTabId } from "@/app/employee/physical-health/page";
import ServerAddress from "@/constent/ServerAddress";

interface HealthScoreTabProps {
  onNavigate?: (tabId: PhysicalHealthTabId) => void;
}

interface HealthScoreData {
  score: number;
  level: string;
  last_checkin_date: string | null;
  days_since_checkin: number | null;
  streak_days: number;
  highlights: string[];
  concerns: string[];
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
  const [score, setScore] = useState<HealthScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealthScore = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        const response = await axios.get(`${ServerAddress}/physical-health/score`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        console.log("Health score data", response.data);
        setScore(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching health score:', err);
        setError("Unable to load health score. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHealthScore();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!score) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">
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
    <div className="space-y-4 sm:space-y-5">
      {needsCheckIn && (
        <button
          type="button"
          onClick={() => onNavigate?.("check-in")}
          className="flex w-full items-center gap-3 rounded-lg border border-warning/30 bg-warning/10 p-3 sm:p-4 text-left shadow-sm transition-colors hover:bg-warning/20"
        >
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded-lg bg-warning/20">
            <CalendarCheck className="h-5 w-5 sm:h-5 sm:w-5 text-warning" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-warning-foreground">
              Check in today to keep your score accurate
            </p>
            <p className="mt-0.5 text-xs text-warning-foreground/80">
              {score.days_since_checkin == null
                ? "No check-ins yet — take a minute to log today."
                : `It's been ${score.days_since_checkin} day${score.days_since_checkin === 1 ? "" : "s"} since your last check-in.`}
            </p>
          </div>
          <span className="text-xs font-medium text-warning-foreground flex-shrink-0">
            Check in →
          </span>
        </button>
      )}

      {/* Overall Score */}
      <div className="rounded-lg border border-border bg-card p-5 sm:p-8 text-center shadow-sm">
        <div className="relative inline-flex items-center justify-center">
          <svg className="h-44 w-44 sm:h-60 sm:w-60" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="85"
              strokeWidth="14"
              fill="none"
              className="stroke-muted"
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
            <span className="text-3xl sm:text-4xl font-bold text-foreground">
              {overall.toFixed(1)}
            </span>
            <span className="mt-1 text-sm text-muted-foreground">
              / 10
            </span>
          </div>
        </div>
        <div className="mb-2 mt-4 flex flex-wrap items-center justify-center gap-2">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold capitalize ${levelStyle(
              score.level,
            )}`}
          >
            {score.level}
          </span>
          {score.streak_days > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Flame className="h-5 w-5 sm:h-5 sm:w-5" />
              {score.streak_days}-day streak
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs sm:text-sm font-medium text-muted-foreground">
              <Flame className="h-5 w-5 sm:h-5 sm:w-5" />
              Start your streak — check in today!
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Highlights */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-success" />
            <h3 className="text-base font-semibold text-foreground">
              Highlights
            </h3>
          </div>
          {score.highlights.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Keep checking in — highlights will appear once we have enough
              data.
            </p>
          ) : (
            <ul className="space-y-2">
              {score.highlights.map((h, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-xs leading-relaxed text-foreground/80"
                >
                  <TrendingUp className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-success" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Concerns */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-warning" />
            <h3 className="text-base font-semibold text-foreground">
              Areas to improve
            </h3>
          </div>
          {score.concerns.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Nothing flagged — keep it up.
            </p>
          ) : (
            <ul className="space-y-2">
              {score.concerns.map((c, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-xs leading-relaxed text-foreground/80"
                >
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-warning" />
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