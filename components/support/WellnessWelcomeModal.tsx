'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface WellnessWelcomeModalProps {
  firstName: string;
  onStart: () => void;
  onClose: () => void;
}

export default function WellnessWelcomeModal({ firstName, onStart, onClose }: WellnessWelcomeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="px-6 pt-6 pb-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {/* Leaf emoji */}
              <span className="text-xl">🌿</span>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Welcome to Wellness Assistant!</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* Body */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Hello, {firstName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Your Wellness Assistant is here to listen and support you whenever you need it.<br />
              Share how you're feeling, ask questions, or explore simple ways to reduce stress and feel better.<br />
              Take a moment — you're not alone here.
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* Action */}
          <div className="flex justify-end">
            <button
              onClick={onStart}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors"
            >
              Start Conversation
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
