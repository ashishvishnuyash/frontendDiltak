'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TrendingUp,
  Users,
  Brain,
  AlertTriangle,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  BarChart3,
  Activity
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { Navbar } from '@/components/shared/navbar';
import { db } from '@/lib/firebase';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { toast } from 'sonner';

import type { MentalHealthReport, User } from '@/types/index';
import { demoUsers, demoReports } from '@/lib/demo-data';

interface AnalyticsData {
  departmentStats: { [key: string]: { count: number; avgWellness: number; avgStress: number; avgMood: number; avgEnergy: number } };
  trendData: { date: string; wellness: number; stress: number; mood: number; energy: number; reports: number }[];
  riskDistribution: { name: string; value: number; color: string }[];
  monthlyReports: { month: string; reports: number; avgWellness: number }[];
  wellnessMetrics: {
    totalEmployees: number;
    totalReports: number;
    avgWellness: number;
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
  };
}

const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  teal: '#14B8A6'
};

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    departmentStats: {},
    trendData: [],
    riskDistribution: [],
    monthlyReports: [],
    wellnessMetrics: {
      totalEmployees: 0,
      totalReports: 0,
      avgWellness: 0,
      highRiskCount: 0,
      mediumRiskCount: 0,
      lowRiskCount: 0,
    }
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [useDemoData, setUseDemoData] = useState(true);

  useEffect(() => {
    if (!userLoading) {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      if (!['employer', 'hr', 'admin', 'manager'].includes(user.role)) {
        router.push('/');
        return;
      }

      fetchAnalytics();
    }
  }, [user, userLoading, timeRange, selectedDepartment, useDemoData, router]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const companyId = user?.company_id;

      if (!companyId) {
        toast.error('Company information not found');
        setLoading(false);
        return;
      }

      // Use demo data for now
      if (useDemoData) {
        const demoEmployees = demoUsers.filter(u => u.company_id === 'demo-company');
        const demoReportsData = demoReports.filter(r => r.company_id === 'demo-company');

        const demoWellnessMetrics = {
          totalEmployees: demoEmployees.length,
          totalReports: demoReportsData.length,
          avgWellness: demoReportsData.length > 0
            ? Math.round((demoReportsData.reduce((sum, r) => sum + r.overall_wellness, 0) / demoReportsData.length) * 10) / 10
            : 0,
          highRiskCount: demoReportsData.filter(r => r.risk_level === 'high').length,
          mediumRiskCount: demoReportsData.filter(r => r.risk_level === 'medium').length,
          lowRiskCount: demoReportsData.filter(r => r.risk_level === 'low').length,
        };

        const demoDepartmentStats: { [key: string]: { count: number; avgWellness: number; avgStress: number; avgMood: number; avgEnergy: number } } = {};

        demoEmployees.forEach(employee => {
          const dept = employee.department || 'Unassigned';
          const employeeReports = demoReportsData.filter(r => r.employee_id === employee.id);

          if (!demoDepartmentStats[dept]) {
            demoDepartmentStats[dept] = { count: 0, avgWellness: 0, avgStress: 0, avgMood: 0, avgEnergy: 0 };
          }

          demoDepartmentStats[dept].count++;

          if (employeeReports.length > 0) {
            demoDepartmentStats[dept].avgWellness = Math.round((employeeReports.reduce((sum, r) => sum + r.overall_wellness, 0) / employeeReports.length) * 10) / 10;
            demoDepartmentStats[dept].avgStress = Math.round((employeeReports.reduce((sum, r) => sum + r.stress_level, 0) / employeeReports.length) * 10) / 10;
            demoDepartmentStats[dept].avgMood = Math.round((employeeReports.reduce((sum, r) => sum + r.mood_rating, 0) / employeeReports.length) * 10) / 10;
            demoDepartmentStats[dept].avgEnergy = Math.round((employeeReports.reduce((sum, r) => sum + r.energy_level, 0) / employeeReports.length) * 10) / 10;
          }
        });

        const demoTrendData = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          demoTrendData.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            wellness: Math.round((6 + Math.random() * 2) * 10) / 10,
            stress: Math.round((4 + Math.random() * 3) * 10) / 10,
            mood: Math.round((6 + Math.random() * 2) * 10) / 10,
            energy: Math.round((5 + Math.random() * 3) * 10) / 10,
            reports: Math.floor(Math.random() * 3) + 1
          });
        }

        const demoRiskDistribution = [
          { name: 'Low Risk', value: demoWellnessMetrics.lowRiskCount, color: COLORS.success },
          { name: 'Medium Risk', value: demoWellnessMetrics.mediumRiskCount, color: COLORS.warning },
          { name: 'High Risk', value: demoWellnessMetrics.highRiskCount, color: COLORS.danger },
        ].filter(item => item.value > 0);

        setAnalytics({
          departmentStats: demoDepartmentStats,
          trendData: demoTrendData,
          riskDistribution: demoRiskDistribution,
          monthlyReports: [
            { month: 'Nov 2024', reports: 8, avgWellness: 6.2 },
            { month: 'Dec 2024', reports: 12, avgWellness: 6.8 },
            { month: 'Jan 2025', reports: 15, avgWellness: 6.5 }
          ],
          wellnessMetrics: demoWellnessMetrics,
        });

        toast.info('Showing demo analytics data. Toggle off demo mode to see real data.');
      }

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const departments = Object.keys(analytics.departmentStats);

  const exportData = async () => {
    try {
      toast.info('Preparing analytics export...');

      const csvData = [
        ['Metric', 'Value'],
        ['Total Employees', analytics.wellnessMetrics.totalEmployees],
        ['Total Reports', analytics.wellnessMetrics.totalReports],
        ['Average Wellness', analytics.wellnessMetrics.avgWellness],
        ['High Risk Employees', analytics.wellnessMetrics.highRiskCount],
        ['Medium Risk Employees', analytics.wellnessMetrics.mediumRiskCount],
        ['Low Risk Employees', analytics.wellnessMetrics.lowRiskCount],
        [''],
        ['Department', 'Employee Count', 'Avg Wellness', 'Avg Stress', 'Avg Mood', 'Avg Energy'],
        ...Object.entries(analytics.departmentStats).map(([dept, stats]) => [
          dept, stats.count, stats.avgWellness, stats.avgStress, stats.avgMood, stats.avgEnergy
        ])
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${timeRange}d-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Analytics exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export analytics');
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

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <BarChart3 className="h-16 w-16 text-green-600 mx-auto mb-4" />
          </motion.div>
          <p className="text-lg text-gray-600">Loading analytics...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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

      <Navbar user={user || undefined} />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <div className="flex items-center space-x-3 mb-4">
              <motion.div
                animate={floatingAnimation}
                className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <BarChart3 className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">Analytics Dashboard</h1>
                <p className="text-lg text-gray-600 mt-1">
                  Deep insights into your team&apos;s mental health and wellness trends
                </p>
              </div>
            </div>
          </motion.div>
          <motion.div className="flex items-center space-x-4 mt-4 sm:mt-0" variants={itemVariants}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={useDemoData ? "default" : "outline"}
                onClick={() => setUseDemoData(!useDemoData)}
                className={useDemoData ? "bg-purple-600 hover:bg-purple-700" : "bg-white/60 backdrop-blur-sm hover:bg-green-50"}
              >
                <Brain className="h-4 w-4 mr-2" />
                {useDemoData ? 'Demo Mode' : 'Use Demo'}
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="outline" onClick={fetchAnalytics} className="bg-white/60 backdrop-blur-sm hover:bg-green-50">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="outline" onClick={exportData} className="bg-white/60 backdrop-blur-sm hover:bg-green-50">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button onClick={() => router.push('/employer/reports/custom')} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg">
                <BarChart3 className="h-4 w-4 mr-2" />
                Custom Report
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                      <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/20">
                        <Calendar className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                        <SelectItem value="365">Last year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/20">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <div className="text-sm text-gray-600">
                      <p>Showing data for {timeRange} days</p>
                      <p>{selectedDepartment === 'all' ? 'All departments' : selectedDepartment}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Users className="h-8 w-8 text-blue-600" />
                  </motion.div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      {analytics.wellnessMetrics.totalEmployees}
                    </div>
                    <p className="text-sm text-gray-600">Active Employees</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Brain className="h-8 w-8 text-green-600" />
                  </motion.div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      {analytics.wellnessMetrics.avgWellness}/10
                    </div>
                    <p className="text-sm text-gray-600">Avg Wellness</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </motion.div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      {analytics.wellnessMetrics.highRiskCount}
                    </div>
                    <p className="text-sm text-gray-600">High Risk</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </motion.div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      {analytics.wellnessMetrics.totalReports}
                    </div>
                    <p className="text-sm text-gray-600">Total Reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Charts */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {/* Wellness Trends */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Wellness Trends Over Time</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="wellness" stroke={COLORS.primary} strokeWidth={2} name="Wellness" />
                      <Line type="monotone" dataKey="mood" stroke={COLORS.success} strokeWidth={2} name="Mood" />
                      <Line type="monotone" dataKey="energy" stroke={COLORS.purple} strokeWidth={2} name="Energy" />
                      <Line type="monotone" dataKey="stress" stroke={COLORS.danger} strokeWidth={2} name="Stress" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No trend data available for the selected period</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Risk Distribution */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Risk Level Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.riskDistribution.length > 0 ? (
                  <div className="space-y-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={analytics.riskDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {analytics.riskDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="space-y-2">
                      {analytics.riskDistribution.map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-sm text-gray-700">{item.name}</span>
                          </div>
                          <span className="text-sm font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No risk data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Department Details */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Department Breakdown</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(analytics.departmentStats).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(analytics.departmentStats).map(([dept, stats]) => (
                      <div key={dept} className="p-4 bg-gray-50 rounded-lg border">
                        <h3 className="font-semibold text-gray-900 mb-3">{dept}</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Employees:</span>
                            <span className="font-medium">{stats.count}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Avg Wellness:</span>
                            <span className="font-medium">{stats.avgWellness}/10</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Avg Mood:</span>
                            <span className="font-medium">{stats.avgMood}/10</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Avg Stress:</span>
                            <span className="font-medium">{stats.avgStress}/10</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Avg Energy:</span>
                            <span className="font-medium">{stats.avgEnergy}/10</span>
                          </div>
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(stats.avgWellness / 10) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Department Data</h3>
                    <p className="text-gray-500 mb-4">
                      No wellness reports found for the selected criteria.
                    </p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• Ensure employees have submitted wellness reports</p>
                      <p>• Try selecting a longer time range</p>
                      <p>• Check if the department filter is too restrictive</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="mt-8 text-center text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>Analytics data is updated in real-time based on employee wellness reports</p>
          <p className="mt-1">All data is aggregated and anonymized for privacy compliance</p>
        </motion.div>
      </div>
    </div>
  );
}

