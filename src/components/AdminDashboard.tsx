import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShift } from '../context/ShiftContext';
import { ShieldCheck, Search, Eye, Calendar, Clock, ChevronRight, X, Lock } from 'lucide-react';
import type { UserProfile, DailyShift } from '../types';


export const AdminDashboard: React.FC = () => {
  const { user, allUsers } = useAuth();
  const { getUserShifts } = useShift();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<UserProfile | null>(null);
  const [selectedAdminShift, setSelectedAdminShift] = useState<DailyShift | null>(null);

  if (!user || user.role !== 'admin') {
    return (
      <div className="glass-card rounded-2xl p-8 max-w-md mx-auto text-center space-y-3">
        <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">Admin Portal Restricted</h3>
        <p className="text-xs text-slate-400">
          You must log in with an Admin account or toggle your role to Admin in the profile settings to access full company driver tracking.
        </p>
      </div>
    );
  }

  const driverUsers = allUsers.filter((u) => u.role === 'driver');
  const filteredDrivers = driverUsers.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Compute aggregate stats across all drivers
  const globalStats = driverUsers.reduce(
    (acc, driver) => {
      const shifts = getUserShifts(driver.id);
      const orders = shifts.reduce((sum, s) => sum + s.deliveries.length, 0);
      const fare = shifts.reduce((sum, s) => sum + s.totalFare, 0);
      const tip = shifts.reduce((sum, s) => sum + s.totalTip, 0);
      const earnings = fare + tip;

      return {
        totalOrders: acc.totalOrders + orders,
        totalFare: acc.totalFare + fare,
        totalTip: acc.totalTip + tip,
        totalEarnings: acc.totalEarnings + earnings,
      };
    },
    { totalOrders: 0, totalFare: 0, totalTip: 0, totalEarnings: 0 }
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24">
      {/* Admin Control Banner */}
      <div className="glass-card rounded-2xl p-5 border border-amber-500/30 bg-amber-950/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Command Center</span>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
            SuperAdmin Mode Active
          </span>
        </div>
        <p className="text-xs text-slate-300">
          Track real-time driver earnings, order volumes, tips, and financial balances across all users separately.
        </p>
      </div>

      {/* Global Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-xl p-3.5 border border-slate-800 space-y-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Active Drivers
          </span>
          <div className="text-xl font-bold text-white font-mono">{driverUsers.length}</div>
        </div>

        <div className="glass-card rounded-xl p-3.5 border border-slate-800 space-y-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Deliveries
          </span>
          <div className="text-xl font-bold text-teal-400 font-mono">{globalStats.totalOrders}</div>
        </div>

        <div className="glass-card rounded-xl p-3.5 border border-slate-800 space-y-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Tips
          </span>
          <div className="text-xl font-bold text-emerald-400 font-mono">
            ${globalStats.totalTip.toFixed(2)}
          </div>
        </div>

        <div className="glass-card rounded-xl p-3.5 border border-slate-800 space-y-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Volume
          </span>
          <div className="text-xl font-bold text-white font-mono">
            ${globalStats.totalEarnings.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Driver List with Search */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            All Driver Accounts ({filteredDrivers.length})
          </h3>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search driver by name or email..."
              className="pl-9 pr-4 py-2 glass-input rounded-xl text-xs text-white placeholder-slate-500 w-full sm:w-64 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredDrivers.map((driver) => {
            const shifts = getUserShifts(driver.id);
            const totalOrders = shifts.reduce((sum, s) => sum + s.deliveries.length, 0);
            const totalFare = shifts.reduce((sum, s) => sum + s.totalFare, 0);
            const totalTip = shifts.reduce((sum, s) => sum + s.totalTip, 0);
            const lastShift = shifts[0];
            const netBalance = lastShift ? lastShift.netCompanyOwed : 0;


            return (
              <div
                key={driver.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/30 text-sm">
                      {driver.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{driver.name}</h4>
                      <p className="text-xs text-slate-400 font-mono">{driver.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedDriver(selectedDriver?.id === driver.id ? null : driver)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{selectedDriver?.id === driver.id ? 'Close Details' : 'View Shift Logs'}</span>
                  </button>
                </div>

                {/* Driver Key Metrics */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Orders</span>
                    <span className="text-slate-200 font-bold">{totalOrders}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Fares</span>
                    <span className="text-teal-400">${totalFare.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Tips</span>
                    <span className="text-emerald-400">${totalTip.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Balance Owed</span>
                    <span
                      className={`font-bold ${
                        netBalance > 0
                          ? 'text-emerald-400'
                          : netBalance < 0
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {netBalance > 0
                        ? `+${netBalance.toFixed(2)}`
                        : netBalance < 0
                        ? `-${Math.abs(netBalance).toFixed(2)}`
                        : '$0'}
                    </span>
                  </div>
                </div>

                {/* Detailed Shift Drawer for Driver */}
                {selectedDriver?.id === driver.id && (
                  <div className="pt-3 border-t border-slate-800 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
                        Driver Shift Breakdown Logs ({shifts.length})
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center space-x-1">
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>Read-Only View</span>
                      </span>
                    </div>

                    {shifts.length === 0 ? (
                      <div className="text-xs text-slate-500 italic p-3 rounded-xl bg-slate-950/40 text-center">
                        No shift history recorded yet for this driver account.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {shifts.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => setSelectedAdminShift(s)}
                            className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 text-xs space-y-2 transition-all cursor-pointer group"
                          >
                            <div className="flex justify-between font-mono text-slate-300">
                              <span className="font-semibold text-white flex items-center space-x-1.5 group-hover:text-amber-400 transition-colors">
                                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                                <span>{s.dateFormatted}</span>
                              </span>
                              <div className="flex items-center space-x-1">
                                <span className="text-emerald-400 font-bold">
                                  ${s.totalEarnings.toFixed(2)} ({s.deliveries.length} orders)
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-all" />
                              </div>
                            </div>
                            <div className="text-[11px] text-slate-400 flex justify-between font-mono pt-1 border-t border-slate-900">
                              <span>Fare: ${s.totalFare.toFixed(2)} | Tip: ${s.totalTip.toFixed(2)}</span>
                              <span
                                className={
                                  s.netCompanyOwed > 0
                                    ? 'text-emerald-400'
                                    : s.netCompanyOwed < 0
                                    ? 'text-rose-400'
                                    : 'text-slate-400'
                                }
                              >
                                {s.netCompanyOwed > 0
                                  ? `Company Owes: $${s.netCompanyOwed.toFixed(2)}`
                                  : s.netCompanyOwed < 0
                                  ? `Driver Owes: $${Math.abs(s.netCompanyOwed).toFixed(2)}`
                                  : '$0 Settled'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Admin Read-Only Order Inspector Modal */}
      {selectedAdminShift && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 border border-slate-800 max-w-lg w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <span>{selectedAdminShift.dateFormatted}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-amber-300 font-mono border border-slate-800 flex items-center space-x-1">
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>Read-Only</span>
                    </span>
                  </h3>
                  <span className="text-xs text-slate-400">Company Audit Inspection</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedAdminShift(null)}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Total Summary Cards */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total Orders
                </span>
                <div className="text-lg font-bold text-white font-mono">
                  {selectedAdminShift.deliveries.length}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total Tips
                </span>
                <div className="text-lg font-bold text-emerald-400 font-mono">
                  ${selectedAdminShift.totalTip.toFixed(2)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total Fares
                </span>
                <div className="text-lg font-bold text-teal-400 font-mono">
                  ${selectedAdminShift.totalFare.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Total Earnings & Settlement Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-amber-950/30 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Total Shift Earnings
                </span>
                <span className="text-2xl font-black text-white font-mono">
                  ${selectedAdminShift.totalEarnings.toFixed(2)}
                </span>
              </div>

              <div className="text-right space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Shift Settlement Status
                </span>
                <span
                  className={`font-mono text-xs font-bold ${
                    selectedAdminShift.netCompanyOwed > 0
                      ? 'text-emerald-400'
                      : selectedAdminShift.netCompanyOwed < 0
                      ? 'text-rose-400'
                      : 'text-slate-300'
                  }`}
                >
                  {selectedAdminShift.netCompanyOwed > 0
                    ? `Company Owes Driver: $${selectedAdminShift.netCompanyOwed.toFixed(2)}`
                    : selectedAdminShift.netCompanyOwed < 0
                    ? `Driver Owes Company: $${Math.abs(selectedAdminShift.netCompanyOwed).toFixed(2)}`
                    : '$0.00 Settled'}
                </span>
              </div>
            </div>

            {/* All Orders Audit List (Read-Only) */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span>All Orders Log ({selectedAdminShift.deliveries.length})</span>
                <span className="text-amber-400 text-[10px]">Read-Only Access</span>
              </div>

              {selectedAdminShift.deliveries.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-900/40 text-center text-slate-500 text-xs">
                  No individual order logs for this shift.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedAdminShift.deliveries.map((del) => (
                    <div
                      key={del.id}
                      className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center font-mono text-xs border border-slate-700">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs text-slate-400 font-mono">
                            {del.timeFormatted}
                          </div>
                          <div className="text-xs text-slate-300">
                            Fare: <span className="font-mono">${del.fare.toFixed(2)}</span> • Tip:{' '}
                            <span className="font-mono text-emerald-400">${del.tip.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-white font-mono block">
                          ${del.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedAdminShift(null)}
              className="w-full py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900 text-xs font-semibold transition-all mt-2"
            >
              Close Inspection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
