'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Brain, ArrowRight } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { auth } from '@/lib/firebase';
import GamificationDashboard from '@/components/gamification/GamificationDashboard';

export default function EmployeeGamificationPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/');
      return;
    }

    if (user?.role !== 'employee') {
      return;
    }
  }, [user, userLoading, router]);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-gray-950 dark:via-slate-900 dark:to-teal-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
          </motion.div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading gamification dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 z-10">
      <GamificationDashboard />
    </div>
  );
}


