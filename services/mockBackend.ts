
import { User, TransactionType, TransactionStatus, LedgerEntry, PlanTier, LeaderboardEntry, LeaderboardTimeframe, KycData, KycStatus, WithdrawalRequest, AuditLog, AdminRole, SystemSettings, SubAdmin, AdminPermission, EmergencyState, UserStatus, KycDocumentType } from '../types';
import { PLANS, FEES, LEADERBOARD_REWARDS, UNLOCK_RULES } from '../constants';

// This file simulates strict server-side logic that would normally reside in Firebase Cloud Functions.

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- IN-MEMORY DATABASE (MOCK) ---

let systemSettings: SystemSettings = {
    platformFeePercent: 10,
    transactionFeePercent: 5,
    minWithdrawalTrial: 10,
    minWithdrawalPaid: 50,
    referralsEnabled: true,
    maintenanceMode: false
};

let emergencyState: EmergencyState = {
    withdrawalsPaused: false,
    earningsPaused: false,
    referralsPaused: false
};

let auditLogs: AuditLog[] = [
    {
        id: 'log_1',
        adminId: 'admin_root',
        role: AdminRole.SUPER_ADMIN,
        action: 'SYSTEM_INIT',
        details: 'System initialized by Super Admin',
        timestamp: Date.now() - 1000000,
        ip: '10.0.0.1'
    }
];

let subAdmins: SubAdmin[] = [
    {
        id: 'admin_fin_01',
        name: 'Finance Lead',
        phone: '1111111111',
        role: AdminRole.FINANCE_ADMIN,
        permissions: ['VIEW_DASHBOARD', 'VIEW_FINANCE', 'APPROVE_WITHDRAWALS'],
        active: true,
        createdAt: Date.now()
    }
];

// Mock Users
let users: User[] = [
    {
       uid: 'user_101',
       name: 'Alice Cooper',
       phone: '+919876543210',
       email: 'alice@example.com',
       status: UserStatus.ACTIVE,
       planId: PlanTier.PRO,
       planExpiry: Date.now() + 86400000 * 20,
       wallet: { main: 150.20, pending: 12.00, bonus: 45.00 },
       referralCode: 'ALICE01',
       referralStats: { l1Count: 5, l2Count: 2, l3Count: 0, totalEarnings: 12 },
       deviceFingerprint: 'fp_a1',
       dailyStats: { date: new Date().toISOString().split('T')[0], videosWatched: 5, linksVisited: 2 },
       bonusUnlockProgress: { consecutiveDaysActive: 5, hasCompletedWithdrawal: false, lastActiveDate: '' },
       kyc: { 
           status: KycStatus.APPROVED,
           fullName: 'Alice Cooper',
           documentType: KycDocumentType.PAN,
           documentNumber: 'ABCDE1234F',
           submittedAt: Date.now() - 100000,
           reviewedAt: Date.now()
       }
    },
    {
       uid: 'user_102',
       name: 'Bob Marley',
       phone: '+919988776655',
       email: 'bob@example.com',
       status: UserStatus.SUSPENDED,
       planId: PlanTier.TRIAL,
       planExpiry: Date.now() - 86400000,
       wallet: { main: 5.00, pending: 0, bonus: 0 },
       referralCode: 'BOBBY',
       referralStats: { l1Count: 0, l2Count: 0, l3Count: 0, totalEarnings: 0 },
       deviceFingerprint: 'fp_b2',
       dailyStats: { date: new Date().toISOString().split('T')[0], videosWatched: 0, linksVisited: 0 },
       bonusUnlockProgress: { consecutiveDaysActive: 1, hasCompletedWithdrawal: false, lastActiveDate: '' },
       kyc: { 
           status: KycStatus.REJECTED,
           fullName: 'Bob Marley',
           documentType: KycDocumentType.AADHAAR,
           submittedAt: Date.now() - 200000,
           reviewedAt: Date.now() - 100000,
           rejectionReason: 'Image blurred'
       }
    },
    {
       uid: 'user_12345', // The Demo User
       name: 'Demo User',
       phone: '9876543210',
       email: 'user@example.com',
       status: UserStatus.ACTIVE,
       planId: PlanTier.TRIAL,
       planExpiry: Date.now() + 7 * 24 * 60 * 60 * 1000,
       wallet: { main: 12.50, pending: 3.20, bonus: 18.20 },
       referralCode: 'EARN123',
       referralStats: { l1Count: 12, l2Count: 27, l3Count: 41, totalEarnings: 45.50 },
       deviceFingerprint: 'fp_123abc',
       dailyStats: { date: new Date().toISOString().split('T')[0], videosWatched: 2, linksVisited: 1 },
       bonusUnlockProgress: { consecutiveDaysActive: 4, hasCompletedWithdrawal: false, lastActiveDate: new Date().toISOString().split('T')[0] },
       kyc: { status: KycStatus.NOT_STARTED }
    }
];

