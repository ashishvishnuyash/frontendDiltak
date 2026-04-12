'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { withAuth } from '@/components/auth/with-auth';
import { BrandLoader } from '@/components/loader';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts';
import {
  ArrowLeft, Download, MessageSquare, Mic, Calendar,
  Clock, TrendingUp, TrendingDown, Minus, AlertTriangle,
  CheckCircle, Brain, Heart, Zap, Shield,
} from 'lucide-react';
import type { MentalHealthReport } from '@/types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MetricDetail {
  score: number;
  level: string;
  reason: string;
  weight: number;
}

interface HealthBlock {
  score: number;
  level: string;
  confidence: number;
  trend: string;
  summary: string;
  metrics: Record<string, MetricDetail>;
}

interface OverallBlock {
  score: number;
  level: string;
  confidence: number;
  trend: string;
  priority: string;
  summary: string;
  full_report: string;
  key_insights: string[];
  strengths: string[];
  risks: string[];
  recommendations: string[];
}

interface DetailReport extends MentalHealthReport {
  ai_analysis?: string;
  emotion_tags?: string[];
  conversation_metrics?: {
    totalMessages: number;
    userMessages: number;
    aiMessages: number;
  };
  // Rich blocks from /api/chat_wrapper/analyze
  mental_health?: HealthBlock;
  physical_health?: HealthBlock;
  overall?: OverallBlock;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function riskColor(level: string) {
  if (level === 'high') return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', bar: '#ef4444' };
  if (level === 'medium') return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', bar: '#f59e0b' };
  return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', bar: '#10b981' };
}

function scoreColor(score: number) {
  if (score >= 7) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 5) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
}

function scoreBarColor(score: number) {
  if (score >= 7) return '#10b981';
  if (score >= 5) return '#f59e0b';
  return '#ef4444';
}

function TrendIcon({ v }: { v: number }) {
  if (v >= 7) return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
  if (v <= 4) return <TrendingDown className="h-3.5 w-3.5 text-red-400" />;
  return <Minus className="h-3.5 w-3.5 text-gray-400" />;
}

