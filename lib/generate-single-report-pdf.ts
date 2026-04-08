/**
 * generate-single-report-pdf.ts
 * Beautiful single-report PDF — drawn entirely with jsPDF primitives.
 * Includes all core metrics, AI mental/physical health analysis,
 * insights, strengths, risks, and recommendations.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── Types (mirrors DetailReport + ReportResponse) ──────────────────────────────

export interface MetricDetail { score: number; level: string; reason: string; weight: number; }
export interface HealthBlock  { score: number; level: string; confidence: number; trend: string; summary: string; metrics: Record<string, MetricDetail>; }
export interface OverallBlock { score: number; level: string; confidence: number; trend: string; priority: string; summary: string; full_report: string; key_insights: string[]; strengths: string[]; risks: string[]; recommendations: string[]; }

export interface SingleReportData {
  created_at?: string;
  risk_level?: string;
  session_type?: string;
  mood_rating?: number;
  stress_level?: number;
  energy_level?: number;
  overall_wellness?: number;
  work_satisfaction?: number;
  work_life_balance?: number;
  anxiety_level?: number;
  confidence_level?: number;
  sleep_quality?: number;
  ai_analysis?: string;
  emotion_tags?: string[];
  mental_health?: HealthBlock;
  physical_health?: HealthBlock;
  overall?: OverallBlock;
}

// ── Palette ────────────────────────────────────────────────────────────────────

const P = {
  emerald:  [16, 185, 129]  as [number,number,number],
  emeraldL: [209, 250, 229] as [number,number,number],
  emeraldD: [4, 120, 87]    as [number,number,number],
  blue:     [59, 130, 246]  as [number,number,number],
  blueL:    [219, 234, 254] as [number,number,number],
  amber:    [245, 158, 11]  as [number,number,number],
  amberL:   [254, 243, 199] as [number,number,number],
  rose:     [239, 68, 68]   as [number,number,number],
  roseL:    [254, 226, 226] as [number,number,number],
  purple:   [139, 92, 246]  as [number,number,number],
  purpleL:  [237, 233, 254] as [number,number,number],
  indigo:   [99, 102, 241]  as [number,number,number],
  teal:     [20, 184, 166]  as [number,number,number],
  pink:     [236, 72, 153]  as [number,number,number],
  gray50:   [249, 250, 251] as [number,number,number],
  gray100:  [243, 244, 246] as [number,number,number],
  gray200:  [229, 231, 235] as [number,number,number],
  gray400:  [156, 163, 175] as [number,number,number],
  gray500:  [107, 114, 128] as [number,number,number],
  gray700:  [55, 65, 81]    as [number,number,number],
  gray900:  [17, 24, 39]    as [number,number,number],
  white:    [255, 255, 255] as [number,number,number],
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const tc = (doc: jsPDF, c: [number,number,number]) => doc.setTextColor(c[0],c[1],c[2]);
const fc = (doc: jsPDF, c: [number,number,number]) => doc.setFillColor(c[0],c[1],c[2]);
const dc = (doc: jsPDF, c: [number,number,number]) => doc.setDrawColor(c[0],c[1],c[2]);

function scoreColor(s: number): [number,number,number] {
  if (s >= 7) return P.emerald;
  if (s >= 5) return P.amber;
  return P.rose;
}

function riskPalette(level?: string) {
  if (level === 'high')   return { bg: P.roseL,    text: P.rose,    bar: P.rose };
  if (level === 'medium') return { bg: P.amberL,   text: P.amber,   bar: P.amber };
  return                         { bg: P.emeraldL, text: P.emerald, bar: P.emerald };
}

function safeN(v: unknown): number {
  const n = Number(v); return isFinite(n) ? n : 0;
}

function fmtDate(iso?: string) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return '—'; }
}

function fmtTime(iso?: string) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); }
  catch { return '—'; }
}

// ── Shared header / footer ─────────────────────────────────────────────────────

function pageHeader(doc: jsPDF, title: string, date: string) {
  const W = doc.internal.pageSize.getWidth();
  fc(doc, P.emeraldD); doc.rect(0, 0, W, 18, 'F');
  fc(doc, P.emerald);  doc.roundedRect(0, 0, 38, 18, 0, 0, 'F');
  tc(doc, P.white);
  doc.setFontSize(10); doc.setFont('helvetica', 'bold');
  doc.text('Diltak.ai', 7, 12);
  doc.setFontSize(9);  doc.setFont('helvetica', 'normal');
  doc.text(title, 44, 11);
  tc(doc, [209,250,229]);
  doc.setFontSize(7.5);
  doc.text(date, W - 10, 12, { align: 'right' });
}

function pageFooter(doc: jsPDF, pageNum: number, total: number) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  dc(doc, P.gray200); doc.setLineWidth(0.25);
  doc.line(10, H - 11, W - 10, H - 11, 'S');
  tc(doc, P.gray400); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
  doc.text('Confidential — Diltak.ai Wellness Platform', 10, H - 6);
  doc.text(`${pageNum} / ${total}`, W - 10, H - 6, { align: 'right' });
}

// ── Horizontal metric progress bar ────────────────────────────────────────────

function metricRow(
  doc: jsPDF, x: number, y: number, w: number,
  label: string, value: number, reason?: string,
) {
  const barX = x + 52;
  const barW = w - 52 - 20;
  const fill = Math.max(0, Math.min(1, safeN(value) / 10)) * barW;

  tc(doc, P.gray700); doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
  doc.text(label, x, y + 3);

  fc(doc, P.gray100); dc(doc, P.gray200); doc.setLineWidth(0.15);
  doc.roundedRect(barX, y, barW, 4, 1, 1, 'FD');
  if (fill > 0) { fc(doc, scoreColor(safeN(value))); doc.roundedRect(barX, y, fill, 4, 1, 1, 'F'); }

  tc(doc, scoreColor(safeN(value))); doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
  doc.text(`${safeN(value).toFixed(1)}`, x + w - 16, y + 3.5, { align: 'right' });

  if (reason) {
    tc(doc, P.gray400); doc.setFontSize(6.5); doc.setFont('helvetica', 'italic');
    const lines = doc.splitTextToSize(reason, barW + 16);
    doc.text(lines.slice(0, 2), barX, y + 9);
    return y + (lines.length > 1 ? 17 : 13);
  }
  return y + 10;
}

// ── Section title ──────────────────────────────────────────────────────────────

function sectionTitle(doc: jsPDF, x: number, y: number, w: number, label: string, accent: [number,number,number]) {
  fc(doc, accent); doc.roundedRect(x, y, w, 7.5, 1.5, 1.5, 'F');
  tc(doc, P.white); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
  doc.text(label.toUpperCase(), x + 5, y + 5.2);
  return y + 11;
}

// ── Score badge ────────────────────────────────────────────────────────────────

function scoreBadge(doc: jsPDF, x: number, y: number, score: number, label: string) {
  const col = scoreColor(score);
  const bgCol: [number,number,number] = score >= 7 ? P.emeraldL : score >= 5 ? P.amberL : P.roseL;
  fc(doc, bgCol); doc.roundedRect(x, y, 28, 20, 3, 3, 'F');
  tc(doc, col); doc.setFontSize(16); doc.setFont('helvetica', 'bold');
  doc.text(score.toFixed(1), x + 14, y + 12, { align: 'center' });
  tc(doc, P.gray500); doc.setFontSize(6.5); doc.setFont('helvetica', 'normal');
  doc.text(label, x + 14, y + 17, { align: 'center' });
}

// ── Bulleted list ──────────────────────────────────────────────────────────────

function bulletList(
  doc: jsPDF, x: number, y: number, w: number,
  items: string[], bullet: [number,number,number], numbered = false,
): number {
  items.forEach((item, i) => {
    const lines = doc.splitTextToSize(item, w - 8);
    fc(doc, bullet);
    if (numbered) {
      tc(doc, bullet); doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
      doc.text(`${i + 1}.`, x, y + 3);
    } else {
      doc.circle(x + 1.5, y + 2, 1.2, 'F');
    }
    tc(doc, P.gray700); doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
    doc.text(lines, x + 6, y + 3);
    y += lines.length * 4.5 + 2;
  });
  return y;
}

// ── Wrapped text block ─────────────────────────────────────────────────────────

function textBlock(doc: jsPDF, x: number, y: number, w: number, text: string, fontSize = 8): number {
  tc(doc, P.gray700); doc.setFontSize(fontSize); doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(text, w);
  doc.text(lines, x, y);
  return y + lines.length * (fontSize * 0.45);
}

// ── Page boundary check ────────────────────────────────────────────────────────

function needsNewPage(doc: jsPDF, curY: number, needed: number, headerFn: () => void): number {
  const H = doc.internal.pageSize.getHeight();
  if (curY + needed > H - 18) {
    doc.addPage();
    headerFn();
    return 26;
  }
  return curY;
}

// ── Main ───────────────────────────────────────────────────────────────────────

export function generateSingleReportPDF(report: SingleReportData, userName: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const MARGIN = 14;
  const CONTENT_W = W - MARGIN * 2;
  const TOTAL_PAGES = 3;

  const dateLabel = fmtDate(report.created_at);
  const timeLabel = fmtTime(report.created_at);
  const riskPal   = riskPalette(report.risk_level);

  const header = () => pageHeader(doc, `Wellness Report — ${dateLabel}`, timeLabel);
  const footer = (n: number) => pageFooter(doc, n, TOTAL_PAGES);

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 1 — OVERVIEW + CORE METRICS
  // ════════════════════════════════════════════════════════════════════════════

  header();
  let y = 24;

  // ── Cover banner ─────────────────────────────────────────────────────────
  fc(doc, P.emeraldL);
  doc.roundedRect(MARGIN, y, CONTENT_W, 22, 3, 3, 'F');
  fc(doc, P.emerald); doc.roundedRect(MARGIN, y, 4, 22, 2, 2, 'F');

  tc(doc, P.emeraldD); doc.setFontSize(13); doc.setFont('helvetica', 'bold');
  doc.text('Personal Wellness Report', MARGIN + 9, y + 9);
  tc(doc, P.gray700); doc.setFontSize(8.5); doc.setFont('helvetica', 'normal');
  doc.text(`${userName} · ${dateLabel} · ${timeLabel}`, MARGIN + 9, y + 16);

  // risk pill
  fc(doc, riskPal.bg);
  doc.roundedRect(W - MARGIN - 30, y + 5, 28, 10, 3, 3, 'F');
  tc(doc, riskPal.text); doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
  doc.text(`${(report.risk_level ?? 'low').toUpperCase()} RISK`, W - MARGIN - 16, y + 11.5, { align: 'center' });
  y += 27;

  // ── 4 score badges ───────────────────────────────────────────────────────
  const badgeW = (CONTENT_W - 9) / 4;
  [
    { label: 'Wellness', v: safeN(report.overall_wellness) },
    { label: 'Mood',     v: safeN(report.mood_rating) },
    { label: 'Energy',   v: safeN(report.energy_level) },
    { label: 'Stress',   v: 10 - safeN(report.stress_level) },
  ].forEach((b, i) => {
    const bx = MARGIN + i * (badgeW + 3);
    fc(doc, P.white); dc(doc, P.gray200); doc.setLineWidth(0.2);
    doc.roundedRect(bx, y, badgeW, 26, 2, 2, 'FD');
    fc(doc, scoreColor(b.v)); doc.roundedRect(bx, y, badgeW, 3, 2, 2, 'F');
    scoreBadge(doc, bx + (badgeW - 28) / 2, y + 4, b.v, b.label);
  });
  y += 31;

  // ── Core metrics table ───────────────────────────────────────────────────
  y = sectionTitle(doc, MARGIN, y, CONTENT_W, 'Core Metrics', P.emerald);

  const coreMetrics = [
    ['Work Satisfaction', safeN(report.work_satisfaction)],
    ['Work-Life Balance', safeN(report.work_life_balance)],
    ['Confidence',        safeN(report.confidence_level)],
    ['Sleep Quality',     safeN(report.sleep_quality)],
    ['Anxiety (inv.)',    10 - safeN(report.anxiety_level)],
    ['Energy',            safeN(report.energy_level)],
  ] as [string, number][];

  const half = Math.ceil(coreMetrics.length / 2);
  const colW = (CONTENT_W - 6) / 2;

  coreMetrics.forEach(([label, value], i) => {
    const col = i < half ? 0 : 1;
    const row = i < half ? i : i - half;
    const mx = MARGIN + col * (colW + 6);
    const my = y + row * 12;
    metricRow(doc, mx, my, colW, label, value);
  });
  y += half * 12 + 4;

  // ── Session info ─────────────────────────────────────────────────────────
  y = sectionTitle(doc, MARGIN, y, CONTENT_W, 'Session Info', P.indigo);

  const sessionItems = [
    ['Session Type', report.session_type === 'voice' ? 'Voice' : 'Chat'],
    ['Date',         dateLabel],
    ['Time',         timeLabel],
    ['Risk Level',   (report.risk_level ?? 'low').charAt(0).toUpperCase() + (report.risk_level ?? 'low').slice(1)],
  ];

  fc(doc, P.white); dc(doc, P.gray200); doc.setLineWidth(0.2);
  doc.roundedRect(MARGIN, y, CONTENT_W, sessionItems.length * 8 + 4, 2, 2, 'FD');

  sessionItems.forEach(([k, v], i) => {
    const ry = y + 5 + i * 8;
    if (i % 2 === 0) { fc(doc, P.gray50); doc.rect(MARGIN, ry - 3, CONTENT_W, 8, 'F'); }
    tc(doc, P.gray500); doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
    doc.text(k, MARGIN + 5, ry + 1);
    tc(doc, P.gray900); doc.setFont('helvetica', 'bold');
    doc.text(v, MARGIN + 55, ry + 1);
  });
  y += sessionItems.length * 8 + 8;

  // ── AI Analysis text ─────────────────────────────────────────────────────
  if (report.ai_analysis) {
    y = sectionTitle(doc, MARGIN, y, CONTENT_W, 'AI Analysis', P.blue);
    fc(doc, P.blueL); doc.roundedRect(MARGIN, y, CONTENT_W, 4, 0, 0, 'F');
    y = textBlock(doc, MARGIN + 5, y + 7, CONTENT_W - 10, report.ai_analysis, 7.5) + 6;
  }

  footer(1);

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 2 — MENTAL & PHYSICAL HEALTH ANALYSIS
  // ════════════════════════════════════════════════════════════════════════════

  doc.addPage();
  header();
  y = 24;

  if (report.mental_health) {
    y = sectionTitle(doc, MARGIN, y, CONTENT_W, '🧠  Mental Health Analysis', P.indigo);

    // score + trend + confidence row
    fc(doc, P.white); dc(doc, P.gray200); doc.setLineWidth(0.2);
    doc.roundedRect(MARGIN, y, CONTENT_W, 16, 2, 2, 'FD');

    scoreBadge(doc, MARGIN + 4, y - 1, report.mental_health.score, 'Score');
    tc(doc, P.gray700); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    doc.text(`Trend: `, MARGIN + 38, y + 7);
    tc(doc, scoreColor(report.mental_health.score));
    doc.text(report.mental_health.trend ?? '—', MARGIN + 52, y + 7);

    tc(doc, P.gray500); doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
    doc.text(`Confidence: ${(safeN(report.mental_health.confidence) * 100).toFixed(0)}%`, MARGIN + 80, y + 7);
    doc.text(`Level: ${report.mental_health.level ?? '—'}`, MARGIN + 120, y + 7);
    y += 20;

    if (report.mental_health.summary) {
      y = textBlock(doc, MARGIN, y, CONTENT_W, report.mental_health.summary, 7.5) + 5;
    }

    // mental health metrics with reasons
    Object.entries(report.mental_health.metrics ?? {}).forEach(([key, m]) => {
      y = needsNewPage(doc, y, 20, header);
      y = metricRow(doc, MARGIN, y, CONTENT_W, key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), m.score, m.reason);
      y += 2;
    });
    y += 4;
  } else {
    y = sectionTitle(doc, MARGIN, y, CONTENT_W, 'Mental Health Analysis', P.indigo);
    tc(doc, P.gray400); doc.setFontSize(8); doc.setFont('helvetica', 'italic');
    doc.text('No mental health analysis available for this report.', MARGIN + 4, y + 5);
    y += 14;
  }

  y = needsNewPage(doc, y, 40, header);

  if (report.physical_health) {
    y = sectionTitle(doc, MARGIN, y, CONTENT_W, '🫀  Physical Health Analysis', P.pink);

    fc(doc, P.white); dc(doc, P.gray200); doc.setLineWidth(0.2);
    doc.roundedRect(MARGIN, y, CONTENT_W, 16, 2, 2, 'FD');

    scoreBadge(doc, MARGIN + 4, y - 1, report.physical_health.score, 'Score');
    tc(doc, P.gray700); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    doc.text('Trend: ', MARGIN + 38, y + 7);
    tc(doc, scoreColor(report.physical_health.score));
    doc.text(report.physical_health.trend ?? '—', MARGIN + 52, y + 7);

    tc(doc, P.gray500); doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
    doc.text(`Confidence: ${(safeN(report.physical_health.confidence) * 100).toFixed(0)}%`, MARGIN + 80, y + 7);
    y += 20;

    if (report.physical_health.summary) {
      y = textBlock(doc, MARGIN, y, CONTENT_W, report.physical_health.summary, 7.5) + 5;
    }

    Object.entries(report.physical_health.metrics ?? {}).forEach(([key, m]) => {
      y = needsNewPage(doc, y, 20, header);
      y = metricRow(doc, MARGIN, y, CONTENT_W, key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), m.score, m.reason);
      y += 2;
    });
  }

  footer(2);

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 3 — OVERALL + INSIGHTS + RECOMMENDATIONS
  // ════════════════════════════════════════════════════════════════════════════

  doc.addPage();
  header();
  y = 24;

  if (report.overall) {
    const ov = report.overall;

    // Overall score row
    y = sectionTitle(doc, MARGIN, y, CONTENT_W, '⭐  Overall Wellness Score', P.emerald);

    fc(doc, P.emeraldL); doc.roundedRect(MARGIN, y, CONTENT_W, 22, 3, 3, 'F');
    scoreBadge(doc, MARGIN + 5, y + 1, ov.score, 'Overall');

    tc(doc, P.gray700); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    doc.text(`Trend: `, MARGIN + 40, y + 8);
    tc(doc, scoreColor(ov.score)); doc.text(ov.trend ?? '—', MARGIN + 54, y + 8);
    tc(doc, P.gray500); doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
    doc.text(`Priority: ${ov.priority ?? '—'}   Confidence: ${(safeN(ov.confidence) * 100).toFixed(0)}%`, MARGIN + 40, y + 14);
    y += 26;

    if (ov.summary) {
      y = textBlock(doc, MARGIN, y, CONTENT_W, ov.summary, 8) + 6;
    }

    if (ov.full_report) {
      y = sectionTitle(doc, MARGIN, y, CONTENT_W, 'Detailed Report', P.blue);
      y = needsNewPage(doc, y, 20, header);
      y = textBlock(doc, MARGIN, y, CONTENT_W, ov.full_report, 7.5) + 6;
    }

    // Key Insights
    if ((ov.key_insights ?? []).length > 0) {
      y = needsNewPage(doc, y, 20 + ov.key_insights.length * 8, header);
      y = sectionTitle(doc, MARGIN, y, CONTENT_W, '💡  Key Insights', P.amber);
      y = bulletList(doc, MARGIN + 4, y, CONTENT_W - 8, ov.key_insights, P.amber) + 5;
    }

    // Strengths
    if ((ov.strengths ?? []).length > 0) {
      y = needsNewPage(doc, y, 20 + ov.strengths.length * 8, header);
      y = sectionTitle(doc, MARGIN, y, CONTENT_W, '✅  Strengths', P.emerald);
      y = bulletList(doc, MARGIN + 4, y, CONTENT_W - 8, ov.strengths, P.emerald) + 5;
    }

    // Risks
    if ((ov.risks ?? []).length > 0) {
      y = needsNewPage(doc, y, 20 + ov.risks.length * 8, header);
      y = sectionTitle(doc, MARGIN, y, CONTENT_W, '⚠️  Risk Areas', P.rose);
      y = bulletList(doc, MARGIN + 4, y, CONTENT_W - 8, ov.risks, P.rose) + 5;
    }

    // Recommendations
    if ((ov.recommendations ?? []).length > 0) {
      y = needsNewPage(doc, y, 20 + ov.recommendations.length * 10, header);
      y = sectionTitle(doc, MARGIN, y, CONTENT_W, '🎯  Recommendations', P.purple);
      y = bulletList(doc, MARGIN + 4, y, CONTENT_W - 8, ov.recommendations, P.purple, true) + 5;
    }
  } else {
    // Emotion tags fallback
    if ((report.emotion_tags ?? []).length > 0) {
      y = sectionTitle(doc, MARGIN, y, CONTENT_W, 'Emotion Tags', P.blue);
      y = bulletList(doc, MARGIN + 4, y, CONTENT_W - 8, report.emotion_tags!, P.blue) + 5;
    }
    tc(doc, P.gray400); doc.setFontSize(8); doc.setFont('helvetica', 'italic');
    doc.text('Run AI Analysis to get detailed insights, risks, and recommendations.', MARGIN + 4, y + 5);
  }

  footer(3);

  // ── Save ──────────────────────────────────────────────────────────────────
  const dateSlug = (report.created_at ?? '').slice(0, 10);
  doc.save(`wellness_report_${dateSlug}.pdf`);
}
