'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, RefreshCw, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

// ── types ──────────────────────────────────────────────────────────────────────

type AlertStatus = 'normal' | 'warning' | 'critical' | 'limit_reached';
type PlanTier    = 'free' | 'starter' | 'pro' | 'enterprise';

interface CreditRow {
  company: string;
  plan: PlanTier;
  limit: number;
  consumed: number;
  remaining: number;
  pct: number;
  status: AlertStatus;
  lastReset: string;
}

// ── mock data ──────────────────────────────────────────────────────────────────

const creditData: CreditRow[] = [
  { company: 'Harmony Health',  plan: 'enterprise', limit: 1000, consumed: 320.40, remaining: 679.60, pct: 32,  status: 'normal',       lastReset: 'Apr 1' },
  { company: 'Acme Wellness',   plan: 'pro',        limit: 200,  consumed: 168.40, remaining: 31.60,  pct: 84,  status: 'warning',      lastReset: 'Apr 1' },
  { company: 'MindSpace Inc',   plan: 'starter',    limit: 50,   consumed: 48.50,  remaining: 1.50,   pct: 97,  status: 'critical',     lastReset: 'Apr 1' },
  { company: 'TechVision Corp', plan: 'free',       limit: 10,   consumed: 10.21,  remaining: -0.21,  pct: 102, status: 'limit_reached',lastReset: 'Apr 1' },
  { company: 'Zenwork Ltd',     plan: 'starter',    limit: 50,   consumed: 9.00,   remaining: 41.00,  pct: 18,  status: 'normal',       lastReset: 'Apr 1' },
];

// ── styles ─────────────────────────────────────────────────────────────────────

const statusCls: Record<AlertStatus, { bar: string; badge: string; label: string }> = {
  normal:       { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20',   label: 'Normal'       },
  warning:      { bar: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20',         label: 'Warning'      },
  critical:     { bar: 'bg-orange-500',  badge: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20',      label: 'Critical'     },
  limit_reached:{ bar: 'bg-red-500',     badge: 'bg-red-50 text-red-600 dark:bg-red-900/20',               label: 'Limit Reached'},
};

const planCls: Record<PlanTier, string> = {
  free:       'text-gray-600 bg-gray-100 dark:bg-gray-800',
  starter:    'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  pro:        'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  enterprise: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20',
};

const ALL_STATUSES: AlertStatus[] = ['normal', 'warning', 'critical', 'limit_reached'];
const ALL_PLANS: PlanTier[]       = ['free', 'starter', 'pro', 'enterprise'];

// ── component ──────────────────────────────────────────────────────────────────

export default function AdminCredits() {
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
  const [planFilter,   setPlanFilter]   = useState<PlanTier | 'all'>('all');
  const [refreshing,   setRefreshing]   = useState(false);

  const filtered = creditData.filter(r => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchPlan   = planFilter   === 'all' || r.plan   === planFilter;
    return matchStatus && matchPlan;
  });

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const totalConsumed  = creditData.reduce((s, r) => s + r.consumed, 0);
  const totalLimit     = creditData.reduce((s, r) => s + r.limit, 0);
  const alertCount     = creditData.filter(r => r.status !== 'normal').length;
  const criticalCount  = creditData.filter(r => r.status === 'critical' || r.status === 'limit_reached').length;

  return (
    <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Credits
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Monitor AI credit consumption and billing alerts across all companies.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-[11px] font-bold text-muted-foreground hover:bg-secondary transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total MTD Spend',  value: `$${totalConsumed.toFixed(2)}`,  icon: CreditCard,    color: 'text-indigo-500',  bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Total Limit',      value: `$${totalLimit.toFixed(0)}`,     icon: TrendingUp,    color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Companies Alerted',value: alertCount,                      icon: AlertTriangle, color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Critical / Limit', value: criticalCount,                   icon: CheckCircle,   color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-900/20' },
        ].map(s => (
          <div key={s.label} className={`flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border border-border shadow-sm ${s.bg}`}>
            <s.icon className={`h-5 w-5 ${s.color} opacity-80 mb-2`} />
            <p className={`text-xl sm:text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 text-center">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Status filter */}
          <div className="flex gap-1 bg-secondary rounded-xl p-1 border border-border overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${statusFilter === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              All Statuses
            </button>
            {ALL_STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap capitalize transition-all ${statusFilter === s ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
          {/* Plan filter */}
          <div className="flex gap-1 bg-secondary rounded-xl p-1 border border-border overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setPlanFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${planFilter === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              All Plans
            </button>
            {ALL_PLANS.map(p => (
              <button
                key={p}
                onClick={() => setPlanFilter(p)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap capitalize transition-all ${planFilter === p ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {filtered.map((row, i) => {
          const cls = statusCls[row.status];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-foreground">{row.company}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${planCls[row.plan]}`}>{row.plan}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${cls.badge}`}>{cls.label}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>${row.consumed.toFixed(2)} / ${row.limit.toFixed(0)}</span>
                  <span className="font-bold text-foreground">{row.pct}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${cls.bar}`} style={{ width: `${Math.min(row.pct, 100)}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Remaining: ${row.remaining.toFixed(2)}</span>
                  <span>Reset: {row.lastReset}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-card dark:bg-gray-900/50 rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                {['Company', 'Plan', 'Limit', 'Consumed (MTD)', 'Remaining', 'Usage %', 'Alert', 'Last Reset'].map(h => (
                  <th key={h} className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-5 py-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((row, i) => {
                const cls = statusCls[row.status];
                return (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-secondary/20 transition-colors group"
                  >
                    <td className="px-5 py-4 font-bold text-foreground group-hover:text-indigo-500 transition-colors whitespace-nowrap">
                      {row.company}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${planCls[row.plan]}`}>
                        {row.plan}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground font-medium tabular-nums">
                      ${row.limit.toFixed(0)}
                    </td>
                    <td className="px-5 py-4 font-bold text-foreground tabular-nums">
                      ${row.consumed.toFixed(2)}
                    </td>
                    <td className={`px-5 py-4 font-bold tabular-nums ${row.remaining < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                      ${row.remaining.toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3 min-w-[120px]">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${cls.bar}`}
                            style={{ width: `${Math.min(row.pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-foreground font-bold tabular-nums text-[11px] w-8 text-right">{row.pct}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${cls.badge}`}>
                        {cls.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground font-medium whitespace-nowrap">
                      {row.lastReset}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-bold text-foreground">No results</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
