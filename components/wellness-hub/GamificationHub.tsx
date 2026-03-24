'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Users, Zap, Star, Medal, Gift, Calendar } from 'lucide-react';

interface GamificationHubProps {
  userRole: 'employee' | 'manager' | 'employer';
  userId?: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'team' | 'company';
  duration: string;
  progress: number;
  maxProgress: number;
  reward: string;
  participants: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const rarityColor: Record<string, string> = {
  common: 'text-gray-500 bg-gray-100 dark:bg-gray-800',
  rare: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  epic: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  legendary: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
};
const typeColor: Record<string, string> = {
  individual: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
  team: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  company: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
};

const subTabs = [
  { id: 'challenges',   label: 'Challenges',   icon: Target },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'leaderboard',  label: 'Leaderboard',  icon: Users },
];

export default function GamificationHub({ userRole, userId }: GamificationHubProps) {
  const [activeTab, setActiveTab] = useState<'challenges' | 'achievements' | 'leaderboard'>('challenges');

  const challenges: Challenge[] = [
    { id: '1', title: 'Mindful Mornings',           description: 'Complete 5 minutes of meditation for 7 consecutive days',    type: 'individual', duration: '7 days',  progress: 4,   maxProgress: 7,   reward: '50 pts + Zen Master badge',       participants: 1 },
    { id: '2', title: 'Team Wellness Warriors',      description: 'Team completes 100 wellness activities collectively',         type: 'team',       duration: '2 weeks', progress: 67,  maxProgress: 100, reward: 'Team lunch + 100 pts each',       participants: 8 },
    { id: '3', title: '7-Day Mindful Break',         description: 'Take mindful breaks every 2 hours during work days',         type: 'individual', duration: '7 days',  progress: 3,   maxProgress: 7,   reward: 'Mindfulness Master + 75 pts',     participants: 1 },
    { id: '4', title: 'Gratitude Journal Streak',    description: "Write 3 things you're grateful for each day",               type: 'individual', duration: '14 days', progress: 8,   maxProgress: 14,  reward: 'Gratitude Guru badge + book',     participants: 1 },
    { id: '5', title: 'Company Wellness Month',      description: 'Entire company participates in wellness activities',         type: 'company',    duration: '30 days', progress: 245, maxProgress: 500, reward: 'Extra wellness day off',           participants: 156 },
  ];

  const achievements: Achievement[] = [
    { id: '1', title: 'First Steps',      description: 'Completed your first wellness activity',  icon: '🎯', unlockedAt: new Date('2024-01-10'), rarity: 'common' },
    { id: '2', title: 'Streak Master',    description: 'Maintained a 7-day wellness streak',      icon: '🔥', unlockedAt: new Date('2024-01-12'), rarity: 'rare' },
    { id: '3', title: 'Community Helper', description: 'Helped 5 colleagues with wellness tips',  icon: '🤝', unlockedAt: new Date('2024-01-14'), rarity: 'epic' },
  ];

  const userStats = { totalPoints: 1250, level: 8, rank: 15, streakDays: 12, completedChallenges: 7 };

  const leaderboard = [
    { rank: 1, name: 'Sarah Johnson',   points: 2150, isUser: false },
    { rank: 2, name: 'Mike Chen',       points: 1980, isUser: false },
    { rank: 3, name: 'Emily Davis',     points: 1875, isUser: false },
    { rank: 4, name: 'Alex Rodriguez',  points: 1650, isUser: false },
    { rank: 5, name: 'You',             points: userStats.totalPoints, isUser: true },
  ];

  return (
    <div className="space-y-5">
      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Points', value: userStats.totalPoints.toLocaleString(), icon: Trophy,  color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
          { label: 'Level',        value: `Lv. ${userStats.level}`,               icon: Star,    color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Rank',         value: `#${userStats.rank}`,                   icon: Medal,   color: 'text-emerald-500',bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Day Streak',   value: `${userStats.streakDays}d`,             icon: Zap,     color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
          { label: 'Completed',    value: `${userStats.completedChallenges}`,     icon: Target,  color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{s.value}</p>
                <p className="text-[11px] text-gray-400">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-1">
        {subTabs.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all flex-1 justify-center ${
                active ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />{t.label}
            </button>
          );
        })}
      </div>

      {/* Challenges */}
      {activeTab === 'challenges' && (
        <div className="space-y-3">
          {challenges.map((ch, i) => {
            const pct = Math.round((ch.progress / ch.maxProgress) * 100);
            return (
              <motion.div
                key={ch.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{ch.title}</p>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize ${typeColor[ch.type]}`}>{ch.type}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{ch.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{ch.duration}</span>
                    {ch.type !== 'individual' && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{ch.participants}</span>}
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{ch.progress}/{ch.maxProgress} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, delay: i * 0.08 }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                    <Gift className="h-3 w-3" />{ch.reward}
                  </span>
                  <button className="text-xs px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors">
                    Continue
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Achievements */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {achievements.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 text-center"
            >
              <div className="text-3xl mb-2">{a.icon}</div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1">{a.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">{a.description}</p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${rarityColor[a.rarity]}`}>{a.rarity}</span>
              <p className="text-[11px] text-gray-400 mt-2">{a.unlockedAt.toLocaleDateString()}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Weekly Leaderboard</h2>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {leaderboard.map((u, i) => (
              <motion.div
                key={u.rank}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`flex items-center gap-3 px-4 py-3 ${u.isUser ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
              >
                <span className={`w-6 text-center text-xs font-bold ${i < 3 ? ['text-yellow-500','text-gray-400','text-orange-400'][i] : 'text-gray-400'}`}>
                  {i < 3 ? ['🥇','🥈','🥉'][i] : `#${u.rank}`}
                </span>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${u.isUser ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-800 dark:text-gray-100'}`}>
                    {u.name}{u.isUser && <span className="ml-1.5 text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-full">You</span>}
                  </p>
                </div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{u.points.toLocaleString()} <span className="text-xs font-normal text-gray-400">pts</span></p>
              </motion.div>
            ))}
          </div>
          <div className="px-4 py-3 bg-emerald-50 dark:bg-emerald-900/10 border-t border-emerald-100 dark:border-emerald-800">
            <p className="text-xs text-emerald-700 dark:text-emerald-300 text-center">Complete more challenges to climb the leaderboard</p>
          </div>
        </div>
      )}
    </div>
  );
}
