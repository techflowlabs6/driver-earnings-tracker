import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ShiftProvider } from './context/ShiftContext';
import { Navbar } from './components/Navbar';
import { DailyTracker } from './components/DailyTracker';
import { AnalyticsReports } from './components/AnalyticsReports';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'analytics' | 'admin'>('daily');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Public Access Enabled - Direct App Usage

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      <div>
        {/* Header Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        {/* Main Content Area */}
        <main className="px-4 sm:px-6 lg:px-8 pt-6 max-w-4xl mx-auto w-full">
          {activeTab === 'daily' && <DailyTracker />}
          {activeTab === 'analytics' && <AnalyticsReports />}
          {activeTab === 'admin' && <AdminDashboard />}
        </main>
      </div>

      {/* Footer Branding */}
      <footer className="py-6 border-t border-slate-900 text-center text-xs text-slate-500 mt-12">
        <p>Driver Earnings & Delivery Balance Tracker</p>
        <p className="mt-1 font-semibold text-slate-400">
          Designed by <span className="text-emerald-400">TechFlow Labs</span>
        </p>
      </footer>

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ShiftProvider>
        <AppContent />
      </ShiftProvider>
    </AuthProvider>
  );
}
