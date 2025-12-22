import React from 'react';
import { useAuth } from '../services/authContext';
import { Card, Badge, Button } from '../components/ui';
import { User, Shield, Smartphone, Mail, Calendar, LogOut } from 'lucide-react';
import { UserStatus } from '../types';

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const getStatusBadge = () => {
      switch (user.status) {
          case UserStatus.ACTIVE:
              return <Badge type="success">Active</Badge>;
          case UserStatus.SUSPENDED:
              return <Badge type="warning">Suspended</Badge>;
          case UserStatus.BANNED:
              return <Badge type="error">Banned</Badge>;
          default:
              return null;
      }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
            <User size={28} />
        </div>
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Profile</h1>
            <p className="text-gray-500 text-sm">Account details and security status</p>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-white">
              <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-2xl font-bold shadow-inner">
                      {user.name.charAt(0)}
                  </div>
                  <div>
                      <h2 className="text-2xl font-bold">{user.name}</h2>
                      <div className="flex items-center gap-2 mt-1 opacity-90 text-sm">
                          <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-xs">ID: {user.uid}</span>
                          {getStatusBadge()}
                      </div>
                  </div>
              </div>
          </div>
          
          <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1"><Mail size={12}/> Email</label>
                      <p className="font-medium text-gray-800">{user.email || 'Not linked'}</p>
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1"><Smartphone size={12}/> Phone</label>
                      <p className="font-medium text-gray-800">{user.phone || 'Not linked'}</p>
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1"><Shield size={12}/> Current Plan</label>
                      <p className="font-bold text-emerald-600">{user.planId}</p>
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1"><Calendar size={12}/> Plan Expiry</label>
                      <p className="font-medium text-gray-800">{new Date(user.planExpiry).toLocaleDateString()}</p>
                  </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Security Information</h3>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-100">
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Device Fingerprint</span>
                          <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">{user.deviceFingerprint}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Referral Code</span>
                          <span className="font-mono font-bold text-emerald-600">{user.referralCode}</span>
                      </div>
                  </div>
              </div>

              <div className="pt-2">
                  <Button variant="outline" onClick={logout} className="w-full text-red-500 border-red-100 hover:bg-red-50 hover:border-red-200">
                      <LogOut size={16} className="mr-2"/> Sign Out
                  </Button>
              </div>
          </div>
      </Card>
    </div>
  );
};