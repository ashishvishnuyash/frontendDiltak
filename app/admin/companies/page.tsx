'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Building2, Search, Plus, MoreHorizontal, Users, TrendingUp,
  Filter, Download, Eye, Edit, Trash2, CheckCircle, XCircle,
} from 'lucide-react';

const companies = [
  { id: '1', name: 'Acme Corp',        industry: 'Technology',  employees: 412, plan: 'Enterprise', wellness: 8.2, risk: 'low',    status: 'active',   joined: '2023-03-12' },
  { id: '2', name: 'TechStart Inc',    industry: 'SaaS',        employees: 287, plan: 'Pro',        wellness: 5.9, risk: 'high',   status: 'active',   joined: '2023-07-01' },
  { id: '3', name: 'GreenLeaf Ltd',    industry: 'Healthcare',  employees: 198, plan: 'Pro',        wellness: 7.8, risk: 'low',    status: 'active',   joined: '2023-05-20' },
  { id: '4', name: 'Nexus Solutions',  industry: 'Finance',     employees: 341, plan: 'Enterprise', wellness: 6.4, risk: 'medium', status: 'active',   joined: '2022-11-08' },
  { id: '5', name: 'Bright Future',    industry: 'Education',   employees: 156, plan: 'Starter',    wellness: 8.7, risk: 'low',    status: 'active',   joined: '2024-01-15' },
  { id: '6', name: 'Momentum Co',      industry: 'Retail',      employees: 89,  plan: 'Starter',    wellness: 6.1, risk: 'medium', status: 'inactive', joined: '2023-09-30' },
  { id: '7', name: 'Apex Industries',  industry: 'Manufacturing',employees: 523, plan: 'Enterprise', wellness: 7.1, risk: 'low',   status: 'active',   joined: '2022-06-14' },
  { id: '8', name: 'Clarity Health',   industry: 'Healthcare',  employees: 234, plan: 'Pro',        wellness: 8.9, risk: 'low',    status: 'active',   joined: '2023-12-01' },
];

const riskCls = {
  low:    'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
  medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
  high:   'text-red-600 bg-red-50 dark:bg-red-900/20',
};
const planCls = {
  Starter:    'text-gray-600 bg-gray-100 dark:bg-gray-800',
  Pro:        'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  Enterprise: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
};

export default function AdminCompanies() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filtered = companies.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || c.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Companies</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{companies.length} registered companies</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-colors self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Add Company
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',    value: companies.length,                                  color: 'text-gray-800 dark:text-gray-100' },
          { label: 'Active',   value: companies.filter(c => c.status === 'active').length, color: 'text-emerald-600' },
          { label: 'High Risk',value: companies.filter(c => c.risk === 'high').length,   color: 'text-red-500' },
          { label: 'Enterprise',value: companies.filter(c => c.plan === 'Enterprise').length, color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search companies or industry…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-indigo-400"
            />
          </div>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {(['all', 'active', 'inactive'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filter === f ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {['Company', 'Industry', 'Employees', 'Plan', 'Avg Wellness', 'Risk', 'Status', 'Joined', ''].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                      </div>
                      <span className="font-medium text-gray-800 dark:text-gray-100 whitespace-nowrap">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{c.industry}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{c.employees.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${planCls[c.plan as keyof typeof planCls]}`}>{c.plan}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(c.wellness / 10) * 100}%` }} />
                      </div>
                      <span className="text-gray-600 dark:text-gray-300">{c.wellness}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${riskCls[c.risk as keyof typeof riskCls]}`}>{c.risk}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1 text-[10px] font-medium ${c.status === 'active' ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {c.status === 'active' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{new Date(c.joined).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"><Eye className="h-3.5 w-3.5" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors"><Edit className="h-3.5 w-3.5" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No companies match your search.</div>
        )}
      </div>
    </div>
  );
}
