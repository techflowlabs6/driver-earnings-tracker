export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'driver' | 'admin';
  createdAt: string;
}

export interface DeliveryEntry {
  id: string;
  shiftId: string;
  userId: string;
  timestamp: string; // ISO string e.g., "14:23:05"
  timeFormatted: string; // e.g. "02:23 PM"
  fare: number;
  tip: number;
  total: number;
  cashCollected?: number; // Actual cash collected from customer for order
  notes?: string;
}

export interface DailyShift {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  dateFormatted: string;
  startingBalance: number; // Cash float carried
  lastShiftBalance: number; // Positive = company owes driver, Negative = driver owes company
  deliveries: DeliveryEntry[];
  totalFare: number;
  totalTip: number;
  totalEarnings: number;
  cashInHand?: number; // Total physical cash driver has in hand right now
  netCompanyOwed: number; // Balance to settle for next shift
  status: 'active' | 'completed';
  createdAt: string;
  closedAt?: string;
}

export interface ReportFilter {
  period: 'weekly' | 'monthly' | 'quarterly' | 'halfYearly' | 'yearly';
  userId?: string;
}

export interface SummaryStats {
  totalOrders: number;
  totalFare: number;
  totalTip: number;
  totalEarnings: number;
  avgTipPerOrder: number;
  avgEarningsPerOrder: number;
}
