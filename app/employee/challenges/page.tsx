'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, ArrowRight, RefreshCw, Heart, CheckCircle } from 'lucide-react';
import { withAuth } from '@/components/auth/with-auth';

// ── Types ──────────────────────────────────────────────────────────────────────

type Priority = 'Low' | 'Medium' | 'Urgent';
type Status   = 'Start Now' | 'In Progress' | 'Completed';

interface Challenge {
  id: string;
  title: string;
  author: string;
  description: string;
  priority: Priority;
  duration: string;
  status: Status;
  image: string;
}

interface Recommendation {
  id: string;
  category: string;
  items: string[];
}

// ── Mock data ──────────────────────────────────────────────────────────────────

const CHALLENGES: Challenge[] = [
  {
    id: '1',
    title: 'Breathing Exercises',
    author: 'John Smith',
    description: 'Quick and easy to do during breaks. Helps me reset my focus and reduce tension before meetings.',
    priority: 'Low',
    duration: '5 mins',
    status: 'Start Now',
    image: '/images/challenges/breathing.png',
  },
  {
    id: '2',
    title: 'Guided Meditation',
    author: 'Jane Doe',
    description: 'Felt much calmer after the session. Would love to see more guided meditations focusing on stress relief at work.',
    priority: 'Medium',
    duration: '10 mins',
    status: 'In Progress',
    image: '/images/challenges/meditation.png',
  },
  {
    id: '3',
    title: 'Progressive Muscle Relaxation',
    author: 'Anonymous User',
    description: 'The workplace sucks with impossible timeline and unnecessary hierarchy and no processs at all , please make sure to have a a better life for the employees . I am writing this for myself as well as my team so please check iinto thhis.',
    priority: 'Urgent',
    duration: '15 mins',
    status: 'Completed',
    image: '/images/challenges/relaxation.png',
  },
  {
    id: '4',
    title: 'Progressive Muscle Relaxation',
    author: 'Anonymous User',
    description: 'The workplace sucks with impossible timeline and unnecessary hierarchy and no processs at all , please make sure to have a a better life for the employees . I am writing this for myself as well as my team so please check iinto thhis.',
    priority: 'Urgent',
    duration: '15 mins',
    status: 'Start Now',
    image: '/images/challenges/relaxation.png',
  },
];

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: '1',
    category: 'Stress Management',
    items: ['Stress Management', 'Stress Management', 'Stress Management', 'Stress Management', 'Stress Management', 'Stress Management'],
  },
  {
    id: '2',
    category: 'Personal Wellness',
    items: ['Stress Management', 'Stress Management', 'Stress Management', 'Stress Management', 'Stress Management', 'Stress Management'],
  },
  {
    id: '3',
    category: 'Work-Life Balance',
    items: ['Stress Management', 'Stress Management', 'Stress Management', 'Stress Management', 'Stress Management', 'Stress Management'],
  },
  {
    id: '4',
    category: 'Self Care',
    items: ['Stress Management', 'Stress Management', 'Stress Management', 'Stress Management', 'Stress Management', 'Stress Management'],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

const priorityDot: Record<Priority, string> = {
  Low:    'bg-red-400',
  Medium: 'bg-orange-400',
  Urgent: 'bg-red-500',
};

function StatusBadge({ status }: { status: Status }) {
  if (status === 'Start Now') {
    return (
      <button className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors">
        Start Now
      </button>
    );
  }
  if (status === 'In Progress') {
    return (
      <span className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-400 rounded-lg">
        In Progress
      </span>
    );
  }
  return (
    <span className="px-3 py-1.5 text-xs font-semibold text-emerald-600 border border-emerald-400 rounded-lg bg-white">
      Completed
    </span>
  );
}

function ChallengeIllustration({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={e => {
          (e.target as HTMLImageElement).style.display = 'none';
          (e.target as HTMLImageElement).parentElement!.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>';
        }}
      />
    </div>
  );
}

// ── Challenge Card ─────────────────────────────────────────────────────────────

function ChallengeCard({ challenge, index }: { challenge: Challenge; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900">{challenge.title}</h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium border border-gray-200 rounded-full bg-white">
            <span className={`w-2 h-2 rounded-full ${priorityDot[challenge.priority]}`} />
            <span className="text-gray-700">{challenge.priority}</span>
          </span>
          <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium border border-gray-200 rounded-full bg-white text-gray-600">
            {challenge.duration}
            <Clock className="h-3 w-3 text-gray-400 ml-0.5" />
          </span>
          <StatusBadge status={challenge.status} />
        </div>
      </div>

      <div className="flex items-start gap-4">
        <ChallengeIllustration src={challenge.image} alt={challenge.title} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-700 mb-1">{challenge.author}</p>
          <p className="text-xs text-gray-500 leading-relaxed">{challenge.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Recommendation Card ────────────────────────────────────────────────────────

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? rec.items : rec.items.slice(0, 3);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <Heart className="h-4 w-4 text-emerald-500" />
        </div>
        <h3 className="text-sm font-bold text-gray-900">{rec.category}</h3>
      </div>

      <div className="border-t border-gray-100 mb-3" />

      <div className="space-y-2.5">
        {visible.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="w-5 h-5 border border-dashed border-emerald-400 rounded flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <span className="text-xs font-medium text-gray-700">{item}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-3">
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          {expanded ? 'show less' : 'show more'}
        </button>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

function ChallengesPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 bg-gray-50 dark:bg-gray-950 min-h-full">
      <div className="flex flex-col lg:flex-row gap-6 max-w-[1400px] mx-auto">

        {/* Left: Active Challenges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Active Challenges</h2>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors shadow-sm">
              <TrendingUp className="h-3.5 w-3.5" />
              View Analytics
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-4">
            {CHALLENGES.map((c, i) => (
              <ChallengeCard key={c.id} challenge={c} index={i} />
            ))}
          </div>
        </div>

        {/* Right: Wellness Recommendations */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Wellness Recommendations</h2>
            <button className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white transition-colors">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-4">
            {RECOMMENDATIONS.map(rec => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default withAuth(ChallengesPage, ['employee']);
