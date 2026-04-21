'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Power,
  PowerOff,
} from 'lucide-react';
import { DataList, type ColumnDef } from '@/components/list/DataList';
import { CustomButton } from '@/components/button/CustomButton';
import { toast } from 'sonner';
import axios from 'axios';
import ServerAddress from '@/constent/ServerAddress';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Company {
  id: string;
  name: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  industry: string;
  employees: number;
  plan: 'Starter' | 'Pro' | 'Enterprise';
  wellness: number;
  risk: 'low' | 'medium' | 'high';
  status: 'active' | 'inactive';
  joined: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

// ─── Risk & Plan Styles ───────────────────────────────────────────────────────

const riskCls = {
  low: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
  medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
  high: 'text-red-600 bg-red-50 dark:bg-red-900/20',
};

const planCls = {
  Starter: 'text-gray-600 bg-gray-100 dark:bg-gray-800',
  Pro: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  Enterprise: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
};

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

function DeleteConfirmModal({
  company,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  company: Company;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!isDeleting ? onCancel : undefined}
      />

      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/30">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Delete Company
            </h2>
          </div>
          {!isDeleting && (
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-5">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {company.name}
            </span>
            ? This action cannot be undone.
          </p>
          {company.email && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {company.email}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-semibold bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white transition-colors shadow-sm"
          >
            {isDeleting ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Deleting…
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Status Change Modal ─────────────────────────────────────────────────────

function StatusChangeModal({
  company,
  action,
  onConfirm,
  onCancel,
  isProcessing,
}: {
  company: Company;
  action: 'activate' | 'deactivate';
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}) {
  const isDeactivate = action === 'deactivate';
  const title = isDeactivate ? 'Deactivate Company' : 'Activate Company';
  const message = isDeactivate
    ? `Are you sure you want to deactivate ${company.name}? The company will not be able to access the system.`
    : `Are you sure you want to activate ${company.name}? The company will regain access to the system.`;
  const confirmText = isDeactivate ? 'Deactivate' : 'Activate';
  const confirmColor = isDeactivate
    ? 'bg-amber-500 hover:bg-amber-600'
    : 'bg-emerald-500 hover:bg-emerald-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!isProcessing ? onCancel : undefined}
      />

      <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${isDeactivate ? 'bg-amber-50 dark:bg-amber-900/30' : 'bg-emerald-50 dark:bg-emerald-900/30'}`}>
              {isDeactivate ? (
                <PowerOff className="h-5 w-5 text-amber-500" />
              ) : (
                <Power className="h-5 w-5 text-emerald-500" />
              )}
            </div>
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {title}
            </h2>
          </div>
          {!isProcessing && (
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-5">
          <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
          {company.email && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{company.email}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-xs font-semibold text-white transition-colors shadow-sm ${confirmColor} disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {isProcessing ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing…
              </>
            ) : (
              <>
                {isDeactivate ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                {confirmText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminCompanies() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status change state
  const [statusTarget, setStatusTarget] = useState<{ company: Company; action: 'activate' | 'deactivate' } | null>(null);
  const [isProcessingStatus, setIsProcessingStatus] = useState(false);

  const handleDeleteClick = (company: Company) => {
    setDeleteTarget(company);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.delete(
        `${ServerAddress}/admin/employers/${deleteTarget.id}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || 'Company deleted successfully');
        setRefreshKey((prev) => prev + 1);
        setDeleteTarget(null);
      } else {
        throw new Error(response.data.message || 'Delete failed');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete company';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = (company: Company, action: 'activate' | 'deactivate') => {
    setStatusTarget({ company, action });
  };

  const handleStatusConfirm = async () => {
    if (!statusTarget) return;
    const { company, action } = statusTarget;
    setIsProcessingStatus(true);

    try {
      const token = localStorage.getItem('access_token');
      const endpoint = action === 'activate'
        ? `${ServerAddress}/admin/employers/${company.id}/activate`
        : `${ServerAddress}/admin/employers/${company.id}/deactivate`;

      const response = await axios.post(
        endpoint,
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || `Company ${action}d successfully`);
        setRefreshKey((prev) => prev + 1);
        setStatusTarget(null);
      } else {
        throw new Error(response.data.message || `${action} failed`);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || `Failed to ${action} company`;
      toast.error(errorMessage);
    } finally {
      setIsProcessingStatus(false);
    }
  };

  // ── Column Definitions ─────────────────────────────────────────────────────

  const columns: ColumnDef<Company>[] = [
    {
      key: 'companyName',
      title: 'Company',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0 border border-indigo-500/20">
            <Building2 className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {row.companyName}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              ID: {row.id}
            </p>
          </div>
        </div>
      ),
    },
      {
      key: 'firstName',
      title: 'First Name',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
         
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {row.firstName}
            </p>
            
          </div>
        </div>
      ),
    },  {
      key: 'lastName',
      title: 'Last Name',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {row.lastName}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'industry',
      title: 'Industry',
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: 'Technology', value: 'Technology' },
        { label: 'SaaS', value: 'SaaS' },
        { label: 'Healthcare', value: 'Healthcare' },
        { label: 'Finance', value: 'Finance' },
        { label: 'Education', value: 'Education' },
        { label: 'Retail', value: 'Retail' },
        { label: 'Manufacturing', value: 'Manufacturing' },
      ],
      render: (val) => (
        <span className="text-xs text-gray-600 dark:text-gray-400">{val || '—'}</span>
      ),
    },
    {
      key: 'email',
      title: 'Email',
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {val?.email}
          </span>
        </div>
      ),
    },
    {
      key: 'phone',
      title: 'Phone',
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-1.5">
           <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {val?.phone}
          </span>
        </div>
      ),
    },
    {
      key: 'employees',
      title: 'Employees',
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-1.5">
          <Users className="h-3 w-3 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {val?.toLocaleString() || 0}
          </span>
        </div>
      ),
    },
    // {
    //   key: 'plan',
    //   title: 'Plan',
    //   sortable: true,
    //   filterable: true,
    //   filterOptions: [
    //     { label: 'Starter', value: 'Starter' },
    //     { label: 'Pro', value: 'Pro' },
    //     { label: 'Enterprise', value: 'Enterprise' },
    //   ],
    //   render: (val) => (
    //     <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${planCls[val as keyof typeof planCls]}`}>
    //       {val}
    //     </span>
    //   ),
    // },
    // {
    //   key: 'wellness',
    //   title: 'Wellness',
    //   sortable: true,
    //   render: (val) => (
    //     <div className="flex items-center gap-3">
    //       <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
    //         <div
    //           className="h-full bg-emerald-500 rounded-full"
    //           style={{ width: `${((val || 0) / 10) * 100}%` }}
    //         />
    //       </div>
    //       <span className="text-sm font-bold text-gray-700 dark:text-gray-300 tabular-nums">
    //         {val || 0}
    //       </span>
    //     </div>
    //   ),
    // },
    // {
    //   key: 'risk',
    //   title: 'Risk',
    //   sortable: true,
    //   filterable: true,
    //   filterOptions: [
    //     { label: 'Low', value: 'low' },
    //     { label: 'Medium', value: 'medium' },
    //     { label: 'High', value: 'high' },
    //   ],
    //   render: (val) => (
    //     <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${riskCls[val as keyof typeof riskCls]}`}>
    //       {val}
    //     </span>
    //   ),
    // },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      render: (_, row) => {
        const isActive = row.status === 'active';
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange(row, isActive ? 'deactivate' : 'activate');
            }}
            className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:opacity-80 ${
              isActive ? 'text-emerald-600' : 'text-gray-400'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isActive
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  : 'bg-gray-400'
              }`}
            />
            {isActive ? 'Active' : 'Inactive'}
          </button>
        );
      },
    },
    {
      key: 'joined',
      title: 'Joined',
      sortable: true,
      render: (val) => (
        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {val ? new Date(val).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      title: '',
      width: '100px',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/admin/companies/${row.id}`}
            className="p-2 rounded-xl text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all inline-flex items-center justify-center"
          >
            <Eye className="h-5 w-5" />
          </Link>
          <Link
            href={`/admin/companies/edit/${row.id}`}
            className="p-2 rounded-xl text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all inline-flex items-center justify-center"
          >
            <Edit className="h-5 w-5" />
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(row);
            }}
            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all inline-flex items-center justify-center"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  // Summary stats calculation
  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.status === 'active').length;
  const highRiskCompanies = companies.filter(c => c.risk === 'high').length;
  const enterpriseCompanies = companies.filter(c => c.plan === 'Enterprise').length;

  return (
    <>
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
            <CustomButton
              variant="primary"
              size="md"
              icon={<Plus className="h-5 w-5" />}
              onClick={() => router.push('/admin/companies/add')}
            >
              Add Company
            </CustomButton>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: 'Total',
              value: totalCompanies,
              icon: Building2,
              color: 'text-gray-800 dark:text-gray-100',
              bg: 'bg-gray-50 dark:bg-gray-900',
            },
            {
              label: 'Active Now',
              value: activeCompanies,
              icon: CheckCircle,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50/50 dark:bg-emerald-900/10',
            },
            {
              label: 'High Risk',
              value: highRiskCompanies,
              icon: AlertTriangle,
              color: 'text-red-500',
              bg: 'bg-red-50/50 dark:bg-red-900/10',
            },
            {
              label: 'Enterprise',
              value: enterpriseCompanies,
              icon: TrendingUp,
              color: 'text-purple-600',
              bg: 'bg-purple-50/50 dark:bg-purple-900/10',
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`flex flex-col items-center justify-center p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm ${s.bg}`}
            >
              <s.icon className={`h-5 w-5 ${s.color} opacity-80 mb-2`} />
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 text-center">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* DataList Component */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <DataList<Company>
            key={refreshKey}
            apiPath={`${ServerAddress}/admin/employers`}
            dataPath="employers"
            onDataLoaded={(data) => setCompanies(data)}
            columns={columns}
            rowKey={(row) => row.id}
            searchPlaceholder="Search companies by name, industry or location..."
            defaultPageSize={10}
            emptyMessage="No companies found. Start by adding your first organization."
            onExport={() => {
              const csv = [
                ['Name', 'Industry', 'Employees', 'Plan', 'Wellness', 'Risk', 'Status', 'Joined'],
                ...companies.map((c) => [
                  c.name,
                  c.industry,
                  c.employees,
                  c.plan,
                  c.wellness,
                  c.risk,
                  c.status,
                  c.joined,
                ]),
              ]
                .map((r) => r.join(','))
                .join('\n');
              const a = document.createElement('a');
              a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
              a.download = `companies_export_${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
            }}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          company={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => !isDeleting && setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* Status Change Confirmation Modal */}
      {statusTarget && (
        <StatusChangeModal
          company={statusTarget.company}
          action={statusTarget.action}
          onConfirm={handleStatusConfirm}
          onCancel={() => !isProcessingStatus && setStatusTarget(null)}
          isProcessing={isProcessingStatus}
        />
      )}
    </>
  );
}