'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  Sparkles,
  Heart,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import ContactAdministratorModal from '@/components/modals/ContactAdministratorModal';
import ForgotPasswordModal from '@/components/modals/ForgotPasswordModal';

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [focusedField, setFocusedField] = useState<string>('');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      // Redirect based on user role
      switch (user.role) {
        case 'employee':
          router.push('/employee/dashboard');
          break;
        case 'manager':
          router.push('/manager');
          break;
        case 'employer':
          router.push('/employer/dashboard');
          break;
        case 'hr':
        case 'admin':
          router.push('/employer/analytics');
          break;
        default:
          router.push('/employee/dashboard');
      }
    }
  }, [user, authLoading, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use Firebase Auth directly
      await signInWithEmailAndPassword(auth, formData.email, formData.password);

      toast.success('Login successful!');

      // The auth context will automatically update with the user data
      // and redirect based on the user's role

    } catch (error: any) {
      console.error('Login error:', error);

      // Handle specific Firebase Auth errors
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        default:
          setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };



  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Support',
      description: '24/7 mental health assistance',
      color: 'text-green-600'
    },
    {
      icon: Heart,
      title: 'Wellness Tracking',
      description: 'Monitor your mental health journey',
      color: 'text-red-600'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Advanced security and privacy protection',
      color: 'text-blue-600'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Analytics',
      description: 'Instant insights and reports',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl"
          animate={floatingAnimation}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{
            ...floatingAnimation,
            transition: { ...floatingAnimation.transition, delay: 2 }
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        className="relative z-10 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm transition-colors duration-300"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-amber-600 via-lime-600 to-emerald-700 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">D</span>
              </div>
              <span className="text-lg sm:text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-lime-600 to-emerald-700">Diltak.ai</span>
            </Link>
            <div className="flex items-center space-x-2">
              <ThemeToggle size="sm" />
              <Link href="/">
                <Button variant="ghost" className="flex items-center space-x-1 sm:space-x-2 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-800 hover:text-green-600 dark:hover:text-green-400 px-2 sm:px-3 py-2 text-sm sm:text-base">
                  <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Back to Home</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Login Form */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="max-w-md mx-auto lg:mx-0 order-2 lg:order-1"
          >
            <motion.div variants={itemVariants} className="text-center lg:text-left mb-6 sm:mb-8">
              <div className="inline-flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-green-200 dark:border-green-700 mb-4 sm:mb-6">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">Secure Login</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                Welcome to
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-lime-600 to-emerald-700">
                  Diltak.ai
                </span>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Sign in to access your personalized mental health dashboard and AI-powered wellness tools.
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-hidden">
                <CardHeader className="text-center pb-3 sm:pb-4">
                  <motion.div
                    className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Brain className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Sign In</CardTitle>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Enter your credentials to continue</p>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <Alert variant="destructive" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50">
                            <AlertDescription className="text-red-700 dark:text-red-300 text-sm">{error}</AlertDescription>
                          </Alert>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.div
                      className="space-y-2"
                      whileFocus={{ scale: 1.02 }}
                    >
                      <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 transition-colors ${focusedField === 'email' ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
                          }`} />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField('')}
                          className={`pl-8 sm:pl-10 text-sm sm:text-base py-2 sm:py-3 transition-all duration-300 ${focusedField === 'email'
                            ? 'border-green-500 dark:border-green-400 ring-2 ring-green-200 dark:ring-green-800'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                          disabled={loading}
                          required
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      className="space-y-2"
                      whileFocus={{ scale: 1.02 }}
                    >
                      <Label htmlFor="password" className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 transition-colors ${focusedField === 'password' ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
                          }`} />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          onFocus={() => setFocusedField('password')}
                          onBlur={() => setFocusedField('')}
                          className={`pl-8 sm:pl-10 pr-8 sm:pr-10 text-sm sm:text-base py-2 sm:py-3 transition-all duration-300 ${focusedField === 'password'
                            ? 'border-green-500 dark:border-green-400 ring-2 ring-green-200 dark:ring-green-800'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                          disabled={loading}
                          required
                        />
                        <motion.button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                          disabled={loading}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {showPassword ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                        </motion.button>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2.5 sm:py-3 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                        disabled={loading}
                      >
                        {loading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="flex items-center justify-center"
                          >
                            <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="text-sm sm:text-base">Signing In...</span>
                          </motion.div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <span>Sign In</span>
                            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  </form>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="text-center text-xs sm:text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Don&apos;t have an account? </span>
                      <button 
                        onClick={() => setIsContactModalOpen(true)}
                        className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-semibold hover:underline"
                      >
                        Contact your administrator
                      </button>
                    </div>

                    <div className="text-center">
                      <button 
                        onClick={() => setIsForgotPasswordModalOpen(true)}
                        className="text-xs sm:text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-semibold hover:underline"
                      >
                        Forgot your password?
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Right Side - Features & Benefits */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="order-1 lg:order-2"
          >
            <motion.div variants={itemVariants} className="space-y-6 sm:space-y-8">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                  Your Mental Health Journey Starts Here
                </h2>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
                  Access personalized wellness tools, AI-powered support, and comprehensive mental health resources.
                </p>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 lg:p-6 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300"
                  >
                    <feature.icon className={`h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mb-2 sm:mb-3 ${feature.color} dark:brightness-125`} />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                  </motion.div>
                ))}
              </div>

              {/* Stats */}
              <motion.div
                className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4">Trusted by Thousands</h3>
                  <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    <div>
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold">3K+</div>
                      <div className="text-xs sm:text-sm text-green-100">People Helped</div>
                    </div>
                    <div>
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold">98%</div>
                      <div className="text-xs sm:text-sm text-green-100">Satisfaction</div>
                    </div>
                    <div>
                      <div className="text-lg sm:text-xl lg:text-2xl font-bold">24/7</div>
                      <div className="text-xs sm:text-sm text-green-100">AI Support</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Security Badge */}
              <motion.div
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <Shield className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 mx-auto mb-3 sm:mb-4 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm sm:text-base">Secure & Private</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Your data is protected with industry-leading security measures
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Contact Administrator Modal */}
      <ContactAdministratorModal 
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        isOpen={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
      />
    </div>
  );
}