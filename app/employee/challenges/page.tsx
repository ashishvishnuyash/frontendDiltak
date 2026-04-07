'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Clock, ArrowRight, RefreshCw, Heart,
  CheckCircle, Star, Zap, Flame, Trophy, Award,
  ChevronRight, Sparkles,
} from 'lucide-react';
import { withAuth } from '@/components/auth/with-auth';
import { useAuth } from '@/contexts/auth-context';
import { apiPost } from '@/lib/api-client';
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

interface Challenge {
  id: string;
  title: string;
  description?: string;
  category?: string;
  duration_minutes?: number;
  difficulty?: string;
  priority?: string;
  is_active?: boolean;
}

interface GamificationCheckInResp {
  action: string;
  success: boolean;
  message: string;
  user_stats?: UserStats;
  new_badges?: string[];
  points_earned?: number;
}

// ── Badge metadata ─────────────────────────────────────────────────────────────

const BADGE_META: Record<string, { label: string; emoji: string }> = {
  first_check_in:   { label: 'First Check-In',    emoji: '🌱' },
  week_warrior:     { label: 'Week Warrior',       emoji: '🗡️' },
  month_master:     { label: 'Month Master',       emoji: '🏆' },
  century_streak:   { label: 'Century Streak',     emoji: '💯' },
  point_collector:  { label: 'Point Collector',    emoji: '⭐' },
  point_master:     { label: 'Point Master',       emoji: '👑' },
  level_five:       { label: 'Level 5 Achiever',   emoji: '🎯' },
  level_ten:        { label: 'Master Level 10',    emoji: '🔥' },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function difficultyColor(d?: string) {
  if (d === 'hard')   return 'text-red-500   bg-red-50   dark:bg-red-900/20';
  if (d === 'medium') return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
  return                     'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string | number; color: string;
}) {
  return (
    <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm gap-1">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{value}</p>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center leading-tight">{label}</p>
    </div>
  );
}

function BadgePill({ badgeKey }: { badgeKey: string }) {
  const meta = BADGE_META[badgeKey] ?? { label: badgeKey, emoji: '🏅' };
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30">
      <span className="text-sm">{meta.emoji}</span>
      <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">{meta.label}</span>
    </div>
  );
}

