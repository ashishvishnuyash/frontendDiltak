'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { withAuth } from '@/components/auth/with-auth';
import type { MentalHealthReport } from '@/types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import {
  Heart, Smile, Battery, AlertTriangle, Brain,
  TrendingUp, Calendar, MessageSquare, Sparkles,
  ArrowRight, Star, Award, User as UserIcon, BarChart2,
} from 'lucide-react';
import { BrandLoader } from '@/components/loader';

// ─── helpers ──────────────────────────────────────────────────────────────────

function riskDot(r: string) {
  if (r === 'high') return 'bg-red-500';
  if (r === 'medium') return 'bg-yellow-400';
  return 'bg-green-500';
}

function riskLabel(r: string) {
  if (r === 'high') return { dot: 'bg-red-500', text: 'text-red-600' };
  if (r === 'medium') return { dot: 'bg-yellow-400', text: 'text-yellow-600' };
  return { dot: 'bg-green-500', text: 'text-green-600' };
}

// ─── Circular Ring ────────────────────────────────────────────────────────────

function Ring({
  value, max = 10, color, emoji, label,
}: {
  value: number; max?: number; color: string; emoji: string; label: string;
}) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / max) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-[96px] h-[96px]">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={r} strokeWidth="6" fill="none" className="stroke-gray-100 dark:stroke-gray-700" />
          <circle
            cx="48" cy="48" r={r} strokeWidth="6" fill="none"
            stroke={color} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-base">{emoji}</span>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
      </div>
    </div>
  );
}

// ─── Quick Action card ────────────────────────────────────────────────────────