function MetricCard({ label, value, max = 10, icon }: { label: string; value: number; max?: number; icon: React.ReactNode }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
          {icon}
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendIcon v={value} />
          <span className={`text-lg font-bold ${scoreColor(value)}`}>{value}</span>
          <span className="text-xs text-gray-400">/{max}</span>
        </div>
      </div>
      <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: scoreBarColor(value) }}
        />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [report, setReport] = useState<DetailReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const fetchReport = useCallback(async () => {
    if (!reportId) return;
    try {
      const snap = await getDoc(doc(db, 'mental_health_reports', reportId));
      if (snap.exists()) {
        setReport({ id: snap.id, ...snap.data() } as DetailReport);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const handleExport = async () => {
    if (!reportRef.current || !report) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW - 20;
      const imgH = (canvas.height * imgW) / canvas.width;
      const imgData = canvas.toDataURL('image/png');

      // Header
      pdf.setFillColor(16, 185, 129); // emerald-500
      pdf.rect(0, 0, pageW, 18, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Wellness Report', 10, 12);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(new Date(report.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), pageW - 10, 12, { align: 'right' });

      // Render captured content
      let y = 22;
      if (y + imgH <= pageH - 10) {
        pdf.addImage(imgData, 'PNG', 10, y, imgW, imgH);
      } else {
        // multi-page split
        let remaining = canvas.height;
        let srcY = 0;
        while (remaining > 0) {
          const sliceH = Math.min(remaining, Math.round((pageH - (y + 10)) * (canvas.width / imgW)));
          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceH;
          const ctx = sliceCanvas.getContext('2d')!;
          ctx.drawImage(canvas, 0, srcY, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
          const sliceData = sliceCanvas.toDataURL('image/png');
          const sliceImgH = (sliceH * imgW) / canvas.width;
          pdf.addImage(sliceData, 'PNG', 10, y, imgW, sliceImgH);
          remaining -= sliceH;
          srcY += sliceH;
          if (remaining > 0) { pdf.addPage(); y = 10; }
        }
      }

      pdf.save(`wellness-report-${new Date(report.created_at).toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error('Export failed:', e);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <BrandLoader color="bg-emerald-400" />;
  if (!report) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <AlertTriangle className="h-10 w-10 text-amber-400" />
      <p className="text-gray-500 dark:text-gray-400">Report not found.</p>
      <button onClick={() => router.back()} className="text-sm text-emerald-600 hover:underline">Go back</button>
    </div>
  );

  const risk = riskColor(report.risk_level);
  const date = new Date(report.created_at);

  // ── Radar data (core wellness metrics) ──────────────────────────────────────
  const radarData = [
    { subject: 'Mood', value: report.mood_rating ?? 0, fullMark: 10 },
    { subject: 'Energy', value: report.energy_level ?? 0, fullMark: 10 },
    { subject: 'Sleep', value: report.sleep_quality ?? 0, fullMark: 10 },
    { subject: 'Confidence', value: report.confidence_level ?? 0, fullMark: 10 },
    { subject: 'Work Sat.', value: report.work_satisfaction ?? 0, fullMark: 10 },
    { subject: 'Balance', value: report.work_life_balance ?? 0, fullMark: 10 },
  ];

  // ── Bar data (risk-inverted metrics) ────────────────────────────────────────
  const barData = [
    { name: 'Stress', value: report.stress_level ?? 0, inverted: true },
    { name: 'Anxiety', value: report.anxiety_level ?? 0, inverted: true },
    { name: 'Mood', value: report.mood_rating ?? 0 },
    { name: 'Energy', value: report.energy_level ?? 0 },
    { name: 'Sleep', value: report.sleep_quality ?? 0 },
    { name: 'Confidence', value: report.confidence_level ?? 0 },
    { name: 'Work', value: report.work_satisfaction ?? 0 },
    { name: 'Balance', value: report.work_life_balance ?? 0 },
  ];

  return (
    <div className="px-4 sm:px-6 py-6 max-w-4xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-base font-semibold text-gray-800 dark:text-white">Wellness Report</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} &middot; {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Download className="h-5 w-5" />
          {exporting ? 'Exporting…' : 'Export PDF'}
        </button>
      </div>

      {/* ── Printable content ── */}
      <div ref={reportRef} className="space-y-5 bg-gray-50 dark:bg-gray-950 rounded-2xl p-1">

        {/* ── Summary cards row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Overall wellness */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 col-span-2 sm:col-span-1 flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-400">Overall Wellness</span>
            <span className={`text-3xl font-bold ${scoreColor(report.overall_wellness ?? 5)}`}>{report.overall_wellness ?? '–'}</span>
            <span className="text-[10px] text-gray-400">out of 10</span>
          </div>
          {/* Risk */}
          <div className={`rounded-xl border p-4 flex flex-col gap-1 ${risk.bg} border-transparent`}>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Risk Level</span>
            <span className={`text-2xl font-bold capitalize ${risk.text}`}>{report.risk_level}</span>
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              {report.risk_level === 'low' ? <CheckCircle className="h-3 w-3 text-emerald-500" /> : <AlertTriangle className="h-3 w-3 text-amber-500" />}
              <span>Risk Assessment</span>
            </div>
          </div>
          {/* Session */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-400">Session Type</span>
            <div className="flex items-center gap-1.5 mt-1">
              {report.session_type === 'voice' ? <Mic className="h-5 w-5 text-emerald-500" /> : <MessageSquare className="h-5 w-5 text-blue-500" />}
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 capitalize">{report.session_type ?? 'Text'}</span>
            </div>
            {report.session_duration && (
              <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                <Clock className="h-3 w-3" />
                <span>{Math.floor(report.session_duration / 60)}m {report.session_duration % 60}s</span>
              </div>
            )}
          </div>
          {/* Date */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-400">Generated</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Calendar className="h-5 w-5 text-purple-500" />
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
            <span className="text-[10px] text-gray-400">{date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* ── Charts row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Radar chart */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Wellness Radar</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Metric Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  formatter={(val: number, _name: string, entry: any) => [val, entry.payload.name]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={32}>
                  {barData.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={
                        entry.inverted
                          ? scoreBarColor(10 - entry.value)
                          : scoreBarColor(entry.value)
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Core metric cards ── */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 px-1">Core Metrics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard label="Mood" value={report.mood_rating ?? 0} icon={<Heart className="h-3.5 w-3.5 text-pink-400" />} />
            <MetricCard label="Energy" value={report.energy_level ?? 0} icon={<Zap className="h-3.5 w-3.5 text-amber-400" />} />
            <MetricCard label="Sleep Quality" value={report.sleep_quality ?? 0} icon={<Shield className="h-3.5 w-3.5 text-blue-400" />} />
            <MetricCard label="Confidence" value={report.confidence_level ?? 0} icon={<CheckCircle className="h-3.5 w-3.5 text-emerald-400" />} />
            <MetricCard label="Work Satisfaction" value={report.work_satisfaction ?? 0} icon={<Brain className="h-3.5 w-3.5 text-purple-400" />} />
            <MetricCard label="Work-Life Balance" value={report.work_life_balance ?? 0} icon={<TrendingUp className="h-3.5 w-3.5 text-teal-400" />} />
            <MetricCard label="Stress Level" value={10 - (report.stress_level ?? 5)} icon={<AlertTriangle className="h-3.5 w-3.5 text-red-400" />} />
            <MetricCard label="Anxiety Level" value={10 - (report.anxiety_level ?? 5)} icon={<Minus className="h-3.5 w-3.5 text-orange-400" />} />
          </div>
        </div>

        {/* ── AI Analysis ── */}
        {report.ai_analysis && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">AI Analysis</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{report.ai_analysis}</p>
          </div>
        )}

        {/* ── Key insights ── */}
        {report.emotion_tags && report.emotion_tags.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30 p-5">
            <h3 className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-3">Key Insights</h3>
            <ul className="space-y-2">
              {report.emotion_tags.map((insight, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-300">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Strengths & Risks (from overall block) ── */}
        {report.overall && (report.overall.strengths?.length > 0 || report.overall.risks?.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {report.overall.strengths?.length > 0 && (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30 p-5">
                <h3 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5" /> Strengths
                </h3>
                <ul className="space-y-2">
                  {report.overall.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-emerald-800 dark:text-emerald-300">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {report.overall.risks?.length > 0 && (
              <div className="bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30 p-5">
                <h3 className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" /> Risk Areas
                </h3>
                <ul className="space-y-2">
                  {report.overall.risks.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-800 dark:text-red-300">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ── Recommendations (from overall block) ── */}
        {(report.overall?.recommendations?.length ?? 0) > 0 && (
          <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/30 p-5">
            <h3 className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" /> Recommendations
            </h3>
            <ul className="space-y-2">
              {report.overall?.recommendations?.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-purple-800 dark:text-purple-300">
                  <span className="mt-1.5 font-bold text-purple-400 text-xs leading-none">{i + 1}.</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Mental Health Deep-Dive ── */}
        {report.mental_health?.metrics && Object.keys(report.mental_health.metrics).length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                <Brain className="h-3.5 w-3.5 text-indigo-400" /> Mental Health Analysis
              </h3>
              <span className={`text-xs font-bold ${scoreColor(report.mental_health.score)}`}>
                {report.mental_health.score.toFixed(1)}/10 · <span className="capitalize">{report.mental_health.trend}</span>
              </span>
            </div>
            {report.mental_health.summary && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">{report.mental_health.summary}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(report.mental_health.metrics).map(([key, m]) => (
                <div key={key} className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className={`text-sm font-bold ${scoreColor(m.score)}`}>{m.score.toFixed(1)}</span>
                  </div>
                  <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(m.score / 10) * 100}%`, backgroundColor: scoreBarColor(m.score) }}
                    />
                  </div>
                  {m.reason && <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-snug">{m.reason}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Physical Health Deep-Dive ── */}
        {report.physical_health?.metrics && Object.keys(report.physical_health.metrics).length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-pink-400" /> Physical Health Analysis
              </h3>
              <span className={`text-xs font-bold ${scoreColor(report.physical_health.score)}`}>
                {report.physical_health.score.toFixed(1)}/10 · <span className="capitalize">{report.physical_health.trend}</span>
              </span>
            </div>
            {report.physical_health.summary && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">{report.physical_health.summary}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(report.physical_health.metrics).map(([key, m]) => (
                <div key={key} className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className={`text-sm font-bold ${scoreColor(m.score)}`}>{m.score.toFixed(1)}</span>
                  </div>
                  <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(m.score / 10) * 100}%`, backgroundColor: scoreBarColor(m.score) }}
                    />
                  </div>
                  {m.reason && <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-snug">{m.reason}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Session stats ── */}
        {report.conversation_metrics && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Session Stats</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{report.conversation_metrics.totalMessages ?? '–'}</p>
                <p className="text-xs text-gray-400 mt-0.5">Total Messages</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{report.conversation_metrics.userMessages ?? '–'}</p>
                <p className="text-xs text-gray-400 mt-0.5">Your Messages</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{report.conversation_metrics.aiMessages ?? '–'}</p>
                <p className="text-xs text-gray-400 mt-0.5">AI Responses</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <p className="text-[10px] text-center text-gray-400 dark:text-gray-600 pb-2">
          This report is AI-generated and confidential · Wellness AI Companion
        </p>
      </div>
    </div>
  );
}

export default withAuth(ReportDetailPage, ['employee']);
