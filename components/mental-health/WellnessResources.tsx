'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { 
  BookOpen, 
  Play, 
  Headphones, 
  Calendar,
  Users,
  Brain,
  Heart,
  Shield,
  Zap,
  Target,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Clock,
  Star
} from 'lucide-react';

const WellnessResources = () => {
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
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const resources = [
    {
      category: "Mindfulness & Meditation",
      icon: Brain,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
      items: [
        {
          title: "Guided Meditation Sessions",
          description: "Expert-led meditations for stress relief and mindfulness",
          duration: "10-30 min",
          type: "Audio",
          icon: Headphones,
          rating: 4.9
        },
        {
          title: "Breathing Exercises",
          description: "Simple techniques to calm your mind and body",
          duration: "5-15 min",
          type: "Interactive",
          icon: Zap,
          rating: 4.8
        },
        {
          title: "Sleep Stories",
          description: "Soothing narratives to help you fall asleep peacefully",
          duration: "20-45 min",
          type: "Audio",
          icon: Play,
          rating: 4.9
        }
      ]
    },
    {
      category: "Therapy & Counseling",
      icon: Heart,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
      items: [
        {
          title: "CBT Techniques",
          description: "Cognitive Behavioral Therapy tools for positive change",
          duration: "15-30 min",
          type: "Interactive",
          icon: Target,
          rating: 4.9
        },
        {
          title: "Crisis Support",
          description: "24/7 immediate help for mental health emergencies",
          duration: "Available Now",
          type: "Live Chat",
          icon: Shield,
          rating: 5.0
        },
        {
          title: "Group Therapy Sessions",
          description: "Connect with others on similar mental health journeys",
          duration: "60 min",
          type: "Video Call",
          icon: Users,
          rating: 4.8
        }
      ]
    },
    {
      category: "Wellness & Lifestyle",
      icon: TrendingUp,
      color: "from-teal-500 to-cyan-500",
      bgColor: "from-teal-50 to-cyan-50",
      items: [
        {
          title: "Mood Tracking",
          description: "Monitor your emotional patterns and triggers",
          duration: "2-5 min",
          type: "Daily Check-in",
          icon: Brain,
          rating: 4.7
        },
        {
          title: "Wellness Challenges",
          description: "30-day programs for building healthy habits",
          duration: "30 days",
          type: "Program",
          icon: Target,
          rating: 4.8
        },
        {
          title: "Stress Management",
          description: "Comprehensive tools for managing daily stress",
          duration: "10-20 min",
          type: "Interactive",
          icon: Zap,
          rating: 4.9
        }
      ]
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <motion.section 
      className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-gray-900 transition-colors duration-300"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logos Image */}
        

        {/* Header */}
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          variants={itemVariants as any}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
            Comprehensive Wellness Resources
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Access a complete library of mental health tools, guided sessions, and expert resources 
            designed to support your wellness journey.
          </p>
        </motion.div>

        {/* Resources by Category */}
        <div className="space-y-12 sm:space-y-16">
          {resources.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              variants={itemVariants as any}
              className="space-y-6 sm:space-y-8"
            >
              {/* Category Header */}
              <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${category.color} rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <category.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{category.category}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Expert-curated resources for your wellness</p>
                </div>
              </div>

              {/* Resource Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {category.items.map((item, itemIndex) => (
                  <motion.div
                    key={itemIndex}
                    variants={itemVariants as any}
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                    className="group"
                  >
                    <Card className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
                      <CardHeader className="pb-3 sm:pb-4">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${category.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                          <div className="flex items-center space-x-1">
                            {renderStars(item.rating)}
                            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 ml-1">{item.rating}</span>
                          </div>
                        </div>
                        <CardTitle className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                          {item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 sm:space-y-4">
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                          {item.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{item.duration}</span>
                          </div>
                          <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">
                            {item.type}
                          </div>
                        </div>

                        <Link href="/demo" className="block">
                          <Button 
                            className="w-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 text-gray-700 dark:text-gray-300 border-0 group-hover:from-green-500 group-hover:to-emerald-500 group-hover:text-white transition-all duration-300 text-sm sm:text-base py-2 sm:py-3"
                            variant="outline"
                          >
                            Start Now
                            <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Featured Programs */}
        <motion.div 
          className="mt-16 sm:mt-20"
          variants={itemVariants as any}
        >
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Featured Wellness Programs</h3>
              <p className="text-green-100 max-w-2xl mx-auto text-sm sm:text-base">
                Join our most popular programs designed by mental health experts
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[
                {
                  title: "30-Day Mindfulness Challenge",
                  description: "Build a daily meditation practice",
                  duration: "30 days"
                },
                {
                  title: "Stress Management Masterclass",
                  description: "Learn proven techniques to manage stress",
                  duration: "2 weeks"
                },
                {
                  title: "Sleep Better Program",
                  description: "Improve your sleep quality naturally",
                  duration: "21 days"
                }
              ].map((program, index) => (
                <motion.div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:bg-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className="text-lg sm:text-xl font-bold mb-2">{program.title}</h4>
                  <p className="text-green-100 mb-3 sm:mb-4 text-sm sm:text-base">{program.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-200">{program.duration}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-6 sm:mt-8">
              <Link href="/demo" className="inline-block w-full sm:w-auto">
                <Button 
                  size="lg"
                  className="w-full sm:w-auto bg-white text-green-600 hover:bg-gray-100 px-6 sm:px-8 py-3 font-semibold text-sm sm:text-base"
                >
                  Explore All Programs
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default WellnessResources;
