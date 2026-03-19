'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Lightbulb, Target, TrendingUp, Clock, Star } from 'lucide-react';

interface AIRecommendationsProps {
  userRole: 'employee' | 'manager' | 'employer';
  userId?: string;
}

interface Recommendation {
  id: string;
  type: 'wellness' | 'productivity' | 'stress' | 'social';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: string;
  completed: boolean;
}

export default function AIRecommendations({ userRole, userId }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: '1',
      type: 'wellness',
      title: 'Take a 5-minute breathing break',
      description: 'Your stress levels seem elevated today. A short breathing exercise can help reset your focus.',
      priority: 'high',
      estimatedTime: '5 min',
      completed: false
    },
    {
      id: '2',
      type: 'productivity',
      title: 'Schedule focused work blocks',
      description: 'Based on your calendar, try blocking 2-hour periods for deep work without meetings.',
      priority: 'medium',
      estimatedTime: '2 min setup',
      completed: false
    },
    {
      id: '3',
      type: 'social',
      title: 'Connect with a colleague',
      description: 'You haven\'t had informal interactions lately. Consider grabbing coffee with a teammate.',
      priority: 'low',
      estimatedTime: '15-30 min',
      completed: false
    },
    {
      id: '4',
      type: 'wellness',
      title: 'Try guided meditation',
      description: 'Based on your mood patterns, a 10-minute meditation session could improve your focus.',
      priority: 'medium',
      estimatedTime: '10 min',
      completed: false
    },
    {
      id: '5',
      type: 'stress',
      title: 'Practice progressive muscle relaxation',
      description: 'Your stress indicators suggest physical tension. This technique can help release muscle stress.',
      priority: 'high',
      estimatedTime: '15 min',
      completed: false
    }
  ]);

  const [insights, setInsights] = useState({
    wellnessScore: 78,
    stressLevel: 'moderate',
    productivityTrend: 'improving',
    socialEngagement: 'low'
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'wellness': return Brain;
      case 'productivity': return Target;
      case 'stress': return Clock;
      case 'social': return Star;
      default: return Lightbulb;
    }
  };

  const handleCompleteRecommendation = (id: string) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === id ? { ...rec, completed: true } : rec
      )
    );
  };

  return (
    <div className="space-y-8">
      {/* Enhanced AI Insights Dashboard */}
      <Card className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl border-0 overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
        
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Brain className="h-8 w-8 drop-shadow-lg" />
            </motion.div>
            AI Wellness Insights
          </CardTitle>
          <p className="text-indigo-100 text-lg">Your personalized wellness analytics powered by AI</p>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="text-4xl font-bold mb-2"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {insights.wellnessScore}%
              </motion.div>
              <div className="text-sm opacity-90 font-medium">Wellness Score</div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                <motion.div 
                  className="bg-white h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${insights.wellnessScore}%` }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
              </div>
            </motion.div>
            
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-4xl font-bold mb-2 capitalize">{insights.stressLevel}</div>
              <div className="text-sm opacity-90 font-medium">Stress Level</div>
              <div className="flex justify-center mt-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <motion.div
                    key={level}
                    className={`w-2 h-6 mx-0.5 rounded ${
                      level <= (insights.stressLevel === 'low' ? 2 : insights.stressLevel === 'moderate' ? 3 : 4)
                        ? 'bg-white' 
                        : 'bg-white/30'
                    }`}
                    initial={{ height: 0 }}
                    animate={{ height: 24 }}
                    transition={{ delay: level * 0.1 }}
                  />
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <TrendingUp className="h-6 w-6" />
                </motion.div>
                <span className="capitalize">{insights.productivityTrend}</span>
              </div>
              <div className="text-sm opacity-90 font-medium">Productivity</div>
            </motion.div>
            
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-4xl font-bold mb-2 capitalize">{insights.socialEngagement}</div>
              <div className="text-sm opacity-90 font-medium">Social Engagement</div>
              <div className="flex justify-center mt-2 gap-1">
                {[1, 2, 3].map((dot) => (
                  <motion.div
                    key={dot}
                    className={`w-3 h-3 rounded-full ${
                      insights.socialEngagement === 'high' ? 'bg-white' :
                      insights.socialEngagement === 'medium' && dot <= 2 ? 'bg-white' :
                      insights.socialEngagement === 'low' && dot === 1 ? 'bg-white' :
                      'bg-white/30'
                    }`}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ delay: dot * 0.2, duration: 1, repeat: Infinity }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Personalized Recommendations */}
      <Card className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-800/90 dark:to-gray-700/90 backdrop-blur-md border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Lightbulb className="h-7 w-7 text-yellow-500" />
            </motion.div>
            Personalized Recommendations
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            AI-powered suggestions tailored to your wellness journey
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {recommendations.map((rec, index) => {
              const IconComponent = getTypeIcon(rec.type);
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -30, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className={`group border-0 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${
                    rec.completed 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700' 
                      : 'bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <motion.div 
                        className={`p-3 rounded-2xl shadow-lg ${
                          rec.completed 
                            ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                            : 'bg-gradient-to-br from-blue-400 to-indigo-500'
                        }`}
                        whileHover={{ 
                          rotate: [0, -10, 10, 0],
                          scale: 1.1
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <IconComponent className="h-6 w-6 text-white" />
                      </motion.div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <h3 className={`font-bold text-lg ${
                            rec.completed 
                              ? 'line-through text-gray-500 dark:text-gray-400' 
                              : 'text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                          }`}>
                            {rec.title}
                          </h3>
                          
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Badge className={`${getPriorityColor(rec.priority)} px-3 py-1 font-semibold`}>
                              {rec.priority === 'high' ? '🔥' : rec.priority === 'medium' ? '⚡' : '🌱'} {rec.priority}
                            </Badge>
                          </motion.div>
                          
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <Badge variant="outline" className="px-3 py-1 font-medium bg-white/50 dark:bg-gray-700/50">
                              ⏱️ {rec.estimatedTime}
                            </Badge>
                          </motion.div>
                        </div>
                        
                        <p className={`text-base leading-relaxed ${
                          rec.completed 
                            ? 'text-gray-400 dark:text-gray-500' 
                            : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {rec.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {!rec.completed ? (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button 
                            size="sm"
                            onClick={() => handleCompleteRecommendation(rec.id)}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            ✨ Complete
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 text-sm font-bold shadow-lg">
                            ✅ Completed!
                          </Badge>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Weekly Goals */}
      <Card className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-800/90 dark:to-gray-700/90 backdrop-blur-md border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Target className="h-7 w-7 text-indigo-600" />
            </motion.div>
            This Week's Focus Areas
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Track your progress towards weekly wellness goals
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200 dark:border-blue-700"
              whileHover={{ scale: 1.02, y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🧘‍♀️
                </motion.div>
                <h4 className="font-bold text-xl text-blue-900 dark:text-blue-100">Stress Management</h4>
              </div>
              <p className="text-blue-700 dark:text-blue-300 mb-4 leading-relaxed">
                Practice daily mindfulness and take regular breaks
              </p>
              <div className="mt-3 bg-blue-200 dark:bg-blue-800 rounded-full h-3 overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full shadow-sm"
                  initial={{ width: 0 }}
                  animate={{ width: '60%' }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 font-semibold">
                🎯 60% complete
              </p>
            </motion.div>

            <motion.div 
              className="group p-6 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-200 dark:border-green-700"
              whileHover={{ scale: 1.02, y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  ⚖️
                </motion.div>
                <h4 className="font-bold text-xl text-green-900 dark:text-green-100">Work-Life Balance</h4>
              </div>
              <p className="text-green-700 dark:text-green-300 mb-4 leading-relaxed">
                Maintain boundaries and prioritize personal time
              </p>
              <div className="mt-3 bg-green-200 dark:bg-green-800 rounded-full h-3 overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full shadow-sm"
                  initial={{ width: 0 }}
                  animate={{ width: '80%' }}
                  transition={{ duration: 1.5, delay: 0.7 }}
                />
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-semibold">
                🌟 80% complete
              </p>
            </motion.div>

            <motion.div 
              className="group p-6 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-200 dark:border-purple-700"
              whileHover={{ scale: 1.02, y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🤝
                </motion.div>
                <h4 className="font-bold text-xl text-purple-900 dark:text-purple-100">Team Connection</h4>
              </div>
              <p className="text-purple-700 dark:text-purple-300 mb-4 leading-relaxed">
                Engage more with colleagues and build relationships
              </p>
              <div className="mt-3 bg-purple-200 dark:bg-purple-800 rounded-full h-3 overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full shadow-sm"
                  initial={{ width: 0 }}
                  animate={{ width: '40%' }}
                  transition={{ duration: 1.5, delay: 0.9 }}
                />
              </div>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-2 font-semibold">
                💪 40% complete
              </p>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}