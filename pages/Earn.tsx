import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import { BackendService } from '../services/mockBackend';
import { Card, Button, Badge } from '../components/ui';
import { PLANS } from '../constants';
import { Play, Link as LinkIcon, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const Earn: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [activeTask, setActiveTask] = useState<'VIDEO' | 'LINK' | null>(null);
  const [timer, setTimer] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!user) return null;
  const plan = PLANS[user.planId];

  const startTask = (type: 'VIDEO' | 'LINK') => {
    // Client-side pre-check
    const current = type === 'VIDEO' ? user.dailyStats.videosWatched : user.dailyStats.linksVisited;
    const limit = type === 'VIDEO' ? plan.dailyVideoLimit : plan.dailyLinkLimit;
    
    if (current >= limit) {
        toast.error('Daily limit reached for this task type.');
        return;
    }

    setActiveTask(type);
    const duration = type === 'VIDEO' ? 15 : 10;
    setTimer(duration);

    const interval = setInterval(() => {
        setTimer((prev) => {
            if (prev <= 1) {
                clearInterval(interval);
                return 0;
            }
            return prev - 1;
        });
    }, 1000);
  };

  const claimReward = async () => {
    if (!activeTask) return;
    setIsProcessing(true);

    try {
        const result = await BackendService.completeTask(user, activeTask);
        if (result.success) {
            toast.success(`Task Validated! Earned $${result.reward?.toFixed(3)}`, {
                icon: '💰',
                style: { borderRadius: '12px', background: '#fff', color: '#333' }
            });
            await refreshUser();
        } else {
            toast.error(result.error || 'Validation failed');
        }
    } catch (e) {
        toast.error('Network error verifying task.');
    } finally {
        setIsProcessing(false);
        setActiveTask(null);
    }
  };

  if (activeTask) {
    return (
        <div className="h-full flex flex-col items-center justify-center space-y-8 py-10">
            <div className="text-center">
                <Badge type="info" className="mb-4">ACTIVE SESSION</Badge>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                    {activeTask === 'VIDEO' ? 'Watching Content' : 'Visiting Partner'}
                </h2>
                <p className="text-gray-500 text-sm">Do not close this window or switch tabs.</p>
            </div>

            <div className="relative w-48 h-48 flex items-center justify-center">
                 <div className="absolute inset-0 border-8 border-gray-100 rounded-full"></div>
                 <div className="absolute inset-0 border-8 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                 <div className="text-5xl font-mono font-bold text-gray-800">{timer}s</div>
            </div>

            {timer === 0 && (
                <div className="animate-bounce">
                    <Button 
                        onClick={claimReward} 
                        disabled={isProcessing}
                        size="lg"
                        className="w-64 text-lg"
                    >
                        {isProcessing ? 'Verifying...' : 'Claim Reward'}
                    </Button>
                </div>
            )}

             {timer > 0 && (
                 <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
                     <AlertTriangle size={18} />
                     <span className="text-sm font-medium">Keep window focused</span>
                 </div>
             )}
        </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Earn Zone</h2>
            <div className="text-right">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Today's Potential</p>
                <p className="text-lg font-bold text-emerald-600">
                    ${(plan.videoRate + plan.linkRate).toFixed(2)}
                </p>
            </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-xl transition-shadow duration-300 border-t-4 border-t-indigo-500">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <Play size={28} fill="currentColor" />
                    </div>
                    <Badge type="info">{user.dailyStats.videosWatched}/{plan.dailyVideoLimit}</Badge>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Watch Videos</h3>
                <p className="text-sm text-gray-500 mb-6">Watch premium sponsored content. High engagement required.</p>
                
                <div className="flex items-center justify-between text-xs font-semibold text-gray-400 mb-6 bg-gray-50 p-3 rounded-lg">
                    <span className="flex items-center gap-1"><Clock size={14}/> 15 Seconds</span>
                    <span className="text-emerald-600">~${(plan.videoRate/5).toFixed(3)}/view</span>
                </div>

                <Button 
                    onClick={() => startTask('VIDEO')} 
                    disabled={user.dailyStats.videosWatched >= plan.dailyVideoLimit}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"
                >
                    {user.dailyStats.videosWatched >= plan.dailyVideoLimit ? 'Daily Limit Reached' : 'Start Watching'}
                </Button>
            </Card>

            <Card className="hover:shadow-xl transition-shadow duration-300 border-t-4 border-t-emerald-500">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                        <LinkIcon size={28} />
                    </div>
                    <Badge type="success">{user.dailyStats.linksVisited}/{plan.dailyLinkLimit}</Badge>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Visit Links</h3>
                <p className="text-sm text-gray-500 mb-6">Browse verified partner websites. Traffic validation required.</p>
                
                <div className="flex items-center justify-between text-xs font-semibold text-gray-400 mb-6 bg-gray-50 p-3 rounded-lg">
                    <span className="flex items-center gap-1"><Clock size={14}/> 10 Seconds</span>
                    <span className="text-emerald-600">~${(plan.linkRate/5).toFixed(3)}/visit</span>
                </div>

                <Button 
                     onClick={() => startTask('LINK')}
                     disabled={user.dailyStats.linksVisited >= plan.dailyLinkLimit}
                     className="w-full"
                >
                    {user.dailyStats.linksVisited >= plan.dailyLinkLimit ? 'Daily Limit Reached' : 'Visit Link'}
                </Button>
            </Card>
       </div>

       <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-sm text-red-600 flex items-start gap-3">
           <AlertTriangle className="shrink-0 mt-0.5" size={18} />
           <p><strong>System Warning:</strong> Our security system fingerprints every session. Using VPNs, automation, or ad-blockers will result in an immediate permanent ban and forfeiture of wallet balance.</p>
       </div>
    </div>
  );
};