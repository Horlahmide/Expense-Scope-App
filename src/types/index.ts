export type Category = 'food' | 'transport' | 'data' | 'fun' | 'other';

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  date: string; // ISO string format YYYY-MM-DD
  description: string;
}

export type TimeFilter = 'this-week' | 'last-week' | 'all-time';
