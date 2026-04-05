'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Plus, Eye, Edit, Trash2, CheckCircle, XCircle, Download, Shield } from 'lucide-react';

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
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Users</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{users.length} total users across all companies</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-colors self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Invite User
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',     value: users.length,                                    color: 'text-gray-800 dark:text-gray-100' },
          { label: 'Active',    value: users.filter(u => u.status === 'active').length, color: 'text-emerald-600' },
          { label: 'Managers',  value: users.filter(u => u.role === 'manager').length,  color: 'text-blue-600' },
          { label: 'Employers', value: users.filter(u => u.role === 'employer').length, color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email or company…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-indigo-400"
            />
          </div>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {['all', 'employee', 'manager', 'employer'].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${roleFilter === r ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
              >
                {r}
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
                {['User', 'Company', 'Role', 'Wellness', 'Status', 'Last Seen', ''].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filtered.map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">{u.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100 whitespace-nowrap">{u.name}</p>
                        <p className="text-[11px] text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">{u.company}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${roleCls[u.role]}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(u.wellness / 10) * 100}%` }} />
                      </div>
                      <span className="text-gray-600 dark:text-gray-300">{u.wellness}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1 text-[10px] font-medium ${u.status === 'active' ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {u.status === 'active' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{u.lastSeen}</td>
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
          <div className="py-12 text-center text-sm text-gray-400">No users match your search.</div>
        )}
      </div>
    </div>
  );
}
