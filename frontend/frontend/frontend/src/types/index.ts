export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type UserRole = 'admin' | 'manager' | 'site_supervisor' | 'employee';

export interface Project {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  budget: number;
  description: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';

export interface Task {
  id: string;
  title: string;
  assignedTo: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  description: string;
  attachments: string[];
  projectId: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Issue {
  id: string;
  title: string;
  projectId: string;
  priority: Priority;
  status: IssueStatus;
  assignedTo: string;
  dueDate: string;
  description: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  resolution?: string;
  resolvedAt?: string;
}

export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  quantity: number;
  allocatedQuantity: number;
  status: ResourceStatus;
  projectId?: string;
  taskId?: string;
  unit: string;
  cost: number;
  createdAt: string;
  updatedAt: string;
}

export type ResourceType = 'labor' | 'material' | 'equipment';
export type ResourceStatus = 'available' | 'allocated' | 'in_use' | 'maintenance' | 'retired';

export interface PettyCash {
  id: string;
  date: string;
  amount: number;
  projectId: string;
  paidTo: string;
  category: PettyCashCategory;
  description: string;
  attachment?: string;
  createdAt: string;
  updatedAt: string;
}

export type PettyCashCategory = 'fuel' | 'food' | 'transport' | 'tools' | 'miscellaneous' | 'emergency';

export interface Attendance {
  id: string;
  employeeName: string;
  mobileNumber?: string;
  projectId: string;
  projectName?: string;
  labourType?: string;
  date: string | Date;
  timeIn?: string;
  timeOut?: string;
  status: AttendanceStatus;
  hours?: number;
  overtimeHours?: number;
  notes?: string;
  employeeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'overtime';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  currentStock: number;
  minThreshold: number;
  maxThreshold: number;
  unit: string;
  unitCost: number;
  supplier: string;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteTransfer {
  id: string;
  fromProjectId: string;
  toProjectId: string;
  materialId: string;
  quantity: number;
  transferDate: string;
  transferredBy: string;
  notes: string;
  createdAt: string;
}

export interface MaterialIssue {
  id: string;
  projectId: string;
  taskId?: string;
  materialId: string;
  quantity: number;
  issuedDate: string;
  issuedBy: string;
  issuedTo: string;
  notes: string;
  createdAt: string;
}

export interface MaterialReturn {
  id: string;
  projectId: string;
  taskId?: string;
  materialId: string;
  quantity: number;
  returnDate: string;
  returnedBy: string;
  receivedBy: string;
  condition: string;
  notes: string;
  createdAt: string;
}

export interface MaterialConsumption {
  id: string;
  projectId: string;
  taskId?: string;
  materialId: string;
  quantity: number;
  consumptionDate: string;
  recordedBy: string;
  notes: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  userId: string;
}

export type NotificationType = 'info' | 'warning' | 'error' | 'success';

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  totalIssues: number;
  openIssues: number;
  highPriorityIssues: number;
  totalExpenses: number;
  monthlyExpenses: number;
  attendanceRate: number;
  totalResources: number;
  allocatedResources: number;
  lowStockItems: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface FilterOptions {
  search?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  projectId?: string;
  dateFrom?: string;
  dateTo?: string;
  category?: string;
}

export interface ExportOptions {
  format: 'pdf' | 'excel';
  dateRange: {
    from: string;
    to: string;
  };
  modules: string[];
}
