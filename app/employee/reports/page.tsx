'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus, RefreshCw, Download, ArrowRight, MessageSquare,
  TrendingDown, TrendingUp, Minus,
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { withAuth } from '@/components/auth/with-auth';
import type { MentalHealthReport } from '@/types';
import InteractiveAnalytics from '@/components/analytics/InteractiveAnalytics';
import { DataList } from '@/components/list/DataList';
import type { ColumnDef } from '@/components/list/DataList';
import { BrandLoader } from '@/components/loader';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UIMentalHealthReport extends MentalHealthReport {
  metrics?: {
    emotional_tone: number; stress_anxiety: number; motivation_engagement: number;
    social_connectedness: number; self_esteem: number; assertiveness: number;
    work_life_balance_metric: number; cognitive_functioning: number;
    emotional_regulation: number; substance_use: number;
  };
}

// ─── Risk badge ───────────────────────────────────────────────────────────────

function RiskBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide ${map[level] ?? map.low}`}>
      {level}
    </span>
  );
}

// ─── Trend icon ───────────────────────────────────────────────────────────────

function TrendIcon({ value }: { value: string }) {
  if (value.includes('↑') || value.toLowerCase().includes('improv')) return <TrendingUp className="h-3.5 w-3.5 text-emerald-500 inline mr-1" />;
  if (value.includes('↓') || value.toLowerCase().includes('declin')) return <TrendingDown className="h-3.5 w-3.5 text-red-400 inline mr-1" />;
  return <Minus className="h-3.5 w-3.5 text-gray-400 inline mr-1" />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function EmployeeReportsPage() {
  const { user, loading: userLoading } = useUser();
  const [reports, setReports] = useState<UIMentalHealthReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'interactive' | 'list'>('interactive');
  const router = useRouter();

  const fetchReports = useCallback(async () => {
    if (!user) return;
    try {
      setRefreshing(true);
      const snap = await getDocs(query(collection(db, 'mental_health_reports'), where('employee_id', '==', user.id)));
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as UIMentalHealthReport))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setReports(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (!userLoading && !user) { router.push('/'); return; }
    if (user) fetchReports();
  }, [user, userLoading, router, fetchReports]);

  if (userLoading || loading) {
    return <BrandLoader color="bg-emerald-400" />;
  }

  if (!user) return null;

  // ── Column definitions for DataList ──────────────────────────────────────

  const columns: ColumnDef<UIMentalHealthReport>[] = [
    {
      key: 'created_at',
      title: 'Report Date',
      sortable: true,
      width: '130px',
      render: (v) => (
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'created_at_time',
      title: 'Date',
      sortable: false,
      width: '90px',
      render: (_, row) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(row.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
    {
      key: 'risk_level',
      title: 'Risk Status',
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
      ],
      width: '120px',
      render: (v) => <RiskBadge level={v} />,
    },
    {
      key: 'key_signals',
      title: 'Key Signals',
      sortable: false,
      filterable: false,
      render: (_, row) => (
        <span className="text-xs text-gray-600 dark:text-gray-400">
          Stress {row.stress_level >= 7 ? '↑' : '↓'}, Energy {row.energy_level >= 6 ? '↑' : '↓'}
        </span>
      ),
    },
    {
      key: 'trends',
      title: 'Trends',
      sortable: false,
      filterable: true,
      filterOptions: [
        { label: 'Improving', value: 'improving' },
        { label: 'Declining', value: 'declining' },
        { label: 'Stable', value: 'stable' },
      ],
      render: (_, row) => {
        const trend = row.overall_wellness >= 7 ? '↑ Improving' : row.overall_wellness <= 4 ? '↓ Declining' : '→ Stable';
        return (
          <span className="text-xs text-gray-600 dark:text-gray-400">
            <TrendIcon value={trend} />{trend.replace(/^[↑↓→]\s*/, '')}
          </span>
        );
      },
    },
    {
      key: 'session_type',
      title: 'Sources',
      sortable: false,
      filterable: true,
      filterOptions: [
        { label: 'Chat', value: 'text' },
        { label: 'Voice', value: 'voice' },
      ],
      width: '90px',
      render: (v) => (
        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <MessageSquare className="h-3 w-3" />
          {v === 'voice' ? 'Voice' : 'Chat'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '80px',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Link href={`/employee/reports/${row.id}`}
            className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-400 hover:text-emerald-600 transition-colors"
            onClick={e => e.stopPropagation()}>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ),
    },
  ];

  const handleExport = () => {
    router.push('/export/report?type=employee&range=30d');
  };

  return (
    <div className="px-4 sm:px-6 lg:px-6 py-6 max-w-[1400px] mx-auto bg-gray-50 dark:bg-gray-950 min-h-full rounded-xl">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-base font-semibold text-gray-800 dark:text-white">
          My Wellness Reports
        </h1>
    <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-sm overflow-hidden bg-white dark:bg-gray-900">
            <button
              onClick={() => setViewMode('interactive')}
              className={`px-5 py-1.5 text-sm font-medium transition-all ${
                viewMode === 'interactive'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Interactive
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-5 py-1.5 text-sm font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              List
            </button>
          </div>
          
        <div className="flex items-center gap-3">
          {/* View toggle — pill style matching image */}
      

          {/* Add Report */}
          <Link href="/employee/reports/new">
            <button className="flex items-center gap-1.5 px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-sm transition-colors">
              Add Report <Plus className="h-5 w-5" />
            </button>
          </Link>

          {/* Refresh */}
          <button
            onClick={fetchReports}
            disabled={refreshing}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Interactive View ── */}
      {viewMode === 'interactive' && (
        reports.length > 0 ? (
          <InteractiveAnalytics
            data={reports[0]}
            showComparison={reports.length > 1}
            previousData={reports[1]}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
              <Plus className="h-8 w-8 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">No reports yet</p>
            <Link href="/employee/reports/new">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors">
                Create your first report <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        )
      )}

      {/* ── List View ── */}
      {viewMode === 'list' && (
        <DataList
          data={reports}
          columns={columns}
          searchPlaceholder="Search Reports"
          rowKey="id"
          onExport={handleExport}
          emptyMessage="No reports found. Create your first wellness report."
          onRowClick={(row) => router.push(`/employee/reports/${row.id}`)}
          defaultPageSize={25}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      )}
    </div>
  );
}

export default withAuth(EmployeeReportsPage, ['employee']);
