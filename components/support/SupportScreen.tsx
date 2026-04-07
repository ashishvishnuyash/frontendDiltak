'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@/types/index';
import WellnessWelcomeModal from './WellnessWelcomeModal';
import SafeHereModal from './SafeHereModal';
import CreateSupportModal from './CreateSupportModal';
import { apiPost } from '@/lib/api-client';

// ── Support type card ──────────────────────────────────────────────────────────

interface SupportType {
  key: 'hr' | 'manager' | 'Wellbing Officer';
  label: string;
  description: string;
}

const supportTypes: SupportType[] = [
  { 
    key: 'hr', 
    label: 'HR Support', 
    description: 'Confidential support for workplace issues, policies, and professional concerns.' 
  },
  { 
    key: 'manager', 
    label: 'Manager', 
    description: 'Discuss team dynamics, workload, or work-related challenges with your manager.' 
  },
  { 
    key: 'Wellbing Officer', 
    label: 'Wellbeing Officer', 
    description: 'Mental health first aid, emotional support, and wellness guidance.' 
  },
];

// Simple person avatar SVG matching the design
function PersonAvatar() {
  return (
    <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14" cy="9" r="5" fill="#34d399" />
        <path d="M4 24c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="#34d399" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

function SupportCard({ type, onClick }: { type: SupportType; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex flex-col items-center text-center p-8 px-3 border-r border-gray-100 dark:border-gray-800 last:border-r-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors w-full"
    >
      <PersonAvatar />
      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1.5">{type.label}</h3>
      <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">{type.description}</p>
    </motion.button>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function SupportScreen({ user }: { user: User }) {
  const [selectedType, setSelectedType] = useState<SupportType | null>(null);

  // modal flow: welcome → safe-here → create-request
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSafeHere, setShowSafeHere] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const firstName = user?.first_name ?? 'there';

  const handleCardClick = (type: SupportType) => {
    setSelectedType(type);
    setShowWelcome(true);
  };

  // Welcome → Safe Here
  const handleWelcomeStart = () => {
    setShowWelcome(false);
    setShowSafeHere(true);
  };

  // Safe Here → Create Request
  const handleSafeHereShare = () => {
    setShowSafeHere(false);
    setShowCreate(true);
  };

  const handleSafeHereRead = () => {
    setShowSafeHere(false);
  };

  // Submit support request
  const handleSubmit = async (data: {
    priority: string;
    category: string;
    subject: string;
    description: string;
    anonymous: boolean;
    confidential: boolean;
  }) => {
    setShowCreate(false);
    try {
      const result = await apiPost<{ success: boolean; ticket_id: string; message: string }>(
        '/escalation/create-ticket',
        {
          employee_id:   user.id,
          company_id:    user.company_id ?? '',
          ticket_type:   selectedType?.key ?? 'hr',
          priority:      data.priority.toLowerCase(),
          subject:       data.subject,
          description:   data.description,
          category:      data.category.toLowerCase().replace(/\s+/g, '_'),
          is_anonymous:  data.anonymous,
          confidential:  data.confidential,
          attachments:   [],
        }
      );
      if (result.success) {
        toast.success('Support request submitted. Our team will follow up confidentially.');
      } else {
        toast.error('Failed to submit request. Please try again.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      toast.error(msg);
    }
    setSelectedType(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-[#f0faf7] dark:bg-gray-950">
      {/* Support type cards */}
      <div className="w-full max-w-3xl">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-gray-800">
            {supportTypes.map(type => (
              <SupportCard key={type.key} type={type} onClick={() => handleCardClick(type)} />
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showWelcome && (
          <WellnessWelcomeModal
            firstName={firstName}
            onStart={handleWelcomeStart}
            onClose={() => setShowWelcome(false)}
          />
        )}
        {showSafeHere && (
          <SafeHereModal
            firstName={firstName}
            onSharePost={handleSafeHereShare}
            onReadOnly={handleSafeHereRead}
            onClose={handleSafeHereRead}
          />
        )}
        {showCreate && (
          <CreateSupportModal
            supportType={selectedType?.label ?? 'HR Support'}
            onSubmit={handleSubmit}
            onClose={() => setShowCreate(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}