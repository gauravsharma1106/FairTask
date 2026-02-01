
import React, { useEffect, useState } from 'react';
import { useAuth } from '../services/authContext';
import { BackendService } from '../services/mockBackend';
import { Card, Button, Input, Badge } from '../components/ui';
import { PLANS, FEES, EXCHANGE_RATE, UNLOCK_RULES } from '../constants';
import { LedgerEntry, TransactionStatus, KycStatus } from '../types';
import toast from 'react-hot-toast';
import { Wallet as WalletIcon, ArrowUpRight, Clock, ShieldCheck, Lock, Unlock, CheckCircle, Info, RefreshCw, AlertTriangle, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Wallet: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'balances' | 'withdraw'>('balances');
  const [unlocking, setUnlocking] = useState(false);
  
  if (!user) return null;
  const plan = PLANS[user.planId];

  useEffect(() => {
    loadLedger();
  }, []);

  const loadLedger = async () => {
    const data = await BackendService.getLedger(user.uid);
    setLedger(data);
    setLoading(false);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
      e.preventDefault();
      const amount = parseFloat(withdrawAmount);
      
      if (isNaN(amount) || amount <= 0) return;

      const promise = BackendService.requestWithdrawal(user, amount, 'UPI', 'user@upi');
      
      toast.promise(promise, {
          loading: 'Processing secure request...',
          success: (res) => {
              if(!res.success) throw new Error(res.error);
              refreshUser();
              loadLedger();
              return 'Withdrawal requested successfully';
          },
          error: (e) => e.message || 'Failed'
      });
  };

  const handleUnlockBonus = async () => {
      setUnlocking(true);
      const res = await BackendService.unlockBonus(user);
      if (res.success) {
          toast.success(res.message || 'Bonus Unlocked!');
          refreshUser();
      } else {
          toast.error(res.message || 'Cannot unlock yet');
      }
      setUnlocking(false);
  };

  const grossAmount = parseFloat(withdrawAmount || '0');
  const platformFee = grossAmount * FEES.PLATFORM_PERCENT;
  const txFee = grossAmount * FEES.TRANSACTION_PERCENT;
  const netPayout = (grossAmount - platformFee - txFee).toFixed(2);

  const canUnlock = user.bonusUnlockProgress.consecutiveDaysActive >= UNLOCK_RULES.REQUIRED_DAYS || user.bonusUnlockProgress.hasCompletedWithdrawal;
  const isKycApproved = user.kyc.status === KycStatus.APPROVED;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                <WalletIcon size={28} />
            </div>
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Wallet</h1>
                <p className="text-gray-500 text-sm">Manage earnings, bonuses & payouts</p>
            </div>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
                onClick={() => setActiveTab('balances')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'balances' ? 'bg-white shadow text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Balances
            </button>
            <button 
                onClick={() => setActiveTab('withdraw')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'withdraw' ? 'bg-white shadow text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
                Withdraw
            </button>
        </div>
      </div>

      {activeTab === 'balances' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 3-Wallet Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Main Wallet */}
                <div className="rounded-2xl p-6 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden flex flex-col justify-between h-48">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <ShieldCheck size={80} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge type="success" className="bg-emerald-500/30 text-emerald-100 border-0">Withdrawable</Badge>
                        </div>
                        <h2 className="text-4xl font-extrabold mt-1">${user.wallet.main.toFixed(2)}</h2>
                        <p className="text-xs text-emerald-100/70 font-mono">≈ ₹{(user.wallet.main * EXCHANGE_RATE).toFixed(2)}</p>
                    </div>
                    <div className="pt-4 border-t border-emerald-500/30">
                        <p className="text-xs text-emerald-100">Ready for payout.</p>
                    </div>
                </div>

                {/* 2. Pending Wallet */}
                <div className="rounded-2xl p-6 bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden flex flex-col justify-between h-48">
                     <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Clock size={80} />
                    </div>
                    <div>
                         <div className="flex items-center gap-2 mb-1">
                            <Badge type="warning" className="bg-orange-600/30 text-orange-100 border-0">Verification</Badge>
                        </div>
                        <h2 className="text-4xl font-extrabold mt-1">${user.wallet.pending.toFixed(2)}</h2>
                    </div>
                    <div className="pt-4 border-t border-orange-400/30">
                        <p className="text-xs text-orange-100 flex items-center gap-1">
                            <Info size={12}/> Holds for 24-72 hours
                        </p>
                    </div>
                </div>

                {/* 3. Bonus Wallet */}
                <div className="rounded-2xl p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden flex flex-col justify-between h-48">
                     <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Lock size={80} />
                    </div>
                    <div>
                         <div className="flex items-center gap-2 mb-1">
                            <Badge type="info" className="bg-indigo-400/30 text-indigo-100 border-0">Locked Bonus</Badge>
                        </div>
                        <h2 className="text-4xl font-extrabold mt-1">${user.wallet.bonus.toFixed(2)}</h2>
                    </div>
                    <div className="pt-4 border-t border-indigo-400/30">
                        <p className="text-xs text-indigo-100">Referrals & Rewards</p>
                    </div>
                </div>
            </div>

            {/* Bonus Unlock Station */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                        <Unlock size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Bonus Unlock Station</h3>
                        <p className="text-xs text-gray-500">Complete requirements to move Bonus Funds to Main Wallet</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                        <div className={`p-4 rounded-xl border ${user.bonusUnlockProgress.consecutiveDaysActive >= UNLOCK_RULES.REQUIRED_DAYS ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="flex justify-between items-center mb-2">
                                <span className={`text-sm font-bold ${user.bonusUnlockProgress.consecutiveDaysActive >= UNLOCK_RULES.REQUIRED_DAYS ? 'text-emerald-700' : 'text-gray-700'}`}>Option 1: 7-Day Streak</span>
                                {user.bonusUnlockProgress.consecutiveDaysActive >= UNLOCK_RULES.REQUIRED_DAYS && <CheckCircle className="text-emerald-500" size={18} />}
                            </div>
                            <p className="text-xs text-gray-500 mb-2">Complete 60% daily tasks for 7 consecutive days.</p>
                            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-purple-500 transition-all duration-500" 
                                    style={{ width: `${Math.min((user.bonusUnlockProgress.consecutiveDaysActive / UNLOCK_RULES.REQUIRED_DAYS) * 100, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-right mt-1 font-bold text-purple-600">{user.bonusUnlockProgress.consecutiveDaysActive} / {UNLOCK_RULES.REQUIRED_DAYS} Days</p>
                        </div>

                        <div className="flex items-center justify-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                            — OR —
                        </div>

                        <div className={`p-4 rounded-xl border ${user.bonusUnlockProgress.hasCompletedWithdrawal ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="flex justify-between items-center mb-2">
                                <span className={`text-sm font-bold ${user.bonusUnlockProgress.hasCompletedWithdrawal ? 'text-emerald-700' : 'text-gray-700'}`}>Option 2: Successful Withdrawal</span>
                                {user.bonusUnlockProgress.hasCompletedWithdrawal && <CheckCircle className="text-emerald-500" size={18} />}
                            </div>
                            <p className="text-xs text-gray-500">Complete at least one successful withdrawal to permanent unlock.</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <p className="text-sm font-bold text-gray-600 mb-4">Available to Unlock</p>
                        <h4 className="text-3xl font-extrabold text-purple-600 mb-6">${user.wallet.bonus.toFixed(2)}</h4>
                        <Button 
                            onClick={handleUnlockBonus} 
                            disabled={!canUnlock || user.wallet.bonus <= 0 || unlocking}
                            className={`w-full ${canUnlock ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'}`}
                        >
                            {unlocking ? <RefreshCw className="animate-spin" size={20}/> : (canUnlock ? 'Unlock Funds Now' : 'Locked')}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Ledger */}
             <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Activity Log</h3>
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 uppercase text-xs font-bold text-gray-500 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Transaction</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {ledger.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-800 text-xs">{tx.type.replace(/_/g, ' ')}</p>
                                        <p className="text-[10px] text-gray-400">{tx.description}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide ${
                                            tx.status === TransactionStatus.COMPLETED ? 'text-emerald-600 bg-emerald-100' : 
                                            tx.status === TransactionStatus.PENDING ? 'text-orange-600 bg-orange-100' : 'text-gray-600 bg-gray-100'
                                        }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 text-right font-mono font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(3)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'withdraw' && (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* KYC BLOCKER OR WITHDRAWAL FORM */}
            {!isKycApproved ? (
                <Card className="p-8 border-l-4 border-l-orange-500 relative overflow-hidden flex flex-col items-center justify-center text-center h-full">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                        <Lock size={120} />
                    </div>
                    <div className="p-4 bg-orange-100 text-orange-600 rounded-full mb-6 relative z-10">
                        <UserCheck size={48} />
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-2 relative z-10">KYC Verification Required</h3>
                    <p className="text-gray-500 mb-8 max-w-sm relative z-10">
                        To ensure secure payments and prevent fraud, you must verify your identity before making a withdrawal. This is a one-time process.
                    </p>
                    
                    <div className="w-full max-w-xs relative z-10">
                        <div className="flex items-center justify-between text-xs font-bold uppercase text-gray-400 mb-2">
                             <span>Current Status</span>
                             <span className={
                                 user.kyc.status === KycStatus.SUBMITTED ? 'text-blue-500' : 
                                 user.kyc.status === KycStatus.REJECTED ? 'text-red-500' : 'text-gray-500'
                             }>{user.kyc.status.replace('_', ' ')}</span>
                        </div>
                        <Button 
                            onClick={() => navigate('/profile')}
                            className="w-full shadow-xl shadow-orange-500/20 bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            {user.kyc.status === KycStatus.NOT_STARTED ? 'Start KYC Now' : 'Check KYC Status'}
                        </Button>
                    </div>
                </Card>
            ) : (
                <Card className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <ArrowUpRight size={20} className="text-emerald-600"/> Request Payout
                    </h3>
                    <form onSubmit={handleWithdraw} className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Amount (USD)</label>
                                <span className="text-xs text-emerald-600 font-bold">Available: ${user.wallet.main.toFixed(2)}</span>
                            </div>
                            <Input 
                                type="number" 
                                value={withdrawAmount} 
                                onChange={e => setWithdrawAmount(e.target.value)}
                                placeholder={`Min $${plan.minWithdrawal}`}
                            />
                        </div>
                        
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-3">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Fee Breakdown</p>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Withdrawal Amount</span>
                                <span className="font-bold">${parseFloat(withdrawAmount || '0').toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-red-500">
                                <span>Platform Fee (10%)</span>
                                <span>-${platformFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-red-500">
                                <span>Transaction Fee (5%)</span>
                                <span>-${txFee.toFixed(2)}</span>
                            </div>
                            <div className="h-px bg-gray-200 my-2"></div>
                            <div className="flex justify-between text-base font-extrabold text-gray-900">
                                <span>Net Payable</span>
                                <span className="text-emerald-600">${netPayout}</span>
                            </div>
                        </div>

                        <Button type="submit" className="w-full shadow-lg shadow-emerald-500/20 py-4" disabled={parseFloat(withdrawAmount || '0') < plan.minWithdrawal || parseFloat(withdrawAmount || '0') > user.wallet.main}>
                            Confirm Withdrawal
                        </Button>
                        <p className="text-xs text-center text-gray-400">
                            Processing time: 24-48 Business Hours
                        </p>
                    </form>
                </Card>
            )}
            
            <div className="space-y-4">
                 <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-800 text-sm">
                     <p className="font-bold mb-1 flex items-center gap-2"><Info size={16}/> Important Note</p>
                     <p className="opacity-80">Withdrawals are processed manually to ensure security. Please ensure your UPI ID or Bank Details are correct in your profile before proceeding.</p>
                 </div>
                 
                 <div className="bg-white border border-gray-200 p-4 rounded-xl">
                     <h4 className="font-bold text-gray-800 text-sm mb-3">Withdrawal Limits</h4>
                     <ul className="text-xs text-gray-500 space-y-2">
                         <li className="flex justify-between">
                             <span>Minimum (Trial)</span>
                             <span className="font-mono font-bold">$10.00</span>
                         </li>
                         <li className="flex justify-between">
                             <span>Minimum (Paid Plans)</span>
                             <span className="font-mono font-bold">$50.00</span>
                         </li>
                         <li className="flex justify-between">
                             <span>Frequency</span>
                             <span className="font-mono font-bold">Once per 24 hours</span>
                         </li>
                     </ul>
                 </div>
            </div>
         </div>
      )}
    </div>
  );
};
