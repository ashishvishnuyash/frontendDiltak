'use client';

import { useAuth } from '@/contexts/auth-context';
import { withAuth } from '@/components/auth/with-auth';
import WellnessHub from '@/components/wellness-hub/WellnessHub';
import { PageLoader } from '@/components/loader';

function EmployeeWellnessHubPage() {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader message="Loading wellness hub..." />;
  if (!user) return null;

  return <WellnessHub userRole="employee" userId={user.id} />;
}

export default withAuth(EmployeeWellnessHubPage, ['employee']);
