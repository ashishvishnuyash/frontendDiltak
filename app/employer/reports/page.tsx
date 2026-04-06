'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence, easeInOut, easeOut } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Shield,
  Briefcase
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MentalHealthReport, User } from '@/types';
import { toast } from 'sonner';
import { PageLoader } from '@/components/loader';
import { withAuth } from '@/components/auth/with-auth';

interface ReportWithEmployee extends MentalHealthReport {
  employee?: User;
}

function EmployerReportsPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [reports, setReports] = useState<ReportWithEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalReports: 0,
    highRisk: 0,
    mediumRisk: 0,
    avgWellness: 0,
    departments: [] as string[]
  });

  const fetchReports = useCallback(async () => {
    if (!user?.company_id) return;

    try {
      setLoading(true);

      const employeesQuery = query(
        collection(db, 'users'),
        where('company_id', '==', user.company_id)
      );
      const employeesSnapshot = await getDocs(employeesQuery);
      const employees = employeesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));

      const employeeMap = new Map(employees.map(emp => [emp.id, emp]));

      const reportsQuery = query(
        collection(db, 'mental_health_reports'),
        where('company_id', '==', user.company_id),
        orderBy('created_at', 'desc')
      );
      const reportsSnapshot = await getDocs(reportsQuery);

      const reportsData = reportsSnapshot.docs.map(doc => {
        const reportData = { id: doc.id, ...doc.data() } as MentalHealthReport;
        const employee = employeeMap.get(reportData.employee_id);
        return { ...reportData, employee };
      });

      setReports(reportsData);

      const totalReports = reportsData.length;
      const highRisk = reportsData.filter(r => r.risk_level === 'high').length;
      const mediumRisk = reportsData.filter(r => r.risk_level === 'medium').length;
      const avgWellness = totalReports > 0
        ? reportsData.reduce((sum, r) => sum + (r.overall_wellness || 0), 0) / totalReports
        : 0;

      const departments = Array.from(
        new Set(employees.map(emp => emp.department).filter(Boolean))
      ) as string[];

      setStats({
        totalReports,
        highRisk,
        mediumRisk,
        avgWellness: Math.round(avgWellness * 10) / 10,
        departments
      });

    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.company_id]);

  useEffect(() => {
    if (!userLoading && user?.company_id) {
      fetchReports();
    }
  }, [user, userLoading, fetchReports]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
    toast.success('Reports updated.');
  };

  const filteredAndSortedReports = reports
    .filter(report => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const employeeName = report.employee
          ? `${report.employee.firstName || report.employee.first_name} ${report.employee.lastName || report.employee.last_name}`.toLowerCase()
          : '';
        if (!employeeName.includes(searchLower) && !report.employee?.email?.toLowerCase().includes(searchLower)) return false;
      }
      if (filterRisk !== 'all' && report.risk_level !== filterRisk) return false;
      if (filterDepartment !== 'all' && report.employee?.department !== filterDepartment) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'wellness-high': return (b.overall_wellness || 0) - (a.overall_wellness || 0);
        case 'wellness-low': return (a.overall_wellness || 0) - (b.overall_wellness || 0);
        default: return 0;
      }
    });

  if (userLoading || loading) {
    return <PageLoader message="Gathering wellness reports..." iconColor="text-emerald-500" />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-6 py-6 max-w-[1400px] mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FileText className="h-6 w-6 text-emerald-500" />
            Wellness Reports
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Detailed behavior analysis and check-in history across your organisation.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={refreshing}
            className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-600 dark:text-gray-300 h-10"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            onClick={() => {/* Build export logic if needed */}}
            className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-4 font-semibold shadow-md shadow-emerald-500/10"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Reports', value: stats.totalReports, color: 'text-gray-800 dark:text-gray-100', icon: FileText, bg: 'bg-gray-50 dark:bg-gray-900' },
          { label: 'Avg Wellness', value: `${stats.avgWellness}/10`, color: 'text-emerald-600', icon: Heart, bg: 'bg-emerald-50/50 dark:bg-emerald-900/10' },
          { label: 'High Risk', value: stats.highRisk, color: 'text-red-500', icon: AlertTriangle, bg: 'bg-red-50/50 dark:bg-red-900/10' },
          { label: 'Medium Risk', value: stats.mediumRisk, color: 'text-amber-500', icon: Clock, bg: 'bg-amber-50/50 dark:bg-amber-900/10' },
        ].map(s => (
          <div key={s.label} className={`flex flex-col items-center justify-center p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm ${s.bg}`}>
            <s.icon className={`h-5 w-5 ${s.color} opacity-80 mb-1.5`} />
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters Card */}
      <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
              <Input
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-11 rounded-xl border border-gray-200 dark:border-gray-800 focus:border-emerald-500 transition-all"
              />
            </div>

            <Select value={filterRisk} onValueChange={setFilterRisk}>
              <SelectTrigger className="h-11 rounded-xl border-gray-200 dark:border-gray-800 focus:border-emerald-500 transition-all">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-gray-400" />
                  <SelectValue placeholder="All Risk Levels" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-200 dark:border-gray-800 shadow-xl font-medium">
                <SelectItem value="all">Any Risk Level</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="h-11 rounded-xl border-gray-200 dark:border-gray-800 focus:border-emerald-500 transition-all">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  <SelectValue placeholder="All Departments" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-200 dark:border-gray-800 shadow-xl font-medium">
                <SelectItem value="all">All Departments</SelectItem>
                {stats.departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-11 rounded-xl border-gray-200 dark:border-gray-800 focus:border-emerald-500 transition-all">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  <SelectValue placeholder="Sort" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-200 dark:border-gray-800 shadow-xl font-medium">
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="wellness-high">Highest Wellness</SelectItem>
                <SelectItem value="wellness-low">Lowest Wellness</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {filteredAndSortedReports.length > 0 ? (
          filteredAndSortedReports.map((report) => (
            <motion.div key={report.id} variants={itemVariants}>
              <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all group overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    {/* Left: Employee Info */}
                    <div className="lg:w-72 p-6 border-b lg:border-b-0 lg:border-r border-gray-50 dark:border-gray-800/50 bg-gray-50/30 dark:bg-gray-800/20">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-lg border border-emerald-200/50 dark:border-emerald-800/30">
                          {(report.employee?.firstName?.[0] || report.employee?.first_name?.[0] || 'E')}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                            {report.employee ? `${report.employee.firstName || report.employee.first_name} ${report.employee.lastName || report.employee.last_name}` : 'Unknown Employee'}
                          </h3>
                          <p className="text-[11px] text-gray-500 truncate">{report.employee?.department || 'Unassigned'}</p>
                        </div>
                      </div>
                      <div className="space-y-1.5 pt-3 border-t border-gray-100 dark:border-gray-800/50">
                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {new Date(report.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                          <Clock className="h-3 w-3" />
                          {new Date(report.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    {/* Right: Metrics & Analysis */}
                    <div className="flex-1 p-6 space-y-6">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Wellness</p>
                            <div className="text-2xl font-black text-emerald-600 leading-none">
                              {report.overall_wellness}<span className="text-xs font-medium text-gray-300 ml-0.5">/10</span>
                            </div>
                          </div>
                          <div className="h-8 w-px bg-gray-100 dark:bg-gray-800" />
                          <div className="flex items-center gap-4">
                            <MetricTiny icon={Heart} value={report.mood_rating} label="Mood" color="text-blue-500" />
                            <MetricTiny icon={Zap} value={report.stress_level} label="Stress" color="text-red-500" />
                            <MetricTiny icon={Star} value={report.energy_level} label="Energy" color="text-amber-500" />
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-0 shadow-sm ${
                            report.risk_level === 'high' ? 'bg-red-500 text-white' : 
                            report.risk_level === 'medium' ? 'bg-amber-500 text-white' : 
                            'bg-emerald-500 text-white'
                          }`}>
                            {report.risk_level} Risk
                          </Badge>
                          <Link href={`/employer/reports/${report.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[11px] font-bold text-gray-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                              VIEW DETAILS <ArrowRight className="h-3 w-3 ml-1.5" />
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {/* AI Summary Banner */}
                      {report.ai_analysis && (
                        <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/30">
                          <div className="flex items-center gap-2 mb-2 text-blue-700 dark:text-blue-400">
                            <Sparkles className="h-4 w-4" />
                            <h4 className="text-[11px] font-black uppercase tracking-widest">AI Behavioral Insight</h4>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
                            {report.ai_analysis}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center gap-4 opacity-40">
            <div className="w-16 h-16 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <FileText className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold">No matching reports</p>
              <p className="text-sm">Try adjusting your filters or search term.</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function MetricTiny({ icon: Icon, value, label, color }: { icon: any, value: number, label: string, color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-lg ${color} bg-opacity-10 flex items-center justify-center`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div>
        <div className="text-[11px] font-black text-gray-700 dark:text-gray-200 leading-none">{value}</div>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{label}</p>
      </div>
    </div>
  );
}

export default withAuth(EmployerReportsPage, ['employer', 'admin', 'hr']);
