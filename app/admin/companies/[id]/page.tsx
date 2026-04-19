'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2, Users, Heart, AlertTriangle, TrendingUp, TrendingDown,
  ArrowLeft, Globe, Mail, Phone, MapPin, Briefcase, Calendar,
  Activity, Shield, PieChart as PieChartIcon, BarChart2,
  Download, RefreshCw, Star, Edit, CheckCircle, Smartphone
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataList, type ColumnDef } from '@/components/list/DataList';
import { PageLoader } from '@/components/loader';
import { toast } from 'sonner';
import axios from 'axios';
import ServerAddress from '@/constent/ServerAddress';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Company {
  id: string;
  uid: string;
  companyName: string;
  industry: string;
  companySize: string;
  employees: number;
  plan: 'Starter' | 'Pro' | 'Enterprise';
  wellness: number;
  risk: 'low' | 'medium' | 'high';
  status: 'active' | 'inactive';
  isActive: boolean;
  joined: string;
  email?: string;
  phone?: string;
  address?: string;
  firstName?: string;
  lastName?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
  createdBy?: string;
}

interface Employee {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department?: string;
  position?: string;
  isActive?: boolean;
  createdAt?: string;
  id?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  created_at?: string;
}

// ─── Constants & Styles ──────────────────────────────────────────────────────

const COLORS = {
  wellness: '#10B981', // Emerald
  mood: '#3B82F6',    // Blue
  energy: '#8B5CF6',  // Purple
  stress: '#F59E0B',  // Amber
  riskHigh: '#EF4444',
  riskMedium: '#F59E0B',
  riskLow: '#10B981',
};

