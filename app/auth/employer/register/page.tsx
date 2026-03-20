'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Mail, User as UserIcon, Phone, MapPin, Eye, EyeOff, Shield, ArrowLeft, Loader2, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { auth, db } from '@/lib/firebase';
import { collection, doc, addDoc, setDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { toast } from 'sonner';

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
  'Retail', 'Consulting', 'Real Estate', 'Media & Entertainment',
  'Transportation', 'Energy', 'Government', 'Non-Profit', 'Other'
];

const companySizes = [
  '1-10 employees', '11-50 employees', '51-200 employees',
  '201-500 employees', '501-1000 employees', '1000+ employees'
];

export default function EmployerRegisterPage() {
  const [formData, setFormData] = useState({
    companyName: '', industry: '', companySize: '',
    firstName: '', lastName: '', businessEmail: '',
    phone: '', address: '', password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateBusinessEmail = (email: string) => {
    const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'live.com', 'msn.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    return !personalDomains.includes(domain);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.companyName || !formData.businessEmail || !formData.firstName || !formData.lastName || !formData.password || !formData.industry) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!validateBusinessEmail(formData.businessEmail)) {
      setError('Please use a business email address, not a personal email');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.businessEmail, formData.password);
      const user = userCredential.user;

      if (user) {
        try {
          const companyRef = await addDoc(collection(db, 'companies'), {
            name: formData.companyName,
            industry: formData.industry || 'Not specified',
            size: formData.companySize || 'Not specified',
            owner_id: user.uid,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          await setDoc(doc(db, 'users', user.uid), {
            id: user.uid,
            email: formData.businessEmail,
            role: 'employer',
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone || null,
            address: formData.address || null,
            company_id: companyRef.id,
            company_name: formData.companyName,
            is_active: true,
            hierarchy_level: 0,
            can_view_team_reports: true,
            can_manage_employees: true,
            can_approve_leaves: true,
            is_department_head: true,
            skip_level_access: true,
            direct_reports: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (!userDocSnap.exists()) throw new Error('Failed to create user document in database');

          toast.success('Employer account created successfully!');
          await new Promise(resolve => setTimeout(resolve, 500));
          router.push('/employer/dashboard');
        } catch (firestoreError: any) {
          console.error('Firestore error during registration:', firestoreError);
          try { await userCredential.user.delete(); } catch {}
          setError('Failed to create user profile. Please try again or contact support.');
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please use the login page.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address. Please enter a valid business email.');
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <motion.header
        className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-amber-500 via-lime-500 to-emerald-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">D</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-lime-500 to-emerald-600">Diltak.ai</span>
            </Link>
            <div className="flex items-center space-x-2">
              <ThemeToggle size="sm" />
              <Link href="/auth/employer/login">
                <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-14 h-14 bg-gradient-to-br from-amber-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Building className="h-7 w-7 text-white" />
          </motion.div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Employer Registration</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Create your employer account to start managing your team&apos;s mental health analytics
          </p>
        </motion.div>

        {/* Notice */}
        <div className="flex items-start space-x-3 bg-card border border-border rounded-xl p-4 mb-8">
          <Shield className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            This registration is exclusively for employers and business owners. Employee accounts are created by employers after registration.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-card border border-border shadow-xl rounded-2xl">
            <CardHeader>
              <CardTitle className="text-foreground">Company &amp; Personal Information</CardTitle>
              <p className="text-sm text-muted-foreground">Please provide accurate information for account verification</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Company Info */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-foreground flex items-center space-x-2">
                    <Building className="h-4 w-4" />
                    <span>Company Information</span>
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-sm font-medium text-foreground">Company Name *</Label>
                    <Input id="companyName" placeholder="Your Company Inc." value={formData.companyName} onChange={(e) => handleInputChange('companyName', e.target.value)} required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="industry" className="text-sm font-medium text-foreground">Industry *</Label>
                      <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                        <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                        <SelectContent>
                          {industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companySize" className="text-sm font-medium text-foreground">Company Size</Label>
                      <Select value={formData.companySize} onValueChange={(value) => handleInputChange('companySize', value)}>
                        <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                        <SelectContent>
                          {companySizes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Personal Info */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-foreground flex items-center space-x-2">
                    <UserIcon className="h-4 w-4" />
                    <span>Personal Information</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-foreground">First Name *</Label>
                      <Input id="firstName" placeholder="John" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-foreground">Last Name *</Label>
                      <Input id="lastName" placeholder="Doe" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessEmail" className="text-sm font-medium text-foreground">Business Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input id="businessEmail" type="email" placeholder="you@company.com" value={formData.businessEmail} onChange={(e) => handleInputChange('businessEmail', e.target.value)} className="pl-10" required />
                    </div>
                    <p className="text-xs text-muted-foreground">Please use your business email, not a personal email</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-foreground">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className="pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium text-foreground">Business Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input id="address" placeholder="123 Business St, City" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} className="pl-10" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-foreground">Account Security</h3>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground">Password *</Label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} required />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm Password *</Label>
                    <div className="relative">
                      <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm your password" value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} required />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className={formData.password.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}>• At least 8 characters</p>
                    <p className={formData.password === formData.confirmPassword && formData.password.length > 0 ? 'text-green-600 dark:text-green-400' : ''}>• Passwords match</p>
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 via-lime-500 to-emerald-600 hover:opacity-90 text-white font-semibold py-2.5 shadow-lg"
                    disabled={loading}
                    size="lg"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        Create Employer Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <div className="mt-6 text-center text-sm text-muted-foreground space-y-2">
          <p>
            Already have an account?{' '}
            <Link href="/auth/employer/login" className="text-green-600 dark:text-green-400 hover:underline font-semibold">Sign in here</Link>
          </p>
          <p>
            Looking for employee login?{' '}
            <Link href="/auth/employee/login" className="text-green-600 dark:text-green-400 hover:underline font-semibold">Employee Portal</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
