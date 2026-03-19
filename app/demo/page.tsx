'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
  Play,
  BarChart3,
  MessageSquare,
  Eye,
  Settings,
  Sparkles,
  Zap,
  Heart,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Target,
  Activity
} from 'lucide-react';

export default function DemoPage() {
  const [hoveredCard, setHoveredCard] = useState<string>('');

  const demos = [
    {
      id: 'employee',
      title: 'Employee Experience',
      description: 'Experience the employee wellness dashboard and AI chat',
      icon: User,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      features: ['AI Mental Health Chat', 'Personal Wellness Dashboard', 'Mood & Stress Tracking', 'Progress Visualization'],
      route: '/employee/chat',
      demoData: 'Sample employee with wellness history',
      stats: '7K+ users helped'
    },
    {
      id: 'manager',
      title: 'Manager Dashboard',
      description: 'Explore team management and hierarchy features',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      features: ['Team Wellness Overview', 'Direct Reports Management', 'Organization Chart', 'Team Analytics'],
      route: '/manager/dashboard',
      demoData: 'Manager with 5 direct reports',
      stats: '98% satisfaction rate'
    },
    {
      id: 'employer',
      title: 'Employer Analytics',
      description: 'Full company insights and employee management',
      icon: Building,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      features: ['Company-wide Analytics', 'Employee Management', 'Department Insights', 'Risk Assessment'],
      route: '/employer/dashboard',
      demoData: 'Company with 50+ employees',
      stats: '85% improvement rate'
    },
    {
      id: 'hierarchy',
      title: 'Hierarchy System',
      description: 'Test the organizational hierarchy features',
      icon: Shield,
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50',
      features: ['Org Chart Visualization', 'Permission Testing', 'Team Statistics', 'Access Control'],
      route: '/test-hierarchy',
      demoData: 'Multi-level organization structure',
      stats: 'Secure & Compliant'
    }
  ];

  const quickActions = [
    {
      title: 'AI Chat Demo',
      description: 'Try the AI mental health assistant',
      icon: MessageSquare,
      route: '/employee/chat',
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100'
    },
    {
      title: 'Manager Dashboard',
      description: 'View team management features',
      icon: Users,
      route: '/manager/dashboard',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      title: 'Analytics Overview',
      description: 'Explore company analytics',
      icon: BarChart3,
      route: '/employer/analytics',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100'
    },
    {
      title: 'Org Chart',
      description: 'Interactive organization chart',
      icon: Eye,
      route: '/manager/org-chart',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100'
    },
    {
      title: 'Test System',
      description: 'Test hierarchy functions',
      icon: Settings,
      route: '/test-hierarchy',
      color: 'text-red-600',
      bgColor: 'bg-red-50 hover:bg-red-100'
    }
  ];

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

  const handleDemoStart = () => {
    // Demo buttons are now static - no navigation
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <motion.header
        className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                animate={floatingAnimation}
                className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center"
              >
                <Brain className="h-5 w-5 text-white" />
              </motion.div>
              <span className="text-2xl font-bold text-gray-900">WellnessHub</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                className="hover:bg-green-50 hover:text-green-600 cursor-not-allowed opacity-50"
                disabled
              >
                Role-Based Login
              </Button>
              <Link href="/">
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-50">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Home</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-green-200 mb-6">
              <Sparkles className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Interactive Demo Available</span>
            </div>
          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6">
            Experience the Future of
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              Mental Health Care
            </span>
          </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore our comprehensive wellness platform with realistic sample data.
              No registration required - jump right into any role or feature.
            </p>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-6 mb-12"
            variants={itemVariants}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/80 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
              >
                <feature.icon className={`h-8 w-8 mx-auto mb-2 ${feature.color}`} />
                <h3 className="font-semibold text-gray-900 text-sm">{feature.title}</h3>
                <p className="text-xs text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Start</h2>
            <p className="text-lg text-gray-600">Jump into any feature instantly</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-5 xl:grid-cols-5 gap-4"
            variants={containerVariants}
          >
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className={`hover:shadow-xl transition-all duration-300 cursor-not-allowed opacity-75 ${action.bgColor} border-0`}
                  onClick={handleDemoStart}
                >
                  <CardContent className="p-6 text-center">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <action.icon className={`h-10 w-10 mx-auto mb-3 ${action.color}`} />
                    </motion.div>
                    <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                    <motion.div
                      className="mt-3"
                      whileHover={{ x: 5 }}
                    >
                      <ArrowRight className="h-4 w-4 mx-auto text-gray-400" />
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Detailed Demos */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Detailed Demos</h2>
            <p className="text-lg text-gray-600">Explore comprehensive role-based experiences</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {demos.map((demo, index) => (
              <motion.div
                key={demo.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                onHoverStart={() => setHoveredCard(demo.id)}
                onHoverEnd={() => setHoveredCard('')}
              >
                <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <CardHeader className="text-center pb-4">
                    <motion.div
                      className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br ${demo.color} shadow-lg`}
                      animate={hoveredCard === demo.id ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <demo.icon className="h-10 w-10 text-white" />
                    </motion.div>
                    <CardTitle className="text-2xl font-bold text-gray-900">{demo.title}</CardTitle>
                    <p className="text-gray-600 text-lg">{demo.description}</p>
                    <div className="flex justify-center gap-2 mt-3">
                      <Badge variant="outline" className="text-xs">
                        {demo.demoData}
                      </Badge>
                      <Badge className={`text-xs bg-gradient-to-r ${demo.color} text-white border-0`}>
                        {demo.stats}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Target className="h-4 w-4 mr-2 text-green-600" />
                        Demo Features:
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {demo.features.map((feature, featureIndex) => (
                          <motion.div
                            key={featureIndex}
                            className="flex items-center space-x-2 text-sm text-gray-600"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: featureIndex * 0.1 }}
                          >
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        className={`w-full bg-gradient-to-r ${demo.color} hover:opacity-90 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-not-allowed opacity-75`}
                        onClick={handleDemoStart}
                        disabled={true}
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Demo Preview
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Demo Information */}
        <motion.div
          className="mt-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={itemVariants}
        >
          <Card className="max-w-5xl mx-auto bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-xl">
            <CardContent className="p-8">
              <motion.div
                className="text-center mb-8"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={floatingAnimation}
                  className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <Brain className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Interactive Demo Experience</h3>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  This comprehensive demo showcases the complete WellnessHub platform with realistic sample data,
                  allowing you to experience every feature without any setup.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-3 gap-8 text-center">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white/60 backdrop-blur-sm rounded-xl p-6"
                >
                  <Activity className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <h4 className="font-bold text-gray-900 mb-3 text-lg">Sample Data</h4>
                  <p className="text-gray-600">
                    Pre-populated with realistic employee wellness data, team structures, and comprehensive analytics
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white/60 backdrop-blur-sm rounded-xl p-6"
                >
                  <Zap className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <h4 className="font-bold text-gray-900 mb-3 text-lg">Full Features</h4>
                  <p className="text-gray-600">
                    Access all platform features including AI chat, analytics, org charts, and management tools
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white/60 backdrop-blur-sm rounded-xl p-6"
                >
                  <Shield className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                  <h4 className="font-bold text-gray-900 mb-3 text-lg">No Registration</h4>
                  <p className="text-gray-600">
                    Jump right in and explore - no account creation or authentication required
                  </p>
                </motion.div>
              </div>

              <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    'AI-Powered Chat',
                    'Team Management',
                    'Wellness Analytics',
                    'Org Chart',
                    'Role-Based Access',
                    'Real-time Data',
                    '24/7 Support'
                  ].map((badge, index) => (
                    <motion.div
                      key={badge}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Badge
                        variant="secondary"
                        className="bg-white/80 text-gray-700 hover:bg-green-100 hover:text-green-700 transition-colors cursor-default"
                      >
                        {badge}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}