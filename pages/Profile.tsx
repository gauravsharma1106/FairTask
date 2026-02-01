
import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import { BackendService } from '../services/mockBackend';
import { Card, Badge, Button, Input } from '../components/ui';
import { User, Shield, Smartphone, Mail, Calendar, LogOut, CheckCircle, XCircle, Clock, UploadCloud, FileText, AlertTriangle, ChevronRight, Users } from 'lucide-react';
import { UserStatus, KycStatus, KycDocumentType } from '../types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [kycForm, setKycForm] = useState({
      fullName: '',
      documentType: KycDocumentType.AADHAAR,
      documentNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!user) return null;

  const handleKycSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      try {
          // Simulate file upload logic by just passing a mock URL string
          await BackendService.submitKyc(user, {
              ...kycForm,
              documentImageFront: 'mock_url_front.jpg', 
              documentImageBack: 'mock_url_back.jpg'
          });
          toast.success('KYC Submitted for Review');
          refreshUser();
      } catch (e) {
          toast.error('Submission failed');
      } finally {
          setIsSubmitting(false);
      }
  };

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

  const renderKycSection = () => {
      const { kyc } = user;

      if (kyc.status === KycStatus.APPROVED) {
          return (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 flex flex-col items-center text-center">
                  <div className="bg-emerald-100 p-3 rounded-full text-emerald-600 mb-3">
                      <CheckCircle size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">KYC Verified</h3>
                  <p className="text-sm text-gray-500 mb-4">Your identity has been verified. You can now process withdrawals.</p>
                  <div className="w-full bg-white p-3 rounded-lg border border-emerald-100 text-left text-xs text-gray-500">
                      <p><strong>Verified on:</strong> {new Date(kyc.reviewedAt || Date.now()).toLocaleDateString()}</p>
                      <p><strong>Document:</strong> {kyc.documentType}</p>
                  </div>
              </div>
          );
      }

      if (kyc.status === KycStatus.SUBMITTED) {
          return (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col items-center text-center">
                  <div className="bg-blue-100 p-3 rounded-full text-blue-600 mb-3 animate-pulse">
                      <Clock size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Under Review</h3>
                  <p className="text-sm text-gray-500 mb-4">Our team is reviewing your documents. This usually takes 12-24 hours.</p>
                  <p className="text-xs text-blue-500 font-bold bg-blue-100 px-3 py-1 rounded-full">Submitted: {new Date(kyc.submittedAt || Date.now()).toLocaleString()}</p>
              </div>
          );
      }

      const isRejected = kyc.status === KycStatus.REJECTED;

      return (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
               <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center gap-2">
                   <Shield size={18} className="text-gray-500"/>
                   <h3 className="font-bold text-gray-900">Verify Identity</h3>
               </div>
               
               {isRejected && (
                   <div className="p-4 bg-red-50 text-red-600 text-sm border-b border-red-100 flex gap-2">
                       <AlertTriangle size={18} className="shrink-0" />
                       <div>
                           <p className="font-bold">Submission Rejected</p>
                           <p>Reason: {kyc.rejectionReason || 'Document unclear or invalid.'}</p>
                       </div>
                   </div>
               )}

               <form onSubmit={handleKycSubmit} className="p-6 space-y-4">
                   <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name (As per ID)</label>
                       <Input 
                            value={kycForm.fullName} 
                            onChange={e => setKycForm({...kycForm, fullName: e.target.value})}
                            placeholder="John Doe"
                            required
                        />
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ID Type</label>
                           <select 
                                className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                value={kycForm.documentType}
                                onChange={e => setKycForm({...kycForm, documentType: e.target.value as KycDocumentType})}
                           >
                               <option value={KycDocumentType.AADHAAR}>Aadhaar Card</option>
                               <option value={KycDocumentType.PAN}>PAN Card</option>
                               <option value={KycDocumentType.DRIVING_LICENSE}>Driving License</option>
                           </select>
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Document Number</label>
                           <Input 
                                value={kycForm.documentNumber}
                                onChange={e => setKycForm({...kycForm, documentNumber: e.target.value})}
                                placeholder="XXXX-XXXX-XXXX"
                                required
                           />
                       </div>
                   </div>

                   <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Upload Document (Front & Back)</label>
                       <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-emerald-400 transition-colors cursor-pointer">
                           <UploadCloud size={32} className="mb-2"/>
                           <p className="text-xs font-bold">Click to Upload Image</p>
                           <p className="text-[10px] opacity-70">Max size 5MB. JPG/PNG only.</p>
                       </div>
                   </div>

                   <Button type="submit" disabled={isSubmitting} className="w-full">
                       {isSubmitting ? 'Uploading securely...' : (isRejected ? 'Resubmit Verification' : 'Submit for Verification')}
                   </Button>
                   <p className="text-[10px] text-center text-gray-400">
                       Your data is encrypted and used only for legal compliance.
                   </p>
               </form>
          </div>
      );
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
          
          <div className="p-6 space-y-8">
              {/* Account Actions */}
              <section>
                 <div 
                    onClick={() => navigate('/referrals')}
                    className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-xl cursor-pointer hover:bg-indigo-100 transition-colors mb-6"
                 >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                            <Users size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">Referral Program</h3>
                            <p className="text-xs text-gray-500">Invite friends & earn lifetime bonuses</p>
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-400" />
                 </div>
              </section>

              {/* KYC SECTION */}
              <section>
                  <div className="flex items-center gap-2 mb-4">
                      <FileText size={18} className="text-gray-900" />
                      <h3 className="font-bold text-gray-900">KYC Status</h3>
                  </div>
                  {renderKycSection()}
              </section>

              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
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
