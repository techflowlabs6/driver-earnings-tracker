import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Truck, ShieldCheck, LogIn, BarChart3, Clock } from 'lucide-react';


interface NavbarProps {
  activeTab: 'daily' | 'analytics' | 'admin';
  setActiveTab: (tab: 'daily' | 'analytics' | 'admin') => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenProfile,
}) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Header */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-950/60">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center space-x-1.5">
              <span>Driver Earnings</span>
            </h1>
            <p className="text-[10px] font-medium text-emerald-400/90 tracking-wide">
              Designed by TechFlow Labs
            </p>
          </div>
        </div>

        {/* User Account / Login Action */}
        {user ? (
          <button
            onClick={onOpenProfile}
            className="flex items-center space-x-2 p-1.5 pr-3 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
              {user.name.charAt(0)}
            </div>
            <span className="text-xs font-semibold text-slate-200 truncate max-w-[100px]">
              {user.name}
            </span>
            {user.role === 'admin' && (
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            )}
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 shadow-md shadow-emerald-950/40"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      {user && (
        <div className="max-w-4xl mx-auto px-4 pb-2 flex justify-around border-t border-slate-900 pt-2">
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'daily'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Today's Shift</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'analytics'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Reports</span>
          </button>

          {user.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'admin'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
