'use client';

import { useUser } from '@/hooks/use-user';
import { withAuth } from '@/components/auth/with-auth';
import WellnessHub from '@/components/wellness-hub/WellnessHub';
import { PageLoader } from '@/components/loader';

function EmployerWellnessHubPage() {
  const { user, loading } = useUser();

  if (loading) return <PageLoader message="Loading wellness hub..." />;
  if (!user) return null;

  return <WellnessHub userRole="employer" userId={user.id} />;
}

export default withAuth(EmployerWellnessHubPage, ['employer', 'admin']);
