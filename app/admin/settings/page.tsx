'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Globe, Database, Mail, Save, Shield, Palette, CheckCircle } from 'lucide-react';

const sections = ['General', 'Notifications', 'Email', 'Security', 'Appearance', 'Data'] as const;
type Section = typeof sections[number];

export default function AdminSettings() {
  const [active, setActive] = useState<Section>('General');
  const [saved, setSaved] = useState(false);

  // General
  const [platformName, setPlatformName] = useState('Diltak.ai');
  const [supportEmail, setSupportEmail] = useState('support@diltak.ai');
  const [timezone, setTimezone] = useState('UTC');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Notifications
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [highRiskAlerts, setHighRiskAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [systemAlerts, setSystemAlerts] = useState(true);

  // Appearance
  const [defaultTheme, setDefaultTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [accentColor, setAccentColor] = useState('indigo');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sectionIcon: Record<Section, React.ElementType> = {
    General: Settings, Notifications: Bell, Email: Mail,
    Security: Shield, Appearance: Palette, Data: Database,
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Configure system-wide parameters, security protocols, and visual preferences.
          </p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${saved ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/20'}`}
          >
            {saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? 'Changes Saved' : 'Update Configuration'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Sidebar nav */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-2 shadow-sm sticky top-6">
            {sections.map(s => {
              const Icon = sectionIcon[s];
              const isActive = active === s;
              return (
                <button
                  key={s}
                  onClick={() => setActive(s)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all text-left group ${
                    isActive
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-4 w-4 flex-shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-3xl">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {active === 'General' && (
              <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-6 space-y-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-border pb-4 mb-2">
                  <Settings className="h-4 w-4 text-indigo-500" />
                  <h2 className="text-sm font-black text-foreground tracking-tight uppercase">System Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Platform Instance Name', value: platformName, onChange: setPlatformName, placeholder: 'e.g. Diltak.ai' },
                    { label: 'Primary Support Contact', value: supportEmail, onChange: setSupportEmail, placeholder: 'e.g. ops@diltak.ai' },
                  ].map(f => (
                    <div key={f.label} className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{f.label}</label>
                      <input
                        value={f.value}
                        onChange={e => f.onChange(e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full text-sm font-bold bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Global Timezone</label>
                  <select
                    value={timezone}
                    onChange={e => setTimezone(e.target.value)}
                    className="w-full text-sm font-bold bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
                  >
                    {['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'].map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>

                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center justify-between group">
                  <div className="pr-4">
                    <p className="text-sm font-black text-foreground tracking-tight uppercase group-hover:text-red-500 transition-colors">Emergency Maintenance Mode</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-1">Disconnects all active sessions and displays maintenance page.</p>
                  </div>
                  <button
                    onClick={() => setMaintenanceMode(v => !v)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 shadow-inner ${maintenanceMode ? 'bg-red-500' : 'bg-muted'}`}
                  >
                    <motion.span 
                      animate={{ x: maintenanceMode ? 24 : 4 }}
                      className="inline-block h-4 w-4 rounded-full bg-white shadow-md" 
                    />
                  </button>
                </div>
              </div>
            )}

            {active === 'Notifications' && (
              <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-6 space-y-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-border pb-4 mb-2">
                  <Bell className="h-4 w-4 text-indigo-500" />
                  <h2 className="text-sm font-black text-foreground tracking-tight uppercase">Platform Alerts</h2>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Direct Email Alerts',      sub: 'Deliver security and engagement logs via SMTP',      state: emailAlerts,    toggle: () => setEmailAlerts(v => !v) },
                    { label: 'Critical Risk Escalation', sub: 'Notify primary admins when risk breach occurs',     state: highRiskAlerts, toggle: () => setHighRiskAlerts(v => !v) },
                    { label: 'Operational Digest',       sub: 'Aggregate weekly performance and engagement metadata', state: weeklyDigest,   toggle: () => setWeeklyDigest(v => !v) },
                    { label: 'Core System Status',       sub: 'Hardware, API and latency status updates',           state: systemAlerts,   toggle: () => setSystemAlerts(v => !v) },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border group hover:border-indigo-500/30 transition-all">
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
                          className="inline-block h-4 w-4 rounded-full bg-white shadow-md" 
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {active === 'Appearance' && (
              <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-6 space-y-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-border pb-4 mb-2">
                  <Palette className="h-4 w-4 text-indigo-500" />
                  <h2 className="text-sm font-black text-foreground tracking-tight uppercase">UI Customization</h2>
                </div>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Interface Mode</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['light', 'dark', 'system'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setDefaultTheme(t)}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${defaultTheme === t ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-secondary text-muted-foreground border-border hover:border-indigo-500/30'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Platform Accent Token</label>
                  <div className="flex flex-wrap gap-4 p-4 bg-secondary/30 rounded-2xl border border-border">
                    {[
                      { name: 'indigo',  cls: 'bg-indigo-500' },
                      { name: 'emerald', cls: 'bg-emerald-500' },
                      { name: 'violet',  cls: 'bg-violet-500' },
                      { name: 'blue',    cls: 'bg-blue-500' },
                      { name: 'amber',   cls: 'bg-amber-500' },
                      { name: 'rose',    cls: 'bg-rose-500' },
                    ].map(c => (
                      <button
                        key={c.name}
                        onClick={() => setAccentColor(c.name)}
                        className={`w-10 h-10 rounded-xl ${c.cls} shadow-sm transition-all relative overflow-hidden group ${accentColor === c.name ? 'ring-4 ring-indigo-500/30 scale-110 shadow-lg' : 'opacity-50 hover:opacity-100 hover:scale-105'}`}
                      >
                        {accentColor === c.name && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {(active === 'Email' || active === 'Security' || active === 'Data') && (
              <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                   <Database className="h-6 w-6 text-muted-foreground/30" />
                </div>
                <h2 className="text-sm font-black text-foreground tracking-tight uppercase mb-2">{active} Configuration Pending</h2>
                <p className="text-xs text-muted-foreground font-medium max-w-xs mx-auto">Advanced administrative controls for {active.toLowerCase()} are currently under active development.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
