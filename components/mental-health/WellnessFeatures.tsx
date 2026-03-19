'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { 
  Brain, 
  Heart, 
  Shield, 
  Users, 
  Clock, 
  Smartphone,
  MessageSquare,
  Activity,
  Zap,
  Target,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

const WellnessFeatures = () => {
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

  // Unique features with varied presentation
  const mainFeatures = [
    {
      icon: Brain,
      title: "AI Mental Health Assistant",
      description: "24/7 emotional support with advanced AI that understands your needs",
      features: ["Instant Support", "Mood Analysis", "Personalized Insights"]
    },
    {
      icon: Users,
      title: "Expert Professionals",
      description: "Connect with certified psychologists, psychiatrists, and wellness experts",
      features: ["Licensed Therapists", "Video Consultations", "Follow-up Care"]
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Platform with end-to-end encryption for complete confidentiality",
      features: ["Secure Storage", "Anonymous Support", "End-to-end Encryption"]
    }
  ];

  const secondaryFeatures = [
    {
      icon: Activity,
      title: "Wellness Tracking",
      description: "Monitor your mental health journey with comprehensive analytics and insights",
      features: ["Progress Tracking", "Mood Charts", "Goal Setting"]
    },
    {
      icon: MessageSquare,
      title: "Therapeutic Conversations",
      description: "Engage in meaningful conversations that help you process emotions and thoughts",
      features: ["CBT Techniques", "Mindfulness", "Coping Strategies"]
    },
    {
      icon: Target,
      title: "Personalized Care Plans",
      description: "Get customized treatment plans based on your unique needs and goals",
      features: ["Custom Plans", "Goal Setting", "Progress Monitoring"]
    }
  ];

  return (
    <motion.section 
      className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white dark:bg-gray-900 transition-colors duration-300"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          variants={itemVariants}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
            Comprehensive Mental Health
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              & Wellness Solutions
            </span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            From AI-powered support to expert consultations, we provide everything you need 
            for your mental health and wellness journey.
          </p>
        </motion.div>

        {/* Unique Asymmetric Layout */}
        <div className="space-y-8">
          {/* Top 3 Main Features - Varied Sizes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="group"
              >
                <div className={`relative h-full p-6 rounded-3xl bg-gradient-to-br ${
                  index === 0 ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' :
                  index === 1 ? 'from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20' :
                  'from-lime-50 to-green-50 dark:from-lime-900/20 dark:to-green-900/20'
                } border-2 ${
                  index === 0 ? 'border-green-200 dark:border-green-800' :
                  index === 1 ? 'border-teal-200 dark:border-teal-800' :
                  'border-lime-200 dark:border-lime-800'
                } hover:shadow-2xl transition-all duration-300 overflow-hidden`}>
                  
                  {/* Decorative blob */}
                  <div className={`absolute -top-10 -right-10 w-32 h-32 ${
                    index === 0 ? 'bg-green-200/30' :
                    index === 1 ? 'bg-teal-200/30' :
                    'bg-lime-200/30'
                  } dark:bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
                  
                  <div className="relative">
                    <div className={`inline-flex p-4 rounded-2xl ${
                      index === 0 ? 'bg-green-500' :
                      index === 1 ? 'bg-teal-500' :
                      'bg-lime-500'
                    } mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                      {feature.description}
                    </p>
                    
                    <div className="space-y-2">
                      {feature.features.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            index === 0 ? 'bg-green-500' :
                            index === 1 ? 'bg-teal-500' :
                            'bg-lime-500'
                          }`} />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom 3 Secondary Features - Horizontal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {secondaryFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.03 }}
                className="group"
              >
                <div className="relative p-5 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 p-3 rounded-xl ${
                      index === 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                      index === 1 ? 'bg-teal-100 dark:bg-teal-900/30' :
                      'bg-green-100 dark:bg-green-900/30'
                    }`}>
                      <feature.icon className={`h-6 w-6 ${
                        index === 0 ? 'text-emerald-600' :
                        index === 1 ? 'text-teal-600' :
                        'text-green-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {feature.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {feature.features.map((item, idx) => (
                          <span key={idx} className={`text-xs px-2 py-1 rounded-full ${
                            index === 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                            index === 1 ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' :
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          }`}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Unique Bottom CTA */}
        <motion.div 
          className="mt-12 sm:mt-16"
          variants={itemVariants}
        >
          <div className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-3xl p-8 sm:p-12 text-white overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl" />
            <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-teal-400/10 rounded-full blur-xl" />
            
            <div className="relative">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm font-semibold">3,000+ Lives Transformed</span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold mb-4">
                    Your wellness journey starts here
                  </h3>
                  <p className="text-green-50 text-lg max-w-xl">
                    Join a community that prioritizes mental health. Experience the difference of AI-powered support combined with human expertise.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/demo" className="w-full sm:w-auto">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto bg-white text-green-600 px-8 py-4 rounded-xl font-bold hover:bg-green-50 transition-colors shadow-xl text-base"
                    >
                      Try It Free
                    </motion.button>
                  </Link>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full sm:w-auto border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors text-base"
                  >
                    See How It Works
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default WellnessFeatures;