function QuickAction({ href, icon: Icon, iconBg, label, sub }: {
  href: string; icon: React.ElementType; iconBg: string; label: string; sub: string;
}) {
  return (
    <Link href={href}>
      <div className="group flex items-center gap-3 p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-md transition-all duration-200 cursor-pointer">
        <div className={`${iconBg} p-2.5 rounded-xl flex-shrink-0`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{label}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{sub}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </div>
    </Link>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function EmployeeDashboard() {
  const { user, loading: userLoading } = useAuth();
  const [reports, setReports] = useState<MentalHealthReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    try {
      const snap = await getDocs(query(
        collection(db, 'mental_health_reports'),
        where('employee_id', '==', user.id)
      ));
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data(), created_at: d.data().created_at || new Date().toISOString() } as MentalHealthReport))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);
      setReports(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { if (user) fetchReports(); }, [user, fetchReports]);

  if (userLoading || loading) {
    return <BrandLoader color="bg-violet-400" />;
  }

  if (!user) return null;

  const latest = reports[0];

  const chartData = reports.slice(0, 7).reverse().map(r => ({
    date: new Date(r.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    Mood: r.mood_rating,
    Stress: r.stress_level,
    Energy: r.energy_level,
  }));

  const avgWellness = reports.length
    ? Math.round(reports.slice(0, 7).reduce((s, r) => s + r.overall_wellness, 0) / Math.min(reports.length, 7))
    : 0;

  const tips = [
    {
      title: 'Take Breaks',
      body: 'Take a 5-minute break every hour to refresh your mind.',
      emoji: '🧘',
      bg: 'bg-green-50 dark:bg-green-950/20',
    },
    {
      title: 'Practice Mindfulness',
      body: 'Take a 5-minute break every hour to refresh your mind.',
      emoji: '🌿',
      bg: 'bg-teal-50 dark:bg-teal-950/20',
    },
    {
      title: 'Connect',
      body: 'Take a 5-minute break every hour to refresh your mind.',
      emoji: '💬',
      bg: 'bg-blue-50 dark:bg-blue-950/20',
    },
  ];

  const quickActions = [
    { href: '/employee/reports/new', icon: Heart, iconBg: 'bg-blue-500', label: 'New Wellness Check', sub: 'Record your current state' },
    { href: '/employee/chat', icon: MessageSquare, iconBg: 'bg-emerald-500', label: 'AI Assistant', sub: 'Chat with wellness AI' },
    { href: '/employee/reports', icon: TrendingUp, iconBg: 'bg-purple-500', label: 'View Reports', sub: 'Track your progress' },
    { href: '/employee/wellness-hub', icon: Sparkles, iconBg: 'bg-teal-500', label: 'Wellness Toolkit', sub: 'Access wellness tools' },
    { href: '/employee/recommendations', icon: Star, iconBg: 'bg-indigo-500', label: 'AI Recommendations', sub: 'Personalized tips' },
    { href: '/employee/gamification', icon: Award, iconBg: 'bg-amber-500', label: 'Gamification', sub: 'Earn points & badges' },
    { href: '/employee/community', icon: UserIcon, iconBg: 'bg-pink-500', label: 'Community', sub: 'Anonymous support' },
    { href: '/employee/support', icon: AlertTriangle, iconBg: 'bg-red-500', label: 'Support', sub: 'Get help when needed' },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-6 py-6 max-w-[1400px] mx-auto space-y-5">

      {/* ── ROW 1: Wellness Snap + Daily Tips ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Current Wellness Snap */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Current Wellness Snap</h2>
            <Link href="/employee/reports"
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <BarChart2 className="h-3.5 w-3.5" />
              View Analytics
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {latest ? (
            <div className="bg-green-50/60 dark:bg-green-950/10 rounded-2xl p-6 flex items-center justify-around flex-wrap gap-6">
              <Ring value={latest.mood_rating} color="#3B82F6" emoji="😊" label="MOOD" />
              <Ring value={latest.energy_level} color="#10B981" emoji="⚡" label="ENERGY" />
              <Ring value={latest.stress_level} color="#F59E0B" emoji="🌸" label="STRESS" />
              <Ring value={latest.overall_wellness} color="#10B981" emoji="🌿" label="WELLNESS" />
            </div>
          ) : (
            <div className="bg-green-50/60 dark:bg-green-950/10 rounded-2xl p-10 flex flex-col items-center gap-3">
              <Brain className="h-10 w-10 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-400">No check-ins yet</p>
              <Link href="/employee/reports/new" className="text-xs font-medium text-emerald-600 hover:underline">
                Create your first report →
              </Link>
            </div>
          )}
        </div>

        {/* Daily Wellness Tips */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Daily Wellness Tips</h2>
            <Link href="/employee/wellness-hub"
              className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-emerald-600 transition-colors">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {tips.map(t => (
              <div key={t.title} className={`flex items-center gap-3 p-3.5 rounded-xl ${t.bg}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{t.body}</p>
                </div>
                <span className="text-3xl flex-shrink-0">{t.emoji}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ROW 2: Wellness Trends + Recent Reports ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Wellness Trends */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
              Wellness Trends <span className="text-xs font-normal text-gray-400">(Last 7 days)</span>
            </h2>
            <Link href="/employee/reports"
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <BarChart2 className="h-3.5 w-3.5" />
              View Analytics
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {chartData.length > 0 ? (
            <div className="flex gap-4 items-start">
              <div className="flex-1 min-w-0">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 9 }} ticks={[0, 2, 4, 6, 8, 10]} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    <Line type="monotone" dataKey="Mood" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Stress" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Energy" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {/* Average Wellness card */}
              <div className="flex-shrink-0 w-28 border border-gray-100 dark:border-gray-700 rounded-xl p-3 flex flex-col items-center justify-center gap-1 self-center">
                <p className="text-[10px] text-gray-400 text-center leading-tight">Average Wellness</p>
                <p className="text-4xl font-bold text-emerald-500">{String(avgWellness).padStart(2, '0')}</p>
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-sm text-gray-400">No data yet — complete a check-in to see trends.</p>
            </div>
          )}
        </div>

        {/* Recent Reports */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Recent Reports</h2>
            <Link href="/employee/reports"
              className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-emerald-600 transition-colors">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {reports.length > 0 ? (
            <div className="space-y-1">
              {/* AI summary banner */}
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">AI Summary of your recent behaviour</span>
                </div>
                <span className="text-[10px] font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">● Balanced</span>
              </div>
              {reports[0] && (
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 italic px-1 mb-3">
                  Your energy levels improved compared to yesterday.
                </p>
              )}

              {/* Report rows */}
              <div className="grid grid-cols-3 gap-2">
                {reports.slice(0, 3).map((r, i) => {
                  const rl = riskLabel(r.risk_level);
                  const dateStr = new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                  return (
                    <div key={r.id} className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <p className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 leading-tight">{dateStr}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{r.overall_wellness}/10</span>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${rl.dot}`} />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] text-gray-400">● Good</p>
                        <p className="text-[9px] text-gray-400">⚡ High</p>
                        <p className="text-[9px] text-gray-400">↓ Low</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 gap-2">
              <Calendar className="h-8 w-8 text-gray-200 dark:text-gray-700" />
              <p className="text-xs text-gray-400">No reports yet</p>
              <Link href="/employee/reports/new" className="text-xs font-medium text-emerald-600 hover:underline">
                Create first report →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── ROW 3: Quick Actions ── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(a => (
            <QuickAction key={a.href} {...a} />
          ))}
        </div>
      </div>

    </div>
  );
}

export default withAuth(EmployeeDashboard, ['employee']);
