'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Plus, X, Loader2, Pencil, Trash2,
  Users, CheckCircle, FolderOpen, Search,
  Briefcase, UserCircle, Calendar, TrendingUp,
  RefreshCw, MoreHorizontal
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { withAuth } from '@/components/auth/with-auth';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BrandLoader } from '@/components/loader';
import { db } from '@/lib/firebase';
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, query, where, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Department {
  id: string;
  name: string;
  description?: string;
  head?: string;
  employeeCount?: number;
  company_id: string;
  created_at?: any;
}

// ─── Stat Card Component ───────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  delay?: number;
}

function StatCard({ label, value, icon: Icon, color, bgColor, borderColor, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-2xl border ${borderColor} ${bgColor} p-5 backdrop-blur-sm`}
    >
      <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full bg-white/5" />
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-3xl font-black tracking-tight" style={{ color: `var(--${color})` }}>
              {value}
            </p>
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">
              {label}
            </p>
          </div>
          <div className={`p-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 shadow-sm`}>
            <Icon className="h-5 w-5" style={{ color: `var(--${color})` }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DepartmentsPage() {
  const { user, loading: userLoading } = useUser();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', head: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const companyId = user?.company_id ?? (user as any)?.companyId ?? '';

  // ─── Firestore listener ────────────────────────────────────────────────────
  useEffect(() => {
    if (!companyId) { setLoading(false); return; }
    const q = query(collection(db, 'departments'), where('company_id', '==', companyId));
    const unsub = onSnapshot(q, snap => {
      setDepartments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Department)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [companyId]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Departments refreshed');
    }, 500);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalEmployees = departments.reduce((s, d) => s + (d.employeeCount ?? 0), 0);
    const withHead = departments.filter(d => d.head).length;
    const avgEmployees = departments.length > 0 ? Math.round(totalEmployees / departments.length) : 0;
    
    return {
      total: departments.length,
      totalEmployees,
      withHead,
      avgEmployees,
    };
  }, [departments]);

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '', head: '' }); setErrors({}); setShowForm(true); };
  const openEdit = (dept: Department) => { setEditing(dept); setForm({ name: dept.name, description: dept.description ?? '', head: dept.head ?? '' }); setErrors({}); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); setErrors({}); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Department name is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !companyId) return;
    setSubmitting(true);
    try {
      if (editing) {
        await updateDoc(doc(db, 'departments', editing.id), {
          name: form.name.trim(),
          description: form.description.trim(),
          head: form.head.trim(),
        });
        toast.success('Department updated successfully');
      } else {
        await addDoc(collection(db, 'departments'), {
          name: form.name.trim(),
          description: form.description.trim(),
          head: form.head.trim(),
          company_id: companyId,
          employeeCount: 0,
          created_at: serverTimestamp(),
        });
        toast.success('Department created successfully');
      }
      closeForm();
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'departments', id));
      toast.success('Department deleted successfully');
    } catch {
      toast.error('Failed to delete department');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.description ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (d.head ?? '').toLowerCase().includes(search.toLowerCase())
  );

  if (userLoading || loading) return <BrandLoader />;


    const router = useRouter();

  return (
    <div className="px-4 sm:px-6 lg:px-6 py-6 max-w-[1400px] mx-auto space-y-6">
      {/* ─── Header ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-emerald-500/10">
              <Building2 className="h-5 w-5 text-emerald-500" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Organization Structure
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Departments
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Organize your company into departments and assign team leads.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            // onClick={openAdd}
            onClick={() => {
               router.push('/employer/departments/add');
            }}
            size="sm"
            className="gap-2 bg-emerald-500 hover:bg-emerald-600"
          >
            <Plus className="h-5 w-5" />
            Add Department
          </Button>
        </div>
      </motion.div>

      {/* ─── Summary cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Departments"
          value={stats.total}
          icon={Building2}
          color="tw-gray-800"
          bgColor="bg-white dark:bg-gray-900"
          borderColor="border-gray-200 dark:border-gray-800"
          delay={0}
        />
        <StatCard
          label="Total Employees"
          value={stats.totalEmployees}
          icon={Users}
          color="tw-emerald-600"
          bgColor="bg-emerald-50 dark:bg-emerald-950/30"
          borderColor="border-emerald-200 dark:border-emerald-900/50"
          delay={0.1}
        />
        <StatCard
          label="With Team Lead"
          value={stats.withHead}
          icon={UserCircle}
          color="tw-blue-600"
          bgColor="bg-blue-50 dark:bg-blue-950/30"
          borderColor="border-blue-200 dark:border-blue-900/50"
          delay={0.2}
        />
        <StatCard
          label="Avg. Team Size"
          value={stats.avgEmployees}
          icon={TrendingUp}
          color="tw-purple-600"
          bgColor="bg-purple-50 dark:bg-purple-950/30"
          borderColor="border-purple-200 dark:border-purple-900/50"
          delay={0.3}
        />
      </div>

      {/* ─── Search ─── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="relative max-w-sm"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search departments by name, description, or team lead..."
          className="pl-9 h-10 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl text-sm"
        />
      </motion.div>

      {/* ─── Department list ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
              <FolderOpen className="h-8 w-8 text-gray-300 dark:text-gray-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                {search ? 'No departments match your search' : 'No departments yet'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {search ? 'Try adjusting your search terms' : 'Get started by creating your first department'}
              </p>
            </div>
            {!search && (
              <Button
                onClick={openAdd}
                size="sm"
                className="mt-2 gap-2"
              >
                <Plus className="h-5 w-5" />
                Create Department
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                  {['Department', 'Description', 'Team Lead', 'Employees', 'Created', ''].map((h, i) => (
                    <th 
                      key={h} 
                      className={`px-6 py-3.5 text-left text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap ${
                        i === 0 ? '' : ''
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((dept, i) => (
                  <motion.tr
                    key={dept.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="group hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/20">
                          <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-100">
                            {dept.name}
                          </p>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                            ID: {dept.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300 max-w-[280px] line-clamp-2">
                        {dept.description || (
                          <span className="text-gray-300 dark:text-gray-600 italic">No description provided</span>
                        )}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {dept.head ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <UserCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {dept.head}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300 dark:text-gray-600 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                          <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                          {dept.employeeCount ?? 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {dept.created_at?.toDate?.() 
                            ? new Date(dept.created_at.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : '—'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(dept)}
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
                          title="Edit department"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(dept.id)}
                          disabled={deletingId === dept.id}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all disabled:opacity-40"
                          title="Delete department"
                        >
                          {deletingId === dept.id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                          title="More options"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ─── Add / Edit Modal ─── */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={closeForm}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl w-full max-w-md overflow-hidden">
                {/* Modal header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-950/20">
                  <div>
                    <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">
                      {editing ? 'Edit Department' : 'Create Department'}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {editing 
                        ? 'Update department information and settings' 
                        : 'Add a new department to your organization structure'
                      }
                    </p>
                  </div>
                  <button 
                    onClick={closeForm} 
                    className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Department Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. Engineering, Marketing, Sales"
                        className={`pl-9 h-10 rounded-xl ${errors.name ? 'border-red-400 focus:border-red-400' : 'border-gray-200 dark:border-gray-700'}`}
                      />
                    </div>
                    {errors.name && <p className="text-[10px] font-semibold text-red-500">{errors.name}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Description
                    </Label>
                    <textarea
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Brief description of this department's function and responsibilities..."
                      rows={3}
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 resize-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Team Lead / Department Head
                    </Label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        value={form.head}
                        onChange={e => setForm(f => ({ ...f, head: e.target.value }))}
                        placeholder="e.g. Jane Smith"
                        className="pl-9 h-10 rounded-xl border-gray-200 dark:border-gray-700"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Optional - You can assign a team lead later
                    </p>
                  </div>

                  <Separator className="bg-gray-100 dark:bg-gray-800" />

                  <div className="flex items-center gap-3 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeForm}
                      className="gap-2"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="gap-2 bg-emerald-500 hover:bg-emerald-600"
                    >
                      {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                      {editing ? 'Save Changes' : 'Create Department'}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default withAuth(DepartmentsPage, ['employer', 'hr', 'admin']);