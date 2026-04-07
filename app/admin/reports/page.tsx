'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Download, Eye, Filter, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';

const reports = [
  { id: 'R001', employee: 'Sarah Johnson',  company: 'Acme Corp',       type: 'Wellness Check',  wellness: 8.4, risk: 'low',    date: '2024-01-15', status: 'reviewed' },
  { id: 'R002', employee: 'Mike Chen',      company: 'TechStart Inc',   type: 'Stress Report',   wellness: 5.9, risk: 'high',   date: '2024-01-15', status: 'flagged' },
  { id: 'R003', employee: 'Emily Davis',    company: 'GreenLeaf Ltd',   type: 'Wellness Check',  wellness: 7.9, risk: 'low',    date: '2024-01-14', status: 'reviewed' },
  { id: 'R004', employee: 'Alex Rodriguez', company: 'Nexus Solutions', type: 'Monthly Review',  wellness: 6.8, risk: 'medium', date: '2024-01-14', status: 'pending' },
  { id: 'R005', employee: 'Jordan Lee',     company: 'Bright Future',   type: 'Wellness Check',  wellness: 9.1, risk: 'low',    date: '2024-01-13', status: 'reviewed' },
  { id: 'R006', employee: 'Taylor Kim',     company: 'Momentum Co',     type: 'Stress Report',   wellness: 5.2, risk: 'high',   date: '2024-01-13', status: 'flagged' },
  { id: 'R007', employee: 'Chris Park',     company: 'Apex Industries', type: 'Wellness Check',  wellness: 7.3, risk: 'low',    date: '2024-01-12', status: 'reviewed' },
  { id: 'R008', employee: 'Dana White',     company: 'Clarity Health',  type: 'Monthly Review',  wellness: 8.8, risk: 'low',    date: '2024-01-12', status: 'reviewed' },
];

const riskCls = {
  low:    'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
  medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
  high:   'text-red-600 bg-red-50 dark:bg-red-900/20',
};
const statusCls: Record<string, string> = {
  reviewed: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
  pending:  'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
  flagged:  'text-red-600 bg-red-50 dark:bg-red-900/20',
};

export default function AdminReports() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = reports.filter(r => {
    const matchSearch = r.employee.toLowerCase().includes(search.toLowerCase()) ||
      r.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Reports
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Review and manage all wellness signals and system-flagged reports.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-[11px] font-bold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all shadow-sm active:scale-95">
            <Download className="h-5 w-5" /> Export All Data
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Logs',  value: reports.length,                                      icon: FileText,      color: 'text-indigo-500',  bg: 'bg-indigo-500/10 dark:bg-indigo-500/20' },
          { label: 'Reviewed',   value: reports.filter(r => r.status === 'reviewed').length, icon: TrendingUp,    color: 'text-emerald-500', bg: 'bg-emerald-500/10 dark:bg-emerald-500/20' },
          { label: 'Pending',    value: reports.filter(r => r.status === 'pending').length,  icon: Calendar,      color: 'text-amber-500',   bg: 'bg-amber-500/10 dark:bg-amber-500/20' },
          { label: 'Flagged',    value: reports.filter(r => r.status === 'flagged').length,  icon: AlertTriangle, color: 'text-red-500',     bg: 'bg-red-500/10 dark:bg-red-500/20' },
        ].map(s => (
          <div key={s.label} className={`flex flex-col items-center justify-center p-5 rounded-2xl border border-border shadow-sm ${s.bg}`}>
            <s.icon className={`h-5 w-5 ${s.color} opacity-80 mb-2`} />
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 text-center">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by employee name or organization..."
              className="w-full h-11 pl-10 pr-4 text-sm bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="flex gap-1 bg-secondary rounded-xl p-1 border border-border">
            {['all', 'reviewed', 'pending', 'flagged'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-all ${statusFilter === s ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                {['Report ID', 'Employee', 'Company', 'Category', 'Score', 'Risk', 'Status', 'Logged', ''].map(h => (
                  <th key={h} className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-6 py-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r, i) => (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-secondary/20 transition-colors group"
                >
                  <td className="px-6 py-4 font-mono text-[10px] text-muted-foreground font-bold">{r.id}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-foreground whitespace-nowrap group-hover:text-indigo-500 transition-colors">{r.employee}</span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-medium whitespace-nowrap">{r.company}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-lg bg-secondary text-muted-foreground text-[10px] font-bold uppercase tracking-tight">{r.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" style={{ width: `${(r.wellness / 10) * 100}%` }} />
                      </div>
                      <span className="text-foreground font-bold tabular-nums">{r.wellness}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${riskCls[r.risk as keyof typeof riskCls]}`}>{r.risk}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${statusCls[r.status]}`}>{r.status}</span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-medium whitespace-nowrap">{new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end">
                      <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-bold text-foreground">No reports found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}

