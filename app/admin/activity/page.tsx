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
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Activity Log</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">All platform events and system activity</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search activity…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-indigo-400"
            />
          </div>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 overflow-x-auto">
            {['all', 'company', 'user', 'alert', 'report', 'system'].map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${typeFilter === t ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{date}</span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
              <span className="text-[11px] text-gray-400">{items.length} events</span>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800">
              {items.map((e, i) => {
                const Icon = e.icon;
                return (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${e.dot}`} />
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{e.msg}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{e.detail}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${typeColors[e.type]}`}>{e.type}</span>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1 whitespace-nowrap"><Clock className="h-2.5 w-2.5" />{e.time}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 py-12 text-center text-sm text-gray-400">
            No activity matches your search.
          </div>
        )}
      </div>
    </div>
  );
}
