

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { useUser } from '@/hooks/use-user';
import { toast } from 'sonner';
import type { User } from '@/types/index';
import ServerAddress from '@/constent/ServerAddress';
import axios from 'axios';

interface EmployeeData {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  position: string;
  phone: string;
  companyId: string;
  managerId: string;
  hierarchyLevel: number;
  isActive: boolean;
  permissions: {
    is_department_head?: boolean;
    can_view_team_reports?: boolean;
    can_approve_leaves?: boolean;
    can_manage_employees?: boolean;
    skip_level_access?: boolean;
    [key: string]: boolean | undefined;
  };
  createdAt: string;
  createdBy: string;
}

export default function NewEmployeePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get('id');
  const user = JSON.parse(localStorage.getItem('user_profile') || '{}');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(!!employeeId);
  const [managers, setManagers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role:'',
    department: '',
    position: '',
    phone: '',
    managerId: '',
    hierarchyLevel: '4',
    password: '',
    confirmPassword: '',
    canViewTeamReports: false,
    canApproveLeaves: false,
    canManageEmployees: false,
    isDepartmentHead: false,
    skipLevelAccess: false,
    sendWelcomeEmail: true,
  });

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

  // Fetch potential managers on component mount
useEffect(() => {
  const fetchManagers = async () => {
    try {
      const token = localStorage.getItem('access_token');

      const response = await axios.get(`${ServerAddress}/employees`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        // params: {
        //   company_id: user?.company_id,
        //   role: 'manager,hr,admin,employer',
        // },
      });

      console.log("Managers list", response.data);

      // Example usage:
      // setManagers(response.data.filter((m) => m.uid !== employeeId));

    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  fetchManagers();
}, []);

  // Fetch employee data for update
  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!employeeId) {
        setFetchLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('access_token');
        
        const response = await fetch(`${ServerAddress}/employees/${employeeId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch employee data');
        }

        const data: EmployeeData = await response.json();
        setIsUpdating(true);

        // Populate form with fetched data
        setFormData({
          email: data.email || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          role: data.role || '',
          department: data.department || '',
          position: data.position || '',
          phone: data.phone || '',
          managerId: data.managerId || '',
          hierarchyLevel: data.hierarchyLevel?.toString() || '4',
          password: '',
          confirmPassword: '',
          canViewTeamReports: data.permissions?.can_view_team_reports || false,
          canApproveLeaves: data.permissions?.can_approve_leaves || false,
          canManageEmployees: data.permissions?.can_manage_employees || false,
          isDepartmentHead: data.permissions?.is_department_head || false,
          skipLevelAccess: data.permissions?.skip_level_access || false,
          sendWelcomeEmail: true,
        });
      } catch (err: any) {
        console.error('Error fetching employee:', err);
        setError(err.message || 'Failed to load employee data');
        toast.error('Failed to load employee data');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchEmployeeData();
  }, [employeeId]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError('');

  //   // if (!['employer', 'hr', 'admin', 'manager'].includes(user.role)) {
  //   //   setError('You do not have permission to add employees');
  //   //   setLoading(false);
  //   //   return;
  //   // }

  //   // Validation for create operation
  //   if (!isUpdating) {
  //     if (!formData.email || !formData.firstName || !formData.lastName || !formData.password) {
  //       setError('Please fill in all required fields');
  //       setLoading(false);
  //       return;
  //     }
  //     if (formData.password !== formData.confirmPassword) {
  //       setError('Passwords do not match');
  //       setLoading(false);
  //       return;
  //     }
  //     if (formData.password.length < 6) {
  //       setError('Password must be at least 6 characters');
  //       setLoading(false);
  //       return;
  //     }
  //   } else {
  //     // For update, only validate name fields
  //     if (!formData.firstName || !formData.lastName) {
  //       setError('First name and last name are required');
  //       setLoading(false);
  //       return;
  //     }
  //   }

  //   try {
  //     // Determine role based on hierarchy level and permissions
  //      const hierarchyLevel = parseInt(formData.hierarchyLevel);
  //     if (hierarchyLevel <= 2 || formData.canManageEmployees) {
  //       role = 'manager';
  //     }

  //     const token = localStorage.getItem('access_token');
  //     let response;

  //     if (isUpdating && employeeId) {
  //       // UPDATE: PATCH /api/employees/{uid}
  //       const updateData = {
  //         firstName: formData.firstName,
  //         lastName: formData.lastName,
  //         role: formData.role || "",
  //         department: formData.department || '',
  //         position: formData.position || '',
  //         phone: formData.phone || '',
  //         managerId: formData.managerId || '',
  //         hierarchyLevel: hierarchyLevel,
  //          permissions: {
  //           is_department_head: formData.isDepartmentHead,
  //           can_view_team_reports: formData.canViewTeamReports,
  //           can_approve_leaves: formData.canApproveLeaves,
  //           can_manage_employees: formData.canManageEmployees,
  //           skip_level_access: formData.skipLevelAccess,
  //         }
  //       };

  //       response = await fetch(`${ServerAddress}/employees/${employeeId}`, {
  //         method: 'PATCH',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           ...(token && { Authorization: `Bearer ${token}` }),
  //         },
  //         body: JSON.stringify(updateData)
  //       });

  //       const data = await response.json();
  //       if (!response.ok) {
  //         throw new Error(data.error || data.message || 'Failed to update employee');
  //       }

  //       toast.success('Employee updated successfully!');
  //     } else {
  //       // CREATE: POST /api/createEmployee
  //       const createData = {
  //         email: formData.email,
  //         password: formData.password,
  //         firstName: formData.firstName,
  //         lastName: formData.lastName,
  //         role: formData.role || "",
  //         department: formData.department || '',
  //         position: formData.position || '',
  //         phone: formData.phone || '',
  //         company_id: user.company_id,
  //         managerId: formData.managerId || '',
  //         hierarchyLevel: hierarchyLevel,
  //         permissions: {
  //           is_department_head: formData.isDepartmentHead,
  //           can_view_team_reports: formData.canViewTeamReports,
  //           can_approve_leaves: formData.canApproveLeaves,
  //           can_manage_employees: formData.canManageEmployees,
  //           skip_level_access: formData.skipLevelAccess,
  //         },
  //         sendWelcomeEmail: formData.sendWelcomeEmail
  //       };

  //       response = await fetch(`${ServerAddress}/employees/create`, {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           ...(token && { Authorization: `Bearer ${token}` }),
  //         },
  //         body: JSON.stringify(createData)
  //       });

  //       const data = await response.json();
  //       if (!response.ok) {
  //         throw new Error(data.error || data.message || 'Failed to create employee');
  //       }

  //       toast.success('Employee added successfully!');
  //     }

  //     setTimeout(() => {
  //       router.push('/employer/employees');
  //     }, 2000);
  //   } catch (err: any) {
  //     setError(err.message || 'An unexpected error occurred');
  //     console.error('Error:', err);
  //     toast.error(err.message || 'Operation failed');
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  // if (!['employer', 'hr', 'admin', 'manager'].includes(user.role)) {
  //   setError('You do not have permission to add employees');
  //   setLoading(false);
  //   return;
  // }

  // Validation for create operation
  if (!isUpdating) {
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
  } else {
    // For update, only validate name fields
    if (!formData.firstName || !formData.lastName) {
      setError('First name and last name are required');
      setLoading(false);
      return;
    }
  }

  try {
    // Determine role based on hierarchy level and permissions
    let role = 'employee';
    const hierarchyLevel = parseInt(formData.hierarchyLevel);
    if (hierarchyLevel <= 2 || formData.canManageEmployees) {
      role = 'manager';
    }

    const token = localStorage.getItem('access_token');
    
    // Handle managerId - convert 'none' to empty string
    const managerId = formData.managerId === 'none' ? '' : formData.managerId;

    if (isUpdating && employeeId) {
      // UPDATE: PATCH /api/employees/{uid}
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: role,
        department: formData.department || '',
        position: formData.position || '',
        phone: formData.phone || '',
        managerId: managerId,
        hierarchyLevel: hierarchyLevel,
        permissions: {
          is_department_head: formData.isDepartmentHead,
          can_view_team_reports: formData.canViewTeamReports,
          can_approve_leaves: formData.canApproveLeaves,
          can_manage_employees: formData.canManageEmployees,
          skip_level_access: formData.skipLevelAccess,
        }
      };

      const response = await axios.patch(
        `${ServerAddress}/employees/${employeeId}`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update employee');
      }

      toast.success(response.data.message || 'Employee updated successfully!');
    } else {
      // CREATE: POST /api/employees/create
      const createData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: role,
        department: formData.department || '',
        position: formData.position || '',
        phone: formData.phone || '',
        company_id: user?.company_id,
        managerId: managerId,
        hierarchyLevel: hierarchyLevel,
        permissions: {
          is_department_head: formData.isDepartmentHead,
          can_view_team_reports: formData.canViewTeamReports,
          can_approve_leaves: formData.canApproveLeaves,
          can_manage_employees: formData.canManageEmployees,
          skip_level_access: formData.skipLevelAccess,
        },
        sendWelcomeEmail: formData.sendWelcomeEmail
      };

      const response = await axios.post(
        `${ServerAddress}/employees/create`,
        createData,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create employee');
      }

      toast.success(response.data.message || 'Employee added successfully!');
    }

    setTimeout(() => {
      router.push('/employer/employees');
    }, 2000);
  } catch (err: any) {
    // Handle duplicate email error
    let errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred';
    
    // Check for duplicate email error (case insensitive)
    if (errorMessage.toLowerCase().includes('account with this email already exists') ||
        errorMessage.toLowerCase().includes('email already exists') ||
        errorMessage.toLowerCase().includes('duplicate email') ||
        err.response?.data?.detail?.toLowerCase().includes('account with this email already exists')) {
      
      errorMessage = `An account with email "${formData.email}" already exists. Please use a different email address.`;
      
      // Show alert with specific duplicate email message
      alert(errorMessage);
      
      // Also set the error in the form
      setError(errorMessage);
      
      // Highlight the email field (optional - add a ref to email input)
      const emailInput = document.getElementById('email');
      if (emailInput) {
        emailInput.classList.add('border-red-500', 'ring-red-500');
        setTimeout(() => {
          emailInput.classList.remove('border-red-500', 'ring-red-500');
        }, 3000);
      }
    } else {
      // Handle other errors
      setError(errorMessage);
      toast.error(errorMessage);
    }
    
    console.error('Error:', err);
  } finally {
    setLoading(false);
  }
};

//   const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   setLoading(true);
//   setError('');

//   // if (!['employer', 'hr', 'admin', 'manager'].includes(user.role)) {
//   //   setError('You do not have permission to add employees');
//   //   setLoading(false);
//   //   return;
//   // }

//   // Validation for create operation
//   if (!isUpdating) {
//     if (!formData.email || !formData.firstName || !formData.lastName || !formData.password) {
//       setError('Please fill in all required fields');
//       setLoading(false);
//       return;
//     }
//     if (formData.password !== formData.confirmPassword) {
//       setError('Passwords do not match');
//       setLoading(false);
//       return;
//     }
//     if (formData.password.length < 6) {
//       setError('Password must be at least 6 characters');
//       setLoading(false);
//       return;
//     }
//   } else {
//     // For update, only validate name fields
//     if (!formData.firstName || !formData.lastName) {
//       setError('First name and last name are required');
//       setLoading(false);
//       return;
//     }
//   }

//   try {
//     // Determine role based on hierarchy level and permissions
//     let role = 'employee';
//     const hierarchyLevel = parseInt(formData.hierarchyLevel);
//     if (hierarchyLevel <= 2 || formData.canManageEmployees) {
//       role = 'manager';
//     }

//     const token = localStorage.getItem('access_token');
    
//     // Handle managerId - convert empty string to null or undefined as needed
//     const managerId = formData.managerId === 'none' ? '' : formData.managerId;

//     if (isUpdating && employeeId) {
//       // UPDATE: PATCH /api/employees/{uid}
//       const updateData = {
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         role: role,
//         department: formData.department || '',
//         position: formData.position || '',
//         phone: formData.phone || '',
//         managerId: managerId,
//         hierarchyLevel: hierarchyLevel,
//         permissions: {
//           is_department_head: formData.isDepartmentHead,
//           can_view_team_reports: formData.canViewTeamReports,
//           can_approve_leaves: formData.canApproveLeaves,
//           can_manage_employees: formData.canManageEmployees,
//           skip_level_access: formData.skipLevelAccess,
//         }
//       };

//       const response = await axios.patch(
//         `${ServerAddress}/employees/${employeeId}`,
//         updateData,
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             ...(token && { Authorization: `Bearer ${token}` }),
//           },
//         }
//       );

//       if (!response.data.success) {
//         throw new Error(response.data.message || 'Failed to update employee');
//       }

//       toast.success(response.data.message || 'Employee updated successfully!');
//     } else {
//       // CREATE: POST /api/employees/create
//       const createData = {
//         email: formData.email,
//         password: formData.password,
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         role: role,
//         department: formData.department || '',
//         position: formData.position || '',
//         phone: formData.phone || '',
//         company_id: user?.company_id,
//         managerId: managerId,
//         hierarchyLevel: hierarchyLevel,
//         permissions: {
//           is_department_head: formData.isDepartmentHead,
//           can_view_team_reports: formData.canViewTeamReports,
//           can_approve_leaves: formData.canApproveLeaves,
//           can_manage_employees: formData.canManageEmployees,
//           skip_level_access: formData.skipLevelAccess,
//         },
//         sendWelcomeEmail: formData.sendWelcomeEmail
//       };

//       const response = await axios.post(
//         `${ServerAddress}/employees/create`,
//         createData,
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             ...(token && { Authorization: `Bearer ${token}` }),
//           },
//         }
//       );
// console.log("Create response" , response.detail);
//       if (!response.data.success) {
//         throw new Error(response.data.message || 'Failed to create employee');
//       }

//       toast.success(response.data.message || 'Employee added successfully!');
//     }

//     setTimeout(() => {
//       router.push('/employer/employees');
//     }, 2000);
//   } catch (err: any) {
//     const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred';
//     setError(errorMessage);
//     console.error('Error:', err);
//     console.log("Create response" , err);
//     toast.error(errorMessage);
//   } finally {
//     setLoading(false);
//   }
// };


  if (fetchLoading) {
    return <SectionLoader size="md" message="Loading employee data..." color="text-gray-400" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/employer/employees" className="inline-flex items-center text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest mb-4 group">
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Employees
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            {isUpdating ? "Update Employee" : "Add New Employee"}
          </h1>
        </div>

        <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm rounded-lg overflow-hidden">
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
                      placeholder="Enter First Name"
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
                      placeholder="Enter Last Name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="h-10 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">
                    Email Address {!isUpdating && '*'}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 opacity-50" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@company.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="h-10 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm pl-10 focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500"
                      required={!isUpdating}
                      disabled={isUpdating}
                    />
                  </div>
                  {isUpdating && (
                    <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="h-10 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500"
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
                    <Label htmlFor="role" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Role</Label>
                    <Input
                      id="role"
                      placeholder="Enter Role"
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="h-10 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>


                  <div className="space-y-1.5">
                    <Label htmlFor="department" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Department</Label>
                     <Input
                      id="department"
                      placeholder="Enter Department"
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="h-10 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
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
                          <SelectItem key={manager.uid || manager.id} value={manager.uid || manager.id} className="text-sm font-medium">
                            {manager.firstName || manager.first_name} {manager.lastName || manager.last_name}
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
                          onCheckedChange={(checked) => handleInputChange(perm.id, checked)}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Account Security - Only show for new employees */}
              {!isUpdating && (
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

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sendWelcomeEmail"
                      checked={formData.sendWelcomeEmail}
                      onCheckedChange={(checked) => handleInputChange('sendWelcomeEmail', checked)}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                    <Label htmlFor="sendWelcomeEmail" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Send welcome email with login credentials
                    </Label>
                  </div>
                </div>
              )}

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
                      {isUpdating ? "Update Employee" : "Create Employee"}
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
            <h4 className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Account Policy</h4>
            <ul className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-loose space-y-1 list-disc ml-4 opacity-80">
              {!isUpdating && <li>Credentials will be sent via email automatically</li>}
              <li>Encrypted storage for all wellness metrics</li>
              <li>Privacy-first anonymized reporting for employers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

