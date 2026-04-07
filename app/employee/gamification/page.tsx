'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Flame, Star, Target, Award, Crown, Medal,
  Zap, CheckCircle, Clock, Users, TrendingUp, Sparkles,
  Shield, Lock, ChevronRight, RefreshCw, Gift,
} from 'lucide-react';
import { withAuth } from '@/components/auth/with-auth';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { BrandLoader } from '@/components/loader';

// ── Types ──────────────────────────────────────────────────────────────────────

interface UserStats {
  id: string;
  employee_id: string;
  company_id: string;
  current_streak: number;
  longest_streak: number;
  total_points: number;
  level: number;
  badges: string[];
  challenges_completed: number;
  last_check_in: string | null;
  weekly_goal: number;
  monthly_goal: number;
}

interface WellnessChallenge {
  id: string;
  title: string;
  description?: string;
  challenge_type?: string;
  duration_days?: number;
  points_reward?: number;
  badge_reward?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  is_active?: boolean;
  participants?: string[];
}

// ── Constants ──────────────────────────────────────────────────────────────────

const BADGE_META: Record<string, { label: string; emoji: string; color: string }> = {
  first_check_in:  { label: 'First Check-In',   emoji: '🌱', color: 'from-emerald-400 to-green-500' },
  week_warrior:    { label: 'Week Warrior',      emoji: '🗡️',  color: 'from-orange-400 to-red-500'   },
  month_master:    { label: 'Month Master',      emoji: '👑',  color: 'from-purple-400 to-indigo-500' },
  century_streak:  { label: 'Century Streak',    emoji: '💯',  color: 'from-red-400 to-rose-600'     },
  point_collector: { label: 'Point Collector',   emoji: '⭐',  color: 'from-yellow-400 to-amber-500' },
  point_master:    { label: 'Point Master',      emoji: '🏆',  color: 'from-blue-400 to-cyan-500'    },
  level_five:      { label: 'Level 5 Achiever',  emoji: '🎯',  color: 'from-indigo-400 to-violet-500'},
  level_ten:       { label: 'Master Level 10',   emoji: '🔥',  color: 'from-pink-400 to-fuchsia-500' },
};

const ALL_BADGES = Object.keys(BADGE_META);

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];

function getLevel(pts: number) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (pts >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

function getLevelProgress(pts: number) {
  const lv = getLevel(pts) - 1;
  const cur = LEVEL_THRESHOLDS[Math.min(lv, LEVEL_THRESHOLDS.length - 1)];
  const next = LEVEL_THRESHOLDS[Math.min(lv + 1, LEVEL_THRESHOLDS.length - 1)] || cur + 1500;
  return { pct: Math.round(((pts - cur) / (next - cur)) * 100), next, cur };
}

function rankLabel(level: number) {
  if (level >= 10) return { title: 'Grandmaster', icon: '👑', color: 'text-amber-500' };
  if (level >= 7)  return { title: 'Elite',        icon: '💎', color: 'text-cyan-500'  };
  if (level >= 5)  return { title: 'Veteran',      icon: '🏅', color: 'text-purple-500'};
  if (level >= 3)  return { title: 'Challenger',   icon: '🛡️', color: 'text-blue-500'  };
  return               { title: 'Newcomer',    icon: '🌱', color: 'text-emerald-500'};
}

function difficultyStyle(d?: string) {
  if (d === 'hard')   return 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400';
  if (d === 'medium') return 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400';
  return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, colorClass }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; colorClass: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col gap-2"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorClass}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">{value}</p>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
    </motion.div>
  );
}

function XpBar({ pts, level }: { pts: number; level: number }) {
  const { pct, next } = getLevelProgress(pts);
  const rank = rankLabel(level);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{rank.icon}</span>
          <div>
            <p className="text-sm font-bold text-gray-800 dark:text-white">Level {level} · <span className={rank.color}>{rank.title}</span></p>
            <p className="text-[11px] text-gray-400">{pts} XP total</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Next level</p>
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{next} XP</p>
        </div>
      </div>
      <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
        />
      </div>
      <p className="text-[11px] text-gray-400 text-right">{pct}% to level {level + 1}</p>
    </div>
  );
}

