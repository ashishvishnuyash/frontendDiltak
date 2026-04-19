'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Building2, Globe, Mail, Phone, MapPin, 
  Shield, CheckCircle, Save, Info, User, Briefcase, Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/loader';
import { toast } from 'sonner';
import axios from 'axios';
import ServerAddress from '@/constent/ServerAddress';

interface CompanyFormData {
  // Admin/Employer details
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  jobTitle: string;
  phone: string;
  
  // Company details
  companyName: string;
  companySize: string;
  industry: string;
  website: string;
  address?: string;
  department?: string;
  position?: string;
  hierarchyLevel?: number;
  isActive?: boolean;
  role?: string;
}

export default function AddCompanyPage() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('id');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchLoading, setFetchLoading] = useState(!!companyId);
  const [isUpdating, setIsUpdating] = useState(false);

  const [formData, setFormData] = useState<CompanyFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    jobTitle: 'Owner / Founder',
    phone: '',
    companyName: '',
    companySize: 'Not specified',
    industry: 'Not specified',
    website: '',
    address: '',
    department: '',
    position: '',
    hierarchyLevel: 0,
    isActive: true,
    role: 'employer'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Only validate password for new company creation
    if (!isUpdating && !formData.password) {
      setError('Password is required');
      return false;
    }
    if (!isUpdating && formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (!isUpdating && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.companyName.trim()) {
      setError('Company name is required');
      return false;
    }
    
    // Optional: Validate website URL format if provided
    if (formData.website && !formData.website.match(/^https?:\/\/.+\..+/)) {
      setError('Please enter a valid website URL (e.g., https://example.com)');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      
      if (isUpdating && companyId) {
        // Update existing company
        const updatePayload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          department: formData.department,
          position: formData.position,
          jobTitle: formData.jobTitle,
          hierarchyLevel: formData.hierarchyLevel,
          isActive: formData.isActive,
          role: formData.role,
          website: formData.website || "",
          companyName: formData.companyName,
          companySize: formData.companySize,
          industry: formData.industry,
          address: formData.address
        };

        const response = await axios.patch(
          `${ServerAddress}/admin/employers/${companyId}`,
          updatePayload,
          {
            headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );

        if (response.data.success || response.status === 200) {
          toast.success(response.data.message || 'Company updated successfully!');
          router.push('/admin/companies');
        } else {
          throw new Error(response.data.message || 'Failed to update company');
        }
      } else {
        // Create new company
        const createPayload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName,
          companySize: formData.companySize,
          industry: formData.industry,
          phone: formData.phone,
          jobTitle: formData.jobTitle,
          website: formData.website || undefined,
        };

        const response = await axios.post(
          `${ServerAddress}/admin/employers`,
          createPayload,
          {
            headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );

        if (response.data.success || response.status === 200 || response.status === 201) {
          toast.success(response.data.message || 'Company registered successfully!');
          router.push('/admin/companies');
        } else {
          throw new Error(response.data.message || 'Failed to register company');
        }
      }
    } catch (err: any) {
      let errorMessage = isUpdating ? 'Failed to update company' : 'Failed to register company';
      
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail[0]?.msg || JSON.stringify(err.response.data.detail);
        } else {
          errorMessage = err.response.data.detail;
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!companyId) {
        setFetchLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('access_token');
        
        const response = await fetch(`${ServerAddress}/admin/employers/${companyId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch employee data');
        }

        const data: any = await response.json();
        setIsUpdating(true);

        // Populate form with fetched data
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          password: "", // Don't populate password for security
          confirmPassword: "", // Don't populate confirm password
          companyName: data.companyName || "",
          companySize: data.companySize || "Not specified",
          industry: data.industry || "Not specified",
          phone: data.phone || "",
          jobTitle: data.jobTitle || "Owner / Founder",
          website: data.website || "",
          address: data.address || "",
          department: data.department || "",
          position: data.position || "",
          hierarchyLevel: data.hierarchyLevel || 0,
          isActive: data.isActive !== undefined ? data.isActive : true,
          role: data.role || "employer"
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
  }, [companyId]);

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/companies" className="inline-flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 uppercase tracking-widest mb-4 group">
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Companies
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            {isUpdating ? "Update Company" : "Register New Company"}
          </h1>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 opacity-80 uppercase tracking-wider">
            {isUpdating ? "Update organisation information" : "Onboard a new organisation to the Diltak platform"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            <form id="add-company-form" onSubmit={handleSubmit}>
              {/* Admin/Employer Information */}
              <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm rounded-lg overflow-hidden mb-8">
                <CardHeader className="p-6 sm:p-8 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-1 bg-indigo-500 rounded-full" />
                    <CardTitle className="text-base font-bold tracking-tight text-gray-800 dark:text-gray-100 uppercase">Administrator Information</CardTitle>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 ml-3">
                    Primary contact and account owner for the organisation
                  </p>
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                  {error && (
                    <Alert variant="destructive" className="rounded-md border-red-500/50 bg-red-500/5 mb-6">
                      <AlertDescription className="text-xs font-bold uppercase">{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <Label htmlFor="firstName" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">First Name *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 opacity-50" />
                          <Input
                            id="firstName"
                            name="firstName"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm pl-10 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="lastName" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Last Name *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 opacity-50" />
                          <Input
                            id="lastName"
                            name="lastName"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm pl-10 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Business Email *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 opacity-50" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="admin@company.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm pl-10 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
                            disabled={isUpdating}
                            required={!isUpdating}
                          />
                        </div>
                        {isUpdating && (
                          <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed</p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Contact Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 opacity-50" />
                          <Input
                            id="phone"
                            name="phone"
                            placeholder="+1 (555) 000-0000"
                            value={formData.phone}
                            maxLength={10}
                            onChange={handleInputChange}
                            className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm pl-10 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="jobTitle" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Job Title</Label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 opacity-50" />
                          <Select value={formData.jobTitle} onValueChange={(v) => handleSelectChange('jobTitle', v)}>
                            <SelectTrigger className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm pl-10">
                              <SelectValue placeholder="Select job title" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Owner / Founder">Owner / Founder</SelectItem>
                              <SelectItem value="CEO">CEO</SelectItem>
                              <SelectItem value="CTO">CTO</SelectItem>
                              <SelectItem value="HR Manager">HR Manager</SelectItem>
                              <SelectItem value="Operations Manager">Operations Manager</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {!isUpdating && (
                        <>
                          <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Password *</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 opacity-50" />
                              <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm pl-10 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
                                required
                              />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">Minimum 6 characters</p>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="confirmPassword" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Confirm Password *</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 opacity-50" />
                              <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm pl-10 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
                                required
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Information */}
              <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm rounded-lg overflow-hidden">
                <CardHeader className="p-6 sm:p-8 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-1 bg-emerald-500 rounded-full" />
                    <CardTitle className="text-base font-bold tracking-tight text-gray-800 dark:text-gray-100 uppercase">Company Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 sm:p-8">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5 md:col-span-2">
                        <Label htmlFor="companyName" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Company Name *</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 opacity-50" />
                          <Input
                            id="companyName"
                            name="companyName"
                            placeholder="e.g. Acme Industries Ltd"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm pl-10 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="industry" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Industry</Label>
                        <Select value={formData.industry} onValueChange={(v) => handleSelectChange('industry', v)}>
                          <SelectTrigger className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="Retail">Retail</SelectItem>
                            <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                            <SelectItem value="Not specified">Not specified</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="companySize" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Company Size</Label>
                        <Select value={formData.companySize} onValueChange={(v) => handleSelectChange('companySize', v)}>
                          <SelectTrigger className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm">
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-10">1-10 employees</SelectItem>
                            <SelectItem value="11-50">11-50 employees</SelectItem>
                            <SelectItem value="51-200">51-200 employees</SelectItem>
                            <SelectItem value="201-500">201-500 employees</SelectItem>
                            <SelectItem value="501-1000">501-1000 employees</SelectItem>
                            <SelectItem value="1000+">1000+ employees</SelectItem>
                            <SelectItem value="Not specified">Not specified</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="website" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Website URL</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 opacity-50" />
                          <Input
                            id="website"
                            name="website"
                            type="url"
                            placeholder="https://example.com"
                            value={formData.website}
                            onChange={handleInputChange}
                            className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm pl-10 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Include https:// or http://</p>
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <Label htmlFor="address" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Headquarters Address</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 text-gray-400 h-5 w-5 opacity-50" />
                          <Input
                            id="address"
                            name="address"
                            placeholder="123 Business Way, Suite 100, City, Country"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm pl-10 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-8">
                <Button variant="ghost" type="button" onClick={() => router.back()} className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600">
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-10 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-md shadow-sm active:scale-95 transition-all"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <Spinner size="sm" color="border-white" className="mr-2" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="h-5 w-5 mr-2" />
                      {isUpdating ? "Update Company" : "Register Company"}
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="bg-indigo-50/30 dark:bg-indigo-900/10 border-indigo-100/50 dark:border-indigo-900/20 rounded-lg shadow-none">
              <CardContent className="p-6 space-y-4">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-md flex items-center justify-center">
                  <Shield className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-xs font-bold tracking-widest uppercase text-indigo-600">
                  {isUpdating ? "Update Policy" : "Onboarding Policy"}
                </h3>
                <ul className="space-y-3">
                  {isUpdating ? (
                    <>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-relaxed">Update company information</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-relaxed">Changes reflect immediately</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-relaxed">Email cannot be modified</span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-relaxed">Automatic workspace generation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-relaxed">Employer credentials sent to contact email</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-relaxed">256-bit encryption for all wellness data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-relaxed">Initial wellness benchmark setup</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-relaxed">Magic link for profile completion</span>
                      </li>
                    </>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}