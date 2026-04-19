'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2, Users, FileText, Activity, TrendingUp, TrendingDown,
  ArrowRight, ShieldCheck, AlertTriangle, CheckCircle, Clock,
  BarChart3, Zap, Loader2
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
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

// ── mock data (fallback) ────────────────────────────────────────────────────────

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
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${ServerAddress}/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
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
      value: statsData?.totalCompanies?.toLocaleString() || '0',    
      delta: statsData?.recentJoins ? `+${statsData.recentJoins} recently` : 'Stable', 
      up: true,  
      icon: Building2,   
      color: 'text-blue-500',   
      bg: 'bg-blue-50 dark:bg-blue-900/20' 
    },
    { 
      label: 'Total Users',      
      value: statsData?.totalUsers?.toLocaleString() || '0', 
      delta: 'Across all roles', 
      up: true,  
      icon: Users,       
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20' 
    },
    { 
      label: 'Active Users',    
      value: statsData?.activeUsers?.toLocaleString() || '0',   
      delta: `${statsData?.inactiveUsers || 0} currently inactive`, 
      up: true, 
      icon: Activity,  
      color: 'text-purple-500', 
      bg: 'bg-purple-50 dark:bg-purple-900/20' 
    },
    { 
      label: 'Total Employees',  
      value: statsData?.totalEmployees?.toLocaleString() || '0',    
      delta: 'Direct member reports',   
      up: false, 
      icon: ShieldCheck,    
      color: 'text-orange-500', 
      bg: 'bg-orange-50 dark:bg-orange-900/20' 
    },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5 max-w-[1400px] mx-auto opacity-100 transition-opacity duration-300">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Admin Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Platform overview — {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              {loading ? 'Fetching live data...' : 'All systems operational'}
            </span>
          </div>
          <div className="h-8 w-px bg-border hidden sm:block mx-1" />
          <button className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors border border-border">
            <Zap className="h-5 w-5 text-amber-500" />
          </button>
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
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon className="h-16 w-16 -mr-4 -mt-4 rotate-12" />
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shadow-inner`}>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[10px] font-bold ${s.up ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-red-50 text-red-500 dark:bg-red-500/10'}`}>
                  {s.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {loading ? '...' : (s.up ? '+12%' : '-4%')}
                </div>
              </div>

              <div>
                <p className="text-3xl font-black text-foreground tracking-tight">
                  {loading ? '---' : s.value}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{s.label}</p>
                  <p className="text-[10px] text-muted-foreground/60 italic">{s.delta}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Trend chart */}
        <div className="xl:col-span-2 bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-foreground">Platform Activity</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Last 7 days performance</p>
            </div>
            <Link href="/admin/analytics" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-[11px] font-bold text-muted-foreground transition-all">
              Full analytics <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gReports" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-muted-foreground/10" vertical={false} />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 600 }}
                dy={10}
                className="text-muted-foreground"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 600 }}
                dx={-10}
                className="text-muted-foreground"
              />
              <Tooltip 
                contentStyle={{ 
                  fontSize: 11, 
                  borderRadius: '12px', 
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: 'hsl(var(--card))',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }} 
              />
              <Area type="monotone" dataKey="users" stroke="#6366f1" fill="url(#gUsers)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} name="Users" />
              <Area type="monotone" dataKey="reports" stroke="#10b981" fill="url(#gReports)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} name="Reports" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent activity */}
        <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-6 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-foreground">Live Activity</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Real-time system events</p>
            </div>
            <Link href="/admin/activity" className="text-[11px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors">View all</Link>
          </div>
          <div className="space-y-4 flex-1">
            {recentActivity.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-xl ${a.dot.replace('bg-', 'bg-').split('-')[0]}-500/10 dark:${a.dot}-500/20 flex items-center justify-center border border-border group-hover:border-indigo-500/30 transition-all`}>
                      <Icon className={`h-5 w-5 ${a.dot.replace('bg-', 'text-')}`} />
                    </div>
                    {i < recentActivity.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-xs font-bold text-foreground truncate group-hover:text-indigo-500 transition-colors uppercase tracking-tight">{a.type}</p>
                    <p className="text-[11px] text-muted-foreground font-medium line-clamp-1 mt-0.5">{a.msg}</p>
                    <p className="text-[10px] text-muted-foreground/50 flex items-center gap-1 mt-1 font-medium"><Clock className="h-2.5 w-2.5" />{a.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Role Breakdown (New Component using roleBreakdown data) */}
      <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-bold text-foreground">Role Distribution</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">User accounts by permission level</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {statsData?.roleBreakdown && Object.entries(statsData.roleBreakdown).map(([role, count]) => (
            <div key={role} className="p-4 rounded-xl bg-secondary/50 border border-border flex flex-col items-center text-center">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter mb-1">{role}</p>
              <p className="text-xl font-black text-foreground">{count.toLocaleString()}</p>
            </div>
          ))}
          {!statsData?.roleBreakdown && [1,2,3,4].map(i => (
            <div key={i} className="p-4 rounded-xl bg-secondary/20 border border-border animate-pulse h-20" />
          ))}
        </div>
      </div>

      {/* Top companies */}
      <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-bold text-foreground">Top Organizations</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">By overall engagement & wellness</p>
          </div>
          <Link href="/admin/companies" className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors">
            All companies <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                {['Company', 'Users', 'Avg Wellness', 'Risk Level', ''].map(h => (
                  <th key={h} className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-6 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topCompanies.map((c, i) => (
                <tr key={i} className="hover:bg-secondary/20 transition-colors group">
                  <td className="py-4 px-6 font-bold text-foreground group-hover:text-indigo-500 transition-colors">{c.name}</td>
                  <td className="py-4 px-6 text-muted-foreground font-medium">{c.users.toLocaleString()}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden w-24">
                        <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" style={{ width: `${(c.wellness / 10) * 100}%` }} />
                      </div>
                      <span className="text-foreground font-bold tabular-nums">{c.wellness}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${riskCls[c.risk as keyof typeof riskCls]}`}>{c.risk}</span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link href={`/admin/companies`} className="text-[11px] font-bold text-muted-foreground hover:text-indigo-500 transition-colors bg-secondary px-3 py-1.5 rounded-lg border border-border">Details</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { href: '/admin/companies', icon: Building2,   label: 'Companies', sub: `${statsData?.totalCompanies || 48} active`, bg: 'from-blue-500 to-indigo-600' },
          { href: '/admin/users',     icon: Users,       label: 'Users',     sub: `${statsData?.totalUsers || '3,241'} total`, bg: 'from-emerald-500 to-teal-600' },
          { href: '/admin/reports',   icon: FileText,    label: 'Reports',   sub: 'Historical data', bg: 'from-purple-500 to-violet-600' },
          { href: '/admin/security',  icon: ShieldCheck, label: 'Security',  sub: 'All clear',         bg: 'from-amber-500 to-orange-600' },
        ].map(q => {
          const Icon = q.icon;
          return (
            <Link key={q.href} href={q.href}>
              <motion.div 
                whileHover={{ y: -4 }}
                className="group flex flex-col gap-4 p-5 bg-card dark:bg-gray-900/50 rounded-2xl border border-border hover:border-indigo-500/50 hover:shadow-lg transition-all"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${q.bg} rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black text-foreground tracking-tight">{q.label}</p>
                    <ArrowRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">{q.sub}</p>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

    </div>
  );
}
