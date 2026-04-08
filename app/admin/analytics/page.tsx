'use client';

import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, Users, FileText, Activity, BarChart3 } from 'lucide-react';

const weeklyData = [
  { day: 'Mon', users: 210, reports: 45, sessions: 88,  wellness: 7.2 },
  { day: 'Tue', users: 245, reports: 62, sessions: 95,  wellness: 7.5 },
  { day: 'Wed', users: 198, reports: 38, sessions: 72,  wellness: 6.9 },
  { day: 'Thu', users: 312, reports: 78, sessions: 110, wellness: 7.8 },
  { day: 'Fri', users: 287, reports: 91, sessions: 103, wellness: 7.4 },
  { day: 'Sat', users: 156, reports: 29, sessions: 54,  wellness: 8.1 },
  { day: 'Sun', users: 134, reports: 22, sessions: 41,  wellness: 8.3 },
];

const monthlyData = [
  { month: 'Aug', companies: 38, users: 2100, reports: 890 },
  { month: 'Sep', companies: 41, users: 2340, reports: 1020 },
  { month: 'Oct', companies: 43, users: 2680, reports: 1180 },
  { month: 'Nov', companies: 45, users: 2890, reports: 1340 },
  { month: 'Dec', companies: 46, users: 3010, reports: 1490 },
  { month: 'Jan', companies: 48, users: 3241, reports: 1620 },
];

const riskDist = [
  { name: 'Low Risk',    value: 68, color: '#10b981' },
  { name: 'Medium Risk', value: 22, color: '#f59e0b' },
  { name: 'High Risk',   value: 10, color: '#ef4444' },
];

const topMetrics = [
  { label: 'Avg Wellness Score',  value: '7.4',  delta: '+0.3',  up: true,  icon: TrendingUp },
  { label: 'Daily Active Users',  value: '1,847',delta: '+12%',  up: true,  icon: Users },
  { label: 'Reports This Month',  value: '1,620',delta: '+8.7%', up: true,  icon: FileText },
  { label: 'Avg Session Length',  value: '14m',  delta: '+2m',   up: true,  icon: Activity },
];

const ranges = ['7 days', '30 days', '90 days'] as const;

export default function AdminAnalytics() {
  const [range, setRange] = useState<typeof ranges[number]>('7 days');

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Platform-wide wellness and engagement metrics</p>
        </div>
        <div className="flex gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
          {ranges.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${range === r ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {topMetrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-indigo-500" />
                </div>
                <span className={`text-[11px] font-semibold ${m.up ? 'text-emerald-600' : 'text-red-500'}`}>{m.delta}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{m.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{m.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Activity area chart */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">Daily Platform Activity</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="aUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="aReports" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="users"   stroke="#6366f1" fill="url(#aUsers)"   strokeWidth={2} dot={false} name="Active Users" />
              <Area type="monotone" dataKey="reports" stroke="#10b981" fill="url(#aReports)" strokeWidth={2} dot={false} name="Reports" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Risk distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">Risk Distribution</h2>
          <div className="space-y-4 mt-6">
            {riskDist.map(r => (
              <div key={r.name}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">{r.name}</span>
                  <span className="text-gray-500 dark:text-gray-400">{r.value}%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${r.value}%`, backgroundColor: r.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-2 text-center">
            {riskDist.map(r => (
              <div key={r.name}>
                <p className="text-lg font-bold" style={{ color: r.color }}>{r.value}%</p>
                <p className="text-[10px] text-gray-400 leading-tight">{r.name.split(' ')[0]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Monthly growth */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">Monthly Growth</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="users"   fill="#6366f1" radius={[3, 3, 0, 0]} name="Users" />
              <Bar dataKey="reports" fill="#10b981" radius={[3, 3, 0, 0]} name="Reports" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Wellness trend */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">Avg Wellness Score Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis domain={[5, 10]} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Line type="monotone" dataKey="wellness" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, fill: '#f59e0b' }} activeDot={{ r: 5 }} name="Wellness" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
