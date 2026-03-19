'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Play, 
  Clock, 
  Star, 
  Target, 
  Heart, 
  Zap, 
  Moon,
  RefreshCw,
  CheckCircle,
  Loader2,
  Sparkles,
  Shield,
  Users,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/hooks/use-user';

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
  color: string;
  headerColor: string;
  items: string[];
}

export default function AIRecommendations() {
  const { user } = useUser();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [completedRecommendations, setCompletedRecommendations] = useState<string[]>([]);
  const [categories, setCategories] = useState<RecommendationCategory[]>([]);

  const getRecommendations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/recommendations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: user.id,
          company_id: user.company_id,
          current_mood: 5, // Default neutral mood
          current_stress: 5, // Default neutral stress
          current_energy: 5, // Default neutral energy
          time_available: 15
        })
      });

      const result = await response.json();

      if (result.success) {
        setRecommendations(result.recommendations);
        generateCategories(result.recommendations, user.role || 'employee');
        toast.success('Personalized recommendations generated based on your chat history!');
      } else {
        // Generate fallback categories
        generateCategories([], user.role || 'employee');
        toast.error('Failed to generate recommendations');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      generateCategories([], user.role || 'employee');
      toast.error('An error occurred while generating recommendations');
    } finally {
      setLoading(false);
    }
  };

  const generateCategories = (recs: AIRecommendation[], role: string) => {
    if (role === 'manager' || role === 'admin') {
      // Manager/Leadership categories
      setCategories([
        {
          id: 'leadership-wellness',
          title: 'Leadership Wellness',
          icon: <Shield className="h-6 w-6" />,
          color: 'bg-blue-50 dark:bg-blue-950/30',
          headerColor: 'bg-blue-100 dark:bg-blue-900/50',
          items: [
            'Schedule regular one-on-ones with your team to reduce communication stress',
            'Block 30 minutes daily for strategic thinking and planning',
            'Practice delegation to reduce your workload and develop your team',
            'Set clear boundaries between work and personal time'
          ]
        },
        {
          id: 'stress-management',
          title: 'Stress Management',
          icon: <Heart className="h-6 w-6" />,
          color: 'bg-red-50 dark:bg-red-950/30',
          headerColor: 'bg-red-100 dark:bg-red-900/50',
          items: [
            'Try the 4-7-8 breathing technique during stressful moments',
            'Take a 5-minute walk between meetings to reset your mind',
            'Use the Pomodoro technique for focused work sessions',
            'Practice saying "no" to non-essential commitments'
          ]
        },
        {
          id: 'team-support',
          title: 'Team Support',
          icon: <Users className="h-6 w-6" />,
          color: 'bg-green-50 dark:bg-green-950/30',
          headerColor: 'bg-green-100 dark:bg-green-900/50',
          items: [
            'Check in with team members about their workload and wellbeing',
            'Recognize and celebrate team achievements regularly',
            'Create psychological safety for open communication',
            'Provide growth opportunities and learning resources'
          ]
        },
        {
          id: 'personal-development',
          title: 'Personal Development',
          icon: <TrendingUp className="h-6 w-6" />,
          color: 'bg-purple-50 dark:bg-purple-950/30',
          headerColor: 'bg-purple-100 dark:bg-purple-900/50',
          items: [
            'Read leadership books for 15 minutes daily',
            'Join a leadership peer group or mastermind',
            'Seek feedback from your team and peers regularly',
            'Invest in executive coaching or mentoring'
          ]
        }
      ]);
    } else {
      // Employee categories
      setCategories([
        {
          id: 'stress-management',
          title: 'Stress Management',
          icon: <Heart className="h-6 w-6" />,
          color: 'bg-red-50 dark:bg-red-950/30',
          headerColor: 'bg-red-100 dark:bg-red-900/50',
          items: [
            'Try the 4-7-8 breathing technique during stressful moments',
            'Take a 5-minute walk between meetings to reset your mind',
            'Use the Pomodoro technique for focused work sessions',
            'Practice saying "no" to non-essential commitments'
          ]
        },
        {
          id: 'personal-wellness',
          title: 'Personal Wellness',
          icon: <Brain className="h-6 w-6" />,
          color: 'bg-blue-50 dark:bg-blue-950/30',
          headerColor: 'bg-blue-100 dark:bg-blue-900/50',
          items: [
            'Practice 5 minutes of mindfulness meditation daily',
            'Take regular breaks to stretch and move your body',
            'Stay hydrated and maintain regular meal times',
            'Get 7-9 hours of quality sleep each night'
          ]
        },
        {
          id: 'work-life-balance',
          title: 'Work-Life Balance',
          icon: <Zap className="h-6 w-6" />,
          color: 'bg-green-50 dark:bg-green-950/30',
          headerColor: 'bg-green-100 dark:bg-green-900/50',
          items: [
            'Set clear boundaries between work and personal time',
            'Schedule time for hobbies and activities you enjoy',
            'Disconnect from work emails after hours',
            'Plan regular time off to recharge and prevent burnout'
          ]
        },
        {
          id: 'self-care',
          title: 'Self-Care',
          icon: <Sparkles className="h-6 w-6" />,
          color: 'bg-purple-50 dark:bg-purple-950/30',
          headerColor: 'bg-purple-100 dark:bg-purple-900/50',
          items: [
            'Engage in activities that bring you joy and relaxation',
            'Connect with friends and family regularly',
            'Practice gratitude by writing down 3 things daily',
            'Seek support when needed from colleagues or professionals'
          ]
        }
      ]);
    }
  };

  const completeRecommendation = async (recommendationId: string) => {
    setCompletedRecommendations(prev => [...prev, recommendationId]);
    toast.success('Great job completing this recommendation!');
    
    // Here you would typically send completion data to the backend
    // and update user's wellness metrics
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'meditation': return <Brain className="h-6 w-6" />;
      case 'journaling': return <Target className="h-6 w-6" />;
      case 'breathing': return <Heart className="h-6 w-6" />;
      case 'exercise': return <Zap className="h-6 w-6" />;
      case 'sleep': return <Moon className="h-6 w-6" />;
      default: return <Sparkles className="h-6 w-6" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'meditation': return 'bg-purple-100 text-purple-600';
      case 'journaling': return 'bg-blue-100 text-blue-600';
      case 'breathing': return 'bg-green-100 text-green-600';
      case 'exercise': return 'bg-orange-100 text-orange-600';
      case 'sleep': return 'bg-indigo-100 text-indigo-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  useEffect(() => {
    if (user) {
      generateCategories([], user.role || 'employee');
      getRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-lime-600 to-emerald-600 mb-3 dark:from-green-400 dark:via-lime-400 dark:to-emerald-400">
          Wellness Recommendations
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Personalized wellness strategies to help you thrive. Based on your current state and best practices.
        </p>
      </motion.div>

      {/* Category Cards Grid - 2x2 Layout */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="h-full"
            >
              <Card className={`h-full ${category.color} border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300`}>
                {/* Header with Icon and Title */}
                <div className={`${category.headerColor} px-4 sm:px-6 py-4 rounded-t-lg flex items-center space-x-3`}>
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="text-gray-700 dark:text-gray-300">
                      {category.icon}
                    </div>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                    {category.title}
                  </h2>
                </div>

                {/* Content with Items */}
                <CardContent className="p-4 sm:p-6">
                  <ul className="space-y-3 sm:space-y-4">
                    {category.items.map((item, itemIndex) => (
                      <motion.li
                        key={itemIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + itemIndex * 0.05 }}
                        className="flex items-start space-x-3"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                          {item}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={getRecommendations}
          disabled={loading}
          variant="outline"
          className="border-2 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 px-6 py-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Recommendations
            </>
          )}
        </Button>
      </div>

      {/* Detailed Recommendations Section (Collapsible) */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <span>Detailed Activity Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.slice(0, 6).map((rec, index) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`h-full ${completedRecommendations.includes(rec.id) ? 'bg-green-50 border-green-200' : 'hover:shadow-lg'} transition-all duration-300`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className={`p-2 rounded-lg ${getRecommendationColor(rec.recommendation_type)}`}>
                            {getRecommendationIcon(rec.recommendation_type)}
                          </div>
                          <Badge className={getDifficultyColor(rec.difficulty_level)}>
                            {rec.difficulty_level}
                          </Badge>
                        </div>
                        <CardTitle className="text-base">{rec.title}</CardTitle>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-gray-500" />
                            <span>{rec.duration_minutes} min</span>
                          </div>
                        </div>

                        <Button
                          onClick={() => completeRecommendation(rec.id)}
                          disabled={completedRecommendations.includes(rec.id)}
                          size="sm"
                          className={`w-full text-xs ${
                            completedRecommendations.includes(rec.id)
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {completedRecommendations.includes(rec.id) ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3 mr-1" />
                              Start Activity
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
