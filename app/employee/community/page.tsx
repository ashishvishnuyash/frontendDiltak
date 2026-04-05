'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { BrandLoader } from '@/components/loader';
import CommunityFeed from '@/components/community/CommunityFeed';

export default function EmployeeCommunityPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  if (loading) return <BrandLoader />;
  if (!user) return null;

  return <CommunityFeed user={user} />;
}
