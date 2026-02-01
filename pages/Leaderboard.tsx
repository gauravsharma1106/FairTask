
import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { BackendService } from '../services/mockBackend';
import { LeaderboardEntry, LeaderboardTimeframe, PlanTier } from '../types';
import { Badge } from '../components/ui';
import { Trophy, Medal, Star, Crown, Info, Lock, CheckCircle2, ChevronDown, ChevronUp, Gift, Target, Clock, TrendingUp, XCircle, ChevronRight } from 'lucide-react';
import { LEADERBOARD_REWARDS } from '../constants';

// Helper to safely get reward amount based on timeframe and rank
const getRewardAmount = (timeframe: LeaderboardTimeframe, rank: number): number => {
    if (timeframe === LeaderboardTimeframe.YEARLY || timeframe === LeaderboardTimeframe.LIFETIME) return 0;
    
    // @ts-ignore
    const rewards = LEADERBOARD_REWARDS[timeframe];
    if (!rewards) return 0;

    // @ts-ignore
    if (rewards[rank]) return rewards[rank];
    
    // Special case for Monthly 4-10
    if (timeframe === LeaderboardTimeframe.MONTHLY && rank >= 4 && rank <= 10) {
        return LEADERBOARD_REWARDS.MONTHLY.REST_TOP_10;
    }

    return 0;
};

// Component: Global Bonus Map
const GlobalBonusMap: React.FC<{ timeframe: LeaderboardTimeframe }> = ({ timeframe }) => {
    if (timeframe === LeaderboardTimeframe.YEARLY || timeframe === LeaderboardTimeframe.LIFETIME) return null;

    const renderDaily = () => (
        <div className="grid grid-cols-3 gap-2 text-center">
            {[1, 2, 3].map(rank => (
                <div key={rank} className="bg-white/60 rounded-lg p-2 border border-indigo-100">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Rank {rank}</p>
                    <p className="text-emerald-600 font-bold">${getRewardAmount(timeframe, rank).toFixed(2)}</p>
                </div>
            ))}
        </div>
    );

    const renderWeekly = () => (
        <div className="grid grid-cols-5 gap-2 text-center">
            {[1, 2, 3, 4, 5].map(rank => (
                <div key={rank} className="bg-white/60 rounded-lg p-1.5 border border-indigo-100">
                    <p className="text-[9px] text-gray-500 uppercase font-bold">#{rank}</p>
                    <p className="text-emerald-600 font-bold text-xs">${getRewardAmount(timeframe, rank)}</p>
                </div>
            ))}
        </div>
    );

    const renderMonthly = () => (
        <div className="grid grid-cols-4 gap-2 text-center">
            {[1, 2, 3].map(rank => (
                <div key={rank} className="bg-white/60 rounded-lg p-2 border border-indigo-100">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">#{rank}</p>
                    <p className="text-emerald-600 font-bold">${getRewardAmount(timeframe, rank)}</p>
                </div>
            ))}
            <div className="bg-white/60 rounded-lg p-2 border border-indigo-100">
                <p className="text-[10px] text-gray-500 uppercase font-bold">#4-10</p>
                <p className="text-emerald-600 font-bold">$10</p>
            </div>
        </div>
    );

    return (
        <div className="glass-card bg-indigo-50/50 border-indigo-100 p-4 rounded-xl mb-6">
            <div className="flex items-start gap-3">
                <Gift className="text-indigo-500 shrink-0 mt-0.5" size={20} />
                <div className="w-full">
                    <h4 className="text-indigo-900 font-bold text-sm mb-2">{timeframe} Rewards Pool</h4>
                    {timeframe === LeaderboardTimeframe.DAILY && renderDaily()}
                    {timeframe === LeaderboardTimeframe.WEEKLY && renderWeekly()}
                    {timeframe === LeaderboardTimeframe.MONTHLY && renderMonthly()}
                    <p className="text-[10px] text-indigo-400 mt-2 italic text-center">Rewards credited to Bonus Wallet. Validation required.</p>
                </div>
            </div>
        </div>
    );
};

