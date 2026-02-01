
import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/authContext';
import { BackendService } from '../services/mockBackend';
import { Card, Button, Badge, Input } from '../components/ui';
import { 
    LayoutDashboard, Users, Wallet, FileText, Settings, ShieldAlert, 
    Bell, BarChart3, Lock, LogOut, CheckCircle, XCircle, Search, 
    AlertTriangle, History, RefreshCcw, Save, Shield, Siren, Menu, X, Clock,
    Check, ArrowRight, ArrowUpRight
} from 'lucide-react';
import { AdminRole, KycStatus, KycData, SystemSettings, AuditLog, User as AppUser, UserStatus, SubAdmin, AdminPermission, EmergencyState, WithdrawalRequest, TransactionStatus } from '../types';
import toast from 'react-hot-toast';

// --- SIDEBAR CONFIG ---
const MENU_ITEMS = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, roles: ['ALL'] },
    { id: 'admins', label: 'Admin Access', icon: Shield, roles: [AdminRole.SUPER_ADMIN] },
    { id: 'emergency', label: 'Emergency', icon: Siren, roles: [AdminRole.SUPER_ADMIN] },
    { id: 'users', label: 'User Database', icon: Users, roles: [AdminRole.SUPER_ADMIN, AdminRole.FRAUD_ANALYST, AdminRole.SUPPORT_ADMIN, AdminRole.FINANCE_ADMIN] },
    { id: 'finance', label: 'Finance & Payouts', icon: Wallet, roles: [AdminRole.SUPER_ADMIN, AdminRole.FINANCE_ADMIN, AdminRole.AUDITOR] },
    { id: 'kyc', label: 'KYC Requests', icon: FileText, roles: [AdminRole.SUPER_ADMIN, AdminRole.KYC_ADMIN] },
    { id: 'audit', label: 'System Logs', icon: History, roles: [AdminRole.SUPER_ADMIN, AdminRole.AUDITOR, AdminRole.FRAUD_ANALYST] },
    { id: 'settings', label: 'Configuration', icon: Settings, roles: [AdminRole.SUPER_ADMIN] },
];

