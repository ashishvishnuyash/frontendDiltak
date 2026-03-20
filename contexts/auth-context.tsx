'use client';

import { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const unsubscribeSnapshotRef = useRef<(() => void) | null>(null);

  const refreshUser = useCallback(async () => {
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
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clean up previous snapshot listener
      if (unsubscribeSnapshotRef.current) {
        unsubscribeSnapshotRef.current();
        unsubscribeSnapshotRef.current = null;
      }

      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const initialDoc = await getDoc(userDocRef);

        if (initialDoc.exists()) {
          setUser({ id: initialDoc.id, ...initialDoc.data() } as User);
          setLoading(false);

          // Real-time updates after initial load
          unsubscribeSnapshotRef.current = onSnapshot(userDocRef, (snap) => {
            if (snap.exists()) {
              setUser({ id: snap.id, ...snap.data() } as User);
            }
          }, (err) => {
            console.error('Snapshot error:', err);
          });
        } else {
          // Wait for document to be created (e.g. after registration)
          let retryTimeout: ReturnType<typeof setTimeout> | null = null;

          unsubscribeSnapshotRef.current = onSnapshot(userDocRef, (snap) => {
            if (snap.exists()) {
              if (retryTimeout) clearTimeout(retryTimeout);
              setUser({ id: snap.id, ...snap.data() } as User);
              setLoading(false);
            }
          }, (err) => {
            console.error('Error in user snapshot listener:', err);
            setLoading(false);
          });

          retryTimeout = setTimeout(async () => {
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
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshotRef.current) {
        unsubscribeSnapshotRef.current();
      }
    };
  }, []);

  const value = useMemo(() => ({ user, loading, signOut, refreshUser }), [user, loading, signOut, refreshUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
