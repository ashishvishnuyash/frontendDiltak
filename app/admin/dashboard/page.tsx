'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2, Users, Activity, TrendingUp, TrendingDown,
  ArrowRight, AlertTriangle, CheckCircle, Clock,
  Zap, Loader2, DollarSign, CreditCard, RefreshCw,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import axios from 'axios';
import ServerAddress from '@/constent/ServerAddress';

// ── types ──────────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalEmployers: number;
  totalEmployees: number;
  totalCompanies: number;
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  roleBreakdown: Record<string, number>;
  recentJoins: number;
  computedAt: string;
}

// ── mock data ──────────────────────────────────────────────────────────────────

const tokenUsageData = [
  { day: 'Mon', chat: 120, report: 30, physical: 14 },
  { day: 'Tue', chat: 145, report: 38, physical: 18 },
  { day: 'Wed', chat: 98,  report: 22, physical: 10 },
  { day: 'Thu', chat: 162, report: 45, physical: 22 },
  { day: 'Fri', chat: 138, report: 41, physical: 19 },
  { day: 'Sat', chat: 72,  report: 18, physical: 8  },
  { day: 'Sun', chat: 107, report: 20, physical: 7  },
];

const newUsersData = [
  { week: 'Week 1', employers: 2, employees: 18 },
  { week: 'Week 2', employers: 1, employees: 24 },
  { week: 'Week 3', employers: 2, employees: 21 },
  { week: 'Week 4', employers: 1, employees: 18 },
];

const creditAlerts = [
  { company: 'TechVision Corp', slug: 'techvision', plan: 'free plan',    consumed: 10.21, limit: 10.00,  pct: 102, status: 'limit_reached' as const },
  { company: 'MindSpace Inc',   slug: 'mindspace',  plan: 'starter plan', consumed: 48.50, limit: 50.00,  pct: 97,  status: 'critical'     as const },
  { company: 'Acme Wellness',   slug: 'acme_corp',  plan: 'pro plan',     consumed: 168.40,limit: 200.00, pct: 84,  status: 'warning'      as const },
];

const platformStats = [
  { label: 'Employers',              value: '34' },
  { label: 'Employees',              value: '1,214' },
  { label: 'Active this week',       value: '612' },
  { label: 'Total lifetime spend',   value: '$2,841.20' },
  { label: 'Companies @ warning',    value: '5' },
  { label: 'Companies @ critical',   value: '3' },
];