export const Admin: React.FC = () => {
  const { user, adminRole, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user || !adminRole) return <div className="p-10 text-center text-red-500">Access Denied</div>;

  const allowedItems = MENU_ITEMS.filter(item => 
      item.roles.includes('ALL') || item.roles.includes(adminRole)
  );

  const renderContent = () => {
      switch(activeTab) {
          case 'dashboard': return <DashboardPanel role={adminRole} />;
          case 'admins': return <AdminManagementPanel currentUser={user.uid} />;
          case 'emergency': return <EmergencyPanel currentUser={user.uid} />;
          case 'users': return <UsersPanel role={adminRole} currentUser={user.uid} />;
          case 'finance': return <FinancePanel role={adminRole} currentUser={user.uid} />;
          case 'kyc': return <KycPanel role={adminRole} adminId={user.uid} />;
          case 'settings': return <SettingsPanel role={adminRole} adminId={user.uid} />;
          case 'audit': return <AuditPanel />;
          default: return <DashboardPanel role={adminRole} />;
      }
  };

  const SidebarContent = () => (
      <>
        <div className="p-6 flex items-center gap-3 border-b border-gray-800 h-20">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
                <ShieldAlert className="text-emerald-500 shrink-0" size={24} />
            </div>
            {(sidebarOpen || mobileMenuOpen) && (
                <div>
                    <h1 className="font-bold text-lg tracking-tight text-white">FairAdmin</h1>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{adminRole.replace('_', ' ')}</p>
                </div>
            )}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto no-scrollbar">
            {allowedItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                        activeTab === item.id 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' 
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                    <item.icon size={20} className={`transition-colors ${activeTab === item.id ? 'text-white' : 'group-hover:text-emerald-400'}`} />
                    {(sidebarOpen || mobileMenuOpen) && <span className="font-medium text-sm">{item.label}</span>}
                </button>
            ))}
        </nav>
        
        <div className="p-4 border-t border-gray-800">
            <div className="bg-gray-800/50 rounded-xl p-3 flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-xs text-white">
                    {user.name.charAt(0)}
                </div>
                {(sidebarOpen || mobileMenuOpen) && (
                    <div className="overflow-hidden">
                        <p className="text-xs font-bold text-gray-200 truncate">{user.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                    </div>
                )}
            </div>
            <button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
            >
                <LogOut size={14} />
                {(sidebarOpen || mobileMenuOpen) && "Sign Out"}
            </button>
        </div>
      </>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
        {/* DESKTOP SIDEBAR */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} hidden md:flex bg-[#0F172A] text-white transition-all duration-300 flex-col shadow-2xl z-20`}>
            <SidebarContent />
        </aside>

        {/* MOBILE HEADER & MENU */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0F172A] z-30 flex items-center justify-between px-4 shadow-md">
            <div className="flex items-center gap-2 text-white font-bold">
                 <ShieldAlert className="text-emerald-500" size={24} />
                 FairAdmin
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
                {mobileMenuOpen ? <X /> : <Menu />}
            </button>
        </div>

        {/* MOBILE SIDEBAR OVERLAY */}
        {mobileMenuOpen && (
            <div className="md:hidden fixed inset-0 z-20 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
                <div className="w-64 h-full bg-[#0F172A] flex flex-col" onClick={e => e.stopPropagation()}>
                    <SidebarContent />
                </div>
            </div>
        )}

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col overflow-hidden relative pt-16 md:pt-0">
            {/* Desktop Header */}
            <header className="hidden md:flex h-20 bg-white border-b border-gray-200 items-center justify-between px-8 shadow-sm z-10">
                <div className="flex items-center gap-4">
                     <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <Menu size={20} />
                     </button>
                     <h2 className="text-xl font-bold text-gray-800">{allowedItems.find(i => i.id === activeTab)?.label}</h2>
                </div>
                <div className="flex items-center gap-4">
                    <span className="bg-emerald-50 px-3 py-1 rounded-full text-xs font-mono text-emerald-600 border border-emerald-100 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        Secure Session
                    </span>
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="rounded-lg">
                        <RefreshCcw size={16} />
                    </Button>
                </div>
            </header>

            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
                <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
                    {renderContent()}
                </div>
            </div>
        </main>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const AdminManagementPanel: React.FC<{ currentUser: string }> = ({ currentUser }) => {
    const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
    const [showForm, setShowForm] = useState(false);
    
    // Form State
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newRole, setNewRole] = useState<AdminRole>(AdminRole.SUPPORT_ADMIN);
    const [newPermissions, setNewPermissions] = useState<AdminPermission[]>([]);

    useEffect(() => {
        loadAdmins();
    }, []);

    const loadAdmins = () => {
        BackendService.getSubAdmins().then(setSubAdmins);
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        await BackendService.createSubAdmin({
            name: newName,
            phone: newPhone,
            role: newRole,
            permissions: newPermissions,
            active: true
        }, currentUser);
        toast.success('Admin Created');
        setShowForm(false);
        setNewName(''); setNewPhone(''); setNewRole(AdminRole.SUPPORT_ADMIN); setNewPermissions([]);
        loadAdmins();
    };

    const handleDelete = async (id: string) => {
        if(window.confirm("Permanently remove this admin?")) {
            await BackendService.deleteSubAdmin(id, currentUser);
            toast.success('Admin Removed');
            loadAdmins();
        }
    };

    const togglePermission = (perm: AdminPermission) => {
        if (newPermissions.includes(perm)) {
            setNewPermissions(newPermissions.filter(p => p !== perm));
        } else {
            setNewPermissions([...newPermissions, perm]);
        }
    };

    const availablePermissions: AdminPermission[] = [
        'VIEW_DASHBOARD', 'VIEW_USERS', 'EDIT_USERS', 'VIEW_FINANCE', 
        'APPROVE_WITHDRAWALS', 'VIEW_KYC', 'APPROVE_KYC', 'VIEW_AUDIT'
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Platform Administrators</h3>
                <Button onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : 'Create New Admin'}
                </Button>
            </div>

            {showForm && (
                <Card className="p-6 bg-white border-blue-100 shadow-lg shadow-blue-500/5">
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                                <Input required value={newName} onChange={e => setNewName(e.target.value)} placeholder="Admin Name" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone (Login ID)</label>
                                <Input required value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="10-digit number" />
                            </div>
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role Type</label>
                             <select 
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm"
                                value={newRole}
                                onChange={e => setNewRole(e.target.value as AdminRole)}
                             >
                                 <option value={AdminRole.SUPPORT_ADMIN}>Support</option>
                                 <option value={AdminRole.KYC_ADMIN}>KYC Manager</option>
                                 <option value={AdminRole.FINANCE_ADMIN}>Finance</option>
                                 <option value={AdminRole.FRAUD_ANALYST}>Fraud Analyst</option>
                             </select>
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Permissions</label>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                 {availablePermissions.map(perm => (
                                     <div 
                                        key={perm}
                                        onClick={() => togglePermission(perm)}
                                        className={`p-2 rounded-lg text-[10px] font-bold border cursor-pointer select-none text-center transition-all ${newPermissions.includes(perm) ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
                                     >
                                         {perm.replace('_', ' ')}
                                     </div>
                                 ))}
                             </div>
                        </div>
                        <Button type="submit" className="w-full">Confirm Creation</Button>
                    </form>
                </Card>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Permissions</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {subAdmins.map(admin => (
                            <tr key={admin.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-gray-900">{admin.name}</p>
                                    <p className="text-xs text-gray-500">{admin.phone}</p>
                                </td>
                                <td className="px-6 py-4"><Badge type="info">{admin.role}</Badge></td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {admin.permissions.slice(0, 3).map(p => (
                                            <span key={p} className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 border border-gray-200">{p}</span>
                                        ))}
                                        {admin.permissions.length > 3 && <span className="text-[10px] text-gray-400">+{admin.permissions.length - 3} more</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(admin.id)}>Remove</Button>
                                </td>
                            </tr>
                        ))}
                         {subAdmins.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-gray-400">No sub-admins created.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const EmergencyPanel: React.FC<{ currentUser: string }> = ({ currentUser }) => {
    const [state, setState] = useState<EmergencyState | null>(null);

    useEffect(() => {
        BackendService.getEmergencyState().then(setState);
    }, []);

    const toggle = async (key: keyof EmergencyState) => {
        if (!state) return;
        const newState = !state[key];
        
        if (window.confirm(`Are you sure you want to ${newState ? 'PAUSE' : 'RESUME'} ${key}? This affects all users immediately.`)) {
            await BackendService.toggleEmergencyState(key, newState, currentUser);
            setState({ ...state, [key]: newState });
            toast.success(`System updated: ${key} is now ${newState ? 'PAUSED' : 'ACTIVE'}`);
        }
    };

    if (!state) return null;

    return (
        <Card className="border-l-4 border-l-red-500 p-8 shadow-xl shadow-red-500/5">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-red-50 text-red-600 rounded-full animate-pulse border border-red-100">
                    <Siren size={40} />
                </div>
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Emergency Control</h2>
                    <p className="text-red-600 font-bold text-sm tracking-wide">SUPER ADMIN DANGER ZONE</p>
                </div>
            </div>
            
            <p className="mb-8 text-gray-500 text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
                These controls override all other system logic. Use only in case of detected fraud or system failure. Actions are logged permanently.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${state.withdrawalsPaused ? 'bg-red-50 border-red-500' : 'bg-white border-gray-200 hover:border-red-300'}`} onClick={() => toggle('withdrawalsPaused')}>
                    <div className="flex justify-between items-start mb-2">
                        <Wallet className={state.withdrawalsPaused ? 'text-red-600' : 'text-gray-400'} />
                        <div className={`w-3 h-3 rounded-full ${state.withdrawalsPaused ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                    </div>
                    <h4 className="font-bold text-lg mb-1">Withdrawals</h4>
                    <p className="text-xs text-gray-500 mb-4">Stops all payout requests globally.</p>
                    <div className={`w-full py-2 text-center rounded-lg font-bold text-xs tracking-wider ${state.withdrawalsPaused ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {state.withdrawalsPaused ? 'PAUSED' : 'ACTIVE'}
                    </div>
                </div>

                <div className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${state.earningsPaused ? 'bg-red-50 border-red-500' : 'bg-white border-gray-200 hover:border-red-300'}`} onClick={() => toggle('earningsPaused')}>
                    <div className="flex justify-between items-start mb-2">
                        <LayoutDashboard className={state.earningsPaused ? 'text-red-600' : 'text-gray-400'} />
                        <div className={`w-3 h-3 rounded-full ${state.earningsPaused ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                    </div>
                    <h4 className="font-bold text-lg mb-1">Earnings</h4>
                    <p className="text-xs text-gray-500 mb-4">Disables task validation & crediting.</p>
                     <div className={`w-full py-2 text-center rounded-lg font-bold text-xs tracking-wider ${state.earningsPaused ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {state.earningsPaused ? 'PAUSED' : 'ACTIVE'}
                    </div>
                </div>

                <div className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${state.referralsPaused ? 'bg-red-50 border-red-500' : 'bg-white border-gray-200 hover:border-red-300'}`} onClick={() => toggle('referralsPaused')}>
                    <div className="flex justify-between items-start mb-2">
                        <Users className={state.referralsPaused ? 'text-red-600' : 'text-gray-400'} />
                        <div className={`w-3 h-3 rounded-full ${state.referralsPaused ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                    </div>
                    <h4 className="font-bold text-lg mb-1">Referrals</h4>
                    <p className="text-xs text-gray-500 mb-4">Stops referral tracking & commissions.</p>
                     <div className={`w-full py-2 text-center rounded-lg font-bold text-xs tracking-wider ${state.referralsPaused ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {state.referralsPaused ? 'PAUSED' : 'ACTIVE'}
                    </div>
                </div>
            </div>
        </Card>
    );
};

const DashboardPanel: React.FC<{ role: AdminRole }> = ({ role }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white p-6 border-l-4 border-l-emerald-500 shadow-md">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</p>
                        <h3 className="text-3xl font-extrabold text-gray-900 mt-1">$12,450</h3>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                        <Wallet size={20} />
                    </div>
                </div>
                {role !== AdminRole.SUPER_ADMIN && role !== AdminRole.FINANCE_ADMIN && <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center text-xs font-bold text-gray-500">Hidden</div>}
            </Card>
            <Card className="bg-white p-6 border-l-4 border-l-blue-500 shadow-md">
                 <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Users</p>
                        <h3 className="text-3xl font-extrabold text-gray-900 mt-1">1,204</h3>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <Users size={20} />
                    </div>
                </div>
            </Card>
            <Card className="bg-white p-6 border-l-4 border-l-orange-500 shadow-md">
                 <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending KYC</p>
                        <h3 className="text-3xl font-extrabold text-gray-900 mt-1">45</h3>
                    </div>
                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                        <FileText size={20} />
                    </div>
                </div>
            </Card>
            <Card className="bg-white p-6 border-l-4 border-l-red-500 shadow-md">
                 <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fraud Alerts</p>
                        <h3 className="text-3xl font-extrabold text-gray-900 mt-1">3</h3>
                    </div>
                    <div className="p-2 bg-red-50 rounded-lg text-red-600">
                        <ShieldAlert size={20} />
                    </div>
                </div>
            </Card>
            
            <div className="md:col-span-2">
                <Card className="p-0 h-64 flex flex-col justify-center items-center text-gray-400 border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center bg-gray-50/50">
                        <div className="text-center">
                            <BarChart3 size={48} className="mx-auto mb-2 opacity-20"/>
                            <p className="text-sm font-medium">Live Traffic Chart</p>
                        </div>
                    </div>
                </Card>
            </div>
             <div className="md:col-span-2">
                <Card className="p-6 h-64 bg-white border border-gray-200 shadow-sm flex flex-col">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Bell size={16} /> Recent Activity
                    </h4>
                    <div className="flex-1 space-y-3">
                         <div className="flex items-center gap-3 text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            <span className="text-gray-600">New User Registration: <span className="font-bold text-gray-900">User #1092</span></span>
                            <span className="ml-auto text-xs text-gray-400">2m ago</span>
                         </div>
                         <div className="flex items-center gap-3 text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-gray-600">Withdrawal Request: <span className="font-bold text-gray-900">$50.00</span></span>
                            <span className="ml-auto text-xs text-gray-400">15m ago</span>
                         </div>
                         <div className="flex items-center gap-3 text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="text-gray-600">Fraud Alert: Multiple Accounts Detected</span>
                            <span className="ml-auto text-xs text-gray-400">1h ago</span>
                         </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

const UsersPanel: React.FC<{ role: AdminRole, currentUser: string }> = ({ role, currentUser }) => {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = () => {
        BackendService.adminGetUsers().then(setUsers);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleStatus = async (uid: string, currentStatus: UserStatus) => {
        const newStatus = currentStatus === UserStatus.ACTIVE ? UserStatus.BANNED : UserStatus.ACTIVE;
        if(window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
            await BackendService.adminUpdateUserStatus(uid, newStatus, currentUser);
            toast.success(`User ${newStatus === UserStatus.ACTIVE ? 'Unbanned' : 'Banned'}`);
            fetchUsers();
        }
    };

    const canAction = role === AdminRole.SUPER_ADMIN || role === AdminRole.FRAUD_ANALYST;
    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.phone?.includes(searchTerm) || 
        u.uid.includes(searchTerm)
    );

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700">User Database</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" 
                        placeholder="Search user ID, phone..." 
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">User Details</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Plan</th>
                            <th className="px-6 py-4 text-right">Wallet Balance</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map(u => (
                            <tr key={u.uid} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{u.name}</p>
                                            <p className="text-xs text-gray-500">{u.phone}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge type={u.status === UserStatus.ACTIVE ? 'success' : 'error'}>{u.status}</Badge>
                                </td>
                                <td className="px-6 py-4"><Badge type="info">{u.planId}</Badge></td>
                                <td className="px-6 py-4 text-right font-mono font-bold text-gray-700">${u.wallet.main.toFixed(2)}</td>
                                <td className="px-6 py-4 text-center">
                                    {canAction ? (
                                        <div className="flex justify-center gap-2">
                                             <Button size="sm" variant={u.status === 'ACTIVE' ? 'danger' : 'outline'} className="text-xs py-1 h-8" onClick={() => toggleStatus(u.uid, u.status)}>
                                                {u.status === 'ACTIVE' ? 'Ban' : 'Unban'}
                                            </Button>
                                        </div>
                                    ) : <span className="text-xs text-gray-400 italic">Read Only</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const FinancePanel: React.FC<{ role: AdminRole, currentUser: string }> = ({ role, currentUser }) => {
    const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);

    const fetchWithdrawals = () => {
        BackendService.adminGetWithdrawals().then(setWithdrawals);
    };

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const processPayout = async (id: string, status: TransactionStatus.COMPLETED | TransactionStatus.FAILED) => {
        if(window.confirm(`Confirm ${status} for this payout?`)) {
            await BackendService.adminProcessWithdrawal(id, status, currentUser);
            toast.success(`Payout Marked as ${status}`);
            fetchWithdrawals();
        }
    };

    const pending = withdrawals.filter(w => w.status === TransactionStatus.PENDING);
    const completed = withdrawals.filter(w => w.status !== TransactionStatus.PENDING);

    return (
        <div className="space-y-6">
            <div className="flex gap-4">
                <Card className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 shadow-xl shadow-emerald-900/10">
                    <div className="flex justify-between items-start">
                        <div>
                             <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider">Pending Amount</p>
                             <h3 className="text-3xl font-extrabold mt-1">${pending.reduce((sum, w) => sum + w.netAmount, 0).toFixed(2)}</h3>
                        </div>
                        <div className="p-2 bg-white/10 rounded-lg"><Clock size={24}/></div>
                    </div>
                </Card>
                <Card className="flex-1 bg-white p-6 border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Processed Today</p>
                            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">${completed.reduce((sum, w) => sum + w.netAmount, 0).toFixed(2)}</h3>
                        </div>
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-500"><Wallet size={24}/></div>
                    </div>
                </Card>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm min-h-[400px]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <RefreshCcw size={18} className="text-emerald-600" /> Pending Withdrawals
                    </h3>
                    <Badge type="info">{pending.length} Requests</Badge>
                </div>
                
                {pending.length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-gray-50/50">
                        <CheckCircle size={48} className="mb-4 text-emerald-500/50" />
                        <p className="font-medium">All caught up!</p>
                        <p className="text-sm">No pending withdrawals at this moment.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Method</th>
                                    <th className="px-6 py-4">KYC Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {pending.map(w => (
                                    <tr key={w.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{w.userId}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900">${w.netAmount.toFixed(2)}</p>
                                            <p className="text-xs text-gray-400 strike-through">Gross: ${w.amount}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded inline-block">{w.method}</p>
                                            <p className="text-xs text-gray-500 mt-1">{w.details}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge type={w.userKycStatus === KycStatus.APPROVED ? 'success' : 'error'}>{w.userKycStatus}</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" onClick={() => processPayout(w.id, TransactionStatus.COMPLETED)}>Approve</Button>
                                                <Button size="sm" variant="danger" onClick={() => processPayout(w.id, TransactionStatus.FAILED)}>Reject</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const KycPanel: React.FC<{ role: AdminRole, adminId: string }> = ({ role, adminId }) => {
    const [requests, setRequests] = useState<{userId: string, data: KycData}[]>([]);

    useEffect(() => {
        BackendService.adminGetKycRequests().then(setRequests);
    }, []);

    const handleReview = async (userId: string, status: KycStatus.APPROVED | KycStatus.REJECTED) => {
        await BackendService.adminReviewKyc(userId, status, undefined, adminId);
        toast.success(`KYC ${status}`);
        setRequests(prev => prev.filter(r => r.userId !== userId));
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <FileText size={18} className="text-gray-500"/>
                <h3 className="font-bold text-gray-700">Pending Identity Checks</h3>
            </div>
            {requests.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                    <Shield size={48} className="mx-auto mb-4 opacity-20" />
                    <p>All caught up! No pending requests.</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {requests.map(req => (
                        <div key={req.userId} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{req.data.fullName}</h4>
                                    <p className="text-sm text-gray-500 font-mono mt-0.5">{req.data.documentType} • {req.data.documentNumber}</p>
                                    <p className="text-xs text-blue-500 mt-2 font-bold bg-blue-50 inline-block px-2 py-0.5 rounded">Submitted: Today</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Button size="sm" onClick={() => handleReview(req.userId, KycStatus.APPROVED)} className="w-24">Approve</Button>
                                <Button size="sm" variant="danger" onClick={() => handleReview(req.userId, KycStatus.REJECTED)} className="w-24">Reject</Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const SettingsPanel: React.FC<{ role: AdminRole, adminId: string }> = ({ role, adminId }) => {
    const [settings, setSettings] = useState<SystemSettings | null>(null);

    useEffect(() => {
        BackendService.adminGetSettings().then(setSettings);
    }, []);

    const handleSave = async () => {
        if(settings) {
            await BackendService.adminUpdateSettings(settings, adminId);
            toast.success('System Configuration Updated');
        }
    };

    if (!settings) return null;

    return (
        <Card className="max-w-2xl mx-auto p-8 border-t-4 border-t-emerald-500 shadow-xl shadow-emerald-500/5">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                    <Settings size={28} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">System Configuration</h3>
                    <p className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded inline-block mt-1">SUPER ADMIN ACCESS ONLY</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Platform Fee (%)</label>
                        <Input type="number" value={settings.platformFeePercent} onChange={e => setSettings({...settings, platformFeePercent: Number(e.target.value)})} />
                        <p className="text-[10px] text-gray-400 mt-1">Deducted from gross earnings.</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tx Fee (%)</label>
                        <Input type="number" value={settings.transactionFeePercent} onChange={e => setSettings({...settings, transactionFeePercent: Number(e.target.value)})} />
                        <p className="text-[10px] text-gray-400 mt-1">Gateway processing fee.</p>
                    </div>
                </div>

                <div className="h-px bg-gray-100 my-4"></div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Min Withdraw (Trial)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-400 text-sm">$</span>
                            <Input className="pl-6" type="number" value={settings.minWithdrawalTrial} onChange={e => setSettings({...settings, minWithdrawalTrial: Number(e.target.value)})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Min Withdraw (Paid)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-400 text-sm">$</span>
                            <Input className="pl-6" type="number" value={settings.minWithdrawalPaid} onChange={e => setSettings({...settings, minWithdrawalPaid: Number(e.target.value)})} />
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gray-100 my-4"></div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                        <p className="font-bold text-gray-900 flex items-center gap-2">
                             Maintenance Mode
                             {settings.maintenanceMode && <span className="text-[10px] bg-red-100 text-red-600 px-2 rounded-full">ACTIVE</span>}
                        </p>
                        <p className="text-xs text-gray-500">Pauses all user activity instantly.</p>
                    </div>
                    <div 
                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'}`}
                        onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.maintenanceMode ? 'translate-x-6' : ''}`}></div>
                    </div>
                </div>

                <Button className="w-full h-12 text-sm font-bold shadow-lg shadow-emerald-500/20" onClick={handleSave}>
                    <Save size={18} className="mr-2"/> Save Changes
                </Button>
            </div>
        </Card>
    );
};

const AuditPanel: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);

    useEffect(() => {
        BackendService.adminGetAuditLogs().then(setLogs);
    }, []);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <History size={18} className="text-gray-500"/>
                <h3 className="font-bold text-gray-700">System Logs</h3>
            </div>
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4">Timestamp</th>
                        <th className="px-6 py-4">Admin</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Action</th>
                        <th className="px-6 py-4">Details</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {logs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-xs text-gray-500 font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="px-6 py-4 font-bold text-gray-900">{log.adminId}</td>
                            <td className="px-6 py-4"><Badge type="info">{log.role}</Badge></td>
                            <td className="px-6 py-4 font-mono text-xs font-bold text-gray-700">{log.action}</td>
                            <td className="px-6 py-4 text-gray-600 italic">{log.details}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
