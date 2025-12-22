import React from 'react';
import { useAuth } from '../services/authContext';
import { Card, Button, Badge } from '../components/ui';
import { Link } from 'react-router-dom';
import { Activity, TrendingUp, Users, Lock, ChevronRight, PlayCircle, Link as LinkIcon, CheckCircle2, ShieldCheck, AlertCircle, Ban } from 'lucide-react';
import { PLANS } from '../constants';
import { PlanTier, UserStatus } from '../types';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const plan = PLANS[user.planId];
  
  // Calculate Task Stats
  const videoLimit = plan.dailyVideoLimit;
  const videosWatched = user.dailyStats.videosWatched;
  const progressVideo = Math.min((videosWatched / videoLimit) * 100, 100);
  const videoRemaining = Math.max(0, videoLimit - videosWatched);

  const linkLimit = plan.dailyLinkLimit;
  const linksVisited = user.dailyStats.linksVisited;
  const progressLink = Math.min((linksVisited / linkLimit) * 100, 100);
  const linkRemaining = Math.max(0, linkLimit - linksVisited);

  // Calculate potential
  const videoPotential = (plan.videoRate / plan.videoRateBasis) * videoLimit;
  const linkPotential = (plan.linkRate / plan.linkRateBasis) * linkLimit;

  // Status Badge Logic
  const getStatusBadge = () => {
      switch (user.status) {
          case UserStatus.ACTIVE:
              return <Badge type="success"><span className="flex items-center gap-1"><ShieldCheck size={12}/> Active</span></Badge>;
          case UserStatus.SUSPENDED:
              return <Badge type="warning"><span className="flex items-center gap-1"><AlertCircle size={12}/> Suspended</span></Badge>;
          case UserStatus.BANNED:
              return <Badge type="error"><span className="flex items-center gap-1"><Ban size={12}/> Banned</span></Badge>;
          default:
              return null;
      }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
            <h2 className="text-gray-500 text-sm font-semibold mb-0.5">Welcome back,</h2>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{user.name}</h1>
        </div>
        <div className="flex items-center gap-3">
            {getStatusBadge()}
            <Badge type="info">{user.planId} PLAN</Badge>
        </div>
      </div>

      {/* Wallet Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Balance - Gradient Card */}
        <div className="rounded-2xl p-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden glass-card border-0">
            <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4">
                <TrendingUp size={120} />
            </div>
            <div className="relative z-10">
                <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-2">Total Balance</p>
                <h3 className="text-4xl font-extrabold mb-6">${user.wallet.main.toFixed(2)}</h3>
                <Link to="/wallet">
                    <button className="w-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white py-2.5 rounded-xl text-sm font-semibold transition-all border border-white/30">
                        Withdraw Funds
                    </button>
                </Link>
            </div>
        </div>

        {/* Pending Card */}
        <Card className="flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Pending</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">${user.wallet.pending.toFixed(2)}</h3>
                </div>
                <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl">
                    <Activity size={24} />
                </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded-lg">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                Verifying (Approx. 24h)
            </div>
        </Card>

        {/* Bonus Card */}
        <Card className="flex flex-col justify-between border-dashed border-2 border-amber-200 bg-amber-50/50">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-amber-500/80 text-xs font-bold uppercase tracking-wider">Locked Bonus</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">${user.wallet.bonus.toFixed(2)}</h3>
                </div>
                <div className="p-2.5 bg-amber-100 text-amber-500 rounded-xl">
                    <Lock size={24} />
                </div>
            </div>
             <p className="text-xs text-amber-600 mt-4 font-medium">
                Unlock by completing tasks
            </p>
        </Card>
      </div>

      {/* Task Section */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xl font-bold text-gray-800">Daily Tasks</h3>
            <Link to="/plans" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                Increase Limits <ChevronRight size={16} />
            </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Video Task */}
            <Card className="border-l-4 border-l-indigo-500 hover:translate-y-[-2px] transition-transform duration-300">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl">
                            <PlayCircle size={28} strokeWidth={2} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-lg">Watch & Earn</h4>
                            <p className="text-xs text-gray-500 font-medium">Up to ${videoPotential.toFixed(2)}/day</p>
                        </div>
                    </div>
                    <div className="text-right">
                         <span className={`text-2xl font-extrabold ${videoRemaining === 0 ? 'text-emerald-500' : 'text-gray-800'}`}>
                            {videosWatched}
                            <span className="text-gray-400 text-base font-semibold">/{videoLimit}</span>
                         </span>
                    </div>
                </div>

                <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-xs font-bold uppercase text-gray-400 tracking-wide">
                        <span className={videoRemaining === 0 ? 'text-emerald-500' : 'text-indigo-500'}>
                            {videoRemaining === 0 ? 'Completed' : 'Progress'}
                        </span>
                        <span>{Math.round(progressVideo)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                        <div 
                            className={`h-full rounded-full transition-all duration-700 ease-out shadow-sm ${videoRemaining === 0 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                            style={{ width: `${progressVideo}%` }}
                        ></div>
                    </div>
                </div>
                
                <Link to="/earn">
                    <Button 
                        disabled={videoRemaining === 0}
                        className={`w-full justify-between shadow-none ${videoRemaining === 0 ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-50' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20'}`}
                    >
                        {videoRemaining === 0 ? (
                            <span className="flex items-center gap-2"><CheckCircle2 size={18}/> Limit Reached</span>
                        ) : (
                            <span className="flex items-center gap-2">Watch Video <span className="opacity-70 text-xs font-normal">({videoRemaining} left)</span></span>
                        )}
                        {videoRemaining > 0 && <ChevronRight size={18} />}
                    </Button>
                </Link>
            </Card>

            {/* Link Task */}
            <Card className="border-l-4 border-l-emerald-500 hover:translate-y-[-2px] transition-transform duration-300">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
                            <LinkIcon size={28} strokeWidth={2} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-lg">Visit Links</h4>
                            <p className="text-xs text-gray-500 font-medium">Up to ${linkPotential.toFixed(2)}/day</p>
                        </div>
                    </div>
                    <div className="text-right">
                         <span className={`text-2xl font-extrabold ${linkRemaining === 0 ? 'text-emerald-500' : 'text-gray-800'}`}>
                            {linksVisited}
                            <span className="text-gray-400 text-base font-semibold">/{linkLimit}</span>
                         </span>
                    </div>
                </div>

                <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-xs font-bold uppercase text-gray-400 tracking-wide">
                        <span className={linkRemaining === 0 ? 'text-emerald-500' : 'text-emerald-500'}>
                            {linkRemaining === 0 ? 'Completed' : 'Progress'}
                        </span>
                        <span>{Math.round(progressLink)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                        <div 
                            className={`h-full rounded-full transition-all duration-700 ease-out shadow-sm ${linkRemaining === 0 ? 'bg-emerald-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${progressLink}%` }}
                        ></div>
                    </div>
                </div>
                
                <Link to="/earn">
                    <Button 
                        disabled={linkRemaining === 0}
                        variant={linkRemaining === 0 ? 'outline' : 'primary'}
                        className={`w-full justify-between shadow-none ${linkRemaining === 0 ? 'bg-emerald-50 text-emerald-600 border-transparent' : ''}`}
                    >
                        {linkRemaining === 0 ? (
                            <span className="flex items-center gap-2"><CheckCircle2 size={18}/> Limit Reached</span>
                        ) : (
                            <span className="flex items-center gap-2">Visit Link <span className="opacity-70 text-xs font-normal">({linkRemaining} left)</span></span>
                        )}
                        {linkRemaining > 0 && <ChevronRight size={18} />}
                    </Button>
                </Link>
            </Card>
        </div>
      </div>
      
      {user.planId === PlanTier.TRIAL && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-100 p-5 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                  <h4 className="text-orange-800 font-bold text-sm">Trial Plan Active</h4>
                  <p className="text-orange-600 text-xs mt-1">Upgrade to Basic plan for 5x earnings and daily rewards.</p>
              </div>
              <Link to="/plans">
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 border-none">Upgrade Now</Button>
              </Link>
          </div>
      )}
    </div>
  );
};