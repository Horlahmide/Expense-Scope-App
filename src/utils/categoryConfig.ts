import type { Category } from '../types';

export interface CategoryInfo {
  label: string;
  color: string;       // Primary accent color (HEX)
  gradient: [string, string]; // Start/End colors for charts and buttons
  bgLight: string;     // Soft background tint (RGBA/HEX)
  iconPath: string;    // SVG path string (viewBox assumed 0 0 24 24)
}

export const APP_CONFIG = {
  currencySymbol: '$',
};

export const CATEGORY_CONFIG: Record<Category, CategoryInfo> = {
  food: {
    label: 'Food & Dining',
    color: '#FF6B6B',
    gradient: ['#FF6B6B', '#FF8E53'],
    bgLight: 'rgba(255, 107, 107, 0.15)',
    // Fork and knife SVG path
    iconPath: 'M18 8h1a4 4 0 0 1 0 8h-1M2 4v7a6 6 0 0 0 6 6v3h2v-3a6 6 0 0 0 6-6V4M6 4v4M10 4v4M14 4v4',
  },
  transport: {
    label: 'Transport & Travel',
    color: '#06B6D4',
    gradient: ['#06B6D4', '#3B82F6'],
    bgLight: 'rgba(6, 182, 212, 0.15)',
    // Car / vehicle SVG path
    iconPath: 'M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2a3 3 0 0 0 6 0h2a3 3 0 0 0 6 0ZM7 19a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm10 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z',
  },
  data: {
    label: 'Data & Internet',
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#D946EF'],
    bgLight: 'rgba(139, 92, 246, 0.15)',
    // WiFi SVG path
    iconPath: 'M12 20h.01M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 14 0M1.5 9.5a15 15 0 0 1 21 0',
  },
  fun: {
    label: 'Entertainment & Fun',
    color: '#F59E0B',
    gradient: ['#F59E0B', '#EF4444'],
    bgLight: 'rgba(245, 158, 11, 0.15)',
    // Ticket or smile SVG path
    iconPath: 'M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2Zm7-4v14M15 5v14',
  },
  other: {
    label: 'Miscellaneous & Other',
    color: '#64748B',
    gradient: ['#64748B', '#94A3B8'],
    bgLight: 'rgba(100, 116, 139, 0.15)',
    // Piggy bank or tag SVG path
    iconPath: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01',
  },
};
