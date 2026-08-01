import React, { createContext, useContext, useState, useEffect } from 'react';
import type { DailyShift, DeliveryEntry } from '../types';
import { useAuth } from './AuthContext';


interface ShiftContextType {
  activeShift: DailyShift | null;
  shifts: DailyShift[];
  startNewShift: (startingBalance: number, customDate?: string) => void;
  addDelivery: (fare: number, tip: number, cashTaken?: number, notes?: string) => void;
  editDelivery: (deliveryId: string, fare: number, tip: number, cashTaken?: number, notes?: string) => void;
  deleteDelivery: (deliveryId: string) => void;
  endCurrentShift: () => void;
  getLastShiftBalance: (userId: string) => number;
  updateLastShiftBalance: (userId: string, amount: number) => void;
  updateActiveShiftBalance: (amount: number) => void;
  updateActiveShiftCashInHand: (cashInHand: number) => void;
  getUserShifts: (userId: string) => DailyShift[];
}



const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export const ShiftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const [shifts, setShifts] = useState<DailyShift[]>(() => {
    const saved = localStorage.getItem('driver_app_shifts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('driver_app_shifts', JSON.stringify(shifts));
  }, [shifts]);

  // Find active shift for current user
  const activeShift = user
    ? shifts.find((s) => s.userId === user.id && s.status === 'active') || null
    : null;

  const getLastShiftBalance = (userId: string): number => {
    const userCompletedShifts = shifts
      .filter((s) => s.userId === userId && s.status === 'completed')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (userCompletedShifts.length > 0) {
      return userCompletedShifts[0].netCompanyOwed;
    }
    return 0; // Default zero balance
  };

  const updateLastShiftBalance = (userId: string, newBalance: number) => {
    setShifts((prev) => {
      // Find latest completed shift for user
      const userCompletedShifts = prev
        .filter((s) => s.userId === userId && s.status === 'completed')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      let updatedList = [...prev];

      if (userCompletedShifts.length > 0) {
        const latestId = userCompletedShifts[0].id;
        updatedList = updatedList.map((s) => (s.id === latestId ? { ...s, netCompanyOwed: newBalance } : s));
      } else {
        // If no completed shift exists, create a baseline settlement record
        const dummyRecord: DailyShift = {
          id: `shift-init-${Date.now()}`,
          userId: userId,
          date: new Date().toISOString().split('T')[0],
          dateFormatted: 'Baseline Settlement',
          startingBalance: 0,
          lastShiftBalance: 0,
          deliveries: [],
          totalFare: 0,
          totalTip: 0,
          totalEarnings: 0,
          netCompanyOwed: newBalance,
          status: 'completed',
          createdAt: new Date().toISOString(),
        };
        updatedList = [dummyRecord, ...updatedList];
      }

      // Also dynamically update active shift's lastShiftBalance and netCompanyOwed if active
      return updatedList.map((s) => {
        if (s.userId === userId && s.status === 'active') {
          const newNetOwed =
            s.cashInHand !== undefined
              ? newBalance + s.totalEarnings - s.cashInHand
              : newBalance;
          return {
            ...s,
            lastShiftBalance: newBalance,
            netCompanyOwed: newNetOwed,
          };
        }
        return s;
      });
    });
  };

  const startNewShift = (startingBalance: number, customDate?: string) => {
    if (!user) return;

    const todayStr = customDate || new Date().toISOString().split('T')[0];
    const todayFormatted = new Date(todayStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const lastBalance = getLastShiftBalance(user.id);

    const newShift: DailyShift = {
      id: `shift-${Date.now()}`,
      userId: user.id,
      date: todayStr,
      dateFormatted: todayFormatted,
      startingBalance,
      lastShiftBalance: lastBalance,
      deliveries: [],
      totalFare: 0,
      totalTip: 0,
      totalEarnings: 0,
      netCompanyOwed: lastBalance,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    setShifts((prev) => [newShift, ...prev]);
  };

  const addDelivery = (fare: number, tip: number, cashTaken?: number, notes?: string) => {
    if (!activeShift || !user) return;

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timestamp = now.toTimeString().split(' ')[0];
    const total = fare + tip;
    const actualCashTaken = cashTaken !== undefined ? cashTaken : total;

    const newEntry: DeliveryEntry = {
      id: `del-${Date.now()}`,
      shiftId: activeShift.id,
      userId: user.id,
      timestamp,
      timeFormatted,
      fare,
      tip,
      total,
      cashCollected: actualCashTaken,
      notes,
    };

    const updatedDeliveries = [...activeShift.deliveries, newEntry];
    const newTotalFare = updatedDeliveries.reduce((sum, d) => sum + d.fare, 0);
    const newTotalTip = updatedDeliveries.reduce((sum, d) => sum + d.tip, 0);
    const newTotalEarnings = newTotalFare + newTotalTip;
    const totalCashCollected = updatedDeliveries.reduce((sum, d) => sum + (d.cashCollected ?? d.total), 0);

    // Exact balance rule: Net Owed = lastShiftBalance + totalEarnings - totalCashCollected
    // Example: Driver earns $100 total. If he collects $80 cash, company owes him $20 (+20).
    // If he collects $120 cash, driver owes company $20 (-20).
    const netCompanyOwed = activeShift.lastShiftBalance + newTotalEarnings - totalCashCollected;

    const updatedShift: DailyShift = {
      ...activeShift,
      deliveries: updatedDeliveries,
      totalFare: newTotalFare,
      totalTip: newTotalTip,
      totalEarnings: newTotalEarnings,
      netCompanyOwed,
    };

    setShifts((prev) => prev.map((s) => (s.id === activeShift.id ? updatedShift : s)));
  };

  const editDelivery = (
    deliveryId: string,
    fare: number,
    tip: number,
    cashTaken?: number,
    notes?: string
  ) => {
    if (!activeShift) return;

    const total = fare + tip;
    const actualCashTaken = cashTaken !== undefined ? cashTaken : total;

    const updatedDeliveries = activeShift.deliveries.map((d) =>
      d.id === deliveryId
        ? {
            ...d,
            fare,
            tip,
            total,
            cashCollected: actualCashTaken,
            notes: notes !== undefined ? notes : d.notes,
          }
        : d
    );

    const newTotalFare = updatedDeliveries.reduce((sum, d) => sum + d.fare, 0);
    const newTotalTip = updatedDeliveries.reduce((sum, d) => sum + d.tip, 0);
    const newTotalEarnings = newTotalFare + newTotalTip;
    const totalCashCollected = updatedDeliveries.reduce((sum, d) => sum + (d.cashCollected ?? d.total), 0);

    const netCompanyOwed = activeShift.lastShiftBalance + newTotalEarnings - totalCashCollected;

    const updatedShift: DailyShift = {
      ...activeShift,
      deliveries: updatedDeliveries,
      totalFare: newTotalFare,
      totalTip: newTotalTip,
      totalEarnings: newTotalEarnings,
      netCompanyOwed,
    };

    setShifts((prev) => prev.map((s) => (s.id === activeShift.id ? updatedShift : s)));
  };

  const deleteDelivery = (deliveryId: string) => {
    if (!activeShift) return;

    const updatedDeliveries = activeShift.deliveries.filter((d) => d.id !== deliveryId);
    const newTotalFare = updatedDeliveries.reduce((sum, d) => sum + d.fare, 0);
    const newTotalTip = updatedDeliveries.reduce((sum, d) => sum + d.tip, 0);
    const newTotalEarnings = newTotalFare + newTotalTip;
    const totalCashCollected = updatedDeliveries.reduce((sum, d) => sum + (d.cashCollected ?? d.total), 0);

    const netCompanyOwed = activeShift.lastShiftBalance + newTotalEarnings - totalCashCollected;

    const updatedShift: DailyShift = {
      ...activeShift,
      deliveries: updatedDeliveries,
      totalFare: newTotalFare,
      totalTip: newTotalTip,
      totalEarnings: newTotalEarnings,
      netCompanyOwed,
    };

    setShifts((prev) => prev.map((s) => (s.id === activeShift.id ? updatedShift : s)));
  };

  const updateActiveShiftBalance = (newBalance: number) => {
    if (!activeShift) return;
    const updatedShift: DailyShift = {
      ...activeShift,
      netCompanyOwed: newBalance,
    };
    setShifts((prev) => prev.map((s) => (s.id === activeShift.id ? updatedShift : s)));
  };

  const updateActiveShiftCashInHand = (cashInHand: number) => {
    if (!activeShift) return;
    // Formula requested: Net Owed = (lastShiftBalance) + (today total earnings) - (cash in hand driver has)
    // If result > 0 => Company owes driver. If result < 0 => Driver owes company.
    const netCompanyOwed = activeShift.lastShiftBalance + activeShift.totalEarnings - cashInHand;
    const updatedShift: DailyShift = {
      ...activeShift,
      cashInHand,
      netCompanyOwed,
    };
    setShifts((prev) => prev.map((s) => (s.id === activeShift.id ? updatedShift : s)));
  };

  const endCurrentShift = () => {
    if (!activeShift) return;

    const closedShift: DailyShift = {
      ...activeShift,
      status: 'completed',
      closedAt: new Date().toISOString(),
    };

    setShifts((prev) => prev.map((s) => (s.id === activeShift.id ? closedShift : s)));
  };

  const getUserShifts = (userId: string) => {
    return shifts.filter((s) => s.userId === userId);
  };

  return (
    <ShiftContext.Provider
      value={{
        activeShift,
        shifts,
        startNewShift,
        addDelivery,
        editDelivery,
        deleteDelivery,
        endCurrentShift,
        getLastShiftBalance,
        updateLastShiftBalance,
        updateActiveShiftBalance,
        updateActiveShiftCashInHand,
        getUserShifts,
      }}
    >
      {children}
    </ShiftContext.Provider>
  );
};

export const useShift = () => {
  const context = useContext(ShiftContext);
  if (!context) throw new Error('useShift must be used within a ShiftProvider');
  return context;
};
