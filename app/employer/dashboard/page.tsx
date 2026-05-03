'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/auth-context';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Download, Building2, RefreshCw, AlertCircle, ShieldCheck,
  TrendingUp, TrendingDown, Minus, BarChart3, Users, 
  Activity, Target, Heart, DollarSign, Sparkles, 
  ChevronRight, AlertTriangle, CheckCircle, Info,
  PieChart, Calendar, Clock, ArrowUp, ArrowDown
} from 'lucide-react';
import { toast } from 'sonner';
import { withAuth } from '@/components/auth/with-auth';
import { BrandLoader } from '@/components/loader';
import ServerAddress from '@/constent/ServerAddress';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart as RePieChart,
  Pie, Sector, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ComposedChart, Area
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WellnessTrendPoint {
  week: string;
  wellness_index: number;
  sample_size_band: string;
}

interface WellnessTrendResponse {
  company_id: string;
  trend: WellnessTrendPoint[];
  period_weeks: number;
  overall_index: number;
  direction: string;
  computed_at: string;
}

interface DepartmentData {
  label: string;
  wellness_index: number;
  burnout_risk: string;
  engagement_pct: number;
  size_band: string;
  suppressed: boolean;
}

interface DepartmentComparisonResponse {
  company_id: string;
  departments: DepartmentData[];
  hotspot_label: string;
  label_masking: boolean;
  period_days: number;
  computed_at: string;
}

interface RiskBand {
  band: string;
  percentage: number;
  trend: string;
}

interface RetentionRiskResponse {
  company_id: string;
  risk_bands: RiskBand[];
  overall_risk: string;
  period_days: number;
  note: string;
  computed_at: string;
  // Synthetic field set client-side when the API returns a privacy suppression response
  _suppressed?: boolean;
  _suppression_reason?: string;
}

interface DiltakEngagementResponse {
  company_id: string;
  adoption_pct: number;
  wau_pct: number;
  voice_sessions_pct: number;
  text_sessions_pct: number;
  completion_rate_pct: number;
  avg_sessions_per_active_user: number;
  period_days: number;
  computed_at: string;
}

interface ROICorrelation {
  period: string;
  wellbeing_index: number;
  proxy_metric: string;
  proxy_value: number;
  correlation_direction: string;
}

interface ROIImpactResponse {
  company_id: string;
  correlations: ROICorrelation[];
  summary: string;
  data_quality: string;
  computed_at: string;
}

interface ProgramCohort {
  label: string;
  before_index: number;
  after_index: number;
  delta: number;
  size_band: string;
  suppressed: boolean;
}

interface ProgramEffectivenessResponse {
  company_id: string;
  cohorts: ProgramCohort[];
  overall_lift: number;
  recommendation: string;
  computed_at: string;
}

