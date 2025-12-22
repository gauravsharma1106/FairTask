import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import { LayoutDashboard, Wallet, PlayCircle, Crown, LogOut, ShieldAlert, Zap } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user && location.pathname !== '/login') {
    return <>{children}</>; 
  }

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: PlayCircle, label: 'Earn', path: '/earn' },
    { icon: Wallet, label: 'Wallet', path: '/wallet' },
    { icon: Crown, label: 'Plans', path: '/plans' },
  ];

  if (isAdmin) {
    navItems.push({ icon: ShieldAlert, label: 'Admin', path: '/admin' });
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-gray-800">
      {/* Mobile Header - Glass */}
      <header className="md:hidden h-16 glass-panel flex items-center justify-between px-6 sticky top-0 z-50 border-b border-white/40">
        <div className="font-extrabold text-xl tracking-tight text-gray-900 flex items-center gap-1">
            <Zap className="text-emerald-500 fill-emerald-500" size={24} />
            FairTask
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg">${user?.wallet.main.toFixed(2)}</span>
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-xs text-white shadow-lg shadow-emerald-500/20">
            {user?.name.charAt(0)}
          </div>
        </div>
      </header>

      {/* Desktop Sidebar - Glass */}
      <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 glass-panel border-r border-white/40 z-10">
        <div className="p-8 pb-4">
           <div className="font-extrabold text-2xl tracking-tight text-gray-900 flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500 rounded-lg shadow-lg shadow-emerald-500/30">
                    <Zap className="text-white fill-white" size={20} />
                </div>
                FairTask
           </div>
           <p className="text-xs text-gray-400 mt-2 font-medium tracking-wide pl-1">EARNING EVOLVED</p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'}`}
            >
              <item.icon size={22} strokeWidth={2} />
              <span className="font-semibold">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6">
            <button onClick={logout} className="flex items-center space-x-3 px-4 py-3 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl w-full transition-colors">
                <LogOut size={20} />
                <span className="font-medium">Sign Out</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-0 overflow-y-auto h-screen no-scrollbar">
        <div className="max-w-5xl mx-auto p-4 md:p-10">
            {children}
        </div>
      </main>

      {/* Mobile Bottom Nav - Glass */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 glass-card h-16 rounded-2xl flex items-center justify-around z-50 shadow-2xl shadow-emerald-900/10">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-0.5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-emerald-100' : ''}`}>
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                {/* <span className="text-[9px] font-bold">{item.label}</span> */}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};