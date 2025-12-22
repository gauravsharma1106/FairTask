import React, { useEffect, useState } from 'react';
import { useAuth } from '../services/authContext';
import { BackendService } from '../services/mockBackend';
import { Card, Button, Input, Badge } from '../components/ui';
import { PLANS, FEES, EXCHANGE_RATE } from '../constants';
import { LedgerEntry, TransactionStatus } from '../types';
import toast from 'react-hot-toast';
import { Wallet as WalletIcon, ArrowUpRight, Clock, ShieldCheck } from 'lucide-react';

export const Wallet: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
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

  const netPayout = (parseFloat(withdrawAmount || '0') * FEES.NET_PAYOUT_PERCENT).toFixed(2);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
            <WalletIcon size={28} />
        </div>
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Wallet</h1>
            <p className="text-gray-500 text-sm">Manage your earnings and payouts</p>
        </div>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-2 gap-6">
          {/* Main Balance - Updated to Green/White Theme */}
          <div className="glass-card rounded-2xl p-8 col-span-2 md:col-span-1 bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-500/20 border-0 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-10">
                   <ShieldCheck size={100} />
               </div>
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest relative z-10">Withdrawable Balance</p>
              <h2 className="text-5xl font-extrabold mt-3 text-white relative z-10">${user.wallet.main.toFixed(2)}</h2>
              <p className="text-sm text-emerald-100 mt-2 font-mono relative z-10">≈ ₹{(user.wallet.main * EXCHANGE_RATE).toFixed(2)} INR</p>
          </div>
          
           <Card className="p-8 col-span-2 md:col-span-1 flex flex-col justify-center">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Pending Balance</p>
              <h2 className="text-4xl font-extrabold mt-3 text-gray-800">${user.wallet.pending.toFixed(2)}</h2>
              <p className="text-sm text-blue-500 mt-2 flex items-center gap-1 font-medium bg-blue-50 w-fit px-2 py-1 rounded-lg">
                  <Clock size={14} /> Under 24h Review
              </p>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Withdrawal Form */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ArrowUpRight size={20} className="text-emerald-600"/> Request Payout
            </h3>
            <Card className="p-6">
                <form onSubmit={handleWithdraw} className="space-y-5">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Amount (USD)</label>
                        <Input 
                            type="number" 
                            value={withdrawAmount} 
                            onChange={e => setWithdrawAmount(e.target.value)}
                            placeholder={`Min $${plan.minWithdrawal}`}
                        />
                    </div>
                    
                    <div className="space-y-3 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex justify-between text-gray-500">
                            <span>Platform Fee (10%)</span>
                            <span>-${(parseFloat(withdrawAmount || '0') * 0.1).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                            <span>Gateway Fee (5%)</span>
                            <span>-${(parseFloat(withdrawAmount || '0') * 0.05).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-900 font-bold pt-2 border-t border-gray-200">
                            <span>You Receive</span>
                            <span className="text-emerald-600">${netPayout}</span>
                        </div>
                    </div>

                    <Button type="submit" className="w-full shadow-lg shadow-emerald-500/20" disabled={parseFloat(withdrawAmount || '0') < plan.minWithdrawal}>
                        Withdraw Funds
                    </Button>
                    <p className="text-xs text-center text-gray-400">
                        {user.planId === 'TRIAL' ? 'Trial users min: $10' : `Min withdrawal: $${plan.minWithdrawal}`}
                    </p>
                </form>
            </Card>
          </div>

          {/* Ledger History */}
          <div className="lg:col-span-2">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Transaction History</h3>
              <div className="bg-white/60 backdrop-blur-md border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-emerald-50/50 uppercase text-xs font-bold text-emerald-700 border-b border-emerald-100">
                            <tr>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Desc</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {ledger.map((tx) => (
                                <tr key={tx.id} className="hover:bg-white/80 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs font-semibold">{tx.type.replace('EARN_', '')}</td>
                                    <td className="px-6 py-4">{tx.description}</td>
                                    <td className={`px-6 py-4 text-right font-mono font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(3)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide ${
                                            tx.status === TransactionStatus.COMPLETED ? 'text-emerald-600 bg-emerald-100' : 
                                            'text-amber-600 bg-amber-100'
                                        }`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {ledger.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">No transactions recorded yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};