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
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Reports</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">All wellness reports across the platform</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors self-start sm:self-auto">
          <Download className="h-4 w-4" /> Export All
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Reports',  value: reports.length,                                      icon: FileText,      color: 'text-indigo-500',  bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Reviewed',       value: reports.filter(r => r.status === 'reviewed').length, icon: TrendingUp,    color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Pending',        value: reports.filter(r => r.status === 'pending').length,  icon: Calendar,      color: 'text-yellow-500',  bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
          { label: 'Flagged',        value: reports.filter(r => r.status === 'flagged').length,  icon: AlertTriangle, color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-900/20' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{s.value}</p>
                <p className="text-[11px] text-gray-400">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by employee or company…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-indigo-400"
            />
          </div>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {['all', 'reviewed', 'pending', 'flagged'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${statusFilter === s ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {['ID', 'Employee', 'Company', 'Type', 'Wellness', 'Risk', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map((r, i) => (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-gray-400">{r.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100 whitespace-nowrap">{r.employee}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{r.company}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{r.type}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(r.wellness / 10) * 100}%` }} />
                      </div>
                      <span className="text-gray-600 dark:text-gray-300">{r.wellness}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${riskCls[r.risk as keyof typeof riskCls]}`}>{r.risk}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusCls[r.status]}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"><Eye className="h-3.5 w-3.5" /></button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No reports match your search.</div>
        )}
      </div>
    </div>
  );
}
