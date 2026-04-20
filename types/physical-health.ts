/**
 * types/physical-health.ts
 *
 * TypeScript mirror of the Pydantic models in
 * `human/physical_health_schemas.py`. Field names are intentionally
 * snake_case to match the backend response shape 1:1 — do not rename.
 */

// ─── Enum-like string unions ─────────────────────────────────────────────────

export type TrendPeriod = '7d' | '14d' | '30d' | '90d';

export type ReportType = 'weekly' | 'monthly' | 'on_demand';

export type MedicalReportType =
  | 'lab_work'
  | 'blood_test'
  | 'xray_mri'
  | 'prescription'
  | 'general_checkup'
  | 'specialist'
  | 'other';

export type UrgencyLevel = 'routine' | 'follow_up' | 'urgent' | 'emergency';

export type DocStatus = 'uploaded' | 'processing' | 'analyzed' | 'failed' | 'unknown';

export type ExerciseType = 'walk' | 'gym' | 'yoga' | 'sport' | 'other' | 'none';

export type HealthLevel = 'low' | 'medium' | 'high';

export type FlaggedStatus = 'high' | 'low' | 'normal' | 'borderline';

export type TrendDirection = 'improving' | 'declining' | 'stable';

// ─── Check-in ────────────────────────────────────────────────────────────────

export interface PhysicalCheckInRequest {
  energy_level: number;        // 1-10
  sleep_quality: number;       // 1-10
  sleep_hours: number;         // 0-24
  exercise_done: boolean;
  exercise_minutes: number;    // 0+
  exercise_type: ExerciseType | string;
  nutrition_quality: number;   // 1-10
  pain_level: number;          // 1-10 (10 = no pain)
  hydration: number;           // 1-10
  notes?: string | null;
}

export interface PhysicalCheckInResponse {
  success: boolean;
  checkin_id: string;
  nudge?: string | null;
}

export interface CheckInHistoryItem {
  checkin_id: string;
  created_at: string;
  energy_level: number;
  sleep_quality: number;
  sleep_hours: number;
  exercise_done: boolean;
  exercise_minutes: number;
  exercise_type: string;
  nutrition_quality: number;
  pain_level: number;
  hydration: number;
  notes?: string | null;
}

export interface CheckInHistoryResponse {
  success: boolean;
  checkins: CheckInHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ─── Score & Trends ──────────────────────────────────────────────────────────

export interface PhysicalHealthScoreResponse {
  score: number;
  level: HealthLevel | string;
  last_checkin_date?: string | null;
  days_since_checkin?: number | null;
  streak_days: number;
  highlights: string[];
  concerns: string[];
}

export interface TrendPoint {
  date: string;
  energy_level?: number | null;
  sleep_quality?: number | null;
  sleep_hours?: number | null;
  exercise_minutes?: number | null;
  nutrition_quality?: number | null;
  pain_level?: number | null;
  hydration?: number | null;
}

export interface HealthTrendsAverages {
  energy_level: number;
  sleep_quality: number;
  sleep_hours: number;
  nutrition_quality: number;
  pain_level: number;
  hydration: number;
  exercise_days_per_week: number;
  [key: string]: number;
}

export interface HealthTrendsResponse {
  period: string;
  data_points: TrendPoint[];
  averages: HealthTrendsAverages;
  trend_direction: Record<string, TrendDirection | string>;
  total_checkins: number;
}

// ─── Medical documents ───────────────────────────────────────────────────────

export interface FlaggedValue {
  name: string;
  value: string;
  normal_range: string;
  status: FlaggedStatus | string;
  plain_explanation: string;
}

export interface MedicalDocumentDetail {
  doc_id: string;
  filename: string;
  report_type: MedicalReportType | string;
  report_date?: string | null;
  issuing_facility?: string | null;
  status: DocStatus | string;
  uploaded_at: string;
  analyzed_at?: string | null;
  summary?: string | null;
  key_findings?: string[] | null;
  flagged_values?: FlaggedValue[] | null;
  recommendations?: string[] | null;
  follow_up_needed?: boolean | null;
  urgency_level: UrgencyLevel | string;
}

export interface MedicalDocumentListResponse {
  success: boolean;
  documents: MedicalDocumentDetail[];
  total: number;
}

export interface MedicalDocumentUploadResponse {
  success: boolean;
  doc_id: string;
  status: string;
  message: string;
}

export interface MedicalDocumentStatusResponse {
  doc_id: string;
  status: DocStatus | string;
  analyzed_at?: string | null;
  urgency_level?: string | null;
}

export interface MedicalDocumentUploadMeta {
  report_type: MedicalReportType;
  report_date?: string;      // YYYY-MM-DD
  issuing_facility?: string;
}

export interface MedicalDocumentDeleteResponse {
  success: boolean;
  doc_id: string;
  message: string;
}

// ─── Periodic reports ────────────────────────────────────────────────────────

export interface PeriodicReportRequest {
  report_type: ReportType;
  days: number;              // 7-365
}

export interface PeriodicReportResponse {
  report_id: string;
  period_start: string;
  period_end: string;
  report_type: string;
  overall_score: number;
  overall_level: HealthLevel | string;
  trend: string;
  avg_energy: number;
  avg_sleep_quality: number;
  avg_sleep_hours: number;
  avg_exercise_minutes_daily: number;
  avg_nutrition_quality: number;
  avg_pain_level: number;
  exercise_days: number;
  summary: string;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
  follow_up_suggested: boolean;
  generated_at: string;
}

export interface ReportListItem {
  report_id: string;
  report_type: string;
  overall_score: number;
  overall_level: HealthLevel | string;
  trend: string;
  period_start: string;
  period_end: string;
  generated_at: string | null;
  follow_up_suggested: boolean;
}

export interface ReportListResponse {
  success: boolean;
  reports: ReportListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ─── Medical Q&A ─────────────────────────────────────────────────────────────

export interface AskRequest {
  question: string;          // min 5 chars
}

export interface AskResponse {
  answer: string;
  source_doc_ids: string[];
  confidence: number;
  disclaimer: string;
}
