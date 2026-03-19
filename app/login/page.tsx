'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Users,
  Building,
  Shield,
  ArrowLeft,
  User,
  Crown
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRole, setSelectedRole] = useState<string>('');

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam) {
      setSelectedRole(roleParam);
    }
  }, [searchParams]);

  const handleRoleLogin = (role: string) => {
    // For demo purposes, we'll simulate login by redirecting to appropriate dashboard
    // In a real app, this would handle actual authentication

    switch (role) {
      case 'employee':
        router.push('/employee/chat');
        break;
      case 'manager':
        router.push('/manager');
        break;
      case 'employer':
        router.push('/employer/dashboard');
        break;
      case 'hr':
        router.push('/employer/analytics');
        break;
      default:
        router.push('/employee/chat');
    }
  };

  const roles = [
    {
      id: 'employee',
      title: 'Employee',
      description: 'Access personal wellness dashboard and AI chat',
      icon: User,
      color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700',
      features: ['Personal wellness tracking', 'AI mental health support', 'Confidential reporting', 'Progress visualization']
    },
    {
      id: 'manager',
      title: 'Manager',
      description: 'Manage your team and view team wellness analytics',
      icon: Users,
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-700',
      features: ['Team dashboard', 'Direct reports management', 'Team wellness analytics', 'Organization chart']
    },
    {
      id: 'employer',
      title: 'Employer',
      description: 'Full company analytics and employee management',
      icon: Building,
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-700',
      features: ['Company-wide analytics', 'Employee management', 'Department insights', 'Risk assessment']
    },
    {
      id: 'hr',
      title: 'HR Admin',
      description: 'Human resources and compliance management',
      icon: Shield,
      color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-700',
      features: ['HR analytics', 'Compliance reporting', 'Employee privacy management', 'Policy insights']
    }
  ];

  const selectedRoleData = roles.find(role => role.id === selectedRole);

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
        <motion.div
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-teal-300/20 dark:bg-teal-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, 60, 0],
            y: [0, -80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <header className="border-b border-white/20 dark:border-gray-800/50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-14 md:h-16">
            <Link href="/" className="flex items-center space-x-1 sm:space-x-2">
              <motion.div 
                className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-600 via-lime-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Brain className="text-white w-3 h-3 sm:w-4 sm:h-4" />
              </motion.div>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-lime-600 to-emerald-600">Diltak.ai</span>
            </Link>
            <div className="flex items-center space-x-2">
              <ThemeToggle size="sm" />
              <Link href="/">
                <Button variant="ghost" className="flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base px-2 sm:px-3 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-800 transition-all duration-200">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Home</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-6xl mx-auto px-2 sm:px-3 md:px-4 lg:px-8 py-6 sm:py-8 lg:py-12 z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            {selectedRole ? `${selectedRoleData?.title} Login` : 'Choose Your Role'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {selectedRole
              ? `Access your ${selectedRoleData?.title.toLowerCase()} dashboard and features`
              : 'Select your role to access the appropriate dashboard and features'
            }
          </p>
        </motion.div>

        {selectedRole ? (
          // Single role view
          <motion.div 
            className="max-w-md mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border shadow-2xl hover:shadow-3xl transition-all duration-300 ${selectedRoleData?.color.replace('text-', 'border-').replace('bg-', 'border-')}`}>
              <CardHeader className="text-center">
                <motion.div 
                  className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${selectedRoleData?.color}`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {selectedRoleData?.icon && <selectedRoleData.icon className="h-8 w-8" />}
                </motion.div>
                <CardTitle className="text-2xl text-gray-900 dark:text-white">{selectedRoleData?.title}</CardTitle>
                <p className="text-gray-600 dark:text-gray-300">{selectedRoleData?.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Available Features:</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                    {selectedRoleData?.features.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      className="w-full bg-gradient-to-r from-green-600 via-lime-600 to-emerald-600 hover:from-green-700 hover:via-lime-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      size="lg"
                      onClick={() => handleRoleLogin(selectedRole)}
                    >
                      Continue as {selectedRoleData?.title}
                    </Button>
                  </motion.div>

                  <Button
                    variant="outline"
                    className="w-full border-2 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30"
                    onClick={() => setSelectedRole('')}
                  >
                    Choose Different Role
                  </Button>
                </div>

                <div className="text-center">
                  <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                    Demo Mode - No Authentication Required
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          // Role selection grid
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {roles.map((role, index) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer ${role.color.replace('text-', 'border-').replace('bg-', 'border-')} hover:scale-105 hover:-translate-y-2`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <CardHeader className="text-center">
                    <motion.div 
                      className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${role.color}`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <role.icon className="h-8 w-8" />
                    </motion.div>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">{role.title}</CardTitle>
                    <p className="text-gray-600 dark:text-gray-300">{role.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                      {role.features.map((feature, index) => (
                        <li key={index}>• {feature}</li>
                      ))}
                    </ul>
                    <Button className="w-full mt-4 border-2" variant="outline">
                      Select {role.title}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Demo Notice */}
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="max-w-2xl mx-auto bg-green-50/80 dark:bg-green-950/50 backdrop-blur-sm border-2 border-green-200 dark:border-green-800 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-1 sm:space-x-2 mb-4">
                <Crown className="h-6 w-6 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Demo Mode</h3>
              </div>
              <p className="text-green-700 dark:text-green-300 mb-4">
                This is a demonstration version. No authentication is required - simply select your role to explore the features.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs sm:text-sm">
                <Badge variant="outline" className="text-green-700 dark:text-green-300 border-green-300 dark:border-green-600">No Login Required</Badge>
                <Badge variant="outline" className="text-green-700 dark:text-green-300 border-green-300 dark:border-green-600">Full Feature Access</Badge>
                <Badge variant="outline" className="text-green-700 dark:text-green-300 border-green-300 dark:border-green-600">Sample Data</Badge>
                <Badge variant="outline" className="text-green-700 dark:text-green-300 border-green-300 dark:border-green-600">Interactive Demo</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
