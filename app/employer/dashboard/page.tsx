'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/auth-context';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Download, Building2, RefreshCw, AlertCircle, ShieldCheck,
  Zap, Activity, BarChart3, Users, Sparkles, ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { withAuth } from '@/components/auth/with-auth';
import { BrandLoader } from '@/components/loader';
import Link from 'next/link';

import WellnessIndexHero from '@/components/employer/WellnessIndexHero';
import EarlyWarnings from '@/components/employer/EarlyWarnings';
import BurnoutTrendChart from '@/components/employer/BurnoutTrendChart';
import WorkloadFriction from '@/components/employer/WorkloadFriction';
import EngagementSignals from '@/components/employer/EngagementSignals';
import ActionEngine from '@/components/employer/ActionEngine';
import OrgWellnessTrend from '@/components/employer/OrgWellnessTrend';
import DepartmentComparison from '@/components/employer/DepartmentComparison';
import RetentionRiskSignal from '@/components/employer/RetentionRiskSignal';
import ROIImpactPanel from '@/components/employer/ROIImpactPanel';
import ProgramEffectiveness from '@/components/employer/ProgramEffectiveness';

import {
  EmployerWellnessIndex, EmployerBurnoutTrend, EmployerEngagementSignals,
  EmployerWorkloadFriction, EmployerProductivityProxy, EmployerEarlyWarnings,
  EmployerSuggestedActions,
} from '@/types';


interface DashboardData {
  wellness_index: EmployerWellnessIndex | null;
  burnout_trend: EmployerBurnoutTrend | null;
  engagement_signals: EmployerEngagementSignals | null;
  workload_friction: EmployerWorkloadFriction | null;
  productivity_proxy: EmployerProductivityProxy | null;
  early_warnings: EmployerEarlyWarnings | null;
  suggested_actions: EmployerSuggestedActions | null;
  last_updated: string;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

function KPICard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string | number; icon: React.ElementType; color: string; sub?: string;
}) {
  return (
    <div className="flex flex-col gap-3 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-700 transition-all group">
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 group-hover:scale-105 transition-transform">
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
        <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
      </div>
    </div>
  );
}

