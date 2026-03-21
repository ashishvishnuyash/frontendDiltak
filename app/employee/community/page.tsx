'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import AnonymousCommunity from '@/components/community/AnonymousCommunity';

export default function EmployeeCommunityPage() {
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
      <div className="flex items-center justify-center py-20">
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
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading community space...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="text-gray-900 dark:text-gray-100">
      {/* Main Content */}
      <div className="max-w-auto mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnonymousCommunity />
      </div>
    </div>
  );
}


