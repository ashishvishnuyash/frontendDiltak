'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useUser } from '@/hooks/use-user';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Activity,
  BarChart3,
  Download,
  Loader2,
  Target,
  Clock,
  UserCheck,
  Building,
  ArrowRight,
  ArrowLeft,
  Plus,
  Sparkles,
  Heart,
  Shield,
  Zap,
  CheckCircle,
  Star,
  Eye,
  RefreshCw,
  FileText,
  BarChart2,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import type { DashboardStats, MentalHealthReport, User } from '@/types/index';
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { withAuth } from '@/components/auth/with-auth';
import ComprehensiveMetrics from '@/components/dashboard/ComprehensiveMetrics';
import { ComprehensiveReportExportService } from '@/lib/comprehensive-report-export-service';
import { PageLoader } from '@/components/loader';
import Ring from '@/components/shared/Ring';

function EmployerDashboardPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentReports, setRecentReports] = useState<MentalHealthReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!userLoading && user && user.company_id) {
      initializeDashboard();
    }
  }, [user, userLoading]);

  const initializeDashboard = async () => {
    if (!user?.company_id) return;
    try {
      setLoading(true);
      await Promise.all([
        loadDashboardStats(),
        loadRecentReports()
      ]);
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await initializeDashboard();
    setRefreshing(false);
    toast.success('Dashboard refreshed!');
  };

  const loadDashboardStats = async () => {
    if (!user?.company_id) return;

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`/api/employer/dashboard-stats?company_id=${user.company_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const backendStats = await response.json();

      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      if (backendStats.wellness_index?.trend_vs_prior_period > 0) trend = 'improving';
      if (backendStats.wellness_index?.trend_vs_prior_period < 0) trend = 'declining';

      const burnoutRiskLevels = backendStats.burnout_trend?.buckets || {};

      setStats({
        total_employees: backendStats.company_stats?.totalEmployees || 0,
        total_managers: Object.values(backendStats.company_stats?.roleBreakdown || {}).reduce((a: any, b: any) => a + b, 0),
        active_sessions: backendStats.company_stats?.activeEmployees || 0,
        completed_reports: 0,
        average_wellness_score: backendStats.wellness_index?.wellness_index ? Math.round(backendStats.wellness_index.wellness_index / 10) : 0,
        average_mood_score: backendStats.wellness_index?.engagement_score ? Math.round(backendStats.wellness_index.engagement_score / 10) : 0,
        average_stress_score: backendStats.wellness_index?.stress_score ? Math.round(backendStats.wellness_index.stress_score / 10) : 0,
        average_energy_score: backendStats.engagement_signals?.wau_pct ? Math.round(backendStats.engagement_signals.wau_pct / 10) : 0,
        high_risk_employees: backendStats.early_warnings?.alerts?.length || burnoutRiskLevels['High Risk'] || 0,
        medium_risk_employees: burnoutRiskLevels['Medium Risk'] || 0,
        low_risk_employees: burnoutRiskLevels['Low Risk'] || 0,
        wellness_trend: trend,
        department_stats: backendStats.department_comparison?.departments || {},
        weekly_reports: 0,
        participation_rate: backendStats.wellness_index?.check_in_participation_pct || 0,
        last_updated: backendStats.wellness_index?.computed_at || new Date().toISOString()
      });

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    }
  };

  const loadRecentReports = async () => {
    if (!user?.company_id) return;
    try {
      const reportsQuery = query(
        collection(db, 'mental_health_reports'),
        where('company_id', '==', user.company_id),
        orderBy('created_at', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(reportsQuery);
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MentalHealthReport[];
      setRecentReports(reportsData);
    } catch (error) {
      console.error('Error loading recent reports:', error);
    }
  };

  // if (userLoading || loading) {
  //   return <PageLoader message="Loading organization dashboard..." iconColor="text-emerald-500" />;
  // }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-6 py-6 max-w-[1400px] mx-auto space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Building className="h-6 w-6 text-emerald-500" />
            Organisation Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time mental health insights and wellness metrics for your team.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={refreshing}
            className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-600 dark:text-gray-300 h-10 px-4"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>

          <Button
            onClick={() => ComprehensiveReportExportService.exportToPDF(stats, user)}
            variant="outline"
            size="sm"
            className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-600 dark:text-gray-300 h-10 px-4"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Analysis
          </Button>

          <Link href="/employer/employees/add">
            <Button className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-4 font-semibold shadow-md shadow-emerald-500/10">
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </Link>
        </div>
      </div>

      {/* ── ROW 1: Organisation Wellness Snap ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Wellness Snap (Large Card) */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500" />
              Organisation Wellness Snap
            </h2>
            <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400">
              <Clock className="h-3 w-3" />
              Last updated: {stats?.last_updated ? new Date(stats.last_updated).toLocaleTimeString() : 'Just now'}
            </div>
          </div>

          <div className="bg-emerald-50/50 dark:bg-emerald-950/10 rounded-2xl p-8 flex items-center justify-around flex-wrap gap-8 border border-emerald-100/50 dark:border-emerald-800/10">
            <Ring value={stats?.average_mood_score || 0} color="#3B82F6" emoji="😊" label="MOOD" />
            <Ring value={stats?.average_energy_score || 0} color="#10B981" emoji="⚡" label="ENERGY" />
            <Ring value={stats?.average_stress_score || 0} color="#F59E0B" emoji="🌸" label="STRESS" />
            <Ring value={stats?.average_wellness_score || 0} color="#10B981" emoji="🌿" label="WELLNESS" />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-8 px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Team</p>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{stats?.total_employees || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <Activity className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Participation</p>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{stats?.participation_rate || 0}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Now</p>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{stats?.active_sessions || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* High Risk Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Risk Assessment
            </h2>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center text-center gap-4 py-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${stats?.high_risk_employees ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'} dark:bg-opacity-10`}>
              {stats?.high_risk_employees ? <AlertTriangle className="h-10 w-10 animate-pulse" /> : <CheckCircle className="h-10 w-10" />}
            </div>
            <div>
              <h3 className={`text-3xl font-black ${stats?.high_risk_employees ? 'text-red-500' : 'text-emerald-500'}`}>
                {stats?.high_risk_employees || 0}
              </h3>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mt-1">High Risk Cases</p>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-[200px]">
              {stats?.high_risk_employees
                ? 'Action required. Multiple employees are reporting critical levels of stress or low wellness.'
                : 'Excellent! No critical risk cases detected in your organisation currently.'}
            </p>
          </div>

          <Button variant="outline" className="w-full mt-4 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300 h-10 group">
            View Risk Analysis
            <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      {/* ── ROW 2: Comprehensive Metrics ── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-emerald-500" />
            Detailed Wellness Analysis
          </h2>
        </div>

        <ComprehensiveMetrics
          companyId={user?.company_id}
          userRole="employer"
          showExport={false}
        />
      </div>

      {/* ── ROW 3: Recent Activity & Quick Actions ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Activity */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Recent Employee Reports</h2>
            <Link href="/employer/reports" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center">
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentReports.length > 0 ? (
              recentReports.map((report) => (
                <div key={report.id} className="group flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800/60 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold text-sm">
                      {report.overall_wellness}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Report #{report.id.slice(-6)}</p>
                      <p className="text-[11px] text-gray-400">{new Date(report.created_at).toLocaleDateString()} • {new Date(report.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={report.risk_level === 'high' ? 'destructive' : 'secondary'} className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      {report.risk_level} Risk
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-3 opacity-50">
                <FileText className="h-10 w-10" />
                <p className="text-sm">No recent reports found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            {[
              { label: 'Manage Team', icon: Users, href: '/employer/employees', color: 'bg-blue-500', sub: 'View and edit team' },
              { label: 'Wellness Hub', icon: Sparkles, href: '/employer/wellness-hub', color: 'bg-emerald-500', sub: 'Resource settings' },
              { label: 'Analytics', icon: BarChart3, href: '/employer/analytics', color: 'bg-purple-500', sub: 'Deep insights' },
              { label: 'Safety Settings', icon: Shield, href: '/employer/settings', color: 'bg-amber-500', sub: 'Security & compliance' }
            ].map((action) => (
              <Link href={action.href} key={action.label}>
                <div className="group flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-md transition-all cursor-pointer">
                  <div className={`${action.color} p-2.5 rounded-xl flex-shrink-0 text-white shadow-sm shadow-black/10`}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{action.label}</p>
                    <p className="text-xs text-gray-400 group-hover:text-emerald-500 transition-colors">{action.sub}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

export default withAuth(EmployerDashboardPage, ['employer', 'admin', 'hr']);
