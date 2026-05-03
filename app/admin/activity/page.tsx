'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Building2, Users, FileText, AlertTriangle,
  CheckCircle, Settings, Clock, Search, Key, Trash2, Edit,
} from 'lucide-react';

// ── types ──────────────────────────────────────────────────────────────────────

type ActionType =
  | 'user.create'
  | 'user.update'
  | 'user.deactivate'
  | 'user.delete'
  | 'user.password_reset'
  | 'company.update'
  | 'employer.delete';

type ActorType = 'super_admin' | 'employer';

interface AuditEvent {
  id: number;
  action: ActionType;
  actor: string;
  actorType: ActorType;
  target: string;
  detail: string;
  time: string;
  date: string;
}

// ── data ───────────────────────────────────────────────────────────────────────

const events: AuditEvent[] = [
  {
    id: 1,
    action: 'user.create',
    actor: 'employer@acme.com',
    actorType: 'employer',
    target: 'j.park@acme.com',
    detail: 'Role: employee · Dept: Engineering',
    time: 'Today 2:14 PM',
    date: 'Today',
  },
  {
    id: 2,
    action: 'company.update',
    actor: 'super_admin',
    actorType: 'super_admin',
    target: 'Acme Wellness',
    detail: 'Fields: name, industry',
    time: 'Today 11:02 AM',
    date: 'Today',
  },
  {
    id: 3,
    action: 'user.deactivate',
    actor: 'employer@acme.com',
    actorType: 'employer',
    target: 'ex.employee@acme.com',
    detail: 'Account deactivated',
    time: 'Yesterday 5:48 PM',
    date: 'Yesterday',
  },
  {
    id: 4,
    action: 'employer.delete',
    actor: 'super_admin',
    actorType: 'super_admin',
    target: 'old.employer@techco.com',
    detail: 'Company: TechCo (deleted)',
    time: 'Apr 23, 3:20 PM',
    date: 'Apr 23',
  },
  {
    id: 5,
    action: 'user.password_reset',
    actor: 'super_admin',
    actorType: 'super_admin',
    target: 'r.kumar@mindspace.com',
    detail: 'Password reset initiated',
    time: 'Apr 22, 10:15 AM',
    date: 'Apr 22',
  },
  {
    id: 6,
    action: 'user.update',
    actor: 'employer@acme.com',
    actorType: 'employer',
    target: 's.mitchell@acme.com',
    detail: 'Fields: department, position',
    time: 'Apr 21, 9:00 AM',
    date: 'Apr 21',
  },
];

// ── helpers ────────────────────────────────────────────────────────────────────

const actionMeta: Record<ActionType, { icon: React.ElementType; dot: string; label: string; color: string }> = {
  'user.create':         { icon: Users,        dot: 'bg-emerald-400', label: 'user.create',         color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
  'user.update':         { icon: Edit,         dot: 'bg-blue-400',    label: 'user.update',         color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
  'user.deactivate':     { icon: AlertTriangle,dot: 'bg-amber-400',   label: 'user.deactivate',     color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
  'user.delete':         { icon: Trash2,       dot: 'bg-red-400',     label: 'user.delete',         color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
  'user.password_reset': { icon: Key,          dot: 'bg-purple-400',  label: 'user.password_reset', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
  'company.update':      { icon: Building2,    dot: 'bg-indigo-400',  label: 'company.update',      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
  'employer.delete':     { icon: Trash2,       dot: 'bg-red-500',     label: 'employer.delete',     color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
};

const ALL_ACTIONS: ActionType[] = [
  'user.create', 'user.update', 'user.deactivate', 'user.delete', 'company.update', 'employer.delete',
];

// ── component ──────────────────────────────────────────────────────────────────

export default function AdminAuditLog() {
  const [search,       setSearch]       = useState('');
  const [actionFilter, setActionFilter] = useState<ActionType | 'all'>('all');
  const [actorFilter,  setActorFilter]  = useState<ActorType | 'all'>('all');
  const [dateRange,    setDateRange]    = useState<'Last 30 days' | 'Last 7 days'>('Last 30 days');

  const filtered = events.filter(e => {
    const matchSearch = e.target.toLowerCase().includes(search.toLowerCase()) ||
      e.actor.toLowerCase().includes(search.toLowerCase()) ||
      e.detail.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'all' || e.action === actionFilter;
    const matchActor  = actorFilter  === 'all' || e.actorType === actorFilter;
    return matchSearch && matchAction && matchActor;
  });

  // Group by date
  const grouped = filtered.reduce<Record<string, AuditEvent[]>>((acc, e) => {
    if (!acc[e.date]) acc[e.date] = [];
    acc[e.date].push(e);
    return acc;
  }, {});

  return (
    <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Audit Log
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Immutable record of all admin and employer actions on the platform.
          </p>
        </div>
      </div>


      {/* Filters */}
      <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-3 sm:p-4 shadow-sm space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by actor, target or detail..."
            className="w-full h-10 pl-9 pr-4 text-sm bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Action filter */}
          <div className="flex gap-1 bg-secondary rounded-xl p-1 border border-border overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActionFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${actionFilter === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              All Actions
            </button>
            {ALL_ACTIONS.map(a => (
              <button
                key={a}
                onClick={() => setActionFilter(a)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${actionFilter === a ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {a}
              </button>
            ))}
          </div>

          {/* Actor filter */}
          <div className="flex gap-1 bg-secondary rounded-xl p-1 border border-border">
            {(['all', 'super_admin', 'employer'] as const).map(a => (
              <button
                key={a}
                onClick={() => setActorFilter(a)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap capitalize transition-all ${actorFilter === a ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {a === 'all' ? 'All Actors' : a.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Date range */}
          <div className="flex gap-1 bg-secondary rounded-xl p-1 border border-border">
            {(['Last 30 days', 'Last 7 days'] as const).map(d => (
              <button
                key={d}
                onClick={() => setDateRange(d)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${dateRange === d ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <div className="flex items-center gap-4 mb-5">
              <span className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.2em]">{date}</span>
              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
              <div className="px-3 py-1 bg-secondary rounded-full border border-border">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{items.length} events</span>
              </div>
            </div>

            <div className="space-y-2">
              {items.map((e, i) => {
                const meta = actionMeta[e.action];
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-start gap-4 p-4 bg-card dark:bg-gray-900/50 rounded-2xl border border-border hover:border-indigo-500/20 hover:shadow-sm transition-all group"
                  >
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border border-border ${meta.dot.replace('bg-', 'bg-').replace('-400', '-50').replace('-500', '-50')} dark:bg-secondary`}>
                      <Icon className={`h-5 w-5 ${meta.dot.replace('bg-', 'text-')}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${meta.color}`}>
                          {meta.label}
                        </span>
                        <span className="text-xs font-bold text-foreground group-hover:text-indigo-500 transition-colors">
                          Actor: {e.actor}
                          {e.actorType === 'employer' && <span className="text-muted-foreground font-normal"> (employer)</span>}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-medium">
                        Target: <span className="text-foreground font-semibold">{e.target}</span> · {e.detail}
                      </p>
                    </div>

                    {/* Time */}
                    <div className="flex-shrink-0 flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 bg-secondary px-2.5 py-1 rounded-lg border border-border whitespace-nowrap">
                      <Clock className="h-3 w-3" />
                      {e.time}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border py-24 text-center flex flex-col items-center justify-center shadow-sm">
            <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
              <Activity className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-bold text-foreground">No matching audit records</p>
            <p className="text-xs text-muted-foreground mt-1">Adjust your filters to see more events.</p>
          </div>
        )}
      </div>
    </div>
  );
}
