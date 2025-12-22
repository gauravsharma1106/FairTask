import React from 'react';
import { useAuth } from '../services/authContext';
import { Card, Button, Badge } from '../components/ui';
import { PLANS } from '../constants';
import { PlanTier } from '../types';
import { Check, Crown, Zap } from 'lucide-react';

export const Plans: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3 mb-12">
        <Badge type="info" className="mb-2">UPGRADE YOUR ACCOUNT</Badge>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Maximize Your Earnings</h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">Choose a plan that fits your goals. Higher tiers unlock higher rates, more daily tasks, and faster withdrawals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {Object.values(PLANS).map((plan) => {
            const isCurrent = user.planId === plan.id;
            const isTrial = plan.id === PlanTier.TRIAL;
            const isUltra = plan.id === PlanTier.ULTRA;

            return (
                <Card key={plan.id} className={`p-6 relative flex flex-col transition-transform hover:-translate-y-1 duration-300 ${isCurrent ? 'ring-2 ring-emerald-500 shadow-xl shadow-emerald-500/10' : ''} ${isUltra ? 'bg-gradient-to-b from-gray-900 to-gray-800 text-white' : ''}`}>
                    {isCurrent && (
                        <div className="absolute top-0 left-0 right-0 bg-emerald-500 text-white text-[10px] font-bold text-center py-1 rounded-t-lg tracking-widest uppercase">
                            Current Plan
                        </div>
                    )}
                    
                    <div className="mt-4 mb-6">
                        {isUltra && <Crown className="text-amber-400 mb-2" size={24} fill="currentColor" />}
                        <h3 className={`text-lg font-bold uppercase tracking-wide ${isUltra ? 'text-gray-100' : 'text-gray-900'}`}>{plan.id}</h3>
                        <div className="flex items-baseline gap-1 mt-2">
                            <span className={`text-4xl font-extrabold ${isUltra ? 'text-white' : 'text-gray-900'}`}>₹{plan.priceINR}</span>
                            <span className={`text-sm ${isUltra ? 'text-gray-400' : 'text-gray-500'}`}>/ {plan.durationDays}d</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-4 mb-8">
                        <div className={`text-sm font-medium flex items-center gap-2 ${isUltra ? 'text-gray-300' : 'text-gray-600'}`}>
                            <div className="p-1 rounded-full bg-emerald-100 text-emerald-600"><Check size={12} strokeWidth={3} /></div>
                            <span>{plan.dailyVideoLimit} Videos/day</span>
                        </div>
                        <div className={`text-sm font-medium flex items-center gap-2 ${isUltra ? 'text-gray-300' : 'text-gray-600'}`}>
                            <div className="p-1 rounded-full bg-emerald-100 text-emerald-600"><Check size={12} strokeWidth={3} /></div>
                            <span>{plan.dailyLinkLimit} Links/day</span>
                        </div>
                        <div className={`text-sm font-medium flex items-center gap-2 ${isUltra ? 'text-gray-300' : 'text-gray-600'}`}>
                             <div className="p-1 rounded-full bg-emerald-100 text-emerald-600"><Zap size={12} strokeWidth={3} /></div>
                            <span>${plan.videoRate} per {plan.videoRateBasis} videos</span>
                        </div>
                        <div className={`text-sm font-medium flex items-center gap-2 ${isUltra ? 'text-gray-300' : 'text-gray-600'}`}>
                             <div className="p-1 rounded-full bg-emerald-100 text-emerald-600"><Zap size={12} strokeWidth={3} /></div>
                            <span>${plan.linkRate} per {plan.linkRateBasis} links</span>
                        </div>
                        <div className={`text-sm font-medium flex items-center gap-2 ${isUltra ? 'text-gray-300' : 'text-gray-600'}`}>
                             <div className="p-1 rounded-full bg-emerald-100 text-emerald-600"><Check size={12} strokeWidth={3} /></div>
                             <span>Min Payout ${plan.minWithdrawal}</span>
                        </div>
                    </div>

                    <Button 
                        variant={isCurrent ? 'outline' : 'primary'} 
                        className={`w-full mt-auto ${isUltra && !isCurrent ? 'bg-amber-400 hover:bg-amber-500 text-gray-900 shadow-amber-400/20' : ''}`}
                        disabled={isCurrent || isTrial}
                    >
                        {isCurrent ? 'Active' : 'Upgrade Now'}
                    </Button>
                </Card>
            );
        })}
      </div>
      
      <div className="mt-12 p-6 bg-white/50 backdrop-blur rounded-2xl border border-gray-200 text-center max-w-3xl mx-auto">
          <p className="text-xs text-gray-400 leading-relaxed">
              <strong>Legal Disclaimer:</strong> Purchase of a plan increases your daily task limits and potential earning rates. It does not guarantee income. Earnings depend on successful task completion and validation. No refunds on digital plan activations once used.
          </p>
      </div>
    </div>
  );
};