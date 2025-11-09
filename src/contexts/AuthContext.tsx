import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { User, UserRole } from '@/types';
import { MODULE_PERMISSIONS } from '@/constants';
import { apiService } from '@/services/api';

// Import useData to add notifications
let dataContextRef: any = null;
export const setDataContextRef = (ref: any) => {
  dataContextRef = ref;
};

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (module: string) => boolean;
  hasRole: (roles: UserRole[]) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'John Admin',
    email: 'admin@construction.com',
    role: 'admin',
    avatar: undefined
  },
  {
    id: '2',
    name: 'Sarah Manager',
    email: 'manager@construction.com',
    role: 'manager',
    avatar: undefined
  },
  {
    id: '3',
    name: 'Mike Supervisor',
    email: 'supervisor@construction.com',
    role: 'site_supervisor',
    avatar: undefined
  },
  {
    id: '4',
    name: 'Alex Employee',
    email: 'employee@construction.com',
    role: 'employee',
    avatar: undefined
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session and token
    const storedUser = localStorage.getItem('construction_user');
    const storedToken = localStorage.getItem('construction_token');
    
    if (storedUser && storedToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        // Optionally verify token with backend
        // apiService.getMe().then(user => setUser(user)).catch(() => logout());
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('construction_user');
        localStorage.removeItem('construction_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Call the real API
      const response = await apiService.login(email, password);
      
      if (response.success && response.token && response.user) {
        // Store user and token
        const userData: User = {
          id: response.user.id.toString(),
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
          avatar: response.user.avatar || undefined
        };
        
        setUser(userData);
        localStorage.setItem('construction_user', JSON.stringify(userData));
        localStorage.setItem('construction_token', response.token);
        
        // Check for assigned tasks and issues and show notifications
        checkAssignedTasks(userData.id);
        checkAssignedIssues(userData.id);
        
        setIsLoading(false);
        return true;
      } else {
        console.error('Login failed: Invalid response', response);
        setIsLoading(false);
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('construction_user');
    localStorage.removeItem('construction_token');
  };

  // Check for tasks assigned to the logged-in user and show notifications
  const checkAssignedTasks = async (userId: string) => {
    try {
      // Get all tasks
      const tasksResponse = await apiService.getTasks();
      const tasks = (tasksResponse as any).data || tasksResponse;
      
      if (!Array.isArray(tasks)) return;
      
      // Filter tasks assigned to this user - normalize IDs for comparison
      const assignedTasks = tasks.filter((task: any) => {
        const taskAssignedTo = task.assignedTo?._id || task.assignedTo || task.assignedTo;
        const taskAssignedToStr = taskAssignedTo?.toString() || '';
        const userIdStr = userId?.toString() || '';
        return taskAssignedToStr === userIdStr;
      });
      
      // Show notifications for assigned tasks
      if (assignedTasks.length > 0) {
        // Show a summary notification first
        toast.success(
          `You have ${assignedTasks.length} task${assignedTasks.length > 1 ? 's' : ''} assigned to you!`,
          { duration: 3000 }
        );
        
        // Add notifications to DataContext for the notification panel
        const addNotification = (window as any).__dataContextAddNotification;
        if (addNotification) {
          assignedTasks.forEach((task: any) => {
            const taskTitle = task.title || 'Untitled Task';
            const createdByName = task.createdByName || task.createdBy?.name || 'System';
            const createdByRole = task.createdByRole || task.createdBy?.role || '';
            const roleLabel = createdByRole ? ` (${createdByRole.charAt(0).toUpperCase() + createdByRole.slice(1)})` : '';
            
            addNotification({
              title: 'New Task Assigned',
              message: `Task "${taskTitle}" is assigned from ${createdByName}${roleLabel}`,
              type: 'info',
              read: false,
              userId: userId
            });
          });
        }
        
        // Show individual toast notifications for each task
        assignedTasks.forEach((task: any, index: number) => {
          setTimeout(() => {
            const taskTitle = task.title || 'Untitled Task';
            const createdByName = task.createdByName || task.createdBy?.name || 'System';
            const createdByRole = task.createdByRole || task.createdBy?.role || '';
            const roleLabel = createdByRole ? ` (${createdByRole.charAt(0).toUpperCase() + createdByRole.slice(1)})` : '';
            
            toast(
              `📋 Task "${taskTitle}" is assigned from ${createdByName}${roleLabel}`,
              {
                duration: 5000,
                icon: '📋',
                style: {
                  background: '#3b82f6',
                  color: '#fff',
                },
              }
            );
          }, index * 1000); // Stagger notifications by 1 second
        });
      }
    } catch (error) {
      console.error('Error checking assigned tasks:', error);
      // Don't show error to user, just log it
    }
  };

  // Check for issues assigned to the logged-in user and show notifications
  const checkAssignedIssues = async (userId: string) => {
    try {
      // Get all issues
      const issuesResponse = await apiService.getIssues();
      const issues = (issuesResponse as any).data || issuesResponse;
      
      if (!Array.isArray(issues)) return;
      
      // Filter issues assigned to this user - normalize IDs for comparison
      const assignedIssues = issues.filter((issue: any) => {
        const issueAssignedTo = issue.assignedTo?._id || issue.assignedTo || issue.assignedTo;
        const issueAssignedToStr = issueAssignedTo?.toString() || '';
        const userIdStr = userId?.toString() || '';
        return issueAssignedToStr === userIdStr;
      });
      
      // Show notifications for assigned issues
      if (assignedIssues.length > 0) {
        // Show a summary notification first
        toast.success(
          `You have ${assignedIssues.length} issue${assignedIssues.length > 1 ? 's' : ''} assigned to you!`,
          { duration: 3000 }
        );
        
        // Add notifications to DataContext for the notification panel
        const addNotification = (window as any).__dataContextAddNotification;
        if (addNotification) {
          assignedIssues.forEach((issue: any) => {
            const issueTitle = issue.title || 'Untitled Issue';
            const reportedByName = issue.reportedByName || issue.reportedBy?.name || 'Manager';
            
            addNotification({
              title: 'New Issue Assigned',
              message: `Issue "${issueTitle}" has been assigned to you by ${reportedByName}`,
              type: 'info',
              read: false,
              userId: userId
            });
          });
        }
        
        // Show individual toast notifications for each issue
        assignedIssues.forEach((issue: any, index: number) => {
          setTimeout(() => {
            const issueTitle = issue.title || 'Untitled Issue';
            const reportedByName = issue.reportedByName || issue.reportedBy?.name || 'Manager';
            
            toast(
              `🚨 Issue "${issueTitle}" is assigned from ${reportedByName}`,
              {
                duration: 5000,
                icon: '🚨',
                style: {
                  background: '#f59e0b',
                  color: '#fff',
                },
              }
            );
          }, index * 1000); // Stagger notifications by 1 second
        });
      }
    } catch (error) {
      console.error('Error checking assigned issues:', error);
      // Don't show error to user, just log it
    }
  };

  const hasPermission = (module: string): boolean => {
    if (!user) return false;
    const permissions = MODULE_PERMISSIONS[user.role];
    return permissions.includes(module);
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    hasPermission,
    hasRole,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