const alertStatusCls = {
  limit_reached: { bar: 'bg-red-500',    text: 'text-red-600',    badge: 'bg-red-50 text-red-600 dark:bg-red-900/20',    label: 'LIMIT REACHED' },
  critical:      { bar: 'bg-orange-500', text: 'text-orange-600', badge: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20', label: 'CRITICAL' },
  warning:       { bar: 'bg-amber-500',  text: 'text-amber-600',  badge: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20',  label: 'WARNING' },
};

const timeRanges = ['Last 30 days', 'Last 7 days', 'Last 90 days'] as const;

// ── component ──────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<typeof timeRanges[number]>('Last 30 days');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${ServerAddress}/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        setStatsData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    {
      label: 'Total Companies',
      value: statsData?.totalCompanies?.toLocaleString() ?? '34',
      delta: '↑ 3 this month',
      up: true,
      icon: Building2,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Total Users',
      value: statsData?.totalUsers?.toLocaleString() ?? '1,248',
      delta: '↑ 87 this month',
      up: true,
      icon: Users,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: 'Active Users (30d)',
      value: statsData?.activeUsers?.toLocaleString() ?? '843',
      delta: '67.5% adoption rate',
      up: true,
      icon: Activity,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'MTD AI Spend',
      value: '$128.40',
      delta: '↑ 12% vs last month',
      up: true,
      icon: DollarSign,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Platform Overview
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
          {/* Time range selector */}
          <div className="flex gap-1 bg-secondary rounded-xl p-1 border border-border">
            {timeRanges.map(r => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${timeRange === r ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {r}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-xl text-[11px] font-bold text-muted-foreground hover:bg-secondary transition-all">
            Export CSV
          </button>
          <Link href="/admin/companies/add" className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-[11px] font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20">
            + Add Company
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-4 sm:p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon className="h-16 w-16 -mr-4 -mt-4 rotate-12" />
              </div>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${s.bg} flex items-center justify-center shadow-inner`}>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[10px] font-bold ${s.up ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-red-50 text-red-500 dark:bg-red-500/10'}`}>
                  {s.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {loading ? '...' : (s.up ? '+12%' : '-4%')}
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  {loading ? '---' : s.value}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-1 gap-0.5">
                  <p className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{s.label}</p>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground/60 italic">{s.delta}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Credit Alerts + Platform Stats */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">

        {/* Credit Alerts */}
        <div className="xl:col-span-2 bg-card dark:bg-gray-900/50 rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h2 className="text-sm font-bold text-foreground">⚠️ Credit Alerts</h2>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600">3 critical</span>
            </div>
            <Link href="/admin/credits" className="text-[11px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {creditAlerts.map((alert, i) => {
              const cls = alertStatusCls[alert.status];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/20 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-foreground truncate group-hover:text-indigo-500 transition-colors">
                        {alert.company}
                      </p>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest flex-shrink-0 ${cls.badge}`}>
                        {cls.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      ${alert.consumed.toFixed(2)} / ${alert.limit.toFixed(2)} limit · {alert.plan}
                    </p>
                    <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden w-full max-w-xs">
                      <div
                        className={`h-full rounded-full transition-all ${cls.bar}`}
                        style={{ width: `${Math.min(alert.pct, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {alert.status === 'limit_reached' ? (
                      <Link href="/admin/companies" className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-bold rounded-lg transition-all">
                        Upgrade
                      </Link>
                    ) : (
                      <Link href="/admin/credits" className="px-3 py-1.5 border border-border hover:bg-secondary text-muted-foreground text-[10px] font-bold rounded-lg transition-all">
                        View
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Platform Stats */}
        <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-bold text-foreground">Platform Stats</h2>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            {platformStats.map((s, i) => (
              <div key={i} className="p-3 rounded-xl bg-secondary/50 border border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
                <p className="text-base font-black text-foreground">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Token Usage + New Users Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">

        {/* Token Usage Chart */}
        <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">Token Usage — Last 7 Days</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">by feature</p>
            </div>
            <Link href="/admin/analytics" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-[11px] font-bold text-muted-foreground transition-all">
              Full logs <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={tokenUsageData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-muted-foreground/10" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} dy={8} className="text-muted-foreground" />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} dx={-8} className="text-muted-foreground" />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(v: any) => [`${v}K tokens`]}
              />
              <Bar dataKey="chat"     stackId="a" fill="#6366f1" radius={[0,0,0,0]} name="Chat" />
              <Bar dataKey="report"   stackId="a" fill="#10b981" radius={[0,0,0,0]} name="Report" />
              <Bar dataKey="physical" stackId="a" fill="#f59e0b" radius={[4,4,0,0]} name="Physical" />
            </BarChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {[
              { label: 'Chat', color: 'bg-indigo-500', value: '842K tokens' },
              { label: 'Report', color: 'bg-emerald-500', value: '214K tokens' },
              { label: 'Physical', color: 'bg-amber-500', value: '98K tokens' },
              { label: 'Recommendations', color: 'bg-purple-500', value: '41K tokens' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${l.color}`} />
                <span className="text-[10px] font-bold text-muted-foreground">{l.label}</span>
                <span className="text-[10px] text-muted-foreground/60">{l.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* New Users Chart */}
        <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-sm font-bold text-foreground">New Users — Last 30 Days</h2>
            </div>
            <Link href="/admin/users" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-[11px] font-bold text-muted-foreground transition-all">
              All users <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-black text-foreground">87</span>
            <span className="text-xs text-muted-foreground font-medium">new registrations this month</span>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={newUsersData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-muted-foreground/10" vertical={false} />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} dy={8} className="text-muted-foreground" />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} dx={-8} className="text-muted-foreground" />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }} />
              <Bar dataKey="employers" fill="#6366f1" radius={[3,3,0,0]} name="Employers" />
              <Bar dataKey="employees" fill="#10b981" radius={[3,3,0,0]} name="Employees" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-3">
            {[
              { label: 'Employers', color: 'bg-indigo-500', value: '6' },
              { label: 'Employees', color: 'bg-emerald-500', value: '81' },
              { label: 'Avg/day',   color: 'bg-gray-400',   value: '2.9' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${l.color}`} />
                <span className="text-[10px] font-bold text-muted-foreground">{l.label}</span>
                <span className="text-[10px] text-muted-foreground/60">{l.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role Breakdown */}
      <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div>
            <h2 className="text-sm font-bold text-foreground">Role Distribution</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">User accounts by permission level</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
          {statsData?.roleBreakdown && Object.entries(statsData.roleBreakdown).map(([role, count]) => (
            <div key={role} className="p-3 sm:p-4 rounded-xl bg-secondary/50 border border-border flex flex-col items-center text-center">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter mb-1">{role}</p>
              <p className="text-lg sm:text-xl font-black text-foreground">{count.toLocaleString()}</p>
            </div>
          ))}
          {!statsData?.roleBreakdown && [
            { role: 'employer', count: 34 },
            { role: 'employee', count: 1214 },
            { role: 'manager', count: 0 },
            { role: 'admin', count: 1 },
          ].map(({ role, count }) => (
            <div key={role} className="p-3 sm:p-4 rounded-xl bg-secondary/50 border border-border flex flex-col items-center text-center">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter mb-1">{role}</p>
              <p className="text-lg sm:text-xl font-black text-foreground">{count.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { href: '/admin/companies',  icon: Building2,  label: 'Companies',  sub: `${statsData?.totalCompanies ?? 34} active`,   bg: 'from-blue-500 to-indigo-600' },
          { href: '/admin/users',      icon: Users,      label: 'Users',      sub: `${statsData?.totalUsers ?? '1,248'} total`,   bg: 'from-emerald-500 to-teal-600' },
          { href: '/admin/credits',    icon: CreditCard, label: 'Credits',    sub: '3 alerts active',                              bg: 'from-orange-500 to-red-600' },
          { href: '/admin/analytics',  icon: Zap,        label: 'Usage Logs', sub: '48.2M tokens MTD',                             bg: 'from-purple-500 to-violet-600' },
        ].map(q => {
          const Icon = q.icon;
          return (
            <Link key={q.href} href={q.href}>
              <motion.div
                whileHover={{ y: -4 }}
                className="group flex flex-col gap-3 sm:gap-4 p-4 sm:p-5 bg-card dark:bg-gray-900/50 rounded-2xl border border-border hover:border-indigo-500/50 hover:shadow-lg transition-all"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${q.bg} rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black text-foreground tracking-tight">{q.label}</p>
                    <ArrowRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60 truncate">{q.sub}</p>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

    </div>
  );
}
