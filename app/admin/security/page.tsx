'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, AlertTriangle, Eye, EyeOff, Clock, Globe, CheckCircle, XCircle, Key } from 'lucide-react';

const loginAttempts = [
  { id: 1, user: 'admin@diltak.ai',       ip: '192.168.1.1',   location: 'New York, US',    status: 'success', time: '2 min ago' },
  { id: 2, user: 'unknown@hacker.com',    ip: '45.33.32.156',  location: 'Unknown',          status: 'blocked', time: '15 min ago' },
  { id: 3, user: 'sarah@acme.com',        ip: '10.0.0.45',     location: 'London, UK',       status: 'success', time: '1 hr ago' },
  { id: 4, user: 'mike@techstart.com',    ip: '172.16.0.12',   location: 'Toronto, CA',      status: 'failed',  time: '2 hr ago' },
  { id: 5, user: 'emily@greenleaf.com',   ip: '192.168.2.34',  location: 'Sydney, AU',       status: 'success', time: '3 hr ago' },
];

const securityAlerts = [
  { id: 1, severity: 'high',   msg: 'Multiple failed login attempts detected',  detail: '5 attempts from 45.33.32.156',       time: '15 min ago' },
  { id: 2, severity: 'medium', msg: 'Unusual access pattern detected',          detail: 'User accessed 47 records in 2 min',  time: '2 hr ago' },
  { id: 3, severity: 'low',    msg: 'New device login',                         detail: 'sarah@acme.com — iPhone 15',         time: '1 day ago' },
];

const severityCls = {
  high:   'text-red-600 bg-red-50 dark:bg-red-900/20',
  medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
  low:    'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
};
const statusCls: Record<string, string> = {
  success: 'text-emerald-600',
  failed:  'text-yellow-600',
  blocked: 'text-red-600',
};
const statusIcon: Record<string, React.ElementType> = {
  success: CheckCircle,
  failed:  XCircle,
  blocked: Lock,
};

export default function AdminSecurity() {
  const [show2FA, setShow2FA] = useState(true);
  const [showIPBlock, setShowIPBlock] = useState(true);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Security</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Platform security overview and access control</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full">
          <ShieldCheck className="h-3.5 w-3.5" /> Secure
        </span>
      </div>

      {/* Security score + alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col items-center justify-center text-center">
          <div className="relative w-20 h-20 mb-3">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" strokeWidth="6" fill="none" className="stroke-gray-100 dark:stroke-gray-800" />
              <circle cx="40" cy="40" r="32" strokeWidth="6" fill="none" stroke="#10b981" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 32}`} strokeDashoffset={`${2 * Math.PI * 32 * (1 - 0.92)}`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">92</span>
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Security Score</p>
          <p className="text-xs text-emerald-600 mt-0.5">Excellent</p>
        </div>
        {[
          { label: 'Active Alerts',   value: securityAlerts.length,                                    color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20',     icon: AlertTriangle },
          { label: 'Blocked IPs',     value: 3,                                                         color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20',icon: Lock },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`h-6 w-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security settings */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">Security Settings</h2>
        <div className="space-y-3">
          {[
            { label: 'Two-Factor Authentication', sub: 'Require 2FA for all admin accounts', state: show2FA, toggle: () => setShow2FA(v => !v) },
            { label: 'IP Blocking',               sub: 'Auto-block IPs with 5+ failed attempts', state: showIPBlock, toggle: () => setShowIPBlock(v => !v) },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
              </div>
              <button
                onClick={s.toggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${s.state ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${s.state ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">Security Alerts</h2>
        <div className="space-y-3">
          {securityAlerts.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
            >
              <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${a.severity === 'high' ? 'text-red-500' : a.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{a.msg}</p>
                <p className="text-xs text-gray-400 mt-0.5">{a.detail}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${severityCls[a.severity as keyof typeof severityCls]}`}>{a.severity}</span>
                <span className="text-[11px] text-gray-400 whitespace-nowrap">{a.time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Login attempts */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Recent Login Attempts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <tr>
                {['User', 'IP Address', 'Location', 'Status', 'Time'].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loginAttempts.map((a, i) => {
                const Icon = statusIcon[a.status];
                return (
                  <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{a.user}</td>
                    <td className="px-4 py-3 font-mono text-gray-500 dark:text-gray-400">{a.ip}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 flex items-center gap-1"><Globe className="h-3 w-3" />{a.location}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 font-medium capitalize ${statusCls[a.status]}`}>
                        <Icon className="h-3 w-3" />{a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{a.time}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
