"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Check,
  ChevronRight,
  Plus,
  Minus,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Brain,
  Heart,
  Shield,
  Zap,
  Users,
  TrendingUp,
  Award
} from 'lucide-react';
import Footer from '@/components/Footer';
import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import WellnessHero from '@/components/mental-health/WellnessHero';
import WellnessFeatures from '@/components/mental-health/WellnessFeatures';
import WellnessResources from '@/components/mental-health/WellnessResources';
import WellnessStats from '@/components/mental-health/WellnessStats';
import { useModal } from '@/contexts/modal-context';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { openContactModal } = useModal();
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const toggleProducts = () => {
    setIsProductsOpen(!isProductsOpen);
  };

  const toggleMobileProducts = () => {
    setIsMobileProductsOpen(!isMobileProductsOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  const titleVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const faqs = [
    {
      question: "What is Diltak.ai?",
      answer: "Diltak.ai is an AI-powered mental health analytics platform designed for enterprises, educational institutions, and healthcare providers. We offer comprehensive emotional well-being solutions with real-time analytics and personalized support."
    },
    {
      question: "How does Diltak.ai help organizations?",
      answer: "Diltak.ai helps organizations by providing real-time emotional intelligence, comprehensive wellness analytics, and AI-driven support tools that boost workforce resilience, productivity, and retention."
    },
    {
      question: "Is Diltak.ai available for white-label integration?",
      answer: "Yes, Diltak.ai offers white-label solutions that can be seamlessly integrated into your existing platforms and branded according to your organization's needs."
    },
    {
      question: "Is Diltak.ai compliant with data privacy standards?",
      answer: "Absolutely. Diltak.ai follows industry-leading security measures with end-to-end encryption to protect all sensitive data."
    },
    {
      question: "How is Diltak.ai different from traditional wellness apps?",
      answer: "Diltak.ai goes beyond traditional wellness apps by offering AI-powered emotional intelligence, real-time analytics, and comprehensive organizational insights that traditional apps cannot provide."
    },
    {
      question: "Can Diltak.ai integrate with our existing systems?",
      answer: "Yes, Diltak.ai offers flexible API integration options that can connect with your existing HR systems, communication platforms, and other workplace tools."
    },
    {
      question: "Can we see a live demo or try a pilot?",
      answer: "Absolutely! We offer live demos and pilot programs to help you experience the full capabilities of Diltak.ai before making a decision."
    },
    {
      question: "How does Diltak.ai improve ROI for enterprises?",
      answer: "Diltak.ai improves ROI by reducing absenteeism, increasing productivity, improving employee retention, and providing data-driven insights for better organizational decision-making."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-gray-950 dark:via-slate-900 dark:to-teal-950 text-gray-900 dark:text-gray-100 transition-colors duration-500 overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-emerald-300/20 dark:bg-emerald-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 right-20 w-96 h-96 bg-blue-300/20 dark:bg-blue-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-teal-300/20 dark:bg-teal-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, 60, 0],
            y: [0, -80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <header className="border-b border-white/20 dark:border-gray-800/50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <motion.div 
              className="flex items-center space-x-2 sm:space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <motion.div 
                className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-600 via-lime-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="text-white w-3 h-3 sm:w-4 sm:h-4" />
              </motion.div>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-lime-600 to-emerald-600">Diltak.ai</span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              <Link href="/">
                <Button variant="ghost" className="text-gray-700 hover:bg-green-50 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2 transition-all duration-200 hover:scale-105">
                  Home
                </Button>
              </Link>

              {/* Products Dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 flex items-center space-x-1 px-3 py-2"
                  onClick={toggleProducts}
                >
                  <span>Products</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isProductsOpen ? 'rotate-180' : ''}`} />
                </Button>

                {isProductsOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <Link href="/wellness-hub">
                        <div className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                          Wellness Hub
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link href="#advantage">
                <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2">
                  About
                </Button>
              </Link>

              <Link href="#wellness">
                <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2">
                  Solutions
                </Button>
              </Link>

              <Link href="#faq">
                <Button variant="ghost" className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2">
                  FAQ
                </Button>
              </Link>

              <Button
                variant="ghost"
                className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 px-3 py-2"
                onClick={openContactModal}
              >
                Contact
              </Button>

              <Link href="/auth/login">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  Login
                </Button>
              </Link>

              <ThemeToggle />
            </div>

            {/* Mobile Navigation - Hamburger Menu */}
            <div className="lg:hidden flex items-center space-x-2">
              <ThemeToggle size="sm" />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
              <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                  <div className="flex flex-col space-y-2">
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3">
                        Home
                      </Button>
                    </Link>

                    {/* Mobile Products Section */}
                    <div>
                      <Button
                        variant="ghost"
                        className="w-full justify-between text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 py-3"
                        onClick={toggleMobileProducts}
                      >
                        <span>Products</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isMobileProductsOpen ? 'rotate-180' : ''}`} />
                      </Button>

                      {isMobileProductsOpen && (
                        <div className="ml-4 mt-2 space-y-1">
                          <Link href="/wellness-hub" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 py-2">
                              Wellness Hub
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>

                    <Link href="#advantage" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3">
                        About
                      </Button>
                    </Link>

                    <Link href="#wellness" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3">
                        Solutions
                      </Button>
                    </Link>

                    <Link href="#faq" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3">
                        FAQ
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 py-3"
                      onClick={() => {
                        openContactModal();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Contact
                    </Button>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3">
                          Login
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section
        className="relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 z-10"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
            <motion.div 
              className="text-left order-2 lg:order-1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 px-4 py-2 rounded-full mb-6 border border-green-200 dark:border-green-800"
              >
                <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-700 dark:text-green-300">AI-Powered Mental Wellness</span>
              </motion.div>

              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <span className="text-gray-900 dark:text-white">Well-Being</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-lime-600 to-emerald-600 animate-gradient">
                  Reimagined
                </span>
              </motion.h1>

              <motion.p 
                className="mt-6 text-base sm:text-lg lg:text-xl leading-relaxed text-gray-600 dark:text-gray-300 max-w-full lg:max-w-lg mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Advanced AI-powered analytics platform delivering predictive mental health insights for Fortune 500 companies, universities, and healthcare systems.
              </motion.p>

              {/* Quote Section */}
              <motion.div 
                className="relative pl-6 mb-8 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-indigo-500 before:to-purple-500 before:rounded-full"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <p className="text-gray-700 dark:text-gray-300 italic text-lg font-medium">
                  &quot;Emotional support, guidance, and wellness aid&quot;
                </p>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div 
                className="flex flex-wrap items-center gap-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <motion.div 
                  className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-green-200 dark:border-green-800"
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300 font-semibold text-sm">3K+ Lives Impacted</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-800"
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-gray-700 dark:text-gray-300 font-semibold text-sm">10+ Countries</span>
                </motion.div>
              </motion.div>

              <motion.div 
                className="flex flex-col sm:flex-row items-start gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                <Link href="/wellness-hub" className="w-full sm:w-auto">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-green-600 via-lime-600 to-emerald-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white px-8 py-6 flex items-center justify-center space-x-2 shadow-2xl hover:shadow-green-500/50 transition-all duration-300 text-base font-semibold rounded-xl group">
                      <span>EXPLORE PLATFORM</span>
                      <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={openContactModal}
                    className="w-full sm:w-auto border-2 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 px-8 py-6 text-base font-semibold rounded-xl backdrop-blur-sm"
                  >
                    Get a Demo
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div 
              className="flex justify-center items-center order-1 lg:order-2"
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {/* Hero Image - Robot with Interactive Elements */}
              <div className="relative w-full max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
                <motion.div
                  className="relative h-[200px] sm:h-[280px] md:h-[350px] lg:h-[400px] xl:h-[500px] rounded-3xl overflow-hidden bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 shadow-2xl backdrop-blur-sm border border-white/20 dark:border-gray-700/50"
                  whileHover={{ scale: 1.02, rotate: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Floating decorative elements */}
                  <motion.div
                    className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl opacity-20 blur-xl"
                    animate={{
                      y: [-10, 10, -10],
                      rotate: [0, 90, 0],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="absolute bottom-4 left-4 w-20 h-20 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-full opacity-20 blur-xl"
                    animate={{
                      y: [10, -10, 10],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  />

                  <motion.div
                    className="relative w-full h-full"
                    animate={{
                      y: [-10, 10, -10],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Image
                      src="/images/robot_image_with_wires.png"
                      alt="AI Robot with digital interface representing mental health analytics"
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 640px) 280px, (max-width: 768px) 384px, (max-width: 1024px) 448px, (max-width: 1280px) 512px, 576px"
                    />
                  </motion.div>
                </motion.div>

                {/* Floating stat cards */}
                <motion.div
                  className="absolute -top-4 -left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-green-200 dark:border-green-800"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <div className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">AI Accuracy</p>
                      <p className="text-lg font-bold text-green-600">98%</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -bottom-4 -right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-emerald-200 dark:border-emerald-800"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                  whileHover={{ scale: 1.1, rotate: -5 }}
                >
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Satisfaction</p>
                      <p className="text-lg font-bold text-emerald-600">95%</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Backed By Section */}
      <motion.section
        className="relative py-8 sm:py-12 md:py-16 z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Backed By
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Trusted by leading organizations and investors
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 items-center justify-items-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {[
              '/BackedBy/image.png',
              '/BackedBy/image1.png',
              '/BackedBy/Screenshot 2025-11-06 at 3.09.33 PM.png',
              '/BackedBy/Screenshot 2025-11-06 at 3.12.39 PM.png',
              '/BackedBy/Screenshot 2025-11-06 at 3.15.14 PM.png',
              '/BackedBy/Screenshot 2025-11-06 at 3.19.36 PM.png',
            ].map((imagePath, index) => (
              <motion.div
                key={index}
                className="relative w-full max-w-[180px] h-24 sm:h-28 md:h-32 flex items-center justify-center p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 transition-all duration-300 hover:shadow-lg group"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Image
                  src={imagePath}
                  alt={`Backed by partner ${index + 1}`}
                  fill
                  className="object-contain p-2 grayscale group-hover:grayscale-0 transition-all duration-300"
                  sizes="(max-width: 640px) 150px, (max-width: 1024px) 180px, 200px"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* The Diltak AI Advantage Section */}
      <motion.section
        id="advantage"
        className="relative py-12 sm:py-16 md:py-20 lg:py-24 z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
            {/* Left side - AI Brain Image */}
            <motion.div 
              className="relative order-2 lg:order-1"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative w-full aspect-square max-w-[300px] sm:max-w-[400px] lg:max-w-[500px] mx-auto">
                <motion.div
                  className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 shadow-2xl border-4 border-white/50 dark:border-gray-700/50"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src="/images/tech_robot_with_screen.png"
                    alt="AI Brain with neural networks and digital interface"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 300px, (max-width: 1024px) 400px, 500px"
                  />
                </motion.div>

                {/* Orbiting icons */}
                <motion.div
                  className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-3 rounded-full shadow-xl"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Brain className="w-6 h-6 text-green-600" />
                </motion.div>
                <motion.div
                  className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 p-3 rounded-full shadow-xl"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                >
                  <Heart className="w-6 h-6 text-lime-600" />
                </motion.div>
                <motion.div
                  className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-3 rounded-full shadow-xl"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                >
                  <Shield className="w-6 h-6 text-emerald-600" />
                </motion.div>
              </div>
            </motion.div>

            {/* Right side - Content */}
            <motion.div 
              className="space-y-6 order-1 lg:order-2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 px-4 py-2 rounded-full mb-4 border border-green-200 dark:border-green-800"
                >
                  <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-semibold text-green-700 dark:text-green-300">Why Choose Us</span>
                </motion.div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 leading-tight">
                  The Diltak AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Advantage</span>
                </h2>
              </div>

              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed">
                Unlike traditional wellness solutions, Diltak AI delivers enterprise-grade mental health intelligence through scientifically validated algorithms and predictive analytics, enabling organizations to proactively support workforce resilience at scale. Get the best guidance and talk to someone who understands your Mental Health status. Therapy is like cleaning that messy drawer - you keep what matters and let go of what doesn&apos;t.
              </p>

              {/* Unique Advantage Layout - Asymmetric & Organic */}
              <div className="space-y-6">
                {/* Row 1: Large feature */}
                <motion.div
                  className="relative p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-l-4 border-green-500 overflow-hidden group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ x: 5 }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative flex items-start space-x-4">
                    <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">40% Reduction in Absences</h3>
                      <p className="text-gray-600 dark:text-gray-300">Proven track record of reducing mental health-related absences through early intervention and continuous support.</p>
                    </div>
                  </div>
                </motion.div>

                {/* Row 2: Two medium features side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    className="p-5 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                  >
                    <Users className="w-8 h-8 text-emerald-600 mb-3" />
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Predictive Intervention</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">AI-powered insights help identify at-risk employees before issues escalate.</p>
                  </motion.div>

                  <motion.div
                    className="p-5 rounded-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-lime-200 dark:border-lime-800 hover:shadow-lg transition-all duration-300"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    <Award className="w-8 h-8 text-lime-600 mb-3" />
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Measurable ROI</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Evidence-based analytics prove the value of your wellness investments.</p>
                  </motion.div>
                </div>

                {/* Row 3: Three small features */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <motion.div
                    className="p-4 rounded-lg bg-gradient-to-br from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20 hover:scale-105 transition-transform"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                  >
                    <Shield className="w-6 h-6 text-teal-600 mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Early Warning Systems</p>
                  </motion.div>

                  <motion.div
                    className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-lime-50 dark:from-emerald-900/20 dark:to-lime-900/20 hover:scale-105 transition-transform"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                  >
                    <Zap className="w-6 h-6 text-emerald-600 mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Seamless Integration</p>
                  </motion.div>

                  <motion.div
                    className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 hover:scale-105 transition-transform"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                  >
                    <Heart className="w-6 h-6 text-green-600 mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Expert-Led Resources</p>
                  </motion.div>
                </div>

                {/* Row 4: Highlighted feature */}
                <motion.div
                  className="relative p-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white overflow-hidden group"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                  <div className="relative flex items-center space-x-4">
                    <Brain className="w-10 h-10 text-white/90" />
                    <div>
                      <h3 className="text-xl font-bold mb-1">100% Anonymous & Confidential</h3>
                      <p className="text-green-50">No stigma, no limits. Your privacy is our priority.</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Enhanced Mental Health & Wellness Section */}
      <div id="wellness">
        <WellnessHero />
      </div>

      {/* Comprehensive Wellness Features */}
      <WellnessFeatures />

      {/* Wellness Resources & Tools */}
      <WellnessResources />

      {/* Trust & Statistics */}
      <WellnessStats />

      {/* FAQ Section */}
      <motion.section
        id="faq"
        className="relative py-12 sm:py-16 md:py-20 lg:py-24 z-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 px-4 py-2 rounded-full mb-6 border border-green-200 dark:border-green-800">
              <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-green-700 dark:text-green-300">Got Questions?</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
              Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Questions</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 text-sm sm:text-base">
              Still have more questions? Don&apos;t hesitate to contact us at{' '}
              <a href="mailto:info@diltak.ai" className="text-green-600 dark:text-green-400 hover:underline font-semibold">
                info@diltak.ai
              </a>
              !
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 sm:px-8 py-3 flex items-center space-x-2 mx-auto text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                onClick={openContactModal}
              >
                <span>Contact Us</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              // Vary the design for each FAQ item
              const isEven = index % 2 === 0;
              const borderColors = ['border-green-200 dark:border-green-800', 'border-emerald-200 dark:border-emerald-800', 'border-teal-200 dark:border-teal-800'];
              const hoverColors = ['hover:border-green-400', 'hover:border-emerald-400', 'hover:border-teal-400'];
              const bgColors = ['hover:bg-green-50/50', 'hover:bg-emerald-50/50', 'hover:bg-teal-50/50'];
              const colorIndex = index % 3;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Card className={`border ${borderColors[colorIndex]} bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:shadow-xl ${hoverColors[colorIndex]} dark:hover:border-green-600 transition-all duration-300 overflow-hidden group ${isEven ? 'ml-0 mr-4' : 'ml-4 mr-0'}`}>
                    <CardHeader
                      className={`cursor-pointer p-4 sm:p-6 ${bgColors[colorIndex]} dark:hover:bg-green-900/10 transition-all duration-300`}
                      onClick={() => toggleFaq(index)}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 text-left group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
                          {faq.question}
                        </h3>
                        <motion.div
                          className="flex-shrink-0 p-1.5 rounded-full bg-green-100 dark:bg-green-900/30"
                          animate={{ rotate: openFaq === index ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {openFaq === index ? (
                            <Minus className="h-4 w-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
                          )}
                        </motion.div>
                      </div>
                    </CardHeader>
                    {openFaq === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardContent className="p-4 sm:p-6 pt-0">
                          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                            {faq.answer}
                          </p>
                        </CardContent>
                      </motion.div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.div 
            className="mt-8 sm:mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-3xl p-8 sm:p-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl" />
              
              <div className="relative text-center text-white">
                <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                  Still curious? Let&apos;s talk.
                </h3>
                <p className="text-green-50 mb-6 max-w-2xl mx-auto">
                  Our team is ready to show you how Diltak.ai can transform your organization&apos;s mental wellness approach.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-3 rounded-xl font-semibold transition-all"
                      onClick={openContactModal}
                    >
                      Schedule a Demo
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      className="w-full sm:w-auto bg-white text-green-600 hover:bg-green-50 px-8 py-3 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl font-semibold"
                      asChild
                    >
                      <a href="mailto:info@diltak.ai">
                        Email Our Team
                      </a>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}