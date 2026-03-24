'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Phone, MessageCircle, Calendar, Clock, User, Shield } from 'lucide-react';

interface EscalationSupportProps {
  userRole: 'employee' | 'manager' | 'employer';
  userId?: string;
}

interface EscalationCase {
  id: string;
  employeeName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'mental-health' | 'harassment' | 'safety' | 'other';
  description: string;
  timestamp: Date;
  status: 'open' | 'in-progress' | 'resolved';
  assignedTo?: string;
}

const severityDot: Record<string, string> = {
  critical: 'bg-red-500', high: 'bg-orange-400', medium: 'bg-yellow-400', low: 'bg-green-400',
};
const severityText: Record<string, string> = {
  critical: 'text-red-600', high: 'text-orange-500', medium: 'text-yellow-600', low: 'text-green-600',
};
const statusConfig: Record<string, { label: string; cls: string }> = {
  'open':        { label: 'Open',        cls: 'bg-red-50 text-red-600 dark:bg-red-900/20' },
  'in-progress': { label: 'In Progress', cls: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20' },
  'resolved':    { label: 'Resolved',    cls: 'bg-green-50 text-green-600 dark:bg-green-900/20' },
};

export default function EscalationSupport({ userRole, userId }: EscalationSupportProps) {
  const [cases, setCases] = useState<EscalationCase[]>([
    { id: '1', employeeName: 'Anonymous Employee', severity: 'high',     type: 'mental-health', description: 'Employee reported severe anxiety and panic attacks affecting work performance.', timestamp: new Date('2024-01-15T10:30:00'), status: 'open' },
    { id: '2', employeeName: 'John Smith',          severity: 'critical', type: 'harassment',    description: 'Workplace harassment complaint requiring immediate attention.',                  timestamp: new Date('2024-01-15T14:20:00'), status: 'in-progress', assignedTo: 'HR Manager' },
  ]);

  const [form, setForm] = useState({ employeeName: '', severity: 'medium', type: 'other', description: '', anonymous: false });

  const handleSubmit = () => {
    if (!form.description.trim()) return;
    setCases(prev => [{
      id: Date.now().toString(),
      employeeName: form.anonymous ? 'Anonymous' : (form.employeeName || 'Anonymous'),
      severity: form.severity as any,
      type: form.type as any,
      description: form.description,
      timestamp: new Date(),
      status: 'open',
    }, ...prev]);
    setForm({ employeeName: '', severity: 'medium', type: 'other', description: '', anonymous: false });
  };

  return (
    <div className="space-y-5">
      {/* Emergency contacts */}
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <h2 className="text-sm font-semibold text-red-700 dark:text-red-300">Emergency Support Contacts</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Phone,         label: 'Crisis Hotline',  value: '988 (24/7)',     color: 'text-red-500',   bg: 'bg-red-100 dark:bg-red-900/30' },
            { icon: MessageCircle, label: 'HR Emergency',    value: 'ext. 911',       color: 'text-blue-500',  bg: 'bg-blue-100 dark:bg-blue-900/30' },
            { icon: User,          label: 'EAP Counselor',   value: '1-800-EAP-HELP', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
          ].map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800">
                <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-4 w-4 ${c.color}`} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{c.label}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">{c.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Report form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Report New Case</h2>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Employee Name</label>
              <input
                value={form.anonymous ? 'Anonymous' : form.employeeName}
                onChange={e => setForm({ ...form, employeeName: e.target.value, anonymous: false })}
                disabled={form.anonymous}
                placeholder="Name or leave anonymous"
                className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-indigo-400 disabled:opacity-50"
              />
              <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                <input type="checkbox" checked={form.anonymous} onChange={e => setForm({ ...form, anonymous: e.target.checked })} className="rounded" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Submit anonymously</span>
              </label>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Severity</label>
              <select
                value={form.severity}
                onChange={e => setForm({ ...form, severity: e.target.value })}
                className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-indigo-400"
              >
                <option value="low">Low — General concern</option>
                <option value="medium">Medium — Needs attention</option>
                <option value="high">High — Urgent matter</option>
                <option value="critical">Critical — Immediate action</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Case Type</label>
            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-indigo-400"
            >
              <option value="mental-health">Mental Health</option>
              <option value="harassment">Harassment</option>
              <option value="safety">Safety Concern</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the situation in detail. All reports are handled confidentially."
              rows={4}
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-indigo-400 resize-none"
            />
          </div>
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Shield className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300">All reports are handled with strict confidentiality. Your safety and privacy are our top priorities.</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!form.description.trim()}
            className="w-full py-2.5 text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white rounded-xl transition-colors"
          >
            Submit Case
          </button>
        </div>
      </div>

      {/* Active cases */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Active Cases</h2>
          <span className="ml-auto text-xs text-gray-400">{cases.filter(c => c.status !== 'resolved').length} open</span>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {cases.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${severityDot[c.severity]}`} />
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{c.employeeName}</p>
                  <span className={`text-[10px] font-semibold capitalize ${severityText[c.severity]}`}>{c.severity}</span>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${statusConfig[c.status].cls}`}>
                  {statusConfig[c.status].label}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-2">{c.type.replace('-', ' ')}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3">{c.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.timestamp.toLocaleDateString()}</span>
                  {c.assignedTo && <span className="flex items-center gap-1"><User className="h-3 w-3" />{c.assignedTo}</span>}
                </div>
                <div className="flex gap-2">
                  <button className="text-xs px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Follow-up
                  </button>
                  <button className="text-xs px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors">
                    Update
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
