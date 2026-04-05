'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';

function ShieldIllustration() {
  return (
    <div className="flex items-center justify-center py-8">
      <svg width="180" height="100" viewBox="0 0 180 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Squiggly line */}
        <path
          d="M20 72 Q38 54 56 72 Q74 90 92 72 Q110 54 128 72 Q146 90 160 72"
          stroke="#1a1a1a"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Shield body */}
        <path
          d="M90 14 L112 22 L112 46 Q112 64 90 72 Q68 64 68 46 L68 22 Z"
          fill="#22c55e"
        />
        {/* Shield highlight */}
        <path
          d="M90 20 L108 27 L108 46 Q108 61 90 68 Q72 61 72 46 L72 27 Z"
          fill="#16a34a"
          opacity="0.35"
        />
      </svg>
    </div>
  );
}

interface SafeHereModalProps {
  firstName: string;
  onSharePost: () => void;
  onReadOnly: () => void;
  onClose: () => void;
}

export default function SafeHereModal({ firstName, onSharePost, onReadOnly, onClose }: SafeHereModalProps) {
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
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">You're Safe Here.</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Shield illustration */}
          <ShieldIllustration />

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* Body */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Hello, {firstName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Your Wellness Assistant is here to listen and support you whenever you need it.
              Share how you're feeling, ask questions, or explore simple ways to reduce stress and feel better.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Take a moment — you're not alone here.
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onReadOnly}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              I will read posts
            </button>
            <button
              onClick={onSharePost}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors"
            >
              Share Post
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
