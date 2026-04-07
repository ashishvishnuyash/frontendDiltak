'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Plus, Eye, Edit, Trash2, CheckCircle, XCircle, Download, Shield, Building2, Link } from 'lucide-react';

const users = [
  { id: '1', name: 'Sarah Johnson',  email: 'sarah@acme.com',       company: 'Acme Corp',       role: 'employee', wellness: 8.4, status: 'active',   lastSeen: '2 min ago' },
  { id: '2', name: 'Mike Chen',      email: 'mike@techstart.com',    company: 'TechStart Inc',   role: 'manager',  wellness: 6.1, status: 'active',   lastSeen: '1 hr ago' },
  { id: '3', name: 'Emily Davis',    email: 'emily@greenleaf.com',   company: 'GreenLeaf Ltd',   role: 'employee', wellness: 7.9, status: 'active',   lastSeen: '3 hr ago' },
  { id: '4', name: 'Alex Rodriguez', email: 'alex@nexus.com',        company: 'Nexus Solutions', role: 'employer', wellness: 6.8, status: 'active',   lastSeen: 'Yesterday' },
  { id: '5', name: 'Jordan Lee',     email: 'jordan@bright.com',     company: 'Bright Future',   role: 'employee', wellness: 9.1, status: 'active',   lastSeen: '5 min ago' },
  { id: '6', name: 'Taylor Kim',     email: 'taylor@momentum.com',   company: 'Momentum Co',     role: 'employee', wellness: 5.2, status: 'inactive', lastSeen: '2 weeks ago' },
  { id: '7', name: 'Chris Park',     email: 'chris@apex.com',        company: 'Apex Industries', role: 'manager',  wellness: 7.3, status: 'active',   lastSeen: '30 min ago' },
  { id: '8', name: 'Dana White',     email: 'dana@clarity.com',      company: 'Clarity Health',  role: 'employee', wellness: 8.8, status: 'active',   lastSeen: '10 min ago' },
];

const roleCls: Record<string, string> = {
  employee: 'text-gray-600 bg-gray-100 dark:bg-gray-800',
  manager:  'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  employer: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  admin:    'text-red-600 bg-red-50 dark:bg-red-900/20',
};

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.company.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Users
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Manage platform users, roles, and overall engagement levels.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/users/invite" className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95">
            <Plus className="h-4 w-4" /> Invite User
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total',     value: users.length,                                    icon: Users,       color: 'text-gray-800 dark:text-gray-100', bg: 'bg-secondary/50' },
          { label: 'Active',    value: users.filter(u => u.status === 'active').length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { label: 'Managers',  value: users.filter(u => u.role === 'manager').length,  icon: Shield,      color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { label: 'Employers', value: users.filter(u => u.role === 'employer').length, icon: Building2,    color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-500/10' },
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email or company..."
              className="w-full h-11 pl-10 pr-4 text-sm bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="flex gap-1 bg-secondary rounded-xl p-1 border border-border">
            {['all', 'employee', 'manager', 'employer'].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-all ${roleFilter === r ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {r}
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
                {['User', 'Company', 'Role', 'Wellness', 'Status', 'Last Seen', ''].map(h => (
                  <th key={h} className="text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-6 py-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-secondary/20 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0 border border-indigo-500/20 group-hover:border-indigo-500 transition-colors">
                        <span className="text-xs font-black text-indigo-500">{u.name[0]}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate group-hover:text-indigo-500 transition-colors">{u.name}</p>
                        <p className="text-[10px] text-muted-foreground font-medium truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-medium whitespace-nowrap">{u.company}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${roleCls[u.role]}`}>{u.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(u.wellness / 10) * 100}%` }} />
                      </div>
                      <span className="text-foreground font-bold tabular-nums">{u.wellness}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${u.status === 'active' ? 'text-emerald-600' : 'text-gray-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-400'}`} />
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-medium whitespace-nowrap">{u.lastSeen}</td>
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
            <p className="text-sm font-bold text-foreground">No users found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}

