'use client';

import {
  createContext, useContext, useEffect, useState,
  useMemo, useCallback, useRef,
} from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { toast } from 'sonner';
import type { User } from '@/types/index';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── helpers ────────────────────────────────────────────────────────────────────

/** Read the profile stored by the custom API login flow */
function getLocalProfile(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user_profile');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Normalize: accept both id (snake_case) and uid (API camelCase)
    const id = parsed?.id || parsed?.uid || '';
    const role = parsed?.role || '';
    if (!id || !role) return null;
    // Ensure app-convention fields are set, normalizing API camelCase if needed
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

function clearLocalAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_profile');
  localStorage.removeItem('login_data');
}

// ── Provider ───────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const unsubscribeSnapshotRef = useRef<(() => void) | null>(null);

  const refreshUser = useCallback(async () => {
    // Try custom API profile first
    const localProfile = getLocalProfile();
    if (localProfile) {
      setUser(localProfile);
      return;
    }
    // Fallback: Firebase
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setUser({ id: userDoc.id, ...userDoc.data() } as User);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      clearLocalAuth();
      setUser(null);
      // Also sign out of Firebase if there's a session
      if (auth.currentUser) await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    // ── Priority 1: custom API token in localStorage ──────────────────────────
    const localProfile = getLocalProfile();
    if (localProfile) {
      setUser(localProfile);
      setLoading(false);
      // Still listen to Firebase in background (won't override local profile)
    }

    // ── Priority 2: Firebase Auth ─────────────────────────────────────────────
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubscribeSnapshotRef.current) {
        unsubscribeSnapshotRef.current();
        unsubscribeSnapshotRef.current = null;
      }

      // If we already have a local API profile, don't let Firebase override it
      if (getLocalProfile()) {
        setLoading(false);
        return;
      }

      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const initialDoc = await getDoc(userDocRef);

        if (initialDoc.exists()) {
          setUser({ id: initialDoc.id, ...initialDoc.data() } as User);
          setLoading(false);

          unsubscribeSnapshotRef.current = onSnapshot(userDocRef, (snap) => {
            // Only update from Firebase if no local API profile
            if (!getLocalProfile() && snap.exists()) {
              setUser({ id: snap.id, ...snap.data() } as User);
            }
          }, (err) => {
            console.error('Snapshot error:', err);
          });
        } else {
          let retryTimeout: ReturnType<typeof setTimeout> | null = null;

          unsubscribeSnapshotRef.current = onSnapshot(userDocRef, (snap) => {
            if (!getLocalProfile() && snap.exists()) {
              if (retryTimeout) clearTimeout(retryTimeout);
              setUser({ id: snap.id, ...snap.data() } as User);
              setLoading(false);
            }
          }, (err) => {
            console.error('Error in user snapshot listener:', err);
            setLoading(false);
          });

          retryTimeout = setTimeout(async () => {
            if (getLocalProfile()) return; // local profile took over
            const retryDoc = await getDoc(userDocRef);
            if (retryDoc.exists()) {
              setUser({ id: retryDoc.id, ...retryDoc.data() } as User);
              setLoading(false);
            } else {
              console.warn('User exists in Auth but not in Firestore');
              toast.error('User data not found. Please contact support.');
              firebaseSignOut(auth);
              setUser(null);
              setLoading(false);
            }
          }, 2000);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        if (!getLocalProfile()) {
          setUser(null);
          setLoading(false);
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshotRef.current) {
        unsubscribeSnapshotRef.current();
      }
    };
  }, []);

  const value = useMemo(
    () => ({ user, loading, signOut, refreshUser }),
    [user, loading, signOut, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
