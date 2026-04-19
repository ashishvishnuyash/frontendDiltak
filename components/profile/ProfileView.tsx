'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Briefcase, Calendar, 
  Shield, Key, Save, Camera, CheckCircle, 
  AlertTriangle, Lock, Eye, EyeOff, Globe,
  ShieldCheck, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import axios from 'axios';
import ServerAddress from '@/constent/ServerAddress';

export default function ProfileView() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile Form States
  const [formData, setFormData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    jobTitle: user?.position || user?.role || 'Member',
    company: user?.company_name || 'Diltak.ai'
  });

  // Security Form States
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        jobTitle: user.position || user.role || 'Member',
        company: user.company_name || 'Diltak.ai'
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSecurityData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.patch(`${ServerAddress}/users/profile`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        const updatedUser = { ...user, ...response.data };
        localStorage.setItem('user_profile', JSON.stringify(updatedUser));
        await refreshUser();
        
        setSaveSuccess(true);
        toast.success('Profile updated successfully');
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (securityData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${ServerAddress}/auth/change-password`, {
        currentPassword: securityData.currentPassword,
        newPassword: securityData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Password changed successfully');
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.first_name 
    ? `${user.first_name[0]}${user.last_name?.[0] || ''}`.toUpperCase()
    : '??';

  return (
    <div className="px-4 sm:px-6 lg:px-12 py-8 space-y-8 max-w-auto mx-auto min-h-screen pb-24">
      
      {/* Header section with Premium design */}
      <div className="flex flex-col md:flex-row items-center gap-8 bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
        
        <div className="relative">
          <div className="w-200 h-200 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden ring-4 ring-indigo-500/10 transition-transform hover:scale-105">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl sm:text-4xl font-black text-white">{initials}</span>
            )}
          </div>
          {/* <button className="absolute bottom-1 right-1 p-2.5 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl text-gray-500 hover:text-indigo-500 transition-all hover:rotate-12 active:scale-95">
            <Camera className="h-4.5 w-4.5" />
          </button> */}
        </div>
        
        <div className="flex-1 text-center md:text-left z-10">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              {user?.first_name} {user?.last_name}
            </h1>
            <span className="px-3 py-1 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-indigo-500/20 w-fit mx-auto md:mx-0">
              {user?.role?.toUpperCase() || 'MEMBER'}
            </span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-4 flex items-center justify-center md:justify-start gap-2">
            <Mail className="h-5 w-5 opacity-70" /> {user?.email}
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Account Verified</span>
            </div>
            {user?.role === 'admin' && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                <Globe className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Platform Admin</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Tabs */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="sticky top-24 space-y-2.5 bg-white dark:bg-gray-900/50 p-2.5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'profile' 
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <User className="h-5 w-5" />
              Profile Details
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === 'security' 
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Key className="h-5 w-5" />
              Security & Passwords
            </button>
          </div>
          
          <div className="mt-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/10 dark:to-orange-950/10 rounded-3xl border border-amber-100 dark:border-amber-900/20 shadow-inner">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-amber-600" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-700">Privacy Policy</h4>
            </div>
            <p className="text-[11px] text-amber-800/70 dark:text-amber-400/70 leading-relaxed font-bold">
              Diltak.ai ensures your personal data remains confidential. We enforce bank-grade encryption for all user credentials.
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 mb-20">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' ? (
              <motion.div
                key="profile"
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-3xl overflow-hidden">
                  <CardHeader className="p-8 border-b border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20">
                    <CardTitle className="text-lg font-black text-gray-800 dark:text-gray-100 flex items-center gap-3 uppercase tracking-tight">
                      <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                      Account Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2.5">
                          <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</Label>
                          <div className="relative overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 focus-within:border-indigo-500 transition-colors">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">
                              <User className="h-5 w-5" />
                            </span>
                            <Input
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              placeholder="John"
                              className="pl-11 h-13 bg-gray-50/30 dark:bg-gray-800/20 border-none focus-visible:ring-0 font-bold"
                              disabled
                           />
                          </div>
                        </div>
                        <div className="space-y-2.5">
                          <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</Label>
                          <div className="relative overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 focus-within:border-indigo-500 transition-colors">
                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">
                               <User className="h-5 w-5" />
                             </span>
                            <Input
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              placeholder="Doe"
                              className="pl-11 h-13 bg-gray-50/30 dark:bg-gray-800/20 border-none focus-visible:ring-0 font-bold"
                              disabled
                            />
                          </div>
                        </div>
                        <div className="space-y-2.5">
                          <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</Label>
                          <div className="relative overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/60 opacity-60">
                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                               <Mail className="h-5 w-5" />
                             </span>
                            <Input
                              value={formData.email}
                              disabled
                              className="pl-11 h-13 border-none bg-transparent font-bold cursor-not-allowed"
                            />
                          </div>
                        </div>
                        <div className="space-y-2.5">
                          <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contact Number</Label>
                          <div className="relative overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 focus-within:border-indigo-500 transition-colors">
                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">
                               <Phone className="h-5 w-5" />
                             </span>
                            <Input
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="+1 (555) 000-0000"
                              className="pl-11 h-13 bg-gray-50/30 dark:bg-gray-800/20 border-none focus-visible:ring-0 font-bold"
                            />
                          </div>
                        </div>
                        <div className="space-y-2.5">
                          <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Role</Label>
                          <div className="relative overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/60 opacity-60">
                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                               <Briefcase className="h-5 w-5" />
                             </span>
                            <Input
                              value={formData.jobTitle}
                              disabled
                              className="pl-11 h-13 border-none bg-transparent font-bold"
                            />
                          </div>
                        </div>
                        <div className="space-y-2.5">
                          <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Organization</Label>
                          <div className="relative overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/60 opacity-60">
                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                               <Globe className="h-5 w-5" />
                             </span>
                            <Input
                              value={formData.company}
                              disabled
                              className="pl-11 h-13 border-none bg-transparent font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      {/* <div className="flex items-center justify-end border-t border-gray-100 dark:border-gray-800 pt-8 mt-4">
                        <Button 
                          type="submit" 
                          disabled={loading}
                          className="px-12 h-13 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/20 transform transition-all active:scale-95"
                        >
                          {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : saveSuccess ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5" />
                              Saved!
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Save className="h-5 w-5" />
                              Save Changes
                            </div>
                          )}
                        </Button>
                      </div> */}
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="security"
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="space-y-8"
              >
                {/* Change Password Card */}
                <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-3xl overflow-hidden">
                  <div className="p-10">
                    <div className="flex items-center gap-5 mb-10">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Lock className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Access Control</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Change your secret password</p>
                      </div>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-8">
                      <div className="space-y-2.5">
                        <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Password</Label>
                        <div className="relative overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 focus-within:border-amber-500 transition-colors">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">
                            <Lock className="h-5 w-5" />
                          </span>
                          <Input
                            type={showCurrentPw ? "text" : "password"}
                            name="currentPassword"
                            value={securityData.currentPassword}
                            onChange={handleSecurityChange}
                            placeholder="Type current password"
                            className="pl-11 pr-12 h-13 bg-gray-50/30 dark:bg-gray-800/20 border-none focus-visible:ring-0 font-bold"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPw(!showCurrentPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showCurrentPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2.5">
                          <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</Label>
                          <div className="relative overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 focus-within:border-indigo-500 transition-colors">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">
                              <Key className="h-5 w-5" />
                            </span>
                            <Input
                              type={showNewPw ? "text" : "password"}
                              name="newPassword"
                              value={securityData.newPassword}
                              onChange={handleSecurityChange}
                              placeholder="New password"
                              className="pl-11 pr-12 h-13 bg-gray-50/30 dark:bg-gray-800/20 border-none focus-visible:ring-0 font-bold"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPw(!showNewPw)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showNewPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2.5">
                          <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</Label>
                          <div className="relative overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 focus-within:border-indigo-500 transition-colors">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">
                               <Key className="h-5 w-5" />
                            </span>
                            <Input
                              type={showNewPw ? "text" : "password"}
                              name="confirmPassword"
                              value={securityData.confirmPassword}
                              onChange={handleSecurityChange}
                              placeholder="Confirm new password"
                              className="pl-11 h-13 bg-gray-50/30 dark:bg-gray-800/20 border-none focus-visible:ring-0 font-bold"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/20">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-indigo-500 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-[11px] font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-tight mb-1">Security Guidelines</h5>
                            <p className="text-[11px] text-indigo-800/60 dark:text-indigo-400/60 font-medium leading-relaxed">
                              Use at least 8 characters, with a mix of letters, numbers, and symbols. Avoid repeating common passwords used on other sites.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end border-t border-gray-100 dark:border-gray-800 pt-8 mt-4">
                        <Button
                          type="submit"
                          disabled={loading}
                          className="px-12 h-13 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-xs uppercase tracking-widest rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-2xl shadow-gray-900/20"
                        >
                          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <div className="flex items-center gap-2"><Key className="h-4.5 w-4.5" /> Update Access</div>}
                        </Button>
                      </div>
                    </form>
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-start gap-5 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0 text-violet-600">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Enhanced Security</h4>
                      <p className="text-[11px] text-gray-500 mt-2 font-medium leading-relaxed">Two-factor authentication is currently enabled for this account via email.</p>
                    </div>
                  </div>
                  <div className="p-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-start gap-5 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0 text-emerald-600">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">Activity Log</h4>
                      <p className="text-[11px] text-gray-500 mt-2 font-medium leading-relaxed">Last successful authentication was from New York, US on May 2nd, 2024.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
