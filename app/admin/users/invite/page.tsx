'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, UserPlus, Mail, Shield, Building2, 
  CheckCircle, Save, Info, Crown, Users, GraduationCap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/loader';
import { toast } from 'sonner';

export default function InviteUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    role: 'employee',
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
      toast.success('Invitation sent successfully!');
      router.push('/admin/users');
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/users" className="inline-flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 uppercase tracking-widest mb-4 group">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Users
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Invite System User</h1>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 opacity-80 uppercase tracking-wider">
            Grant platform access to a new administrator or partner
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm rounded-lg overflow-hidden">
              <CardHeader className="p-6 sm:p-8 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-1 bg-indigo-500 rounded-full" />
                  <CardTitle className="text-base font-bold tracking-tight text-gray-800 dark:text-gray-100 uppercase">Invitation Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {error && (
                    <Alert variant="destructive" className="rounded-md border-red-500/50 bg-red-500/5">
                      <AlertDescription className="text-xs font-bold uppercase">{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <Label htmlFor="email" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 opacity-50" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john.doe@email.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm pl-10 focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="company" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Assign to Company</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 opacity-50" />
                        <Select value={formData.company} onValueChange={(v) => handleSelectChange('company', v)}>
                          <SelectTrigger className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm pl-10">
                            <SelectValue placeholder="Select company" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Acme Corp">Acme Corp</SelectItem>
                            <SelectItem value="TechStart">TechStart Inc</SelectItem>
                            <SelectItem value="GreenLeaf">GreenLeaf Ltd</SelectItem>
                            <SelectItem value="none">Independent / Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="role" className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-0.5">Platform Role</Label>
                      <Select value={formData.role} onValueChange={(v) => handleSelectChange('role', v)}>
                        <SelectTrigger className="h-11 bg-transparent border-gray-200 dark:border-gray-800 rounded-md font-medium text-sm">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="employer">Employer / HR Admin</SelectItem>
                          <SelectItem value="admin">Platform Administrator</SelectItem>
                        </SelectContent>
                      </Select>
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
                          Sending...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Send Invitation
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
              <CardContent className="p-6 space-y-6">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-md flex items-center justify-center">
                  <Shield className="h-5 w-5 text-indigo-600" />
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xs font-bold tracking-widest uppercase text-indigo-600">Role Capabilities</h3>
                  
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Crown className="h-4 w-4 text-amber-500 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-tight">Administrator</p>
                        <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-relaxed mt-0.5">Full platform control and global analytics</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <GraduationCap className="h-4 w-4 text-blue-500 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-tight">Employer</p>
                        <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-relaxed mt-0.5">Company-level management and HR metrics</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Users className="h-4 w-4 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black text-gray-800 dark:text-gray-200 uppercase tracking-tight">User / Manager</p>
                        <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-relaxed mt-0.5">Standard hub access and team wellness tracking</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-6 bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20 rounded-lg flex gap-3">
              <Info className="h-4 w-4 text-blue-500 shrink-0" />
              <p className="text-[10px] font-bold text-blue-700/70 dark:text-blue-400/70 uppercase leading-loose">
                Invitations are valid for 72 hours. Users must complete registration within this window.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