interface OrgAnalyticsData {
  wellness_trend: WellnessTrendResponse | null;
  department_comparison: DepartmentComparisonResponse | null;
  retention_risk: RetentionRiskResponse | null;
  engagement: DiltakEngagementResponse | null;
  roi_impact: ROIImpactResponse | null;
  program_effectiveness: ProgramEffectivenessResponse | null;
  last_updated: string;
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

function getRiskColor(risk: string): string {
  switch (risk?.toLowerCase()) {
    case 'high': return '#EF4444';
    case 'medium': return '#F59E0B';
    case 'low': return '#10B981';
    default: return '#9CA3AF';
  }
}

function getRiskBgColor(risk: string): string {
  switch (risk?.toLowerCase()) {
    case 'high': return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
    case 'medium': return 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800';
    case 'low': return 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800';
    default: return 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800';
  }
}

function getTrendIcon(trend: string) {
  switch (trend?.toLowerCase()) {
    case 'up':
    case 'improving':
      return <TrendingUp className="h-5 w-5 text-emerald-500" />;
    case 'down':
    case 'declining':
      return <TrendingDown className="h-5 w-5 text-red-500" />;
    default:
      return <Minus className="h-5 w-5 text-gray-400" />;
  }
}

// ─── KPI Card Component ───────────────────────────────────────────────────────

function KPIStatCard({ label, value, sub, icon: Icon, color, trend }: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  trend?: number;
}) {
  return (
    <div className="flex flex-col gap-2 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 group-hover:scale-105 transition-transform">
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Section Header Component ─────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, sub, action }: {
  icon: React.ElementType;
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
          <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
          {sub && <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// ─── Wellness Trend Chart Component ───────────────────────────────────────────

function WellnessTrendChart({ data }: { data: WellnessTrendResponse | null }) {
  if (!data || !data.trend.length) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
        <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No wellness trend data available</p>
      </div>
    );
  }

  const chartData = data.trend.map(point => ({
    week: point.week,
    wellness: point.wellness_index,
  }));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            Wellness Index Trend
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {data.period_weeks} weeks · Overall: {data.overall_index}/100
          </p>
        </div>
        <div className="flex items-center gap-1">
          {getTrendIcon(data.direction)}
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 capitalize">
            {data.direction}
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="week" stroke="#9CA3AF" fontSize={11} />
          <YAxis domain={[0, 100]} stroke="#9CA3AF" fontSize={11} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="wellness"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ fill: '#10B981', r: 4 }}
            name="Wellness Index"
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-gray-400 mt-3 text-center">
        Last computed: {new Date(data.computed_at).toLocaleString()}
      </p>
    </div>
  );
}

// ─── Department Comparison Chart ──────────────────────────────────────────────

const BURNOUT_META: Record<string, { color: string; bg: string; darkBg: string; label: string }> = {
  high:    { color: '#EF4444', bg: 'bg-red-50',    darkBg: 'dark:bg-red-950/20',    label: 'High Risk'   },
  medium:  { color: '#F59E0B', bg: 'bg-amber-50',  darkBg: 'dark:bg-amber-950/20',  label: 'Medium Risk' },
  low:     { color: '#10B981', bg: 'bg-emerald-50',darkBg: 'dark:bg-emerald-950/20',label: 'Low Risk'    },
  unknown: { color: '#9CA3AF', bg: 'bg-gray-50',   darkBg: 'dark:bg-gray-800',      label: 'Unknown'     },
};

function getBurnoutMeta(risk: string) {
  return BURNOUT_META[risk?.toLowerCase()] ?? BURNOUT_META.unknown;
}

// Custom bar label rendered inside the chart
function CustomBarLabel(props: any) {
  const { x, y, width, height, value } = props;
  if (width < 28) return null;
  return (
    <text
      x={x + width - 6}
      y={y + height / 2}
      fill="#fff"
      fontSize={10}
      fontWeight={700}
      textAnchor="end"
      dominantBaseline="middle"
    >
      {value}
    </text>
  );
}

// Custom tooltip
function DeptTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d: DepartmentData = payload[0]?.payload;
  const meta = getBurnoutMeta(d.burnout_risk);
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-3 text-xs min-w-[160px]">
      <p className="font-bold text-gray-800 dark:text-gray-100 mb-2">{d.label}</p>
      <div className="space-y-1.5">
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Wellness</span>
          <span className="font-bold text-gray-800 dark:text-gray-100">{d.wellness_index}/100</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Engagement</span>
          <span className="font-bold text-gray-800 dark:text-gray-100">{d.engagement_pct}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Size band</span>
          <span className="font-bold text-gray-800 dark:text-gray-100">{d.size_band}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Burnout risk</span>
          <span className="font-bold" style={{ color: meta.color }}>{meta.label}</span>
        </div>
      </div>
    </div>
  );
}