function EmployerDashboardPage() {
  const { user, loading: userLoading } = useAuth();
  const [data, setData] = useState<DashboardData>({
    wellness_index: null, burnout_trend: null, engagement_signals: null,
    workload_friction: null, productivity_proxy: null, early_warnings: null,
    suggested_actions: null, last_updated: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const companyId: string = user?.company_id ?? (user as any)?.companyId ?? '';

  const fetchAll = useCallback(async () => {
    if (!companyId) { setLoading(false); return; }
    const token = getToken();
    if (!token) { setError('No access token. Please log in again.'); setLoading(false); return; }

    try {
      setError(null);
      const res = await axios.get(`/api/employer/dashboard-stats?company_id=${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = res.data;
      setData({
        wellness_index: d.wellness_index ?? null,
        burnout_trend: d.burnout_trend ?? null,
        engagement_signals: d.engagement_signals ?? null,
        workload_friction: d.workload_friction ?? null,
        productivity_proxy: d.productivity_proxy ?? null,
        early_warnings: d.early_warnings ?? null,
        suggested_actions: d.suggested_actions ?? null,
        last_updated: d.last_updated ?? new Date().toISOString(),
      });
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? `API Error (${err.response?.status}): ${err.response?.data?.detail ?? err.message}`
        : 'Failed to load dashboard data';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [companyId]);

  useEffect(() => { if (!userLoading) fetchAll(); }, [userLoading, fetchAll]);

  const handleRefresh = async () => { setRefreshing(true); await fetchAll(); };

  if (userLoading || loading) return <BrandLoader color="bg-emerald-500" />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Failed to Load Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
          <Button onClick={handleRefresh} className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl">
            <RefreshCw className="h-5 w-5 mr-2" /> Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Company Not Linked</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your account does not have a company associated. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  const wi = data.wellness_index;
  const ew = data.early_warnings;
  const es = data.engagement_signals;
  const bt = data.burnout_trend;

  const kpis = [
    {
      label: 'Wellness Index',
      value: wi ? `${wi.wellness_index}/100` : '—',
      icon: Activity,
      color: wi ? (wi.wellness_index >= 70 ? '#10B981' : wi.wellness_index >= 40 ? '#F59E0B' : '#EF4444') : '#9CA3AF',
      sub: wi ? `${wi.trend_vs_prior_period >= 0 ? '+' : ''}${wi.trend_vs_prior_period}% vs prior` : undefined,
    },
    {
      label: 'Burnout Alert',
      value: bt?.alert_level?.toUpperCase() ?? '—',
      icon: Zap,
      color: bt?.alert_level === 'high' ? '#EF4444' : bt?.alert_level === 'medium' ? '#F59E0B' : '#10B981',
      sub: bt ? `${bt.period_weeks}w trend` : undefined,
    },
    {
      label: 'Engagement Rate',
      value: es ? `${es.check_in_completion_pct}%` : '—',
      icon: BarChart3,
      color: '#8B5CF6',
      sub: es ? `DAU ${es.dau_pct}% · WAU ${es.wau_pct}%` : undefined,
    },
    {
      label: 'Active Warnings',
      value: ew?.alerts?.length ?? '—',
      icon: AlertCircle,
      color: (ew?.alerts?.length ?? 0) > 0 ? '#F59E0B' : '#10B981',
      sub: ew ? `Overall: ${ew.overall_risk} risk` : undefined,
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-6 py-6 max-w-[1400px] mx-auto space-y-5">

      {/* ── Header ── */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-5 w-5 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Organisation Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {user?.company_name ?? (user as any)?.companyName ?? 'Company'} Insights
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            Privacy-first analytics · All data aggregated · No individual data exposed
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
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 h-9 px-3 text-xs font-medium"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export PDF
          </Button>
        </div>
      </motion.div>

      {/* ── ROW 1: KPI Strip ── */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        {kpis.map(k => <KPICard key={k.label} {...k} />)}
      </motion.div>

      {/* ── ROW 2: Wellness Hero + Early Warnings ── */}
      <motion.div
        className="grid grid-cols-1 xl:grid-cols-3 gap-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="xl:col-span-2">
          <WellnessIndexHero data={data.wellness_index ?? undefined} />
        </div>
        <div>
          <EarlyWarnings data={data.early_warnings ?? undefined} />
        </div>
      </motion.div>

      {/* ── ROW 3: Burnout + Workload ── */}
      <motion.div
        className="grid grid-cols-1 xl:grid-cols-2 gap-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <BurnoutTrendChart data={data.burnout_trend ?? undefined} />
        <WorkloadFriction data={data.workload_friction ?? undefined} />
      </motion.div>

      {/* ── ROW 4: Engagement Signals ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <SectionHeader icon={Users} title="Engagement Signals" sub="Percentages only · No individual data" />
        <EngagementSignals data={data.engagement_signals ?? undefined} />
      </motion.div>

      {/* ── ROW 5: Org Wellness Trend + Department Comparison ── */}
      <motion.div
        className="grid grid-cols-1 xl:grid-cols-2 gap-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <OrgWellnessTrend
          data={data.productivity_proxy ?? undefined}
          wellnessIndex={data.wellness_index?.wellness_index}
        />
        <DepartmentComparison />
      </motion.div>

      {/* ── ROW 6: Retention Risk + ROI Panel ── */}
      <motion.div
        className="grid grid-cols-1 xl:grid-cols-2 gap-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <RetentionRiskSignal burnoutData={data.burnout_trend ?? undefined} />
        <ROIImpactPanel
          productivityData={data.productivity_proxy ?? undefined}
          wellnessIndex={data.wellness_index?.wellness_index}
        />
      </motion.div>

      {/* ── ROW 7: Program Effectiveness ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
      >
        <SectionHeader icon={Sparkles} title="Program Effectiveness" sub="Before/After · Cohort-level analysis" />
        <ProgramEffectiveness
          wellnessIndex={data.wellness_index?.wellness_index}
          burnoutAlertLevel={data.burnout_trend?.alert_level}
        />
      </motion.div>

      {/* ── ROW 8: Action Engine ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <SectionHeader icon={Zap} title="Action Engine" sub="Insight → Recommendation → Expected Impact → Playbook" />
        <ActionEngine data={data.suggested_actions ?? undefined} />
      </motion.div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="font-medium">Privacy-First · k-Anonymity Enforced</span>
          </div>
        </div>
        <span>Last sync: {new Date(data.last_updated).toLocaleString()}</span>
      </div>

    </div>
  );
}

export default withAuth(EmployerDashboardPage, ['employer', 'admin', 'hr']);
