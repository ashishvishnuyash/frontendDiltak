'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Users, CheckCircle, Clock, Plus, Trash2, X, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

// ── types ──────────────────────────────────────────────────────────────────────

interface Challenge {
  id: string;
  title: string;
  type: string;
  target: number;
  points: number;
  scope: string;
  status: 'active' | 'inactive';
  participants: number;
  completed: number;
  endDate?: string;
}

// ── data ───────────────────────────────────────────────────────────────────────

const initialChallenges: Challenge[] = [
  { id: '1', title: '7-Day Check-In Streak 🔥', type: 'streak',         target: 7,  points: 50,  scope: 'Platform-wide',  status: 'active',   participants: 284, completed: 142, endDate: 'May 31' },
  { id: '2', title: 'Physical Health Week 🏃',  type: 'physical_health', target: 5,  points: 75,  scope: 'Acme Wellness',  status: 'active',   participants: 52,  completed: 18  },
  { id: '3', title: 'First Conversation 💬',    type: 'conversation',    target: 1,  points: 20,  scope: 'Platform-wide',  status: 'active',   participants: 412, completed: 398 },
  { id: '4', title: 'April Mindfulness Month',  type: 'daily_checkin',   target: 20, points: 100, scope: 'Platform-wide',  status: 'inactive', participants: 0,   completed: 0,  endDate: 'Apr 30' },
  { id: '5', title: 'New Year Streak Challenge', type: 'streak',         target: 14, points: 150, scope: 'Platform-wide',  status: 'inactive', participants: 0,   completed: 0,  endDate: 'Jan 31' },
];

const CHALLENGE_TYPES = ['daily_checkin', 'conversation', 'physical_health', 'streak', 'custom'];
const SCOPES = ['Platform-wide (all companies)', 'Acme Wellness only', 'MindSpace Inc only'];

// ── Create Modal ───────────────────────────────────────────────────────────────

function CreateChallengeModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (c: Partial<Challenge>) => void;
}) {
  const [form, setForm] = useState({ title: '', type: 'daily_checkin', target: 7, points: 50, scope: SCOPES[0] });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    onCreate(form);
    setSaving(false);
    onClose();
    toast.success('Challenge created!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md bg-card dark:bg-gray-900 rounded-2xl shadow-2xl border border-border overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
              <Trophy className="h-5 w-5 text-indigo-500" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Create Challenge</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Title</label>
            <input
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. 7-Day Streak Challenge"
              className="w-full h-10 px-3 text-sm bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Type</label>
            <select
              value={form.type}
              onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              className="w-full h-10 px-3 text-sm bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
            >
              {CHALLENGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Target (count)</label>
              <input
                type="number" min={1} value={form.target}
                onChange={e => setForm(p => ({ ...p, target: +e.target.value }))}
                className="w-full h-10 px-3 text-sm bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Points Reward</label>
              <input
                type="number" min={1} value={form.points}
                onChange={e => setForm(p => ({ ...p, points: +e.target.value }))}
                className="w-full h-10 px-3 text-sm bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Scope</label>
            <select
              value={form.scope}
              onChange={e => setForm(p => ({ ...p, scope: e.target.value }))}
              className="w-full h-10 px-3 text-sm bg-secondary/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
            >
              {SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-xs font-medium text-muted-foreground border border-border hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
              {saving ? 'Creating…' : 'Create Challenge'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AdminChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges);
  const [showCreate, setShowCreate] = useState(false);

  const active   = challenges.filter(c => c.status === 'active');
  const inactive = challenges.filter(c => c.status === 'inactive');

  const handleCreate = (data: Partial<Challenge>) => {
    setChallenges(prev => [{
      id: Date.now().toString(),
      title: data.title || '',
      type: data.type || 'daily_checkin',
      target: data.target || 7,
      points: data.points || 50,
      scope: data.scope || 'Platform-wide',
      status: 'active',
      participants: 0,
      completed: 0,
    }, ...prev]);
  };

  const handleDelete = (id: string) => {
    setChallenges(prev => prev.filter(c => c.id !== id));
    toast.success('Challenge removed');
  };

  const handleToggle = (id: string) => {
    setChallenges(prev => prev.map(c =>
      c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c
    ));
  };

  return (
    <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Challenges
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Create and manage platform-wide and company-specific wellness challenges.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20 self-start sm:self-auto"
        >
          <Plus className="h-5 w-5" /> Create Challenge
        </button>
      </div>

      {/* API note */}
      <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse flex-shrink-0" />
        📡 APIs: GET /api/admin/challenges · POST /api/admin/challenges · PATCH /api/admin/challenges/&#123;id&#125; · GET /api/admin/challenges/&#123;id&#125;/stats
      </div>

      {/* Active Challenges */}
      <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <h2 className="text-sm font-bold text-foreground">Active Challenges</h2>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
              {active.length} active
            </span>
          </div>
        </div>
        <div className="divide-y divide-border">
          {active.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 sm:p-5 hover:bg-secondary/20 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-1">
                  <p className="text-sm font-semibold text-foreground group-hover:text-indigo-500 transition-colors">{c.title}</p>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex-shrink-0">active</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Type: {c.type} · Target: {c.target} · Reward: {c.points} pts · {c.scope}
                  {c.endDate && <span> · Ends {c.endDate}</span>}
                </p>
                <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {c.participants} participants</span>
                  <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-emerald-500" /> {c.completed} completed</span>
                  <span className="font-semibold text-foreground">
                    {c.participants > 0 ? Math.round((c.completed / c.participants) * 100) : 0}% completion
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 self-end sm:self-auto">
                <button
                  onClick={() => handleToggle(c.id)}
                  className="p-2 rounded-xl text-amber-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all"
                  title="Deactivate"
                >
                  <Clock className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                  title="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          ))}
          {active.length === 0 && (
            <div className="py-10 text-center">
              <Trophy className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No active challenges. Create one above.</p>
            </div>
          )}
        </div>
      </div>

      {/* Inactive / Ended */}
      {inactive.length > 0 && (
        <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <h2 className="text-sm font-bold text-foreground">Inactive / Ended</h2>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{inactive.length}</span>
          </div>
          <div className="divide-y divide-border">
            {inactive.map((c) => (
              <div key={c.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 sm:p-5 opacity-60 hover:opacity-80 transition-opacity">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground">{c.title}</p>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-secondary text-muted-foreground flex-shrink-0">inactive</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Type: {c.type} · Target: {c.target} · {c.scope}
                    {c.endDate && <span> · Ended {c.endDate}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-1 self-end sm:self-auto">
                  <button
                    onClick={() => handleToggle(c.id)}
                    className="p-2 rounded-xl text-emerald-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all"
                    title="Reactivate"
                  >
                    <CheckCircle className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCreate && (
        <CreateChallengeModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
