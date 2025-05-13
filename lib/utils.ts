import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string, formatPattern = 'PPP'): string {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), formatPattern);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

export function formatNumber(number: number | null | undefined): string {
  if (number === null || number === undefined) return 'N/A';
  return new Intl.NumberFormat().format(number);
}

export function formatCurrency(amount: number | string): string {
  if (amount === null || amount === undefined) return 'N/A';
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 2,
  }).format(numericAmount);
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

export function getInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function parseQueryMonth(monthStr?: string): { year: number; month: number } {
  if (!monthStr) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  
  const [year, month] = monthStr.split('-').map(Number);
  return { year, month };
}

export function getMonthName(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' });
}

export function getCurrentMonthYear(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function convertToSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

export function getStatusColor(status: boolean): string {
  return status ? 'bg-green-500' : 'bg-red-500';
}

export function getStatusText(status: boolean): string {
  return status ? 'Active' : 'Inactive';
}

export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function generateLogFileName(): string {
  return `activity-log-${format(new Date(), 'yyyy-MM-dd')}.log`;
}

export function getRandomColor(index: number): string {
  const colors = [
    'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'
  ];
  return colors[index % colors.length];
}

export function getContrastText(hexColor: string): 'white' | 'black' {
  // If we're using HSL values from CSS variables, we can make an educated guess
  // This is a simplified approach that doesn't actually compute contrast
  if (hexColor.includes('chart-1') || hexColor.includes('chart-3')) {
    return 'white';
  }
  return 'black';
}