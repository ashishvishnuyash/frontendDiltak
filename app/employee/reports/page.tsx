'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import EmployeeNavbar from '@/components/shared/EmployeeNavbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Loader2,
  Sparkles,
  Brain,
  Heart,
  Battery,
  Smile,
  ArrowRight,
  Download,
  BarChart3
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { MentalHealthReport } from '@/types';
import InteractiveAnalytics from '@/components/analytics/InteractiveAnalytics';

// Extend MentalHealthReport locally to include metrics fields for type safety
interface UIMentalHealthReport extends MentalHealthReport {
  metrics?: {
    emotional_tone: number;
    stress_anxiety: number;
    motivation_engagement: number;
    social_connectedness: number;
    self_esteem: number;
    assertiveness: number;
    work_life_balance_metric: number;
    cognitive_functioning: number;
    emotional_regulation: number;
    substance_use: number;
  };
  metrics_explanation?: {
    emotional_tone: string;
    stress_anxiety: string;
    motivation_engagement: string;
    social_connectedness: string;
    self_esteem: string;
    assertiveness: string;
    work_life_balance_metric: string;
    cognitive_functioning: string;
    emotional_regulation: string;
    substance_use: string;
  };
}

export default function EmployeeReportsPage() {
  const { user, loading: userLoading } = useUser();
  const [reports, setReports] = useState<UIMentalHealthReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'analytics' | 'list'>('analytics');
  const router = useRouter();

  // Wrap fetchReports in useCallback
  const fetchReports = useCallback(async () => {
    if (!user) return;
    try {
      setRefreshing(true);
      const reportsCollection = collection(db, 'mental_health_reports');
      const q = query(
        reportsCollection,
        where('employee_id', '==', user.id)
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UIMentalHealthReport[];
      // Sort by created_at in JavaScript to avoid Firestore index requirements
      const sortedData = data.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setReports(sortedData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/');
      return;
    }

    if (user?.role !== 'employee') {
      return;
    }

    if (user) {
      fetchReports();
    }
  }, [user, userLoading, router, fetchReports]);

  const safeRiskLevel = (value: any): 'low' | 'medium' | 'high' => {
    if (value === 'medium' || value === 'high') return value;
    return 'low';
  };

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
    const safeLevel = safeRiskLevel(riskLevel);
    return (
      <Badge className={`${colors[safeLevel]} flex items-center space-x-1`}>
        {icons[safeLevel]}
        <span>{safeLevel.toUpperCase()}</span>
      </Badge>
    );
  };

  const exportMyReports = async () => {
    try {
      // Build query parameters for the export page
      const params = new URLSearchParams({
        type: 'employee',
        range: '30d',
        risk: filterRisk
      });

      // Redirect to the export page
      router.push(`/export/report?${params.toString()}`);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === '' ||
      report.comments?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(report.created_at).toLocaleDateString().includes(searchTerm);

    const matchesRisk = filterRisk === 'all' || report.risk_level === filterRisk;

    return matchesSearch && matchesRisk;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'wellness-high':
        return b.overall_wellness - a.overall_wellness;
      case 'wellness-low':
        return a.overall_wellness - b.overall_wellness;
      case 'stress-high':
        return b.stress_level - a.stress_level;
      case 'stress-low':
        return a.stress_level - b.stress_level;
      default: // newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

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
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading your wellness reports...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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

      <div className="relative max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 z-10">
        {/* Welcome Section */}
        <motion.div 
          className="mb-4 sm:mb-6 lg:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-lime-600 to-emerald-600 mb-2 sm:mb-3 lg:mb-4 leading-tight">My Wellness Reports</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Track your mental health journey and view your progress over time.
          </p>
        </motion.div>



        {/* View Mode Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('analytics')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'analytics'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
              >
                <BarChart3 className="h-4 w-4 mr-2 inline" />
                Interactive Analytics
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'list'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
              >
                <Calendar className="h-4 w-4 mr-2 inline" />
                Report List
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between mb-4 sm:mb-6 lg:mb-8 space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Button
              onClick={fetchReports}
              variant="outline"
              size="sm"
              className="border-2 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 text-xs sm:text-sm px-2 sm:px-3 shadow-sm hover:shadow-md transition-all"
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              )}
              Refresh
            </Button>
            <Button
              onClick={exportMyReports}
              variant="outline"
              size="sm"
              className="border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-xs sm:text-sm px-2 sm:px-3 shadow-sm hover:shadow-md transition-all"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Export My Reports</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
          <Link href="/employee/reports/new">
            <Button className="bg-gradient-to-r from-green-600 via-lime-600 to-emerald-600 hover:from-green-700 hover:via-lime-700 hover:to-emerald-700 text-white text-xs sm:text-sm px-3 sm:px-4 w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              New Report
            </Button>
          </Link>
        </div>

        {/* Filters and Search - Only show in list view */}
        {viewMode === 'list' && (
          <div>
            <Card className="mb-4 sm:mb-6 lg:mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 shadow-xl">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="relative sm:col-span-2 lg:col-span-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 sm:pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500 text-gray-900 dark:text-gray-100 text-sm h-8 sm:h-10"
                    />
                  </div>

                  <Select value={filterRisk} onValueChange={setFilterRisk}>
                    <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500 text-gray-900 dark:text-gray-100">
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

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500 text-gray-900 dark:text-gray-100">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="wellness-high">Highest Wellness</SelectItem>
                      <SelectItem value="wellness-low">Lowest Wellness</SelectItem>
                      <SelectItem value="stress-high">Highest Stress</SelectItem>
                      <SelectItem value="stress-low">Lowest Stress</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <span>{filteredReports.length} of {reports.length} reports</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Interactive Analytics View */}
        {viewMode === 'analytics' && sortedReports.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <InteractiveAnalytics
              data={sortedReports[0]}
              showComparison={sortedReports.length > 1}
              previousData={sortedReports[1]}
            />
          </motion.div>
        )}

        {/* Reports List */}
        {viewMode === 'list' && sortedReports.length > 0 && (
          <motion.div
            className="space-y-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {sortedReports.map((report, index) => {
              const previousReport = sortedReports[index + 1] as UIMentalHealthReport | undefined;
              const r = report as UIMentalHealthReport;
              return (
                <motion.div key={report.id} variants={itemVariants}>
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
                        <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl shadow-lg"
                          >
                            <Calendar className="h-6 w-6 text-white" />
                          </motion.div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {new Date(report.created_at).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(report.created_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
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
                        </div>
                      </div>

                      {/* Main Metrics Grid */}
                      {r.metrics ? (
                        <div className="mb-6">
                          <h4 className="text-md font-semibold text-green-700 mb-2 flex items-center">
                            <Sparkles className="h-4 w-4 mr-2" />AI Metrics Breakdown
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {Object.entries(r.metrics).map(([key, value]) => {
                              const explanations = r.metrics_explanation || {};
                              const labels: Record<string, string> = {
                                emotional_tone: 'Emotional Tone',
                                stress_anxiety: 'Stress & Anxiety',
                                motivation_engagement: 'Motivation & Engagement',
                                social_connectedness: 'Social Connectedness',
                                self_esteem: 'Self-Esteem',
                                assertiveness: 'Assertiveness',
                                work_life_balance_metric: 'Work-Life Balance',
                                cognitive_functioning: 'Cognitive Functioning',
                                emotional_regulation: 'Emotional Regulation',
                                substance_use: 'Substance Use',
                              };
                              const colors = [
                                'bg-green-100 text-green-800',
                                'bg-yellow-100 text-yellow-800',
                                'bg-orange-100 text-orange-800',
                                'bg-red-100 text-red-800',
                              ];
                              return (
                                <div key={key} className={`rounded-lg border p-3 ${colors[Number(value)] || ''}`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium">{labels[key] || key}</span>
                                    <span className="font-bold text-lg">{String(value)}/3</span>
                                  </div>
                                  <div className="text-xs text-gray-700">
                                    {(explanations as Record<string, string>)[key] || ''}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        // Fallback: show old metrics if new metrics are not present
                        <>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <motion.div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300" whileHover={{ scale: 1.02, y: -2 }}>
                              <div className="flex items-center justify-center space-x-1 mb-2">
                                <Smile className="h-5 w-5 text-blue-600" />
                                <span className="text-xl font-semibold text-blue-700">{report.mood_rating}/10</span>
                                {previousReport && getTrendIcon(report.mood_rating, previousReport.mood_rating)}
                              </div>
                              <div className="text-sm text-blue-600 font-medium">Mood</div>
                            </motion.div>
                            <motion.div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 hover:shadow-md transition-all duration-300" whileHover={{ scale: 1.02, y: -2 }}>
                              <div className="flex items-center justify-center space-x-1 mb-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                <span className="text-xl font-semibold text-red-700">{report.stress_level}/10</span>
                                {previousReport && getTrendIcon(report.stress_level, previousReport.stress_level)}
                              </div>
                              <div className="text-sm text-red-600 font-medium">Stress</div>
                            </motion.div>
                            <motion.div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all duration-300" whileHover={{ scale: 1.02, y: -2 }}>
                              <div className="flex items-center justify-center space-x-1 mb-2">
                                <Battery className="h-5 w-5 text-green-600" />
                                <span className="text-xl font-semibold text-green-700">{report.energy_level}/10</span>
                                {previousReport && getTrendIcon(report.energy_level, previousReport.energy_level)}
                              </div>
                              <div className="text-sm text-green-600 font-medium">Energy</div>
                            </motion.div>
                            <motion.div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-300" whileHover={{ scale: 1.02, y: -2 }}>
                              <div className="flex items-center justify-center space-x-1 mb-2">
                                <Heart className="h-5 w-5 text-purple-600" />
                                <span className="text-xl font-semibold text-purple-700">{report.work_satisfaction}/10</span>
                                {previousReport && getTrendIcon(report.work_satisfaction, previousReport.work_satisfaction)}
                              </div>
                              <div className="text-sm text-purple-600 font-medium">Work Satisfaction</div>
                            </motion.div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                            <div className="text-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                              <div className="text-lg font-semibold text-gray-700">{report.work_life_balance}/10</div>
                              <div className="text-xs text-gray-600">Work-Life Balance</div>
                            </div>
                            <div className="text-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                              <div className="text-lg font-semibold text-gray-700">{report.anxiety_level}/10</div>
                              <div className="text-xs text-gray-600">Anxiety</div>
                            </div>
                            <div className="text-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                              <div className="text-lg font-semibold text-gray-700">{report.confidence_level}/10</div>
                              <div className="text-xs text-gray-600">Confidence</div>
                            </div>
                            <div className="text-center p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                              <div className="text-lg font-semibold text-gray-700">{report.sleep_quality}/10</div>
                              <div className="text-xs text-gray-600">Sleep Quality</div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Physical Health Metrics */}
                      {report.physical_health_metrics && (
                        <motion.div
                          className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 dark:bg-gray-700 dark:border-gray-600"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <h4 className="text-md font-semibold text-green-700 dark:text-green-400 mb-4 flex items-center">
                            <Heart className="h-5 w-5 mr-2" />
                            Physical Health Metrics
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Physical Activity */}
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-green-200 dark:border-gray-600">
                              <h5 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Physical Activity</h5>
                              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                <div>Exercise: {report.physical_health_metrics.physical_activity.exercise_frequency}x/week ({report.physical_health_metrics.physical_activity.exercise_type})</div>
                                <div>Sitting: {report.physical_health_metrics.physical_activity.daily_sitting_hours} hrs/day</div>
                                <div>Stretch breaks: {report.physical_health_metrics.physical_activity.stretch_breaks ? 'Yes' : 'No'}</div>
                              </div>
                            </div>

                            {/* Nutrition & Hydration */}
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-green-200 dark:border-gray-600">
                              <h5 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Nutrition & Hydration</h5>
                              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                <div>Meals: {report.physical_health_metrics.nutrition_hydration.meals_per_day}/day</div>
                                <div>Water: {report.physical_health_metrics.nutrition_hydration.water_intake_liters}L/day</div>
                                <div>Fruits/Vegetables: {report.physical_health_metrics.nutrition_hydration.fruit_veg_intake}</div>
                                <div>Skips meals: {report.physical_health_metrics.nutrition_hydration.skips_meals ? 'Yes' : 'No'}</div>
                              </div>
                            </div>

                            {/* Pain & Discomfort */}
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-green-200 dark:border-gray-600">
                              <h5 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Pain & Discomfort</h5>
                              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                <div>Back pain: {report.physical_health_metrics.pain_discomfort.back_pain}</div>
                                <div>Neck/Shoulder: {report.physical_health_metrics.pain_discomfort.neck_shoulder_pain}</div>
                                <div>Wrist/Hand: {report.physical_health_metrics.pain_discomfort.wrist_hand_pain}</div>
                                <div>Eye strain: {report.physical_health_metrics.pain_discomfort.eye_strain}</div>
                                <div>Headaches: {report.physical_health_metrics.pain_discomfort.headaches_frequency}</div>
                              </div>
                            </div>

                            {/* Lifestyle & Ergonomics */}
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-green-200 dark:border-gray-600">
                              <h5 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Lifestyle & Ergonomics</h5>
                              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                <div>Smoking: {report.physical_health_metrics.lifestyle_risks.smoking_status}</div>
                                <div>Alcohol: {report.physical_health_metrics.lifestyle_risks.alcohol_frequency}</div>
                                <div>Caffeine dependence: {report.physical_health_metrics.lifestyle_risks.caffeine_dependence ? 'Yes' : 'No'}</div>
                                <div>Chair comfort: {report.physical_health_metrics.ergonomics.chair_comfort}</div>
                                <div>Work mode: {report.physical_health_metrics.ergonomics.work_mode}</div>
                                <div>Work breaks: {report.physical_health_metrics.ergonomics.work_break_frequency}</div>
                              </div>
                            </div>

                            {/* Absenteeism */}
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-green-200 dark:border-gray-600 md:col-span-2">
                              <h5 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Absenteeism</h5>
                              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                <div>Sick days (last 3 months): {report.physical_health_metrics.absenteeism.sick_days_last_3_months}</div>
                                <div>Health affects productivity: {report.physical_health_metrics.absenteeism.health_affects_productivity ? 'Yes' : 'No'}</div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Comments */}
                      {report.comments && (
                        <motion.div
                          className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Your Notes
                          </h4>
                          <p className="text-gray-700 text-sm leading-relaxed">{report.comments}</p>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Empty State */}
        {sortedReports.length === 0 && !loading && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Brain className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            </motion.div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">No Reports Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Start your wellness journey by creating your first mental health report. Track your progress and gain insights into your well-being.
            </p>
            <Link href="/employee/reports/new">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Report
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}