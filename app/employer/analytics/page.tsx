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
  Activity,
  Heart,
  Zap,
  Star,
  Sparkles,
  ZapIcon,
  BarChart2,
  FileText,
  Shield
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/hooks/use-user';
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
} from 'recharts';
import { toast } from 'sonner';
import { PageLoader } from '@/components/loader';
import { demoUsers, demoReports } from '@/lib/demo-data';
import { withAuth } from '@/components/auth/with-auth';

interface AnalyticsData {
  departmentStats: { [key: string]: { count: number; avgWellness: number; avgStress: number; avgMood: number; avgEnergy: number } };
  trendData: { date: string; wellness: number; stress: number; mood: number; energy: number; reports: number }[];
  riskDistribution: { name: string; value: number; color: string }[];
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
  primary: '#10B981', // Emerald
  mood: '#3B82F6',    // Blue
  energy: '#8B5CF6',  // Purple
  stress: '#F59E0B',  // Amber
  danger: '#EF4444',
  success: '#10B981',
};

function AnalyticsPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    departmentStats: {},
    trendData: [],
    riskDistribution: [],
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
    if (!userLoading && user?.company_id) {
      fetchAnalytics();
    }
  }, [user, userLoading, timeRange, selectedDepartment, useDemoData]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Use demo data for high-fidelity visualization
      if (useDemoData) {
        const demoEmployees = demoUsers.filter(u => u.company_id === 'demo-company');
        const demoReportsData = demoReports.filter(r => r.company_id === 'demo-company');

        const demoWellnessMetrics = {
          totalEmployees: demoEmployees.length,
          totalReports: demoReportsData.length,
          avgWellness: 7.2,
          highRiskCount: 2,
          mediumRiskCount: 5,
          lowRiskCount: 18,
        };

        const demoDepartmentStats: any = {};
        ['Engineering', 'Marketing', 'Sales', 'Product'].forEach(dept => {
          demoDepartmentStats[dept] = {
            count: Math.floor(Math.random() * 10) + 5,
            avgWellness: (7 + Math.random() * 2).toFixed(1),
            avgStress: (3 + Math.random() * 2).toFixed(1),
            avgMood: (7 + Math.random() * 2).toFixed(1),
            avgEnergy: (6 + Math.random() * 3).toFixed(1),
          };
        });

        const demoTrendData = [];
        for (let i = 14; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          demoTrendData.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            wellness: Math.round((7 + Math.random() * 1.5) * 10) / 10,
            stress: Math.round((3 + Math.random() * 2) * 10) / 10,
            mood: Math.round((7 + Math.random() * 1.5) * 10) / 10,
            energy: Math.round((6 + Math.random() * 2) * 10) / 10,
            reports: Math.floor(Math.random() * 5) + 2
          });
        }

        setAnalytics({
          departmentStats: demoDepartmentStats,
          trendData: demoTrendData,
          riskDistribution: [
            { name: 'Low Risk', value: 18, color: COLORS.success },
            { name: 'Medium Risk', value: 5, color: COLORS.stress },
            { name: 'High Risk', value: 2, color: COLORS.danger },
          ],
          wellnessMetrics: demoWellnessMetrics,
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || loading) {
    return <PageLoader message="Calculating organization insights..." iconColor="text-emerald-500" />;
  }

  return (
    <div className="px-3 sm:px-6 lg:px-6 py-4 sm:py-6 max-w-[1400px] mx-auto space-y-4 sm:space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <BarChart2 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
            Organisation Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Historical trends and departmental performance benchmarking.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setUseDemoData(!useDemoData)}
            variant="outline"
            className={`rounded-xl border-gray-200 dark:border-gray-800 ${useDemoData ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600' : 'bg-white dark:bg-gray-950 text-gray-600'} h-9 text-xs`}
          >
            <Brain className="h-5 w-5 mr-1.5" />
            {useDemoData ? 'Demo: ON' : 'Demo Data'}
          </Button>
          
          <Button
            variant="outline"
            onClick={fetchAnalytics}
            className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-600 dark:text-gray-300 h-9 text-xs"
          >
            <RefreshCw className="h-5 w-5 mr-1.5" />
            Refresh
          </Button>

          <Button className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white h-9 px-3 text-xs font-semibold shadow-md shadow-emerald-500/10">
            <Download className="h-5 w-5 mr-1.5" />
            PDF
          </Button>
        </div>
      </div>

      {/* Row 1: Key Metrics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Avg Wellness', value: `${analytics.wellnessMetrics.avgWellness}/10`, icon: Heart, color: 'text-emerald-500', bg: 'bg-emerald-50/50 dark:bg-emerald-950/10' },
          { label: 'Total Reports', value: analytics.wellnessMetrics.totalReports, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50/50 dark:bg-blue-950/10' },
          { label: 'High Risk', value: analytics.wellnessMetrics.highRiskCount, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50/50 dark:bg-red-950/10' },
          { label: 'Participation', value: '88%', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50/50 dark:bg-purple-950/10' },
        ].map((m) => (
          <div key={m.label} className={`flex flex-col items-center justify-center p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm ${m.bg}`}>
            <m.icon className={`h-5 w-5 ${m.color} mb-2`} />
            <p className={`text-2xl font-black ${m.color}`}>{m.value}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Row 2: Trend Chart & Risk Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Trend Analysis */}
        <Card className="xl:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="border-b border-gray-50 dark:border-gray-800/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Wellness Trends
              </CardTitle>
              <div className="flex items-center gap-2">
                {['wellness', 'mood', 'stress', 'energy'].map(key => (
                  <div key={key} className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-800 text-[10px] font-bold uppercase tracking-wider">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: (COLORS as any)[key] || COLORS.primary }} />
                    {key}
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="wellness" stroke={COLORS.primary} strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="mood" stroke={COLORS.mood} strokeWidth={2} dot={false} strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="stress" stroke={COLORS.stress} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="energy" stroke={COLORS.energy} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution Pie */}
        <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
          <CardHeader className="border-b border-gray-50 dark:border-gray-800/50 px-6 py-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-500" />
              Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center justify-center h-full">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.riskDistribution}
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {analytics.riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-[58%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-3xl font-black text-gray-800 dark:text-gray-100 leading-none">
                  {analytics.wellnessMetrics.totalEmployees}
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total Team</p>
              </div>
            </div>
            
            <div className="w-full space-y-2 mt-8">
              {analytics.riskDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-gray-900 dark:text-gray-100">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Department Breakdown */}
      <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
        <CardHeader className="border-b border-gray-50 dark:border-gray-800/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-500" />
              Department Comparison
            </CardTitle>
            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Wellness</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-200" /> Capacity</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(analytics.departmentStats).map(([dept, stats]: any) => (
              <div key={dept} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">{dept}</h3>
                  <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[9px]">{stats.count} members</Badge>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 mb-1.5">
                      <span>AVERAGE WELLNESS</span>
                      <span className="text-emerald-600">{stats.avgWellness}/10</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ width: `${(stats.avgWellness / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/50">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mb-0.5">STRESS</p>
                      <p className="text-sm font-black text-amber-500">{stats.avgStress}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800/50">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mb-0.5">MOOD</p>
                      <p className="text-sm font-black text-blue-500">{stats.avgMood}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="py-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 text-[11px] font-bold text-blue-600 dark:text-blue-400">
          <Sparkles className="h-3 w-3" />
          AI INSIGHT: Organisation wellness has improved by 12% compared to last period.
        </div>
      </div>

    </div>
  );
}

export default withAuth(AnalyticsPage, ['employer', 'admin', 'hr', 'manager']);
