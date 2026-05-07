/**
 * reports-service.ts
 * Firebase has been removed. All report data now comes from the custom REST API.
 * These stubs keep existing imports from breaking.
 */

import type { MentalHealthReport, User } from '@/types/index';

export interface ReportWithEmployee extends MentalHealthReport {
  employee?: User;
}

export interface ReportsAnalytics {
  totalReports: number;
  avgWellness: number;
  avgStress: number;
  avgMood: number;
  avgEnergy: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  departmentBreakdown: { [key: string]: { count: number; avgWellness: number } };
  dailyTrends: { date: string; wellness: number; stress: number; reportCount: number }[];
}

export interface PersonalHistory {
  recentReports: MentalHealthReport[];
  previousSessions: {
    date: string;
    sessionType: 'text' | 'voice';
    duration?: number;
    keyTopics: string[];
    moodTrend: number;
    stressTrend: number;
  }[];
  progressTrends: {
    wellness: { current: number; previous: number; trend: 'improving' | 'stable' | 'declining' };
    stress:   { current: number; previous: number; trend: 'improving' | 'stable' | 'declining' };
    mood:     { current: number; previous: number; trend: 'improving' | 'stable' | 'declining' };
  };
}

export async function getRecentReports(_companyId: string, _days = 7): Promise<ReportWithEmployee[]> {
  return [];
}

export function generateReportsAnalytics(_reports: ReportWithEmployee[]): ReportsAnalytics {
  return {
    totalReports: 0, avgWellness: 0, avgStress: 0, avgMood: 0, avgEnergy: 0,
    highRiskCount: 0, mediumRiskCount: 0, lowRiskCount: 0,
    departmentBreakdown: {}, dailyTrends: [],
  };
}

export function formatReportsForAI(_reports: ReportWithEmployee[], _analytics: ReportsAnalytics): string {
  return '';
}

export async function getPersonalHistory(_userId: string, _companyId: string, _days = 30): Promise<PersonalHistory> {
  return {
    recentReports: [],
    previousSessions: [],
    progressTrends: {
      wellness: { current: 0, previous: 0, trend: 'stable' },
      stress:   { current: 0, previous: 0, trend: 'stable' },
      mood:     { current: 0, previous: 0, trend: 'stable' },
    },
  };
}

export function formatPersonalHistoryForAI(_history: PersonalHistory): string {
  return "This is the user's first wellness session. No previous history available.";
}
