import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Project, Task, Issue, Resource, PettyCash, Attendance, 
  InventoryItem, SiteTransfer, MaterialIssue, MaterialReturn, 
  MaterialConsumption, Comment, Notification, DashboardStats, User 
} from '@/types';
import { generateId, formatDate } from '@/utils';
import { apiService } from '@/services/api';

interface DataContextType {
  // Data
  projects: Project[];
  tasks: Task[];
  issues: Issue[];
  resources: Resource[];
  pettyCash: PettyCash[];
  attendance: Attendance[];
  inventory: InventoryItem[];
  siteTransfers: SiteTransfer[];
  materialIssues: MaterialIssue[];
  materialReturns: MaterialReturn[];
  materialConsumptions: MaterialConsumption[];
  notifications: Notification[];
  users: User[];
  
  // Actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addTaskComment: (taskId: string, comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  
  addIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => void;
  updateIssue: (id: string, issue: Partial<Issue>) => void;
  deleteIssue: (id: string) => void;
  addIssueComment: (issueId: string, comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  
  addResource: (resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateResource: (id: string, resource: Partial<Resource>) => void;
  deleteResource: (id: string) => void;
  
  addPettyCash: (pettyCash: Omit<PettyCash, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePettyCash: (id: string, pettyCash: Partial<PettyCash>) => void;
  deletePettyCash: (id: string) => void;
  
  addAttendance: (attendance: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAttendance: (id: string, attendance: Partial<Attendance>) => void;
  deleteAttendance: (id: string) => void;
  
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  
  addSiteTransfer: (transfer: Omit<SiteTransfer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSiteTransfer: (id: string, transfer: Partial<SiteTransfer>) => void;
  deleteSiteTransfer: (id: string) => void;
  
  addMaterialIssue: (issue: Omit<MaterialIssue, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMaterialIssue: (id: string, issue: Partial<MaterialIssue>) => void;
  deleteMaterialIssue: (id: string) => void;
  
  addMaterialReturn: (returnItem: Omit<MaterialReturn, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMaterialReturn: (id: string, returnItem: Partial<MaterialReturn>) => void;
  deleteMaterialReturn: (id: string) => void;
  
  addMaterialConsumption: (consumption: Omit<MaterialConsumption, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMaterialConsumption: (id: string, consumption: Partial<MaterialConsumption>) => void;
  deleteMaterialConsumption: (id: string) => void;
  
  addUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  
  // Stats
  getDashboardStats: () => DashboardStats;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Generate empty data for testing with real data
const generateEmptyData = () => {
  return {
    projects: [],
    tasks: [],
    issues: [],
    resources: [],
    pettyCash: [],
    attendance: [],
    inventory: [],
    siteTransfers: [],
    materialIssues: [],
    materialReturns: [],
    materialConsumptions: [],
    notifications: [],
    users: []
  };
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState(() => generateEmptyData());

  // Load data from API and localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load projects, tasks, issues, and attendance from API first
        const [projectsResponse, tasksResponse, issuesResponse, attendanceResponse] = await Promise.all([
          apiService.getProjects(),
          apiService.getTasks(),
          apiService.getIssues(),
          apiService.getAttendance()
        ]);
        
        const projects = projectsResponse.data || projectsResponse;
        const tasks = tasksResponse.data || tasksResponse;
        const issues = issuesResponse.data || issuesResponse;
        const attendance = attendanceResponse.data || attendanceResponse;
        
        setData(prev => ({
          ...prev,
          projects: projects.map((p: any) => ({
            ...p,
            id: p._id || p.id,
            createdAt: formatDate(new Date(p.createdAt || Date.now())),
            updatedAt: formatDate(new Date(p.updatedAt || Date.now()))
          })),
          tasks: tasks.map((t: any) => ({
            ...t,
            id: t._id || t.id,
            projectId: t.projectId?._id || t.projectId || t.projectId,
            assignedTo: t.assignedTo?._id || t.assignedTo || t.assignedTo,
            createdAt: formatDate(new Date(t.createdAt || Date.now())),
            updatedAt: formatDate(new Date(t.updatedAt || Date.now())),
            comments: t.comments || []
          })),
          issues: issues.map((i: any) => ({
            ...i,
            id: i._id || i.id,
            projectId: i.projectId?._id || i.projectId || i.projectId,
            assignedTo: i.assignedTo?._id || i.assignedTo || i.assignedTo,
            reportedBy: i.reportedBy?._id || i.reportedBy || i.reportedBy,
            createdAt: formatDate(new Date(i.createdAt || Date.now())),
            updatedAt: formatDate(new Date(i.updatedAt || Date.now())),
            comments: i.comments || []
          })),
          attendance: attendance.map((a: any) => ({
            ...a,
            id: a._id || a.id,
            projectId: a.projectId?._id || a.projectId || a.projectId,
            employeeId: a.employeeId?._id || a.employeeId || a.employeeId,
            createdAt: new Date(a.createdAt || Date.now()),
            updatedAt: new Date(a.updatedAt || Date.now())
          }))
        }));
      } catch (error) {
        console.error('Failed to load data from API:', error);
        // Fallback to localStorage
        const savedData = localStorage.getItem('construction-management-data');
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            setData(parsedData);
          } catch (error) {
            console.error('Error loading saved data:', error);
          }
        }
      }
    };

    loadData();
  }, []);

  // Save data to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('construction-management-data', JSON.stringify(data));
  }, [data]);

  // Project actions
  const addProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await apiService.createProject(project);
      const newProject: Project = {
        ...response.data,
        id: response.data._id || response.data.id,
        createdAt: formatDate(new Date()),
        updatedAt: formatDate(new Date())
      };
      setData(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
    } catch (error) {
      console.error('Failed to create project:', error);
      // Fallback to localStorage if API fails
      const newProject: Project = {
        ...project,
        id: generateId(),
        createdAt: formatDate(new Date()),
        updatedAt: formatDate(new Date())
      };
      setData(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
    }
  };

  const updateProject = async (id: string, project: Partial<Project>) => {
    try {
      const response = await apiService.updateProject(id, project);
      setData(prev => ({
        ...prev,
        projects: prev.projects.map(p => 
          p.id === id ? { ...p, ...response.data, updatedAt: formatDate(new Date()) } : p
        )
      }));
    } catch (error) {
      console.error('Failed to update project:', error);
      // Fallback to localStorage if API fails
      setData(prev => ({
        ...prev,
        projects: prev.projects.map(p => 
          p.id === id ? { ...p, ...project, updatedAt: formatDate(new Date()) } : p
        )
      }));
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await apiService.deleteProject(id);
      setData(prev => ({
        ...prev,
        projects: prev.projects.filter(p => p.id !== id),
        tasks: prev.tasks.filter(t => t.projectId !== id),
        issues: prev.issues.filter(i => i.projectId !== id)
      }));
    } catch (error) {
      console.error('Failed to delete project:', error);
      // Fallback to localStorage if API fails
      setData(prev => ({
        ...prev,
        projects: prev.projects.filter(p => p.id !== id),
        tasks: prev.tasks.filter(t => t.projectId !== id),
        issues: prev.issues.filter(i => i.projectId !== id)
      }));
    }
  };

  // Task actions
  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => {
    try {
      const response = await apiService.createTask(task);
      const newTask: Task = {
        ...response.data,
        id: response.data._id || response.data.id,
        createdAt: formatDate(new Date()),
        updatedAt: formatDate(new Date()),
        comments: []
      };
      setData(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
    } catch (error) {
      console.error('Failed to create task:', error);
      // Fallback to localStorage if API fails
      const newTask: Task = {
        ...task,
        id: generateId(),
        createdAt: formatDate(new Date()),
        updatedAt: formatDate(new Date()),
        comments: []
      };
      setData(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
    }
  };

  const updateTask = (id: string, task: Partial<Task>) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => 
        t.id === id ? { ...t, ...task, updatedAt: formatDate(new Date()) } : t
      )
    }));
  };

  const deleteTask = (id: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
  };

  const addTaskComment = (taskId: string, comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newComment: Comment = {
      ...comment,
      id: generateId(),
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date())
    };
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => 
        t.id === taskId 
          ? { ...t, comments: [...t.comments, newComment], updatedAt: formatDate(new Date()) }
          : t
      )
    }));
  };

  // Issue actions
  const addIssue = async (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => {
    try {
      const response = await apiService.createIssue(issue);
      const newIssue: Issue = {
        ...response.data,
        id: response.data._id || response.data.id,
        createdAt: formatDate(new Date()),
        updatedAt: formatDate(new Date()),
        comments: []
      };
      setData(prev => ({ ...prev, issues: [...prev.issues, newIssue] }));
    } catch (error) {
      console.error('Failed to create issue:', error);
      // Fallback to localStorage if API fails
      const newIssue: Issue = {
        ...issue,
        id: generateId(),
        createdAt: formatDate(new Date()),
        updatedAt: formatDate(new Date()),
        comments: []
      };
      setData(prev => ({ ...prev, issues: [...prev.issues, newIssue] }));
    }
  };

  const updateIssue = (id: string, issue: Partial<Issue>) => {
    setData(prev => ({
      ...prev,
      issues: prev.issues.map(i => 
        i.id === id ? { ...i, ...issue, updatedAt: formatDate(new Date()) } : i
      )
    }));
  };

  const deleteIssue = (id: string) => {
    setData(prev => ({
      ...prev,
      issues: prev.issues.filter(i => i.id !== id)
    }));
  };

  const addIssueComment = (issueId: string, comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newComment: Comment = {
      ...comment,
      id: generateId(),
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date())
    };
    setData(prev => ({
      ...prev,
      issues: prev.issues.map(i => 
        i.id === issueId 
          ? { ...i, comments: [...i.comments, newComment], updatedAt: formatDate(new Date()) }
          : i
      )
    }));
  };

  // Resource actions
  const addResource = (resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newResource: Resource = {
      ...resource,
      id: generateId(),
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date())
    };
    setData(prev => ({ ...prev, resources: [...prev.resources, newResource] }));
  };

  const updateResource = (id: string, resource: Partial<Resource>) => {
    setData(prev => ({
      ...prev,
      resources: prev.resources.map(r => 
        r.id === id ? { ...r, ...resource, updatedAt: formatDate(new Date()) } : r
      )
    }));
  };

  const deleteResource = (id: string) => {
    setData(prev => ({
      ...prev,
      resources: prev.resources.filter(r => r.id !== id)
    }));
  };

  // Petty Cash actions
  const addPettyCash = (pettyCash: Omit<PettyCash, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPettyCash: PettyCash = {
      ...pettyCash,
      id: generateId(),
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date())
    };
    setData(prev => ({ ...prev, pettyCash: [...prev.pettyCash, newPettyCash] }));
  };

  const updatePettyCash = (id: string, pettyCash: Partial<PettyCash>) => {
    setData(prev => ({
      ...prev,
      pettyCash: prev.pettyCash.map(pc => 
        pc.id === id ? { ...pc, ...pettyCash, updatedAt: formatDate(new Date()) } : pc
      )
    }));
  };

  const deletePettyCash = (id: string) => {
    setData(prev => ({
      ...prev,
      pettyCash: prev.pettyCash.filter(pc => pc.id !== id)
    }));
  };

  // Attendance actions
  const addAttendance = async (attendance: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await apiService.createAttendance(attendance);
      const newAttendance: Attendance = {
        ...response.data,
        id: response.data._id || response.data.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setData(prev => ({ ...prev, attendance: [...prev.attendance, newAttendance] }));
    } catch (error) {
      console.error('Failed to create attendance:', error);
      // Fallback to localStorage if API fails
      const newAttendance: Attendance = {
        ...attendance,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setData(prev => ({ ...prev, attendance: [...prev.attendance, newAttendance] }));
    }
  };

  const updateAttendance = async (id: string, attendance: Partial<Attendance>) => {
    try {
      const response = await apiService.updateAttendance(id, attendance);
      setData(prev => ({
        ...prev,
        attendance: prev.attendance.map(a => 
          a.id === id ? { ...a, ...response.data, updatedAt: new Date() } : a
        )
      }));
    } catch (error) {
      console.error('Failed to update attendance:', error);
      // Fallback to localStorage if API fails
      setData(prev => ({
        ...prev,
        attendance: prev.attendance.map(a => 
          a.id === id ? { ...a, ...attendance, updatedAt: new Date() } : a
        )
      }));
    }
  };

  const deleteAttendance = async (id: string) => {
    try {
      await apiService.deleteAttendance(id);
      setData(prev => ({
        ...prev,
        attendance: prev.attendance.filter(a => a.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete attendance:', error);
      // Fallback to localStorage if API fails
      setData(prev => ({
        ...prev,
        attendance: prev.attendance.filter(a => a.id !== id)
      }));
    }
  };

  // Inventory actions
  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: generateId(),
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date())
    };
    setData(prev => ({ ...prev, inventory: [...prev.inventory, newItem] }));
  };

  const updateInventoryItem = (id: string, item: Partial<InventoryItem>) => {
    setData(prev => ({
      ...prev,
      inventory: prev.inventory.map(i => 
        i.id === id ? { ...i, ...item, updatedAt: formatDate(new Date()) } : i
      )
    }));
  };

  const deleteInventoryItem = (id: string) => {
    setData(prev => ({
      ...prev,
      inventory: prev.inventory.filter(i => i.id !== id)
    }));
  };

  // Site Transfer actions
  const addSiteTransfer = (transfer: Omit<SiteTransfer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTransfer: SiteTransfer = {
      ...transfer,
      id: generateId(),
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date())
    };
    setData(prev => ({ ...prev, siteTransfers: [...prev.siteTransfers, newTransfer] }));
  };

  const updateSiteTransfer = (id: string, transfer: Partial<SiteTransfer>) => {
    setData(prev => ({
      ...prev,
      siteTransfers: prev.siteTransfers.map(st => 
        st.id === id ? { ...st, ...transfer, updatedAt: formatDate(new Date()) } : st
      )
    }));
  };

  const deleteSiteTransfer = (id: string) => {
    setData(prev => ({
      ...prev,
      siteTransfers: prev.siteTransfers.filter(st => st.id !== id)
    }));
  };

  // Material Issue actions
  const addMaterialIssue = (issue: Omit<MaterialIssue, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newIssue: MaterialIssue = {
      ...issue,
      id: generateId(),
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date())
    };
    setData(prev => ({ ...prev, materialIssues: [...prev.materialIssues, newIssue] }));
  };

  const updateMaterialIssue = (id: string, issue: Partial<MaterialIssue>) => {
    setData(prev => ({
      ...prev,
      materialIssues: prev.materialIssues.map(mi => 
        mi.id === id ? { ...mi, ...issue, updatedAt: formatDate(new Date()) } : mi
      )
    }));
  };

  const deleteMaterialIssue = (id: string) => {
    setData(prev => ({
      ...prev,
      materialIssues: prev.materialIssues.filter(mi => mi.id !== id)
    }));
  };

  // Material Return actions
  const addMaterialReturn = (returnItem: Omit<MaterialReturn, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newReturn: MaterialReturn = {
      ...returnItem,
      id: generateId(),
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date())
    };
    setData(prev => ({ ...prev, materialReturns: [...prev.materialReturns, newReturn] }));
  };

  const updateMaterialReturn = (id: string, returnItem: Partial<MaterialReturn>) => {
    setData(prev => ({
      ...prev,
      materialReturns: prev.materialReturns.map(mr => 
        mr.id === id ? { ...mr, ...returnItem, updatedAt: formatDate(new Date()) } : mr
      )
    }));
  };

  const deleteMaterialReturn = (id: string) => {
    setData(prev => ({
      ...prev,
      materialReturns: prev.materialReturns.filter(mr => mr.id !== id)
    }));
  };

  // Material Consumption actions
  const addMaterialConsumption = (consumption: Omit<MaterialConsumption, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newConsumption: MaterialConsumption = {
      ...consumption,
      id: generateId(),
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date())
    };
    setData(prev => ({ ...prev, materialConsumptions: [...prev.materialConsumptions, newConsumption] }));
  };

  const updateMaterialConsumption = (id: string, consumption: Partial<MaterialConsumption>) => {
    setData(prev => ({
      ...prev,
      materialConsumptions: prev.materialConsumptions.map(mc => 
        mc.id === id ? { ...mc, ...consumption, updatedAt: formatDate(new Date()) } : mc
      )
    }));
  };

  const deleteMaterialConsumption = (id: string) => {
    setData(prev => ({
      ...prev,
      materialConsumptions: prev.materialConsumptions.filter(mc => mc.id !== id)
    }));
  };

  // User actions
  const addUser = (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newUser: User = {
      ...user,
      id: generateId(),
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date())
    };
    setData(prev => ({ ...prev, users: [...prev.users, newUser] }));
  };

  const updateUser = (id: string, user: Partial<User>) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u => 
        u.id === id ? { ...u, ...user, updatedAt: formatDate(new Date()) } : u
      )
    }));
  };

  const deleteUser = (id: string) => {
    setData(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== id)
    }));
  };

  // Notification actions
  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date())
    };
    setData(prev => ({ ...prev, notifications: [...prev.notifications, newNotification] }));
  };

  const markNotificationAsRead = (id: string) => {
    setData(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => 
        n.id === id ? { ...n, read: true, updatedAt: formatDate(new Date()) } : n
      )
    }));
  };

  const deleteNotification = (id: string) => {
    setData(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id)
    }));
  };

  // Dashboard stats
  const getDashboardStats = (): DashboardStats => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Calculate attendance rate
    const totalAttendanceRecords = data.attendance.length;
    const presentRecords = data.attendance.filter(a => a.status === 'present').length;
    const attendanceRate = totalAttendanceRecords > 0 ? (presentRecords / totalAttendanceRecords) * 100 : 0;
    
    // Calculate resources
    const totalResources = data.resources.length;
    const allocatedResources = data.resources.filter(r => r.status === 'allocated' || r.status === 'in_use').length;
    
    // Calculate low stock items (assuming inventory has a quantity field)
    const lowStockItems = data.inventory.filter(item => (item as any).quantity < 10).length;
    
    return {
      totalProjects: data.projects.length,
      activeProjects: data.projects.filter(p => p.status === 'active').length,
      completedProjects: data.projects.filter(p => p.status === 'completed').length,
      totalTasks: data.tasks.length,
      completedTasks: data.tasks.filter(t => t.status === 'completed').length,
      pendingTasks: data.tasks.filter(t => t.status === 'todo').length,
      totalIssues: data.issues.length,
      openIssues: data.issues.filter(i => i.status === 'open').length,
      highPriorityIssues: data.issues.filter(i => i.priority === 'high' || i.priority === 'urgent').length,
      totalExpenses: data.pettyCash.reduce((sum, pc) => sum + pc.amount, 0),
      monthlyExpenses: data.pettyCash
        .filter(pc => new Date(pc.date) >= thirtyDaysAgo)
        .reduce((sum, pc) => sum + pc.amount, 0),
      attendanceRate: attendanceRate,
      totalResources: totalResources,
      allocatedResources: allocatedResources,
      lowStockItems: lowStockItems
    };
  };

  const value: DataContextType = {
    // Data
    projects: data.projects,
    tasks: data.tasks,
    issues: data.issues,
    resources: data.resources,
    pettyCash: data.pettyCash,
    attendance: data.attendance,
    inventory: data.inventory,
    siteTransfers: data.siteTransfers,
    materialIssues: data.materialIssues,
    materialReturns: data.materialReturns,
    materialConsumptions: data.materialConsumptions,
    notifications: data.notifications,
    users: data.users,
    
    // Actions
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    addTaskComment,
    addIssue,
    updateIssue,
    deleteIssue,
    addIssueComment,
    addResource,
    updateResource,
    deleteResource,
    addPettyCash,
    updatePettyCash,
    deletePettyCash,
    addAttendance,
    updateAttendance,
    deleteAttendance,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addSiteTransfer,
    updateSiteTransfer,
    deleteSiteTransfer,
    addMaterialIssue,
    updateMaterialIssue,
    deleteMaterialIssue,
    addMaterialReturn,
    updateMaterialReturn,
    deleteMaterialReturn,
    addMaterialConsumption,
    updateMaterialConsumption,
    deleteMaterialConsumption,
    addUser,
    updateUser,
    deleteUser,
    addNotification,
    markNotificationAsRead,
    deleteNotification,
    getDashboardStats
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};