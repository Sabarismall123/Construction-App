import { UserRole } from '@/types';

export const ROLES: Record<UserRole, string> = {
  admin: 'Administrator',
  manager: 'Manager',
  site_supervisor: 'Site Supervisor',
  employee: 'Employee'
};

export const PROJECT_STATUSES = [
  { value: 'planning', label: 'Planning', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'active', label: 'Active', color: 'bg-blue-100 text-blue-800' },
  { value: 'on_hold', label: 'On Hold', color: 'bg-orange-100 text-orange-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
];

export const TASK_STATUSES = [
  { value: 'todo', label: 'To Do', color: 'bg-gray-100 text-gray-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'review', label: 'Review', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
];

export const ISSUE_STATUSES = [
  { value: 'open', label: 'Open', color: 'bg-red-100 text-red-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'resolved', label: 'Resolved', color: 'bg-blue-100 text-blue-800' },
  { value: 'closed', label: 'Closed', color: 'bg-green-100 text-green-800' }
];

export const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
];

export const RESOURCE_TYPES = [
  { value: 'labor', label: 'Labor', icon: '👷' },
  { value: 'material', label: 'Material', icon: '🧱' },
  { value: 'equipment', label: 'Equipment', icon: '🚜' }
];

export const RESOURCE_STATUSES = [
  { value: 'available', label: 'Available', color: 'bg-green-100 text-green-800' },
  { value: 'allocated', label: 'Allocated', color: 'bg-blue-100 text-blue-800' },
  { value: 'in_use', label: 'In Use', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-orange-100 text-orange-800' },
  { value: 'retired', label: 'Retired', color: 'bg-red-100 text-red-800' }
];

export const PETTY_CASH_CATEGORIES = [
  { value: 'fuel', label: 'Fuel', icon: '⛽' },
  { value: 'food', label: 'Food', icon: '🍽️' },
  { value: 'transport', label: 'Transport', icon: '🚗' },
  { value: 'tools', label: 'Tools', icon: '🔧' },
  { value: 'miscellaneous', label: 'Miscellaneous', icon: '📦' },
  { value: 'emergency', label: 'Emergency', icon: '🚨' }
];

export const ATTENDANCE_STATUSES = [
  { value: 'present', label: 'Present', color: 'bg-green-100 text-green-800' },
  { value: 'absent', label: 'Absent', color: 'bg-red-100 text-red-800' },
  { value: 'late', label: 'Late', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'half_day', label: 'Half Day', color: 'bg-orange-100 text-orange-800' },
  { value: 'overtime', label: 'Overtime', color: 'bg-blue-100 text-blue-800' }
];

export const MODULE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['dashboard', 'projects', 'tasks', 'issues', 'resources', 'attendance', 'petty_cash', 'commercial', 'reports', 'settings'],
  manager: ['dashboard', 'projects', 'tasks', 'issues', 'resources', 'attendance', 'petty_cash', 'commercial', 'reports', 'users', 'settings'],
  site_supervisor: ['dashboard', 'projects', 'tasks', 'issues', 'resources', 'attendance', 'petty_cash', 'commercial', 'settings'],
  employee: ['dashboard', 'tasks', 'issues', 'attendance', 'settings']
};

export const COMMERCIAL_SUBMODULES = [
  { key: 'inventory', label: 'Inventory', icon: '📦' },
  { key: 'site_transfers', label: 'Site Transfers', icon: '🚚' },
  { key: 'material_issue', label: 'Material Issue', icon: '📤' },
  { key: 'material_return', label: 'Material Return', icon: '📥' },
  { key: 'consumptions', label: 'Consumptions', icon: '📊' }
];

export const NAVIGATION_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
  { key: 'projects', label: 'Projects', icon: '🏗️', path: '/projects' },
  { key: 'tasks', label: 'Tasks', icon: '✅', path: '/tasks' },
  { key: 'issues', label: 'Issues', icon: '⚠️', path: '/issues' },
  { key: 'resources', label: 'Resources', icon: '👥', path: '/resources' },
  { key: 'attendance', label: 'Attendance', icon: '⏰', path: '/attendance' },
  { key: 'petty_cash', label: 'Petty Cash', icon: '💰', path: '/petty-cash' },
  { 
    key: 'commercial', 
    label: 'Commercial', 
    icon: '🏪', 
    path: '/commercial',
    submodules: COMMERCIAL_SUBMODULES
  },
  { key: 'users', label: 'Users', icon: '👤', path: '/users' },
  { key: 'settings', label: 'Settings', icon: '⚙️', path: '/settings' },
  { key: 'reports', label: 'Reports', icon: '📈', path: '/reports' }
];

export const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

export const DATE_FORMATS = {
  display: 'MMM dd, yyyy',
  input: 'yyyy-MM-dd',
  datetime: 'MMM dd, yyyy HH:mm',
  time: 'HH:mm'
};

export const PAGINATION = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 25, 50, 100]
};

export const FILE_TYPES = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
  all: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt']
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
