'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  isActive: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export default function GamificationHub({ userRole, userId }: GamificationHubProps) {
  const [activeTab, setActiveTab] = useState<'challenges' | 'achievements' | 'leaderboard'>('challenges');
  
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: '1',
      title: 'Mindful Mornings',
      description: 'Complete 5 minutes of meditation for 7 consecutive days',
      type: 'individual',
      duration: '7 days',
      progress: 4,
      maxProgress: 7,
      reward: '50 wellness points + Zen Master badge',
      participants: 1,
      isActive: true
    },
    {
      id: '2',
      title: 'Team Wellness Warriors',
      description: 'Team completes 100 wellness activities collectively',
      type: 'team',
      duration: '2 weeks',
      progress: 67,
      maxProgress: 100,
      reward: 'Team lunch + 100 points each',
      participants: 8,
      isActive: true
    },
    {
      id: '3',
      title: '7-Day Mindful Break Challenge',
      description: 'Take mindful breaks every 2 hours during work days',
      type: 'individual',
      duration: '7 days',
      progress: 3,
      maxProgress: 7,
      reward: 'Mindfulness Master badge + 75 points',
      participants: 1,
      isActive: true
    },
    {
      id: '4',
      title: 'Gratitude Journal Streak',
      description: 'Write 3 things you\'re grateful for each day',
      type: 'individual',
      duration: '14 days',
      progress: 8,
      maxProgress: 14,
      reward: 'Gratitude Guru badge + wellness book',
      participants: 1,
      isActive: true
    },
    {
      id: '5',
      title: 'Company-wide Wellness Month',
      description: 'Entire company participates in wellness activities',
      type: 'company',
      duration: '30 days',
      progress: 245,
      maxProgress: 500,
      reward: 'Extra wellness day off for everyone',
      participants: 156,
      isActive: true
    }
  ]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'First Steps',
      description: 'Completed your first wellness activity',
      icon: '🎯',
      unlockedAt: new Date('2024-01-10'),
      rarity: 'common'
    },
    {
      id: '2',
      title: 'Streak Master',
      description: 'Maintained a 7-day wellness streak',
      icon: '🔥',
      unlockedAt: new Date('2024-01-12'),
      rarity: 'rare'
    },
    {
      id: '3',
      title: 'Community Helper',
      description: 'Helped 5 colleagues with wellness tips',
      icon: '🤝',
      unlockedAt: new Date('2024-01-14'),
      rarity: 'epic'
    }
  ]);

  const [userStats] = useState({
    totalPoints: 1250,
    level: 8,
    rank: 15,
    streakDays: 12,
    completedChallenges: 7
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'individual': return 'bg-green-100 text-green-800';
      case 'team': return 'bg-blue-100 text-blue-800';
      case 'company': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced User Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <motion.div
          whileHover={{ scale: 1.05, rotate: [0, -1, 1, 0] }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 text-white shadow-2xl border-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full -translate-y-8 translate-x-8" />
            <CardContent className="p-6 text-center relative z-10">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Trophy className="h-10 w-10 mx-auto mb-3 drop-shadow-lg" />
              </motion.div>
              <div className="text-3xl font-bold mb-1">{userStats.totalPoints.toLocaleString()}</div>
              <div className="text-sm opacity-90 font-medium">Total Points</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, rotate: [0, 1, -1, 0] }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white shadow-2xl border-0 overflow-hidden relative">
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/20 rounded-full translate-y-6 -translate-x-6" />
            <CardContent className="p-6 text-center relative z-10">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Star className="h-10 w-10 mx-auto mb-3 drop-shadow-lg fill-current" />
              </motion.div>
              <div className="text-3xl font-bold mb-1">Level {userStats.level}</div>
              <div className="text-sm opacity-90 font-medium">Current Level</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, rotate: [0, -1, 1, 0] }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 text-white shadow-2xl border-0 overflow-hidden relative">
            <div className="absolute top-1/2 right-0 w-10 h-10 bg-white/20 rounded-full translate-x-5" />
            <CardContent className="p-6 text-center relative z-10">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Medal className="h-10 w-10 mx-auto mb-3 drop-shadow-lg" />
              </motion.div>
              <div className="text-3xl font-bold mb-1">#{userStats.rank}</div>
              <div className="text-sm opacity-90 font-medium">Leaderboard</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, rotate: [0, 1, -1, 0] }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-pink-500 via-rose-500 to-red-600 text-white shadow-2xl border-0 overflow-hidden relative">
            <div className="absolute top-0 left-1/3 w-8 h-8 bg-white/20 rounded-full -translate-y-4" />
            <CardContent className="p-6 text-center relative z-10">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Zap className="h-10 w-10 mx-auto mb-3 drop-shadow-lg fill-current" />
              </motion.div>
              <div className="text-3xl font-bold mb-1">{userStats.streakDays}</div>
              <div className="text-sm opacity-90 font-medium">Day Streak</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, rotate: [0, -1, 1, 0] }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 text-white shadow-2xl border-0 overflow-hidden relative">
            <div className="absolute bottom-0 right-1/4 w-14 h-14 bg-white/20 rounded-full translate-y-7" />
            <CardContent className="p-6 text-center relative z-10">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <Target className="h-10 w-10 mx-auto mb-3 drop-shadow-lg" />
              </motion.div>
              <div className="text-3xl font-bold mb-1">{userStats.completedChallenges}</div>
              <div className="text-sm opacity-90 font-medium">Completed</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Enhanced Navigation Tabs */}
      <div className="flex justify-center">
        <div className="flex space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-2 rounded-2xl shadow-xl border-0">
          {[
            { id: 'challenges', label: 'Active Challenges', icon: Target, color: 'from-green-500 to-emerald-500' },
            { id: 'achievements', label: 'Achievements', icon: Trophy, color: 'from-yellow-500 to-orange-500' },
            { id: 'leaderboard', label: 'Leaderboard', icon: Users, color: 'from-purple-500 to-pink-500' }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 py-3 px-6 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <tab.icon className="h-5 w-5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Enhanced Active Challenges */}
      {activeTab === 'challenges' && (
        <div className="space-y-6">
          {challenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="bg-gradient-to-r from-white/90 to-gray-50/90 dark:from-gray-800/90 dark:to-gray-700/90 backdrop-blur-md border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-3 text-xl mb-2">
                        <motion.div
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          🎯
                        </motion.div>
                        {challenge.title}
                        <Badge className={`${getTypeColor(challenge.type)} px-3 py-1 text-xs font-semibold`}>
                          {challenge.type}
                        </Badge>
                      </CardTitle>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{challenge.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <motion.div 
                        className="flex items-center gap-2 text-sm text-gray-500 mb-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Calendar className="h-4 w-4" />
                        {challenge.duration}
                      </motion.div>
                      {challenge.type !== 'individual' && (
                        <motion.div 
                          className="flex items-center gap-2 text-sm text-gray-500 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Users className="h-4 w-4" />
                          {challenge.participants} participants
                        </motion.div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2 font-medium">
                        <span className="text-gray-700 dark:text-gray-300">Progress</span>
                        <span className="text-indigo-600 dark:text-indigo-400">
                          {challenge.progress}/{challenge.maxProgress}
                        </span>
                      </div>
                      <div className="relative">
                        <Progress 
                          value={(challenge.progress / challenge.maxProgress) * 100} 
                          className="h-3 bg-gray-200 dark:bg-gray-700"
                        />
                        <motion.div
                          className="absolute top-0 left-0 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(challenge.progress / challenge.maxProgress) * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <motion.div 
                        className="flex items-center gap-2 text-sm bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 px-4 py-2 rounded-full"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Gift className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-green-700 dark:text-green-300 font-medium">
                          Reward: {challenge.reward}
                        </span>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          Continue Challenge
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Enhanced Achievements */}
      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ 
                scale: 1.08, 
                rotateY: [0, 5, -5, 0],
                transition: { duration: 0.5 }
              }}
            >
              <Card className="text-center bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-800/90 dark:to-gray-700/90 backdrop-blur-md border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
                {/* Rarity glow effect */}
                <div className={`absolute inset-0 opacity-20 ${
                  achievement.rarity === 'legendary' ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                  achievement.rarity === 'epic' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                  achievement.rarity === 'rare' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                  'bg-gradient-to-br from-gray-400 to-gray-500'
                }`} />
                
                <CardContent className="p-8 relative z-10">
                  <motion.div 
                    className="text-6xl mb-4"
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    {achievement.icon}
                  </motion.div>
                  
                  <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-gray-100">
                    {achievement.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {achievement.description}
                  </p>
                  
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Badge className={`${getRarityColor(achievement.rarity)} px-4 py-2 text-sm font-bold uppercase tracking-wide shadow-lg`}>
                      ✨ {achievement.rarity}
                    </Badge>
                  </motion.div>
                  
                  <motion.p 
                    className="text-xs text-gray-500 dark:text-gray-400 mt-4 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full inline-block"
                    whileHover={{ scale: 1.05 }}
                  >
                    🗓️ Unlocked {achievement.unlockedAt.toLocaleDateString()}
                  </motion.p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Enhanced Leaderboard */}
      {activeTab === 'leaderboard' && (
        <Card className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-800/90 dark:to-gray-700/90 backdrop-blur-md border-0 shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                🏆
              </motion.div>
              Weekly Leaderboard
            </CardTitle>
            <p className="text-indigo-100">See how you stack up against your peers!</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[
                { rank: 1, name: 'Sarah Johnson', points: 2150, badge: '🥇', gradient: 'from-yellow-400 to-orange-500' },
                { rank: 2, name: 'Mike Chen', points: 1980, badge: '🥈', gradient: 'from-gray-400 to-gray-600' },
                { rank: 3, name: 'Emily Davis', points: 1875, badge: '🥉', gradient: 'from-orange-400 to-red-500' },
                { rank: 4, name: 'Alex Rodriguez', points: 1650, badge: '4️⃣', gradient: 'from-blue-400 to-blue-600' },
                { rank: 5, name: 'You', points: userStats.totalPoints, badge: '5️⃣', gradient: 'from-purple-400 to-purple-600', isUser: true }
              ].map((user, index) => (
                <motion.div
                  key={user.rank}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 10 }}
                  className={`group flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                    user.isUser 
                      ? 'bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 border-2 border-indigo-300 dark:border-indigo-600 shadow-lg' 
                      : 'bg-white/70 dark:bg-gray-700/70 hover:bg-white dark:hover:bg-gray-700 shadow-md hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <motion.div 
                      className={`w-12 h-12 bg-gradient-to-br ${user.gradient} rounded-full flex items-center justify-center font-bold text-white shadow-lg text-lg`}
                      whileHover={{ 
                        rotate: [0, -10, 10, 0],
                        scale: 1.1
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {user.badge}
                    </motion.div>
                    <div>
                      <p className={`font-bold text-lg ${
                        user.isUser 
                          ? 'text-indigo-900 dark:text-indigo-100' 
                          : 'text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                      }`}>
                        {user.name}
                        {user.isUser && (
                          <motion.span 
                            className="ml-2 text-sm bg-indigo-500 text-white px-2 py-1 rounded-full"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            You!
                          </motion.span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Rank #{user.rank}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <motion.p 
                      className="font-bold text-2xl text-gray-900 dark:text-gray-100"
                      whileHover={{ scale: 1.1 }}
                    >
                      {user.points.toLocaleString()}
                    </motion.p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">points</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Motivational message */}
            <motion.div 
              className="mt-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl border border-green-200 dark:border-green-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-center text-green-800 dark:text-green-200 font-medium">
                🌟 Keep going! Complete more challenges to climb the leaderboard! 🌟
              </p>
            </motion.div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}