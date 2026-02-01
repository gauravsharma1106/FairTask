
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED'
}

export enum PlanTier {
  TRIAL = 'TRIAL',
  STARTER = 'STARTER', // 199
  BASIC = 'BASIC', // 259
  PRO = 'PRO', // 599
  ULTRA = 'ULTRA' // 999
}

export enum LeaderboardTimeframe {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  LIFETIME = 'LIFETIME'
}

export enum KycStatus {
  NOT_STARTED = 'NOT_STARTED',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  BLOCKED = 'BLOCKED'
}

export enum KycDocumentType {
  AADHAAR = 'AADHAAR',
  PAN = 'PAN',
  VOTER_ID = 'VOTER_ID',
  DRIVING_LICENSE = 'DRIVING_LICENSE'
}

export interface KycData {
  status: KycStatus;
  fullName?: string;
  documentType?: KycDocumentType;
  documentNumber?: string;
  documentImageFront?: string; // URL
  documentImageBack?: string; // URL
  submittedAt?: number;
  reviewedAt?: number;
  rejectionReason?: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string; // Already masked from backend
  planId: PlanTier;
  earnings: number; // Net Verified Earnings
  tasksCompleted: number;
  reward?: number; // Potential bonus
  isBonusLocked?: boolean; // True if user hasn't met unlock criteria
}

export interface Wallet {
  main: number;
  pending: number;
  bonus: number;
}

export interface BonusUnlockProgress {
  consecutiveDaysActive: number; // Target: 7
  hasCompletedWithdrawal: boolean; // Target: true
  lastActiveDate: string;
}

export interface ReferralStats {
  l1Count: number;
  l2Count: number;
  l3Count: number;
  totalEarnings: number; // Lifetime accumulated
}

// ADMIN ROLES
export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN', // Root
  FINANCE_ADMIN = 'FINANCE_ADMIN',
  KYC_ADMIN = 'KYC_ADMIN',
  SUPPORT_ADMIN = 'SUPPORT_ADMIN',
  FRAUD_ANALYST = 'FRAUD_ANALYST',
  CONTENT_ADMIN = 'CONTENT_ADMIN',
  AUDITOR = 'AUDITOR'
}

export type AdminPermission = 
  | 'MANAGE_ADMINS' // Create/Edit other admins
  | 'VIEW_DASHBOARD'
  | 'VIEW_USERS'
  | 'EDIT_USERS' // Freeze, Ban
  | 'VIEW_FINANCE'
  | 'APPROVE_WITHDRAWALS'
  | 'VIEW_KYC'
  | 'APPROVE_KYC'
  | 'VIEW_AUDIT'
  | 'MANAGE_SETTINGS' // Fees, Plans
  | 'EMERGENCY_CONTROL'; // Kill switches

export interface SubAdmin {
  id: string;
  name: string;
  phone: string; // Login ID
  role: AdminRole;
  permissions: AdminPermission[];
  active: boolean;
  lastLogin?: number;
  createdAt: number;
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
  referralStats: ReferralStats;
  deviceFingerprint: string;
  dailyStats: {
    date: string;
    videosWatched: number;
    linksVisited: number;
  };
  bonusUnlockProgress: BonusUnlockProgress;
  kyc: KycData;
  adminRole?: AdminRole; // If present, user has admin access
  permissions?: AdminPermission[]; // Specific permissions
}

export interface PlanConfig {
  id: PlanTier;
  priceINR: number;
  durationDays: number;
  dailyVideoLimit: number;
  dailyLinkLimit: number;
  videoRate: number; 
  videoRateBasis: number; // e.g. 5 or 6
  linkRate: number;
  linkRateBasis: number; // e.g. 5 or 7
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
  LEADERBOARD_BONUS = 'LEADERBOARD_BONUS',
  PLAN_PURCHASE = 'PLAN_PURCHASE',
  WITHDRAWAL = 'WITHDRAWAL',
  FEE_PLATFORM = 'FEE_PLATFORM',
  FEE_TX = 'FEE_TX',
  BONUS_UNLOCK = 'BONUS_UNLOCK', // Moving from Bonus to Main
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
  userKycStatus?: KycStatus; // Snapshot at time of request
}

export interface AuditLog {
  id: string;
  adminId: string;
  role: AdminRole;
  action: string;
  targetId?: string;
  details: string;
  timestamp: number;
  ip: string;
}

export interface SystemSettings {
  platformFeePercent: number;
  transactionFeePercent: number;
  minWithdrawalTrial: number;
  minWithdrawalPaid: number;
  referralsEnabled: boolean;
  maintenanceMode: boolean;
}

export interface EmergencyState {
    withdrawalsPaused: boolean;
    earningsPaused: boolean;
    referralsPaused: boolean;
}
