'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, Users, FileText, Activity, Zap, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';

// ── data ───────────────────────────────────────────────────────────────────────

const weeklyData = [
  { day: 'Mon', users: 210, reports: 45, sessions: 88,  wellness: 7.2 },
  { day: 'Tue', users: 245, reports: 62, sessions: 95,  wellness: 7.5 },
  { day: 'Wed', users: 198, reports: 38, sessions: 72,  wellness: 6.9 },
  { day: 'Thu', users: 312, reports: 78, sessions: 110, wellness: 7.8 },
  { day: 'Fri', users: 287, reports: 91, sessions: 103, wellness: 7.4 },
  { day: 'Sat', users: 156, reports: 29, sessions: 54,  wellness: 8.1 },
  { day: 'Sun', users: 134, reports: 22, sessions: 41,  wellness: 8.3 },
];

const usageLogs = [
  { ts: '2025-04-25 14:22:08', user: 's.mitchell', company: 'Acme',     feature: 'chat',     model: 'gpt-4o-mini', tokensIn: 412,  tokensOut: 87,  cost: 0.000114, latency: '843ms',   status: 'ok'    },
  { ts: '2025-04-25 14:18:33', user: 'j.park',     company: 'Acme',     feature: 'report',   model: 'gpt-4o-mini', tokensIn: 1840, tokensOut: 342, cost: 0.000481, latency: '2,104ms', status: 'ok'    },
  { ts: '2025-04-25 13:55:12', user: 'r.kumar',    company: 'MindSpace', feature: 'physical', model: 'gpt-4o-mini', tokensIn: 920,  tokensOut: 210, cost: 0.000264, latency: '1,402ms', status: 'ok'    },
  { ts: '2025-04-25 12:40:01', user: 'anon_8X2Q',  company: '—',        feature: 'chat',     model: 'gpt-4o-mini', tokensIn: 318,  tokensOut: 64,  cost: 0.000086, latency: '612ms',   status: 'error' },
];

const topMetrics = [
  { label: 'Total Calls',    value: '3,842',  delta: '+12%',  up: true,  icon: Activity },
  { label: 'Total Tokens',   value: '48.2M',  delta: '+8.7%', up: true,  icon: Zap },
  { label: 'Total Cost',     value: '$128.40',delta: '+12%',  up: true,  icon: DollarSign },
  { label: 'Avg Latency',    value: '1,240ms',delta: '-80ms', up: true,  icon: Clock },
];

const FEATURES = ['chat', 'report', 'physical_health', 'recommendation'] as const;
const MODELS   = ['gpt-4o-mini', 'gpt-4'] as const;
const RANGES   = ['Last 30 days', 'Last 7 days', 'Last 90 days'] as const;

const featureCls: Record<string, string> = {
  chat:           'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20',
  report:         'bg-purple-50 text-purple-600 dark:bg-purple-900/20',
  physical:       'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20',
  recommendation: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20',
};

// ── component ──────────────────────────────────────────────────────────────────

export default function AdminUsageLogs() {
  const [range,          setRange]          = useState<typeof RANGES[number]>('Last 30 days');
  const [featureFilter,  setFeatureFilter]  = useState<typeof FEATURES[number] | 'all'>('all');
  const [modelFilter,    setModelFilter]    = useState<typeof MODELS[number] | 'all'>('all');

  const filteredLogs = usageLogs.filter(l => {
    const matchFeature = featureFilter === 'all' || l.feature === featureFilter;
    const matchModel   = modelFilter   === 'all' || l.model   === modelFilter;
    return matchFeature && matchModel;
  });

  return (
    <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Usage Logs
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Per-call AI usage, token consumption, cost, and latency across all companies.
          </p>
        </div>
        <div className="flex gap-1 bg-secondary rounded-xl p-1 border border-border self-start sm:self-auto">
          {RANGES.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${range === r ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {topMetrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-indigo-500" />
                </div>
                <span className={`text-[11px] font-semibold ${m.up ? 'text-emerald-600' : 'text-red-500'}`}>{m.delta}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
            </div>
          );
        })}
      </div>

      {/* Activity chart */}
      <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground mb-4">Daily Platform Activity</h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={weeklyData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="aUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="aReports" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-muted-foreground/10" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="users"   stroke="#6366f1" fill="url(#aUsers)"   strokeWidth={2} dot={false} name="Active Users" />
            <Area type="monotone" dataKey="reports" stroke="#10b981" fill="url(#aReports)" strokeWidth={2} dot={false} name="Reports" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Filters for log table */}
      <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-3 sm:p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {/* Feature filter */}
          <div className="flex gap-1 bg-secondary rounded-xl p-1 border border-border overflow-x-auto scrollbar-hide">
            <button onClick={() => setFeatureFilter('all')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${featureFilter === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>All Features</button>
            {FEATURES.map(f => (
              <button key={f} onClick={() => setFeatureFilter(f)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${featureFilter === f ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{f}</button>
            ))}
          </div>
          {/* Model filter */}
          <div className="flex gap-1 bg-secondary rounded-xl p-1 border border-border overflow-x-auto scrollbar-hide">
            <button onClick={() => setModelFilter('all')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${modelFilter === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>All Models</button>
            {MODELS.map(m => (
              <button key={m} onClick={() => setModelFilter(m)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${modelFilter === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{m}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Log table */}
      <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                {['Timestamp', 'User', 'Company', 'Feature', 'Model', 'Tokens In', 'Tokens Out', 'Cost', 'Latency', 'Status'].map(h => (
                  <th key={h} className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.map((log, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-secondary/20 transition-colors group"
                >
                  <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground whitespace-nowrap">{log.ts}</td>
                  <td className="px-4 py-3 font-bold text-foreground group-hover:text-indigo-500 transition-colors whitespace-nowrap">{log.user}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{log.company}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${featureCls[log.feature] ?? 'bg-secondary text-muted-foreground'}`}>
                      {log.feature}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-[10px] whitespace-nowrap">{log.model}</td>
                  <td className="px-4 py-3 font-semibold text-foreground tabular-nums">{log.tokensIn.toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold text-foreground tabular-nums">{log.tokensOut.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-foreground tabular-nums">${log.cost.toFixed(6)}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{log.latency}</td>
                  <td className="px-4 py-3">
                    {log.status === 'ok' ? (
                      <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600">
                        <CheckCircle className="h-3 w-3" /> ok
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-black text-red-500">
                        <XCircle className="h-3 w-3" /> error
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredLogs.length === 0 && (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 bg-secondary/50 rounded-full flex items-center justify-center mb-3">
              <Activity className="h-7 w-7 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-bold text-foreground">No logs found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