function BadgeGrid({ earned }: { earned: string[] }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
      {ALL_BADGES.map(key => {
        const meta = BADGE_META[key];
        const unlocked = earned.includes(key);
        return (
          <motion.div
            key={key}
            whileHover={{ scale: 1.08 }}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl relative
              ${unlocked
                ? `bg-gradient-to-br ${meta.color} shadow-md`
                : 'bg-gray-100 dark:bg-gray-800 grayscale opacity-40'
              }`}
            >
              {unlocked ? meta.emoji : <Lock className="h-5 w-5 text-gray-400" />}
              {unlocked && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-900" />
              )}
            </div>
            <p className={`text-[10px] font-medium text-center leading-tight
              ${unlocked ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
              {meta.label}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}

function ChallengeCard({ challenge, joined, onJoin, index }: {
  challenge: WellnessChallenge; joined: boolean; onJoin: (id: string) => void; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col gap-3 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-semibold text-gray-800 dark:text-white text-sm leading-snug">{challenge.title}</h4>
        {challenge.difficulty && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0 ${difficultyStyle(challenge.difficulty)}`}>
            {challenge.difficulty}
          </span>
        )}
      </div>
      {challenge.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{challenge.description}</p>
      )}
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {challenge.duration_days && (
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{challenge.duration_days}d</span>
          )}
          {challenge.points_reward && (
            <span className="flex items-center gap-1 text-amber-500 font-semibold"><Star className="h-3.5 w-3.5" />+{challenge.points_reward} XP</span>
          )}
          {challenge.participants && (
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{challenge.participants.length}</span>
          )}
        </div>
        <button
          onClick={() => !joined && onJoin(challenge.id)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors
            ${joined
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 cursor-default'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
        >
          {joined ? <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />Joined</span> : 'Join'}
        </button>
      </div>
    </motion.div>
  );
}

// ── Tabs ───────────────────────────────────────────────────────────────────────

const TABS = ['Overview', 'Badges', 'Challenges'] as const;
type Tab = typeof TABS[number];

// ── Page ───────────────────────────────────────────────────────────────────────

function GamificationPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [challenges, setChallenges] = useState<WellnessChallenge[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [tab, setTab] = useState<Tab>('Overview');

  const post = useCallback(async (body: object) => {
    const res = await fetch('/api/gamification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  }, []);

  const loadAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [statsRes, challRes] = await Promise.all([
      post({ action: 'get_user_stats', employee_id: user.id, company_id: user.company_id }),
      post({ action: 'get_available_challenges', employee_id: user.id, company_id: user.company_id }),
    ]);
    if (statsRes.success) setStats(statsRes.user_stats);
    if (challRes.success) setChallenges(challRes.challenges ?? []);
    setLoading(false);
  }, [user, post]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleCheckIn = async () => {
    if (!user || checkingIn) return;
    setCheckingIn(true);
    try {
      const res = await post({ action: 'check_in', employee_id: user.id, company_id: user.company_id });
      if (res.success) {
        setStats(res.user_stats);
        const pts = res.points_earned ?? 10;
        if (res.new_badges?.length) {
          toast.success(`+${pts} XP · ${res.new_badges.length} new badge(s) unlocked!`);
        } else {
          toast.success(`+${pts} XP · Streak continuing!`);
        }
      } else {
        toast.info(res.message ?? 'Already checked in today.');
      }
    } catch {
      toast.error('Check-in failed. Try again.');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleJoin = async (challengeId: string) => {
    if (!user) return;
    try {
      const res = await post({ action: 'join_challenge', employee_id: user.id, company_id: user.company_id, data: { challenge_id: challengeId } });
      if (res.success) {
        setJoinedIds(prev => new Set(prev).add(challengeId));
        toast.success('Challenge joined!');
      } else {
        toast.error('Could not join challenge.');
      }
    } catch {
      toast.error('Error joining challenge.');
    }
  };

  if (loading) return <BrandLoader color="bg-emerald-400" />;

  const s = stats;
  const level = s?.level ?? 1;
  const pts = s?.total_points ?? 0;
  const streak = s?.current_streak ?? 0;
  const badges = s?.badges ?? [];
  const rank = rankLabel(level);
  const { pct } = getLevelProgress(pts);
  const alreadyCheckedIn = s?.last_check_in
    ? (Date.now() - new Date(s.last_check_in).getTime()) < 24 * 60 * 60 * 1000
    : false;

  return (
    <div className="px-4 sm:px-6 py-6 max-w-4xl mx-auto space-y-5">

      {/* ── Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 p-6 text-white shadow-lg"
      >
        {/* decorative rings */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-white/5" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* avatar orb */}
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
              {rank.icon}
            </div>
            <div>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest">Wellness Journey</p>
              <h1 className="text-2xl font-black leading-tight">{user?.first_name ?? 'Player'}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">Level {level} · {rank.title}</span>
                <span className="text-xs text-white/70">{pts} XP</span>
              </div>
            </div>
          </div>

          {/* streak badge */}
          <div className="flex flex-col items-center bg-white/15 backdrop-blur rounded-2xl px-4 py-3 gap-0.5 flex-shrink-0">
            <Flame className="h-5 w-5 text-orange-300" />
            <span className="text-2xl font-black">{streak}</span>
            <span className="text-[10px] text-white/70 font-semibold uppercase">Streak</span>
          </div>
        </div>

        {/* XP progress */}
        <div className="relative mt-5 space-y-1.5">
          <div className="flex justify-between text-xs text-white/70">
            <span>Level {level}</span>
            <span>{pct}% to Level {level + 1}</span>
          </div>
          <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full bg-white/80"
            />
          </div>
        </div>
      </motion.div>

      {/* ── Check-in CTA ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className={`rounded-2xl border p-4 flex items-center justify-between gap-4
          ${alreadyCheckedIn
            ? 'bg-emerald-50 dark:bg-emerald-900/15 border-emerald-200 dark:border-emerald-800'
            : 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800'
          }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
            ${alreadyCheckedIn ? 'bg-emerald-100 dark:bg-emerald-800' : 'bg-amber-100 dark:bg-amber-800'}`}>
            {alreadyCheckedIn ? <CheckCircle className="h-5 w-5 text-emerald-600" /> : <Gift className="h-5 w-5 text-amber-600" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">
              {alreadyCheckedIn ? 'Checked in today!' : 'Daily Check-In Available'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {alreadyCheckedIn ? 'See you tomorrow for more XP.' : 'Claim your daily +10 XP & keep your streak alive.'}
            </p>
          </div>
        </div>
        {!alreadyCheckedIn && (
          <button
            onClick={handleCheckIn}
            disabled={checkingIn}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {checkingIn ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
            {checkingIn ? 'Claiming…' : 'Claim XP'}
          </button>
        )}
      </motion.div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all
              ${tab === t
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Overview Tab ── */}
        {tab === 'Overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-5"
          >
            {/* stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={Flame}  label="Current Streak" value={s?.current_streak ?? 0}  sub={`Best: ${s?.longest_streak ?? 0}`} colorClass="bg-orange-100 dark:bg-orange-900/30 text-orange-500" />
              <StatCard icon={Star}   label="Total XP"        value={pts}                      sub={`Level ${level}`}                  colorClass="bg-amber-100 dark:bg-amber-900/30 text-amber-500" />
              <StatCard icon={Award}  label="Badges"          value={badges.length}            sub={`of ${ALL_BADGES.length} total`}   colorClass="bg-purple-100 dark:bg-purple-900/30 text-purple-500" />
              <StatCard icon={Trophy} label="Challenges"      value={s?.challenges_completed ?? 0} sub="completed"                    colorClass="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" />
            </div>

            {/* XP bar */}
            <XpBar pts={pts} level={level} />

            {/* recent badges preview */}
            {badges.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Medal className="h-5 w-5 text-amber-500" /> Recent Badges
                  </h3>
                  <button onClick={() => setTab('Badges')} className="text-xs text-emerald-600 hover:underline flex items-center gap-0.5">
                    All badges <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {badges.slice(0, 5).map(key => {
                    const meta = BADGE_META[key] ?? { label: key, emoji: '🏅', color: 'from-gray-400 to-gray-500' };
                    return (
                      <div key={key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${meta.color} text-white text-xs font-semibold shadow-sm`}>
                        <span>{meta.emoji}</span>
                        <span>{meta.label}</span>
                      </div>
                    );
                  })}
                  {badges.length > 5 && (
                    <div className="flex items-center px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs font-semibold">
                      +{badges.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* goals */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-teal-500" /> Goals
              </h3>
              {/* weekly */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500">
                  <span className="font-medium">Weekly Streak Goal</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300">{streak}/{s?.weekly_goal ?? 5} days</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(((streak) / (s?.weekly_goal ?? 5)) * 100, 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-500"
                  />
                </div>
              </div>
              {/* monthly */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500">
                  <span className="font-medium">Monthly Challenge Goal</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300">{s?.challenges_completed ?? 0}/{s?.monthly_goal ?? 20}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(((s?.challenges_completed ?? 0) / (s?.monthly_goal ?? 20)) * 100, 100)}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-purple-400 to-indigo-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Badges Tab ── */}
        {tab === 'Badges' && (
          <motion.div
            key="badges"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" /> Badge Collection
              </h3>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
                {badges.length}/{ALL_BADGES.length} unlocked
              </span>
            </div>
            <BadgeGrid earned={badges} />
            {badges.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-6">No badges yet — start chatting and checking in daily!</p>
            )}
          </motion.div>
        )}

        {/* ── Challenges Tab ── */}
        {tab === 'Challenges' && (
          <motion.div
            key="challenges"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-3"
          >
            {challenges.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-10 flex flex-col items-center gap-3">
                <Trophy className="h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-500">No active challenges right now.</p>
                <p className="text-xs text-gray-400">Your admin will post challenges here.</p>
              </div>
            ) : (
              challenges.map((c, i) => (
                <ChallengeCard
                  key={c.id}
                  challenge={c}
                  index={i}
                  joined={joinedIds.has(c.id) || (c.participants?.includes(user?.id ?? '') ?? false)}
                  onJoin={handleJoin}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default withAuth(GamificationPage, ['employee']);
