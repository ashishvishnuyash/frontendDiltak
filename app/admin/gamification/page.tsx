'use client';

import { motion } from 'framer-motion';
import { Trophy, Flame, Star, Users, Award, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Link from 'next/link';

// ── data ───────────────────────────────────────────────────────────────────────

const overviewStats = [
  { label: 'Active Players',      value: '843',     sub: 'across all companies', icon: Users,  color: 'text-indigo-500',  bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { label: 'Avg Level',           value: '3.2',     sub: 'platform-wide',        icon: Star,   color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { label: 'Points Issued (30d)', value: '128,400', sub: '↑ 14% vs last month',  icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { label: 'Badges Earned (30d)', value: '284',     sub: 'Top: week_warrior (142)', icon: Award, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
];

const pointsByEvent = [
  { event: 'daily_checkin',      points: 42000, color: '#6366f1' },
  { event: 'conversation',       points: 38000, color: '#10b981' },
  { event: 'physical_checkin',   points: 28000, color: '#f59e0b' },
  { event: 'challenge_complete', points: 20400, color: '#8b5cf6' },
];

const topCompanies = [
  { name: 'Harmony Health',  avg: 920 },
  { name: 'Acme Wellness',   avg: 740 },
  { name: 'Zenwork Ltd',     avg: 520 },
  { name: 'MindSpace Inc',   avg: 380 },
  { name: 'TechVision Corp', avg: 140 },
];

// ── component ──────────────────────────────────────────────────────────────────

export default function AdminGamification() {
  return (
    <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Gamification Overview
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Platform-wide engagement metrics, points distribution, and top companies.
          </p>
        </div>
        <Link
          href="/admin/gamification/challenges"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20 self-start sm:self-auto"
        >
          <Trophy className="h-5 w-5" /> Manage Challenges
        </Link>
      </div>


      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {overviewStats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border border-border shadow-sm ${s.bg}`}
          >
            <s.icon className={`h-5 w-5 ${s.color} opacity-80 mb-2`} />
            <p className={`text-xl sm:text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 text-center">{s.label}</p>
            <p className="text-[9px] text-muted-foreground/60 mt-0.5 text-center">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Points by event type */}
        <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            <h2 className="text-sm font-bold text-foreground">Points by Event Type (30d)</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pointsByEvent} layout="vertical" margin={{ left: 100, right: 20, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-muted-foreground/10" horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="event" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
                formatter={(v: any) => [`${(v/1000).toFixed(0)}K pts`, 'Points']}
              />
              <Bar dataKey="points" radius={[0, 4, 4, 0]}>
                {pointsByEvent.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-3">
            {pointsByEvent.map(e => (
              <div key={e.event} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
                <span className="text-[10px] font-bold text-muted-foreground">{e.event}</span>
                <span className="text-[10px] text-muted-foreground/60">{(e.points/1000).toFixed(0)}K pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top companies by engagement */}
        <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h2 className="text-sm font-bold text-foreground">Top Companies by Engagement</h2>
          </div>
          <div className="space-y-4">
            {topCompanies.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[10px] font-black text-muted-foreground w-4 text-right flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground truncate">{c.name}</span>
                    <span className="text-[10px] font-bold text-muted-foreground ml-2 flex-shrink-0">avg {c.avg} pts/user</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(c.avg / 920) * 100}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick link to challenges */}
      <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-5 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
            <Flame className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">3 active challenges running</p>
            <p className="text-[11px] text-muted-foreground">Manage, create, and track challenge completion rates.</p>
          </div>
        </div>
        <Link
          href="/admin/gamification/challenges"
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-[11px] font-bold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all flex-shrink-0"
        >
          View Challenges →
        </Link>
      </div>
    </div>
  );
}
