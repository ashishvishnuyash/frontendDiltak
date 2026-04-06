'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Building2, Search, Plus, MoreHorizontal, Users, TrendingUp,
  Filter, Download, Eye, Edit, Trash2, CheckCircle, XCircle, AlertTriangle,
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
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Companies
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Manage registered organizations and their performance metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/companies/add" className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95">
            <Plus className="h-4 w-4" /> Add Company
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total',     value: companies.length,                                  icon: Building2,   color: 'text-gray-800 dark:text-gray-100', bg: 'bg-secondary/50' },
          { label: 'Active Now',value: companies.filter(c => c.status === 'active').length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { label: 'High Risk', value: companies.filter(c => c.risk === 'high').length,   icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
          { label: 'Enterprise',value: companies.filter(c => c.plan === 'Enterprise').length, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-500/10' },
        ].map(s => (
          <div key={s.label} className={`flex flex-col items-center justify-center p-5 rounded-2xl border border-border shadow-sm ${s.bg}`}>
            <s.icon className={`h-5 w-5 ${s.color} opacity-80 mb-2`} />
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 text-center">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search companies, industry or location..."
              className="w-full h-11 pl-10 pr-4 text-sm bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="flex gap-1 bg-secondary rounded-xl p-1 border border-border">
            {(['all', 'active', 'inactive'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-all ${filter === f ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 h-11 border border-border rounded-xl text-[11px] font-bold text-muted-foreground hover:bg-secondary transition-all">
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                {['Company', 'Industry', 'Employees', 'Plan', 'Wellness', 'Risk', 'Status', 'Joined', ''].map(h => (
                  <th key={h} className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-6 py-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-secondary/20 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0 border border-indigo-500/20">
                        <Building2 className="h-4 w-4 text-indigo-500" />
                      </div>
                      <span className="font-bold text-foreground whitespace-nowrap group-hover:text-indigo-500 transition-colors">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-medium whitespace-nowrap">{c.industry}</td>
                  <td className="px-6 py-4 text-foreground font-bold tabular-nums">{c.employees.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${planCls[c.plan as keyof typeof planCls]}`}>{c.plan}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(c.wellness / 10) * 100}%` }} />
                      </div>
                      <span className="text-foreground font-bold tabular-nums">{c.wellness}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${riskCls[c.risk as keyof typeof riskCls]}`}>{c.risk}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${c.status === 'active' ? 'text-emerald-600' : 'text-gray-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-400'}`} />
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-medium whitespace-nowrap">{new Date(c.joined).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"><Eye className="h-4 w-4" /></button>
                      <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"><Edit className="h-4 w-4" /></button>
                      <button className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
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
              <Search className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-bold text-foreground">No companies found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}

