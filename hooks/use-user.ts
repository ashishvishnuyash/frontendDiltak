'use client';

import { useEffect, useState } from 'react';
import type { User } from '@/types';

/**
 * useUser — reads the authenticated user from localStorage.
 * Auth is managed by the custom API (access_token + user_profile).
 * This replaces the previous Firebase-based implementation.
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function readProfile(): User | null {
      if (typeof window === 'undefined') return null;
      try {
        const raw = localStorage.getItem('user_profile');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        const id = parsed?.id || parsed?.uid || '';
        const role = parsed?.role || '';
        if (!id || !role) return null;
        return {
          ...parsed,
          id,
          role,
          company_id:   parsed.company_id   ?? parsed.companyId   ?? '',
          company_name: parsed.company_name ?? parsed.companyName ?? '',
          first_name:   parsed.first_name   ?? (parsed.displayName?.split(' ')?.[0]   ?? ''),
          last_name:    parsed.last_name    ?? (parsed.displayName?.split(' ')?.slice(1).join(' ') ?? ''),
          is_active:    parsed.is_active    ?? true,
          email:        parsed.email        ?? '',
          created_at:   parsed.created_at   ?? '',
          updated_at:   parsed.updated_at   ?? '',
        } as User;
      } catch {
        return null;
      }
    }

    setUser(readProfile());
    setLoading(false);

    // Listen for storage changes (e.g. login/logout in another tab)
    function onStorage(e: StorageEvent) {
      if (e.key === 'user_profile') {
        setUser(readProfile());
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return { user, loading };
}
