
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserStatus, PlanTier, KycStatus, AdminRole, AdminPermission } from '../types';
import { BackendService } from './mockBackend';

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
    bonus: 18.20
  },
  referralCode: 'EARN123',
  referredBy: 'MASTER_REF',
  referralStats: {
      l1Count: 12,
      l2Count: 27,
      l3Count: 41,
      totalEarnings: 45.50
  },
  deviceFingerprint: 'fp_123abc',
  dailyStats: {
    date: new Date().toISOString().split('T')[0],
    videosWatched: 2,
    linksVisited: 1
  },
  bonusUnlockProgress: {
      consecutiveDaysActive: 4,
      hasCompletedWithdrawal: false,
      lastActiveDate: new Date().toISOString().split('T')[0]
  },
  kyc: {
      status: KycStatus.NOT_STARTED
  }
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  adminRole: AdminRole | null;
  permissions: AdminPermission[];
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
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let loggedInUser = { ...MOCK_USER, phone };
    const cleanPhone = phone.replace(/\D/g, '');

    // 1. ROOT ADMIN CHECK (Hardcoded Credential)
    if (cleanPhone === '9785927373' && otp === '7458') {
        loggedInUser = { 
            ...loggedInUser, 
            name: 'ROOT ADMIN', 
            email: 'root@fairtask.app', 
            uid: 'admin_root', 
            adminRole: AdminRole.SUPER_ADMIN,
            // Super Admin has implicit full access, but we list key ones for UI
            permissions: ['MANAGE_ADMINS', 'EMERGENCY_CONTROL', 'MANAGE_SETTINGS', 'VIEW_AUDIT'] 
        };
    } else {
        // 2. CHECK SUB-ADMINS (Backend Mock)
        const subAdmins = await BackendService.getSubAdmins();
        const foundAdmin = subAdmins.find(a => a.phone === cleanPhone && a.active);

        if (foundAdmin) {
             loggedInUser = { 
                ...loggedInUser, 
                name: foundAdmin.name, 
                email: `${foundAdmin.role.toLowerCase()}@fairtask.app`, 
                uid: foundAdmin.id, 
                adminRole: foundAdmin.role,
                permissions: foundAdmin.permissions
            };
        }
        // 3. Normal User (Demo) - Fallthrough
    }

    setUser(loggedInUser);
    localStorage.setItem('earn_auth', JSON.stringify(loggedInUser));
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('earn_auth');
  };

  const refreshUser = async () => {
    if (user) {
      const stored = localStorage.getItem('earn_auth');
      if(stored) {
          const storedUser = JSON.parse(stored);
          setUser(storedUser); 
      }
    }
  };

  const isAdmin = !!user?.adminRole;
  const adminRole = user?.adminRole || null;
  const permissions = user?.permissions || [];

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, adminRole, permissions, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
