'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Heart, 
  Brain, 
  Shield, 
  Sparkles, 
  Users, 
  CheckCircle,
  ArrowRight,
  Play,
  Star
} from 'lucide-react';

const WellnessHero = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity
    }
  };

  return (
      <motion.section 
        className="relative overflow-hidden bg-white dark:bg-gray-900 py-12 sm:py-16 md:py-20 lg:py-24 transition-colors duration-300"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-32 h-32 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl"
            animate={floatingAnimation}
          />
          <motion.div 
            className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-32 h-32 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"
            animate={{
              ...floatingAnimation,
              transition: { ...floatingAnimation.transition, delay: 2 }
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
            {/* Left Content */}
            <motion.div variants={fadeInUp} className="space-y-6 sm:space-y-8 order-2 lg:order-1">
              <div className="space-y-4 sm:space-y-6">
                <motion.div 
                  className="inline-flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-green-200 dark:border-green-700"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                  <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">Trusted by 3k+ People</span>
                </motion.div>

                <motion.h1 
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight"
                  variants={fadeInUp}
                >
                  Complete Mind-Body
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                    Wellness Platform
                  </span>
                </motion.h1>

                <motion.p 
                  className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg"
                  variants={fadeInUp}
                >
                  Consult top doctors, psychologists, dietitians, and wellness experts.
                  Get personalized care with 100% secure consultations.
                </motion.p>
              </div>

              {/* Trust Indicators */}
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
                variants={fadeInUp}
              >
                <div className="flex items-center space-x-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-3 sm:p-4 rounded-lg">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">Secure & Private</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">End-to-end encryption</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-3 sm:p-4 rounded-lg">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">Expert Panel</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">MBBS, MD, PhD Certified</p>
                  </div>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                variants={fadeInUp}
              >
                <Link href="/demo" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Start Your Journey
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full sm:w-auto border-2 border-gray-300 dark:border-gray-600 hover:border-green-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold"
                >
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Content - Feature Cards */}
            <motion.div 
              className="space-y-4 sm:space-y-6 order-1 lg:order-2"
              variants={staggerContainer}
            >
              {/* Main Feature Card */}
              <motion.div variants={fadeInUp}>
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-hidden">
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Brain className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">AI-Powered Support</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">24/7 Mental Health Assistant</p>
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Instant emotional support</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Personalized therapy sessions</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Mood tracking & insights</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Secondary Cards */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <motion.div variants={fadeInUp}>
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-0 shadow-lg rounded-xl p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-4">
                      <Heart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600 flex-shrink-0" />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-xs sm:text-sm lg:text-base">Wellness</h4>
                    </div>
                    <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">Holistic health approach</p>
                  </Card>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-0 shadow-lg rounded-xl p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-4">
                      <Star className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600 flex-shrink-0" />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-xs sm:text-sm lg:text-base">Expert Care</h4>
                    </div>
                    <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">Certified professionals</p>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
  );
};

export default WellnessHero;
