'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle, Building2, Mail, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Spinner } from '@/components/loader';

export default function WellnessHubLanding() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const isFormValid = formData.name.trim() && formData.email.trim() && formData.company.trim();

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-gray-950 dark:via-slate-900 dark:to-teal-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-emerald-300/20 dark:bg-emerald-600/10 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-40 right-20 w-96 h-96 bg-blue-300/20 dark:bg-blue-600/10 rounded-full blur-3xl"
            animate={{
              x: [0, -80, 0],
              y: [0, 100, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md relative z-10"
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-2xl p-8">
            <div className="mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Thank You!
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                We've received your information and will reach out to you soon with a personalized pitch for our Wellness Hub platform.
              </p>
            </div>

            <div className="space-y-4">
              <Button asChild variant="outline" className="w-full border-2 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30">
                <Link href="/">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-gray-950 dark:via-slate-900 dark:to-teal-950 text-gray-900 dark:text-gray-100 transition-colors duration-500 overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-emerald-300/20 dark:bg-emerald-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 right-20 w-96 h-96 bg-blue-300/20 dark:bg-blue-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <header className="border-b border-white/20 dark:border-gray-800/50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <motion.div 
                className="w-8 h-8 bg-gradient-to-br from-green-600 via-lime-600 to-emerald-600 rounded flex items-center justify-center shadow-lg"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="text-white font-bold text-sm">D</span>
              </motion.div>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-lime-600 to-emerald-600">
                Diltak.ai
              </span>
            </Link>

            <Button asChild variant="ghost" className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all duration-200">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span>Back to Home</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] p-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[500px]"
        >
          <Card className="shadow-2xl border border-white/40 dark:border-gray-700/50 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-lg overflow-hidden">
            <CardHeader className="text-center pb-8 pt-10 px-8">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                Wellness Hub Access
              </CardTitle>
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Tailored solutions for your organisation
              </p>
            </CardHeader>

            <CardContent className="px-8 pb-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-0.5">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 opacity-60" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10 h-11 bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800 rounded-md font-medium text-sm focus:ring-emerald-500/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-0.5">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 opacity-60" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 h-11 bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800 rounded-md font-medium text-sm focus:ring-emerald-500/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="company" className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider ml-0.5">
                    Company Name
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 opacity-60" />
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Enter your company name"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="pl-10 h-11 bg-white/50 dark:bg-gray-900/50 border-white/20 dark:border-gray-800 rounded-md font-medium text-sm focus:ring-emerald-500/20"
                      required
                    />
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 text-white font-bold text-xs uppercase tracking-widest py-3 rounded-md shadow-lg shadow-emerald-500/20 mt-4 transition-all"
                    disabled={!isFormValid || isSubmitting}
                  >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <Spinner size="sm" color="border-white" />
                      <span>Requesting...</span>
                    </div>
                  ) : (
                    'Get Personalised Access'
                  )}
                  </Button>
                </motion.div>
              </form>

              <div className="mt-8 pt-8 border-t border-white/10 dark:border-gray-800">
                <p className="text-center text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] leading-loose opacity-60">
                  By submitting, you agree to our data policy. Our team will reach out within 24 hours.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 grid grid-cols-3 gap-4"
          >
            {[
              { color: 'bg-emerald-500/10', text: 'AI-Powered', icon: CheckCircle, iconColor: 'text-emerald-500' },
              { color: 'bg-blue-500/10', text: 'Enterprise', icon: CheckCircle, iconColor: 'text-blue-500' },
              { color: 'bg-purple-500/10', text: 'Support 24/7', icon: CheckCircle, iconColor: 'text-purple-500' }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                className="text-center p-4 bg-white/20 dark:bg-gray-800/20 rounded-lg backdrop-blur-sm border border-white/10 dark:border-gray-700/30"
                whileHover={{ y: -5 }}
              >
                <div className={`w-8 h-8 ${feature.color} rounded-md flex items-center justify-center mx-auto mb-2`}>
                  <feature.icon className={`h-4 w-4 ${feature.iconColor}`} />
                </div>
                <p className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{feature.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}