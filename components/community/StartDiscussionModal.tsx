'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const categories = [
  { value: 'general',          label: 'General' },
  { value: 'stress_relief',    label: 'Stress Relief' },
  { value: 'work_life_balance',label: 'Work-Life Balance' },
  { value: 'mental_health',    label: 'Mental Health' },
  { value: 'success_stories',  label: 'Success Stories' },
  { value: 'seeking_support',  label: 'Seeking Support' },
  { value: 'others',           label: 'Others' },
];

interface StartDiscussionModalProps {
  onSubmit: (data: { title: string; content: string; category: string }) => void;
  onClose: () => void;
}

export default function StartDiscussionModal({ onSubmit, onClose }: StartDiscussionModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('others');
  const [content, setContent] = useState('');

  const canSubmit = title.trim().length > 0 && content.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Start Discussion</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Title + Category row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Support, don't judge"
                className="w-full text-sm px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full appearance-none text-sm px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-emerald-400 transition-colors pr-8"
                >
                  {categories.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Sometimes we forget how much a few kind words can help.&#10;Not everyone here has answers — but being heard matters too."
              rows={5}
              className="w-full text-sm px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-emerald-400 transition-colors resize-none"
            />
          </div>

          {/* Privacy note */}
          <p className="text-xs text-gray-400 dark:text-gray-500 italic">
            We'll post you anonymously to keep things transparent
          </p>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => canSubmit && onSubmit({ title, content, category })}
              disabled={!canSubmit}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 rounded-lg transition-colors"
            >
              Post Anonymously
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
