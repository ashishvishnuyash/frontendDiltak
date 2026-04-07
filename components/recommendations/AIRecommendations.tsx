'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, Heart, Zap, Moon, Target, Sparkles,
  Shield, Users, TrendingUp, CheckCircle2,
  RefreshCw, Clock, Play, CheckCircle, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { BrandLoader } from '@/components/loader';
import { apiPost } from '@/lib/api-client';

// ── Types ──────────────────────────────────────────────────────────────────────

interface AIRecommendation {
  id: string;
  recommendation_type: 'meditation' | 'journaling' | 'breathing' | 'exercise' | 'sleep' | 'nutrition' | 'social' | 'work_life_balance';
  title: string;
  description: string;
  instructions: string[];
  duration_minutes: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  mood_targets: string[];
  wellness_metrics_affected: string[];
  ai_generated: boolean;
  personalized_for_user: boolean;
  created_at: string;
  completed_at?: string;
  user_feedback?: 'helpful' | 'not_helpful' | 'neutral';
  effectiveness_score?: number;
}

interface RecommendationCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  accent: string;
  iconBg: string;
  items: string[];
}

// ── Category config ────────────────────────────────────────────────────────────

const EMPLOYEE_CATEGORIES: RecommendationCategory[] = [
  {
    id: 'stress-management',
    title: 'Stress Management',
    icon: <Heart className="h-5 w-5" />,
    accent: 'border-rose-200 dark:border-rose-800',
    iconBg: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400',
    items: [
      'Try the 4-7-8 breathing technique during stressful moments',
      'Take a 5-minute walk between meetings to reset your mind',
      'Use the Pomodoro technique for focused work sessions',
      'Practice saying "no" to non-essential commitments',
    ],
  },
  {
    id: 'personal-wellness',
    title: 'Personal Wellness',
    icon: <Brain className="h-5 w-5" />,
    accent: 'border-blue-200 dark:border-blue-800',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
    items: [
      'Practice 5 minutes of mindfulness meditation daily',
      'Take regular breaks to stretch and move your body',
      'Stay hydrated and maintain regular meal times',
      'Get 7-9 hours of quality sleep each night',
    ],
  },
  {
    id: 'work-life-balance',
    title: 'Work-Life Balance',
    icon: <Zap className="h-5 w-5" />,
    accent: 'border-emerald-200 dark:border-emerald-800',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
    items: [
      'Set clear boundaries between work and personal time',
      'Schedule time for hobbies and activities you enjoy',
      'Disconnect from work emails after hours',
      'Plan regular time off to recharge and prevent burnout',
    ],
  },
  {
    id: 'self-care',
    title: 'Self-Care',
    icon: <Sparkles className="h-5 w-5" />,
    accent: 'border-purple-200 dark:border-purple-800',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
    items: [
      'Engage in activities that bring you joy and relaxation',
      'Connect with friends and family regularly',
      'Practice gratitude by writing down 3 things daily',
      'Seek support when needed from colleagues or professionals',
    ],
  },
];