function ChallengeCard({ challenge, index, onJoin }: {
  challenge: Challenge; index: number; onJoin: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-md hover:border-emerald-100 dark:hover:border-emerald-800 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${difficultyColor(challenge.difficulty)}`}>
              {challenge.difficulty ?? 'beginner'}
            </span>
            {challenge.duration_minutes && (
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3" /> {challenge.duration_minutes} min
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug mb-1">{challenge.title}</h3>
          {challenge.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{challenge.description}</p>
          )}
          {challenge.category && (
            <p className="text-[10px] font-semibold text-gray-300 dark:text-gray-600 uppercase tracking-wide mt-2">{challenge.category}</p>
          )}
        </div>
        <button
          onClick={() => onJoin(challenge.id)}
          className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors shadow-sm shadow-emerald-500/20"
        >
          Start <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </motion.div>
  );
}

function EmptyChallenges() {
  return (
    <div className="flex flex-col items-center py-16 gap-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
      <Sparkles className="h-10 w-10 text-gray-200 dark:text-gray-700" />
      <p className="text-sm font-medium text-gray-400">No challenges available right now</p>
      <p className="text-xs text-gray-300 dark:text-gray-600">Check back soon — new challenges are added regularly</p>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

function ChallengesPage() {
  const { user, loading: userLoading } = useAuth();
  const [stats, setStats]             = useState<UserStats | null>(null);
  const [challenges, setChallenges]   = useState<Challenge[]>([]);
  const [loading, setLoading]         = useState(true);
  const [checkingIn, setCheckingIn]   = useState(false);

  const companyId  = user?.company_id  ?? '';
  const employeeId = user?.id          ?? '';

  const loadData = useCallback(async () => {
    if (!companyId || !employeeId) return;
    setLoading(true);
    try {
      // Load user stats and challenges in parallel
      const [statsResp, challengesResp] = await Promise.all([
        apiPost<{ action: string; success: boolean; user_stats: UserStats }>(
          '/gamification',
          { action: 'get_user_stats', employee_id: employeeId, company_id: companyId }
        ),
        apiPost<{ action: string; success: boolean; challenges: Challenge[] }>(
          '/gamification',
          { action: 'get_available_challenges', employee_id: employeeId, company_id: companyId }
        ),
      ]);
      if (statsResp.user_stats) setStats(statsResp.user_stats);
      if (challengesResp.challenges) setChallenges(challengesResp.challenges);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load challenges';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [companyId, employeeId]);

  useEffect(() => {
    if (!userLoading && user) loadData();
  }, [user, userLoading, loadData]);

  const handleCheckIn = async () => {
    if (!companyId || !employeeId) return;
    setCheckingIn(true);
    try {
      const resp = await apiPost<GamificationCheckInResp>(
        '/gamification',
        { action: 'check_in', employee_id: employeeId, company_id: companyId }
      );
      if (resp.success) {
        toast.success(`${resp.message} (+${resp.points_earned ?? 0} pts)`);
        if (resp.user_stats) setStats(resp.user_stats);
        if (resp.new_badges?.length) {
          resp.new_badges.forEach(b => {
            const meta = BADGE_META[b] ?? { label: b, emoji: '🏅' };
            toast.success(`New badge unlocked: ${meta.emoji} ${meta.label}`);
          });
        }
      } else {
        toast.info(resp.message ?? 'Already checked in today!');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Check-in failed';
      toast.error(msg);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    if (!companyId || !employeeId) return;
    try {
      await apiPost('/gamification', {
        action: 'join_challenge',
        employee_id: employeeId,
        company_id: companyId,
        data: { challenge_id: challengeId },
      });
      toast.success('Challenge joined! Good luck 🎯');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to join challenge';
      toast.error(msg);
    }
  };

  if (userLoading || loading) return <BrandLoader color="bg-emerald-400" />;

  const levelProgress = stats
    ? Math.min(((stats.total_points % 300) / 300) * 100, 100)
    : 0;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 dark:bg-gray-950 min-h-full">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* ── Stats bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={Flame}  label="Current Streak" value={stats?.current_streak ?? 0}  color="bg-orange-50 text-orange-500 dark:bg-orange-900/20" />
          <StatCard icon={Star}   label="Total Points"   value={stats?.total_points ?? 0}    color="bg-amber-50  text-amber-500  dark:bg-amber-900/20" />
          <StatCard icon={Zap}    label="Level"          value={stats?.level ?? 1}            color="bg-blue-50   text-blue-500   dark:bg-blue-900/20" />
          <StatCard icon={Trophy} label="Best Streak"    value={stats?.longest_streak ?? 0}  color="bg-purple-50 text-purple-500 dark:bg-purple-900/20" />
        </div>

        {/* ── Level progress + Check-in ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Level {stats?.level ?? 1} Progress
              </p>
              <p className="text-xs text-gray-400">{stats?.total_points ?? 0} pts</p>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              {stats?.current_streak ?? 0}-day streak · {stats?.challenges_completed ?? 0} challenges completed
            </p>
          </div>

          {/* Daily Check-in */}
          <button
            onClick={handleCheckIn}
            disabled={checkingIn}
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95"
          >
            <CheckCircle className="h-4 w-4" />
            {checkingIn ? 'Checking in…' : 'Daily Check-In'}
          </button>
        </div>

        {/* ── Badges ── */}
        {(stats?.badges?.length ?? 0) > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Your Badges</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {stats!.badges.map(b => <BadgePill key={b} badgeKey={b} />)}
            </div>
          </div>
        )}

        {/* ── Challenges + Refresh ── */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left: Challenges list */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Available Challenges</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadData}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Analytics
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            {challenges.length > 0 ? (
              <div className="space-y-4">
                {challenges.map((c, i) => (
                  <ChallengeCard key={c.id} challenge={c} index={i} onJoin={handleJoinChallenge} />
                ))}
              </div>
            ) : (
              <EmptyChallenges />
            )}
          </div>

          {/* Right: Wellness Tips sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Wellness Recommendations</h2>
            </div>
            <div className="space-y-3">
              {[
                { category: 'Stress Management',  items: ['4-7-8 Breathing', 'Guided Meditation', 'Progressive Relaxation'] },
                { category: 'Energy Boost',        items: ['5-min Walk', 'Power Nap', 'Cold Water Splash'] },
                { category: 'Work-Life Balance',   items: ['Pomodoro Sessions', 'End-of-Day Ritual', 'Screen Break'] },
                { category: 'Self Care',           items: ['Gratitude Journal', 'Stretch Break', 'Connect with Someone'] },
              ].map(rec => (
                <div key={rec.category} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <Heart className="h-3.5 w-3.5 text-emerald-500" />
                    </div>
                    <h3 className="text-xs font-bold text-gray-800 dark:text-gray-100">{rec.category}</h3>
                  </div>
                  <div className="border-t border-gray-50 dark:border-gray-800 mb-3" />
                  <div className="space-y-2">
                    {rec.items.map(item => (
                      <div key={item} className="flex items-center gap-2">
                        <div className="w-5 h-5 border border-dashed border-emerald-400 rounded flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-3 w-3 text-emerald-500" />
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default withAuth(ChallengesPage, ['employee', 'manager', 'hr']);
