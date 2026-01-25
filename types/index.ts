export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  date: string;
  comments?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionInput {
  amount: number;
  category: string;
  date: string;
  comments?: string;
}

export interface AnalyticsData {
  daily: DailyData[];
  monthly: MonthlyData[];
  yearly: YearlyData[];
  categoryBreakdown: CategoryData[];
}

export interface DailyData {
  date: string;
  total: number;
  count: number;
}

export interface MonthlyData {
  month: string;
  total: number;
  count: number;
  categories: CategoryData[];
}

export interface YearlyData {
  year: number;
  total: number;
  count: number;
}

export interface CategoryData {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export type DateView = 'daily' | 'monthly' | 'yearly';

export interface DateRange {
  start: Date;
  end: Date;
}

