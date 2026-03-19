'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Flame, 
  Star, 
  Target, 
  Award, 
  Calendar,
  CheckCircle,
  Clock,
  Users,
  Zap,
  Crown,
  Medal,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/hooks/use-user';

interface UserGamification {
  id: string;
  employee_id: string;
  company_id: string;
  current_streak: number;
  longest_streak: number;
  total_points: number;
  level: number;
  badges: string[];
  challenges_completed: number;
  last_check_in: string;
  weekly_goal: number;
  monthly_goal: number;
  created_at: string;
  updated_at: string;
}

interface WellnessChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: 'streak' | 'points' | 'activity' | 'social';
  duration_days: number;
  points_reward: number;
  badge_reward?: string;
  requirements: {
    daily_check_ins?: number;
    meditation_minutes?: number;
    journal_entries?: number;
    exercise_sessions?: number;
    social_interactions?: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  is_active: boolean;
  start_date: string;
  end_date: string;
  participants: string[];
  created_at: string;
}

const badgeInfo = {
  'first_check_in': { name: 'First Steps', icon: '🎯', color: 'bg-green-100 text-green-700' },
  'week_warrior': { name: 'Week Warrior', icon: '🔥', color: 'bg-orange-100 text-orange-700' },
  'month_master': { name: 'Month Master', icon: '👑', color: 'bg-purple-100 text-purple-700' },
  'century_streak': { name: 'Century Streak', icon: '💯', color: 'bg-red-100 text-red-700' },
  'point_collector': { name: 'Point Collector', icon: '⭐', color: 'bg-yellow-100 text-yellow-700' },
  'point_master': { name: 'Point Master', icon: '🏆', color: 'bg-blue-100 text-blue-700' },
  'level_five': { name: 'Level Five', icon: '🎖️', color: 'bg-indigo-100 text-indigo-700' },
  'level_ten': { name: 'Level Ten', icon: '🏅', color: 'bg-pink-100 text-pink-700' }
};

export default function GamificationDashboard() {
  const { user } = useUser();
  const [userStats, setUserStats] = useState<UserGamification | null>(null);
  const [challenges, setChallenges] = useState<WellnessChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_user_stats',
          employee_id: user.id,
          company_id: user.company_id
        })
      });

      const result = await response.json();
      if (result.success) {
        setUserStats(result.user_stats);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchChallenges = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_available_challenges',
          company_id: user.company_id
        })
      });

      const result = await response.json();
      if (result.success) {
        setChallenges(result.challenges);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };

  const handleCheckIn = async () => {
    if (!user) return;

    setCheckingIn(true);
    try {
      const response = await fetch('/api/gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check_in',
          employee_id: user.id,
          company_id: user.company_id
        })
      });

      const result = await response.json();
      if (result.success) {
        setUserStats(result.user_stats);
        if (result.new_badges && result.new_badges.length > 0) {
          toast.success(`Check-in successful! You earned ${result.new_badges.length} new badge(s)!`);
        } else {
          toast.success('Check-in recorded successfully!');
        }
      } else {
        toast.error('Failed to record check-in');
      }
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error('An error occurred during check-in');
    } finally {
      setCheckingIn(false);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) return;

    try {
      const response = await fetch('/api/gamification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join_challenge',
          employee_id: user.id,
          company_id: user.company_id,
          data: { challenge_id: challengeId }
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Successfully joined the challenge!');
        fetchChallenges(); // Refresh challenges
      } else {
        toast.error('Failed to join challenge');
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast.error('An error occurred while joining the challenge');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUserStats(), fetchChallenges()]);
      setLoading(false);
    };
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Wellness Gamification!</h2>
        <p className="text-gray-600 mb-6">Start your wellness journey by checking in for the first time.</p>
        <Button onClick={handleCheckIn} disabled={checkingIn} className="bg-blue-600 hover:bg-blue-700">
          {checkingIn ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Checking In...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Start Your Journey
            </>
          )}
        </Button>
      </div>
    );
  }

  const pointsToNextLevel = (userStats.level * 100) - userStats.total_points;
  const weeklyProgress = Math.min((userStats.current_streak / userStats.weekly_goal) * 100, 100);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Wellness Gamification
        </h1>
        <p className="text-gray-600">
          Track your progress, earn badges, and complete challenges
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-blue-700">{userStats.current_streak}</h3>
            <p className="text-sm text-blue-600">Conversation Streak</p>
            <p className="text-xs text-blue-500 mt-1">Best: {userStats.longest_streak}</p>
            <p className="text-xs text-blue-500 mt-1">💬 Keep chatting daily!</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-yellow-700">{userStats.total_points}</h3>
            <p className="text-sm text-yellow-600">Total Points</p>
            <p className="text-xs text-yellow-500 mt-1">Level {userStats.level}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-purple-700">{userStats.badges.length}</h3>
            <p className="text-sm text-purple-600">Badges Earned</p>
            <p className="text-xs text-purple-500 mt-1">{userStats.challenges_completed} challenges</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-green-700">{Math.round(weeklyProgress)}%</h3>
            <p className="text-sm text-green-600">Weekly Goal</p>
            <p className="text-xs text-green-500 mt-1">{userStats.current_streak}/{userStats.weekly_goal} days</p>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5" />
            <span>Level Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Level {userStats.level}</span>
              <span className="text-sm text-gray-500">{pointsToNextLevel} points to next level</span>
            </div>
            <Progress value={(userStats.total_points % 100) / 100 * 100} className="h-3" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{userStats.total_points} points</span>
              <span>{userStats.level * 100} points</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Check-in Button */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Daily Check-in</h3>
          <p className="text-blue-100 mb-2">Keep your streak alive and earn points!</p>
          <p className="text-blue-200 text-sm mb-4">💬 Completing conversations also counts as check-ins!</p>
          <Button
            onClick={handleCheckIn}
            disabled={checkingIn}
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            {checkingIn ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking In...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Manual Check-in
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Medal className="h-5 w-5" />
            <span>Your Badges</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {userStats.badges.map((badgeId) => {
              const badge = badgeInfo[badgeId as keyof typeof badgeInfo];
              if (!badge) return null;
              
              return (
                <motion.div
                  key={badgeId}
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${badge.color}`}>
                    <span className="text-2xl">{badge.icon}</span>
                  </div>
                  <p className="text-xs font-medium text-gray-700">{badge.name}</p>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Available Challenges</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {challenges.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No active challenges at the moment</p>
              </div>
            ) : (
              challenges.map((challenge) => (
                <div key={challenge.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
                    <Badge className={
                      challenge.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      challenge.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }>
                      {challenge.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{challenge.duration_days} days</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4" />
                        <span>{challenge.points_reward} points</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{challenge.participants.length} participants</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => joinChallenge(challenge.id)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Join Challenge
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
