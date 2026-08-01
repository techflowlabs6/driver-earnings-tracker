import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, ShieldCheck, LogOut, ToggleRight, Sparkles } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, logout, toggleAdminRole } = useAuth();

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm glass-card rounded-2xl p-6 border border-slate-700/50 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2 text-white font-bold text-base">
            <User className="w-5 h-5 text-emerald-400" />
            <span>Driver Profile & Settings</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-slate-900 border border-slate-800"
          >
            Close
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-lg border border-emerald-500/30 shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <h3 className="text-base font-bold text-white truncate">{user.name}</h3>
              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
            <div className="flex items-center space-x-1.5 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Extracted Account Name</span>
            </div>
            <p className="text-slate-300">
              Derived automatically from email prefix <code className="text-white bg-slate-900 px-1 py-0.5 rounded font-mono">{user.email.split('@')[0]}</code>
            </p>
          </div>

          {/* Account Role Badge / Admin Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-white flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Account Role</span>
              </span>
              <span className="text-[11px] text-slate-400 block">
                Access Level: <strong className="text-emerald-300 uppercase">{user.role}</strong>
              </span>
            </div>

            {user.role === 'admin' ? (
              <button
                onClick={toggleAdminRole}
                className="text-amber-400 hover:text-amber-300 transition-colors p-1"
                title="Toggle Role"
              >
                <ToggleRight className="w-8 h-8 text-amber-400" />
              </button>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 font-medium border border-emerald-500/20">
                Driver
              </span>
            )}
          </div>

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full py-3 px-4 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 font-semibold rounded-xl border border-rose-500/30 transition-all text-xs flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
