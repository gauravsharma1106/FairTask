import React, { useState } from 'react';
import { useAuth } from '../services/authContext';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Card } from '../components/ui';
import { Zap } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if(phone.length > 9) setStep(2);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(phone, otp);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-white">
      {/* Abstract Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[120px] opacity-60"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-100 rounded-full blur-[120px] opacity-60"></div>

      <Card className="w-full max-w-md p-10 border-white/50 shadow-2xl shadow-emerald-900/5 relative z-10">
        <div className="text-center mb-10">
            <div className="inline-flex p-3 bg-emerald-50 rounded-2xl mb-4 text-emerald-600">
                <Zap size={32} fill="currentColor" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">FairTask</h1>
            <p className="text-gray-500 font-medium">Welcome back! Please login to continue.</p>
        </div>

        {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2 ml-1">Phone Number</label>
                    <Input 
                        placeholder="+91 98765 43210" 
                        value={phone} 
                        onChange={e => setPhone(e.target.value)}
                        required
                        className="bg-gray-50 border-transparent focus:bg-white"
                    />
                </div>
                <Button type="submit" size="lg" className="w-full shadow-xl shadow-emerald-500/20">Send OTP</Button>
            </form>
        ) : (
             <form onSubmit={handleVerify} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2 ml-1">Enter OTP sent to {phone}</label>
                    <Input 
                        placeholder="123456" 
                        value={otp} 
                        onChange={e => setOtp(e.target.value)}
                        required
                        className="bg-gray-50 border-transparent focus:bg-white text-center text-xl tracking-widest"
                    />
                </div>
                <Button type="submit" size="lg" className="w-full shadow-xl shadow-emerald-500/20">Verify & Login</Button>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-center w-full text-gray-500 hover:text-emerald-600 font-medium transition-colors">Change Number</button>
            </form>
        )}
      </Card>
      
      <div className="absolute bottom-6 text-center text-xs text-gray-400">
          &copy; 2024 FairTask Platform. Secure & Encrypted.
      </div>
    </div>
  );
};