import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { BackendService } from '../services/mockBackend';
import { LeaderboardEntry, LeaderboardTimeframe, PlanTier } from '../types';
import { Card, Badge, Button } from '../components/ui';
import { Trophy, Medal, Star, Crown, Zap, TrendingUp, ShieldCheck } from 'lucide-react';
import { APP_NAME } from '../constants';

export const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>(LeaderboardTimeframe.DAILY);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [timeframe]);

  const loadLeaderboard = async () => {
    setLoading(true);
    const data = await BackendService.getLeaderboard(timeframe);
    setEntries(data);
    setLoading(false);
  };

  const getTimeframeLabel = (tf: LeaderboardTimeframe) => {
    switch(tf) {
        case LeaderboardTimeframe.DAILY: return 'Today';
        case LeaderboardTimeframe.WEEKLY: return 'This Week';
        case LeaderboardTimeframe.MONTHLY: return 'This Month';
        case LeaderboardTimeframe.YEARLY: return 'This Year';
        case LeaderboardTimeframe.LIFETIME: return 'All Time';
    }
  };

  const getPlanBadgeStyle = (plan: PlanTier) => {
    switch (plan) {
        case PlanTier.ULTRA: return 'bg-purple-100 text-purple-700 border-purple-200';
        case PlanTier.PRO: return 'bg-amber-100 text-amber-700 border-amber-200';
        case PlanTier.BASIC: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getRankIcon = (rank: number) => {
      if (rank === 1) return <div className="w-8 h-8 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-500 text-white flex items-center justify-center shadow-lg shadow-yellow-500/30"><Crown size={16} fill="currentColor"/></div>
      if (rank === 2) return <div className="w-8 h-8 rounded-full bg-gradient-to-b from-slate-300 to-slate-400 text-white flex items-center justify-center shadow-lg"><Medal size={16} /></div>
      if (rank === 3) return <div className="w-8 h-8 rounded-full bg-gradient-to-b from-orange-300 to-orange-500 text-white flex items-center justify-center shadow-lg"><Medal size={16} /></div>
      return <span className="w-8 h-8 flex items-center justify-center font-bold text-gray-400">#{rank}</span>
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <Trophy className="text-amber-500 fill-amber-500" /> Leaderboard
            </h1>
            <p className="text-gray-500 text-sm mt-1">Top performers ranked by Verified Net Earnings.</p>
        </div>
      </div>

      {/* Timeframe Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 p-1 bg-white/40 backdrop-blur-md rounded-xl border border-white/50">
        {Object.values(LeaderboardTimeframe).map((tf) => (
            <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${
                    timeframe === tf 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-105' 
                    : 'text-gray-500 hover:bg-white/50 hover:text-emerald-600'
                }`}
            >
                {getTimeframeLabel(tf)}
            </button>
        ))}
      </div>

      {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-gray-400 text-sm font-medium">Calculating Rankings...</p>
          </div>
      ) : (
          <>
            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-4">
                {/* 2nd Place */}
                <div className="order-2 md:order-1 transform md:translate-y-8">
                     <div className="glass-card bg-gradient-to-b from-slate-50 to-white border-slate-200 relative overflow-hidden flex flex-col items-center p-6 text-center">
                        <div className="absolute top-0 inset-x-0 h-1 bg-slate-300"></div>
                        <div className="mb-3">{getRankIcon(2)}</div>
                        <h3 className="font-bold text-gray-900 text-lg">{entries[1]?.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-4 ${getPlanBadgeStyle(entries[1]?.planId)}`}>{entries[1]?.planId}</span>
                        <div className="mt-auto w-full pt-4 border-t border-slate-100">
                             <p className="text-xs text-slate-400 uppercase font-bold">Earnings</p>
                             <p className="text-2xl font-extrabold text-slate-700">${entries[1]?.earnings.toFixed(2)}</p>
                             <p className="text-[10px] text-slate-400 mt-1">{entries[1]?.tasksCompleted} Tasks</p>
                        </div>
                     </div>
                </div>

                {/* 1st Place */}
                <div className="order-1 md:order-2 z-10">
                     <div className="glass-card bg-gradient-to-b from-yellow-50 to-white border-yellow-200 relative overflow-hidden flex flex-col items-center p-8 text-center shadow-2xl shadow-yellow-500/10 scale-105">
                        <div className="absolute top-0 inset-x-0 h-1 bg-yellow-400"></div>
                        <div className="absolute top-0 right-0 p-2"><Star className="text-yellow-400 fill-yellow-400 animate-pulse" size={20}/></div>
                        <div className="mb-4 transform scale-125">{getRankIcon(1)}</div>
                        <h3 className="font-bold text-gray-900 text-xl">{entries[0]?.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-6 ${getPlanBadgeStyle(entries[0]?.planId)}`}>{entries[0]?.planId}</span>
                        <div className="mt-auto w-full pt-4 border-t border-yellow-100">
                             <p className="text-xs text-yellow-500 uppercase font-bold">Net Earnings</p>
                             <p className="text-3xl font-extrabold text-gray-800">${entries[0]?.earnings.toFixed(2)}</p>
                             <p className="text-xs text-gray-400 mt-1">{entries[0]?.tasksCompleted} Verified Tasks</p>
                        </div>
                     </div>
                </div>

                {/* 3rd Place */}
                <div className="order-3 md:order-3 transform md:translate-y-10">
                     <div className="glass-card bg-gradient-to-b from-orange-50 to-white border-orange-200 relative overflow-hidden flex flex-col items-center p-6 text-center">
                        <div className="absolute top-0 inset-x-0 h-1 bg-orange-300"></div>
                        <div className="mb-3">{getRankIcon(3)}</div>
                        <h3 className="font-bold text-gray-900 text-lg">{entries[2]?.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-4 ${getPlanBadgeStyle(entries[2]?.planId)}`}>{entries[2]?.planId}</span>
                        <div className="mt-auto w-full pt-4 border-t border-orange-100">
                             <p className="text-xs text-orange-400 uppercase font-bold">Earnings</p>
                             <p className="text-2xl font-extrabold text-orange-700">${entries[2]?.earnings.toFixed(2)}</p>
                             <p className="text-[10px] text-orange-400 mt-1">{entries[2]?.tasksCompleted} Tasks</p>
                        </div>
                     </div>
                </div>
            </div>

            {/* List View 4-20 */}
            <div className="glass-card p-0 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-emerald-50/50 text-xs text-gray-500 uppercase font-bold">
                        <tr>
                            <th className="px-6 py-4">Rank</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4 text-center">Plan</th>
                            <th className="px-6 py-4 text-right">Net Earned</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {entries.slice(3).map((entry) => (
                            <tr key={entry.rank} className="hover:bg-emerald-50/30 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-400">#{entry.rank}</td>
                                <td className="px-6 py-4 font-semibold text-gray-800">{entry.name}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getPlanBadgeStyle(entry.planId)}`}>
                                        {entry.planId}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600">
                                    ${entry.earnings.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* User Rank Sticky Footer */}
            {user && (
                <div className="fixed bottom-16 md:bottom-4 left-4 right-4 md:left-[300px] md:max-w-4xl md:mx-auto">
                    <div className="bg-gray-900 text-white rounded-xl p-4 shadow-2xl flex items-center justify-between border border-gray-700">
                        <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center font-bold">
                                 {user.name.charAt(0)}
                             </div>
                             <div>
                                 <p className="font-bold text-sm">Your Ranking</p>
                                 <p className="text-xs text-gray-400">Based on verified tasks</p>
                             </div>
                        </div>
                        <div className="flex items-center gap-6">
                             <div className="text-center">
                                 <p className="text-[10px] text-gray-400 uppercase font-bold">Rank</p>
                                 <p className="font-bold text-lg">#42</p>
                             </div>
                             <div className="text-center">
                                 <p className="text-[10px] text-gray-400 uppercase font-bold">Earned</p>
                                 <p className="font-bold text-lg text-emerald-400">$0.00</p>
                             </div>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="p-4 text-center">
                <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                    <ShieldCheck size={12} />
                    Rankings update daily at 00:00 IST based on verified ledger entries.
                </p>
            </div>
          </>
      )}
    </div>
  );
};