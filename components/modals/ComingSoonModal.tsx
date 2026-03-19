'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Sparkles, Brain, Heart, Zap } from 'lucide-react';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactOpen: () => void;
}

export function ComingSoonModal({ isOpen, onClose, onContactOpen }: ComingSoonModalProps) {
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Auto-close after 4 seconds and show contact form
      const timer = setTimeout(() => {
        setShowContact(true);
        onClose();
        // Show contact form after a brief delay
        setTimeout(() => {
          onContactOpen();
        }, 500);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, onContactOpen]);

  const handleClose = () => {
    onClose();
    setShowContact(false);
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal Content */}
          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.6 
            }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50" />

            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 h-8 w-8 p-0 hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Content */}
            <div className="relative p-8 text-center">
              {/* Animated Icons */}
              <div className="relative mb-6">
                <motion.div
                  className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <Brain className="h-10 w-10 text-white" />
                </motion.div>

                {/* Floating Icons */}
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{ 
                    y: [-5, 5, -5]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                >
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                </motion.div>

                <motion.div
                  className="absolute -bottom-2 -left-2"
                  animate={{ 
                    y: [5, -5, 5]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 1
                  }}
                >
                  <Heart className="h-6 w-6 text-red-500" />
                </motion.div>

                <motion.div
                  className="absolute top-1/2 -right-6"
                  animate={{ 
                    x: [-5, 5, -5]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 1.5
                  }}
                >
                  <Zap className="h-5 w-5 text-blue-500" />
                </motion.div>
              </div>

              {/* Title */}
              <motion.h2
                className="text-3xl font-bold text-gray-900 mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                AI Friend
              </motion.h2>

              {/* Subtitle */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Sparkles className="h-4 w-4 text-purple-600" />
                  </motion.div>
                  <span className="text-purple-700 font-semibold">Coming Soon</span>
                </div>
              </motion.div>

              {/* Description */}
              <motion.p
                className="text-gray-600 mb-6 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                We're working hard to bring you an amazing AI-powered companion for mental wellness. 
                Stay tuned for updates!
              </motion.p>

              {/* Progress Bar */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <motion.div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "75%" }}
                    transition={{ duration: 2, delay: 0.8 }}
                  />
                </div>
                <p className="text-sm text-gray-500">Development Progress: 75%</p>
              </motion.div>

              {/* Features Preview */}
              <motion.div
                className="grid grid-cols-2 gap-3 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Heart className="h-5 w-5 text-red-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Emotional Support</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Brain className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Smart Insights</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Zap className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Real-time Help</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <Sparkles className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Personalized</p>
                </div>
              </motion.div>

              {/* Auto-close indicator */}
              <motion.div
                className="text-xs text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                This will close automatically and show our contact form...
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