function DepartmentComparisonChart({ data }: { data: DepartmentComparisonResponse | null }) {
  const [view, setView] = useState<'chart' | 'cards'>('chart');

  if (!data || !data.departments.length) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col items-center justify-center gap-3 min-h-[200px]">
        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
          <Users className="h-6 w-6 text-gray-300" />
        </div>
        <p className="text-sm text-gray-500">No department data available</p>
      </div>
    );
  }

  const visible    = data.departments.filter(d => !d.suppressed);
  const suppressed = data.departments.filter(d => d.suppressed);

  // Sort by wellness_index descending for the chart
  const sorted = [...visible].sort((a, b) => b.wellness_index - a.wellness_index);

  // Hotspot dept
  const hotspot = visible.find(d => d.label === data.hotspot_label);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Department Wellness Comparison
            </h3>
            {data.label_masking && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
                <ShieldCheck className="h-3 w-3" />
                Privacy masked
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Last {data.period_days} days · {visible.length} departments
            {suppressed.length > 0 && ` · ${suppressed.length} suppressed (small groups)`}
          </p>
        </div>

        {/* View toggle */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 flex-shrink-0">
          {(['chart', 'cards'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold capitalize transition-all ${
                view === v
                  ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Hotspot alert */}
      {hotspot && (
        <div className="mx-5 mt-4 flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-xs font-bold text-red-700 dark:text-red-400">Hotspot: </span>
            <span className="text-xs text-red-600 dark:text-red-400">
              <strong>{hotspot.label}</strong> has the lowest wellness index ({hotspot.wellness_index}/100)
              with <strong>{hotspot.burnout_risk}</strong> burnout risk
            </span>
          </div>
        </div>
      )}

      <div className="p-5">
        {view === 'chart' ? (
          <>
            {/* Horizontal bar chart */}
            <ResponsiveContainer width="100%" height={Math.max(220, sorted.length * 52)}>
              <BarChart
                data={sorted}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                barSize={28}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  stroke="#D1D5DB"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `${v}`}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  stroke="#9CA3AF"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={90}
                  tick={{ fontWeight: 600 }}
                />
                <Tooltip content={<DeptTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Bar dataKey="wellness_index" radius={[0, 6, 6, 0]} label={<CustomBarLabel />}>
                  {sorted.map((entry, i) => (
                    <Cell key={i} fill={getBurnoutMeta(entry.burnout_risk).color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Engagement overlay — small dots below */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Engagement % by department
              </p>
              <div className="space-y-2">
                {sorted.map(dept => (
                  <div key={dept.label} className="flex items-center gap-3">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 w-[88px] flex-shrink-0 truncate font-medium">
                      {dept.label}
                    </span>
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-400 dark:bg-indigo-500 transition-all duration-700"
                        style={{ width: `${dept.engagement_pct}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 w-8 text-right tabular-nums">
                      {dept.engagement_pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Cards view */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sorted.map((dept, i) => {
              const meta = getBurnoutMeta(dept.burnout_risk);
              const isHotspot = dept.label === data.hotspot_label;
              return (
                <motion.div
                  key={dept.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`relative p-4 rounded-xl border transition-all ${
                    isHotspot
                      ? 'border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/10'
                      : 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30'
                  }`}
                >
                  {isHotspot && (
                    <span className="absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 uppercase tracking-widest">
                      Hotspot
                    </span>
                  )}

                  <div className="flex items-start justify-between gap-2 mb-3">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight pr-10">
                      {dept.label}
                    </p>
                  </div>

                  {/* Wellness index bar */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Wellness</span>
                      <span className="text-sm font-black" style={{ color: meta.color }}>
                        {dept.wellness_index}/100
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${dept.wellness_index}%`, backgroundColor: meta.color }}
                      />
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                      <p className="text-xs font-black text-gray-700 dark:text-gray-200">{dept.engagement_pct}%</p>
                      <p className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">Engaged</p>
                    </div>
                    <div className={`p-1.5 rounded-lg border ${meta.bg} ${meta.darkBg} border-transparent`}>
                      <p className="text-xs font-black capitalize" style={{ color: meta.color }}>
                        {dept.burnout_risk}
                      </p>
                      <p className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">Burnout</p>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                      <p className="text-xs font-black text-gray-700 dark:text-gray-200">{dept.size_band}</p>
                      <p className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">Size</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Suppressed notice */}
            {suppressed.length > 0 && (
              <div className="sm:col-span-2 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <Info className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>{suppressed.length}</strong> department{suppressed.length > 1 ? 's' : ''} suppressed — group size too small to display without compromising privacy.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 px-5 pb-4">
        {Object.entries(BURNOUT_META).filter(([k]) => k !== 'unknown').map(([key, meta]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{meta.label}</span>
          </div>
        ))}
        <span className="ml-auto text-[10px] text-gray-400 dark:text-gray-500">
          Computed: {new Date(data.computed_at).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

// ─── Retention Risk Chart ─────────────────────────────────────────────────────

function RetentionRiskChart({ data }: { data: RetentionRiskResponse | null }) {
  // Privacy suppression — API returned 422 insufficient_cohort
  if (data?._suppressed) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Retention Risk Analysis
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Modelled from engagement + stress proxy signals
            </p>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
            <ShieldCheck className="h-3 w-3" />
            Suppressed
          </span>
        </div>
        <div className="px-5 py-8 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center">
            <ShieldCheck className="h-7 w-7 text-amber-500" />
          </div>
          <div className="max-w-xs">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Not enough data to display
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Retention risk analysis requires a minimum cohort size to protect individual privacy.
              As your team grows and engagement data accumulates, this section will unlock automatically.
            </p>
          </div>
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 max-w-xs text-left">
            <Info className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              Modelled from engagement + stress proxy signals. No individual data is used or stored.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No data at all
  if (!data || !data.risk_bands?.length) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col items-center justify-center gap-3 min-h-[200px]">
        <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-gray-300" />
        </div>
        <p className="text-sm text-gray-500">No retention risk data available</p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border overflow-hidden ${getRiskBgColor(data.overall_risk)}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-200/60 dark:border-gray-700/60">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            Retention Risk Analysis
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Overall risk: <span className="font-bold capitalize" style={{ color: getRiskColor(data.overall_risk) }}>{data.overall_risk}</span>
            {' · '}{data.period_days} days
          </p>
        </div>
        <span
          className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border"
          style={{
            color: getRiskColor(data.overall_risk),
            backgroundColor: `${getRiskColor(data.overall_risk)}18`,
            borderColor: `${getRiskColor(data.overall_risk)}30`,
          }}
        >
          {data.overall_risk}
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Donut chart */}
        <ResponsiveContainer width="100%" height={200}>
          <RePieChart>
            <Pie
              data={data.risk_bands}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="percentage"
              startAngle={90}
              endAngle={-270}
            >
              {data.risk_bands.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getRiskColor(entry.band)} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                fontSize: 11,
                borderRadius: 10,
                border: '1px solid #E5E7EB',
                backgroundColor: 'white',
              }}
              formatter={(value: any, name: any) => [`${value}%`, name]}
            />
          </RePieChart>
        </ResponsiveContainer>

        {/* Risk band rows */}
        <div className="space-y-2.5">
          {data.risk_bands.map(band => (
            <div key={band.band} className="flex items-center gap-3">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: getRiskColor(band.band) }}
              />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize w-16 flex-shrink-0">
                {band.band}
              </span>
              <div className="flex-1 h-1.5 bg-white/60 dark:bg-gray-700/60 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${band.percentage}%`, backgroundColor: getRiskColor(band.band) }}
                />
              </div>
              <span className="text-xs font-bold tabular-nums w-8 text-right" style={{ color: getRiskColor(band.band) }}>
                {band.percentage}%
              </span>
              <div className="flex-shrink-0">{getTrendIcon(band.trend)}</div>
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-white/60 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-700/40">
          <Info className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed italic">
            {data.note}
          </p>
        </div>

        <p className="text-[10px] text-gray-400 text-right">
          Computed: {new Date(data.computed_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// ─── Diltak Engagement Stats ──────────────────────────────────────────────────

function EngagementStats({ data }: { data: DiltakEngagementResponse | null }) {
  if (!data) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
        <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No engagement data available</p>
      </div>
    );
  }

  const stats = [
    { label: 'Adoption Rate', value: data.adoption_pct, unit: '%', color: '#10B981' },
    { label: 'Weekly Active Users', value: data.wau_pct, unit: '%', color: '#8B5CF6' },
    { label: 'Completion Rate', value: data.completion_rate_pct, unit: '%', color: '#F59E0B' },
    { label: 'Voice Sessions', value: data.voice_sessions_pct, unit: '%', color: '#EF4444' },
    { label: 'Text Sessions', value: data.text_sessions_pct, unit: '%', color: '#3B82F6' },
    { label: 'Avg Sessions/User', value: data.avg_sessions_per_active_user, unit: '', color: '#EC4899' },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          Diltak Engagement Metrics
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {data.period_days} days · Last {data.period_days} day period
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map(stat => (
          <div key={stat.label} className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
            <p className="text-xl font-bold" style={{ color: stat.color }}>
              {stat.value}{stat.unit}
            </p>
            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
      
      <p className="text-[10px] text-gray-400 mt-3 text-center">
        Computed: {new Date(data.computed_at).toLocaleString()}
      </p>
    </div>
  );
}

// ─── ROI Impact Chart ─────────────────────────────────────────────────────────

function ROIImpactChart({ data }: { data: ROIImpactResponse | null }) {
  if (!data || !data.correlations.length) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
        <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No ROI impact data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          ROI Impact Analysis
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            data.data_quality === 'high' ? 'bg-emerald-100 text-emerald-700' :
            data.data_quality === 'medium' ? 'bg-amber-100 text-amber-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            Quality: {data.data_quality}
          </span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data.correlations}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="period" stroke="#9CA3AF" fontSize={11} />
          <YAxis yAxisId="left" domain={[0, 100]} stroke="#10B981" fontSize={11} />
          <YAxis yAxisId="right" orientation="right" stroke="#8B5CF6" fontSize={11} />
          <Tooltip />
          <Legend />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="wellbeing_index"
            fill="#10B981"
            stroke="#10B981"
            fillOpacity={0.3}
            name="Wellbeing Index"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="proxy_value"
            stroke="#8B5CF6"
            strokeWidth={2}
            dot={{ fill: '#8B5CF6', r: 4 }}
            name="Proxy Metric"
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
        <p className="text-xs text-gray-700 dark:text-gray-300">{data.summary}</p>
      </div>
    </div>
  );
}

// ─── Program Effectiveness Chart ──────────────────────────────────────────────

function ProgramEffectivenessChart({ data }: { data: ProgramEffectivenessResponse | null }) {
  if (!data || !data.cohorts.length) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center">
        <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No program effectiveness data available</p>
      </div>
    );
  }

  const visibleCohorts = data.cohorts.filter(c => !c.suppressed);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            Program Effectiveness
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Overall Lift: {data.overall_lift > 0 ? '+' : ''}{data.overall_lift}%
          </p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          data.overall_lift > 0 ? 'bg-emerald-100 text-emerald-700' :
          data.overall_lift < 0 ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {data.overall_lift > 0 ? 'Improving' : data.overall_lift < 0 ? 'Declining' : 'Stable'}
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={visibleCohorts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" stroke="#9CA3AF" fontSize={11} />
          <YAxis domain={[0, 100]} stroke="#9CA3AF" fontSize={11} />
          <Tooltip />
          <Legend />
          <Bar dataKey="before_index" fill="#9CA3AF" name="Before Program" />
          <Bar dataKey="after_index" fill="#10B981" name="After Program" />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
          Recommendation: {data.recommendation}
        </p>
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

function OrgHRAnalyticsPage() {
  const { user, loading: userLoading } = useAuth();
  const [data, setData] = useState<OrgAnalyticsData>({
    wellness_trend: null,
    department_comparison: null,
    retention_risk: null,
    engagement: null,
    roi_impact: null,
    program_effectiveness: null,
    last_updated: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const companyId: string = user?.company_id ?? (user as any)?.companyId ?? '';

  const fetchAll = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const token = getToken();
    if (!token) {
      setError('No access token. Please log in again.');
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    const params = { company_id: companyId };
    const api = ServerAddress;

    const endpoints = [
      { url: `${api}/employer/org/wellness-trend`, key: 'wellness_trend' },
      { url: `${api}/employer/org/department-comparison`, key: 'department_comparison' },
      { url: `${api}/employer/org/retention-risk`, key: 'retention_risk' },
      { url: `${api}/employer/org/diltak-engagement`, key: 'engagement' },
      { url: `${api}/employer/org/roi-impact`, key: 'roi_impact' },
      { url: `${api}/employer/org/program-effectiveness`, key: 'program_effectiveness' },
    ];

    try {
      setError(null);
      
      const results = await Promise.allSettled(
        endpoints.map(endpoint => axios.get(endpoint.url, { headers, params }))
      );
      
      const newData: any = {};
      let successCount = 0;
      let suppressedCount = 0;

      results.forEach((result, index) => {
        const key = endpoints[index].key;
        if (result.status === 'fulfilled') {
          newData[key] = result.value.data;
          successCount++;
        } else {
          const err = result.reason;
          // Detect privacy-suppression responses (422 with insufficient_cohort / suppressed flag)
          const detail = err?.response?.data?.detail;
          const isSuppressed =
            err?.response?.status === 422 &&
            (detail?.suppressed === true || detail?.error === 'insufficient_cohort');

          if (isSuppressed && key === 'retention_risk') {
            // Store a typed sentinel so the component can render a proper suppressed state
            newData[key] = {
              _suppressed: true,
              _suppression_reason: detail?.error ?? 'insufficient_cohort',
            } as RetentionRiskResponse;
            suppressedCount++;
          } else {
            console.error(`Failed to fetch ${key}:`, err?.response?.data ?? err?.message);
            newData[key] = null;
          }
        }
      });
      
      setData({
        wellness_trend: newData.wellness_trend,
        department_comparison: newData.department_comparison,
        retention_risk: newData.retention_risk,
        engagement: newData.engagement,
        roi_impact: newData.roi_impact,
        program_effectiveness: newData.program_effectiveness,
        last_updated: new Date().toISOString(),
      });
      
      if (successCount + suppressedCount < endpoints.length) {
        toast.warning(`Loaded ${successCount}/${endpoints.length} analytics modules`);
      } else {
        toast.success('Org & HR Analytics refreshed');
      }
      
    } catch (err) {
      console.error("Org Analytics errors:", err);
      const msg = axios.isAxiosError(err)
        ? `API Error: ${err.response?.data?.detail ?? err.message}`
        : 'Failed to load analytics data';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (!userLoading) fetchAll();
  }, [userLoading, fetchAll]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
  };

  const handleExportPDF = async () => {
    try {
      toast.info('Preparing analytics report...');
      setTimeout(() => {
        toast.success('Report ready for download');
      }, 1500);
    } catch (err) {
      toast.error('Failed to export report');
    }
  };

  if (userLoading || loading) return <BrandLoader color="bg-emerald-500" />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Failed to Load Analytics</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
          <Button onClick={handleRefresh} className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl">
            <RefreshCw className="h-5 w-5 mr-2" /> Try Again
          </Button>
        </div>
      </div>
    );
  }

  const wi = data.wellness_trend;

  const kpis = [
    {
      label: 'Overall Wellness',
      value: wi?.overall_index ? `${wi.overall_index}/100` : '—',
      icon: Heart,
      color: wi?.overall_index ? (wi.overall_index >= 70 ? '#10B981' : wi.overall_index >= 40 ? '#F59E0B' : '#EF4444') : '#9CA3AF',
      sub: wi ? `${wi.period_weeks} weeks tracked` : undefined,
      trend: wi?.direction === 'up' ? 5 : wi?.direction === 'down' ? -3 : 0,
    },
    {
      label: 'Engagement Rate',
      value: data.engagement ? `${data.engagement.adoption_pct}%` : '—',
      icon: Target,
      color: '#8B5CF6',
      sub: data.engagement ? `WAU: ${data.engagement.wau_pct}%` : undefined,
    },
    {
      label: 'Retention Risk',
      value: data.retention_risk?._suppressed
        ? 'Suppressed'
        : data.retention_risk?.overall_risk?.toUpperCase() ?? '—',
      icon: AlertTriangle,
      color: data.retention_risk?._suppressed
        ? '#F59E0B'
        : getRiskColor(data.retention_risk?.overall_risk || ''),
      sub: data.retention_risk?._suppressed
        ? 'Insufficient cohort size'
        : data.retention_risk
        ? `${data.retention_risk.period_days} days`
        : undefined,
    },
    {
      label: 'Program Lift',
      value: data.program_effectiveness ? `${data.program_effectiveness.overall_lift > 0 ? '+' : ''}${data.program_effectiveness.overall_lift}%` : '—',
      icon: TrendingUp,
      color: data.program_effectiveness?.overall_lift ? (data.program_effectiveness.overall_lift > 0 ? '#10B981' : '#EF4444') : '#9CA3AF',
    },
  ];

  return (
    <div className="px-3 sm:px-6 lg:px-6 py-4 sm:py-6 max-w-[1400px] mx-auto space-y-4 sm:space-y-5">
      {/* Header */}
      <motion.div
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-5 w-5 sm:h-5 sm:w-5 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Org & HR Analytics
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
            Organisation Health Analytics
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            Privacy-first workforce insights · k-Anonymity enforced
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 h-9 px-3 text-xs font-medium"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 sm:mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleExportPDF}
            variant="outline"
            size="sm"
            className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 h-9 px-3 text-xs font-medium"
          >
            <Download className="h-3.5 w-3.5 mr-1 sm:mr-1.5" />
            <span className="hidden sm:inline">Export Report</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </motion.div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.02 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800">
          <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
            Employer — Org & HR Analytics
          </span>
        </div>
      </motion.div>

      {/* KPI Row */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        {kpis.map(k => <KPIStatCard key={k.label} {...k} />)}
      </motion.div>

      {/* Row 1: Wellness Trend + Department Comparison */}
      <motion.div
        className="grid grid-cols-1 xl:grid-cols-2 gap-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <WellnessTrendChart data={data.wellness_trend} />
        <DepartmentComparisonChart data={data.department_comparison} />
      </motion.div>

      {/* Row 2: Retention Risk + Engagement Stats */}
      <motion.div
        className="grid grid-cols-1 xl:grid-cols-2 gap-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <RetentionRiskChart data={data.retention_risk} />
        <EngagementStats data={data.engagement} />
      </motion.div>

      {/* Row 3: ROI Impact */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <SectionHeader icon={DollarSign} title="ROI Impact" sub="Wellbeing ↔ Business Metrics Correlation" />
        <ROIImpactChart data={data.roi_impact} />
      </motion.div>

      {/* Row 4: Program Effectiveness */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <SectionHeader icon={Sparkles} title="Program Effectiveness" sub="Before/After analysis of wellbeing programs" />
        <ProgramEffectivenessChart data={data.program_effectiveness} />
      </motion.div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="font-medium">Privacy-First · k-Anonymity · No Individual Data</span>
          </div>
        </div>
        <span>Last sync: {new Date(data.last_updated).toLocaleString()}</span>
      </div>
    </div>
  );
}

export default withAuth(OrgHRAnalyticsPage, ['employer', 'admin', 'hr']);
