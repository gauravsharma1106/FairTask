export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED'
}

export enum PlanTier {
  TRIAL = 'TRIAL',
  BASIC = 'BASIC', // 199
  STANDARD = 'STANDARD', // 259
  PREMIUM = 'PREMIUM', // 599
  ELITE = 'ELITE' // 999
}

export interface Wallet {
  main: number;
  pending: number;
  bonus: number;
}

export interface User {
  uid: string;
  email?: string;
  phone?: string;
  name: string;
  status: UserStatus;
  planId: PlanTier;
  planExpiry: number; // Timestamp
  wallet: Wallet;
  referralCode: string;
  referredBy?: string;
  deviceFingerprint: string;
  dailyStats: {
    date: string;
    videosWatched: number;
    linksVisited: number;
  };
}

export interface PlanConfig {
  id: PlanTier;
  priceINR: number;
  durationDays: number;
  dailyVideoLimit: number;
  dailyLinkLimit: number;
  videoRate: number; // per 5 videos
  linkRate: number; // per 5 links
  minWithdrawal: number;
}

export interface Task {
  id: string;
  type: 'VIDEO' | 'LINK';
  reward: number;
  duration: number; // seconds
  title: string;
}

export enum TransactionType {
  EARN_VIDEO = 'EARN_VIDEO',
  EARN_LINK = 'EARN_LINK',
  REFERRAL_BONUS = 'REFERRAL_BONUS',
  PLAN_PURCHASE = 'PLAN_PURCHASE',
  WITHDRAWAL = 'WITHDRAWAL',
  FEE_PLATFORM = 'FEE_PLATFORM',
  FEE_TX = 'FEE_TX',
  ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface LedgerEntry {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: 'USD' | 'INR'; // Base earning is USD, Payment INR
  status: TransactionStatus;
  timestamp: number;
  description: string;
  balanceAfter: number; // Snapshot
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  netAmount: number;
  status: TransactionStatus;
  timestamp: number;
  method: 'UPI' | 'BANK';
  details: string;
}