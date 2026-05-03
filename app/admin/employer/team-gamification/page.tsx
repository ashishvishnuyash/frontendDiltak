'use client';

import { motion } from 'framer-motion';
import { Trophy, Flame, Users, Star, Award } from 'lucide-react';

// ── data ───────────────────────────────────────────────────────────────────────

const leaderboard = [
  { rank: 1, alias: 'User X7K2', level: 8, streak: 42, points: 2840 },
  { rank: 2, alias: 'User M9P1', level: 6, streak: 21, points: 1920 },
  { rank: 3, alias: 'User Q4R8', level: 5, streak: 14, points: 1540 },
  { rank: 4, alias: 'User B2T6', level: 5, streak: 8,  points: 1320 },
  { rank: 5, alias: 'User W8N3', level: 4, streak: 7,  points: 980  },
];

const badges = [
  { emoji: '🏅', name: 'first_check_in', earned: 72 },
  { emoji: '⚔️', name: 'week_warrior',   earned: 34 },
  { emoji: '🏃', name: 'health_week',    earned: 18 },
  { emoji: '💎', name: 'point_collector',earned: 12 },
];

const activeChallenges = [
  { title: '7-Day Check-In Streak 🔥', pts: 50, participants: 284, completion: null, endDate: 'May 31' },
  { title: 'First Conversation 💬',    pts: 20, participants: 412, completion: 96.6, endDate: null },
];

const rankColors = ['text-amber-500', 'text-gray-400', 'text-orange-600'];
const rankBg     = ['bg-amber-50 dark:bg-amber-900/20', 'bg-gray-50 dark:bg-gray-800', 'bg-orange-50 dark:bg-orange-900/20'];

// ── component ──────────────────────────────────────────────────────────────────

export default function TeamGamification() {
  const totalPlayers = 87;
  const avgPoints    = 740;
  const avgStreak    = 6.2;

  return (
    <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
          Team Gamification
        </h1>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          Anonymous leaderboard, badge distribution, and active challenges for your team.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Players',    value: totalPlayers, icon: Users,  color: 'text-indigo-500',  bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Avg Points', value: avgPoints,    icon: Trophy, color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Avg Streak', value: `${avgStreak} days`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map(s => (
          <div key={s.label} className={`flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border border-border shadow-sm ${s.bg}`}>
            <s.icon className={`h-5 w-5 ${s.color} opacity-80 mb-2`} />
            <p className={`text-xl sm:text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 text-center">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">

        {/* Anonymous Leaderboard */}
        <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <h2 className="text-sm font-bold text-foreground">🏆 Anonymous Leaderboard</h2>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg border border-border">
              Real names never shown
            </span>
          </div>
          <div className="divide-y divide-border">
            {leaderboard.map((entry, i) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/20 transition-colors group"
              >
                {/* Rank */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm ${i < 3 ? rankBg[i] : 'bg-secondary'} ${i < 3 ? rankColors[i] : 'text-muted-foreground'}`}>
                  {entry.rank}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground group-hover:text-indigo-500 transition-colors">{entry.alias}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-muted-foreground">Level {entry.level}</span>
                    {entry.streak > 0 && (
                      <span className="text-[10px] font-bold text-orange-500 flex items-center gap-0.5">
                        🔥 Streak {entry.streak}
                      </span>
                    )}
                  </div>
                </div>

                {/* Points */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-black text-foreground tabular-nums">{entry.points.toLocaleString()} pts</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right column: Badges + Challenges */}
        <div className="space-y-4">

          {/* Badge Distribution */}
          <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <Award className="h-5 w-5 text-purple-500" />
              <h2 className="text-sm font-bold text-foreground">Badge Distribution</h2>
            </div>
            <div className="divide-y divide-border">
              {badges.map((b, i) => (
                <motion.div
                  key={b.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-secondary/20 transition-colors"
                >
                  <span className="text-xl">{b.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground">{b.name}</p>
                    <div className="mt-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(b.earned / 72) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      />
                    </div>
                  </div>
                  <span className="text-xs font-black text-muted-foreground flex-shrink-0">{b.earned} earned</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Active Challenges */}
          <div className="bg-card dark:bg-gray-900/50 rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <Star className="h-5 w-5 text-amber-500" />
              <h2 className="text-sm font-bold text-foreground">Active Challenges</h2>
            </div>
            <div className="divide-y divide-border">
              {activeChallenges.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-5 py-4 hover:bg-secondary/20 transition-colors"
                >
                  <p className="text-sm font-semibold text-foreground mb-1">{c.title}</p>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                    <span className="font-bold text-indigo-500">{c.pts} pts</span>
                    <span>{c.participants} participating</span>
                    {c.completion != null && (
                      <span className="font-bold text-emerald-600">{c.completion}% completion</span>
                    )}
                    {c.endDate && <span>Ends {c.endDate}</span>}
                    {!c.endDate && <span className="text-purple-500 font-bold">Platform-wide</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
