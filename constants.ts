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

export const PLANS: Record<PlanTier, PlanConfig> = {
  [PlanTier.TRIAL]: {
    id: PlanTier.TRIAL,
    priceINR: 59,
    durationDays: 7,
    dailyVideoLimit: 5,
    dailyLinkLimit: 5,
    videoRate: 0.3, // for 5 videos ($0.06 per video)
    linkRate: 0.5, // for 5 links ($0.10 per link)
    minWithdrawal: 10
  },
  [PlanTier.BASIC]: {
    id: PlanTier.BASIC,
    priceINR: 199,
    durationDays: 30,
    dailyVideoLimit: 5,
    dailyLinkLimit: 5,
    videoRate: 0.5,
    linkRate: 0.7,
    minWithdrawal: 50
  },
  [PlanTier.STANDARD]: {
    id: PlanTier.STANDARD,
    priceINR: 259,
    durationDays: 30,
    dailyVideoLimit: 5,
    dailyLinkLimit: 5,
    videoRate: 0.7,
    linkRate: 0.9,
    minWithdrawal: 50
  },
  [PlanTier.PREMIUM]: {
    id: PlanTier.PREMIUM,
    priceINR: 599,
    durationDays: 30,
    dailyVideoLimit: 5,
    dailyLinkLimit: 5,
    videoRate: 0.7,
    linkRate: 0.9,
    minWithdrawal: 50
  },
  [PlanTier.ELITE]: {
    id: PlanTier.ELITE,
    priceINR: 999,
    durationDays: 30,
    dailyVideoLimit: 6,
    dailyLinkLimit: 7,
    videoRate: 1.0, // for 6 videos (~$0.166)
    linkRate: 1.0, // for 7 links (~$0.142)
    minWithdrawal: 50
  }
};

export const REFERRAL_BONUS = {
  PLAN: { L1: 0.08, L2: 0.04, L3: 0.02 },
  TASK: { L1: 0.03, L2: 0.02, L3: 0.01 }
};