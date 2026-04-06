'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { toast } from 'sonner';
import { withAuth } from '@/components/auth/with-auth';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const BASE_URL = 'http://74.162.66.197/api';

function AddEmployeePage() {
  const router = useRouter();
  const { user } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'employee',
    department: '',
    position: '',
    phone: '',
    managerId: '',
    hierarchyLevel: 1,
    permissions: {},
    sendWelcomeEmail: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email.trim()) e.email = 'Required';
    if (!form.password || form.password.length < 6) e.password = 'Min 6 chars';
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
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
        `${BASE_URL}/createEmployee`,
        { ...form, company_id: user.company_id },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      toast.success('Employee successfully added to organisation');
      router.push('/employer/employees');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add employee');
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
            <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight sm:text-2xl">Add New Colleague</h1>
            <p className="text-xs font-medium text-muted-foreground mt-1 opacity-80">Expand your organisation's reach & efficiency with ease</p>
          </div>
        </div>
      </div>

      <Card className="bg-card dark:bg-gray-950/20 rounded-lg border border-border shadow-sm overflow-hidden">
        <CardHeader className="p-6 sm:p-8 border-b border-border bg-secondary/5">
          <CardTitle className="text-base font-bold tracking-tight text-foreground uppercase">Onboarding Details</CardTitle>
          <CardDescription className="text-xs font-medium text-muted-foreground mt-1">Complete the entries below to register a new account</CardDescription>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* ── Section 1: Personal Identity ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 bg-emerald-500 rounded-full" />
                <h3 className="text-xs font-bold text-foreground tracking-widest uppercase">Personal Identity</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">First Name</Label>
                  <Input
                    value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    placeholder="e.g. John"
                    className={`h-10 bg-transparent border-border rounded-md font-medium text-sm focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500 ${errors.firstName ? 'border-red-500' : ''}`}
                  />
                  {errors.firstName && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">{errors.firstName}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Last Name</Label>
                  <Input
                    value={form.lastName}
                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    placeholder="e.g. Doe"
                    className={`h-10 bg-transparent border-border rounded-md font-medium text-sm focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500 ${errors.lastName ? 'border-red-500' : ''}`}
                  />
                  {errors.lastName && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">{errors.lastName}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Email Address</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="john@company.com"
                    className={`h-10 bg-transparent border-border rounded-md font-medium text-sm focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500 ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">{errors.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Contact Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+91 00000 00000"
                    className="h-10 bg-transparent border-border rounded-md font-medium text-sm focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-border/40" />

            {/* ── Section 2: Professional Role ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 bg-indigo-500 rounded-full" />
                <h3 className="text-xs font-bold text-foreground tracking-widest uppercase">Professional Role</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Org Role</Label>
                  <select
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-indigo-500/20 focus:outline-none focus:border-indigo-500 transition-all opacity-90"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="hr">HR Personnel</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Department</Label>
                  <Input
                    value={form.department}
                    onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                    placeholder="e.g. Engineering"
                    className="h-10 bg-transparent border-border rounded-md font-medium text-sm focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Position / Title</Label>
                  <Input
                    value={form.position}
                    onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                    placeholder="e.g. Project Manager"
                    className="h-10 bg-transparent border-border rounded-md font-medium text-sm focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Manager ID</Label>
                  <Input
                    value={form.managerId}
                    onChange={e => setForm(f => ({ ...f, managerId: e.target.value }))}
                    placeholder="Enter manager's UID"
                    className="h-10 bg-transparent border-border rounded-md font-medium text-sm focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Hierarchy Level</Label>
                  <Input
                    type="number"
                    value={form.hierarchyLevel}
                    onChange={e => setForm(f => ({ ...f, hierarchyLevel: parseInt(e.target.value) }))}
                    className="h-10 bg-transparent border-border rounded-md font-medium text-sm focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-border/40" />

            {/* ── Section 3: Account access ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 bg-amber-500 rounded-full" />
                <h3 className="text-xs font-bold text-foreground tracking-widest uppercase">Account access</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:pr-40">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Temporary Password</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className={`h-10 bg-transparent border-border rounded-md font-medium text-sm focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  {errors.password && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">{errors.password}</p>}
                </div>
                <div className="flex items-center justify-between p-3.5 bg-secondary/5 rounded-md border border-border group">
                  <div>
                    <Label className="text-[10px] font-bold text-foreground uppercase tracking-wider">Automation</Label>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">Send credentials email</p>
                  </div>
                  <Switch 
                    checked={form.sendWelcomeEmail}
                    onCheckedChange={(checked) => setForm(f => ({ ...f, sendWelcomeEmail: checked }))}
                    className="data-[state=checked]:bg-emerald-500 scale-90"
                  />
                </div>
              </div>
            </div>

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
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? 'Creating...' : 'Create Employee'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(AddEmployeePage, ['employer', 'hr', 'admin']);
