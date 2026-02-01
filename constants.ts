
import { PlanConfig, PlanTier } from './types';

export const APP_NAME = "FairTask";
export const CURRENCY_SYMBOL = "$"; // Internal logic uses USD for earnings
export const DISPLAY_CURRENCY = "USD";
export const EXCHANGE_RATE = 83; // Fixed rate for display/conversion 

export const FEES = {
  PLATFORM_PERCENT: 0.10, // 10%
  TRANSACTION_PERCENT: 0.05, // 5%
  NET_PAYOUT_PERCENT: 0.85 // 85%
};

export const UNLOCK_RULES = {
  REQUIRED_DAYS: 7,
  REQUIRED_TASK_PERCENTAGE: 0.60 // 60%
};

export const PLANS: Record<PlanTier, PlanConfig> = {
  [PlanTier.TRIAL]: {
    id: PlanTier.TRIAL,
    priceINR: 59,
    durationDays: 7,
    dailyVideoLimit: 8,
    dailyLinkLimit: 3,
    videoRate: 0.3,
    videoRateBasis: 5,
    linkRate: 0.5,
    linkRateBasis: 5,
    minWithdrawal: 10
  },
  [PlanTier.STARTER]: {
    id: PlanTier.STARTER,
    priceINR: 199,
    durationDays: 30,
    dailyVideoLimit: 15,
    dailyLinkLimit: 8,
    videoRate: 0.5,
    videoRateBasis: 5,
    linkRate: 0.7,
    linkRateBasis: 5,
    minWithdrawal: 50
  },
  [PlanTier.BASIC]: {
    id: PlanTier.BASIC,
    priceINR: 259,
    durationDays: 30,
    dailyVideoLimit: 15,
    dailyLinkLimit: 10,
    videoRate: 0.7,
    videoRateBasis: 5,
    linkRate: 0.9,
    linkRateBasis: 5,
    minWithdrawal: 50
  },
  [PlanTier.PRO]: {
    id: PlanTier.PRO,
    priceINR: 599,
    durationDays: 30,
    dailyVideoLimit: 20,
    dailyLinkLimit: 15,
    videoRate: 0.7,
    videoRateBasis: 5,
    linkRate: 0.9,
    linkRateBasis: 5,
    minWithdrawal: 50
  },
  [PlanTier.ULTRA]: {
    id: PlanTier.ULTRA,
    priceINR: 999,
    durationDays: 30,
    dailyVideoLimit: 50,
    dailyLinkLimit: 20,
    videoRate: 1.0,
    videoRateBasis: 6,
    linkRate: 1.0,
    linkRateBasis: 7,
    minWithdrawal: 50
  }
};

export const REFERRAL_BONUS = {
  PLAN: { L1: 0.08, L2: 0.04, L3: 0.02 },
  TASK: { L1: 0.03, L2: 0.02, L3: 0.01 }
};

export const LEADERBOARD_REWARDS = {
  DAILY: {
    1: 2.0,
    2: 1.5,
    3: 1.0
  },
  WEEKLY: {
    1: 10.0,
    2: 7.0,
    3: 5.0,
    4: 3.0,
    5: 2.0
  },
  MONTHLY: {
    1: 50.0,
    2: 35.0,
    3: 25.0,
    REST_TOP_10: 10.0 // Ranks 4-10
  }
};
