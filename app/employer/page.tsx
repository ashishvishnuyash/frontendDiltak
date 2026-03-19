'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  LogOut
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { auth } from '@/lib/firebase';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function EmployerSelectionPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [demoUser, setDemoUser] = useState<any>(null);

  // Use either real user or demo user
  const currentUser = user || demoUser;

  useEffect(() => {
    // Check if this is demo mode (no real authentication)
    if (!userLoading && !user) {
      // Create a demo user for the employer selection
      const demoDemoUser = {
        id: 'demo-employer-123',
        email: 'demo.employer@company.com',
        first_name: 'Demo',
        last_name: 'Employer',
        role: 'employer',
        company_id: 'demo-company-123',
        department: 'Management'
      };
      setDemoUser(demoDemoUser);
    }
  }, [user, userLoading]);

  useEffect(() => {
    // Auto-redirect to organization dashboard since we only have one option
    if (currentUser) {
      router.push('/employer/dashboard');
    }
  }, [currentUser, router]);

  // Show loading state while redirecting
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
          <Brain className="h-16 w-16 text-green-600 mx-auto mb-4" />
        </motion.div>
        <p className="text-lg text-gray-600 dark:text-gray-400">Redirecting to dashboard...</p>
      </motion.div>
    </div>
  );
}