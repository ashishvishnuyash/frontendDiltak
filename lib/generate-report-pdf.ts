/**
 * generate-report-pdf.ts
 * Generates a detailed wellness report PDF using jsPDF + jspdf-autotable.
 * Charts are drawn with jsPDF native drawing primitives (no html2canvas).
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { MentalHealthReport } from '@/types';

// ── Colour palette ─────────────────────────────────────────────────────────────

const C = {
  emerald:  [16, 185, 129]  as [number, number, number],
  emeraldL: [209, 250, 229] as [number, number, number],
  blue:     [59, 130, 246]  as [number, number, number],
  amber:    [245, 158, 11]  as [number, number, number],
  rose:     [239, 68, 68]   as [number, number, number],
  purple:   [139, 92, 246]  as [number, number, number],
  indigo:   [99, 102, 241]  as [number, number, number],
  teal:     [20, 184, 166]  as [number, number, number],
  gray100:  [243, 244, 246] as [number, number, number],
  gray300:  [209, 213, 219] as [number, number, number],
  gray500:  [107, 114, 128] as [number, number, number],
  gray700:  [55, 65, 81]    as [number, number, number],
  gray900:  [17, 24, 39]    as [number, number, number],
  white:    [255, 255, 255] as [number, number, number],
  riskLow:  [16, 185, 129]  as [number, number, number],
  riskMed:  [245, 158, 11]  as [number, number, number],
  riskHigh: [239, 68, 68]   as [number, number, number],
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function textColor(doc: jsPDF, color: [number, number, number]) {
  doc.setTextColor(color[0], color[1], color[2]);
}
function fillColor(doc: jsPDF, color: [number, number, number]) {
  doc.setFillColor(color[0], color[1], color[2]);
}
function drawColor(doc: jsPDF, color: [number, number, number]) {
  doc.setDrawColor(color[0], color[1], color[2]);
}

function riskColor(level?: string): [number, number, number] {
  if (level === 'high')   return C.riskHigh;
  if (level === 'medium') return C.riskMed;
  return C.riskLow;
}

/** Safe number format */
function fmt(n: number | undefined | null): string {
  const v = Number(n);
  return isFinite(v) ? v.toFixed(1) : 'N/A';
}

/** Safe string upper */
function upper(s?: string | null): string {
  return (s ?? '').toUpperCase();
}

