import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserStatus, PlanTier } from '../types';
import { PLANS } from '../constants';

// MOCK USER FOR DEMO
const MOCK_USER: User = {
  uid: 'user_12345',
  name: 'Demo User',
  email: 'user@example.com',
  status: UserStatus.ACTIVE,
  planId: PlanTier.TRIAL,
  planExpiry: Date.now() + 7 * 24 * 60 * 60 * 1000,
  wallet: {
    main: 12.50,
    pending: 3.20,
    bonus: 5.00
  },
  referralCode: 'EARN123',
  deviceFingerprint: 'fp_123abc',
  dailyStats: {
    date: new Date().toISOString().split('T')[0],
    videosWatched: 2,
    linksVisited: 1
  }
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial auth check
    setTimeout(() => {
      const stored = localStorage.getItem('earn_auth');
      if (stored) {
        setUser(JSON.parse(stored));
      }
      setLoading(false);
    }, 800);
  }, []);

  const login = async (phone: string, otp: string) => {
    setLoading(true);
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In real app: Firebase Auth signInWithCredential
    // Then fetch user doc from Firestore
    
    const loggedInUser = { ...MOCK_USER, phone };
    setUser(loggedInUser);
    localStorage.setItem('earn_auth', JSON.stringify(loggedInUser));
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('earn_auth');
  };

  const refreshUser = async () => {
    // In real app: Fetch latest doc from Firestore
    if (user) {
      // Simulate refresh
      const updated = { ...user }; // shallow copy
      setUser(updated);
    }
  };

  const isAdmin = user?.email === 'admin@earnx.com' || user?.uid === 'admin_master';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);