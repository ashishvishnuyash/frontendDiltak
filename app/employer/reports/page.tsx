'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, easeInOut, easeOut } from 'framer-motion';
import { Navbar } from '@/components/shared/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  RefreshCw,
  Sparkles,
  Heart,
  Zap,
  Star,
  Activity,
  Eye,
  ArrowRight,
  Shield
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { MentalHealthReport, User } from '@/types';

import { toast } from 'sonner';

interface ReportWithEmployee extends MentalHealthReport {
  employee?: User;
}

export default function EmployerReportsPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [reports, setReports] = useState<ReportWithEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = useCallback(async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);

      // Fetch all company employees first
      const employeesQuery = query(
        collection(db, 'users'),
        where('company_id', '==', user.company_id)
      );
      const employeesSnapshot = await getDocs(employeesQuery);
      const employees = employeesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));

      // Create employee lookup map
      const employeeMap = new Map(employees.map(emp => [emp.id, emp]));

      // Fetch all reports for the company
      const reportsQuery = query(
        collection(db, 'mental_health_reports'),
        where('company_id', '==', user.company_id)
      );
      const reportsSnapshot = await getDocs(reportsQuery);

      const reportsData = reportsSnapshot.docs.map(doc => {
        const reportData = { id: doc.id, ...doc.data() } as MentalHealthReport;
        const employee = employeeMap.get(reportData.employee_id);

        return {
          ...reportData,
          employee
        } as ReportWithEmployee;
      });

      // Sort reports by date (newest first)
      const sortedReports = reportsData.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setReports(sortedReports);

      // Calculate statistics
      const totalReports = sortedReports.length;
      const highRisk = sortedReports.filter(r => r.risk_level === 'high').length;
      const mediumRisk = sortedReports.filter(r => r.risk_level === 'medium').length;
      const lowRisk = sortedReports.filter(r => r.risk_level === 'low').length;
      const avgWellness = totalReports > 0
        ? sortedReports.reduce((sum, r) => sum + (r.overall_wellness || 0), 0) / totalReports
        : 0;

      // Get unique departments
      const departments = Array.from(
        new Set(employees.map(emp => emp.department).filter(Boolean))
      ) as string[];

      setStats({
        totalReports,
        highRisk,
        mediumRisk,
        lowRisk,
        avgWellness: Math.round(avgWellness * 10) / 10,
        departments
      });

    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.company_id]);

  const [stats, setStats] = useState({
    totalReports: 0,
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0,
    avgWellness: 0,
    departments: [] as string[]
  });

  useEffect(() => {
    if (!userLoading) {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      if (user.role !== 'employer' && user.role !== 'hr' && user.role !== 'admin') {
        router.push('/');
        return;
      }

      if (user.company_id) {
        fetchReports();
      }
    }
  }, [user, userLoading, router, fetchReports]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
    toast.success('Reports refreshed!');
  };

  // Filter and sort reports
  const filteredAndSortedReports = reports
    .filter(report => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const employeeName = report.employee
          ? `${report.employee.first_name} ${report.employee.last_name}`.toLowerCase()
          : '';
        const employeeEmail = report.employee?.email?.toLowerCase() || '';
        const department = report.employee?.department?.toLowerCase() || '';

        if (!employeeName.includes(searchLower) &&
          !employeeEmail.includes(searchLower) &&
          !department.includes(searchLower)) {
          return false;
        }
      }

      // Risk filter
      if (filterRisk !== 'all' && report.risk_level !== filterRisk) {
        return false;
      }

      // Department filter
      if (filterDepartment !== 'all' && report.employee?.department !== filterDepartment) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'wellness-high':
          return (b.overall_wellness || 0) - (a.overall_wellness || 0);
        case 'wellness-low':
          return (a.overall_wellness || 0) - (b.overall_wellness || 0);
        case 'stress-high':
          return b.stress_level - a.stress_level;
        case 'stress-low':
          return a.stress_level - b.stress_level;
        case 'risk-high':
          const riskOrder = { high: 3, medium: 2, low: 1 };
          return (riskOrder[b.risk_level] || 0) - (riskOrder[a.risk_level] || 0);
        case 'employee':
          const nameA = a.employee ? `${a.employee.first_name} ${a.employee.last_name}` : '';
          const nameB = b.employee ? `${b.employee.first_name} ${b.employee.last_name}` : '';
          return nameA.localeCompare(nameB);
        default:
          return 0;
      }
    });

  const getRiskLevelBadge = (riskLevel: 'low' | 'medium' | 'high') => {
    const colors = {
      low: 'bg-green-100 text-green-700 border-green-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      high: 'bg-red-100 text-red-700 border-red-200',
    };
    const icons = {
      low: <CheckCircle className="h-3 w-3" />,
      medium: <Clock className="h-3 w-3" />,
      high: <AlertTriangle className="h-3 w-3" />,
    };
    return (
      <Badge className={`${colors[riskLevel]} flex items-center space-x-1`}>
        {icons[riskLevel]}
        <span>{riskLevel.toUpperCase()}</span>
      </Badge>
    );
  };

  const generateReport = () => {
    // This would generate a comprehensive report
    console.log('Generating comprehensive report...');
    toast.info('Generating comprehensive report...');
  };

  const exportData = async () => {
    try {
      toast.info('Preparing comprehensive report...');

      // Build query parameters for the export page
      const params = new URLSearchParams({
        type: 'company',
        range: '30d',
        department: filterDepartment,
        risk: filterRisk
      });

      // Redirect to the export page
      router.push(`/export/report?${params.toString()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to prepare export');
    }
  };

  const handleLogout = async () => {
    try {
      // Sign out from Firebase Auth first
      await signOut(auth);

      // Clear any local storage or session storage
      localStorage.clear();
      sessionStorage.clear();

      // Clear any cookies if needed
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });

      // Show logout message
      toast.success('Logged out successfully');

      // Redirect to login page
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout');
      // Still redirect even if there's an error
      router.push('/auth/login');
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
      transition: { duration: 0.6, ease: easeOut }
    }
  };

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: easeInOut
    }
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-gray-950 dark:via-slate-900 dark:to-teal-950 flex items-center justify-center">
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
            <FileText className="h-16 w-16 text-green-600 mx-auto mb-4" />
          </motion.div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading wellness reports...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
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
      <div className="border-b border-white/20 dark:border-gray-800/50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group" onClick={() => router.push('/auth/login')}>
              <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-emerald-600 to-green-700 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 lg:h-6 lg:w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent group-hover:from-emerald-600 group-hover:to-green-700 transition-all duration-300">
                  Wellness Hub
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Employer Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button variant="outline" size="sm" className="hidden lg:flex text-emerald-700 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 font-semibold shadow-sm hover:shadow-md transition-all duration-300 text-xs sm:text-sm">
                Management
              </Button>
              <Button variant="outline" size="sm" className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-300">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400" />
              </Button>
              <Button variant="outline" size="sm" className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-300">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400" />
              </Button>
              <ThemeToggle size="sm" />
              <Button
                variant="outline"
                size="sm"
                className="text-emerald-700 border-emerald-200 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 font-semibold shadow-sm hover:shadow-md transition-all duration-300 px-2 sm:px-3"
                onClick={handleLogout}
              >
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2 sm:mb-3 lg:mb-4 tracking-tight leading-tight">
              Wellness Reports
            </h1>
            <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 dark:text-gray-400 font-light leading-relaxed max-w-full sm:max-w-2xl">
              View comprehensive wellness reports from your team members and track their mental health progress with advanced analytics.
            </p>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="flex space-x-4 sm:space-x-6 lg:space-x-8 border-b border-gray-200/60 dark:border-gray-700/60 overflow-x-auto">
            <Link href="/employer/dashboard">
              <button className="pb-3 sm:pb-4 px-1 sm:px-2 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium sm:font-semibold text-sm sm:text-base transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 whitespace-nowrap">
                Overview
              </button>
            </Link>
            <Link href="/employer/employees">
              <button className="pb-3 sm:pb-4 px-1 sm:px-2 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium sm:font-semibold text-sm sm:text-base transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-600 whitespace-nowrap">
                Employees
              </button>
            </Link>
            <button className="pb-3 sm:pb-4 px-1 sm:px-2 border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 font-semibold sm:font-bold text-sm sm:text-base relative whitespace-nowrap">
              Reports
              <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div></div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                onClick={generateReport}
                className="border-emerald-200 text-emerald-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm"
              >
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Generate Report</span>
                <span className="sm:hidden">Generate</span>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleRefresh}
                variant="outline"
                disabled={refreshing}
                className="border-blue-200 text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm"
              >
                {refreshing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  </motion.div>
                ) : (
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                )}
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                onClick={exportData}
                className="border-purple-200 text-purple-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Export Data</span>
                <span className="sm:hidden">Export</span>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Summary Stats */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} whileHover={{ scale: 1.05, y: -8 }}>
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:border-blue-300/50 dark:hover:border-blue-600/50 group">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:space-x-3 text-center sm:text-left">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 mb-2 sm:mb-0"
                  >
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                  </motion.div>
                  <div>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent leading-tight">{reports.length}</div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total Reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.05, y: -8 }}>
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:border-emerald-300/50 dark:hover:border-emerald-600/50 group">
              <CardContent className="p-8">
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300"
                  >
                    <TrendingUp className="h-8 w-8 text-white" />
                  </motion.div>
                  <div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-tight">
                      {reports.length > 0
                        ? Math.round(reports.reduce((sum, report) => sum + report.overall_wellness, 0) / reports.length)
                        : 0
                      }/10
                    </div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Avg Wellness</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }}>
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </motion.div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {reports.filter(r => r.risk_level === 'high').length}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">High Risk</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }}>
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </motion.div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {reports.filter(r => {
                        const reportDate = new Date(r.created_at);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return reportDate >= weekAgo;
                      }).length}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Card className="mb-6 sm:mb-8 bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 sm:pl-10 border-green-200 text-green-600 border-white/20 focus:border-green-400 focus:ring-green-400 text-sm"
                    />
                  </div>

                  <Select value={filterRisk} onValueChange={setFilterRisk}>
                    <SelectTrigger className="border-green-200 text-green-600 border-white/20">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by risk" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk Levels</SelectItem>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger className="border-green-200 text-green-600 border-white/20">
                      <SelectValue placeholder="Filter by department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {stats.departments.map(dept => (
                        <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="border-green-200 text-green-600 border-white/20">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="wellness-high">Highest Wellness</SelectItem>
                      <SelectItem value="wellness-low">Lowest Wellness</SelectItem>
                      <SelectItem value="stress-high">Highest Stress</SelectItem>
                      <SelectItem value="stress-low">Lowest Stress</SelectItem>
                      <SelectItem value="risk-high">Highest Risk</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="text-xs sm:text-sm text-gray-600 flex items-center">
                    <span>{filteredAndSortedReports.length} of {reports.length} reports</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Reports List */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {filteredAndSortedReports.length > 0 ? (
            <motion.div
              className="space-y-6"
              variants={containerVariants}
            >
              {filteredAndSortedReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
                        <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white font-semibold text-lg">
                                {report.employee ? `${report.employee.first_name.charAt(0)}${report.employee.last_name.charAt(0)}` : 'E'}
                              </span>
                            </div>
                          </motion.div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                              {report.employee ? `${report.employee.first_name} ${report.employee.last_name}` : 'Employee Report'}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(report.created_at).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                              <span>
                                {new Date(report.created_at).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {report.employee?.department && (
                                <Badge variant="outline" className="bg-white/60">{report.employee.department}</Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          {getRiskLevelBadge(report.risk_level)}
                          <div className="text-right">
                            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                              {report.overall_wellness}/10
                            </div>
                            <div className="text-sm text-gray-600">Overall Wellness</div>
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Link href={`/employer/reports/${report.id}`}>
                              <Button variant="outline" size="sm" className="bg-white/60 dark:bg-gray-800/60 hover:bg-green-50 dark:hover:bg-green-900/20 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </Button>
                            </Link>
                          </motion.div>
                        </div>
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <motion.div
                          className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="flex items-center justify-center mb-2">
                            <Heart className="h-5 w-5 text-blue-600 mr-2" />
                            <div className="text-xl font-bold text-blue-700">
                              {report.mood_rating}/10
                            </div>
                          </div>
                          <div className="text-xs text-blue-600">Mood</div>
                        </motion.div>

                        <motion.div
                          className="text-center p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="flex items-center justify-center mb-2">
                            <Zap className="h-5 w-5 text-red-600 mr-2" />
                            <div className="text-xl font-bold text-red-700">
                              {report.stress_level}/10
                            </div>
                          </div>
                          <div className="text-xs text-red-600">Stress</div>
                        </motion.div>

                        <motion.div
                          className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="flex items-center justify-center mb-2">
                            <Star className="h-5 w-5 text-green-600 mr-2" />
                            <div className="text-xl font-bold text-green-700">
                              {report.energy_level}/10
                            </div>
                          </div>
                          <div className="text-xs text-green-600">Energy</div>
                        </motion.div>

                        <motion.div
                          className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="flex items-center justify-center mb-2">
                            <Activity className="h-5 w-5 text-purple-600 mr-2" />
                            <div className="text-xl font-bold text-purple-700">
                              {report.work_satisfaction}/10
                            </div>
                          </div>
                          <div className="text-xs text-purple-600">Work Satisfaction</div>
                        </motion.div>
                      </div>

                      {/* Additional Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-semibold text-gray-700">{report.work_life_balance}/10</div>
                          <div className="text-xs text-gray-600">Work-Life Balance</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-semibold text-gray-700">{report.anxiety_level}/10</div>
                          <div className="text-xs text-gray-600">Anxiety</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-semibold text-gray-700">{report.confidence_level}/10</div>
                          <div className="text-xs text-gray-600">Confidence</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-semibold text-gray-700">{report.sleep_quality}/10</div>
                          <div className="text-xs text-gray-600">Sleep Quality</div>
                        </div>
                      </div>

                      {/* AI Analysis */}
                      {report.ai_analysis && (
                        <motion.div
                          className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center">
                            <Sparkles className="h-4 w-4 mr-2" />
                            AI Insights:
                          </h4>
                          <p className="text-sm text-blue-600">{report.ai_analysis}</p>
                        </motion.div>
                      )}

                      {/* Note: Comments are not shown to maintain employee privacy */}
                      {report.comments && (
                        <motion.div
                          className="mt-4 p-4 bg-gray-50 rounded-xl"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Employee Feedback:</h4>
                          <p className="text-sm text-gray-600 italic">
                            [Personal comments are kept confidential for employee privacy]
                          </p>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div variants={itemVariants}>
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="p-12 text-center">
                  <motion.div
                    animate={floatingAnimation}
                    className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  >
                    <FileText className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Reports Found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {searchTerm || filterRisk !== 'all' || filterDepartment !== 'all'
                      ? 'No reports match your current filters. Try adjusting your search criteria.'
                      : 'No wellness reports have been submitted yet. Encourage your team to start tracking their wellness!'
                    }
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Privacy Notice */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mt-8">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600" />
                  Privacy & Confidentiality
                </h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• Employee wellness reports are visible to authorized managers and HR personnel</p>
                  <p>• Personal comments and sensitive information are kept confidential when marked as private</p>
                  <p>• Data is used to provide appropriate support and improve workplace wellness programs</p>
                  <p>• All wellness data is handled in accordance with company privacy policies</p>
                  <p>• All data is encrypted and stored securely in compliance with privacy regulations</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
