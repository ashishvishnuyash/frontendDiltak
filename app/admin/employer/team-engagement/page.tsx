'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Activity, Clock, TrendingDown, Search } from 'lucide-react';

// ── types ──────────────────────────────────────────────────────────────────────

type EmployeeStatus = 'active' | 'dormant' | 'churned';

interface TeamMember {
  name: string;
  lastActive: string;
  dept: string;
  status: EmployeeStatus;
  engagementScore: number;
  sessions30d: number;
  checkins30d: number;
  physical30d: number;
  streak: number;
  features: string[];
  level: number;
}

// ── data ───────────────────────────────────────────────────────────────────────

const teamData: TeamMember[] = [
  {
    name: 'Sarah Mitchell', lastActive: 'Today',       dept: 'HR',          status: 'active',  engagementScore: 82,
    sessions30d: 24, checkins30d: 28, physical30d: 12, streak: 14, features: ['chat', 'report', 'physical'], level: 5,
  },
  {
    name: 'James Park',     lastActive: 'Yesterday',   dept: 'Engineering', status: 'active',  engagementScore: 71,
    sessions30d: 18, checkins30d: 22, physical30d: 8,  streak: 7,  features: ['chat', 'report'],             level: 4,
  },
  {
    name: 'Priya Sharma',   lastActive: '12 days ago', dept: 'Marketing',   status: 'dormant', engagementScore: 38,
    sessions30d: 4,  checkins30d: 6,  physical30d: 2,  streak: 1,  features: ['chat'],                       level: 2,
  },
  {
    name: 'Marcus Lee',     lastActive: '32 days ago', dept: 'Finance',     status: 'churned', engagementScore: 12,
    sessions30d: 0,  checkins30d: 1,  physical30d: 0,  streak: 0,  features: ['chat'],                       level: 1,
  },
];

const DEPARTMENTS = ['Engineering', 'HR', 'Marketing', 'Finance'];
const STATUSES: EmployeeStatus[] = ['active', 'dormant', 'churned'];
const SORT_OPTIONS = ['Engagement Score', 'Last Active', 'Sessions', 'Streak'] as const;

const statusCls: Record<EmployeeStatus, string> = {
  active:  'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
  dormant: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
  churned: 'text-red-600 bg-red-50 dark:bg-red-900/20',
};

const featureCls: Record<string, string> = {
  chat:     'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20',
  report:   'bg-purple-50 text-purple-600 dark:bg-purple-900/20',
  physical: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20',
};

// ── component ──────────────────────────────────────────────────────────────────

