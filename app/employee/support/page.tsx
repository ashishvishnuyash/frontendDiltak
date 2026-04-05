'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { BrandLoader } from '@/components/loader';
import SupportScreen from '@/components/support/SupportScreen';

export default function EmployeeSupportPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  if (loading) return <BrandLoader />;
  if (!user) return null;

  return <SupportScreen user={user} />;
}