const riskCls = {
  low: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] border-emerald-100/50',
  medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 shadow-[0_0_10px_rgba(245,158,11,0.1)] border-yellow-100/50',
  high: 'text-red-600 bg-red-50 dark:bg-red-900/20 shadow-[0_0_10px_rgba(239,68,68,0.1)] border-red-100/50',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function CompanyInsightsPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;
  
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!companyId) return;
      
      try {
        const token = localStorage.getItem('access_token');
        // We use the admin endpoint to fetch company details
        const response = await axios.get(`${ServerAddress}/admin/employers/${companyId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data) {
          setCompany(response.data);
        }
      } catch (err: any) {
        console.error('Error fetching company:', err);
        toast.error('Failed to load company insights');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyId]);

  // Generate some high-fidelity mock data for insights if not provided by API
  const insightsData = useMemo(() => {
    if (!company) return null;

    // Generate 7 days of wellness trends
    const wellnessTrends = [];
    const baseWellness = company.wellness || 7.5;
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      wellnessTrends.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        wellness: Math.min(10, Math.max(0, baseWellness + (Math.random() - 0.5) * 1.5)),
        participation: Math.floor(Math.random() * 20) + 70,
      });
    }

    // Generate department distribution
    const depts = ['Engineering', 'Marketing', 'Sales', 'Product', 'HR', 'Support'];
    const deptData = depts.map(name => ({
      name,
      value: Math.floor(Math.random() * 50) + 10,
    }));

    // Risk distribution
    const riskData = [
      { name: 'Low Risk', value: 75, color: COLORS.riskLow },
      { name: 'Medium Risk', value: 18, color: COLORS.riskMedium },
      { name: 'High Risk', value: 7, color: COLORS.riskHigh },
    ];

    return { wellnessTrends, deptData, riskData };
  }, [company]);

  // Employee Table Columns
  const employeeColumns: ColumnDef<Employee>[] = [
    {
      key: "name",
      title: "Name",
      sortable: true,
      render: (_, row) => {
        const fname = row.firstName || row.first_name || "";
        const lname = row.lastName || row.last_name || "";
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 border border-indigo-200/50 dark:border-indigo-800/30">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">
                {fname[0]}{lname[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">
                {fname} {lname}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                {row.email}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "role",
      title: "Role",
      render: (val) => (
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
          {val || 'Employee'}
        </span>
      ),
    },
    {
      key: "department",
      title: "Department",
      render: (val) => (
        <span className="text-xs text-gray-600 dark:text-gray-400">{val || '—'}</span>
      ),
    },
    {
      key: "isActive",
      title: "Status",
      render: (_, row) => {
        const active = row.isActive !== undefined ? row.isActive : row.is_active;
        return (
          <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase ${active ? 'text-emerald-500' : 'text-gray-400'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
            {active ? 'Active' : 'Inactive'}
          </div>
        );
      }
    }
  ];

  if (loading) return <PageLoader message="Capturing company insights..." />;
  if (!company) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <Building2 className="h-12 w-12 text-gray-300" />
      <p className="text-gray-500 font-medium">Company not found or access denied.</p>
      <Button onClick={() => router.back()} variant="outline">Go Back</Button>
    </div>
  );

  const stats = [
    { label: 'Total Team', value: company.employees?.toLocaleString() || '0', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Avg Wellness', value: `${company.wellness || '7.8'}/10`, icon: Heart, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Risk Level', value: (company.risk || 'Low').toUpperCase(), icon: AlertTriangle, color: company.risk === 'high' ? 'text-red-500' : company.risk === 'medium' ? 'text-amber-500' : 'text-emerald-500', bg: company.risk === 'high' ? 'bg-red-50 dark:bg-red-900/20' : company.risk === 'medium' ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Active Plan', value: company.plan || 'Starter', icon: Shield, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-[1440px] mx-auto min-h-screen pb-20">
      
      {/* ─── Breadcrumbs & Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <button 
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-indigo-500 transition-colors uppercase tracking-widest"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Back to Companies
          </button>
          <div className="flex items-center gap-4 mt-2">
            <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              {company.companyName}
            </h1>
            <Badge className={`rounded-xl px-3 py-1 font-black shadow-sm border ${riskCls[company.risk as keyof typeof riskCls] || riskCls.low}`}>
              {company.risk?.toUpperCase() || 'LOW'} RISK
            </Badge>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl font-medium">
            Insight report for {company.companyName}. Visualizing organizational health, engagement trends, and workforce metrics.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 font-bold text-xs uppercase tracking-widest h-11"
            onClick={() => setRefreshKey(prev => prev + 1)}
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </Button>
          <Link href={`/admin/companies/add?id=${company.uid}`}>
            <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest h-11 px-6 shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
              <Edit className="h-5 w-5 mr-2" />
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── Profile & Contact Info Card ─── */}
      <Card className="bg-white dark:bg-gray-900 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-gray-800 rounded-3xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-gray-800">
          <div className="p-8 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
                <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Industry</h3>
            </div>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{company.industry || 'Not specified'}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Globe className="h-5 w-5 opacity-50" />
              <a href={company.website} target="_blank" rel="noreferrer" className="hover:text-indigo-500 hover:underline transition-colors truncate">
                {company.website?.replace(/^https?:\/\//, '') || 'no-website.com'}
              </a>
            </div>
          </div>
          
          <div className="p-8 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
                <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Team Size</h3>
            </div>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{company.companySize || 'Unknown'}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-5 w-5 opacity-50" />
              Joined {company.joined ? new Date(company.joined).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'recently'}
            </div>
          </div>

          <div className="p-8 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/30">
                <Smartphone className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Primary Contact</h3>
            </div>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{company.firstName} {company.lastName}</p>
            <div className="space-y-1.5 mt-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="h-5 w-5 opacity-50" />
                <span>{company.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Phone className="h-5 w-5 opacity-50" />
                <span>{company.phone || 'No phone'}</span>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/30">
                <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Headquarters</h3>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
              {company.address || 'Address information not provided.'}
            </p>
          </div>
        </div>
      </Card>

      {/* ─── KPI Scorecards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-transparent hover:border-indigo-500/20 dark:border-gray-800 dark:hover:border-indigo-900/30 shadow-[0_10px_40px_rgba(0,0,0,0.03)] transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                  <Icon className={`h-6 w-6 ${s.color}`} />
                </div>
                <div className="h-8 w-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                <div className="flex items-baseline gap-2">
                  <h4 className={`text-3xl font-black ${s.color} tracking-tight`}>{s.value}</h4>
                  <span className="text-[10px] text-gray-400 font-bold">+12%</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ─── Interactive Charts Section ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main Analytics Chart */}
        <Card className="xl:col-span-2 bg-white dark:bg-gray-900 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-gray-800 rounded-3xl overflow-hidden">
          <CardHeader className="p-8 pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-black text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-500" />
                  Health & Wellness Index
                </CardTitle>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Weekly cross-organizational benchmarking</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Wellness</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Engagement</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 pt-6">
            <div className="h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={insightsData?.wellnessTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWellness" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                    dy={10}
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                    cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                  />
                  <Area type="monotone" dataKey="wellness" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorWellness)" dot={{ r: 4, strokeWidth: 2, fill: '#6366f1' }} activeDot={{ r: 7, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="participation" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEngagement)" dot={false} strokeDasharray="6 6" name="Participation %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Risk Breakdown Chart */}
        <Card className="bg-white dark:bg-gray-900 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-gray-800 rounded-3xl overflow-hidden flex flex-col">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="text-xl font-black text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-500" />
              Risk Shield
            </CardTitle>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Predictive burnout analysis</p>
          </CardHeader>
          <CardContent className="p-8 flex-1 flex flex-col items-center justify-center relative">
            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={insightsData?.riskData}
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={10}
                    dataKey="value"
                    animationBegin={200}
                    animationDuration={1500}
                  >
                    {insightsData?.riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip cursor={{ fill: 'transparent' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-3xl font-black text-gray-800 dark:text-gray-100">88%</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Safe</p>
              </div>
            </div>
            
            <div className="w-full space-y-3 mt-8">
              {insightsData?.riskData.map((item) => (
                 <div key={item.name} className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/50 dark:bg-gray-800/50 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-gray-800 dark:text-gray-100">{item.value}%</span>
                    <TrendingDown className="h-3 w-3 text-emerald-500" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Department Distribution ─── */}
      <Card className="bg-white dark:bg-gray-900 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none dark:border dark:border-gray-800 rounded-3xl overflow-hidden">
        <CardHeader className="p-8 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-indigo-500" />
                Workforce Composition
              </CardTitle>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Headcount by department cluster</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insightsData?.deptData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                />
                <YAxis hide />
                <Tooltip 
                   cursor={{ fill: '#f1f5f9', radius: 10 }}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[10, 10, 10, 10]} barSize={40} animationDuration={2000} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ─── Employees List ─── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Users className="h-6 w-6 text-indigo-500" />
              Company Workforce
            </h2>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Directory of employees registered under {company.companyName}.</p>
          </div>
          <Button 
            className="rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold text-xs uppercase tracking-widest border border-gray-100 dark:border-gray-700 h-10 px-6 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <Download className="h-5 w-5 mr-2" />
            Export List
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-none overflow-hidden">
          <DataList<Employee>
            key={`${refreshKey}-${companyId}`}
            apiPath={`${ServerAddress}/admin/employees/${companyId}`}
            dataPath="employees"
            columns={employeeColumns}
            rowKey={(row) => row.uid || row.id || row.email}
            searchPlaceholder="Search workforce by name, role or email..."
            defaultPageSize={10}
            emptyMessage="No workforce data available for this organization yet."
          />
        </div>
      </div>

    </div>
  );
}
