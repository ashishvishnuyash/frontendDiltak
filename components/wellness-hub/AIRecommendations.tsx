'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Lightbulb, Target, TrendingUp, Clock, Star, CheckCircle, Circle } from 'lucide-react';

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

const priorityConfig = {
  high:   { label: 'High',   dot: 'bg-red-400',    text: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-900/20' },
  medium: { label: 'Medium', dot: 'bg-yellow-400',  text: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  low:    { label: 'Low',    dot: 'bg-green-400',   text: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20' },
};

const typeIcon = { wellness: Brain, productivity: Target, stress: Clock, social: Star };

export default function AIRecommendations({ userRole, userId }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    { id: '1', type: 'wellness',      title: 'Take a 5-minute breathing break',    description: 'Your stress levels seem elevated. A short breathing exercise can help reset your focus.',          priority: 'high',   estimatedTime: '5 min',      completed: false },
    { id: '2', type: 'productivity',  title: 'Schedule focused work blocks',        description: 'Based on your calendar, try blocking 2-hour periods for deep work without meetings.',              priority: 'medium', estimatedTime: '2 min setup', completed: false },
    { id: '3', type: 'social',        title: 'Connect with a colleague',            description: "You haven't had informal interactions lately. Consider grabbing coffee with a teammate.",           priority: 'low',    estimatedTime: '15–30 min',  completed: false },
    { id: '4', type: 'wellness',      title: 'Try guided meditation',               description: 'Based on your mood patterns, a 10-minute meditation session could improve your focus.',            priority: 'medium', estimatedTime: '10 min',     completed: false },
    { id: '5', type: 'stress',        title: 'Progressive muscle relaxation',       description: 'Your stress indicators suggest physical tension. This technique can help release muscle stress.',   priority: 'high',   estimatedTime: '15 min',     completed: false },
  ]);

  const insights = { wellnessScore: 78, stressLevel: 'Moderate', productivityTrend: 'Improving', socialEngagement: 'Low' };

  const toggle = (id: string) =>
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));

  return (
    <div className="space-y-5">
      {/* Insight strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Wellness Score',    value: `${insights.wellnessScore}%`, icon: Brain,       color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Stress Level',      value: insights.stressLevel,         icon: Clock,       color: 'text-yellow-500',  bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
          { label: 'Productivity',      value: insights.productivityTrend,   icon: TrendingUp,  color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Social',            value: insights.socialEngagement,    icon: Star,        color: 'text-purple-500',  bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{item.value}</p>
                <p className="text-[11px] text-gray-400">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendations */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Personalized Recommendations</h2>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {recommendations.map((rec, i) => {
            const Icon = typeIcon[rec.type];
            const p = priorityConfig[rec.priority];
            return (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-start gap-3 px-4 py-3 transition-colors ${rec.completed ? 'opacity-50' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
              >
                <button onClick={() => toggle(rec.id)} className="mt-0.5 flex-shrink-0">
                  {rec.completed
                    ? <CheckCircle className="h-5 w-5 text-emerald-500" />
                    : <Circle className="h-5 w-5 text-gray-300 dark:text-gray-600" />}
                </button>
                <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-medium ${rec.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>{rec.title}</p>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${p.bg} ${p.text}`}>{p.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{rec.description}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-[11px] text-gray-400">{rec.estimatedTime}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Weekly Focus */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="h-5 w-5 text-indigo-500" />
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">This Week's Focus</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Stress Management',  pct: 60, color: 'bg-blue-400',   emoji: '🧘' },
            { label: 'Work-Life Balance',  pct: 80, color: 'bg-emerald-400', emoji: '⚖️' },
            { label: 'Team Connection',    pct: 40, color: 'bg-purple-400',  emoji: '🤝' },
          ].map((g, i) => (
            <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{g.emoji}</span>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-200">{g.label}</p>
              </div>
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${g.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${g.pct}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">{g.pct}% complete</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
