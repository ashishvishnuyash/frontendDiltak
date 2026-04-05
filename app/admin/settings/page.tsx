'use client';

import { useState } from 'react';
import { Settings, Bell, Globe, Database, Mail, Save, Shield, Palette } from 'lucide-react';

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
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage platform configuration and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">

        {/* Sidebar nav */}
        <div className="lg:w-48 flex-shrink-0">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-2">
            {sections.map(s => {
              const Icon = sectionIcon[s];
              return (
                <button
                  key={s}
                  onClick={() => setActive(s)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                    active === s
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">

          {active === 'General' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">General Settings</h2>
              {[
                { label: 'Platform Name', value: platformName, onChange: setPlatformName },
                { label: 'Support Email', value: supportEmail, onChange: setSupportEmail },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{f.label}</label>
                  <input
                    value={f.value}
                    onChange={e => f.onChange(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-indigo-400"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Timezone</label>
                <select
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-indigo-400"
                >
                  {['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'].map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">Maintenance Mode</p>
                  <p className="text-xs text-gray-400">Temporarily disable platform access</p>
                </div>
                <button
                  onClick={() => setMaintenanceMode(v => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${maintenanceMode ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          )}

          {active === 'Notifications' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Notification Preferences</h2>
              {[
                { label: 'Email Alerts',      sub: 'Receive alerts via email',                  state: emailAlerts,    toggle: () => setEmailAlerts(v => !v) },
                { label: 'High-Risk Alerts',  sub: 'Notify when employee risk level is high',   state: highRiskAlerts, toggle: () => setHighRiskAlerts(v => !v) },
                { label: 'Weekly Digest',     sub: 'Weekly summary of platform activity',       state: weeklyDigest,   toggle: () => setWeeklyDigest(v => !v) },
                { label: 'System Alerts',     sub: 'Maintenance and system status updates',     state: systemAlerts,   toggle: () => setSystemAlerts(v => !v) },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{s.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
                  </div>
                  <button
                    onClick={s.toggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${s.state ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${s.state ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {active === 'Appearance' && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Appearance</h2>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Default Theme</label>
                <div className="flex gap-2">
                  {(['light', 'dark', 'system'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setDefaultTheme(t)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize border transition-colors ${defaultTheme === t ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Accent Color</label>
                <div className="flex gap-2">
                  {[
                    { name: 'indigo', cls: 'bg-indigo-500' },
                    { name: 'emerald', cls: 'bg-emerald-500' },
                    { name: 'violet', cls: 'bg-violet-500' },
                    { name: 'blue', cls: 'bg-blue-500' },
                  ].map(c => (
                    <button
                      key={c.name}
                      onClick={() => setAccentColor(c.name)}
                      className={`w-8 h-8 rounded-full ${c.cls} transition-all ${accentColor === c.name ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'opacity-60 hover:opacity-100'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {(active === 'Email' || active === 'Security' || active === 'Data') && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">{active} Settings</h2>
              <p className="text-sm text-gray-400">Configuration options for {active.toLowerCase()} will appear here.</p>
            </div>
          )}

          {/* Save button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white'}`}
            >
              <Save className="h-4 w-4" />
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
