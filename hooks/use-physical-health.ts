'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getCheckinHistory,
  getHealthScore,
  getHealthTrends,
  submitCheckin as submitCheckinService,
} from '@/lib/physical-health-service';
import type {
  CheckInHistoryResponse,
  HealthTrendsResponse,
  PhysicalCheckInRequest,
  PhysicalCheckInResponse,
  PhysicalHealthScoreResponse,
  TrendPeriod,
} from '@/types/physical-health';

export interface UsePhysicalHealthOptions {
  /** Period for trends query. Defaults to '30d'. */
  period?: TrendPeriod;
  /** History window in days. Defaults to 90. */
  historyDays?: number;
  /** Skip the initial auto-load on mount. */
  skipInitial?: boolean;
}

export interface UsePhysicalHealthReturn {
  score: PhysicalHealthScoreResponse | null;
  trends: HealthTrendsResponse | null;
  history: CheckInHistoryResponse | null;

  scoreLoading: boolean;
  trendsLoading: boolean;
  historyLoading: boolean;
  submitting: boolean;

  error: string | null;

  refreshScore: () => Promise<void>;
  refreshTrends: (period?: TrendPeriod) => Promise<void>;
  refreshHistory: (opts?: {
    page?: number;
    limit?: number;
    days?: number;
  }) => Promise<void>;
  refreshAll: () => Promise<void>;
  submitCheckin: (
    req: PhysicalCheckInRequest,
  ) => Promise<PhysicalCheckInResponse>;
}

export function usePhysicalHealth(
  options: UsePhysicalHealthOptions = {},
): UsePhysicalHealthReturn {
  const { period = '30d', historyDays = 90, skipInitial = false } = options;

  const [score, setScore] = useState<PhysicalHealthScoreResponse | null>(null);
  const [trends, setTrends] = useState<HealthTrendsResponse | null>(null);
  const [history, setHistory] = useState<CheckInHistoryResponse | null>(null);

  const [scoreLoading, setScoreLoading] = useState(false);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const refreshScore = useCallback(async () => {
    setScoreLoading(true);
    try {
      const data = await getHealthScore();
      setScore(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load health score');
    } finally {
      setScoreLoading(false);
    }
  }, []);

  const refreshTrends = useCallback(
    async (nextPeriod?: TrendPeriod) => {
      setTrendsLoading(true);
      try {
        const data = await getHealthTrends(nextPeriod ?? period);
        setTrends(data);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load trends');
      } finally {
        setTrendsLoading(false);
      }
    },
    [period],
  );

  const refreshHistory = useCallback(
    async (opts?: { page?: number; limit?: number; days?: number }) => {
      setHistoryLoading(true);
      try {
        const data = await getCheckinHistory({
          page: opts?.page ?? 1,
          limit: opts?.limit ?? 30,
          days: opts?.days ?? historyDays,
        });
        setHistory(data);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load history');
      } finally {
        setHistoryLoading(false);
      }
    },
    [historyDays],
  );

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshScore(), refreshTrends(), refreshHistory()]);
  }, [refreshScore, refreshTrends, refreshHistory]);

  const submitCheckin = useCallback(
    async (req: PhysicalCheckInRequest): Promise<PhysicalCheckInResponse> => {
      setSubmitting(true);
      try {
        const res = await submitCheckinService(req);
        // Refresh score + trends + history in parallel. Don't await — caller
        // can continue. We still need the result to return synchronously.
        Promise.all([refreshScore(), refreshTrends(), refreshHistory()]).catch(
          () => {
            /* errors already set in individual refreshers */
          },
        );
        return res;
      } finally {
        setSubmitting(false);
      }
    },
    [refreshScore, refreshTrends, refreshHistory],
  );

  useEffect(() => {
    if (skipInitial) return;
    refreshScore();
    refreshTrends();
    refreshHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    score,
    trends,
    history,
    scoreLoading,
    trendsLoading,
    historyLoading,
    submitting,
    error,
    refreshScore,
    refreshTrends,
    refreshHistory,
    refreshAll,
    submitCheckin,
  };
}
