// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { motion } from 'framer-motion';
// import { 
//   ArrowLeft, Building2, Globe, Mail, Phone, MapPin, 
//   Shield, CheckCircle, Save, Info
// } from 'lucide-react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Spinner } from '@/components/loader';
// import { toast } from 'sonner';

// export default function AddCompanyPage() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const [formData, setFormData] = useState({
//     name: '',
//     industry: '',
//     website: '',
//     contactEmail: '',
//     contactPhone: '',
//     address: '',
//     plan: 'Starter',
//     employeeCount: '',
//   });

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSelectChange = (name: string, value: string) => {
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       // Mock API call
//       await new Promise(resolve => setTimeout(resolve, 1500));
//       toast.success('Company registered successfully!');
//       router.push('/admin/companies');
//     } catch (err: any) {
//       setError(err.message || 'Failed to register company');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
//       <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
//         {/* Header */}
//         <div className="mb-8">
//           <Link href="/admin/companies" className="inline-flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 uppercase tracking-widest mb-4 group">
//             <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
//             Back to Companies
//           </Link>
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Register New Company</h1>
//           <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 opacity-80 uppercase tracking-wider">
//             Onboard a new organisation to the Diltak platform
//           </p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Main Form */}
//           <div className="lg:col-span-2 space-y-8">
//             <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm rounded-lg overflow-hidden">
//               <CardHeader className="p-6 sm:p-8 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
//                 <div className="flex items-center gap-2">
//                   <div className="h-5 w-1 bg-indigo-500 rounded-full" />
//                   <CardTitle className="text-base font-bold tracking-tight text-gray-800 dark:text-gray-100 uppercase">Primary Information</CardTitle>
//                 </div>
//               </CardHeader>
//               <CardContent className="p-6 sm:p-8">
//                 <form id="add-company-form" onSubmit={handleSubmit} className="space-y-8">
//                   {error && (
//                     <Alert variant="destructive" className="rounded-md border-red-500/50 bg-red-500/5">
//                       <AlertDescription className="text-xs font-bold uppercase">{error}</AlertDescription>
//                     </Alert>
//                   )}

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="space-y-1.5 md:col-span-2">
//                       <Label htmlFor="name" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Company Name *</Label>
//                       <div className="relative">
//                         <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 opacity-50" />
//                         <Input
//                           id="name"
//                           name="name"
//                           placeholder="e.g. Acme Industries Ltd"
//                           value={formData.name}
//                           onChange={handleInputChange}
//                           className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm pl-10 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
//                           required
//                         />
//                       </div>
//                     </div>

//                     <div className="space-y-1.5">
//                       <Label htmlFor="industry" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Industry Type</Label>
//                       <Select value={formData.industry} onValueChange={(v) => handleSelectChange('industry', v)}>
//                         <SelectTrigger className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm">
//                           <SelectValue placeholder="Select industry" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="tech">Technology</SelectItem>
//                           <SelectItem value="finance">Finance</SelectItem>
//                           <SelectItem value="healthcare">Healthcare</SelectItem>
//                           <SelectItem value="retail">Retail</SelectItem>
//                           <SelectItem value="other">Other</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     <div className="space-y-1.5">
//                       <Label htmlFor="employeeCount" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Approx. Employees</Label>
//                       <Input
//                         id="employeeCount"
//                         name="employeeCount"
//                         type="number"
//                         placeholder="e.g. 250"
//                         value={formData.employeeCount}
//                         onChange={handleInputChange}
//                         className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
//                       />
//                     </div>

//                     <div className="space-y-1.5">
//                       <Label htmlFor="website" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Website URL</Label>
//                       <div className="relative">
//                         <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 opacity-50" />
//                         <Input
//                           id="website"
//                           name="website"
//                           placeholder="https://acme.com"
//                           value={formData.website}
//                           onChange={handleInputChange}
//                           className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm pl-10 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
//                         />
//                       </div>
//                     </div>

//                     <div className="space-y-1.5">
//                       <Label htmlFor="plan" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Subscription Plan</Label>
//                       <Select value={formData.plan} onValueChange={(v) => handleSelectChange('plan', v)}>
//                         <SelectTrigger className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm">
//                           <SelectValue placeholder="Select plan" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="Starter">Starter Pack</SelectItem>
//                           <SelectItem value="Pro">Professional</SelectItem>
//                           <SelectItem value="Enterprise">Enterprise Elite</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>

//                   <div className="space-y-6 pt-4">
//                     <div className="flex items-center gap-2">
//                         <div className="h-5 w-1 bg-emerald-500 rounded-full" />
//                         <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200 tracking-widest uppercase">Contact Verification</h3>
//                     </div>
                    
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div className="space-y-1.5">
//                             <Label htmlFor="contactEmail" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Business Email *</Label>
//                             <div className="relative">
//                                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 opacity-50" />
//                                 <Input
//                                     id="contactEmail"
//                                     name="contactEmail"
//                                     type="email"
//                                     placeholder="admin@company.com"
//                                     value={formData.contactEmail}
//                                     onChange={handleInputChange}
//                                     className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm pl-10 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         <div className="space-y-1.5">
//                             <Label htmlFor="contactPhone" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Contact Phone</Label>
//                             <div className="relative">
//                                 <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 opacity-50" />
//                                 <Input
//                                     id="contactPhone"
//                                     name="contactPhone"
//                                     placeholder="+1 (555) 000-0000"
//                                     value={formData.contactPhone}
//                                     onChange={handleInputChange}
//                                     className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm pl-10 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
//                                 />
//                             </div>
//                         </div>

//                         <div className="space-y-1.5 md:col-span-2">
//                             <Label htmlFor="address" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Headquarters Address</Label>
//                             <div className="relative">
//                                 <MapPin className="absolute left-3 top-3 text-gray-400 h-5 w-5 opacity-50" />
//                                 <Input
//                                     id="address"
//                                     name="address"
//                                     placeholder="123 Business Way, Suite 100, City, Country"
//                                     value={formData.address}
//                                     onChange={handleInputChange}
//                                     className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm pl-10 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
//                                 />
//                             </div>
//                         </div>
//                     </div>
//                   </div>

//                   <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-8 border-t border-gray-100 dark:border-gray-800">
//                     <Button variant="ghost" type="button" onClick={() => router.back()} className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600">
//                       Cancel
//                     </Button>
//                     <Button 
//                       type="submit" 
//                       disabled={loading}
//                       className="w-full sm:w-auto px-10 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-md shadow-sm active:scale-95 transition-all"
//                     >
//                       {loading ? (
//                         <div className="flex items-center">
//                           <Spinner size="sm" color="border-white" className="mr-2" />
//                           Processing...
//                         </div>
//                       ) : (
//                         <div className="flex items-center">
//                           <Save className="h-5 w-5 mr-2" />
//                           Register Company
//                         </div>
//                       )}
//                     </Button>
//                   </div>
//                 </form>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Sidebar Info */}
//           <div className="space-y-6">
//             <Card className="bg-indigo-50/30 dark:bg-indigo-900/10 border-indigo-100/50 dark:border-indigo-900/20 rounded-lg shadow-none">
//               <CardContent className="p-6 space-y-4">
//                 <div className="w-10 h-10 bg-indigo-500/10 rounded-md flex items-center justify-center">
//                   <Shield className="h-5 w-5 text-indigo-600" />
//                 </div>
//                 <h3 className="text-xs font-bold tracking-widest uppercase text-indigo-600">Onboarding Policy</h3>
//                 <ul className="space-y-3">
//                   {[
//                     'Automatic workspace generation',
//                     'Employer credentials sent to contact email',
//                     '256-bit encryption for all wellness data',
//                     'Initial wellness benchmark setup'
//                   ].map((item, i) => (
//                     <li key={i} className="flex items-start gap-2">
//                       <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
//                       <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-relaxed">{item}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </CardContent>
//             </Card>

//             <div className="p-6 bg-amber-50/30 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-900/20 rounded-lg flex gap-3">
//               <Info className="h-5 w-5 text-amber-500 shrink-0" />
//               <p className="text-[10px] font-bold text-amber-700/70 dark:text-amber-500/70 uppercase leading-loose">
//                 Once registered, the company employer will receive a magic link to complete their profile setup.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
}

