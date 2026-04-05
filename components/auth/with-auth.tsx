'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 via-lime-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
          <span className="text-white font-bold text-lg">D</span>
        </div>
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles: string[]
) {
  const WithAuth: React.FC<P> = (props) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (loading) return;
      if (!user) {
        router.replace('/auth/login');
        return;
      }
      // Normalize role comparison (case-insensitive)
      const userRole = user.role?.toLowerCase();
      const allowed = allowedRoles.map(r => r.toLowerCase());
      if (!allowed.includes(userRole)) {
        router.replace('/unauthorized');
      }
    }, [user, loading, router]);

    // Still loading — show spinner
    if (loading) return <AuthLoadingScreen />;

    // No user at all — show spinner while redirect fires
    if (!user) return <AuthLoadingScreen />;

    // Role check (case-insensitive)
    const userRole = user.role?.toLowerCase();
    const allowed = allowedRoles.map(r => r.toLowerCase());
    if (!allowed.includes(userRole)) return <AuthLoadingScreen />;

    return <WrappedComponent {...props} />;
  };

  WithAuth.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;
  return WithAuth;
}