export default function TeamEngagement() {
  const [search,     setSearch]     = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | 'all'>('all');
  const [sortBy,     setSortBy]     = useState<typeof SORT_OPTIONS[number]>('Engagement Score');

  const filtered = teamData
    .filter(m => {
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.dept.toLowerCase().includes(search.toLowerCase());
      const matchDept   = deptFilter   === 'all' || m.dept   === deptFilter;
      const matchStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchSearch && matchDept && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'Engagement Score') return b.engagementScore - a.engagementScore;
      if (sortBy === 'Sessions')         return b.sessions30d - a.sessions30d;
      if (sortBy === 'Streak')           return b.streak - a.streak;
      return 0; // Last Active — keep original order
    });

  const totalEmployees = teamData.length;
  const activeCount    = teamData.filter(m => m.status === 'active').length;
  const dormantCount   = teamData.filter(m => m.status === 'dormant').length;
  const avgEngagement  = Math.round(teamData.reduce((s, m) => s + m.engagementScore, 0) / teamData.length);

  return (
    <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Team Engagement
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Employee-level engagement, session activity, and feature usage.
          </p>
        </div>
      </div>


      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total Employees',    value: totalEmployees, icon: Users,        color: 'text-indigo-500',  bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Active (last 7d)',   value: `${activeCount} · ${Math.round((activeCount/totalEmployees)*100)}%`, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Dormant (7–30d)',    value: dormantCount,   icon: Clock,        color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Avg Engagement',     value: avgEngagement,  icon: TrendingDown, color: 'text-purple-500',  bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map(s => (
          <div key={s.label} className={`flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border border-border shadow-sm ${s.bg}`}>
            <s.icon className={`h-5 w-5 ${s.color} opacity-80 mb-2`} />
            <p className={`text-xl sm:text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 text-center">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-3 sm:p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or department..."
            className="w-full h-10 pl-9 pr-4 text-sm bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Department */}
          <div className="flex gap-1 bg-secondary rounded-xl p-1 border border-border overflow-x-auto scrollbar-hide">
            <button onClick={() => setDeptFilter('all')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${deptFilter === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>All Departments</button>
            {DEPARTMENTS.map(d => (
              <button key={d} onClick={() => setDeptFilter(d)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${deptFilter === d ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{d}</button>
            ))}
          </div>
          {/* Status */}
          <div className="flex gap-1 bg-secondary rounded-xl p-1 border border-border overflow-x-auto scrollbar-hide">
            <button onClick={() => setStatusFilter('all')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${statusFilter === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>All Statuses</button>
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap capitalize transition-all ${statusFilter === s ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{s}</button>
            ))}
          </div>
          {/* Sort */}
          <div className="flex gap-1 bg-secondary rounded-xl p-1 border border-border overflow-x-auto scrollbar-hide">
            {SORT_OPTIONS.map(s => (
              <button key={s} onClick={() => setSortBy(s)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${sortBy === s ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Sort: {s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {filtered.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
            className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <p className="text-sm font-bold text-foreground">{m.name}</p>
                <p className="text-[11px] text-muted-foreground">{m.lastActive} · {m.dept}</p>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${statusCls[m.status]}`}>{m.status}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center mb-3">
              {[
                { label: 'Sessions', value: m.sessions30d },
                { label: 'Check-ins', value: m.checkins30d },
                { label: 'Physical', value: m.physical30d },
              ].map(s => (
                <div key={s.label} className="p-2 rounded-xl bg-secondary/50 border border-border">
                  <p className="text-sm font-black text-foreground">{s.value}</p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {m.features.map(f => (
                  <span key={f} className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase ${featureCls[f] ?? 'bg-secondary text-muted-foreground'}`}>{f}</span>
                ))}
              </div>
              <span className="text-[10px] font-bold text-muted-foreground">Lv {m.level}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-card dark:bg-gray-900/50 rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                {['Employee', 'Dept', 'Status', 'Engagement', 'Sessions (30d)', 'Check-Ins (30d)', 'Physical (30d)', 'Streak', 'Features Used', 'Level'].map(h => (
                  <th key={h} className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((m, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className="hover:bg-secondary/20 transition-colors group">
                  <td className="px-4 py-4">
                    <p className="font-bold text-foreground group-hover:text-indigo-500 transition-colors whitespace-nowrap">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground">{m.lastActive}</p>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground font-medium whitespace-nowrap">{m.dept}</td>
                  <td className="px-4 py-4">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${statusCls[m.status]}`}>{m.status}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${m.engagementScore}%` }} />
                      </div>
                      <span className="font-bold text-foreground tabular-nums">{m.engagementScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-semibold text-foreground tabular-nums">{m.sessions30d}</td>
                  <td className="px-4 py-4 font-semibold text-foreground tabular-nums">{m.checkins30d}</td>
                  <td className="px-4 py-4 font-semibold text-foreground tabular-nums">{m.physical30d}</td>
                  <td className="px-4 py-4">
                    {m.streak > 0 ? (
                      <span className="flex items-center gap-1 font-bold text-orange-500">🔥 {m.streak}</span>
                    ) : (
                      <span className="text-muted-foreground">{m.streak}</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 flex-wrap">
                      {m.features.map(f => (
                        <span key={f} className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase ${featureCls[f] ?? 'bg-secondary text-muted-foreground'}`}>{f}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">Lv {m.level}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-bold text-foreground">No employees found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