// Component: Motivational Panel
const MotivationalPanel: React.FC<{ 
    userEntry: LeaderboardEntry, 
    allEntries: LeaderboardEntry[], 
    timeframe: LeaderboardTimeframe 
}> = ({ userEntry, allEntries, timeframe }) => {
    // Safety check
    if (!userEntry) return null;

    if (timeframe === LeaderboardTimeframe.YEARLY || timeframe === LeaderboardTimeframe.LIFETIME) return null;

    // Define available target options
    const getTargetOptions = () => {
        if (timeframe === LeaderboardTimeframe.DAILY) return [1, 2, 3];
        if (timeframe === LeaderboardTimeframe.WEEKLY) return [1, 2, 3, 4, 5];
        if (timeframe === LeaderboardTimeframe.MONTHLY) return [1, 2, 3, 10]; // 10 is the gatekeeper for 4-10
        return [];
    };
    
    const targetOptions = getTargetOptions();

    // Determine smart default
    // If user is Rank 20, default to the lowest reward rank (e.g., 3, 5, or 10).
    // If user is Rank 2, default to 1.
    const getDefaultTarget = () => {
        const betterRanks = targetOptions.filter(r => r < userEntry.rank);
        if (betterRanks.length > 0) {
            // Pick the one closest to current rank (highest number)
            return betterRanks[betterRanks.length - 1]; 
        }
        return targetOptions[0]; // Default to Rank 1 if user is Rank 1 or options fail
    };

    const [selectedTargetRank, setSelectedTargetRank] = useState<number>(getDefaultTarget());

    // Reset when timeframe changes
    useEffect(() => {
        setSelectedTargetRank(getDefaultTarget());
    }, [timeframe, userEntry.rank]);

    const targetRankEntry = allEntries.find(e => e.rank === selectedTargetRank);

    // If target not found in loaded entries (e.g. searching for Rank 10 but only fetched 5), fallback
    if (!targetRankEntry) return null;
    
    // Calculations
    const earningsGap = Math.max(0, targetRankEntry.earnings - userEntry.earnings + 0.1); 
    const estTasks = Math.ceil(earningsGap / 0.05); 
    const estTimeMinutes = Math.ceil((estTasks * 12) / 60); 
    const progress = Math.min((userEntry.earnings / targetRankEntry.earnings) * 100, 99);
    
    // Label for the dropdown
    const getOptionLabel = (rank: number) => {
        if (timeframe === LeaderboardTimeframe.MONTHLY && rank === 10) return "Top 10";
        return `Rank #${rank}`;
    }

    const hasReward = userEntry.reward !== undefined && userEntry.reward > 0;

    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-6 shadow-xl shadow-gray-900/20 mb-6 relative overflow-hidden">
             {/* Decorative Elements */}
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Target size={120} />
            </div>

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between md:items-start mb-6 gap-4">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Your Current Status</p>
                        <h3 className="text-2xl font-extrabold flex items-center gap-2">
                             {hasReward ? (
                                <span className="text-emerald-400 flex items-center gap-2"><Gift size={24}/> ${userEntry.reward} Bonus</span>
                             ) : (
                                <span className="text-gray-500 text-lg">Not Eligible Yet</span>
                             )}
                        </h3>
                        <div className="mt-2">
                           <Badge type="info" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                                Current Rank #{userEntry.rank}
                            </Badge>
                        </div>
                    </div>

                    <div className="bg-white/10 p-3 rounded-xl border border-white/10 min-w-[200px]">
                        <label className="text-xs text-gray-400 font-bold uppercase block mb-2">Select Target Goal</label>
                        <div className="relative">
                            <select 
                                value={selectedTargetRank}
                                onChange={(e) => setSelectedTargetRank(Number(e.target.value))}
                                className="w-full appearance-none bg-gray-900 border border-gray-600 hover:border-emerald-500 text-white text-sm rounded-lg p-2.5 pr-8 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors cursor-pointer font-bold"
                            >
                                {targetOptions.map(rank => (
                                    <option key={rank} value={rank}>
                                        {getOptionLabel(rank)} - Win ${getRewardAmount(timeframe, rank)}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-3 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>

                {/* Show progress if user is not already at or above target */}
                {userEntry.rank > selectedTargetRank ? (
                    <>
                        <div className="bg-white/10 rounded-xl p-4 mb-4 backdrop-blur-sm border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="text-emerald-400" size={16} />
                                <span className="font-bold text-sm text-emerald-100">
                                    Gap to {getOptionLabel(selectedTargetRank)}
                                </span>
                            </div>
                            
                            {/* Comparison */}
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>You: ${userEntry.earnings.toFixed(2)}</span>
                                <span>Target: ${targetRankEntry.earnings.toFixed(2)}</span>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden mb-3">
                                <div 
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ease-out" 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>

                            <p className="text-xs text-gray-300">
                                Earn <span className="text-emerald-400 font-bold">${earningsGap.toFixed(2)} more</span> to reach this position.
                            </p>
                        </div>

                        <div className="flex gap-4 text-xs font-medium text-gray-400">
                            <div className="flex items-center gap-1.5 bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-700">
                                <CheckCircle2 size={14} className="text-emerald-500" />
                                <span>Need ~{estTasks} Tasks</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-700">
                                <Clock size={14} className="text-blue-500" />
                                <span>~{estTimeMinutes} mins</span>
                            </div>
                        </div>
                    </>
                ) : (
                     <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3">
                         <div className="p-2 bg-emerald-500/20 rounded-full text-emerald-400">
                            <Crown size={20} />
                         </div>
                         <div>
                             <p className="text-emerald-300 font-bold">Goal Achieved!</p>
                             <p className="text-xs text-emerald-100/70 mt-1">
                                 You are currently ranked #{userEntry.rank}, which is higher than or equal to your target of {getOptionLabel(selectedTargetRank)}. 
                                 Keep earning to maintain your lead!
                             </p>
                         </div>
                     </div>
                )}
            </div>
        </div>
    );
};

export const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>(LeaderboardTimeframe.DAILY);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [missedOppDismissed, setMissedOppDismissed] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, [timeframe]);

  const loadLeaderboard = async () => {
    setLoading(true);
    const data = await BackendService.getLeaderboard(timeframe, user?.uid);
    setEntries(data || []);
    setLoading(false);
  };

  const getTimeframeLabel = (tf: LeaderboardTimeframe) => {
    switch(tf) {
        case LeaderboardTimeframe.DAILY: return 'Daily';
        case LeaderboardTimeframe.WEEKLY: return 'Weekly';
        case LeaderboardTimeframe.MONTHLY: return 'Monthly';
        case LeaderboardTimeframe.YEARLY: return 'Yearly';
        case LeaderboardTimeframe.LIFETIME: return 'Lifetime';
    }
  };

  const getPlanBadgeStyle = (plan?: PlanTier) => {
    if (!plan) return 'bg-gray-100 text-gray-600 border-gray-200';
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

  const renderRewardBadge = (entry?: LeaderboardEntry) => {
      if (!entry) return null;
      if (entry.reward === undefined || entry.reward === 0) return (
          <span className="text-[10px] text-gray-400 font-medium">Not eligible</span>
      );
      
      if (entry.isBonusLocked) {
          return (
              <div className="flex flex-col items-center">
                  <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock size={8} /> ${entry.reward} Pending
                  </span>
              </div>
          );
      }
      return (
          <div className="flex flex-col items-center">
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Gift size={8} /> ${entry.reward} Bonus
              </span>
          </div>
      );
  };

  // Identify key entries for motivational panel
  const userEntry = entries.find(e => e.userId === user?.uid);
  
  // Cutoff Logic for Missed Opportunity Banner
  let cutoffRank = 3;
  if (timeframe === LeaderboardTimeframe.WEEKLY) cutoffRank = 5;
  if (timeframe === LeaderboardTimeframe.MONTHLY) cutoffRank = 10;

  return (
    <div className="space-y-6 pb-32 md:pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <Trophy className="text-amber-500 fill-amber-500" /> Leaderboard
            </h1>
            <p className="text-gray-500 text-sm mt-1">Verify tasks to rank up. Cash bonuses paid daily.</p>
        </div>
      </div>
      
      {/* Missed Opportunity Banner (Simulated) */}
      {!missedOppDismissed && userEntry && timeframe === LeaderboardTimeframe.DAILY && (
        <div className="glass-card bg-orange-50/80 border-orange-100 p-4 rounded-xl flex items-start gap-3 relative animate-in slide-in-from-top-2 duration-500">
            <XCircle 
                size={16} 
                className="absolute top-2 right-2 text-gray-400 cursor-pointer hover:text-gray-600"
                onClick={() => setMissedOppDismissed(true)} 
            />
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                <TrendingUp size={20} />
            </div>
            <div>
                <h4 className="text-gray-800 font-bold text-sm">Yesterday's Opportunity</h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    You finished at <strong>Rank #{userEntry.rank + 3}</strong> yesterday. 
                    If you had earned just <span className="font-bold text-orange-600">$1.20 more</span>, 
                    you could have reached the top {cutoffRank}.
                </p>
            </div>
        </div>
      )}

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
            {/* Motivational Panel (User Specific) - Passed full entries list */}
            {userEntry && (
                <MotivationalPanel userEntry={userEntry} allEntries={entries} timeframe={timeframe} />
            )}

            {/* Global Bonus Map */}
            <GlobalBonusMap timeframe={timeframe} />

            {/* Top 3 Podium - SAFE RENDERING ADDED */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-4">
                {/* 2nd Place */}
                <div className="order-2 md:order-1 transform md:translate-y-8">
                     <div className={`glass-card bg-gradient-to-b from-slate-50 to-white border-slate-200 relative overflow-hidden flex flex-col items-center p-6 text-center ${!entries[1] ? 'opacity-50 grayscale' : ''}`}>
                        <div className="absolute top-0 inset-x-0 h-1 bg-slate-300"></div>
                        <div className="mb-3">{getRankIcon(2)}</div>
                        <h3 className="font-bold text-gray-900 text-lg">{entries[1]?.name || 'Vacant'}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2 ${getPlanBadgeStyle(entries[1]?.planId)}`}>{entries[1]?.planId || 'N/A'}</span>
                        {renderRewardBadge(entries[1])}
                        <div className="mt-4 w-full pt-4 border-slate-100 border-t">
                             <p className="text-xs text-slate-400 uppercase font-bold">Earnings</p>
                             <p className="text-2xl font-extrabold text-slate-700">${entries[1]?.earnings?.toFixed(2) || '0.00'}</p>
                             <p className="text-[10px] text-slate-400 mt-1">{entries[1]?.tasksCompleted || 0} Tasks</p>
                        </div>
                     </div>
                </div>

                {/* 1st Place */}
                <div className="order-1 md:order-2 z-10">
                     <div className={`glass-card bg-gradient-to-b from-yellow-50 to-white border-yellow-200 relative overflow-hidden flex flex-col items-center p-8 text-center shadow-2xl shadow-yellow-500/10 scale-105 ${!entries[0] ? 'opacity-50 grayscale' : ''}`}>
                        <div className="absolute top-0 inset-x-0 h-1 bg-yellow-400"></div>
                        <div className="absolute top-0 right-0 p-2"><Star className="text-yellow-400 fill-yellow-400 animate-pulse" size={20}/></div>
                        <div className="mb-4 transform scale-125">{getRankIcon(1)}</div>
                        <h3 className="font-bold text-gray-900 text-xl">{entries[0]?.name || 'Vacant'}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2 ${getPlanBadgeStyle(entries[0]?.planId)}`}>{entries[0]?.planId || 'N/A'}</span>
                        {renderRewardBadge(entries[0])}
                        <div className="mt-4 w-full pt-4 border-yellow-100 border-t">
                             <p className="text-xs text-yellow-500 uppercase font-bold">Net Earnings</p>
                             <p className="text-3xl font-extrabold text-gray-800">${entries[0]?.earnings?.toFixed(2) || '0.00'}</p>
                             <p className="text-xs text-gray-400 mt-1">{entries[0]?.tasksCompleted || 0} Verified Tasks</p>
                        </div>
                     </div>
                </div>

                {/* 3rd Place */}
                <div className="order-3 md:order-3 transform md:translate-y-10">
                     <div className={`glass-card bg-gradient-to-b from-orange-50 to-white border-orange-200 relative overflow-hidden flex flex-col items-center p-6 text-center ${!entries[2] ? 'opacity-50 grayscale' : ''}`}>
                        <div className="absolute top-0 inset-x-0 h-1 bg-orange-300"></div>
                        <div className="mb-3">{getRankIcon(3)}</div>
                        <h3 className="font-bold text-gray-900 text-lg">{entries[2]?.name || 'Vacant'}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2 ${getPlanBadgeStyle(entries[2]?.planId)}`}>{entries[2]?.planId || 'N/A'}</span>
                        {renderRewardBadge(entries[2])}
                        <div className="mt-4 w-full pt-4 border-orange-100 border-t">
                             <p className="text-xs text-orange-400 uppercase font-bold">Earnings</p>
                             <p className="text-2xl font-extrabold text-orange-700">${entries[2]?.earnings?.toFixed(2) || '0.00'}</p>
                             <p className="text-[10px] text-orange-400 mt-1">{entries[2]?.tasksCompleted || 0} Tasks</p>
                        </div>
                     </div>
                </div>
            </div>

            {/* List View 4-20 */}
            <div className="glass-card p-0 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-emerald-50/50 text-xs text-gray-500 uppercase font-bold">
                        <tr>
                            <th className="px-4 md:px-6 py-4">Rank</th>
                            <th className="px-4 md:px-6 py-4">User</th>
                            <th className="px-4 md:px-6 py-4 text-center hidden md:table-cell">Plan</th>
                            <th className="px-4 md:px-6 py-4 text-center hidden md:table-cell">Bonus</th>
                            <th className="px-4 md:px-6 py-4 text-right">Net Earned</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {entries.slice(3).map((entry) => (
                            <tr key={entry.rank} className={`transition-colors relative ${entry.userId === user?.uid ? 'bg-emerald-50/50' : 'hover:bg-emerald-50/20'}`}>
                                <td className="px-4 md:px-6 py-4 font-bold text-gray-400">#{entry.rank}</td>
                                <td className="px-4 md:px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-semibold ${entry.userId === user?.uid ? 'text-emerald-700' : 'text-gray-800'}`}>
                                            {entry.name} {entry.userId === user?.uid && '(You)'}
                                        </span>
                                    </div>
                                    <div className="md:hidden mt-2 flex flex-wrap gap-2">
                                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${getPlanBadgeStyle(entry.planId)}`}>
                                            {entry.planId}
                                        </span>
                                        {entry.reward !== undefined && entry.reward > 0 ? (
                                            <span className="text-[10px] font-bold text-emerald-600">Bonus: ${entry.reward}</span>
                                        ) : (
                                            <span className="text-[10px] text-gray-400">No Bonus</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 md:px-6 py-4 text-center hidden md:table-cell">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getPlanBadgeStyle(entry.planId)}`}>
                                        {entry.planId}
                                    </span>
                                </td>
                                <td className="px-4 md:px-6 py-4 text-center hidden md:table-cell">
                                    {renderRewardBadge(entry)}
                                </td>
                                <td className="px-4 md:px-6 py-4 text-right font-mono font-bold text-emerald-600">
                                    ${entry.earnings.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

             {/* Terms & Conditions Accordion */}
             <div className="mt-8">
                <button 
                    onClick={() => setShowTerms(!showTerms)} 
                    className="flex items-center justify-between w-full p-4 glass-card bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                >
                    <span className="font-bold text-sm text-gray-600 flex items-center gap-2"><Info size={16}/> Rules & Disclaimers</span>
                    {showTerms ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {showTerms && (
                    <div className="p-6 glass-card mt-2 text-xs text-gray-500 space-y-3 leading-relaxed">
                        <p><strong>1. Ranking Logic:</strong> Leaderboard is based strictly on <em>Net Verified Earnings</em> from completed tasks. Referral bonuses, promotional credits, and refunded transactions are excluded.</p>
                        <p><strong>2. Update Frequency:</strong> Rankings are updated periodically (daily at 00:00 IST) via server-side calculations. Real-time updates are disabled to prevent gaming.</p>
                        <p><strong>3. Rewards & Unlocking:</strong> Cash prizes are credited to the <em>Bonus Wallet</em>. To unlock these funds for withdrawal, a user must either complete 60% of daily tasks for 7 consecutive days OR complete one successful withdrawal.</p>
                        <p><strong>4. Anti-Fraud Policy:</strong> Any user detected using VPNs, Emulators, Multiple Accounts, or Automation tools will be silently excluded from the leaderboard and may face permanent account suspension.</p>
                        <p><strong>5. Rights Reserved:</strong> FairTask reserves the right to modify reward amounts, exclude suspicious users, or pause the leaderboard at any time without prior notice.</p>
                        <p className="text-center pt-2 font-medium text-gray-400">Participation does not guarantee income.</p>
                    </div>
                )}
             </div>
            
            {/* User Rank Sticky Footer */}
            {userEntry && (
                <div className="fixed bottom-16 md:bottom-4 left-4 right-4 md:left-[300px] md:max-w-4xl md:mx-auto z-40">
                    <div className="bg-gray-900 text-white rounded-xl p-4 shadow-2xl flex items-center justify-between border border-gray-700">
                        <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center font-bold relative">
                                 {user.name.charAt(0)}
                                 <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-gray-900"></div>
                             </div>
                             <div>
                                 <p className="font-bold text-sm flex items-center gap-2">
                                     Your Rank: #{userEntry.rank}
                                 </p>
                                 <p className="text-[10px] text-gray-400">Verified: ${userEntry.earnings.toFixed(2)}</p>
                             </div>
                        </div>
                        <div className="flex items-center gap-4 text-right">
                             {userEntry.reward !== undefined && userEntry.reward > 0 ? (
                                 <div>
                                    <p className="text-[10px] text-emerald-400 uppercase font-bold flex items-center justify-end gap-1">
                                        <Gift size={10} /> ${userEntry.reward} Bonus
                                    </p>
                                    <p className="text-[10px] text-gray-400">{userEntry.isBonusLocked ? 'Pending Unlock' : 'Eligible'}</p>
                                 </div>
                             ) : (
                                 <div className="text-right">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">Next Reward</p>
                                    <p className="text-[10px] text-gray-400">Reach Rank #{cutoffRank}</p>
                                 </div>
                             )}
                        </div>
                    </div>
                </div>
            )}
          </>
      )}
    </div>
  );
};
