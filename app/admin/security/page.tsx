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
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Security
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Monitor platform access, mitigate threats, and manage security protocols.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-sm">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Platform Secure</span>
          </div>
        </div>
      </div>

      {/* Security score + alerts summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-6 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldCheck className="h-20 w-20 -mr-6 -mt-6" />
          </div>
          
          <div className="relative w-28 h-28 mb-4">
            <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" strokeWidth="6" fill="none" className="stroke-secondary" />
              <motion.circle 
                cx="40" cy="40" r="34" strokeWidth="6" fill="none" stroke="url(#secGradient)" strokeLinecap="round"
                initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - 0.92) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeDasharray={`${2 * Math.PI * 34}`} 
              />
              <defs>
                <linearGradient id="secGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-foreground tracking-tighter">92</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Score</span>
            </div>
          </div>
          <p className="text-sm font-black text-foreground tracking-tight">Security Rating</p>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Excellent Protection</p>
        </div>

        <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-6 shadow-sm flex items-center gap-6 group">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-inner group-hover:scale-110 transition-transform">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <p className="text-3xl font-black text-foreground tracking-tighter">{securityAlerts.length}</p>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Active Alerts</p>
            <p className="text-[10px] text-red-500 font-bold mt-1">Requires Attention</p>
          </div>
        </div>

        <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-6 shadow-sm flex items-center gap-6 group">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-inner group-hover:scale-110 transition-transform">
            <Lock className="h-8 w-8 text-amber-500" />
          </div>
          <div>
            <p className="text-3xl font-black text-foreground tracking-tighter">3</p>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Blocked IPs</p>
            <p className="text-[10px] text-muted-foreground/60 font-bold mt-1">Auto-mitigation active</p>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Security controls */}
          <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Key className="h-5 w-5 text-indigo-500" />
              <h2 className="text-sm font-black text-foreground tracking-tight uppercase">Admin Security Protocols</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Two-Factor Authentication', sub: 'Mandatory for all administrator sessions', state: show2FA, toggle: () => setShow2FA(v => !v) },
                { label: 'IP Auth-Blocking',          sub: 'Auto-block IPs with 5+ failed attempts', state: showIPBlock, toggle: () => setShowIPBlock(v => !v) },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl border border-border group hover:border-indigo-500/30 transition-all">
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-bold text-foreground truncate">{s.label}</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-tight">{s.sub}</p>
                  </div>
                  <button
                    onClick={s.toggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 shadow-inner ${s.state ? 'bg-indigo-500' : 'bg-muted'}`}
                  >
                    <motion.span 
                      animate={{ x: s.state ? 24 : 4 }}
                      className="inline-block h-5 w-5 rounded-full bg-white shadow-md" 
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Security alerts list */}
          <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h2 className="text-sm font-black text-foreground tracking-tight uppercase">Critical Alerts</h2>
              </div>
              <button className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors">Clear All</button>
            </div>
            <div className="space-y-4">
              {securityAlerts.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-4 p-4 bg-secondary/30 rounded-xl border border-border group hover:bg-secondary/50 transition-all border-l-4 border-l-red-500"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground group-hover:text-red-500 transition-colors uppercase tracking-tight leading-none">{a.msg}</p>
                    <p className="text-[11px] text-muted-foreground font-medium mt-2 leading-relaxed">{a.detail}</p>
                    <p className="text-[10px] text-muted-foreground/50 font-black mt-2 uppercase tracking-widest flex items-center gap-2">
                       <Clock className="h-3 w-3" /> {a.time}
                    </p>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${severityCls[a.severity as keyof typeof severityCls]}`}>
                    {a.severity}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Login attempts table */}
        <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border shadow-sm flex flex-col">
          <div className="px-6 py-5 border-b border-border">
            <h2 className="text-sm font-black text-foreground tracking-tight uppercase">Recent Access Logs</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Last 24 hours of platform login attempts</p>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-secondary/30">
                  {['Admin', 'Network Info', 'Status', ''].map(h => (
                    <th key={h} className="text-left text-[11px] font-black text-muted-foreground uppercase tracking-widest px-6 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loginAttempts.map((a, i) => {
                  const Icon = statusIcon[a.status];
                  return (
                    <tr key={a.id} className="hover:bg-secondary/20 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-foreground group-hover:text-indigo-500 transition-all">{a.user}</p>
                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{a.time}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-mono text-muted-foreground font-bold">{a.ip}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 font-medium mt-1">
                          <Globe className="h-3 w-3" /> {a.location}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ${statusCls[a.status]}`}>
                          <Icon className="h-3.5 w-3.5" />
                          {a.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all">
                          <Eye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border mt-auto">
            <button className="w-full py-2.5 bg-secondary hover:bg-secondary/80 rounded-xl text-[11px] font-black text-muted-foreground text-center transition-all uppercase tracking-widest">
              View All Access Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
