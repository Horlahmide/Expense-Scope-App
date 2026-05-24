import { APP_CONFIG } from './categoryConfig';

/**
 * Parses a YYYY-MM-DD date string into a local Date object.
 * Avoids timezone offsets that occur when parsing ISO strings globally.
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formats a Date object as a YYYY-MM-DD local date string.
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Gets the start of the week (Monday) for a given Date.
 */
export function getStartOfWeek(date: Date): Date {
  const dayOfWeek = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Monday start
  const start = new Date(date);
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Checks if a given date string is in the current week (Monday-Sunday).
 */
export function isInThisWeek(dateStr: string, referenceDate: Date = new Date()): boolean {
  const targetDate = parseLocalDate(dateStr);
  const start = getStartOfWeek(referenceDate);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return targetDate >= start && targetDate <= end;
}

/**
 * Checks if a given date string is in the last week (Monday-Sunday).
 */
export function isInLastWeek(dateStr: string, referenceDate: Date = new Date()): boolean {
  const targetDate = parseLocalDate(dateStr);
  
  const currentWeekStart = getStartOfWeek(referenceDate);
  const lastWeekStart = new Date(currentWeekStart);
  lastWeekStart.setDate(currentWeekStart.getDate() - 7);
  
  const lastWeekEnd = new Date(lastWeekStart);
  lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
  lastWeekEnd.setHours(23, 59, 59, 999);
  
  return targetDate >= lastWeekStart && targetDate <= lastWeekEnd;
}

/**
 * Generates an array of the last 7 calendar days (including today) formatted as YYYY-MM-DD.
 */
export function getLast7Days(referenceDate: Date = new Date()): string[] {
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(referenceDate.getDate() - i);
    dates.push(formatLocalDate(d));
  }
  return dates;
}

/**
 * Formats a YYYY-MM-DD date string into a reader-friendly label (e.g. "Today", "Yesterday", "May 20", or day of week).
 */
export function formatDateLabel(dateStr: string, referenceDate: Date = new Date()): string {
  const target = parseLocalDate(dateStr);
  const ref = new Date(referenceDate);
  ref.setHours(0, 0, 0, 0);
  
  const todayStr = formatLocalDate(ref);
  
  const yesterday = new Date(ref);
  yesterday.setDate(ref.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterday);
  
  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';
  
  // If it's within the last 7 days, return the weekday name (e.g., "Mon", "Tue")
  const diffTime = ref.getTime() - target.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 0 && diffDays < 7) {
    return target.toLocaleDateString(undefined, { weekday: 'short' });
  }
  
  // Otherwise return ShortMonth Day (e.g. "May 15")
  return target.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * Formats an amount with a local currency formatting.
 */
export function formatAmount(amount: number, currencySymbol: string = APP_CONFIG.currencySymbol): string {
  return `${currencySymbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
