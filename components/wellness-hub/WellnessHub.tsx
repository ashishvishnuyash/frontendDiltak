'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  AlertTriangle, Brain, Trophy, Users, Heart, Zap,
  Target, Sparkles, Star, TrendingUp, ArrowRight,
  CheckCircle, Clock, Flame
} from 'lucide-react';

import EscalationSupport from './EscalationSupport';
import AIRecommendations from './AIRecommendations';
import GamificationHub from './GamificationHub';
import CommunitySpaces from './CommunitySpaces';

interface WellnessHubProps {
  userRole: 'employee' | 'manager' | 'employer';
  userId?: string;
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: Heart },
  { id: 'escalation', label: 'Support', icon: AlertTriangle, roles: ['employee', 'manager'] },
  { id: 'ai-recommendations', label: 'AI Coach', icon: Brain },
  { id: 'gamification', label: 'Challenges', icon: Trophy },
  { id: 'community', label: 'Community', icon: Users, roles: ['employee', 'manager'] },
];

const quickActions = [
  {
    title: 'Escalate Concern',
    description: 'Report issues to HR or management',
    icon: AlertTriangle,
    color: 'bg-red-50 dark:bg-red-900/20',
    iconColor: 'text-red-500',
    tab: 'escalation',
    roles: ['employee', 'manager'],
  },
  {
    title: 'AI Wellness Coach',
    description: 'Get personalized recommendations',
    icon: Brain,
    color: 'bg-blue-50 dark:bg-blue-900/20',
    iconColor: 'text-blue-500',
    tab: 'ai-recommendations',
    roles: ['employee', 'manager', 'employer'],
  },
  {
    title: 'Wellness Challenges',
    description: 'Join gamified wellness activities',
    icon: Trophy,
    color: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconColor: 'text-emerald-500',
    tab: 'gamification',
    roles: ['employee', 'manager', 'employer'],
  },
  {
    title: 'Community Support',
    description: 'Connect with anonymous peer groups',
    icon: Users,
    color: 'bg-purple-50 dark:bg-purple-900/20',
    iconColor: 'text-purple-500',
    tab: 'community',
    roles: ['employee', 'manager'],
  },
];

const recentActivity = [
  { action: 'Completed morning meditation', time: '2 hours ago', icon: Brain, dot: 'bg-purple-400' },
  { action: 'Joined "Mindful Breaks" challenge', time: '1 day ago', icon: Trophy, dot: 'bg-yellow-400' },
  { action: 'Shared in community space', time: '2 days ago', icon: Users, dot: 'bg-blue-400' },
  { action: 'AI wellness check-in completed', time: '3 days ago', icon: Heart, dot: 'bg-pink-400' },
];

export default function WellnessHub({ userRole, userId }: WellnessHubProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const visibleTabs = tabs.filter(t => !t.roles || t.roles.includes(userRole));
  const visibleActions = quickActions.filter(a => a.roles.includes(userRole));

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 bg-[#f0faf7] dark:bg-gray-950 min-h-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Wellness Hub</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 ml-9">Your personalized space for mental wellness and growth</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
            <Heart className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">85<span className="text-base font-medium text-gray-400">%</span></p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Wellness Score</p>
            <div className="flex items-center gap-1 mt-0.5">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="text-[11px] text-emerald-600 font-medium">Great progress</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
            <Flame className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">7<span className="text-base font-medium text-gray-400 ml-1">days</span></p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Current Streak</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="h-3 w-3 text-orange-400 fill-orange-400" />
              <span className="text-[11px] text-orange-600 font-medium">Daily check-ins</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
            <Trophy className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">3<span className="text-base font-medium text-gray-400 ml-1">active</span></p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Challenges</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Target className="h-3 w-3 text-purple-500" />
              <span className="text-[11px] text-purple-600 font-medium">Wellness joined</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-1 mb-6 overflow-x-auto">
        {visibleTabs.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                active
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {visibleActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={i}
                  onClick={() => setActiveTab(action.tab)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 text-left hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center mb-3`}>
                    <Icon className={`h-5 w-5 ${action.iconColor}`} />
                  </div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{action.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{action.description}</p>
                  <div className="flex items-center gap-1 mt-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[11px] font-medium">Open</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Recent Activity</h2>
              </div>
              <span className="text-xs text-gray-400">Your wellness journey</span>
            </div>
            <div className="space-y-3">
              {recentActivity.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.dot}`} />
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-200 font-medium truncate">{item.action}</p>
                      <p className="text-xs text-gray-400">{item.time}</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Wellness Tips */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-5 text-white">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1">Daily Wellness Tip</p>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  Take a 5-minute mindful break every 90 minutes. Step away from your screen, breathe deeply, and reset your focus.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('ai-recommendations')}
                className="flex-shrink-0 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors"
              >
                More tips
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'escalation' && userRole !== 'employer' && (
        <EscalationSupport userRole={userRole} userId={userId} />
      )}
      {activeTab === 'ai-recommendations' && (
        <AIRecommendations userRole={userRole} userId={userId} />
      )}
      {activeTab === 'gamification' && (
        <GamificationHub userRole={userRole} userId={userId} />
      )}
      {activeTab === 'community' && userRole !== 'employer' && (
        <CommunitySpaces userRole={userRole} userId={userId} />
      )}
    </div>
  );
}
