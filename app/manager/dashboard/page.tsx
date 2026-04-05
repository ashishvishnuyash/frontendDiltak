'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/hooks/use-user';
import { ManagerDashboard } from '@/components/hierarchy/manager-dashboard';
import { withAuth } from '@/components/auth/with-auth';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import ComprehensiveMetrics from '@/components/dashboard/ComprehensiveMetrics';
import { ComprehensiveReportExportService } from '@/lib/comprehensive-report-export-service';
import { 
  Loader2, 
  Shield, 
  ArrowRight, 
  ArrowLeft,
  FileText, 
  BarChart3,
  User as UserIcon
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import type { User } from '@/types/index';
import { SectionLoader } from '@/components/loader';

function ManagerDashboardPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const handleViewTeamMember = (employee: User) => {
    // Navigate to team member's profile or reports
    router.push(`/manager/team-member/${employee.id}`);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/auth/login');
    }
  };

  if (userLoading) {
    return <SectionLoader size="lg" message="Loading your dashboard..." color="text-green-600" />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2 sm:mb-3 lg:mb-4 tracking-tight leading-tight">
              Manager Dashboard
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 font-light leading-relaxed max-w-full sm:max-w-2xl lg:max-w-3xl">
              Manage your team and track their wellness progress with comprehensive insights and analytics.
            </p>
          </motion.div>
        </div>

        {/* Enhanced Navigation */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex space-x-3 sm:space-x-4 md:space-x-6 lg:space-x-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide">
            <button className="pb-2 sm:pb-3 lg:pb-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-xs sm:text-sm lg:text-base whitespace-nowrap flex-shrink-0">
              Dashboard
            </button>
            <Link href="/manager/org-chart" className="pb-2 sm:pb-3 lg:pb-4 px-1 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors text-xs sm:text-sm lg:text-base whitespace-nowrap flex-shrink-0">
              Org Chart
            </Link>
            <Link href="/manager/team-reports" className="pb-2 sm:pb-3 lg:pb-4 px-1 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors text-xs sm:text-sm lg:text-base whitespace-nowrap flex-shrink-0">
              Team Reports
            </Link>
          </div>
        </div>

        {/* Manager Dashboard Component */}
        <ManagerDashboard 
          manager={user} 
          onViewTeamMember={handleViewTeamMember}
        />

        {/* Team Metrics Section */}
        <div className="mt-8">
          <ComprehensiveMetrics
            userId={user?.id}
            companyId={user?.company_id}
            showExport={true}
            onExport={async (data) => {
              try {
                await ComprehensiveReportExportService.exportToPDF(data, user);
              } catch (error) {
                console.error('Export error:', error);
              }
            }}
            userRole="manager"
          />
        </div>
      </div>
    </div>
  );
}

export default withAuth(ManagerDashboardPage, ['manager', 'admin']);
