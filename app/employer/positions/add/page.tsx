'use client';

import { useState, useEffect } from 'react';
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

function AddPositionPage() {
  const router = useRouter();
  const { user } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [form, setForm] = useState({
    positionName: '',
    description: '',
    departmentId: '',
    departmentName: '',
    level: 'junior', // junior, mid, senior, lead, principal, executive
    employmentType: 'full-time', // full-time, part-time, contract, internship, freelance
    minSalary: '',
    maxSalary: '',
    currency: 'USD',
    location: '',
    remoteAllowed: false,
    responsibilities: '',
    requirements: '',
    benefits: '',
    reportingTo: '',
    status: 'active', // active, inactive, on-hold
    openingCount: 1,
    priority: 'medium', // low, medium, high, urgent
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch departments for dropdown
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!user?.company_id) return;
      
      setLoadingDepartments(true);
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(`${ServerAddress}/getDepartments`, {
          params: { company_id: user.company_id },
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setDepartments(response.data.departments || []);
      } catch (err) {
        console.error('Failed to fetch departments:', err);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, [user?.company_id]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.positionName.trim()) e.positionName = 'Position name is required';
    if (form.positionName.trim().length < 2) e.positionName = 'Minimum 2 characters';
    if (form.positionName.trim().length > 100) e.positionName = 'Maximum 100 characters';
    if (!form.description.trim()) e.description = 'Description is required';
    if (form.description.trim().length < 10) e.description = 'Minimum 10 characters';
    if (!form.departmentId) e.departmentId = 'Please select a department';
    if (form.minSalary && isNaN(Number(form.minSalary))) e.minSalary = 'Must be a valid number';
    if (form.maxSalary && isNaN(Number(form.maxSalary))) e.maxSalary = 'Must be a valid number';
    if (form.minSalary && form.maxSalary && Number(form.minSalary) > Number(form.maxSalary)) {
      e.minSalary = 'Min salary cannot exceed max salary';
    }
    if (form.openingCount && (form.openingCount < 1 || form.openingCount > 100)) {
      e.openingCount = 'Opening count must be between 1 and 100';
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
        `${ServerAddress}/createPosition`,
        { 
          ...form, 
          company_id: user.company_id,
          createdBy: user.id,
          createdAt: new Date().toISOString(),
          minSalary: form.minSalary ? Number(form.minSalary) : null,
          maxSalary: form.maxSalary ? Number(form.maxSalary) : null,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      toast.success('Position successfully created');
      router.push('/employer/positions');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err?.response?.data?.message || 'Failed to create position');
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
            <h1 className="text-xl font-bold text-foreground tracking-tight sm:text-2xl">Add New Position</h1>
            <p className="text-xs font-medium text-muted-foreground mt-1 opacity-80">Define roles & responsibilities for your organization</p>
          </div>
        </div>
      </div>

      <Card className="bg-card dark:bg-gray-950/20 rounded-lg border border-border shadow-sm overflow-hidden">
        <CardHeader className="p-6 sm:p-8 border-b border-border bg-secondary/5">
          <CardTitle className="text-base font-bold tracking-tight text-foreground uppercase">Position Details</CardTitle>
          <CardDescription className="text-xs font-medium text-muted-foreground mt-1">Create a new job position to attract the right talent</CardDescription>
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
                    Position Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.positionName}
                    onChange={e => setForm(f => ({ ...f, positionName: e.target.value }))}
                    placeholder="e.g. Senior Software Engineer, Marketing Manager"
                    className={`h-10 bg-transparent border-border rounded-md font-medium text-sm focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500 ${errors.positionName ? 'border-red-500' : ''}`}
                  />
                  {errors.positionName && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">{errors.positionName}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <select
                    value={form.departmentId}
                    onChange={e => {
                      const selectedDept = departments.find(d => d.id === e.target.value);
                      setForm(f => ({ 
                        ...f, 
                        departmentId: e.target.value,
                        departmentName: selectedDept?.name || ''
                      }));
                    }}
                    className={`flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-emerald-500/20 focus:outline-none focus:border-emerald-500 transition-all ${errors.departmentId ? 'border-red-500' : ''}`}
                    disabled={loadingDepartments}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                  {errors.departmentId && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">{errors.departmentId}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
                    Position Level
                  </Label>
                  <select
                    value={form.level}
                    onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-emerald-500/20 focus:outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="junior">Junior</option>
                    <option value="mid">Mid-Level</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                    <option value="principal">Principal</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
                    Employment Type
                  </Label>
                  <select
                    value={form.employmentType}
                    onChange={e => setForm(f => ({ ...f, employmentType: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-emerald-500/20 focus:outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="full-time">Full-Time</option>
                    <option value="part-time">Part-Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
                    Status
                  </Label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-emerald-500/20 focus:outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
                    Priority
                  </Label>
                  <select
                    value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-emerald-500/20 focus:outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
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
                  placeholder="Describe the position's purpose, responsibilities, and impact..."
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

            {/* ── Section 2: Compensation & Location ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 bg-indigo-500 rounded-full" />
                <h3 className="text-xs font-bold text-foreground tracking-widest uppercase">Compensation & Location</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
                    Currency
                  </Label>
                  <select
                    value={form.currency}
                    onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-indigo-500/20 focus:outline-none focus:border-indigo-500 transition-all"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
                    Minimum Salary
                  </Label>
                  <Input
                    type="number"
                    value={form.minSalary}
                    onChange={e => setForm(f => ({ ...f, minSalary: e.target.value }))}
                    placeholder="e.g. 50000"
                    className={`h-10 bg-transparent border-border rounded-md font-medium text-sm focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500 ${errors.minSalary ? 'border-red-500' : ''}`}
                  />
                  {errors.minSalary && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">{errors.minSalary}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
                    Maximum Salary
                  </Label>
                  <Input
                    type="number"
                    value={form.maxSalary}
                    onChange={e => setForm(f => ({ ...f, maxSalary: e.target.value }))}
                    placeholder="e.g. 80000"
                    className={`h-10 bg-transparent border-border rounded-md font-medium text-sm focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500 ${errors.maxSalary ? 'border-red-500' : ''}`}
                  />
                  {errors.maxSalary && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">{errors.maxSalary}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
                    Location
                  </Label>
                  <Input
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="e.g. New York, NY (or Remote)"
                    className="h-10 bg-transparent border-border rounded-md font-medium text-sm focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
                    Opening Count
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={form.openingCount}
                    onChange={e => setForm(f => ({ ...f, openingCount: parseInt(e.target.value) || 1 }))}
                    className={`h-10 bg-transparent border-border rounded-md font-medium text-sm focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500 ${errors.openingCount ? 'border-red-500' : ''}`}
                  />
                  {errors.openingCount && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">{errors.openingCount}</p>}
                </div>

                <div className="flex items-center justify-between p-3.5 bg-secondary/5 rounded-md border border-border group">
                  <div>
                    <Label className="text-[10px] font-bold text-foreground uppercase tracking-wider">Remote Work</Label>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight">Allow remote work</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.remoteAllowed}
                    onChange={(e) => setForm(f => ({ ...f, remoteAllowed: e.target.checked }))}
                    className="h-5 w-5 rounded border-border bg-transparent focus:ring-indigo-500 focus:ring-1"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-border/40" />

            {/* ── Section 3: Job Details ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-1 bg-amber-500 rounded-full" />
                <h3 className="text-xs font-bold text-foreground tracking-widest uppercase">Job Details</h3>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
                    Key Responsibilities
                  </Label>
                  <Textarea
                    value={form.responsibilities}
                    onChange={e => setForm(f => ({ ...f, responsibilities: e.target.value }))}
                    placeholder="• Lead development of key features&#10;• Collaborate with cross-functional teams&#10;• Mentor junior developers"
                    rows={5}
                    className="bg-transparent border-border rounded-md font-medium text-sm focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
                    Requirements & Qualifications
                  </Label>
                  <Textarea
                    value={form.requirements}
                    onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))}
                    placeholder="• Bachelor's degree in Computer Science&#10;• 5+ years of experience&#10;• Strong knowledge of React and Node.js"
                    rows={5}
                    className="bg-transparent border-border rounded-md font-medium text-sm focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
                    Benefits & Perks
                  </Label>
                  <Textarea
                    value={form.benefits}
                    onChange={e => setForm(f => ({ ...f, benefits: e.target.value }))}
                    placeholder="• Health insurance&#10;• 401(k) matching&#10;• Flexible work hours&#10;• Professional development budget"
                    rows={4}
                    className="bg-transparent border-border rounded-md font-medium text-sm focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-0.5">
                    Reports To (Manager Name)
                  </Label>
                  <Input
                    value={form.reportingTo}
                    onChange={e => setForm(f => ({ ...f, reportingTo: e.target.value }))}
                    placeholder="e.g. VP of Engineering"
                    className="h-10 bg-transparent border-border rounded-md font-medium text-sm focus:ring-1 focus:ring-amber-500/20 focus:border-amber-500"
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
                {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                {submitting ? 'Creating...' : 'Create Position'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(AddPositionPage, ['employer', 'hr', 'admin']);