export default function AddCompanyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
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
      
      // Prepare payload according to API specification
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        companySize: formData.companySize,
        industry: formData.industry,
        phone: formData.phone,
        jobTitle: formData.jobTitle,
        // website: formData.website || undefined, // Include website if provided
      };

      const response = await axios.post(
        `${ServerAddress}/admin/employers`,
        payload,
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
    } catch (err: any) {
      let errorMessage = 'Failed to register company';
      
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/companies" className="inline-flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 uppercase tracking-widest mb-4 group">
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Companies
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Register New Company</h1>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 opacity-80 uppercase tracking-wider">
            Onboard a new organisation to the Diltak platform
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
                            required
                          />
                        </div>
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      Register Company
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
                <h3 className="text-xs font-bold tracking-widest uppercase text-indigo-600">Onboarding Policy</h3>
                <ul className="space-y-3">
                  {[
                    'Automatic workspace generation',
                    'Employer credentials sent to contact email',
                    '256-bit encryption for all wellness data',
                    'Initial wellness benchmark setup',
                    'Magic link for profile completion'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* <div className="p-6 bg-amber-50/30 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-900/20 rounded-lg flex gap-3">
              <Info className="h-5 w-5 text-amber-500 shrink-0" />
              <p className="text-[10px] font-bold text-amber-700/70 dark:text-amber-500/70 uppercase leading-loose">
                Once registered, the company employer will receive a welcome email with their credentials and a magic link to complete their profile setup.
              </p>
            </div> */}

            {/* API Payload Preview */}
            {/* <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">API Payload Preview</p>
              <pre className="text-[9px] font-mono text-gray-600 dark:text-gray-400 overflow-x-auto">
{`{
  "firstName": "${formData.firstName || '...'}",
  "lastName": "${formData.lastName || '...'}",
  "email": "${formData.email || '...'}",
  "password": "********",
  "companyName": "${formData.companyName || '...'}",
  "companySize": "${formData.companySize}",
  "industry": "${formData.industry}",
  "phone": "${formData.phone || '...'}",
  "jobTitle": "${formData.jobTitle}",
  "website": "${formData.website || '...'}"
}`}
              </pre>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}