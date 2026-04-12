'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { toast } from 'sonner';
import { withAuth } from '@/components/auth/with-auth';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import ServerAddress from '@/constent/ServerAddress';

function AddDepartmentPage() {
  const router = useRouter();
  const { user } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    departmentName: '',
    description: '',
    departmentHead: '',
    departmentHeadEmail: '',
    departmentHeadId: '', // optional: if you have user ID reference
    status: 'active', // active/inactive
    parentDepartment: '', // optional: for sub-departments
    location: '', // optional: office location
    budgetCode: '', // optional: for financial tracking
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.departmentName.trim()) e.departmentName = 'Department name is required';
    if (form.departmentName.trim().length < 2) e.departmentName = 'Minimum 2 characters';
    if (form.departmentName.trim().length > 100) e.departmentName = 'Maximum 100 characters';
    if (!form.description.trim()) e.description = 'Description is required';
    if (form.description.trim().length < 10) e.description = 'Minimum 10 characters';
    if (!form.departmentHead.trim()) e.departmentHead = 'Department head name is required';
    if (form.departmentHeadEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.departmentHeadEmail)) {
      e.departmentHeadEmail = 'Valid email address required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!user?.company_id) {
      toast.error('Organisation context missing.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${ServerAddress}/createDepartment`,
        { 
          ...form, 
          company_id: user.company_id,
          createdBy: user.id,
          createdAt: new Date().toISOString()
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      toast.success('Department successfully created');
      router.push('/employer/departments');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err?.response?.data?.message || 'Failed to create department');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-8 max-w-[1240px] mx-auto space-y-6">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="group flex items-center justify-center h-10 w-10 rounded-md bg-secondary/80 hover:bg-secondary border border-border transition-all"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight sm:text-2xl">Add New Department</h1>
            <p className="text-xs font-medium text-muted-foreground mt-1 opacity-80">Organize your teams & streamline operations</p>
          </div>
        </div>
      </div>

      <Card className="bg-card dark:bg-gray-950/20 rounded-lg border border-border shadow-sm overflow-hidden">
        <CardHeader className="p-6 sm:p-8 border-b border-border bg-secondary/5">
          <CardTitle className="text-base font-bold tracking-tight text-foreground uppercase">Department Details</CardTitle>
          <CardDescription className="text-xs font-medium text-muted-foreground mt-1">Create a new department to structure your organization</CardDescription>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* ── Section 1: Basic Information ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 bg-emerald-500 rounded-full" />
                <h3 className="text-xs font-bold text-foreground tracking-widest uppercase">Basic Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
                    Department Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.departmentName}
                    onChange={e => setForm(f => ({ ...f, departmentName: e.target.value }))}
                    placeholder="e.g. Engineering, Human Resources, Marketing"
                    className={`h-10 bg-transparent border-border rounded-md font-medium text-sm focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500 ${errors.departmentName ? 'border-red-500' : ''}`}
                  />
                  {errors.departmentName && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">{errors.departmentName}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
                    Department Status
                  </Label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-emerald-500/20 focus:outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the department's purpose, responsibilities, and scope..."
                  rows={4}
                  className={`bg-transparent border-border rounded-md font-medium text-sm focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500 ${errors.description ? 'border-red-500' : ''}`}
                />
                <p className="text-[10px] font-medium text-muted-foreground">
                  {form.description.length}/500 characters
                </p>
                {errors.description && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">{errors.description}</p>}
              </div>
            </div>

            <Separator className="bg-border/40" />

            {/* ── Section 2: Department Leadership ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 bg-indigo-500 rounded-full" />
                <h3 className="text-xs font-bold text-foreground tracking-widest uppercase">Leadership & Reporting</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
                    Department Head <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.departmentHead}
                    onChange={e => setForm(f => ({ ...f, departmentHead: e.target.value }))}
                    placeholder="Full name of department head"
                    className={`h-10 bg-transparent border-border rounded-md font-medium text-sm focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500 ${errors.departmentHead ? 'border-red-500' : ''}`}
                  />
                  {errors.departmentHead && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">{errors.departmentHead}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
                    Department Head Email
                  </Label>
                  <Input
                    type="email"
                    value={form.departmentHeadEmail}
                    onChange={e => setForm(f => ({ ...f, departmentHeadEmail: e.target.value }))}
                    placeholder="head@company.com"
                    className={`h-10 bg-transparent border-border rounded-md font-medium text-sm focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500 ${errors.departmentHeadEmail ? 'border-red-500' : ''}`}
                  />
                  {errors.departmentHeadEmail && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">{errors.departmentHeadEmail}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
                    Department Head ID (Optional)
                  </Label>
                  <Input
                    value={form.departmentHeadId}
                    onChange={e => setForm(f => ({ ...f, departmentHeadId: e.target.value }))}
                    placeholder="Employee ID of department head"
                    className="h-10 bg-transparent border-border rounded-md font-medium text-sm focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-border/40" />

            {/* ── Section 3: Additional Settings ── */}
            {/* <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 bg-amber-500 rounded-full" />
                <h3 className="text-xs font-bold text-foreground tracking-widest uppercase">Additional Settings</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
                    Parent Department
                  </Label>
                  <Input
                    value={form.parentDepartment}
                    onChange={e => setForm(f => ({ ...f, parentDepartment: e.target.value }))}
                    placeholder="e.g. Operations (if sub-department)"
                    className="h-10 bg-transparent border-border rounded-md font-medium text-sm focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <p className="text-[10px] font-medium text-muted-foreground">Leave empty if this is a top-level department</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
                    Office Location
                  </Label>
                  <Input
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="e.g. New York HQ, London Office"
                    className="h-10 bg-transparent border-border rounded-md font-medium text-sm focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
                    Budget Code / Cost Center
                  </Label>
                  <Input
                    value={form.budgetCode}
                    onChange={e => setForm(f => ({ ...f, budgetCode: e.target.value }))}
                    placeholder="e.g. DEPT-ENG-001"
                    className="h-10 bg-transparent border-border rounded-md font-medium text-sm focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>
            </div> */}

            {/* ── Actions ── */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-border">
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full sm:w-auto px-6 py-2 bg-secondary/50 hover:bg-secondary text-foreground font-bold text-xs uppercase tracking-wider rounded-md transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-10 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-md shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                {submitting ? 'Creating...' : 'Create Department'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(AddDepartmentPage, ['employer', 'hr', 'admin']);