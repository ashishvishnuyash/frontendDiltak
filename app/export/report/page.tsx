'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Download,
  Printer,
  FileText,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  Calendar,
  BarChart3,
  Loader2,
  ArrowLeft,
  RefreshCw,
  Cloud,
  Zap,
  Heart,
  Brain,
  Sparkles
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { Navbar } from '@/components/shared/navbar';
import { PDFExportService, extractChartElements, generateAnalyticsFromReports } from '@/lib/pdf-export-service';
import type { MentalHealthReport, User } from '@/types';
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
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  teal: '#14B8A6'
};

interface ExportReportData {
  reports: MentalHealthReport[];
  employees: User[];
  analytics: {
    totalReports: number;
    avgWellness: number;
    riskDistribution: { [key: string]: number };
    departmentStats: { [key: string]: any };
    trendData: any[];
  };
  config: {
    title: string;
    subtitle?: string;
    dateRange: { start: string; end: string };
    filters?: any;
  };
}

export default function ExportReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [data, setData] = useState<ExportReportData | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const loadReportData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get parameters from URL
      const reportType = searchParams.get('type') || 'company';
      const dateRange = searchParams.get('range') || '30d';
      const department = searchParams.get('department') || 'all';
      const riskLevel = searchParams.get('risk') || 'all';
      
      if (!user?.company_id) {
        toast.error('Company information not found');
        return;
      }

      // Calculate date range
      const daysBack = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      // Fetch employees
      const employeesQuery = query(
        collection(db, 'users'),
        where('company_id', '==', user.company_id)
      );
      const employeesSnapshot = await getDocs(employeesQuery);
      const employees = employeesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];

      // Fetch reports
      const reportsQuery = query(
        collection(db, 'mental_health_reports'),
        where('company_id', '==', user.company_id)
      );
      const reportsSnapshot = await getDocs(reportsQuery);
      const allReports = reportsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MentalHealthReport[];

      // Filter reports by date range
      const filteredReports = allReports.filter(report => {
        const reportDate = new Date(report.created_at);
        return reportDate >= startDate && reportDate <= endDate;
      });

      // Apply additional filters
      let finalReports = filteredReports;
      
      // For employee reports, only show current user's reports
      if (reportType === 'employee') {
        finalReports = finalReports.filter(report => report.employee_id === user.id);
      } else if (reportType === 'team' && user.role === 'manager') {
        // For managers, show their team's reports
        const teamEmployeeIds = employees
          .filter(emp => emp.manager_id === user.id || emp.id === user.id)
          .map(emp => emp.id);
        finalReports = finalReports.filter(report => teamEmployeeIds.includes(report.employee_id));
      } else if (department !== 'all') {
        const deptEmployees = employees.filter(emp => emp.department === department);
        const deptEmployeeIds = deptEmployees.map(emp => emp.id);
        finalReports = finalReports.filter(report => deptEmployeeIds.includes(report.employee_id));
      }
      
      if (riskLevel !== 'all') {
        finalReports = finalReports.filter(report => report.risk_level === riskLevel);
      }

      // Sort reports by date (newest first)
      finalReports.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });

      // Generate analytics
      const analytics = generateAnalyticsFromReports(finalReports, employees);

      // Create report config with proper title
      let reportTitle = 'Wellness Report';
      if (reportType === 'employee') {
        reportTitle = 'My Wellness Report';
      } else if (reportType === 'team') {
        reportTitle = 'Team Wellness Report';
      } else {
        reportTitle = 'Company Wellness Report';
      }

      const config = {
        title: reportTitle,
        subtitle: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        },
        filters: {
          department: department !== 'all' ? [department] : undefined,
          riskLevel: riskLevel !== 'all' ? [riskLevel] : undefined
        }
      };

      setData({
        reports: finalReports,
        employees,
        analytics,
        config
      });

    } catch (error) {
      console.error('Error loading report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, [user, searchParams]);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user) {
      loadReportData();
    }
  }, [user, userLoading, router, loadReportData]);

  const handleExportPDF = async () => {
    if (!data || !reportRef.current) return;

    try {
      setExporting(true);
      
      // Extract chart elements
      const chartElements = extractChartElements('report-content');
      
      // Generate PDF
      const pdfService = new PDFExportService();
      const pdfBlob = await pdfService.generateReportPDF(
        {
          title: data.config.title,
          subtitle: data.config.subtitle,
          includeCharts: true,
          includeRawData: true,
          includeAnalytics: true,
          dateRange: data.config.dateRange,
          filters: data.config.filters
        },
        {
          reports: data.reports,
          employees: data.employees,
          analytics: data.analytics
        },
        chartElements
      );

      // Download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `wellness-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('PDF report downloaded successfully!');

    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF report');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load report data</p>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user || undefined} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{data.config.title}</h1>
              <p className="text-gray-600 mt-2">{data.config.subtitle}</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleExportPDF}
                disabled={exporting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export PDF
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                className="border-gray-300"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button
                onClick={loadReportData}
                variant="outline"
                className="border-gray-300"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div id="report-content" ref={reportRef} className="space-y-8">
          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{data.analytics.totalReports}</div>
                  <div className="text-sm text-gray-600">Total Reports</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{data.analytics.avgWellness.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Avg Wellness Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{data.analytics.riskDistribution.high || 0}</div>
                  <div className="text-sm text-gray-600">High Risk</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{data.analytics.riskDistribution.medium || 0}</div>
                  <div className="text-sm text-gray-600">Medium Risk</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Wellness Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Wellness Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div data-chart-title="Wellness Trends Over Time" className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.analytics.trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="mood" stroke={COLORS.primary} strokeWidth={2} />
                      <Line type="monotone" dataKey="stress" stroke={COLORS.danger} strokeWidth={2} />
                      <Line type="monotone" dataKey="energy" stroke={COLORS.success} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Risk Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Level Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div data-chart-title="Risk Level Distribution" className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(data.analytics.riskDistribution).map(([level, count]) => ({
                          name: level.charAt(0).toUpperCase() + level.slice(1),
                          value: count
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(data.analytics.riskDistribution).map(([level], index) => (
                          <Cell key={`cell-${index}`} fill={
                            level === 'high' ? COLORS.danger :
                            level === 'medium' ? COLORS.warning :
                            COLORS.success
                          } />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Department Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Department Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div data-chart-title="Department Wellness Comparison" className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(data.analytics.departmentStats).map(([dept, stats]) => ({
                      department: dept,
                      wellness: stats.avgWellness || 0,
                      employees: stats.count
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="wellness" fill={COLORS.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Report Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div data-chart-title="Daily Report Volume" className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.analytics.trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="reports" stroke={COLORS.purple} fill={COLORS.purple} fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Risk Level Breakdown</h3>
                  <div className="space-y-3">
                    {Object.entries(data.analytics.riskDistribution).map(([level, count]) => (
                      <div key={level} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            level === 'high' ? 'destructive' :
                            level === 'medium' ? 'default' :
                            'secondary'
                          }>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{count} reports</div>
                          <div className="text-sm text-gray-600">
                            {((count as number / data.analytics.totalReports) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Department Performance</h3>
                  <div className="space-y-3">
                    {Object.entries(data.analytics.departmentStats).map(([dept, stats]) => (
                      <div key={dept} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{dept}</span>
                          <span className="text-sm text-gray-600">{stats.count} employees</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={stats.avgWellness ? (stats.avgWellness / 10) * 100 : 0} 
                            className="flex-1"
                          />
                          <span className="text-sm font-medium w-12 text-right">
                            {stats.avgWellness?.toFixed(1) || 'N/A'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comprehensive Metrics Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Comprehensive Wellness Metrics Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Basic Metrics */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Basic Wellness Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Mood</span>
                      <span className="font-medium">
                        {data.reports.length > 0 
                          ? (data.reports.reduce((sum, r) => sum + (r.mood_rating || 0), 0) / data.reports.length).toFixed(1)
                          : 'N/A'
                        }/10
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Stress</span>
                      <span className="font-medium">
                        {data.reports.length > 0 
                          ? (data.reports.reduce((sum, r) => sum + (r.stress_level || 0), 0) / data.reports.length).toFixed(1)
                          : 'N/A'
                        }/10
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Energy</span>
                      <span className="font-medium">
                        {data.reports.length > 0 
                          ? (data.reports.reduce((sum, r) => sum + (r.energy_level || 0), 0) / data.reports.length).toFixed(1)
                          : 'N/A'
                        }/10
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Work Satisfaction</span>
                      <span className="font-medium">
                        {data.reports.length > 0 
                          ? (data.reports.reduce((sum, r) => sum + (r.work_satisfaction || 0), 0) / data.reports.length).toFixed(1)
                          : 'N/A'
                        }/10
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Metrics */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Additional Wellness Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Anxiety</span>
                      <span className="font-medium">
                        {data.reports.length > 0 
                          ? (data.reports.reduce((sum, r) => sum + (r.anxiety_level || r.anxious_level || 0), 0) / data.reports.length).toFixed(1)
                          : 'N/A'
                        }/10
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Work-Life Balance</span>
                      <span className="font-medium">
                        {data.reports.length > 0 
                          ? (data.reports.reduce((sum, r) => sum + (r.work_life_balance || 0), 0) / data.reports.length).toFixed(1)
                          : 'N/A'
                        }/10
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Confidence</span>
                      <span className="font-medium">
                        {data.reports.length > 0 
                          ? (data.reports.reduce((sum, r) => sum + (r.confidence_level || r.confident_level || 0), 0) / data.reports.length).toFixed(1)
                          : 'N/A'
                        }/10
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Sleep Quality</span>
                      <span className="font-medium">
                        {data.reports.length > 0 
                          ? (data.reports.reduce((sum, r) => sum + (r.sleep_quality || 0), 0) / data.reports.length).toFixed(1)
                          : 'N/A'
                        }/10
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI-Generated Metrics */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">AI-Generated Metrics</h3>
                  <div className="space-y-3">
                    {data.reports.filter(r => r.metrics).length > 0 ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Avg Emotional Tone</span>
                          <span className="font-medium">
                            {(data.reports
                              .filter(r => r.metrics?.emotional_tone !== undefined)
                              .reduce((sum, r) => sum + (r.metrics?.emotional_tone || 0), 0) / 
                              data.reports.filter(r => r.metrics?.emotional_tone !== undefined).length || 0).toFixed(1)}/3
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Avg Stress & Anxiety</span>
                          <span className="font-medium">
                            {(data.reports
                              .filter(r => r.metrics?.stress_anxiety !== undefined)
                              .reduce((sum, r) => sum + (r.metrics?.stress_anxiety || 0), 0) / 
                              data.reports.filter(r => r.metrics?.stress_anxiety !== undefined).length || 0).toFixed(1)}/3
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Avg Motivation</span>
                          <span className="font-medium">
                            {(data.reports
                              .filter(r => r.metrics?.motivation_engagement !== undefined)
                              .reduce((sum, r) => sum + (r.metrics?.motivation_engagement || 0), 0) / 
                              data.reports.filter(r => r.metrics?.motivation_engagement !== undefined).length || 0).toFixed(1)}/3
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Avg Social Connection</span>
                          <span className="font-medium">
                            {(data.reports
                              .filter(r => r.metrics?.social_connectedness !== undefined)
                              .reduce((sum, r) => sum + (r.metrics?.social_connectedness || 0), 0) / 
                              data.reports.filter(r => r.metrics?.social_connectedness !== undefined).length || 0).toFixed(1)}/3
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Avg Self-Esteem</span>
                          <span className="font-medium">
                            {(data.reports
                              .filter(r => r.metrics?.self_esteem !== undefined)
                              .reduce((sum, r) => sum + (r.metrics?.self_esteem || 0), 0) / 
                              data.reports.filter(r => r.metrics?.self_esteem !== undefined).length || 0).toFixed(1)}/3
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Avg Assertiveness</span>
                          <span className="font-medium">
                            {(data.reports
                              .filter(r => r.metrics?.assertiveness !== undefined)
                              .reduce((sum, r) => sum + (r.metrics?.assertiveness || 0), 0) / 
                              data.reports.filter(r => r.metrics?.assertiveness !== undefined).length || 0).toFixed(1)}/3
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Avg Work-Life Balance AI</span>
                          <span className="font-medium">
                            {(data.reports
                              .filter(r => r.metrics?.work_life_balance_metric !== undefined)
                              .reduce((sum, r) => sum + (r.metrics?.work_life_balance_metric || 0), 0) / 
                              data.reports.filter(r => r.metrics?.work_life_balance_metric !== undefined).length || 0).toFixed(1)}/3
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Avg Cognitive Function</span>
                          <span className="font-medium">
                            {(data.reports
                              .filter(r => r.metrics?.cognitive_functioning !== undefined)
                              .reduce((sum, r) => sum + (r.metrics?.cognitive_functioning || 0), 0) / 
                              data.reports.filter(r => r.metrics?.cognitive_functioning !== undefined).length || 0).toFixed(1)}/3
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Avg Emotional Regulation</span>
                          <span className="font-medium">
                            {(data.reports
                              .filter(r => r.metrics?.emotional_regulation !== undefined)
                              .reduce((sum, r) => sum + (r.metrics?.emotional_regulation || 0), 0) / 
                              data.reports.filter(r => r.metrics?.emotional_regulation !== undefined).length || 0).toFixed(1)}/3
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Avg Substance Use</span>
                          <span className="font-medium">
                            {(data.reports
                              .filter(r => r.metrics?.substance_use !== undefined)
                              .reduce((sum, r) => sum + (r.metrics?.substance_use || 0), 0) / 
                              data.reports.filter(r => r.metrics?.substance_use !== undefined).length || 0).toFixed(1)}/3
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">
                        No AI-generated metrics available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Report Cards */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Individual Reports</h2>
            {data.reports.map((report) => {
              const employee = data.employees.find(emp => emp.id === report.employee_id);
              const employeeName = employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee';
              const reportDate = new Date(report.created_at);
              const formattedDate = reportDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
              const formattedTime = reportDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              });
              
              // Get wellness level badge
              const getWellnessLevel = (score: number): { label: string; color: string } => {
                if (score >= 7) return { label: 'HIGH', color: 'bg-green-100 text-green-700 border-green-200' };
                if (score >= 4) return { label: 'MEDIUM', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
                return { label: 'LOW', color: 'bg-red-100 text-red-700 border-red-200' };
              };
              
              const wellnessLevel = getWellnessLevel(report.overall_wellness);
              
              // AI Metrics labels
              const aiMetricsLabels: Record<string, string> = {
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
              
              return (
                <Card key={report.id} className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="p-6">
                    {/* Header with Date, Employee Name, and Wellness Score */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {employeeName}
                        </h3>
                        <div className="text-sm text-gray-600">
                          {formattedDate}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formattedTime}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-4 sm:mt-0">
                        <Badge className={`${wellnessLevel.color} border px-3 py-1 text-xs font-semibold`}>
                          {wellnessLevel.label}
                        </Badge>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {report.overall_wellness}/10
                          </div>
                          <div className="text-xs text-gray-600">Overall Wellness</div>
                        </div>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Metrics</h4>
                      <div className="flex flex-wrap gap-2">
                        <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <Cloud className="h-5 w-5 text-blue-600 mb-1" />
                          <span className="text-lg font-bold text-blue-700">{report.mood_rating}/10</span>
                          <span className="text-xs text-blue-600">Mood</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-red-50 rounded-lg border border-red-200">
                          <AlertTriangle className="h-5 w-5 text-red-600 mb-1" />
                          <span className="text-lg font-bold text-red-700">{report.stress_level}/10</span>
                          <span className="text-xs text-red-600">Stress</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg border border-green-200">
                          <Zap className="h-5 w-5 text-green-600 mb-1" />
                          <span className="text-lg font-bold text-green-700">{report.energy_level}/10</span>
                          <span className="text-xs text-green-600">Energy</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <Heart className="h-5 w-5 text-purple-600 mb-1" />
                          <span className="text-lg font-bold text-purple-700">{report.work_satisfaction}/10</span>
                          <span className="text-xs text-purple-600">Work Satisfaction</span>
                        </div>
                        {report.metrics?.cognitive_functioning !== undefined && (
                          <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <Brain className="h-5 w-5 text-gray-600 mb-1" />
                            <span className="text-lg font-bold text-gray-700">
                              {Math.round((report.metrics.cognitive_functioning / 3) * 10)}/10
                            </span>
                            <span className="text-xs text-gray-600">Focus</span>
                          </div>
                        )}
                        {(report.confidence_level !== undefined || report.confident_level !== undefined) && (
                          <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-lg font-bold text-gray-700">
                              {report.confidence_level ?? report.confident_level ?? 0}/10
                            </span>
                            <span className="text-xs text-gray-600">Confidence</span>
                          </div>
                        )}
                        {report.sleep_quality !== undefined && (
                          <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="text-lg font-bold text-gray-700">{report.sleep_quality}/10</span>
                            <span className="text-xs text-gray-600">Sleep Quality</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Your Notes */}
                    {report.comments && (
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Your Notes
                        </h4>
                        <p className="text-sm text-gray-700">{report.comments}</p>
                      </div>
                    )}

                    {/* AI Metrics Breakdown */}
                    {report.metrics && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <Brain className="h-4 w-4 mr-2" />
                          AI Metrics Breakdown
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {Object.entries(report.metrics).map(([key, value]) => {
                            const explanations = report.metrics_explanation || {};
                            const colorClass = value === 0 ? 'bg-red-50 border-red-200' :
                                              value === 1 ? 'bg-yellow-50 border-yellow-200' :
                                              value === 2 ? 'bg-green-50 border-green-200' :
                                              'bg-green-100 border-green-300';
                            return (
                              <div key={key} className={`rounded-lg border p-3 ${colorClass}`}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-sm">{aiMetricsLabels[key] || key}</span>
                                  <span className="font-bold text-lg">{String(value)}/3</span>
                                </div>
                                {explanations[key as keyof typeof explanations] && (
                                  <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                                    {explanations[key as keyof typeof explanations]}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Physical Health Metrics */}
                    {report.physical_health_metrics && (
                      <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="text-sm font-semibold text-green-700 mb-4 flex items-center">
                          <Heart className="h-5 w-5 mr-2" />
                          Physical Health Metrics
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Physical Activity */}
                          <div className="bg-white p-3 rounded-lg border border-green-200">
                            <h5 className="font-semibold text-sm text-gray-700 mb-2">Physical Activity</h5>
                            <div className="space-y-1 text-xs text-gray-600">
                              <div>Exercise: {report.physical_health_metrics.physical_activity.exercise_frequency}x/week ({report.physical_health_metrics.physical_activity.exercise_type})</div>
                              <div>Sitting: {report.physical_health_metrics.physical_activity.daily_sitting_hours} hrs/day</div>
                              <div>Stretch breaks: {report.physical_health_metrics.physical_activity.stretch_breaks ? 'Yes' : 'No'}</div>
                            </div>
                          </div>

                          {/* Nutrition & Hydration */}
                          <div className="bg-white p-3 rounded-lg border border-green-200">
                            <h5 className="font-semibold text-sm text-gray-700 mb-2">Nutrition & Hydration</h5>
                            <div className="space-y-1 text-xs text-gray-600">
                              <div>Meals: {report.physical_health_metrics.nutrition_hydration.meals_per_day}/day</div>
                              <div>Water: {report.physical_health_metrics.nutrition_hydration.water_intake_liters}L/day</div>
                              <div>Fruits/Vegetables: {report.physical_health_metrics.nutrition_hydration.fruit_veg_intake}</div>
                              <div>Skips meals: {report.physical_health_metrics.nutrition_hydration.skips_meals ? 'Yes' : 'No'}</div>
                            </div>
                          </div>

                          {/* Pain & Discomfort */}
                          <div className="bg-white p-3 rounded-lg border border-green-200">
                            <h5 className="font-semibold text-sm text-gray-700 mb-2">Pain & Discomfort</h5>
                            <div className="space-y-1 text-xs text-gray-600">
                              <div>Back pain: {report.physical_health_metrics.pain_discomfort.back_pain}</div>
                              <div>Neck/Shoulder: {report.physical_health_metrics.pain_discomfort.neck_shoulder_pain}</div>
                              <div>Wrist/Hand: {report.physical_health_metrics.pain_discomfort.wrist_hand_pain}</div>
                              <div>Eye strain: {report.physical_health_metrics.pain_discomfort.eye_strain}</div>
                              <div>Headaches: {report.physical_health_metrics.pain_discomfort.headaches_frequency}</div>
                            </div>
                          </div>

                          {/* Lifestyle & Ergonomics */}
                          <div className="bg-white p-3 rounded-lg border border-green-200">
                            <h5 className="font-semibold text-sm text-gray-700 mb-2">Lifestyle & Ergonomics</h5>
                            <div className="space-y-1 text-xs text-gray-600">
                              <div>Smoking: {report.physical_health_metrics.lifestyle_risks.smoking_status}</div>
                              <div>Alcohol: {report.physical_health_metrics.lifestyle_risks.alcohol_frequency}</div>
                              <div>Caffeine dependence: {report.physical_health_metrics.lifestyle_risks.caffeine_dependence ? 'Yes' : 'No'}</div>
                              <div>Chair comfort: {report.physical_health_metrics.ergonomics.chair_comfort}</div>
                              <div>Work mode: {report.physical_health_metrics.ergonomics.work_mode}</div>
                              <div>Work breaks: {report.physical_health_metrics.ergonomics.work_break_frequency}</div>
                            </div>
                          </div>

                          {/* Absenteeism */}
                          <div className="bg-white p-3 rounded-lg border border-green-200 md:col-span-2">
                            <h5 className="font-semibold text-sm text-gray-700 mb-2">Absenteeism</h5>
                            <div className="space-y-1 text-xs text-gray-600">
                              <div>Sick days (last 3 months): {report.physical_health_metrics.absenteeism.sick_days_last_3_months}</div>
                              <div>Health affects productivity: {report.physical_health_metrics.absenteeism.health_affects_productivity ? 'Yes' : 'No'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            background: white !important;
          }
          
          .container {
            max-width: none !important;
            padding: 0 !important;
          }
          
          .card {
            break-inside: avoid;
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
          }
        }
      `}</style>
    </div>
  );
}