const MANAGER_CATEGORIES: RecommendationCategory[] = [
  {
    id: 'leadership-wellness',
    title: 'Leadership Wellness',
    icon: <Shield className="h-5 w-5" />,
    accent: 'border-blue-200 dark:border-blue-800',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
    items: [
      'Schedule regular one-on-ones with your team to reduce communication stress',
      'Block 30 minutes daily for strategic thinking and planning',
      'Practice delegation to reduce your workload and develop your team',
      'Set clear boundaries between work and personal time',
    ],
  },
  {
    id: 'stress-management',
    title: 'Stress Management',
    icon: <Heart className="h-5 w-5" />,
    accent: 'border-rose-200 dark:border-rose-800',
    iconBg: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400',
    items: [
      'Try the 4-7-8 breathing technique during stressful moments',
      'Take a 5-minute walk between meetings to reset your mind',
      'Use the Pomodoro technique for focused work sessions',
      'Practice saying "no" to non-essential commitments',
    ],
  },
  {
    id: 'team-support',
    title: 'Team Support',
    icon: <Users className="h-5 w-5" />,
    accent: 'border-emerald-200 dark:border-emerald-800',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
    items: [
      'Check in with team members about their workload and wellbeing',
      'Recognize and celebrate team achievements regularly',
      'Create psychological safety for open communication',
      'Provide growth opportunities and learning resources',
    ],
  },
  {
    id: 'personal-development',
    title: 'Personal Development',
    icon: <TrendingUp className="h-5 w-5" />,
    accent: 'border-purple-200 dark:border-purple-800',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
    items: [
      'Read leadership books for 15 minutes daily',
      'Join a leadership peer group or mastermind',
      'Seek feedback from your team and peers regularly',
      'Invest in executive coaching or mentoring',
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function recIcon(type: string) {
  const map: Record<string, React.ReactNode> = {
    meditation: <Brain className="h-5 w-5" />,
    journaling: <Target className="h-5 w-5" />,
    breathing:  <Heart className="h-5 w-5" />,
    exercise:   <Zap className="h-5 w-5" />,
    sleep:      <Moon className="h-5 w-5" />,
  };
  return map[type] ?? <Sparkles className="h-5 w-5" />;
}

function recIconBg(type: string) {
  const map: Record<string, string> = {
    meditation: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
    journaling: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
    breathing:  'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400',
    exercise:   'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
    sleep:      'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
  };
  return map[type] ?? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
}

function diffBadge(d: string) {
  if (d === 'beginner')     return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  if (d === 'intermediate') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AIRecommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<RecommendationCategory[]>(EMPLOYEE_CATEGORIES);

  const buildCategories = useCallback((role: string) => {
    setCategories(role === 'manager' || role === 'admin' ? MANAGER_CATEGORIES : EMPLOYEE_CATEGORIES);
  }, []);

  const fetchRecommendations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await apiPost<{ success: boolean; recommendations: AIRecommendation[] }>(
        '/recommendations/generate',
        {
          employee_id: user.id,
          company_id: user.company_id,
          current_mood: 5,
          current_stress: 5,
          current_energy: 5,
          time_available: 15,
        }
      );
      if (result.success) {
        setRecommendations(result.recommendations);
        toast.success('Recommendations refreshed!');
      }
    } catch {
      // silent — categories still show
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      buildCategories(user.role || 'employee');
      fetchRecommendations();
    }
  }, [user, buildCategories, fetchRecommendations]);

  // never block render — categories always have a default value

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">AI Recommendations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Personalized wellness strategies based on your current state
          </p>
        </div>
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Category Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`bg-white dark:bg-gray-900 rounded-2xl border ${cat.accent} p-5 shadow-sm`}
          >
            {/* Card header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-xl ${cat.iconBg}`}>
                {cat.icon}
              </div>
              <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">{cat.title}</h2>
            </div>

            {/* Items */}
            <ul className="space-y-3">
              {cat.items.map((item, j) => (
                <motion.li
                  key={j}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 + j * 0.04 }}
                  className="flex items-start gap-2.5"
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* ── Loading skeleton for AI activities ── */}
      {loading && recommendations.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="h-5 w-5 text-purple-400" />
            </motion.div>
            <span className="text-base font-semibold text-gray-800 dark:text-gray-100">
              Generating Personalized Activities…
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">AI is working</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                className="rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
                  <div className="w-14 h-4 rounded-full bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="space-y-2">
                  <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                </div>
                <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── AI-generated Activity Recommendations ── */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
              Personalized Activities
            </h2>
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">AI-generated</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendations.slice(0, 6).map((rec, i) => {
              const isDone = completed.has(rec.id);
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.06 }}
                  className={`rounded-xl border p-4 flex flex-col gap-3 transition-colors ${
                    isDone
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                      : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
                  }`}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${recIconBg(rec.recommendation_type)}`}>
                      {recIcon(rec.recommendation_type)}
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${diffBadge(rec.difficulty_level)}`}>
                      {rec.difficulty_level}
                    </span>
                  </div>

                  {/* Title + desc */}
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug">{rec.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{rec.description}</p>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>{rec.duration_minutes} min</span>
                  </div>

                  {/* Action button */}
                  <button
                    onClick={() => {
                      setCompleted(prev => new Set([...prev, rec.id]));
                      toast.success('Great job completing this!');
                    }}
                    disabled={isDone}
                    className={`w-full flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-lg transition-colors ${
                      isDone
                        ? 'bg-emerald-500 text-white cursor-default'
                        : 'bg-gray-800 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-600'
                    }`}
                  >
                    {isDone ? (
                      <><CheckCircle className="h-3.5 w-3.5" /> Completed</>
                    ) : (
                      <><Play className="h-3.5 w-3.5" /> Start Activity</>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

    </div>
  );
}
