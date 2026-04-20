/**
 * lib/physical-health-service.ts
 *
 * Typed wrappers around every /api/physical-health/* endpoint.
 * Uses `apiRequest` from lib/api-client.ts for JSON calls.
 *
 * Multipart file upload uses `fetch` directly — apiRequest always sets
 * Content-Type: application/json, which breaks multipart boundary detection.
 */

import { apiDelete, apiGet, apiPost, API_BASE } from './api-client';
import type {
  AskRequest,
  AskResponse,
  CheckInHistoryResponse,
  HealthTrendsResponse,
  MedicalDocumentDeleteResponse,
  MedicalDocumentDetail,
  MedicalDocumentListResponse,
  MedicalDocumentStatusResponse,
  MedicalDocumentUploadMeta,
  MedicalDocumentUploadResponse,
  PeriodicReportRequest,
  PeriodicReportResponse,
  PhysicalCheckInRequest,
  PhysicalCheckInResponse,
  PhysicalHealthScoreResponse,
  ReportListResponse,
  TrendPeriod,
} from '@/types/physical-health';

// ─── Check-ins ────────────────────────────────────────────────────────────────

export function submitCheckin(
  req: PhysicalCheckInRequest,
): Promise<PhysicalCheckInResponse> {
  return apiPost<PhysicalCheckInResponse>('/physical-health/check-in', req);
}

export interface CheckinHistoryParams {
  page?: number;
  limit?: number;
  days?: number;
}

export function getCheckinHistory(
  params: CheckinHistoryParams = {},
): Promise<CheckInHistoryResponse> {
  const qs = buildQuery({
    page: params.page,
    limit: params.limit,
    days: params.days,
  });
  return apiGet<CheckInHistoryResponse>(`/physical-health/check-ins${qs}`);
}

// ─── Score & Trends ──────────────────────────────────────────────────────────

export function getHealthScore(): Promise<PhysicalHealthScoreResponse> {
  return apiGet<PhysicalHealthScoreResponse>('/physical-health/score');
}

export function getHealthTrends(
  period: TrendPeriod = '30d',
): Promise<HealthTrendsResponse> {
  return apiGet<HealthTrendsResponse>(
    `/physical-health/trends?period=${period}`,
  );
}

// ─── Medical documents ───────────────────────────────────────────────────────

export const MAX_MEDICAL_FILE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_MEDICAL_EXTENSIONS = ['.pdf', '.docx', '.doc'] as const;

export async function uploadMedicalReport(
  file: File,
  meta: MedicalDocumentUploadMeta,
): Promise<MedicalDocumentUploadResponse> {
  if (file.size > MAX_MEDICAL_FILE_BYTES) {
    throw new Error('File too large. Maximum size is 10 MB.');
  }

  const lower = file.name.toLowerCase();
  if (!ALLOWED_MEDICAL_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
    throw new Error(
      'Unsupported file type. Please upload a PDF (.pdf) or Word document (.docx).',
    );
  }

  const qs = buildQuery({
    report_type: meta.report_type,
    report_date: meta.report_date,
    issuing_facility: meta.issuing_facility,
  });

  const form = new FormData();
  form.append('file', file, file.name);

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('access_token')
      : null;

  const res = await fetch(`${API_BASE}/physical-health/medical/upload${qs}`, {
    method: 'POST',
    // DO NOT set Content-Type — the browser sets `multipart/form-data; boundary=...`
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });

  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_profile');
      window.location.href = '/auth/login';
      throw new Error('Session expired. Please log in again.');
    }
    let detail = `API error ${res.status}`;
    try {
      const err = await res.json();
      detail = err?.detail ?? detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }

  return res.json() as Promise<MedicalDocumentUploadResponse>;
}

export interface MedicalListParams {
  page?: number;
  limit?: number;
}

export function listMedicalDocuments(
  params: MedicalListParams = {},
): Promise<MedicalDocumentListResponse> {
  const qs = buildQuery({ page: params.page, limit: params.limit });
  return apiGet<MedicalDocumentListResponse>(`/physical-health/medical${qs}`);
}

export function getMedicalDocument(
  docId: string,
): Promise<MedicalDocumentDetail> {
  return apiGet<MedicalDocumentDetail>(`/physical-health/medical/${docId}`);
}

export function getMedicalDocumentStatus(
  docId: string,
): Promise<MedicalDocumentStatusResponse> {
  return apiGet<MedicalDocumentStatusResponse>(
    `/physical-health/medical/${docId}/status`,
  );
}

export function deleteMedicalDocument(
  docId: string,
): Promise<MedicalDocumentDeleteResponse> {
  return apiDelete<MedicalDocumentDeleteResponse>(
    `/physical-health/medical/${docId}`,
  );
}

// ─── Periodic reports ────────────────────────────────────────────────────────

export function generateReport(
  req: PeriodicReportRequest,
): Promise<PeriodicReportResponse> {
  return apiPost<PeriodicReportResponse>(
    '/physical-health/reports/generate',
    req,
  );
}

export interface ReportListParams {
  page?: number;
  limit?: number;
}

export function listReports(
  params: ReportListParams = {},
): Promise<ReportListResponse> {
  const qs = buildQuery({ page: params.page, limit: params.limit });
  return apiGet<ReportListResponse>(`/physical-health/reports${qs}`);
}

export function getReport(reportId: string): Promise<PeriodicReportResponse> {
  return apiGet<PeriodicReportResponse>(`/physical-health/reports/${reportId}`);
}

// ─── RAG Q&A ─────────────────────────────────────────────────────────────────

export function askMedicalQuestion(question: string): Promise<AskResponse> {
  const body: AskRequest = { question };
  return apiPost<AskResponse>('/physical-health/ask', body);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildQuery(
  params: Record<string, string | number | boolean | undefined | null>,
): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}
