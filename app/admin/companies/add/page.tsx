'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Building2, Globe, Mail, Phone, MapPin, 
  Shield, CheckCircle, Save, Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/loader';
import { toast } from 'sonner';

export default function AddCompanyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    plan: 'Starter',
    employeeCount: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Company registered successfully!');
      router.push('/admin/companies');
    } catch (err: any) {
      setError(err.message || 'Failed to register company');
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
            <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm rounded-lg overflow-hidden">
              <CardHeader className="p-6 sm:p-8 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-1 bg-indigo-500 rounded-full" />
                  <CardTitle className="text-base font-bold tracking-tight text-gray-800 dark:text-gray-100 uppercase">Primary Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <form id="add-company-form" onSubmit={handleSubmit} className="space-y-8">
                  {error && (
                    <Alert variant="destructive" className="rounded-md border-red-500/50 bg-red-500/5">
                      <AlertDescription className="text-xs font-bold uppercase">{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 md:col-span-2">
                      <Label htmlFor="name" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Company Name *</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 opacity-50" />
                        <Input
                          id="name"
                          name="name"
                          placeholder="e.g. Acme Industries Ltd"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm pl-10 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="industry" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Industry Type</Label>
                      <Select value={formData.industry} onValueChange={(v) => handleSelectChange('industry', v)}>
                        <SelectTrigger className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tech">Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="employeeCount" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Approx. Employees</Label>
                      <Input
                        id="employeeCount"
                        name="employeeCount"
                        type="number"
                        placeholder="e.g. 250"
                        value={formData.employeeCount}
                        onChange={handleInputChange}
                        className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="website" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Website URL</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 opacity-50" />
                        <Input
                          id="website"
                          name="website"
                          placeholder="https://acme.com"
                          value={formData.website}
                          onChange={handleInputChange}
                          className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm pl-10 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="plan" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Subscription Plan</Label>
                      <Select value={formData.plan} onValueChange={(v) => handleSelectChange('plan', v)}>
                        <SelectTrigger className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm">
                          <SelectValue placeholder="Select plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Starter">Starter Pack</SelectItem>
                          <SelectItem value="Pro">Professional</SelectItem>
                          <SelectItem value="Enterprise">Enterprise Elite</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-6 pt-4">
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-1 bg-emerald-500 rounded-full" />
                        <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200 tracking-widest uppercase">Contact Verification</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <Label htmlFor="contactEmail" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Business Email *</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 opacity-50" />
                                <Input
                                    id="contactEmail"
                                    name="contactEmail"
                                    type="email"
                                    placeholder="admin@company.com"
                                    value={formData.contactEmail}
                                    onChange={handleInputChange}
                                    className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm pl-10 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="contactPhone" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Contact Phone</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 opacity-50" />
                                <Input
                                    id="contactPhone"
                                    name="contactPhone"
                                    placeholder="+1 (555) 000-0000"
                                    value={formData.contactPhone}
                                    onChange={handleInputChange}
                                    className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm pl-10 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                            </div>
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

                  <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-8 border-t border-gray-100 dark:border-gray-800">
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
              </CardContent>
            </Card>
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
                    'Initial wellness benchmark setup'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="p-6 bg-amber-50/30 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-900/20 rounded-lg flex gap-3">
              <Info className="h-5 w-5 text-amber-500 shrink-0" />
              <p className="text-[10px] font-bold text-amber-700/70 dark:text-amber-500/70 uppercase leading-loose">
                Once registered, the company employer will receive a magic link to complete their profile setup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