function avg(values: number[]): number {
  const valid = values.filter(v => isFinite(v));
  if (!valid.length) return 0;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function fmtDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

function safeNum(n: unknown): number {
  const v = Number(n);
  return isFinite(v) ? v : 0;
}

// ── Page header / footer ───────────────────────────────────────────────────────

function addPageHeader(doc: jsPDF, pageNum: number, totalPages: number) {
  const W = doc.internal.pageSize.getWidth();
  fillColor(doc, C.emerald);
  doc.rect(0, 0, W, 6, 'F');

  textColor(doc, C.emerald);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Diltak.ai', 14, 14);

  textColor(doc, C.gray500);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Page ${pageNum} of ${totalPages}`, W - 14, 14, { align: 'right' });

  drawColor(doc, C.gray300);
  doc.setLineWidth(0.3);
  doc.line(14, 17, W - 14, 17, 'S');
}

function addPageFooter(doc: jsPDF) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  drawColor(doc, C.gray300);
  doc.setLineWidth(0.3);
  doc.line(14, H - 12, W - 14, H - 12, 'S');
  textColor(doc, C.gray500);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Confidential — Diltak.ai Wellness Platform', 14, H - 7);
  doc.text(
    `Generated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`,
    W - 14, H - 7, { align: 'right' },
  );
}

// ── Metric box ─────────────────────────────────────────────────────────────────

function metricBox(
  doc: jsPDF,
  x: number, y: number, w: number, h: number,
  label: string, value: string, sub: string,
  accent: [number, number, number],
) {
  fillColor(doc, C.white);
  drawColor(doc, C.gray300);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 3, 3, 'FD');

  fillColor(doc, accent);
  doc.roundedRect(x, y, 3, h, 1.5, 1.5, 'F');

  textColor(doc, C.gray500);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(label.toUpperCase(), x + 7, y + 7);

  textColor(doc, C.gray900);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(value, x + 7, y + 16);

  textColor(doc, C.gray500);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(sub, x + 7, y + 22);
}

// ── Line chart ─────────────────────────────────────────────────────────────────

interface Series {
  label: string;
  color: [number, number, number];
  values: number[];
}

function lineChart(
  doc: jsPDF,
  x: number, y: number, w: number, h: number,
  labels: string[],
  series: Series[],
  title: string,
  yMax = 10,
) {
  const padL = 22, padR = 10, padT = 16, padB = 22;
  const cW = w - padL - padR;
  const cH = h - padT - padB;
  const steps = labels.length;
  const xDiv = Math.max(1, steps - 1);   // safe: never 0 or negative

  fillColor(doc, C.white);
  drawColor(doc, C.gray300);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 3, 3, 'FD');

  textColor(doc, C.gray700);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(title, x + padL, y + 10);

  if (steps === 0) {
    textColor(doc, C.gray500);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'italic');
    doc.text('No data available for this period.', x + padL, y + padT + cH / 2);
    return;
  }

  // horizontal grid lines
  const gridLines = 5;
  for (let i = 0; i <= gridLines; i++) {
    const gy = y + padT + (cH / gridLines) * i;
    const gv = yMax - (yMax / gridLines) * i;
    drawColor(doc, C.gray100);
    doc.setLineWidth(0.2);
    doc.line(x + padL, gy, x + padL + cW, gy, 'S');
    textColor(doc, C.gray500);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text(gv.toFixed(0), x + padL - 3, gy + 1, { align: 'right' });
  }

  // x-axis labels
  const labelStep = Math.max(1, Math.ceil(steps / 8));
  for (let i = 0; i < steps; i++) {
    if (i % labelStep !== 0 && i !== steps - 1) continue;
    const lx = x + padL + (cW / xDiv) * i;
    textColor(doc, C.gray500);
    doc.setFontSize(6);
    doc.text(labels[i] ?? '', lx, y + padT + cH + 8, { align: 'center' });
  }

  // series
  series.forEach(s => {
    if (!s.values.length) return;
    drawColor(doc, s.color);
    doc.setLineWidth(1.2);

    for (let i = 0; i < s.values.length - 1; i++) {
      const v0 = Math.max(0, Math.min(yMax, safeNum(s.values[i])));
      const v1 = Math.max(0, Math.min(yMax, safeNum(s.values[i + 1])));
      const x1 = x + padL + (cW / xDiv) * i;
      const y1 = y + padT + cH - (v0 / yMax) * cH;
      const x2 = x + padL + (cW / xDiv) * (i + 1);
      const y2 = y + padT + cH - (v1 / yMax) * cH;
      if ([x1, y1, x2, y2].some(n => !isFinite(n))) continue;
      doc.line(x1, y1, x2, y2, 'S');
    }

    fillColor(doc, s.color);
    s.values.forEach((v, i) => {
      const vc = Math.max(0, Math.min(yMax, safeNum(v)));
      const cx = x + padL + (cW / xDiv) * i;
      const cy = y + padT + cH - (vc / yMax) * cH;
      if (!isFinite(cx) || !isFinite(cy)) return;
      doc.circle(cx, cy, 1.2, 'F');
    });
  });

  // legend
  const legY = y + h - 6;
  let legX = x + padL;
  series.forEach(s => {
    fillColor(doc, s.color);
    doc.rect(legX, legY - 2.5, 6, 2.5, 'F');
    textColor(doc, C.gray700);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.text(s.label, legX + 8, legY);
    legX += 8 + doc.getTextWidth(s.label) + 8;
  });
}

// ── Horizontal bar chart ───────────────────────────────────────────────────────

function barChart(
  doc: jsPDF,
  x: number, y: number, w: number,
  items: { label: string; value: number; color: [number, number, number] }[],
  title: string,
  xMax = 10,
): number {
  const rowH = 11;
  const labelW = 52;
  const barAreaW = w - labelW - 32;
  const totalH = 14 + items.length * rowH + 8;

  fillColor(doc, C.white);
  drawColor(doc, C.gray300);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, totalH, 3, 3, 'FD');

  textColor(doc, C.gray700);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(title, x + 8, y + 10);

  items.forEach((item, i) => {
    const ry = y + 14 + i * rowH;
    const safeVal = isFinite(item.value) ? item.value : 0;
    const barW = Math.max(0, Math.min((safeVal / xMax) * barAreaW, barAreaW));

    textColor(doc, C.gray700);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, x + 8, ry + 5);

    fillColor(doc, C.gray100);
    doc.roundedRect(x + labelW, ry + 1, barAreaW, 5.5, 1, 1, 'F');

    if (barW > 0) {
      fillColor(doc, item.color);
      doc.roundedRect(x + labelW, ry + 1, barW, 5.5, 1, 1, 'F');
    }

    textColor(doc, C.gray700);
    doc.setFontSize(7);
    doc.text(`${safeVal.toFixed(1)}/10`, x + labelW + barAreaW + 3, ry + 5);
  });

  return totalH;
}

// ── Risk distribution bar ──────────────────────────────────────────────────────

function riskBar(
  doc: jsPDF,
  x: number, y: number, w: number,
  low: number, med: number, high: number,
) {
  const total = (low + med + high) || 1;
  const barH = 14;

  fillColor(doc, C.white);
  drawColor(doc, C.gray300);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, 34, 3, 3, 'FD');

  textColor(doc, C.gray700);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Risk Distribution', x + 8, y + 10);

  const bx = x + 8;
  const bw = w - 16;
  let cx = bx;

  ([
    [low, C.riskLow] as const,
    [med, C.riskMed] as const,
    [high, C.riskHigh] as const,
  ]).forEach(([count, color]) => {
    const seg = (count / total) * bw;
    if (seg < 0.5) { cx += seg; return; }
    fillColor(doc, color);
    doc.rect(cx, y + 14, seg, barH, 'F');
    cx += seg;
  });

  let lx = bx;
  ([
    ['Low', low, C.riskLow] as const,
    ['Medium', med, C.riskMed] as const,
    ['High', high, C.riskHigh] as const,
  ]).forEach(([label, count, color]) => {
    fillColor(doc, color);
    doc.rect(lx, y + 30, 5, 3, 'F');
    textColor(doc, C.gray700);
    doc.setFontSize(6.5);
    doc.text(`${label} (${count})`, lx + 7, y + 33);
    lx += 34;
  });
}

// ── Main export ────────────────────────────────────────────────────────────────

export function generateReportPDF(
  reports: MentalHealthReport[],
  userName: string,
  fromDate: string,
  toDate: string,
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();

  const rangeLabel =
    fromDate && toDate ? `${fmtDate(fromDate + 'T00:00:00')} – ${fmtDate(toDate + 'T23:59:59')}` :
    fromDate           ? `From ${fmtDate(fromDate + 'T00:00:00')}` :
    toDate             ? `Up to ${fmtDate(toDate + 'T23:59:59')}` : 'All Time';

  const sorted = [...reports].sort(
    (a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime(),
  );

  // ── Summary stats ─────────────────────────────────────────────────────────
  const avgMood     = avg(sorted.map(r => safeNum(r.mood_rating)));
  const avgStress   = avg(sorted.map(r => safeNum(r.stress_level)));
  const avgEnergy   = avg(sorted.map(r => safeNum(r.energy_level)));
  const avgWellness = avg(sorted.map(r => safeNum(r.overall_wellness)));
  const lowCount    = sorted.filter(r => (r.risk_level ?? '') === 'low').length;
  const medCount    = sorted.filter(r => (r.risk_level ?? '') === 'medium').length;
  const highCount   = sorted.filter(r => (r.risk_level ?? '') === 'high').length;

  // ── AI metrics ────────────────────────────────────────────────────────────
  const withMetrics = sorted.filter(r => r.metrics);
  const metricKeys = [
    'emotional_tone', 'stress_anxiety', 'motivation_engagement',
    'social_connectedness', 'self_esteem', 'assertiveness',
    'work_life_balance_metric', 'cognitive_functioning',
    'emotional_regulation', 'substance_use',
  ] as const;
  const metricLabels: Record<string, string> = {
    emotional_tone:           'Emotional Tone',
    stress_anxiety:           'Stress & Anxiety',
    motivation_engagement:    'Motivation',
    social_connectedness:     'Social Connect.',
    self_esteem:              'Self-Esteem',
    assertiveness:            'Assertiveness',
    work_life_balance_metric: 'Work-Life Balance',
    cognitive_functioning:    'Cognitive Function',
    emotional_regulation:     'Emotional Regulation',
    substance_use:            'Substance Use',
  };
  const metricColors: [number, number, number][] = [
    C.emerald, C.rose, C.blue, C.teal, C.purple,
    C.indigo, C.amber, C.blue, C.teal, C.gray500,
  ];
  const metricAvgs = metricKeys.map(k =>
    withMetrics.length
      ? avg(withMetrics.map(r => safeNum((r.metrics as Record<string, unknown>)?.[k])))
      : 0,
  );

  const chartLabels = sorted.map(r =>
    new Date(r.created_at ?? Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
  );

  const totalPages = 3 + (sorted.length > 0 ? 1 : 0);

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 1 — COVER + SUMMARY + TREND CHART
  // ════════════════════════════════════════════════════════════════════════════

  addPageHeader(doc, 1, totalPages);

  fillColor(doc, C.emeraldL);
  doc.roundedRect(14, 22, W - 28, 26, 3, 3, 'F');

  textColor(doc, C.emerald);
  doc.setFontSize(17);
  doc.setFont('helvetica', 'bold');
  doc.text('Wellness Report', 22, 34);

  textColor(doc, C.gray700);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Employee: ${userName}`, 22, 41);
  doc.text(`Period: ${rangeLabel}`, 22, 46);

  textColor(doc, C.gray500);
  doc.setFontSize(8);
  doc.text(`Total Reports: ${sorted.length}`, W - 28, 41, { align: 'right' });
  doc.text(`Avg Wellness: ${avgWellness.toFixed(1)}/10`, W - 28, 46, { align: 'right' });

  const boxW = (W - 28 - 9) / 4;
  const boxH = 30;
  metricBox(doc, 14,                  54, boxW, boxH, 'Avg Mood',     avgMood.toFixed(1),     'out of 10', C.blue);
  metricBox(doc, 14 + boxW + 3,       54, boxW, boxH, 'Avg Stress',   avgStress.toFixed(1),   'out of 10', C.rose);
  metricBox(doc, 14 + (boxW + 3) * 2, 54, boxW, boxH, 'Avg Energy',   avgEnergy.toFixed(1),   'out of 10', C.amber);
  metricBox(doc, 14 + (boxW + 3) * 3, 54, boxW, boxH, 'Avg Wellness', avgWellness.toFixed(1), 'out of 10', C.emerald);

  riskBar(doc, 14, 90, W - 28, lowCount, medCount, highCount);

  lineChart(
    doc, 14, 130, W - 28, 70, chartLabels,
    [
      { label: 'Mood',     color: C.blue,    values: sorted.map(r => safeNum(r.mood_rating)) },
      { label: 'Stress',   color: C.rose,    values: sorted.map(r => safeNum(r.stress_level)) },
      { label: 'Energy',   color: C.amber,   values: sorted.map(r => safeNum(r.energy_level)) },
      { label: 'Wellness', color: C.emerald, values: sorted.map(r => safeNum(r.overall_wellness)) },
    ],
    'Wellness Trends Over Time',
  );

  const coreItems = [
    { label: 'Work Satisfaction', value: avg(sorted.map(r => safeNum(r.work_satisfaction))), color: C.purple },
    { label: 'Work-Life Balance',  value: avg(sorted.map(r => safeNum(r.work_life_balance))),  color: C.teal },
    { label: 'Anxiety Level',      value: avg(sorted.map(r => safeNum(r.anxiety_level))),      color: C.rose },
    { label: 'Confidence',         value: avg(sorted.map(r => safeNum(r.confidence_level))),   color: C.indigo },
    { label: 'Sleep Quality',      value: avg(sorted.map(r => safeNum(r.sleep_quality))),      color: C.blue },
  ];
  barChart(doc, 14, 206, W - 28, coreItems, 'Core Metrics (Average)');

  addPageFooter(doc);

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 2 — AI METRICS + SESSION BREAKDOWN
  // ════════════════════════════════════════════════════════════════════════════

  doc.addPage();
  addPageHeader(doc, 2, totalPages);

  let p2Y = 22;
  if (withMetrics.length > 0) {
    const aiItems = metricKeys.map((k, i) => ({
      label: metricLabels[k],
      value: metricAvgs[i],
      color: metricColors[i],
    }));
    const h = barChart(doc, 14, p2Y, W - 28, aiItems, 'AI-Analysed Metrics (Average Across Period)');
    p2Y += h + 6;
  } else {
    fillColor(doc, C.gray100);
    doc.roundedRect(14, p2Y, W - 28, 20, 3, 3, 'F');
    textColor(doc, C.gray500);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('AI metric data not available for this report set.', 22, p2Y + 12);
    p2Y += 26;
  }

  // session breakdown
  const textCount  = sorted.filter(r => (r.session_type ?? 'text') === 'text').length;
  const voiceCount = sorted.filter(r => r.session_type === 'voice').length;

  fillColor(doc, C.white);
  drawColor(doc, C.gray300);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, p2Y, W - 28, 28, 3, 3, 'FD');

  textColor(doc, C.gray700);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Session Breakdown', 22, p2Y + 10);

  const sTotal = sorted.length || 1;
  const sItems = [
    { label: `Chat (${textCount})`,   pct: textCount / sTotal,  color: C.emerald },
    { label: `Voice (${voiceCount})`, pct: voiceCount / sTotal, color: C.blue },
  ];
  const sbx = 22;
  const sbw = W - 44;
  let scx = sbx;
  sItems.forEach(s => {
    const sw = s.pct * sbw;
    if (sw < 0.5) { scx += sw; return; }
    fillColor(doc, s.color);
    doc.roundedRect(scx, p2Y + 14, sw, 8, 1, 1, 'F');
    scx += sw;
  });
  let slx = sbx;
  sItems.forEach(s => {
    fillColor(doc, s.color);
    doc.rect(slx, p2Y + 24, 5, 3, 'F');
    textColor(doc, C.gray700);
    doc.setFontSize(7);
    doc.text(s.label, slx + 7, p2Y + 27);
    slx += 40;
  });
  p2Y += 34;

  if (withMetrics.length > 1) {
    lineChart(
      doc, 14, p2Y, W - 28, 65, chartLabels,
      [
        { label: 'Emotional Tone',   color: C.emerald, values: sorted.map(r => safeNum(r.metrics?.emotional_tone)) },
        { label: 'Stress & Anxiety', color: C.rose,    values: sorted.map(r => safeNum(r.metrics?.stress_anxiety)) },
        { label: 'Motivation',       color: C.blue,    values: sorted.map(r => safeNum(r.metrics?.motivation_engagement)) },
        { label: 'Social Connect.',  color: C.purple,  values: sorted.map(r => safeNum(r.metrics?.social_connectedness)) },
      ],
      'AI Metrics Trend Over Time',
    );
  }

  addPageFooter(doc);

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 3 — FULL REPORTS TABLE
  // ════════════════════════════════════════════════════════════════════════════

  doc.addPage();
  addPageHeader(doc, 3, totalPages);

  textColor(doc, C.gray700);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('All Reports', 14, 26);

  textColor(doc, C.gray500);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${sorted.length} record${sorted.length !== 1 ? 's' : ''} · ${rangeLabel}`, 14, 32);

  autoTable(doc, {
    startY: 36,
    head: [['Date', 'Time', 'Risk', 'Mood', 'Stress', 'Energy', 'Wellness', 'Satisfaction', 'Sleep', 'Session']],
    body: sorted.map(r => [
      fmtDate(r.created_at),
      (() => { try { return new Date(r.created_at ?? '').toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); } catch { return '—'; } })(),
      upper(r.risk_level),
      fmt(r.mood_rating),
      fmt(r.stress_level),
      fmt(r.energy_level),
      fmt(r.overall_wellness),
      fmt(r.work_satisfaction),
      fmt(r.sleep_quality),
      r.session_type === 'voice' ? 'Voice' : 'Chat',
    ]),
    styles: { fontSize: 7.5, cellPadding: 2.5, lineColor: [229, 231, 235] as [number,number,number], lineWidth: 0.2 },
    headStyles: { fillColor: C.emerald, textColor: [255, 255, 255] as [number,number,number], fontStyle: 'bold', fontSize: 7.5 },
    alternateRowStyles: { fillColor: [249, 250, 251] as [number,number,number] },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 2) {
        const val = String(data.cell.raw ?? '').toLowerCase();
        data.cell.styles.textColor =
          val === 'high' ? '#EF4444' : val === 'medium' ? '#F59E0B' : '#10B981';
        data.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { left: 14, right: 14 },
    willDrawPage: () => { addPageHeader(doc, 3, totalPages); },
  });

  addPageFooter(doc);

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 4 — PER-REPORT DETAIL CARDS
  // ════════════════════════════════════════════════════════════════════════════

  if (sorted.length > 0) {
    doc.addPage();
    addPageHeader(doc, 4, totalPages);

    textColor(doc, C.gray700);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Per-Report Detail', 14, 26);

    let curY = 32;
    const cardH = 46;
    const cardGap = 4;

    for (const r of sorted) {
      if (curY + cardH > doc.internal.pageSize.getHeight() - 18) {
        addPageFooter(doc);
        doc.addPage();
        addPageHeader(doc, 4, totalPages);
        curY = 26;
      }

      const rLevel = r.risk_level ?? 'low';

      // card
      fillColor(doc, C.white);
      drawColor(doc, C.gray300);
      doc.setLineWidth(0.2);
      doc.roundedRect(14, curY, W - 28, cardH, 2, 2, 'FD');

      // risk side bar
      fillColor(doc, riskColor(rLevel));
      doc.roundedRect(14, curY, 3, cardH, 1, 1, 'F');

      // date
      textColor(doc, C.gray700);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(fmtDate(r.created_at), 22, curY + 7);

      // time · session
      textColor(doc, C.gray500);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      const timeStr = (() => { try { return new Date(r.created_at ?? '').toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); } catch { return '—'; } })();
      doc.text(`${timeStr}  ·  ${r.session_type === 'voice' ? 'Voice' : 'Chat'}`, 22, curY + 13);

      // risk badge
      const rCol = riskColor(rLevel);
      fillColor(doc, rCol);
      doc.roundedRect(W - 44, curY + 4, 28, 7, 2, 2, 'F');
      textColor(doc, C.white);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(upper(rLevel), W - 30, curY + 9, { align: 'center' });

      // metric bars
      const metrics1 = [
        { l: 'Mood',     v: safeNum(r.mood_rating),     c: C.blue },
        { l: 'Stress',   v: safeNum(r.stress_level),    c: C.rose },
        { l: 'Energy',   v: safeNum(r.energy_level),    c: C.amber },
        { l: 'Wellness', v: safeNum(r.overall_wellness), c: C.emerald },
      ];

      const colW1 = (W - 28) / 4;
      metrics1.forEach((m, i) => {
        const mx = 14 + i * colW1;
        const my = curY + 19;
        const trackW = colW1 - 8;
        const barW = Math.max(0, Math.min(1, m.v / 10)) * trackW;

        fillColor(doc, C.gray100);
        drawColor(doc, C.gray300);
        doc.setLineWidth(0.15);
        doc.roundedRect(mx + 4, my, trackW, 3, 1, 1, 'FD');

        if (barW > 0) {
          fillColor(doc, m.c);
          doc.roundedRect(mx + 4, my, barW, 3, 1, 1, 'F');
        }

        textColor(doc, C.gray700);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.text(m.l, mx + 4, my + 8);

        textColor(doc, C.gray500);
        doc.setFontSize(6.5);
        doc.text(`${m.v.toFixed(1)}/10`, mx + 4, my + 13);
      });

      // AI analysis snippet
      if (r.ai_analysis) {
        const snippet = r.ai_analysis.slice(0, 140) + (r.ai_analysis.length > 140 ? '…' : '');
        textColor(doc, C.gray500);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'italic');
        const lines = doc.splitTextToSize(snippet, W - 46);
        doc.text(lines.slice(0, 2), 22, curY + 39);
      }

      curY += cardH + cardGap;
    }

    addPageFooter(doc);
  }

  // ── save ─────────────────────────────────────────────────────────────────
  const fn = `wellness_report_${(fromDate || 'all').replace(/-/g, '')}_${(toDate || 'all').replace(/-/g, '')}.pdf`;
  doc.save(fn);
}
