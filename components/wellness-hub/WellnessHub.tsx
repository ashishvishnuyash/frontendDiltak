'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertTriangle,
    Brain,
    Trophy,
    Users,
    Heart,
    Zap,
    Target,
    ArrowLeft,
    Sparkles,
    Star,
    TrendingUp
} from 'lucide-react';

// Import feature components
import EscalationSupport from './EscalationSupport';
import AIRecommendations from './AIRecommendations';
import GamificationHub from './GamificationHub';
import CommunitySpaces from './CommunitySpaces';

interface WellnessHubProps {
    userRole: 'employee' | 'manager' | 'employer';
    userId?: string;
}

const WellnessHub = ({ userRole, userId }: WellnessHubProps) => {
    const [activeTab, setActiveTab] = useState('overview');
    const router = useRouter();

    const getDashboardPath = () => {
        switch (userRole) {
            case 'employee': return '/employee/dashboard';
            case 'manager': return '/manager';
            case 'employer': return '/employer/dashboard';
            default: return '/';
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 }
        }
    };

    const quickActions = [
        {
            title: 'Escalate Concern',
            description: 'Report issues to HR or management',
            icon: AlertTriangle,
            color: 'from-red-500 to-orange-500',
            action: () => setActiveTab('escalation'),
            available: ['employee', 'manager']
        },
        {
            title: 'AI Wellness Coach',
            description: 'Get personalized recommendations',
            icon: Brain,
            color: 'from-blue-500 to-cyan-500',
            action: () => setActiveTab('ai-recommendations'),
            available: ['employee', 'manager', 'employer']
        },
        {
            title: 'Wellness Challenges',
            description: 'Join gamified wellness activities',
            icon: Trophy,
            color: 'from-green-500 to-emerald-500',
            action: () => setActiveTab('gamification'),
            available: ['employee', 'manager', 'employer']
        },
        {
            title: 'Community Support',
            description: 'Connect with anonymous peer groups',
            icon: Users,
            color: 'from-purple-500 to-pink-500',
            action: () => setActiveTab('community'),
            available: ['employee', 'manager']
        }
    ];

    const filteredActions = quickActions.filter(action =>
        action.available.includes(userRole)
    );

    return (
        <motion.div
            className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-25 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 relative overflow-hidden"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-xl"
                    animate={{
                        x: [0, -80, 0],
                        y: [0, 60, 0],
                        scale: [1, 0.8, 1],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                />
                <motion.div
                    className="absolute bottom-20 left-1/3 w-20 h-20 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-xl"
                    animate={{
                        x: [0, 60, 0],
                        y: [0, -40, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 4
                    }}
                />
            </div>

            <div className="max-w-7xl mx-auto p-4 sm:p-6 relative z-10">
                {/* Back Navigation */}
                <motion.div
                    className="mb-6 sm:mb-8"
                    variants={itemVariants}
                >
                    <Button
                        variant="ghost"
                        onClick={() => router.push(getDashboardPath())}
                        className="group text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 sm:p-3 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 backdrop-blur-sm transition-all duration-300 text-sm sm:text-base"
                    >
                        <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span className="hidden sm:inline">Back to Dashboard</span>
                        <span className="sm:hidden">Back</span>
                    </Button>
                </motion.div>

                {/* Enhanced Header */}
                <motion.div
                    className="text-center mb-8 sm:mb-12"
                    variants={itemVariants}
                >
                    <motion.div
                        className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full mb-4 sm:mb-6"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xs sm:text-sm font-medium text-indigo-700 dark:text-indigo-300">
                            Welcome to your wellness journey
                        </span>
                    </motion.div>

                    <motion.h1
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <span className="text-gray-900 dark:text-gray-100">Wellness</span>
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-pulse">
                            Sanctuary
                        </span>
                    </motion.h1>

                    <motion.p
                        className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        Your personalized space for mental wellness, community support, and growth.
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium"> Let's thrive together! </span>
                    </motion.p>
                </motion.div>

                {/* Enhanced Quick Actions Grid */}
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12"
                    variants={itemVariants}
                >
                    {filteredActions.map((action, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{
                                scale: 1.05,
                                rotate: [0, -1, 1, 0],
                                transition: { duration: 0.3 }
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Card
                                className="group cursor-pointer bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-2xl sm:rounded-3xl overflow-hidden relative"
                                onClick={action.action}
                            >
                                {/* Animated border gradient */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl sm:rounded-3xl" />

                                <CardContent className="p-4 sm:p-6 lg:p-8 text-center relative z-10">
                                    <motion.div
                                        className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br ${action.color} rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                                        whileHover={{
                                            rotate: [0, -10, 10, 0],
                                            scale: 1.1
                                        }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <action.icon className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white drop-shadow-sm" />
                                    </motion.div>

                                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                                        {action.title}
                                    </h3>

                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                                        {action.description}
                                    </p>

                                    {/* Hover indicator */}
                                    <motion.div
                                        className="mt-3 sm:mt-4 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto group-hover:w-full transition-all duration-300"
                                    />
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Enhanced Main Content Tabs */}
                <motion.div variants={itemVariants}>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="flex justify-center mb-8 sm:mb-10 overflow-x-auto">
                            <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-1 sm:p-2 rounded-xl sm:rounded-2xl shadow-xl border-0 grid grid-cols-2 lg:grid-cols-5 gap-1 sm:gap-2 min-w-max">
                                <TabsTrigger
                                    value="overview"
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg sm:rounded-xl px-3 sm:px-4 lg:px-6 py-2 sm:py-3 font-medium transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
                                >
                                    <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    <span className="hidden sm:inline">Overview</span>
                                    <span className="sm:hidden">Home</span>
                                </TabsTrigger>
                                {userRole !== 'employer' && (
                                    <TabsTrigger
                                        value="escalation"
                                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg sm:rounded-xl px-3 sm:px-4 lg:px-6 py-2 sm:py-3 font-medium transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
                                    >
                                        <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                        <span className="hidden sm:inline">Support</span>
                                        <span className="sm:hidden">Help</span>
                                    </TabsTrigger>
                                )}
                                <TabsTrigger
                                    value="ai-recommendations"
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg sm:rounded-xl px-3 sm:px-4 lg:px-6 py-2 sm:py-3 font-medium transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
                                >
                                    <Brain className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    <span className="hidden sm:inline">AI Coach</span>
                                    <span className="sm:hidden">AI</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="gamification"
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg sm:rounded-xl px-3 sm:px-4 lg:px-6 py-2 sm:py-3 font-medium transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
                                >
                                    <Trophy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                    <span className="hidden sm:inline">Challenges</span>
                                    <span className="sm:hidden">Games</span>
                                </TabsTrigger>
                                {userRole !== 'employer' && (
                                    <TabsTrigger
                                        value="community"
                                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg sm:rounded-xl px-3 sm:px-4 lg:px-6 py-2 sm:py-3 font-medium transition-all duration-300 hover:scale-105 text-xs sm:text-sm"
                                    >
                                        <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                        <span className="hidden sm:inline">Community</span>
                                        <span className="sm:hidden">Social</span>
                                    </TabsTrigger>
                                )}
                            </TabsList>
                        </div>

                        <TabsContent value="overview" className="space-y-6 sm:space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                                {/* Enhanced Wellness Score */}
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <Card className="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 text-white shadow-2xl border-0 overflow-hidden relative">
                                        <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-white/10 rounded-full -translate-y-10 translate-x-10 sm:-translate-y-16 sm:translate-x-16" />
                                        <CardHeader className="relative z-10 pb-2 sm:pb-4">
                                            <CardTitle className="flex items-center space-x-2 sm:space-x-3">
                                                <motion.div
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                >
                                                    <Heart className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 drop-shadow-sm" />
                                                </motion.div>
                                                <span className="text-base sm:text-lg">Wellness Score</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="relative z-10 pt-0">
                                            <div className="flex items-baseline space-x-1 sm:space-x-2 mb-2 sm:mb-3">
                                                <span className="text-3xl sm:text-4xl lg:text-5xl font-bold">85</span>
                                                <span className="text-lg sm:text-xl lg:text-2xl opacity-90">%</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                                                <p className="text-green-100 font-medium text-xs sm:text-sm">Great progress this week!</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Enhanced Current Streak */}
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <Card className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white shadow-2xl border-0 overflow-hidden relative">
                                        <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full translate-y-8 -translate-x-8 sm:translate-y-12 sm:-translate-x-12" />
                                        <CardHeader className="relative z-10 pb-2 sm:pb-4">
                                            <CardTitle className="flex items-center space-x-2 sm:space-x-3">
                                                <motion.div
                                                    animate={{ rotate: [0, 360] }}
                                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                >
                                                    <Zap className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 drop-shadow-sm" />
                                                </motion.div>
                                                <span className="text-base sm:text-lg">Current Streak</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="relative z-10 pt-0">
                                            <div className="flex items-baseline space-x-1 sm:space-x-2 mb-2 sm:mb-3">
                                                <span className="text-3xl sm:text-4xl lg:text-5xl font-bold">7</span>
                                                <span className="text-lg sm:text-xl opacity-90">days</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                                                <p className="text-blue-100 font-medium text-xs sm:text-sm">Daily check-ins completed</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                {/* Enhanced Active Challenges */}
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="sm:col-span-2 lg:col-span-1"
                                >
                                    <Card className="bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 text-white shadow-2xl border-0 overflow-hidden relative">
                                        <div className="absolute top-0 left-1/2 w-12 h-12 sm:w-20 sm:h-20 bg-white/10 rounded-full -translate-y-6 -translate-x-6 sm:-translate-y-10 sm:-translate-x-10" />
                                        <CardHeader className="relative z-10 pb-2 sm:pb-4">
                                            <CardTitle className="flex items-center space-x-2 sm:space-x-3">
                                                <motion.div
                                                    animate={{ y: [0, -5, 0] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                >
                                                    <Trophy className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 drop-shadow-sm" />
                                                </motion.div>
                                                <span className="text-base sm:text-lg">Active Challenges</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="relative z-10 pt-0">
                                            <div className="flex items-baseline space-x-1 sm:space-x-2 mb-2 sm:mb-3">
                                                <span className="text-3xl sm:text-4xl lg:text-5xl font-bold">3</span>
                                                <span className="text-lg sm:text-xl opacity-90">active</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                                                <p className="text-pink-100 font-medium text-xs sm:text-sm">Wellness challenges joined</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>

                            {/* Enhanced Recent Activity */}
                            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border-0 shadow-xl">
                                <CardHeader className="pb-3 sm:pb-6">
                                    <CardTitle className="flex items-center space-x-2 sm:space-x-3 text-lg sm:text-xl lg:text-2xl">
                                        <motion.div
                                            animate={{ rotate: [0, 10, -10, 0] }}
                                            transition={{ duration: 4, repeat: Infinity }}
                                        >
                                            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                                        </motion.div>
                                        <span>Recent Activity</span>
                                    </CardTitle>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Your wellness journey highlights</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 sm:space-y-4">
                                        {[
                                            { action: 'Completed morning meditation', time: '2 hours ago', icon: Brain, color: 'from-purple-500 to-indigo-500' },
                                            { action: 'Joined "Mindful Breaks" challenge', time: '1 day ago', icon: Trophy, color: 'from-yellow-500 to-orange-500' },
                                            { action: 'Shared in community space', time: '2 days ago', icon: Users, color: 'from-blue-500 to-cyan-500' },
                                            { action: 'AI wellness check-in completed', time: '3 days ago', icon: Heart, color: 'from-pink-500 to-rose-500' }
                                        ].map((activity, index) => (
                                            <motion.div
                                                key={index}
                                                className="group flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gradient-to-r from-white/50 to-gray-50/50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl sm:rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                whileHover={{ scale: 1.02, x: 5 }}
                                            >
                                                <motion.div
                                                    className={`p-2 sm:p-3 bg-gradient-to-br ${activity.color} rounded-lg sm:rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                                                    whileHover={{ rotate: [0, -5, 5, 0] }}
                                                    transition={{ duration: 0.5 }}
                                                >
                                                    <activity.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                                                </motion.div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 truncate">
                                                        {activity.action}
                                                    </p>
                                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                        {activity.time}
                                                    </p>
                                                </div>
                                                <motion.div
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block"
                                                    whileHover={{ x: 5 }}
                                                >
                                                    <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                                                </motion.div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {userRole !== 'employer' && (
                            <TabsContent value="escalation">
                                <EscalationSupport userRole={userRole} userId={userId} />
                            </TabsContent>
                        )}

                        <TabsContent value="ai-recommendations">
                            <AIRecommendations userRole={userRole} userId={userId} />
                        </TabsContent>

                        <TabsContent value="gamification">
                            <GamificationHub userRole={userRole} userId={userId} />
                        </TabsContent>

                        {userRole !== 'employer' && (
                            <TabsContent value="community">
                                <CommunitySpaces userRole={userRole} userId={userId} />
                            </TabsContent>
                        )}
                    </Tabs>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default WellnessHub;