'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';

// SVG shield illustration matching the design
function ShieldIllustration() {
  return (
    <div className="flex items-center justify-center py-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl mx-2">
      <svg width="160" height="90" viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Squiggly line */}
        <path
          d="M20 65 Q35 50 50 65 Q65 80 80 65 Q95 50 110 65 Q125 80 140 65"
          stroke="#1a1a1a"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Shield */}
        <path
          d="M80 15 L100 22 L100 42 Q100 58 80 65 Q60 58 60 42 L60 22 Z"
          fill="#22c55e"
        />
        <path
          d="M80 20 L96 26 L96 42 Q96 55 80 61 Q64 55 64 42 L64 26 Z"
          fill="#16a34a"
          opacity="0.4"
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
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">You're Safe Here.</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Greeting */}
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Hello, {firstName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              Sometimes it's easier to open up when no one knows who you are.<br />
              This space is built for that.
            </p>
          </div>

          {/* Illustration */}
          <ShieldIllustration />

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* Anonymous toggle row */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest text-gray-700 dark:text-gray-200 uppercase">Post Anonymously</span>
            {/* Toggle — always on */}
            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500 cursor-default">
              <span className="inline-block h-5 w-5 transform rounded-full bg-white shadow-sm translate-x-6" />
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Share what's on your mind or simply explore — everything is completely anonymous. No pressure. Just real conversations.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              onClick={onReadOnly}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              I will read posts
            </button>
            <button
              onClick={onSharePost}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
            >
              Share Post
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
