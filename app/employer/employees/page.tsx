'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Eye, X, Loader2, CheckCircle } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/hooks/use-user';
import { toast } from 'sonner';
import { withAuth } from '@/components/auth/with-auth';
import { DataList, type ColumnDef } from '@/components/list/DataList';
import { BrandLoader } from '@/components/loader';
import Link from 'next/link';
import axios from 'axios';

const BASE_URL = 'http://74.162.66.197/api';

// ── types ──────────────────────────────────────────────────────────────────────

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  department?: string;
  position?: string;
  is_active?: boolean;
  created_at?: string;
}

interface AddEmployeeForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  company_id: string;
}

// ── Add Employee Modal ─────────────────────────────────────────────────────────

function AddEmployeeModal({
  companyId,
  onClose,
  onSuccess,
}: {
  companyId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<AddEmployeeForm>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'employee',
    company_id: companyId,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<AddEmployeeForm>>({});

  const validate = () => {
    const e: Partial<AddEmployeeForm> = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password || form.password.length < 6) e.password = 'Min 6 characters';
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${BASE_URL}/createEmployee`,
        form,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      toast.success(`Employee ${form.firstName} ${form.lastName} created!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to create employee';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const field = (
    key: keyof AddEmployeeForm,
    label: string,
    type = 'text',
    placeholder = ''
  ) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-emerald-400 transition-colors ${
          errors[key] ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'
        }`}
      />
      {errors[key] && <p className="text-[11px] text-red-500 mt-0.5">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">Add Employee</h2>
            <p className="text-xs text-gray-400 mt-0.5">Create a new employee account</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {field('firstName', 'First Name', 'text', 'John')}
            {field('lastName',  'Last Name',  'text', 'Doe')}
          </div>
          {field('email',    'Email',    'email',    'john@company.com')}
          {field('password', 'Password', 'password', 'Min 6 characters')}

          {/* Role */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Role</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-emerald-400 transition-colors"
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="hr">HR</option>
            </select>
          </div>

          {/* Company ID (read-only) */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Company ID</label>
            <input
              type="text"
              value={form.company_id}
              readOnly
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 rounded-xl transition-colors"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>
              ) : (
                <><UserPlus className="h-4 w-4" /> Add Employee</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Employees Page ─────────────────────────────────────────────────────────────

function EmployeesPage() {
  const { user, loading: userLoading } = useUser();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchEmployees = useCallback(async () => {
    if (!user?.company_id) return;
    setLoading(true);
    try {
      const snap = await getDocs(
        query(
          collection(db, 'users'),
          where('company_id', '==', user.company_id),
          where('role', 'in', ['employee', 'manager', 'hr'])
        )
      );
      const data: Employee[] = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<Employee, 'id'>),
      }));
      setEmployees(data);
    } catch {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!userLoading && user) fetchEmployees();
  }, [user, userLoading, fetchEmployees]);

  // ── Column definitions ───────────────────────────────────────────────────────

  const columns: ColumnDef<Employee>[] = [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      render: (_, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {row.first_name?.[0]}{row.last_name?.[0]}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {row.first_name} {row.last_name}
            </p>
            <p className="text-[11px] text-gray-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Role',
      sortable: true,
      filterable: true,
      filterOptions: [
        { label: 'Employee', value: 'employee' },
        { label: 'Manager',  value: 'manager' },
        { label: 'HR',       value: 'hr' },
      ],
      render: (val) => (
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
          val === 'manager' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
          val === 'hr'      ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
                              'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
        }`}>{val}</span>
      ),
    },
    {
      key: 'department',
      title: 'Department',
      sortable: true,
      render: (val) => val || <span className="text-gray-400">—</span>,
    },
    {
      key: 'position',
      title: 'Position',
      render: (val) => val || <span className="text-gray-400">—</span>,
    },
    {
      key: 'is_active',
      title: 'Status',
      filterable: true,
      filterOptions: [
        { label: 'Active',   value: 'true' },
        { label: 'Inactive', value: 'false' },
      ],
      render: (val) => (
        <span className={`flex items-center gap-1 text-[11px] font-medium ${val !== false ? 'text-emerald-600' : 'text-gray-400'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${val !== false ? 'bg-emerald-500' : 'bg-gray-400'}`} />
          {val !== false ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'id',
      title: '',
      width: '60px',
      render: (_, row) => (
        <Link href={`/employer/employees/${row.id}`} className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors inline-flex items-center justify-center">
          <Eye className="h-4 w-4" />
        </Link>
      ),
    },
  ];

  if (userLoading || loading) return <BrandLoader />;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Employees</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {employees.length} team member{employees.length !== 1 ? 's' : ''} in your organisation
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors shadow-sm"
        >
          <UserPlus className="h-4 w-4" />
          Add Employee
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total',    value: employees.length,                                          color: 'text-gray-800 dark:text-gray-100' },
          { label: 'Active',   value: employees.filter(e => e.is_active !== false).length,       color: 'text-emerald-600' },
          { label: 'Managers', value: employees.filter(e => e.role === 'manager').length,        color: 'text-blue-600' },
          { label: 'HR',       value: employees.filter(e => e.role === 'hr').length,             color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* DataList */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
        <DataList<Employee>
          data={employees}
          columns={columns}
          rowKey="id"
          searchPlaceholder="Search by name, email, department…"
          defaultPageSize={25}
          emptyMessage="No employees found. Add your first employee to get started."
          onExport={() => {
            const csv = [
              ['Name', 'Email', 'Role', 'Department', 'Position', 'Status'],
              ...employees.map(e => [
                `${e.first_name} ${e.last_name}`,
                e.email, e.role,
                e.department ?? '',
                e.position ?? '',
                e.is_active !== false ? 'Active' : 'Inactive',
              ]),
            ].map(r => r.join(',')).join('\n');
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
            a.download = 'employees.csv';
            a.click();
          }}
        />
      </div>

      {/* Add Employee Modal */}
      <AnimatePresence>
        {showAddModal && user?.company_id && (
          <AddEmployeeModal
            companyId={user.company_id}
            onClose={() => setShowAddModal(false)}
            onSuccess={fetchEmployees}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default withAuth(EmployeesPage, ['employer', 'hr', 'admin']);
