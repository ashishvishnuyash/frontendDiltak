'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users, Plus, Eye, CheckCircle, Shield, Building2,
  MessageSquare, FileText, Activity,
} from 'lucide-react';
import { DataList, type ColumnDef } from '@/components/list/DataList';
import ServerAddress from '@/constent/ServerAddress';

// ── types ──────────────────────────────────────────────────────────────────────

interface AdminUser {
  uid: string;
  id?: string;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  email: string;
  role: 'employee' | 'manager' | 'hr' | 'employer' | 'admin';
  companyName?: string;
  company_name?: string;
  department?: string;
  isActive?: boolean;
  is_active?: boolean;
  lastActive?: string;
  last_login?: string;
  totalSessions?: number;
  aiCalls30d?: number;
  costAllTime?: number;
}

// ── styles ─────────────────────────────────────────────────────────────────────

const roleCls: Record<string, string> = {
  employee: 'text-gray-600 bg-gray-100 dark:bg-gray-800',
  manager:  'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  employer: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  hr:       'text-teal-600 bg-teal-50 dark:bg-teal-900/20',
  admin:    'text-red-600 bg-red-50 dark:bg-red-900/20',
};

// ── component ──────────────────────────────────────────────────────────────────

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);

  const totalUsers    = users.length;
  const activeUsers   = users.filter(u => u.isActive ?? u.is_active).length;
  const managerCount  = users.filter(u => u.role === 'manager').length;
  const employerCount = users.filter(u => u.role === 'employer').length;

  const columns: ColumnDef<AdminUser>[] = [
    {
      key: 'firstName',
      title: 'User',
      sortable: true,
      render: (_, row) => {
        const fname = row.firstName ?? row.first_name ?? '';
        const lname = row.lastName  ?? row.last_name  ?? '';
        const initials = `${fname[0] ?? ''}${lname[0] ?? ''}`.toUpperCase() || row.email[0].toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0 border border-indigo-500/20">
              <span className="text-xs font-black text-indigo-500">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                {fname} {lname}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{row.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'role',
      title: 'Role',
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: 'Employee', value: 'employee' },
        { label: 'Manager',  value: 'manager'  },
        { label: 'HR',       value: 'hr'       },
        { label: 'Employer', value: 'employer' },
        { label: 'Admin',    value: 'admin'    },
      ],
      render: (val) => (
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${roleCls[val as string] ?? roleCls.employee}`}>
          {val as string}
        </span>
      ),
    },
    {
      key: 'companyName',
      title: 'Company',
      sortable: true,
      render: (val, row) => (
        <span className="text-sm text-muted-foreground font-medium">
          {(val as string) ?? row.company_name ?? '—'}
        </span>
      ),
    },
    {
      key: 'lastActive',
      title: 'Last Active',
      sortable: true,
      render: (val, row) => {
        const raw = (val as string) ?? row.last_login;
        if (!raw) return <span className="text-xs text-muted-foreground">—</span>;
        return (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(raw).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        );
      },
    },
    {
      key: 'totalSessions',
      title: 'Total Sessions',
      sortable: true,
      render: (val) => (
        <span className="text-sm font-semibold text-foreground tabular-nums">
          {(val as number)?.toLocaleString() ?? '—'}
        </span>
      ),
    },
    {
      key: 'aiCalls30d',
      title: 'AI Calls (30d)',
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {(val as number) ?? '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'costAllTime',
      title: 'Cost (all-time)',
      sortable: true,
      render: (val) => (
        <span className="text-sm font-semibold text-foreground tabular-nums">
          {val != null ? `$${(val as number).toFixed(2)}` : '—'}
        </span>
      ),
    },
    {
      key: 'isActive',
      title: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: 'Active',   value: 'true'  },
        { label: 'Inactive', value: 'false' },
      ],
      render: (_, row) => {
        const active = row.isActive ?? row.is_active;
        return (
          <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${active ? 'text-emerald-600' : 'text-gray-400'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-400'}`} />
            {active ? 'Active' : 'Inactive'}
          </div>
        );
      },
    },
    {
      key: 'uid',
      title: 'Actions',
      width: '80px',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/admin/users/${row.uid ?? row.id}`}
            className="p-2 rounded-xl text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all inline-flex items-center justify-center"
          >
            <Eye className="h-5 w-5" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Users
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Manage platform users, roles, and per-user AI usage.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/users/invite"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95"
          >
            <Plus className="h-5 w-5" /> Invite User
          </Link>
        </div>
      </div>


      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total',     value: totalUsers,    icon: Users,       color: 'text-gray-800 dark:text-gray-100', bg: 'bg-secondary/50' },
          { label: 'Active',    value: activeUsers,   icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { label: 'Managers',  value: managerCount,  icon: Shield,      color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-500/10' },
          { label: 'Employers', value: employerCount, icon: Building2,   color: 'text-purple-600',  bg: 'bg-purple-50 dark:bg-purple-500/10' },
        ].map(s => (
          <div key={s.label} className={`flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border border-border shadow-sm ${s.bg}`}>
            <s.icon className={`h-5 w-5 ${s.color} opacity-80 mb-2`} />
            <p className={`text-xl sm:text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 text-center">{s.label}</p>
          </div>
        ))}
      </div>

      {/* DataList */}
      <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-3 sm:p-6 shadow-sm">
        <DataList<AdminUser>
          apiPath={`${ServerAddress}/admin/employees`}
          dataPath="employees"
          onDataLoaded={(data) => setUsers(data)}
          columns={columns}
          rowKey={(row) => row.uid ?? row.id ?? row.email}
          searchPlaceholder="Search by name, email or company..."
          defaultPageSize={10}
          emptyMessage="No users found."
          onExport={() => {
            const csv = [
              ['Name', 'Email', 'Role', 'Company', 'Status', 'AI Calls (30d)', 'Cost (all-time)'],
              ...users.map(u => [
                `${u.firstName ?? u.first_name ?? ''} ${u.lastName ?? u.last_name ?? ''}`.trim(),
                u.email,
                u.role,
                u.companyName ?? u.company_name ?? '',
                (u.isActive ?? u.is_active) ? 'Active' : 'Inactive',
                u.aiCalls30d ?? '',
                u.costAllTime != null ? `$${u.costAllTime.toFixed(2)}` : '',
              ]),
            ].map(r => r.join(',')).join('\n');
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
            a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
          }}
        />
      </div>
    </div>
  );
}
