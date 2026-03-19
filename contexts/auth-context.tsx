'use client';

import { createContext, useContext, useEffect, useState } from 'react';
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

  const refreshUser = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = { id: userDoc.id, ...userDoc.data() } as User;
          setUser(userData);
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        // Clean up previous snapshot listener if it exists
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
          unsubscribeSnapshot = null;
        }

        if (firebaseUser) {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          
          // First, check if document exists immediately
          const initialDoc = await getDoc(userDocRef);
          if (initialDoc.exists()) {
            const userData = { id: initialDoc.id, ...initialDoc.data() } as User;
            setUser(userData);
            setLoading(false);
            
            // Set up snapshot listener for real-time updates
            unsubscribeSnapshot = onSnapshot(userDocRef, (docSnapshot) => {
              if (docSnapshot.exists()) {
                const userData = { id: docSnapshot.id, ...docSnapshot.data() } as User;
                setUser(userData);
              }
            });
          } else {
            // Document doesn't exist - set up snapshot listener and wait
            let retryTimeout: NodeJS.Timeout | null = null;
            let hasChecked = false;
            
            unsubscribeSnapshot = onSnapshot(userDocRef, (docSnapshot) => {
              if (docSnapshot.exists()) {
                // Clear any pending retry
                if (retryTimeout) {
                  clearTimeout(retryTimeout);
                  retryTimeout = null;
                }
                const userData = { id: docSnapshot.id, ...docSnapshot.data() } as User;
                setUser(userData);
                setLoading(false);
              } else if (!hasChecked) {
                // First time seeing it doesn't exist - wait a bit then check again
                hasChecked = true;
                retryTimeout = setTimeout(async () => {
                  const retryDoc = await getDoc(userDocRef);
                  if (retryDoc.exists()) {
                    const userData = { id: retryDoc.id, ...retryDoc.data() } as User;
                    setUser(userData);
                    setLoading(false);
                  } else {
                    // After waiting, if still no document, show error
                    console.warn('User exists in Auth but not in Firestore after waiting');
                    toast.error('Your user data could not be found. If you just registered, please wait a moment and refresh. Otherwise, please contact support.');
                    firebaseSignOut(auth);
                    setUser(null);
                    setLoading(false);
                  }
                }, 2000);
              }
            }, (error) => {
              console.error('Error in user snapshot listener:', error);
              toast.error('There was an error fetching your user data.');
              setLoading(false);
            });
          }
        } else {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  const value = {
    user,
    loading,
    signOut,
    refreshUser
  };

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
