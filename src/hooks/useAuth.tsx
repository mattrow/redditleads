"use client";
import { useEffect, useState, createContext, useContext } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { analytics } from '@/firebase/config';
import { setUserId, setUserProperties } from 'firebase/analytics';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface AuthContextType {
  user: User | null;
  userData: any; // User data from Firestore
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, userData: null, loading: true, logout: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (analytics && firebaseUser) {
        // Set the user ID
        setUserId(analytics, firebaseUser.uid);

        // Set user properties
        setUserProperties(analytics, {
          email: firebaseUser.email || '',
          subscription_status: 'free', // You can update this based on actual status
        });
      }

      if (firebaseUser) {
        const fetchUserData = async () => {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            setUserData(userDoc.data() as any);
          }
        };
        fetchUserData();
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, userData, loading, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);