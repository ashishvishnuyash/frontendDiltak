'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/use-user';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  TrendingUp, 
  Calendar, 
  MessageSquare,
  AlertTriangle,
  Heart,
  Battery,
  Smile,
  Sparkles,
  Zap,
  Star,
  ArrowRight,
  RefreshCw,
  Loader2,
  Bell,
  User,
  LogOut,
  BarChart3,
  BookOpen,
  Clock,
  Award
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { MentalHealthReport } from '@/types';
import { auth, db } from '@/lib/firebase';
import { withAuth } from '@/components/auth/with-auth';
import { useCallback } from 'react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import ComprehensiveMetrics from '@/components/dashboard/ComprehensiveMetrics';
import { ComprehensiveReportExportService } from '@/lib/comprehensive-report-export-service';
import EmployeeNavbar from '@/components/shared/EmployeeNavbar';
// Dashboard component

function EmployeeDashboard() {
  const { user, loading: userLoading } = useUser();
  const [reports, setReports] = useState<MentalHealthReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState({ 
    averageMood: 0,
    averageStress: 0,
    averageEnergy: 0,
    reportsCount: 0,
    lastReportDate: null as string | null,
  });
  const router = useRouter();


  const fetchReports = useCallback(async () => {
    try {
      if (!user?.id) {
        console.log('No user ID available');
        setLoading(false);
        return;
      }
      // Fetch reports from Firestore where employee_id matches current user's ID
      const reportsRef = collection(db, 'mental_health_reports');
      const q = query(reportsRef, where('employee_id', '==', user.id));
      const querySnapshot = await getDocs(q);

      console.log('Query snapshot size:', querySnapshot.size);

      const fetchedReports: MentalHealthReport[] = querySnapshot.docs.map((doc: any) => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          // Ensure created_at is a string
          created_at: data.created_at || new Date().toISOString()
        } as MentalHealthReport;
      });

      console.log('Fetched reports:', fetchedReports.length);

      // Sort reports by created_at in JavaScript (descending order)
      const sortedReports = fetchedReports.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Limit to 10 most recent reports
      const limitedReports = sortedReports.slice(0, 10);

      setReports(limitedReports);

      // Calculate stats
      if (limitedReports.length > 0) {
        const totalMood = limitedReports.reduce((sum: number, report: MentalHealthReport) => sum + (report.mood_rating || 0), 0);
        const totalStress = limitedReports.reduce((sum: number, report: MentalHealthReport) => sum + (report.stress_level || 0), 0);
        const totalEnergy = limitedReports.reduce((sum: number, report: MentalHealthReport) => sum + (report.energy_level || 0), 0);

        setStats({
          averageMood: Math.round(totalMood / limitedReports.length),
          averageStress: Math.round(totalStress / limitedReports.length),
          averageEnergy: Math.round(totalEnergy / limitedReports.length),
          reportsCount: limitedReports.length,
          lastReportDate: limitedReports[0].created_at,
        });
      } else {
        // Set default stats when no reports
        setStats({
          averageMood: 0,
          averageStress: 0,
          averageEnergy: 0,
          reportsCount: 0,
          lastReportDate: null,
        });
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      // Set default stats on error
      setStats({
        averageMood: 0,
        averageStress: 0,
        averageEnergy: 0,
        reportsCount: 0,
        lastReportDate: null,
      });
      setReports([]);
    } finally {
      // Always set loading to false
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user, fetchReports]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
  };

  const getWellnessStatus = (score: number): { label: string; color: string; textColor: string } => {
    if (score >= 8) return { label: 'Excellent', color: 'bg-green-500', textColor: 'text-green-700' };
    if (score >= 6) return { label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-700' };
    if (score >= 4) return { label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    return { label: 'Needs Attention', color: 'bg-red-500', textColor: 'text-red-700' };
  };

  const getRiskLevelBadge = (riskLevel: 'low' | 'medium' | 'high') => {
    const colors = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-red-100 text-red-700',
    };
    return colors[riskLevel];
  };

  const safeRiskLevel = (value: any): 'low' | 'medium' | 'high' => {
    if (value === 'medium' || value === 'high') return value;
    return 'low';
  };

  const chartData = reports.slice(0, 7).reverse().map((report, index) => ({
    date: new Date(report.created_at).toLocaleDateString(),
    mood: report.mood_rating,
    stress: 11 - report.stress_level, // Invert stress for better visualization
    energy: report.energy_level,
    wellness: report.overall_wellness,
  }));


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
            <Brain className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
          </motion.div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading your wellness dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const latestReport = reports[0];
  const wellnessStatus = latestReport ? getWellnessStatus(latestReport.overall_wellness) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-gray-950 dark:via-slate-900 dark:to-teal-950 text-gray-900 dark:text-gray-100 transition-colors duration-500 overflow-x-hidden lg:ml-64">
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

      <EmployeeNavbar user={user} />
      
      <div className="relative max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8 z-10">
        {/* Welcome Section */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-lime-600 to-emerald-600 mb-2 sm:mb-3 lg:mb-4 tracking-tight leading-tight">
              Welcome back, {user.first_name || user.email}!
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 font-light leading-relaxed max-w-full sm:max-w-2xl lg:max-w-3xl">
              Monitor your mental wellness and track your progress over time with our advanced analytics.
            </p>
          </motion.div>
        </div>



        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <Link href="/employee/reports/new">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700 rounded-2xl p-3 sm:p-4 lg:p-6 cursor-pointer group hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300"
              >
                <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 sm:p-3 rounded-xl shadow-lg flex-shrink-0">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-sm sm:text-base truncate">New Wellness Check</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">Record your current state</p>
                  </div>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
              </motion.div>
          </Link>

          <Link href="/employee/wellness-hub">
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-emerald-200 dark:border-emerald-700 rounded-2xl p-6 cursor-pointer group hover:shadow-2xl hover:border-emerald-400 dark:hover:border-emerald-500 transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Wellness Toolkit</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Access wellness tools</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          </Link>

          <Link href="/employee/chat">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-green-200 dark:border-green-700 rounded-2xl p-6 cursor-pointer group hover:shadow-2xl hover:border-green-400 dark:hover:border-green-500 transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-lg">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">AI Assistant</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Chat with our wellness AI</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
          </Link>

          <Link href="/employee/reports">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-700 rounded-2xl p-6 cursor-pointer group hover:shadow-2xl hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">View Reports</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Track your progress</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            </Link>

            <Link href="/employee/support">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-red-200 dark:border-red-700 rounded-2xl p-6 cursor-pointer group hover:shadow-2xl hover:border-red-400 dark:hover:border-red-500 transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl shadow-lg">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">Support & Escalation</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Get help when needed</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            </Link>

            <Link href="/employee/recommendations">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-indigo-200 dark:border-indigo-700 rounded-2xl p-6 cursor-pointer group hover:shadow-2xl hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">AI Recommendations</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Personalized wellness tips</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            </Link>

            <Link href="/employee/gamification">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-yellow-200 dark:border-yellow-700 rounded-2xl p-6 cursor-pointer group hover:shadow-2xl hover:border-yellow-400 dark:hover:border-yellow-500 transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-3 rounded-xl shadow-lg">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">Gamification</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Earn points & badges</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            </Link>

            <Link href="/employee/community">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-teal-200 dark:border-teal-700 rounded-2xl p-6 cursor-pointer group hover:shadow-2xl hover:border-teal-400 dark:hover:border-teal-500 transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-3 rounded-xl shadow-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">Community</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Anonymous support space</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
          </Link>
        </div>

        {/* Interactive Stats Overview */}
        {latestReport ? (
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-green-200 dark:border-green-700 shadow-2xl">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                    Current Wellness Snapshot
                  </h2>
                  <Link href="/employee/reports">
                    <Button variant="outline" size="sm" className="border-2 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 text-xs sm:text-sm px-2 sm:px-3 shadow-sm hover:shadow-md transition-all">
                      <span className="hidden sm:inline">View Interactive Analytics</span>
                      <span className="sm:hidden">Analytics</span>
                      <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
                    </Button>
                  </Link>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Mood */}
                  <motion.div 
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative w-20 h-20 mx-auto mb-2">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          className="text-gray-200 dark:text-gray-700"
                        />
                        <motion.circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="#3B82F6"
                          strokeWidth="4"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={226}
                          strokeDashoffset={226 - (latestReport.mood_rating / 10) * 226}
                          initial={{ strokeDashoffset: 226 }}
                          animate={{ strokeDashoffset: 226 - (latestReport.mood_rating / 10) * 226 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Smile className="h-4 w-4 text-blue-600 mb-1" />
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          {latestReport.mood_rating}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Mood</p>
                  </motion.div>

                  {/* Energy */}
                  <motion.div 
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative w-20 h-20 mx-auto mb-2">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          className="text-gray-200 dark:text-gray-700"
                        />
                        <motion.circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="#10B981"
                          strokeWidth="4"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={226}
                          strokeDashoffset={226 - (latestReport.energy_level / 10) * 226}
                          initial={{ strokeDashoffset: 226 }}
                          animate={{ strokeDashoffset: 226 - (latestReport.energy_level / 10) * 226 }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Battery className="h-4 w-4 text-green-600 mb-1" />
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          {latestReport.energy_level}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Energy</p>
                  </motion.div>

                  {/* Stress (inverted) */}
                  <motion.div 
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative w-20 h-20 mx-auto mb-2">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          className="text-gray-200 dark:text-gray-700"
                        />
                        <motion.circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="#EF4444"
                          strokeWidth="4"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={226}
                          strokeDashoffset={226 - (latestReport.stress_level / 10) * 226}
                          initial={{ strokeDashoffset: 226 }}
                          animate={{ strokeDashoffset: 226 - (latestReport.stress_level / 10) * 226 }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-red-600 mb-1" />
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          {latestReport.stress_level}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Stress</p>
                  </motion.div>

                  {/* Overall Wellness */}
                  <motion.div 
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative w-20 h-20 mx-auto mb-2">
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          className="text-gray-200 dark:text-gray-700"
                        />
                        <motion.circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="#8B5CF6"
                          strokeWidth="4"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={226}
                          strokeDashoffset={226 - (latestReport.overall_wellness / 10) * 226}
                          initial={{ strokeDashoffset: 226 }}
                          animate={{ strokeDashoffset: 226 - (latestReport.overall_wellness / 10) * 226 }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Brain className="h-4 w-4 text-purple-600 mb-1" />
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          {latestReport.overall_wellness}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Wellness</p>
                    {wellnessStatus && (
                      <Badge className={`${wellnessStatus.textColor} bg-opacity-20 mt-1 text-xs`}>
                        {wellnessStatus.label}
                      </Badge>
                    )}
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
                <Smile className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-400 dark:text-gray-500">No Data</div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Mood</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardContent className="p-6 text-center">
                <Battery className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <div className="text-lg font-semibold text-gray-400 dark:text-gray-500">No Data</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Energy</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <div className="text-lg font-semibold text-gray-400 dark:text-gray-500">No Data</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Stress</p>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardContent className="p-6 text-center">
                <Brain className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <div className="text-lg font-semibold text-gray-400 dark:text-gray-500">No Data</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Wellness</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Wellness Trend Chart */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <span>Wellness Trends (Last 7 Reports)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="mood" stroke="#3B82F6" strokeWidth={2} name="Mood" />
                    <Line type="monotone" dataKey="stress" stroke="#F59E0B" strokeWidth={2} name="Stress (Inverted)" />
                    <Line type="monotone" dataKey="energy" stroke="#10B981" strokeWidth={2} name="Energy" />
                    <Line type="monotone" dataKey="wellness" stroke="#8B5CF6" strokeWidth={2} name="Overall Wellness" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">No reports yet</p>
                    <p className="text-sm mb-4">Create your first wellness check to see trends.</p>
                    <Link href="/employee/reports/new">
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Create Report
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-gray-900 dark:text-gray-100">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <span>Recent Reports</span>
                </div>
                <Link href="/employee/reports">
                  <Button variant="outline" size="sm" className="border-green-200 text-green-600 hover:bg-green-50">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reports.length > 0 ? (
                <div className="space-y-4">
                  {reports.slice(0, 5).map((report, index) => (
                    <div 
                      key={report.id} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {new Date(report.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Wellness: {report.overall_wellness}/10
                        </p>
                      </div>
                      <Badge className={getRiskLevelBadge(safeRiskLevel(report.risk_level))}>
                        {safeRiskLevel(report.risk_level).toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium text-gray-500 mb-4">No reports yet</p>
                  <Link href="/employee/reports/new">
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Create Your First Report
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Wellness Tips */}
        <div className="mt-8">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                Daily Wellness Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                  <Heart className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Take Breaks</h3>
                  <p className="text-sm text-gray-600">
                    Take a 5-minute break every hour to refresh your mind.
                  </p>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300">
                  <Brain className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Practice Mindfulness</h3>
                  <p className="text-sm text-gray-600">
                    Try 5 minutes of deep breathing or meditation.
                  </p>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300">
                  <MessageSquare className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Connect</h3>
                  <p className="text-sm text-gray-600">
                    Reach out to our AI assistant or a colleague for support.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metrics Tab Content */}
        {activeTab === 'Metrics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-8"
          >
            <ComprehensiveMetrics
              userId={user?.id}
              companyId={user?.company_id}
              showExport={true}
              onExport={async (data: any) => {
                try {
                  await ComprehensiveReportExportService.exportToPDF(data, user);
                } catch (error) {
                  console.error('Export error:', error);
                }
              }}
              userRole="employee"
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default withAuth(EmployeeDashboard, ['employee']);