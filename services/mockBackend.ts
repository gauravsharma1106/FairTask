import { User, TransactionType, TransactionStatus, LedgerEntry, PlanTier } from '../types';
import { PLANS, FEES } from '../constants';

// This file simulates strict server-side logic that would normally reside in Firebase Cloud Functions.
// It ensures rules are enforced regardless of client state.

const generateId = () => Math.random().toString(36).substr(2, 9);

export const BackendService = {
  
  // SIMULATES: functions.https.onCall(verifyTaskCompletion)
  async completeTask(user: User, taskType: 'VIDEO' | 'LINK'): Promise<{ success: boolean; reward?: number; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Network latency

    const today = new Date().toISOString().split('T')[0];
    const plan = PLANS[user.planId];
    
    // 1. Validation: Plan Limits
    if (user.dailyStats.date !== today) {
        // Reset stats logic would happen here on server
    }

    const currentCount = taskType === 'VIDEO' ? user.dailyStats.videosWatched : user.dailyStats.linksVisited;
    const limit = taskType === 'VIDEO' ? plan.dailyVideoLimit : plan.dailyLinkLimit;

    if (currentCount >= limit) {
      return { success: false, error: 'Daily limit reached for this plan.' };
    }

    // 2. Validation: Anti-Fraud (Mock)
    // In real app: Verify captcha token, callback signature, and device fingerprint
    if (user.status !== 'ACTIVE') {
      return { success: false, error: 'Account suspended.' };
    }

    // 3. Calculation: Dynamic Reward
    // Rate is defined per 5 tasks. Calculate single task value.
    const baseRate = taskType === 'VIDEO' ? plan.videoRate : plan.linkRate;
    const perTaskReward = baseRate / 5; // e.g., 0.3 / 5 = 0.06

    // 4. Ledger: Create Transaction (Immutable Record)
    // This simulates firestore.collection('ledger').add(...)
    const transaction: LedgerEntry = {
      id: generateId(),
      userId: user.uid,
      type: taskType === 'VIDEO' ? TransactionType.EARN_VIDEO : TransactionType.EARN_LINK,
      amount: perTaskReward,
      currency: 'USD',
      status: TransactionStatus.COMPLETED,
      timestamp: Date.now(),
      description: `Completed ${taskType} task`,
      balanceAfter: user.wallet.pending + perTaskReward // Simplified
    };

    console.log('[SERVER] Ledger Entry Created:', transaction);

    return { success: true, reward: perTaskReward };
  },

  // SIMULATES: functions.https.onCall(requestWithdrawal)
  async requestWithdrawal(user: User, amount: number, method: string, details: string): Promise<{ success: boolean; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const plan = PLANS[user.planId];

    // 1. Validation: Min Withdraw
    if (amount < plan.minWithdrawal) {
      return { success: false, error: `Minimum withdrawal is $${plan.minWithdrawal}` };
    }

    // 2. Validation: Balance
    if (user.wallet.main < amount) {
      return { success: false, error: 'Insufficient main wallet balance.' };
    }

    // 3. Calculation: Fees
    const platformFee = amount * FEES.PLATFORM_PERCENT;
    const txFee = amount * FEES.TRANSACTION_PERCENT;
    const netPayout = amount - platformFee - txFee;

    // 4. Ledger Write
    console.log('[SERVER] Withdrawal Requested:', {
      gross: amount,
      fees: platformFee + txFee,
      net: netPayout
    });

    return { success: true };
  },

  // SIMULATES: fetching ledger
  async getLedger(userId: string): Promise<LedgerEntry[]> {
    return [
      {
        id: 'tx_1',
        userId,
        type: TransactionType.EARN_VIDEO,
        amount: 0.06,
        currency: 'USD',
        status: TransactionStatus.COMPLETED,
        timestamp: Date.now() - 100000,
        description: 'Watched Ad Video',
        balanceAfter: 12.06
      },
      {
        id: 'tx_2',
        userId,
        type: TransactionType.PLAN_PURCHASE,
        amount: -59,
        currency: 'INR',
        status: TransactionStatus.COMPLETED,
        timestamp: Date.now() - 86400000,
        description: 'Trial Plan Purchase',
        balanceAfter: 0
      }
    ];
  }
};