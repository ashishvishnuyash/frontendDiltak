'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useUser } from '@/hooks/use-user';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { withAuth } from '@/components/auth/with-auth';
import type { MentalHealthReport } from '@/types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Heart, Smile, Battery, AlertTriangle, Brain,
  TrendingUp, Calendar, MessageSquare, Sparkles,
  ArrowRight, Star, Award, User as UserIcon,
  BarChart3,
} from 'lucide-react';

// ─── helpers ──────────────────────────────────────────────────────────────────

function getWellnessLabel(score: number) {
  if (score >= 8) return { label: 'Excellent', cls: 'bg-green-100 text-green-700' };
  if (score >= 6) return { label: 'Good', cls: 'bg-blue-100 text-blue-700' };
  if (score >= 4) return { label: 'Fair', cls: 'bg-yellow-100 text-yellow-700' };
  return { label: 'Needs Attention', cls: 'bg-red-100 text-red-700' };
}

function riskCls(r: string) {
  if (r === 'high') return 'bg-red-100 text-red-700';
  if (r === 'medium') return 'bg-yellow-100 text-yellow-700';
  return 'bg-green-100 text-green-700';
}

// ─── Circular progress ────────────────────────────────────────────────────────

function Ring({
  value, max = 10, color, icon: Icon, label,
}: {
  value: number; max?: number; color: string; icon: React.ElementType; label: string;
}) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / max) * circ;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-[84px] h-[84px]">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 84 84">
          <circle cx="42" cy="42" r={r} strokeWidth="5" fill="none" className="stroke-gray-100 dark:stroke-gray-700" />
          <circle
            cx="42" cy="42" r={r} strokeWidth="5" fill="none"
            stroke={color} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <Icon className="h-5 w-5" style={{ color }} />
          <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{value}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
    </div>
  );
}

// ─── Quick action card ────────────────────────────────────────────────────────