let pendingKycRequests: {userId: string, data: KycData}[] = [];

// Mock Withdrawals
let withdrawals: WithdrawalRequest[] = [
    {
        id: 'tx_w_1',
        userId: 'user_101',
        amount: 50.00,
        netAmount: 42.50,
        status: TransactionStatus.PENDING,
        timestamp: Date.now() - 3600000, // 1 hour ago
        method: 'UPI',
        details: 'alice@upi',
        userKycStatus: KycStatus.APPROVED
    }
];

export const BackendService = {
  
  // --- USER CLIENT METHODS ---
  async completeTask(user: User, taskType: 'VIDEO' | 'LINK'): Promise<{ success: boolean; reward?: number; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 800)); 

    if (emergencyState.earningsPaused) {
        return { success: false, error: 'Earning system temporarily paused by admin.' };
    }

    const plan = PLANS[user.planId];
    
    // Validation: Plan Limits
    const currentCount = taskType === 'VIDEO' ? user.dailyStats.videosWatched : user.dailyStats.linksVisited;
    const limit = taskType === 'VIDEO' ? plan.dailyVideoLimit : plan.dailyLinkLimit;

    if (currentCount >= limit) {
      return { success: false, error: 'Daily limit reached for this plan.' };
    }

    if (user.status !== UserStatus.ACTIVE) {
      return { success: false, error: 'Account suspended.' };
    }

    const rewardRate = taskType === 'VIDEO' ? plan.videoRate : plan.linkRate;
    const rateBasis = taskType === 'VIDEO' ? plan.videoRateBasis : plan.linkRateBasis;
    const perTaskReward = rewardRate / rateBasis;

    // Update in-memory user
    const dbUser = users.find(u => u.uid === user.uid);
    if (dbUser) {
        dbUser.wallet.pending += perTaskReward;
        if (taskType === 'VIDEO') dbUser.dailyStats.videosWatched += 1;
        else dbUser.dailyStats.linksVisited += 1;
    }

    // Return result for local storage update
    return { success: true, reward: perTaskReward };
  },

  async requestWithdrawal(user: User, amount: number, method: string, details: string): Promise<{ success: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (emergencyState.withdrawalsPaused) {
        return { success: false, error: 'Withdrawals are temporarily paused for auditing.' };
    }

    if (user.kyc.status !== KycStatus.APPROVED) {
        return { success: false, error: 'KYC Verification Required.' };
    }

    const minWithdraw = user.planId === PlanTier.TRIAL ? systemSettings.minWithdrawalTrial : systemSettings.minWithdrawalPaid;

    if (amount < minWithdraw) {
      return { success: false, error: `Minimum withdrawal is $${minWithdraw}` };
    }

    if (user.wallet.main < amount) {
      return { success: false, error: 'Insufficient main wallet balance.' };
    }

    // Deduct from wallet immediately
    const dbUser = users.find(u => u.uid === user.uid);
    if(dbUser) {
        dbUser.wallet.main -= amount;
        dbUser.bonusUnlockProgress.hasCompletedWithdrawal = true;
    }

    // Create withdrawal request
    const net = amount * (1 - (systemSettings.platformFeePercent + systemSettings.transactionFeePercent) / 100);
    withdrawals.unshift({
        id: `tx_w_${generateId()}`,
        userId: user.uid,
        amount: amount,
        netAmount: parseFloat(net.toFixed(2)),
        status: TransactionStatus.PENDING,
        timestamp: Date.now(),
        method: method as any,
        details: details,
        userKycStatus: user.kyc.status
    });

    return { success: true };
  },

  async unlockBonus(user: User): Promise<{ success: boolean; message?: string }> {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { consecutiveDaysActive, hasCompletedWithdrawal } = user.bonusUnlockProgress;
      const canUnlock = consecutiveDaysActive >= UNLOCK_RULES.REQUIRED_DAYS || hasCompletedWithdrawal;

      if (!canUnlock) return { success: false, message: 'Requirement not met.' };
      if (user.wallet.bonus <= 0) return { success: false, message: 'No bonus balance.' };

      const amountToUnlock = user.wallet.bonus;
      
      const dbUser = users.find(u => u.uid === user.uid);
      if(dbUser) {
          dbUser.wallet.bonus = 0;
          dbUser.wallet.main += amountToUnlock;
      }

      return { success: true, message: `$${amountToUnlock.toFixed(2)} unlocked!` };
  },

  async submitKyc(user: User, data: Partial<KycData>): Promise<{ success: boolean }> {
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      const newKycState: KycData = {
          ...user.kyc,
          ...data,
          status: KycStatus.SUBMITTED,
          submittedAt: Date.now(),
          rejectionReason: undefined
      };

      // Update Database
      const dbUser = users.find(u => u.uid === user.uid);
      if(dbUser) dbUser.kyc = newKycState;

      pendingKycRequests.push({ userId: user.uid, data: newKycState });
      return { success: true };
  },

  async getLedger(userId: string): Promise<LedgerEntry[]> {
    return [
      {
        id: 'tx_1',
        userId,
        type: TransactionType.EARN_VIDEO,
        amount: 0.06,
        currency: 'USD',
        status: TransactionStatus.PENDING,
        timestamp: Date.now() - 100000,
        description: 'Watched Ad Video',
        balanceAfter: 0
      }
    ];
  },

  async getReferralNetwork(userId: string): Promise<any[]> {
      await new Promise(resolve => setTimeout(resolve, 500));
      return Array.from({ length: 5 }).map((_, i) => ({
          id: `ref_${i}`,
          user: `User${Math.floor(Math.random()*1000)}`,
          level: Math.random() > 0.6 ? 2 : 1,
          plan: PlanTier.STARTER,
          joined: Date.now() - 100000,
          earnings: (Math.random() * 5).toFixed(2)
      }));
  },

  async getLeaderboard(timeframe: LeaderboardTimeframe, currentUserId?: string): Promise<LeaderboardEntry[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Generate mock data
    const mockEntries: LeaderboardEntry[] = Array.from({ length: 20 }).map((_, i) => ({
        rank: i + 1,
        userId: i === 5 ? (currentUserId || 'user_12345') : `user_${generateId()}`,
        name: i === 5 ? 'You' : `User ${Math.floor(Math.random() * 9000) + 1000}`,
        planId: [PlanTier.ULTRA, PlanTier.PRO, PlanTier.BASIC, PlanTier.STARTER, PlanTier.TRIAL][Math.floor(Math.random() * 5)],
        earnings: parseFloat((Math.random() * 100).toFixed(2)),
        tasksCompleted: Math.floor(Math.random() * 500),
        reward: i < 3 ? [50, 35, 25][i] : undefined,
        isBonusLocked: Math.random() > 0.5
    })).sort((a, b) => b.earnings - a.earnings).map((e, i) => ({ ...e, rank: i + 1 })); // Resort by earnings and assign ranks

    return mockEntries;
  },

  // --- ADMIN MANAGEMENT METHODS ---
  
  async getSubAdmins(): Promise<SubAdmin[]> {
      return subAdmins;
  },

  async createSubAdmin(adminData: Omit<SubAdmin, 'id' | 'createdAt'>, performedBy: string): Promise<SubAdmin> {
      await new Promise(resolve => setTimeout(resolve, 800));
      const newAdmin: SubAdmin = { ...adminData, id: `admin_${generateId()}`, createdAt: Date.now() };
      subAdmins.push(newAdmin);
      auditLogs.unshift({ id: generateId(), adminId: performedBy, role: AdminRole.SUPER_ADMIN, action: 'CREATE_ADMIN', details: `Created ${newAdmin.role}`, timestamp: Date.now(), ip: '127.0.0.1' });
      return newAdmin;
  },

  async deleteSubAdmin(id: string, performedBy: string): Promise<void> {
      subAdmins = subAdmins.filter(a => a.id !== id);
      auditLogs.unshift({ id: generateId(), adminId: performedBy, role: AdminRole.SUPER_ADMIN, action: 'DELETE_ADMIN', details: `Deleted admin ${id}`, timestamp: Date.now(), ip: '127.0.0.1' });
  },

  async getEmergencyState(): Promise<EmergencyState> {
      return emergencyState;
  },

  async toggleEmergencyState(key: keyof EmergencyState, value: boolean, performedBy: string): Promise<void> {
      emergencyState[key] = value;
      auditLogs.unshift({ id: generateId(), adminId: performedBy, role: AdminRole.SUPER_ADMIN, action: 'EMERGENCY_ACTION', details: `Set ${key} to ${value}`, timestamp: Date.now(), ip: '127.0.0.1' });
  },

  // --- USER MANAGEMENT ---

  async adminGetUsers(): Promise<User[]> {
      return [...users]; // Return copy
  },

  async adminUpdateUserStatus(uid: string, status: UserStatus, adminId: string): Promise<void> {
      await new Promise(resolve => setTimeout(resolve, 500));
      const idx = users.findIndex(u => u.uid === uid);
      if (idx !== -1) {
          users[idx].status = status;
          auditLogs.unshift({ id: generateId(), adminId, role: AdminRole.SUPPORT_ADMIN, action: 'USER_STATUS_CHANGE', targetId: uid, details: `Status to ${status}`, timestamp: Date.now(), ip: '127.0.0.1' });
      }
  },

  // --- FINANCE ---

  async adminGetWithdrawals(): Promise<WithdrawalRequest[]> {
      return [...withdrawals];
  },

  async adminProcessWithdrawal(id: string, status: TransactionStatus.COMPLETED | TransactionStatus.FAILED | TransactionStatus.CANCELLED, adminId: string): Promise<void> {
      await new Promise(resolve => setTimeout(resolve, 800));
      const idx = withdrawals.findIndex(w => w.id === id);
      if(idx !== -1) {
          withdrawals[idx].status = status;
          auditLogs.unshift({ id: generateId(), adminId, role: AdminRole.FINANCE_ADMIN, action: `PAYOUT_${status}`, targetId: id, details: `Amount: $${withdrawals[idx].amount}`, timestamp: Date.now(), ip: '127.0.0.1' });
      }
  },

  // --- KYC ---

  async adminGetKycRequests(): Promise<{userId: string, data: KycData}[]> {
      return pendingKycRequests;
  },

  async adminReviewKyc(userId: string, status: KycStatus.APPROVED | KycStatus.REJECTED, reason?: string, adminId?: string): Promise<{ success: boolean }> {
      await new Promise(resolve => setTimeout(resolve, 800));
      pendingKycRequests = pendingKycRequests.filter(r => r.userId !== userId);
      
      const user = users.find(u => u.uid === userId);
      if(user) {
          user.kyc.status = status;
          user.kyc.reviewedAt = Date.now();
          if(reason) user.kyc.rejectionReason = reason;
      }

      auditLogs.unshift({ id: generateId(), adminId: adminId || 'sys', role: AdminRole.KYC_ADMIN, action: `KYC_${status}`, targetId: userId, details: reason || '', timestamp: Date.now(), ip: '127.0.0.1' });
      return { success: true };
  },

  async adminGetAuditLogs(filterAdminId?: string): Promise<AuditLog[]> {
      if (filterAdminId) return auditLogs.filter(log => log.adminId === filterAdminId);
      return auditLogs;
  },

  async adminGetSettings(): Promise<SystemSettings> {
      return systemSettings;
  },

  async adminUpdateSettings(newSettings: SystemSettings, adminId: string): Promise<boolean> {
      await new Promise(resolve => setTimeout(resolve, 500));
      systemSettings = newSettings;
      auditLogs.unshift({ id: generateId(), adminId, role: AdminRole.SUPER_ADMIN, action: 'UPDATE_SETTINGS', details: 'Config updated', timestamp: Date.now(), ip: '127.0.0.1' });
      return true;
  }
};
