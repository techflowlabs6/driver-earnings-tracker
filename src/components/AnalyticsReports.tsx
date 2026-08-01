import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShift } from '../context/ShiftContext';
import type { ReportFilter, SummaryStats } from '../types';

import {
  BarChart3,
  Calendar,
  DollarSign,
  PiggyBank,
  PackageCheck,
  TrendingUp,
  Filter,
  ChevronRight,
  Clock,
  X,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const AnalyticsReports: React.FC = () => {
  const { user } = useAuth();
  const { getUserShifts } = useShift();
  const [period, setPeriod] = useState<ReportFilter['period']>('weekly');
  const [selectedShift, setSelectedShift] = useState<import('../types').DailyShift | null>(null);

  if (!user) return null;

  const userShifts = getUserShifts(user.id);

  // Compute aggregate metrics according to selected timeframe
  const computeStats = (): SummaryStats => {
    let filtered = userShifts;

    const now = new Date();
    if (period === 'weekly') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = userShifts.filter((s) => new Date(s.date) >= sevenDaysAgo);
    } else if (period === 'monthly') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = userShifts.filter((s) => new Date(s.date) >= thirtyDaysAgo);
    } else if (period === 'quarterly') {
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      filtered = userShifts.filter((s) => new Date(s.date) >= ninetyDaysAgo);
    } else if (period === 'halfYearly') {
      const halfYearAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      filtered = userShifts.filter((s) => new Date(s.date) >= halfYearAgo);
    } else if (period === 'yearly') {
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      filtered = userShifts.filter((s) => new Date(s.date) >= oneYearAgo);
    }

    const totalOrders = filtered.reduce((sum, s) => sum + s.deliveries.length, 0);
    const totalFare = filtered.reduce((sum, s) => sum + s.totalFare, 0);
    const totalTip = filtered.reduce((sum, s) => sum + s.totalTip, 0);
    const totalEarnings = totalFare + totalTip;

    return {
      totalOrders,
      totalFare,
      totalTip,
      totalEarnings,
      avgTipPerOrder: totalOrders > 0 ? totalTip / totalOrders : 0,
      avgEarningsPerOrder: totalOrders > 0 ? totalEarnings / totalOrders : 0,
    };
  };

  const stats = computeStats();

  // Prepare chart datasets
  const chartData = {
    labels: userShifts.slice(0, 7).map((s) => s.dateFormatted.split(',')[0]),
    datasets: [
      {
        label: 'Fare Money ($)',
        data: userShifts.slice(0, 7).map((s) => s.totalFare),
        backgroundColor: 'rgba(20, 184, 166, 0.7)',
        borderRadius: 6,
      },
      {
        label: 'Tip Money ($)',
        data: userShifts.slice(0, 7).map((s) => s.totalTip),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#94a3b8',
          font: { size: 11 },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#64748b', font: { size: 10 } },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      y: {
        ticks: { color: '#64748b', font: { size: 10 } },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
      },
    },
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-24">
      {/* Header & Filter Controls */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-emerald-400 font-medium text-xs uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Income Reports</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Period</span>
          </div>
        </div>

        {/* Period selector pills */}
        <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'weekly', label: 'Weekly' },
            { id: 'monthly', label: 'Monthly' },
            { id: 'quarterly', label: 'Quarterly' },
            { id: 'halfYearly', label: 'Half-Yearly' },
            { id: 'yearly', label: 'Yearly' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriod(item.id as ReportFilter['period'])}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all whitespace-nowrap ${
                period === item.id
                  ? 'bg-emerald-600 border-emerald-500 text-white font-semibold shadow-md shadow-emerald-950/40'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              Total Deliveries
            </span>
            <PackageCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats.totalOrders}</div>
          <p className="text-[10px] text-slate-500">Orders fulfilled</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              Total Tips Earned
            </span>
            <PiggyBank className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            ${stats.totalTip.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-500">Avg ${stats.avgTipPerOrder.toFixed(2)} / order</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              Delivery Fares
            </span>
            <DollarSign className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-teal-400 font-mono">
            ${stats.totalFare.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-500">Base company fares</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-slate-900/60 space-y-1">
          <div className="flex items-center justify-between text-emerald-300">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Net Income</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ${stats.totalEarnings.toFixed(2)}
          </div>
          <p className="text-[10px] text-emerald-400/80">Fares + Tips combined</p>
        </div>
      </div>

      {/* Graphical Breakdown Chart */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Fare vs Tip Breakdown
          </h4>
          <span className="text-[10px] text-slate-500">Recent Shifts</span>
        </div>
        <div className="h-56 w-full">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Detailed Shift History List */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Shift Breakdown Logs
          </h4>
          <span className="text-[10px] text-slate-500">{userShifts.length} total shifts</span>
        </div>

        <div className="space-y-3">
          {userShifts.map((shift) => (
            <div
              key={shift.id}
              onClick={() => setSelectedShift(shift)}
              className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 space-y-2.5 transition-all cursor-pointer group hover:bg-slate-900"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center space-x-1.5 group-hover:text-emerald-400 transition-colors">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>{shift.dateFormatted}</span>
                </span>
                <div className="flex items-center space-x-1 text-slate-400 font-mono text-xs">
                  <span>{shift.deliveries.length} orders</span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-800/80 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">Fare</span>
                  <span className="text-slate-300 font-semibold">${shift.totalFare.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Tip</span>
                  <span className="text-emerald-400 font-semibold">${shift.totalTip.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Total</span>
                  <span className="font-bold text-white text-sm">${shift.totalEarnings.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Shift Breakdown Modal */}
      {selectedShift && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 border border-slate-800 max-w-lg w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedShift.dateFormatted}</h3>
                  <span className="text-xs text-slate-400">Shift Performance & Orders</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedShift(null)}
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
                  {selectedShift.deliveries.length}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total Tips
                </span>
                <div className="text-lg font-bold text-emerald-400 font-mono">
                  ${selectedShift.totalTip.toFixed(2)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total Fares
                </span>
                <div className="text-lg font-bold text-teal-400 font-mono">
                  ${selectedShift.totalFare.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Total Money Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">
                  Total Shift Income
                </span>
                <span className="text-2xl font-black text-white font-mono">
                  ${selectedShift.totalEarnings.toFixed(2)}
                </span>
              </div>
              {selectedShift.netCompanyOwed !== 0 && (
                <div className="text-right space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Shift Settlement
                  </span>
                  <span
                    className={`font-mono text-xs font-bold ${
                      selectedShift.netCompanyOwed > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {selectedShift.netCompanyOwed > 0
                      ? `+ Company Owed $${selectedShift.netCompanyOwed.toFixed(2)}`
                      : `- Driver Owed $${Math.abs(selectedShift.netCompanyOwed).toFixed(2)}`}
                  </span>
                </div>
              )}
            </div>

            {/* All Orders List for Selected Date */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span>Shift Orders ({selectedShift.deliveries.length})</span>
                <span>Amount</span>
              </div>

              {selectedShift.deliveries.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-900/40 text-center text-slate-500 text-xs">
                  No delivery logs recorded for this shift.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedShift.deliveries.map((del) => (
                    <div
                      key={del.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center font-mono text-xs">
                          <Clock className="w-3.5 h-3.5" />
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
              onClick={() => setSelectedShift(null)}
              className="w-full py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900 text-xs font-semibold transition-all mt-2"
            >
              Close Shift Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
