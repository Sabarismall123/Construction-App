import { format, parseISO, isValid, isAfter, isBefore, addDays, subDays } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date, formatStr: string = 'MMM dd, yyyy'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Invalid Date';
    return format(dateObj, formatStr);
  } catch {
    return 'Invalid Date';
  }
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${formatNumber(value, decimals)}%`;
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function generateIdWithPrefix(prefix: string): string {
  return `${prefix}_${generateId()}`;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateDateRange(startDate: string, endDate: string): boolean {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  return isValid(start) && isValid(end) && isBefore(start, end);
}

export function isDateInRange(date: string, startDate: string, endDate: string): boolean {
  const checkDate = parseISO(date);
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  if (!isValid(checkDate) || !isValid(start) || !isValid(end)) return false;
  
  return (isAfter(checkDate, start) || checkDate.getTime() === start.getTime()) &&
         (isBefore(checkDate, end) || checkDate.getTime() === end.getTime());
}

export function getDateRange(days: number): { from: string; to: string } {
  const today = new Date();
  const from = subDays(today, days);
  const to = today;
  
  return {
    from: format(from, 'yyyy-MM-dd'),
    to: format(to, 'yyyy-MM-dd')
  };
}

export function calculateWorkingHours(timeIn: string, timeOut: string): number {
  const start = parseISO(`2000-01-01T${timeIn}`);
  const end = parseISO(`2000-01-01T${timeOut}`);
  
  if (!isValid(start) || !isValid(end)) return 0;
  
  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, diffMs / (1000 * 60 * 60)); // Convert to hours
}

export function calculateOvertime(hoursWorked: number, regularHours: number = 8): number {
  return Math.max(0, hoursWorked - regularHours);
}

export function getStatusColor(status: string, statusConfig: Array<{ value: string; color: string }>): string {
  const config = statusConfig.find(s => s.value === status);
  return config?.color || 'bg-gray-100 text-gray-800';
}

export function getPriorityColor(priority: string): string {
  const priorityConfig = [
    { value: 'low', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', color: 'bg-red-100 text-red-800' }
  ];
  
  return getStatusColor(priority, priorityConfig);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function searchItems<T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] {
  if (!searchTerm.trim()) return items;
  
  const term = searchTerm.toLowerCase();
  return items.filter(item =>
    searchFields.some(field => {
      const value = item[field];
      return value && String(value).toLowerCase().includes(term);
    })
  );
}

export function filterItems<T>(
  items: T[],
  filters: Record<string, any>
): T[] {
  return items.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value || value === '') return true;
      const itemValue = item[key as keyof T];
      return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
    });
  });
}

export function sortItems<T>(
  items: T[],
  sortBy: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...items].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number
): { items: T[]; totalPages: number; totalItems: number } {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    items: items.slice(startIndex, endIndex),
    totalPages,
    totalItems
  };
}

export function exportToCSV<T>(
  data: T[],
  filename: string,
  headers: Array<{ key: keyof T; label: string }>
): void {
  const csvContent = [
    headers.map(h => h.label).join(','),
    ...data.map(row =>
      headers.map(h => {
        const value = row[h.key];
        return typeof value === 'string' && value.includes(',')
          ? `"${value}"`
          : value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  return fileExtension ? allowedTypes.includes(fileExtension) : false;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
