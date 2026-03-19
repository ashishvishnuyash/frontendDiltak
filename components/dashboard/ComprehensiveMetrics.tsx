'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Brain,
  Heart,
  Battery,
  AlertTriangle,
  Smile,
  Download,
  RefreshCw,
  Loader2,
  Calendar,
  Users,
  Target,
  Zap
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MentalHealthReport } from '@/types';

interface ComprehensiveMetricsProps {
  userId?: string;
  companyId?: string;
  showExport?: boolean;
  onExport?: (data: any) => void;
  userRole?: 'employee' | 'manager' | 'employer';
}

interface MetricsData {
  totalReports: number;
  averageWellness: number;
  averageMood: number;
  averageStress: number;
  averageEnergy: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  trends: {
    wellness: number;
    mood: number;
    stress: number;
    energy: number;
  };
  recentReports: MentalHealthReport[];
}

export default function ComprehensiveMetrics({
  userId,
  companyId,
  showExport = false,
  onExport,
  userRole = 'employee'
}: ComprehensiveMetricsProps) {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = async () => {
    try {
      setRefreshing(true);
      
      let reportsQuery;
      const reportsRef = collection(db, 'mental_health_reports');
      
      if (userRole === 'employee' && userId) {
        reportsQuery = query(reportsRef, where('employee_id', '==', userId));
      } else if (userRole === 'manager' && companyId) {
        reportsQuery = query(reportsRef, where('company_id', '==', companyId));
      } else if (userRole === 'employer' && companyId) {
        reportsQuery = query(reportsRef, where('company_id', '==', companyId));
      } else {
        return;
      }

      const querySnapshot = await getDocs(reportsQuery);
      const reports: MentalHealthReport[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MentalHealthReport));

      // Sort by created_at descending
      const sortedReports = reports.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Calculate metrics
      const totalReports = reports.length;
      
      if (totalReports === 0) {
        setMetrics({
          totalReports: 0,
          averageWellness: 0,
          averageMood: 0,
          averageStress: 0,
          averageEnergy: 0,
          riskDistribution: { low: 0, medium: 0, high: 0 },
          trends: { wellness: 0, mood: 0, stress: 0, energy: 0 },
          recentReports: []
        });
        return;
      }

      const averageWellness = reports.reduce((sum, r) => sum + (r.overall_wellness || 0), 0) / totalReports;
      const averageMood = reports.reduce((sum, r) => sum + (r.mood_rating || 0), 0) / totalReports;
      const averageStress = reports.reduce((sum, r) => sum + (r.stress_level || 0), 0) / totalReports;
      const averageEnergy = reports.reduce((sum, r) => sum + (r.energy_level || 0), 0) / totalReports;

      // Risk distribution
      const riskDistribution = reports.reduce((acc, r) => {
        const risk = r.risk_level || 'low';
        acc[risk as keyof typeof acc]++;
        return acc;
      }, { low: 0, medium: 0, high: 0 });

      // Calculate trends (comparing last 30% vs previous 30%)
      const recentCount = Math.max(1, Math.floor(totalReports * 0.3));
      const previousCount = Math.max(1, Math.floor(totalReports * 0.3));
      
      const recentReports = sortedReports.slice(0, recentCount);
      const previousReports = sortedReports.slice(recentCount, recentCount + previousCount);

      const calculateTrend = (recent: MentalHealthReport[], previous: MentalHealthReport[], field: keyof MentalHealthReport) => {
        if (previous.length === 0) return 0;
        const recentAvg = recent.reduce((sum, r) => sum + (r[field] as number || 0), 0) / recent.length;
        const previousAvg = previous.reduce((sum, r) => sum + (r[field] as number || 0), 0) / previous.length;
        return ((recentAvg - previousAvg) / previousAvg) * 100;
      };

      const trends = {
        wellness: calculateTrend(recentReports, previousReports, 'overall_wellness'),
        mood: calculateTrend(recentReports, previousReports, 'mood_rating'),
        stress: calculateTrend(recentReports, previousReports, 'stress_level'),
        energy: calculateTrend(recentReports, previousReports, 'energy_level')
      };

      setMetrics({
        totalReports,
        averageWellness: Math.round(averageWellness * 10) / 10,
        averageMood: Math.round(averageMood * 10) / 10,
        averageStress: Math.round(averageStress * 10) / 10,
        averageEnergy: Math.round(averageEnergy * 10) / 10,
        riskDistribution,
        trends,
        recentReports: sortedReports.slice(0, 5)
      });

    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [userId, companyId, userRole]);

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < -5) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <div className="h-4 w-4" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 5) return 'text-green-600';
    if (trend < -5) return 'text-red-600';
    return 'text-gray-600';
  };

  const handleExport = () => {
    if (onExport && metrics) {
      onExport(metrics);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Loading comprehensive metrics...</span>
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Data Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No wellness reports found to generate comprehensive metrics.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Comprehensive Wellness Metrics
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Detailed analytics and insights from {metrics.totalReports} wellness reports
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={fetchMetrics}
            variant="outline"
            size="sm"
            disabled={refreshing}
            className="border-green-200 text-green-600 hover:bg-green-50"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          {showExport && (
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Overall Wellness</p>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {metrics.averageWellness}/10
                  </p>
                  <div className="flex items-center mt-2">
                    {getTrendIcon(metrics.trends.wellness)}
                    <span className={`text-sm ml-1 ${getTrendColor(metrics.trends.wellness)}`}>
                      {metrics.trends.wellness > 0 ? '+' : ''}{metrics.trends.wellness.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Average Mood</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                    {metrics.averageMood}/10
                  </p>
                  <div className="flex items-center mt-2">
                    {getTrendIcon(metrics.trends.mood)}
                    <span className={`text-sm ml-1 ${getTrendColor(metrics.trends.mood)}`}>
                      {metrics.trends.mood > 0 ? '+' : ''}{metrics.trends.mood.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <Smile className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Average Stress</p>
                  <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                    {metrics.averageStress}/10
                  </p>
                  <div className="flex items-center mt-2">
                    {getTrendIcon(-metrics.trends.stress)}
                    <span className={`text-sm ml-1 ${getTrendColor(-metrics.trends.stress)}`}>
                      {metrics.trends.stress < 0 ? '+' : ''}{(-metrics.trends.stress).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Average Energy</p>
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                    {metrics.averageEnergy}/10
                  </p>
                  <div className="flex items-center mt-2">
                    {getTrendIcon(metrics.trends.energy)}
                    <span className={`text-sm ml-1 ${getTrendColor(metrics.trends.energy)}`}>
                      {metrics.trends.energy > 0 ? '+' : ''}{metrics.trends.energy.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <Battery className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
              <Target className="h-5 w-5 mr-2 text-orange-500" />
              Risk Level Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Low Risk</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {metrics.riskDistribution.low}
                  </span>
                  <Progress 
                    value={(metrics.riskDistribution.low / metrics.totalReports) * 100} 
                    className="w-20 h-2"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Medium Risk</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {metrics.riskDistribution.medium}
                  </span>
                  <Progress 
                    value={(metrics.riskDistribution.medium / metrics.totalReports) * 100} 
                    className="w-20 h-2"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">High Risk</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {metrics.riskDistribution.high}
                  </span>
                  <Progress 
                    value={(metrics.riskDistribution.high / metrics.totalReports) * 100} 
                    className="w-20 h-2"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports Summary */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              Recent Reports Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.recentReports.map((report, index) => (
                <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {new Date(report.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Wellness: {report.overall_wellness}/10
                    </p>
                  </div>
                  <Badge 
                    className={
                      report.risk_level === 'high' 
                        ? 'bg-red-100 text-red-700 border-red-200'
                        : report.risk_level === 'medium'
                        ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                        : 'bg-green-100 text-green-700 border-green-200'
                    }
                  >
                    {report.risk_level?.toUpperCase() || 'LOW'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
