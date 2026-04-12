'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import ToogleBtn from '../newcomponents/ToogleBtn';

const priorities = ['Low', 'Medium', 'High', 'Critical'];
const categories = ['Mental Health', 'Harassment', 'Workplace Safety', 'Work-Life Balance', 'Performance', 'Other'];

interface CreateSupportModalProps {
  supportType: string;
  onSubmit: (data: {
    priority: string;
    category: string;
    subject: string;
    description: string;
    anonymous: boolean;
    confidential: boolean;
  }) => void;
  onClose: () => void;
}




export default function CreateSupportModal({ supportType, onSubmit, onClose }: CreateSupportModalProps) {
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [confidential, setConfidential] = useState(true);

  const canSubmit = priority && category && subject.trim() && description.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ priority, category, subject, description, anonymous, confidential });
  };

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
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Create Support Request</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Fill out the form below to submit your request. All information will be kept confidential.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0 ml-4"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Priority + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Priority Level <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  className="w-full appearance-none text-sm px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-emerald-400 transition-colors pr-8"
                >
                  <option value="" disabled>Choose your type</option>
                  {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full appearance-none text-sm px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-emerald-400 transition-colors pr-8"
                >
                  <option value="" disabled>Choose your type</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Enter your subject"
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Detailed description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detail the issue here"
              rows={4}
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:border-emerald-400 transition-colors resize-none"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between py-2.5 px-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Post Anonymously</span>
              <ToogleBtn checked={anonymous} onChange={() => setAnonymous(v => !v)} />
            </div>
            <div className="flex items-center justify-between py-2.5 px-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Mark Confidentiality</span>
              <ToogleBtn checked={confidential} onChange={() => setConfidential(v => !v)} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 rounded-xl transition-colors"
            >
              Post Anonymously
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
