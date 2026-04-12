'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, UserPlus, Mail, User as UserIcon, Building, Users, Shield, Crown } from 'lucide-react';
import { Spinner, SectionLoader } from '@/components/loader';
import { auth, db } from '@/lib/firebase'; // Import Firebase auth and db
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, setDoc, query, where, getDocs } from 'firebase/firestore'; // Import Firestore functions
import { useUser } from '@/hooks/use-user';
import { updateReportingChain } from '@/lib/hierarchy-service';
import { toast } from 'sonner';
import type { User } from '@/types/index';
import { Navbar } from '@/components/newcomponents';
export default function NewEmployeePage() {
  const { user } = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch potential managers on component mount
  useEffect(() => {
    const fetchManagers = async () => {
      if (!user?.company_id) return;

      try {
        const managersRef = collection(db, 'users');
        const managersQuery = query(
          managersRef,
          where('company_id', '==', user.company_id),
          where('is_active', '==', true)
        );
        const managersSnapshot = await getDocs(managersQuery);
        const managersData = managersSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as User))
          .filter(u => u.role === 'manager' || u.role === 'hr' || u.role === 'admin' || u.role === 'employer');

        setManagers(managersData);
      } catch (error) {
        console.error('Error fetching managers:', error);
      }
    };

    fetchManagers();
  }, [user?.company_id]);

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    department: '',
    position: '',
    managerId: '',
    hierarchyLevel: '4', // Default to individual contributor
    password: '',
    confirmPassword: '',
    canViewTeamReports: false,
    canApproveLeaves: false,
    canManageEmployees: false,
    isDepartmentHead: false,
    skipLevelAccess: false,
  });

  const [managers, setManagers] = useState<any[]>([]);

  const departments = [
    'Engineering',
    'Marketing',
    'Sales',
    'Human Resources',
    'Finance',
    'Operations',
    'Customer Support',
    'Product',
    'Design',
    'Legal',
    'Other'
  ];

  const hierarchyLevels = [
    { value: '0', label: 'Executive (CEO, President)', icon: Crown },
    { value: '1', label: 'Senior Management (VP, SVP)', icon: Crown },
    { value: '2', label: 'Middle Management (Director)', icon: Shield },
    { value: '3', label: 'Team Lead (Manager)', icon: Users },
    { value: '4', label: 'Individual Contributor', icon: UserIcon },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field.startsWith('can') || field.startsWith('is') || field === 'skipLevelAccess'
        ? value === 'true'
        : value
    }));
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({
      ...prev,
      password: password,
      confirmPassword: password
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!user || !user.company_id) {
      setError('User information not available');
      setLoading(false);
      return;
    }

    if (!['employer', 'hr', 'admin', 'manager'].includes(user.role)) {
      setError('You do not have permission to add employees');
      setLoading(false);
      return;
    }

    // Validation
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // Determine role based on hierarchy level and permissions
      let role = 'employee';
      const hierarchyLevel = parseInt(formData.hierarchyLevel);
      if (hierarchyLevel <= 2 || formData.canManageEmployees) {
        role = 'manager';
      }

      // Call our API route to create the user via Admin SDK
      const res = await fetch(`/api/createEmployee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: role,
          department: formData.department || '',
          position: formData.position || '',
          company_id: user.company_id,
          managerId: formData.managerId,
          hierarchyLevel,
          permissions: {
            is_department_head: formData.isDepartmentHead,
            can_view_team_reports: formData.canViewTeamReports,
            can_approve_leaves: formData.canApproveLeaves,
            can_manage_employees: formData.canManageEmployees,
            skip_level_access: formData.skipLevelAccess,
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create employee');
      }

      toast.success('Employee added successfully with hierarchy setup!');

      setTimeout(() => {
        router.push('/employer/employees');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <SectionLoader size="md" message="Loading user information..." color="text-gray-400" />;
  }

  if (!['employer', 'hr', 'admin', 'manager'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">You do not have permission to add employees.</p>
          <Button asChild>
            <Link href={`/${user.role}/dashboard`}>Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar user={user || undefined} />

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/employer/employees" className="inline-flex items-center text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest mb-4 group">
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Employees
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Add New Employee (Legacy)</h1>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 opacity-80 uppercase tracking-wider">
            Setup a new member in the legacy database
          </p>
        </div>

        <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm rounded-lg overflow-hidden">
          <CardHeader className="p-6 sm:p-8 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="flex items-center gap-2">
              <div className="h-5 w-1 bg-emerald-500 rounded-full" />
              <CardTitle className="text-base font-bold tracking-tight text-gray-800 dark:text-gray-100 uppercase">Employee Configuration</CardTitle>
            </div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mt-1">Configure profile and access levels</p>
          </CardHeader>
          
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-10">
              {error && (
                <Alert variant="destructive" className="rounded-md border-red-500/50 bg-red-500/5">
                  <AlertDescription className="text-xs font-bold uppercase">{error}</AlertDescription>
                </Alert>
              )}

              {/* Personal Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-1 bg-blue-500 rounded-full" />
                  <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200 tracking-widest uppercase">Personal Identity</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="h-10 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="h-10 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 opacity-50" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@company.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="h-10 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm pl-10 focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Work Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-1 bg-purple-500 rounded-full" />
                  <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200 tracking-widest uppercase">Professional Role</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="department" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Department</Label>
                    <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                      <SelectTrigger className="h-10 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept} className="text-sm font-medium">{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="position" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Position/Title</Label>
                    <Input
                      id="position"
                      placeholder="Software Engineer"
                      value={formData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      className="h-10 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Hierarchy Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-1 bg-amber-500 rounded-full" />
                  <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200 tracking-widest uppercase">Hierarchy & Reporting</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="hierarchyLevel" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Hierarchy Level</Label>
                    <Select value={formData.hierarchyLevel} onValueChange={(value) => handleInputChange('hierarchyLevel', value)}>
                      <SelectTrigger className="h-10 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {hierarchyLevels.map(level => {
                          const IconComponent = level.icon;
                          return (
                            <SelectItem key={level.value} value={level.value} className="text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <IconComponent className="h-5 w-5" />
                                <span>{level.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="managerId" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Reports To (Manager)</Label>
                    <Select value={formData.managerId} onValueChange={(value) => handleInputChange('managerId', value)}>
                      <SelectTrigger className="h-10 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm">
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="text-sm font-medium">No Manager</SelectItem>
                        {managers.map(manager => (
                          <SelectItem key={manager.id} value={manager.id} className="text-sm font-medium">
                            {manager.first_name} {manager.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Permissions Grid */}
                <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-lg p-6 space-y-6">
                  <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Permissions & Responsibilities</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {[
                      { id: 'isDepartmentHead', label: 'Department Head', sub: 'Oversee entire department' },
                      { id: 'canViewTeamReports', label: 'View Team Reports', sub: 'Access team wellness data' },
                      { id: 'canApproveLeaves', label: 'Approve Leaves', sub: 'Handle time-off requests' },
                      { id: 'canManageEmployees', label: 'Manage Employees', sub: 'Add or edit team members' },
                      { id: 'skipLevelAccess', label: 'Skip-Level Access', sub: 'View reports of deeper teams' }
                    ].map((perm) => (
                      <div key={perm.id} className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor={perm.id} className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">{perm.label}</Label>
                          <p className="text-[10px] font-medium text-gray-400 uppercase">{perm.sub}</p>
                        </div>
                        <Switch
                          id={perm.id}
                          checked={(formData as any)[perm.id]}
                          onCheckedChange={(checked) => handleInputChange(perm.id, checked.toString())}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Account Security */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-1 bg-red-500 rounded-full" />
                    <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200 tracking-widest uppercase">Security Credentials</h3>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateRandomPassword}
                    className="text-[10px] font-bold uppercase tracking-widest h-8 px-4 rounded-md border-gray-200 dark:border-gray-800"
                  >
                    Auto Generate
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="h-10 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="h-10 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-8 border-t border-gray-100 dark:border-gray-800">
                <Button variant="ghost" type="button" onClick={() => router.back()} className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full sm:w-auto px-10 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-md shadow-sm active:scale-95 transition-all"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <Spinner size="sm" color="border-white" className="mr-2" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <UserPlus className="h-5 w-5 mr-2" />
                      Create Account
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Strip */}
        <div className="mt-8 flex items-start gap-4 p-6 bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20 rounded-lg">
          <Shield className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Legacy Account Policy</h4>
            <ul className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-loose space-y-1 list-disc ml-4 opacity-80">
              <li>Credentials will be sent via email automatically</li>
              <li>Encrypted storage for all wellness metrics</li>
              <li>Privacy-first anonymized reporting for employers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
