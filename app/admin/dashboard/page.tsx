'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2, Users, FileText, Activity, TrendingUp, TrendingDown,
  ArrowRight, ShieldCheck, AlertTriangle, CheckCircle, Clock,
  BarChart3, Zap,
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ── mock data ──────────────────────────────────────────────────────────────────

const stats = [
  { label: 'Total Companies',  value: '48',    delta: '+3 this month',  up: true,  icon: Building2,   color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { label: 'Total Users',      value: '3,241', delta: '+127 this week', up: true,  icon: Users,       color: 'text-emerald-500',bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { label: 'Reports Today',    value: '284',   delta: '+12% vs yesterday', up: true, icon: FileText,  color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { label: 'Active Sessions',  value: '91',    delta: '-4 from peak',   up: false, icon: Activity,    color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
];

const trendData = [
  { date: 'Mon', users: 210, reports: 45, sessions: 88 },
  { date: 'Tue', users: 245, reports: 62, sessions: 95 },
  { date: 'Wed', users: 198, reports: 38, sessions: 72 },
  { date: 'Thu', users: 312, reports: 78, sessions: 110 },
  { date: 'Fri', users: 287, reports: 91, sessions: 103 },
  { date: 'Sat', users: 156, reports: 29, sessions: 54 },
  { date: 'Sun', users: 134, reports: 22, sessions: 41 },
];

const recentActivity = [
  { type: 'company', msg: 'Acme Corp onboarded',          time: '2 min ago',  icon: Building2,    dot: 'bg-blue-400' },
  { type: 'user',    msg: '14 new employees registered',  time: '18 min ago', icon: Users,        dot: 'bg-emerald-400' },
  { type: 'alert',   msg: 'High-risk flag: TechStart Inc',time: '34 min ago', icon: AlertTriangle,dot: 'bg-red-400' },
  { type: 'report',  msg: '89 wellness reports submitted', time: '1 hr ago',  icon: FileText,     dot: 'bg-purple-400' },
  { type: 'system',  msg: 'Scheduled backup completed',   time: '2 hr ago',   icon: CheckCircle,  dot: 'bg-gray-400' },
];

const topCompanies = [
  { name: 'Acme Corp',       users: 412, wellness: 8.2, risk: 'low' },
  { name: 'TechStart Inc',   users: 287, wellness: 5.9, risk: 'high' },
  { name: 'GreenLeaf Ltd',   users: 198, wellness: 7.8, risk: 'low' },
  { name: 'Nexus Solutions', users: 341, wellness: 6.4, risk: 'medium' },
  { name: 'Bright Future',   users: 156, wellness: 8.7, risk: 'low' },
];

const riskCls = { low: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20', medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20', high: 'text-red-600 bg-red-50 dark:bg-red-900/20' };

// ── component ──────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Platform overview — {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            All systems operational
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <Icon className={`h-4.5 w-4.5 ${s.color}`} style={{ width: 18, height: 18 }} />
                </div>
                {s.up
                  ? <TrendingUp className="h-4 w-4 text-emerald-400" />
                  : <TrendingDown className="h-4 w-4 text-red-400" />}
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
              <p className={`text-[11px] font-medium mt-1 ${s.up ? 'text-emerald-600' : 'text-red-500'}`}>{s.delta}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Trend chart */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Platform Activity (7 days)</h2>
            <Link href="/admin/analytics" className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Full analytics <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gReports" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Area type="monotone" dataKey="users"   stroke="#6366f1" fill="url(#gUsers)"   strokeWidth={2} dot={false} name="Users" />
              <Area type="monotone" dataKey="reports" stroke="#10b981" fill="url(#gReports)" strokeWidth={2} dot={false} name="Reports" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent activity */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Recent Activity</h2>
            <Link href="/admin/activity" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">View all</Link>
          </div>
          <div className="space-y-3">
            {recentActivity.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.dot}`} />
                  <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-200 leading-snug">{a.msg}</p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5"><Clock className="h-2.5 w-2.5" />{a.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top companies */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Top Companies by Users</h2>
          <Link href="/admin/companies" className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
            All companies <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {['Company', 'Users', 'Avg Wellness', 'Risk Level', ''].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-4 last:pr-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {topCompanies.map((c, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-2.5 pr-4 font-medium text-gray-800 dark:text-gray-100">{c.name}</td>
                  <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-300">{c.users.toLocaleString()}</td>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden w-16">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(c.wellness / 10) * 100}%` }} />
                      </div>
                      <span className="text-gray-600 dark:text-gray-300">{c.wellness}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${riskCls[c.risk as keyof typeof riskCls]}`}>{c.risk}</span>
                  </td>
                  <td className="py-2.5">
                    <Link href={`/admin/companies`} className="text-indigo-500 hover:text-indigo-700 font-medium">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/admin/companies', icon: Building2,   label: 'Manage Companies', sub: '48 active',         bg: 'bg-blue-500' },
          { href: '/admin/users',     icon: Users,       label: 'Manage Users',     sub: '3,241 total',       bg: 'bg-emerald-500' },
          { href: '/admin/reports',   icon: FileText,    label: 'View Reports',     sub: '284 today',         bg: 'bg-purple-500' },
          { href: '/admin/security',  icon: ShieldCheck, label: 'Security',         sub: 'All clear',         bg: 'bg-indigo-500' },
        ].map(q => {
          const Icon = q.icon;
          return (
            <Link key={q.href} href={q.href}>
              <div className="group flex items-center gap-3 p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-md transition-all">
                <div className={`${q.bg} p-2.5 rounded-xl flex-shrink-0`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 truncate">{q.label}</p>
                  <p className="text-[11px] text-gray-400 truncate">{q.sub}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>

    </div>
  );
}
