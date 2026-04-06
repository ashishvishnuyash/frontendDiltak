'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Building2, Users, FileText, AlertTriangle, CheckCircle, Settings, Clock, Search } from 'lucide-react';

const events = [
  { id: 1,  type: 'company',  icon: Building2,    dot: 'bg-blue-400',    msg: 'Acme Corp onboarded',                    detail: 'New enterprise plan activated',          time: '2 min ago',   date: 'Today' },
  { id: 2,  type: 'user',     icon: Users,        dot: 'bg-emerald-400', msg: '14 new employees registered',            detail: 'TechStart Inc — bulk import',            time: '18 min ago',  date: 'Today' },
  { id: 3,  type: 'alert',    icon: AlertTriangle,dot: 'bg-red-400',     msg: 'High-risk flag: TechStart Inc',          detail: 'Avg wellness dropped below 6.0',         time: '34 min ago',  date: 'Today' },
  { id: 4,  type: 'report',   icon: FileText,     dot: 'bg-purple-400',  msg: '89 wellness reports submitted',          detail: 'Across 12 companies',                    time: '1 hr ago',    date: 'Today' },
  { id: 5,  type: 'system',   icon: CheckCircle,  dot: 'bg-gray-400',    msg: 'Scheduled backup completed',             detail: 'All data backed up successfully',        time: '2 hr ago',    date: 'Today' },
  { id: 6,  type: 'company',  icon: Building2,    dot: 'bg-blue-400',    msg: 'GreenLeaf Ltd upgraded to Pro',          detail: 'Plan change processed',                  time: '5 hr ago',    date: 'Today' },
  { id: 7,  type: 'user',     icon: Users,        dot: 'bg-emerald-400', msg: 'User account deactivated',               detail: 'taylor@momentum.com — inactive 30 days', time: 'Yesterday',   date: 'Yesterday' },
  { id: 8,  type: 'system',   icon: Settings,     dot: 'bg-gray-400',    msg: 'System maintenance completed',           detail: 'Downtime: 4 minutes',                    time: 'Yesterday',   date: 'Yesterday' },
  { id: 9,  type: 'alert',    icon: AlertTriangle,dot: 'bg-red-400',     msg: 'Escalation ticket created',              detail: 'Momentum Co — harassment report',        time: '2 days ago',  date: '2 days ago' },
  { id: 10, type: 'report',   icon: FileText,     dot: 'bg-purple-400',  msg: 'Monthly analytics report generated',    detail: 'January 2024 summary',                   time: '2 days ago',  date: '2 days ago' },
];

const typeColors: Record<string, string> = {
  company: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  user:    'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
  alert:   'text-red-600 bg-red-50 dark:bg-red-900/20',
  report:  'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  system:  'text-gray-600 bg-gray-100 dark:bg-gray-800',
};

export default function AdminActivity() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = events.filter(e => {
    const matchSearch = e.msg.toLowerCase().includes(search.toLowerCase()) || e.detail.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || e.type === typeFilter;
    return matchSearch && matchType;
  });

  // Group by date
  const grouped = filtered.reduce<Record<string, typeof events>>((acc, e) => {
    if (!acc[e.date]) acc[e.date] = [];
    acc[e.date].push(e);
    return acc;
  }, {});

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
          Activity Log
        </h1>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          Comprehensive audit trail of platform events and system-level operations.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by event, description or company..."
              className="w-full h-11 pl-10 pr-4 text-sm bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="flex gap-1 bg-secondary rounded-xl p-1 border border-border overflow-x-auto scrollbar-hide">
            {['all', 'company', 'user', 'alert', 'report', 'system'].map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-bold capitalize whitespace-nowrap transition-all ${typeFilter === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-10">
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.2em]">{date}</span>
              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
              <div className="px-3 py-1 bg-secondary rounded-full border border-border">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{items.length} events logged</span>
              </div>
            </div>
            
            <div className="relative space-y-1 ml-4 sm:ml-6">
              {/* Vertical line connecting events */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-border via-border/50 to-transparent -translate-x-1/2" />
              
              {items.map((e, i) => {
                const Icon = e.icon;
                return (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="relative pl-8 pb-8 group"
                  >
                    {/* Dot on the timeline */}
                    <div className={`absolute left-0 top-2.5 w-3 h-3 rounded-full border-[3px] border-card bg-white shadow-sm -translate-x-1/2 z-10 transition-transform group-hover:scale-125 ${e.dot.replace('bg-', 'bg-')}`} />
                    
                    <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-5 shadow-sm group-hover:shadow-md group-hover:border-indigo-500/30 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex gap-4">
                          <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 border border-border group-hover:bg-indigo-500/5 transition-colors`}>
                            <Icon className="h-5 w-5 text-muted-foreground group-hover:text-indigo-500 transition-colors" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-foreground tracking-tight group-hover:text-indigo-500 transition-colors">{e.msg}</p>
                            <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">
                              {e.detail}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 self-end sm:self-start">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${typeColors[e.type]}`}>
                            {e.type}
                          </span>
                          <span className="text-[11px] font-bold text-muted-foreground/60 flex items-center gap-1.5 whitespace-nowrap bg-secondary px-2.5 py-1 rounded-lg border border-border">
                            <Clock className="h-3 w-3" />
                            {e.time}
                          </span>
                        </div>
                      </div>
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
            <p className="text-sm font-bold text-foreground">No matching records</p>
            <p className="text-xs text-muted-foreground mt-1">Adjust your search or category filters to see more activity.</p>
          </div>
        )}
      </div>
    </div>
  );
}
