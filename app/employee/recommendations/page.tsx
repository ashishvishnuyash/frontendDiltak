'use client';

import { withAuth } from '@/components/auth/with-auth';
import { useAuth } from '@/contexts/auth-context';
import AIRecommendations from '@/components/recommendations/AIRecommendations';
import { BrandLoader } from '@/components/loader';

function EmployeeRecommendationsPage() {
  const { user, loading } = useAuth();

  if (loading) return <BrandLoader color="bg-emerald-400" />;
  if (!user) return null;

  return (
    <div className="px-4 sm:px-6 lg:px-6 py-6 max-w-[1400px] mx-auto">
      <AIRecommendations />
    </div>
  );
}

export default withAuth(EmployeeRecommendationsPage, ['employee']);
