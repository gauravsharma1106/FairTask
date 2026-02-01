
import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { BackendService } from '../services/mockBackend';
import { Card, Button, Badge } from '../components/ui';
import { Copy, Users, Lock, Unlock, CheckCircle, Clock, AlertTriangle, ChevronRight, Share2, Shield, Gift } from 'lucide-react';
import { KycStatus, PlanTier } from '../types';
import { REFERRAL_BONUS, UNLOCK_RULES } from '../constants';
import toast from 'react-hot-toast';

export const Referrals: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [network, setNetwork] = useState<any[]>([]);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    loadNetwork();
  }, []);

  const loadNetwork = async () => {
    if (user) {
      const data = await BackendService.getReferralNetwork(user.uid);
      setNetwork(data);
    }
  };

  if (!user) return null;

  const copyLink = () => {
      navigator.clipboard.writeText(`https://fairtask.app/ref/${user.referralCode}`);
      toast.success('Referral link copied!');
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

  const isKycVerified = user.kyc.status === KycStatus.APPROVED;
  const isActivityMet = user.bonusUnlockProgress.consecutiveDaysActive >= UNLOCK_RULES.REQUIRED_DAYS || user.bonusUnlockProgress.hasCompletedWithdrawal;
  const canUnlock = isKycVerified && isActivityMet;

  return (
    <div className="space-y-6">
      {/* Header & Link Card */}
      <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-2">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                  <Users className="text-emerald-500" /> Referral Program
              </h1>
              <p className="text-gray-500 text-sm">Build your team up to 3 Levels and earn lifetime commissions.</p>
          </div>
          
          <div className="flex-1 glass-card bg-indigo-600 text-white p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Share2 size={100} />
              </div>
              <div className="relative z-10">
                  <p className="text-indigo-200 text-xs font-bold uppercase mb-2">Your Referral Code</p>
                  <div className="flex items-center gap-3">
                      <span className="text-3xl font-mono font-bold tracking-widest">{user.referralCode}</span>
                      <button onClick={copyLink} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                          <Copy size={20} />
                      </button>
                  </div>
                  <p className="text-xs text-indigo-200 mt-4 opacity-80">Share with friends to start earning bonuses.</p>
              </div>
          </div>
      </div>

      {/* Bonus Wallet Status & Unlock Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Wallet Summary */}
          <Card className="flex flex-col justify-between bg-gradient-to-br from-purple-50 to-white border-purple-100">
              <div>
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
                          <Gift size={24} />
                      </div>
                      <Badge type="info">LOCKED BALANCE</Badge>
                  </div>
                  <p className="text-gray-500 text-xs font-bold uppercase">Referral & Promo Bonus</p>
                  <h2 className="text-4xl font-extrabold text-gray-900 mt-1">${user.wallet.bonus.toFixed(2)}</h2>
                  <p className="text-xs text-gray-400 mt-2">Lifetime Earnings: ${user.referralStats.totalEarnings.toFixed(2)}</p>
              </div>
              
              <Button 
                onClick={handleUnlockBonus}
                disabled={!canUnlock || user.wallet.bonus <= 0 || unlocking}
                className={`w-full mt-6 ${canUnlock ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'}`}
              >
                  {unlocking ? 'Processing...' : (canUnlock ? 'Unlock to Main Wallet' : 'Locked')}
              </Button>
          </Card>

          {/* Unlock Checklist */}
          <Card className="border border-gray-200 bg-gray-50/50">
               <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                   <Lock size={18} className="text-gray-400"/> Unlock Requirements
               </h3>
               <div className="space-y-4">
                   <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                       <div className="flex items-center gap-3">
                           <Shield className={isKycVerified ? "text-emerald-500" : "text-gray-400"} size={20} />
                           <div>
                               <p className="text-sm font-bold text-gray-800">KYC Verified</p>
                               <p className="text-xs text-gray-400">Identity & Payment Check</p>
                           </div>
                       </div>
                       {isKycVerified ? <CheckCircle className="text-emerald-500" size={20}/> : <Clock className="text-amber-500" size={20}/>}
                   </div>

                   <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                       <div className="flex items-center gap-3">
                           <Clock className={isActivityMet ? "text-emerald-500" : "text-gray-400"} size={20} />
                           <div>
                               <p className="text-sm font-bold text-gray-800">Active User Streak</p>
                               <p className="text-xs text-gray-400">7 Days Activity OR 1 Withdrawal</p>
                           </div>
                       </div>
                       {isActivityMet ? <CheckCircle className="text-emerald-500" size={20}/> : (
                           <span className="text-xs font-bold text-indigo-600">{user.bonusUnlockProgress.consecutiveDaysActive}/7 Days</span>
                       )}
                   </div>
               </div>
               
               <div className="mt-4 text-[10px] text-gray-400 text-center bg-gray-100 p-2 rounded-lg">
                   Bonuses are held in the Locked Wallet until all conditions are met to prevent system abuse.
               </div>
          </Card>
      </div>

      {/* Network Stats - 3 Tier */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
              <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Level 1 (Direct)</p>
              <h3 className="text-2xl font-extrabold text-gray-900">{user.referralStats.l1Count}</h3>
              <div className="mt-2 text-[10px] text-gray-500 space-y-0.5">
                  <p>Plan Bonus: <strong>{(REFERRAL_BONUS.PLAN.L1 * 100).toFixed(0)}%</strong></p>
                  <p>Task Bonus: <strong>{(REFERRAL_BONUS.TASK.L1 * 100).toFixed(0)}%</strong></p>
              </div>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-center">
              <p className="text-xs text-blue-600 font-bold uppercase mb-1">Level 2</p>
              <h3 className="text-2xl font-extrabold text-gray-900">{user.referralStats.l2Count}</h3>
              <div className="mt-2 text-[10px] text-gray-500 space-y-0.5">
                  <p>Plan Bonus: <strong>{(REFERRAL_BONUS.PLAN.L2 * 100).toFixed(0)}%</strong></p>
                  <p>Task Bonus: <strong>{(REFERRAL_BONUS.TASK.L2 * 100).toFixed(0)}%</strong></p>
              </div>
          </div>
          <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-center">
              <p className="text-xs text-gray-600 font-bold uppercase mb-1">Level 3</p>
              <h3 className="text-2xl font-extrabold text-gray-900">{user.referralStats.l3Count}</h3>
              <div className="mt-2 text-[10px] text-gray-500 space-y-0.5">
                  <p>Plan Bonus: <strong>{(REFERRAL_BONUS.PLAN.L3 * 100).toFixed(0)}%</strong></p>
                  <p>Task Bonus: <strong>{(REFERRAL_BONUS.TASK.L3 * 100).toFixed(0)}%</strong></p>
              </div>
          </div>
      </div>

      {/* Recent Network Activity */}
      <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900">Recent Network Joins</h3>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                      <tr>
                          <th className="px-6 py-3">User</th>
                          <th className="px-6 py-3">Level</th>
                          <th className="px-6 py-3">Plan</th>
                          <th className="px-6 py-3 text-right">Bonus Generated</th>
                      </tr>
                  </thead>
                  <tbody>
                      {network.map((ref) => (
                          <tr key={ref.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-900">{ref.user}</td>
                              <td className="px-6 py-4">
                                  <Badge type="info">L{ref.level}</Badge>
                              </td>
                              <td className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">{ref.plan}</td>
                              <td className="px-6 py-4 text-right font-mono text-emerald-600 font-bold">+${ref.earnings}</td>
                          </tr>
                      ))}
                      {network.length === 0 && (
                          <tr>
                              <td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-xs">
                                  No active referrals yet. Share your link to start earning!
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </Card>
    </div>
  );
};