function QuickAction({
  href, icon: Icon, iconBg, label, sub, hoverColor,
}: {
  href: string; icon: React.ElementType; iconBg: string;
  label: string; sub: string; hoverColor: string;
}) {
  return (
    <Link href={href}>
      <div className={`group flex items-center gap-3 p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-${hoverColor}-200 dark:hover:border-${hoverColor}-700 hover:shadow-md transition-all duration-200 cursor-pointer`}>
        <div className={`${iconBg} p-3 rounded-xl flex-shrink-0`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{label}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{sub}</p>
        </div>
        <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </div>
    </Link>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function EmployeeDashboard() {
  const { user, loading: userLoading } = useUser();
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
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center animate-pulse">
            <span className="text-white font-bold">D</span>
          </div>
          <div className="flex gap-1.5">
            {[0, 150, 300].map(d => (
              <span key={d} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const latest = reports[0];
  const wellness = latest ? getWellnessLabel(latest.overall_wellness) : null;

  const chartData = reports.slice(0, 7).reverse().map(r => ({
    date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mood: r.mood_rating,
    stress: r.stress_level,
    energy: r.energy_level,
    wellness: r.overall_wellness,
  }));

  const quickActions = [
    { href: '/employee/reports/new', icon: Heart, iconBg: 'bg-blue-500', label: 'New Wellness Check', sub: 'Record your current state', hoverColor: 'blue' },
    { href: '/employee/chat', icon: MessageSquare, iconBg: 'bg-emerald-500', label: 'AI Assistant', sub: 'Chat with wellness AI', hoverColor: 'emerald' },
    { href: '/employee/reports', icon: TrendingUp, iconBg: 'bg-purple-500', label: 'View Reports', sub: 'Track your progress', hoverColor: 'purple' },
    { href: '/employee/wellness-hub', icon: Sparkles, iconBg: 'bg-teal-500', label: 'Wellness Toolkit', sub: 'Access wellness tools', hoverColor: 'teal' },
    { href: '/employee/recommendations', icon: Star, iconBg: 'bg-indigo-500', label: 'AI Recommendations', sub: 'Personalized tips', hoverColor: 'indigo' },
    { href: '/employee/gamification', icon: Award, iconBg: 'bg-amber-500', label: 'Gamification', sub: 'Earn points & badges', hoverColor: 'amber' },
    { href: '/employee/community', icon: UserIcon, iconBg: 'bg-pink-500', label: 'Community', sub: 'Anonymous support', hoverColor: 'pink' },
    { href: '/employee/support', icon: AlertTriangle, iconBg: 'bg-red-500', label: 'Support', sub: 'Get help when needed', hoverColor: 'red' },
  ];

  const tips = [
    { icon: Heart, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', title: 'Take Breaks', body: 'A 5-minute break every hour refreshes your focus.' },
    { icon: Brain, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30', title: 'Practice Mindfulness', body: 'Try 5 minutes of deep breathing or meditation.' },
    { icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30', title: 'Connect', body: 'Reach out to our AI assistant or a colleague.' },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-4 py-6 max-w-[1400px] mx-auto">

        {/* Welcome */}
        {/* <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user.first_name || user.email}!
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Monitor your personal wellness and track your progress.
          </p>
        </div> */}

        {/* Main grid: left col (snapshot + trends) | right col (tips + reports) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* ── LEFT (2/3) ── */}
          <div className="xl:col-span-2 flex flex-col gap-5">

            {/* Current Wellness Snapshot */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Current Wellness Snapshot</h2>
                  {wellness && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${wellness.cls}`}>
                      {wellness.label}
                    </span>
                  )}
                </div>
                <Link href="/employee/reports" className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium">
                  View Analytics <BarChart3 className="h-3.5 w-3.5" />
                </Link>
              </div>

              {latest ? (
                <>
                  <p className="text-xs text-gray-400 mb-4">
                    Last check-in: {new Date(latest.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <div className="flex items-center justify-around flex-wrap gap-4">
                    <Ring value={latest.mood_rating} color="#3B82F6" icon={Smile} label="Mood" />
                    <Ring value={latest.energy_level} color="#10B981" icon={Battery} label="Energy" />
                    <Ring value={latest.stress_level} color="#EF4444" icon={AlertTriangle} label="Stress" />
                    <Ring value={latest.overall_wellness} color="#8B5CF6" icon={Brain} label="Wellness" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <Brain className="h-10 w-10 text-gray-200 dark:text-gray-700" />
                  <p className="text-sm text-gray-400">No check-ins yet</p>
                  <Link href="/employee/reports/new" className="text-xs font-medium text-violet-600 hover:underline">
                    Create your first report →
                  </Link>
                </div>
              )}
            </div>

            {/* Wellness Trends */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Wellness Trends</h2>
                  <span className="text-[10px] text-gray-400">(last {Math.min(chartData.length, 7)} reports)</span>
                </div>
              </div>

              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Line type="monotone" dataKey="mood" stroke="#3B82F6" strokeWidth={2} dot={false} name="Mood" />
                    <Line type="monotone" dataKey="stress" stroke="#EF4444" strokeWidth={2} dot={false} name="Stress" />
                    <Line type="monotone" dataKey="energy" stroke="#10B981" strokeWidth={2} dot={false} name="Energy" />
                    <Line type="monotone" dataKey="wellness" stroke="#8B5CF6" strokeWidth={2} dot={false} name="Wellness" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center">
                  <p className="text-sm text-gray-400">No data yet — complete a check-in to see trends.</p>
                </div>
              )}
            </div>

            {/* Quick Actions — below wellness trends */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {quickActions.map(a => (
                  <QuickAction key={a.href} {...a} />
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT (1/3) ── */}
          <div className="flex flex-col gap-5">

            {/* Daily Wellness Tips */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-amber-400" />
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Daily Wellness Tips</h2>
              </div>
              <div className="flex flex-col gap-3">
                {tips.map(t => (
                  <div key={t.title} className={`flex items-start gap-3 p-3 rounded-xl ${t.bg}`}>
                    <div className="mt-0.5 flex-shrink-0">
                      <t.icon className={`h-5 w-5 ${t.color}`} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{t.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Reports */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Recent Reports</h2>
                </div>
                <Link href="/employee/reports" className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium flex items-center gap-1">
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {reports.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {reports.slice(0, 5).map(r => (
                    <div key={r.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
                      <div>
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                          {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Wellness: {r.overall_wellness}/10</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${riskCls(r.risk_level)}`}>
                        {r.risk_level}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 gap-2">
                  <Calendar className="h-8 w-8 text-gray-200 dark:text-gray-700" />
                  <p className="text-xs text-gray-400">No reports yet</p>
                  <Link href="/employee/reports/new" className="text-xs font-medium text-violet-600 hover:underline">
                    Create first report →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}

export default withAuth(EmployeeDashboard, ['employee']);
