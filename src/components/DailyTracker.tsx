import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShift } from '../context/ShiftContext';
import {
  Calendar,
  DollarSign,
  PlusCircle,
  Clock,
  Trash2,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Receipt,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Edit2,
} from 'lucide-react';

export const DailyTracker: React.FC = () => {
  const { user } = useAuth();
  const {
    activeShift,
    startNewShift,
    addDelivery,
    editDelivery,
    deleteDelivery,
    endCurrentShift,
    getLastShiftBalance,
    updateLastShiftBalance,
    updateActiveShiftCashInHand,
  } = useShift();

  const [fareInput, setFareInput] = useState('');
  const [tipInput, setTipInput] = useState('');
  const [startingFloatInput, setStartingFloatInput] = useState('50');
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);

  // Edit Last Shift Balance state
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [editBalanceType, setEditBalanceType] = useState<'company_owes' | 'i_owe'>('company_owes');
  const [editBalanceAmount, setEditBalanceAmount] = useState('');

  // Cash In Hand Calculator modal state
  const [isEditingActiveBalance, setIsEditingActiveBalance] = useState(false);
  const [cashInHandInput, setCashInHandInput] = useState('');

  // Edit Delivery Entry modal state
  const [editingDeliveryId, setEditingDeliveryId] = useState<string | null>(null);
  const [editFareInput, setEditFareInput] = useState('');
  const [editTipInput, setEditTipInput] = useState('');

  const todayDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const lastBalance = user ? getLastShiftBalance(user.id) : 0;

  const handleOpenEditDelivery = (del: { id: string; fare: number; tip: number }) => {
    setEditingDeliveryId(del.id);
    setEditFareInput(del.fare.toString());
    setEditTipInput(del.tip.toString());
  };

  const handleSaveEditedDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeliveryId) return;
    const fare = parseFloat(editFareInput) || 0;
    const tip = parseFloat(editTipInput) || 0;
    editDelivery(editingDeliveryId, fare, tip);
    setEditingDeliveryId(null);
  };

  const handleOpenEditBalance = () => {
    if (lastBalance < 0) {
      setEditBalanceType('i_owe');
      setEditBalanceAmount(Math.abs(lastBalance).toString());
    } else {
      setEditBalanceType('company_owes');
      setEditBalanceAmount(lastBalance > 0 ? lastBalance.toString() : '');
    }
    setIsEditingBalance(true);
  };

  const handleSaveBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const rawVal = parseFloat(editBalanceAmount) || 0;
    const finalBalance = editBalanceType === 'company_owes' ? rawVal : -rawVal;
    updateLastShiftBalance(user.id, finalBalance);
    setIsEditingBalance(false);
  };

  const handleOpenEditActiveBalance = () => {
    if (!activeShift) return;
    setCashInHandInput(activeShift.cashInHand !== undefined ? activeShift.cashInHand.toString() : '');
    setIsEditingActiveBalance(true);
  };

  const handleSaveCashInHand = (e: React.FormEvent) => {
    e.preventDefault();
    const cashVal = parseFloat(cashInHandInput) || 0;
    updateActiveShiftCashInHand(cashVal);
    setIsEditingActiveBalance(false);
  };

  const handleAddDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    const fare = parseFloat(fareInput) || 0;
    const tip = parseFloat(tipInput) || 0;

    if (fare <= 0 && tip <= 0) return;

    addDelivery(fare, tip);
    setFareInput('');
    setTipInput('');
  };

  const handleStartShift = (e: React.FormEvent) => {
    e.preventDefault();
    const floatVal = parseFloat(startingFloatInput) || 0;
    startNewShift(floatVal);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl lg:max-w-3xl mx-auto pb-24">
      {/* Date Header & Today's Shift Status Card */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-emerald-400 font-medium text-xs uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>Today's Shift</span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-900 text-slate-300 font-mono border border-slate-800">
            {todayDateStr}
          </span>
        </div>

        {/* Previous Shift Owed / Owing Balance Banner */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${
            lastBalance > 0
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : lastBalance < 0
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-300'
          }`}
        >
          <div className="flex items-start space-x-3">
            {lastBalance > 0 ? (
              <ArrowUpRight className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : lastBalance < 0 ? (
              <ArrowDownRight className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            )}

            <div className="space-y-0.5">
              <div className="font-semibold text-xs uppercase tracking-wider opacity-80">
                Last Shift Balance Status
              </div>
              <div className="text-sm font-medium">
                {lastBalance > 0 ? (
                  <span>
                    Company owes you <strong className="text-emerald-400 font-bold">${lastBalance.toFixed(2)}</strong> from last shift.
                  </span>
                ) : lastBalance < 0 ? (
                  <span>
                    You owe company <strong className="text-rose-400 font-bold">${Math.abs(lastBalance).toFixed(2)}</strong> for next shift settlement.
                  </span>
                ) : (
                  <span>Previous shift balance is settled ($0.00).</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleOpenEditBalance}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 transition-all shrink-0 ml-2 shadow-sm"
          >
            Edit Balance
          </button>
        </div>
      </div>

      {/* Edit Last Shift Balance Modal */}
      {isEditingBalance && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 border border-slate-800 max-w-sm w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Edit Previous Shift Balance</h3>
              <p className="text-xs text-slate-400">
                Choose who owes whom and set the accurate balance amount saved to your account.
              </p>
            </div>

            <form onSubmit={handleSaveBalance} className="space-y-4">
              {/* Optional 2 Buttons */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditBalanceType('company_owes')}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                    editBalanceType === 'company_owes'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Company Owes Me
                </button>
                <button
                  type="button"
                  onClick={() => setEditBalanceType('i_owe')}
                  className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                    editBalanceType === 'i_owe'
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  I Owe Company
                </button>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Balance Amount ($)
                </label>
                <div className="relative">
                  <DollarSign className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editBalanceAmount}
                    onChange={(e) => setEditBalanceAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 glass-input rounded-xl text-white font-mono text-base focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingBalance(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/40"
                >
                  Save Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cash In Hand Calculator Modal */}
      {isEditingActiveBalance && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 border border-slate-800 max-w-sm w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Calculate Next Shift Owe Status</h3>
              <p className="text-xs text-slate-400">
                Enter the total physical cash you have in hand right now to automatically calculate who owes whom.
              </p>
            </div>

            {activeShift && (
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Today Total Take / Earnings:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    ${activeShift.totalEarnings.toFixed(2)}
                  </span>
                </div>
                {activeShift.lastShiftBalance !== 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Previous Shift Balance:</span>
                    <span className="font-mono text-slate-200">
                      ${activeShift.lastShiftBalance.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSaveCashInHand} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">
                  Total Cash You Have In Hand Right Now ($)
                </label>
                <div className="relative">
                  <DollarSign className="w-5 h-5 text-amber-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={cashInHandInput}
                    onChange={(e) => setCashInHandInput(e.target.value)}
                    placeholder="e.g. 500.00"
                    className="w-full pl-10 pr-4 py-3 glass-input rounded-xl text-white font-mono text-base focus:outline-none border-amber-500/40 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Realtime Live Calculation Preview */}
              {activeShift && cashInHandInput !== '' && !isNaN(parseFloat(cashInHandInput)) && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs space-y-1">
                  <div className="font-semibold text-slate-300">Live Calculation Result:</div>
                  <div className="font-mono font-bold text-sm">
                    {(() => {
                      const cash = parseFloat(cashInHandInput) || 0;
                      const res = activeShift.lastShiftBalance + activeShift.totalEarnings - cash;
                      if (res > 0) {
                        return <span className="text-emerald-400">Company owes you ${res.toFixed(2)}</span>;
                      } else if (res < 0) {
                        return <span className="text-rose-400">You owe company ${Math.abs(res).toFixed(2)}</span>;
                      } else {
                        return <span className="text-slate-300">$0.00 (Balanced)</span>;
                      }
                    })()}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingActiveBalance(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/40"
                >
                  Calculate & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Single Delivery Entry Modal */}
      {editingDeliveryId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 border border-slate-800 max-w-sm w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Edit Delivery Order</h3>
              <p className="text-xs text-slate-400">
                Update fare or tip for this order. Daily totals will automatically recalculate.
              </p>
            </div>

            <form onSubmit={handleSaveEditedDelivery} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Delivery Fare ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={editFareInput}
                      onChange={(e) => setEditFareInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 glass-input rounded-xl text-white font-mono text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Tip ($)
                  </label>
                  <div className="relative">
                    <PiggyBank className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editTipInput}
                      onChange={(e) => setEditTipInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 glass-input rounded-xl text-white font-mono text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDeliveryId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/40"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IF NO SHIFT ACTIVE: Prompt Start Shift */}
      {!activeShift ? (
        <div className="glass-card rounded-2xl p-6 border border-slate-800 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
            <TrendingUp className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Start Today's Delivery Shift</h3>
            <p className="text-slate-400 text-xs max-w-xs mx-auto">
              Set your initial cash float to begin recording today's delivery fares and tips.
            </p>
          </div>

          <form onSubmit={handleStartShift} className="space-y-4 max-w-xs mx-auto text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Starting Cash Float ($)
              </label>
              <div className="relative">
                <DollarSign className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={startingFloatInput}
                  onChange={(e) => setStartingFloatInput(e.target.value)}
                  placeholder="50.00"
                  className="w-full pl-10 pr-4 py-3 glass-input rounded-xl text-white font-mono text-base focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-950/50 transition-all text-sm flex items-center justify-center space-x-2"
            >
              <span>Clock In & Start Shift</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        /* SHIFT ACTIVE CONTENT */
        <div className="space-y-6">
          {/* Running Daily Totals Header Card */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Deliveries
                </span>
                <div className="text-xl font-bold text-white font-mono">
                  {activeShift.deliveries.length}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total Tips
                </span>
                <div className="text-xl font-bold text-emerald-400 font-mono">
                  ${activeShift.totalTip.toFixed(2)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total Fares
                </span>
                <div className="text-xl font-bold text-teal-400 font-mono">
                  ${activeShift.totalFare.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Total Today's Money */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">
                  Total Money Earned Today
                </span>
                <span className="text-2xl font-black text-white font-mono">
                  ${activeShift.totalEarnings.toFixed(2)}
                </span>
              </div>
              <Receipt className="w-8 h-8 text-emerald-400/80 shrink-0" />
            </div>

            {/* Live Net Balance preview to company */}
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-slate-400 block font-medium">Next Shift Owe Status:</span>
                <span
                  className={`font-bold font-mono text-sm block ${
                    activeShift.netCompanyOwed > 0
                      ? 'text-emerald-400'
                      : activeShift.netCompanyOwed < 0
                      ? 'text-rose-400'
                      : 'text-slate-300'
                  }`}
                >
                  {activeShift.netCompanyOwed > 0
                    ? `Company owes you $${activeShift.netCompanyOwed.toFixed(2)}`
                    : activeShift.netCompanyOwed < 0
                    ? `You owe company $${Math.abs(activeShift.netCompanyOwed).toFixed(2)}`
                    : '$0.00 Balanced'}
                </span>
              </div>

              <button
                onClick={handleOpenEditActiveBalance}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 transition-all shrink-0 ml-2 shadow-sm"
              >
                Edit Status
              </button>
            </div>
          </div>

          {/* ADD DELIVERY FORM */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 text-white font-semibold text-sm">
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Add New Delivery Entry</span>
            </div>

            <form onSubmit={handleAddDelivery} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Delivery Fare ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={fareInput}
                      onChange={(e) => setFareInput(e.target.value)}
                      placeholder="15.00"
                      className="w-full pl-9 pr-3 py-2.5 glass-input rounded-xl text-white font-mono text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Tip ($)
                  </label>
                  <div className="relative">
                    <PiggyBank className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={tipInput}
                      onChange={(e) => setTipInput(e.target.value)}
                      placeholder="4.00"
                      className="w-full pl-9 pr-3 py-2.5 glass-input rounded-xl text-white font-mono text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-950/40 transition-all text-sm flex items-center justify-center space-x-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Save Delivery</span>
              </button>
            </form>
          </div>

          {/* DELIVERIES LIST FOR TODAY */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
              <span>Today's Deliveries ({activeShift.deliveries.length})</span>
              <span>Total</span>
            </div>

            {activeShift.deliveries.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center text-slate-500 text-xs space-y-2">
                <Clock className="w-8 h-8 mx-auto text-slate-600 stroke-[1.5]" />
                <p>No deliveries added yet for this shift. Enter fare & tip above!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeShift.deliveries
                  .slice()
                  .reverse()
                  .map((del) => (
                    <div
                      key={del.id}
                      className="glass-card rounded-xl p-3.5 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-slate-400 flex items-center justify-center font-mono text-xs border border-slate-800">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs text-slate-400 font-mono flex items-center space-x-2">
                            <span>{del.timeFormatted}</span>
                          </div>
                          <div className="text-xs text-slate-300">
                            Fare: <span className="font-mono">${del.fare.toFixed(2)}</span> • Tip:{' '}
                            <span className="font-mono text-emerald-400">${del.tip.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <span className="text-sm font-bold text-white font-mono block">
                            ${del.total.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleOpenEditDelivery(del)}
                            className="text-slate-400 hover:text-emerald-400 p-1.5 rounded-lg hover:bg-slate-900 transition-colors"
                            title="Edit delivery"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteDelivery(del.id)}
                            className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-900 transition-colors"
                            title="Delete entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* END SHIFT BUTTON */}
          <div className="pt-4">
            {!showConfirmEnd ? (
              <button
                onClick={() => setShowConfirmEnd(true)}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-medium rounded-xl border border-slate-800 transition-all text-sm flex items-center justify-center space-x-2"
              >
                <span>Complete & End Shift Today</span>
              </button>
            ) : (
              <div className="glass-card rounded-xl p-4 border border-rose-500/40 bg-rose-950/20 space-y-3">
                <div className="flex items-center space-x-2 text-xs text-rose-300 font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>Confirm End of Shift?</span>
                </div>
                <p className="text-xs text-slate-300">
                  This will finalize today's delivery total of{' '}
                  <strong className="text-white font-mono">${activeShift.totalEarnings.toFixed(2)}</strong> and carry over your balance to tomorrow.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowConfirmEnd(false)}
                    className="py-2 text-xs font-semibold bg-slate-800 text-slate-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      endCurrentShift();
                      setShowConfirmEnd(false);
                    }}
                    className="py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg"
                  >
                    Yes, End Shift
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
