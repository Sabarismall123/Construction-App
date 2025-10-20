import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Project, Task, Issue, Resource, PettyCash, Attendance, 
  InventoryItem, SiteTransfer, MaterialIssue, MaterialReturn, 
  MaterialConsumption, Comment, Notification, DashboardStats, User 
} from '@/types';
import { generateId, formatDate } from '@/utils';

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
  bulkUploadAttendance: (attendanceList: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  
  addSiteTransfer: (transfer: Omit<SiteTransfer, 'id' | 'createdAt'>) => void;
  addMaterialIssue: (issue: Omit<MaterialIssue, 'id' | 'createdAt'>) => void;
  addMaterialReturn: (returnItem: Omit<MaterialReturn, 'id' | 'createdAt'>) => void;
  addMaterialConsumption: (consumption: Omit<MaterialConsumption, 'id' | 'createdAt'>) => void;
  
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Computed data
  getDashboardStats: () => DashboardStats;
  getProjectTasks: (projectId: string) => Task[];
  getProjectIssues: (projectId: string) => Issue[];
  getProjectResources: (projectId: string) => Resource[];
  getProjectPettyCash: (projectId: string) => PettyCash[];
  getProjectAttendance: (projectId: string) => Attendance[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Generate dummy data
const generateDummyData = () => {
  const now = new Date();
  const projects: Project[] = [
    {
      id: '1',
      name: 'Office Building Construction',
      client: 'ABC Corporation',
      status: 'active',
      startDate: formatDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)),
      endDate: formatDate(new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)),
      budget: 5000000,
      description: 'Construction of a 10-story office building in downtown',
      progress: 35,
      createdAt: formatDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)),
      updatedAt: formatDate(now)
    },
    {
      id: '2',
      name: 'Residential Complex',
      client: 'XYZ Developers',
      status: 'planning',
      startDate: formatDate(new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000)),
      endDate: formatDate(new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000)),
      budget: 8000000,
      description: 'Construction of a 50-unit residential complex',
      progress: 5,
      createdAt: formatDate(new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)),
      updatedAt: formatDate(now)
    },
    {
      id: '3',
      name: 'Shopping Mall Renovation',
      client: 'Mall Group Inc',
      status: 'on_hold',
      startDate: formatDate(new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)),
      endDate: formatDate(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)),
      budget: 2000000,
      description: 'Renovation of existing shopping mall',
      progress: 60,
      createdAt: formatDate(new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)),
      updatedAt: formatDate(now)
    },
    {
      id: '4',
      name: 'Highway Bridge Construction',
      client: 'Department of Transportation',
      status: 'completed',
      startDate: formatDate(new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000)),
      endDate: formatDate(new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)),
      budget: 12000000,
      description: 'Construction of a major highway bridge',
      progress: 100,
      createdAt: formatDate(new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000)),
      updatedAt: formatDate(now)
    },
    {
      id: '5',
      name: 'Warehouse Construction',
      client: 'Logistics Corp',
      status: 'active',
      startDate: formatDate(new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)),
      endDate: formatDate(new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000)),
      budget: 3000000,
      description: 'Construction of a large warehouse facility',
      progress: 20,
      createdAt: formatDate(new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)),
      updatedAt: formatDate(now)
    }
  ];

  const tasks: Task[] = [
    {
      id: '1',
      title: 'Foundation Excavation',
      assignedTo: '2',
      priority: 'high',
      status: 'in_progress',
      dueDate: formatDate(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)),
      description: 'Excavate foundation for office building',
      attachments: [],
      projectId: '1',
      createdAt: formatDate(new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000)),
      updatedAt: formatDate(now),
      comments: []
    },
    {
      id: '2',
      title: 'Steel Frame Installation',
      assignedTo: '3',
      priority: 'urgent',
      status: 'todo',
      dueDate: formatDate(new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)),
      description: 'Install steel frame structure',
      attachments: [],
      projectId: '1',
      createdAt: formatDate(new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)),
      updatedAt: formatDate(now),
      comments: []
    },
    {
      id: '3',
      title: 'Electrical Wiring',
      assignedTo: '4',
      priority: 'medium',
      status: 'completed',
      dueDate: formatDate(new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)),
      description: 'Install electrical wiring and fixtures',
      attachments: [],
      projectId: '4',
      createdAt: formatDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)),
      updatedAt: formatDate(now),
      comments: []
    }
  ];

  const issues: Issue[] = [
    {
      id: '1',
      title: 'Material Delivery Delay',
      projectId: '1',
      priority: 'high',
      status: 'open',
      assignedTo: '2',
      dueDate: formatDate(new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)),
      description: 'Steel delivery is delayed by 2 weeks',
      attachments: [],
      createdAt: formatDate(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)),
      updatedAt: formatDate(now),
      comments: []
    },
    {
      id: '2',
      title: 'Safety Incident',
      projectId: '1',
      priority: 'urgent',
      status: 'in_progress',
      assignedTo: '1',
      dueDate: formatDate(new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)),
      description: 'Minor injury reported on site',
      attachments: [],
      createdAt: formatDate(new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)),
      updatedAt: formatDate(now),
      comments: []
    }
  ];

  const resources: Resource[] = [
    {
      id: '1',
      name: 'Crane Operator - John Smith',
      type: 'labor',
      quantity: 1,
      allocatedQuantity: 1,
      status: 'in_use',
      projectId: '1',
      unit: 'person',
      cost: 50,
      createdAt: formatDate(new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)),
      updatedAt: formatDate(now)
    },
    {
      id: '2',
      name: 'Steel Beams',
      type: 'material',
      quantity: 100,
      allocatedQuantity: 50,
      status: 'allocated',
      projectId: '1',
      unit: 'pieces',
      cost: 500,
      createdAt: formatDate(new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)),
      updatedAt: formatDate(now)
    },
    {
      id: '3',
      name: 'Excavator',
      type: 'equipment',
      quantity: 1,
      allocatedQuantity: 1,
      status: 'in_use',
      projectId: '1',
      unit: 'unit',
      cost: 200,
      createdAt: formatDate(new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000)),
      updatedAt: formatDate(now)
    }
  ];

  const pettyCash: PettyCash[] = [
    {
      id: '1',
      date: formatDate(new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)),
      amount: 150,
      projectId: '1',
      paidTo: 'Fuel Station',
      category: 'fuel',
      description: 'Diesel fuel for equipment',
      createdAt: formatDate(new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)),
      updatedAt: formatDate(now)
    },
    {
      id: '2',
      date: formatDate(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)),
      amount: 75,
      projectId: '1',
      paidTo: 'Hardware Store',
      category: 'tools',
      description: 'Safety equipment',
      createdAt: formatDate(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)),
      updatedAt: formatDate(now)
    }
  ];

  const attendance: Attendance[] = [
    {
      id: '1',
      employeeName: 'John Smith',
      projectId: '1',
      date: formatDate(now),
      timeIn: '08:00',
      timeOut: '17:00',
      status: 'present',
      hoursWorked: 8,
      overtime: 0,
      createdAt: formatDate(now),
      updatedAt: formatDate(now)
    },
    {
      id: '2',
      employeeName: 'Sarah Johnson',
      projectId: '1',
      date: formatDate(now),
      timeIn: '08:30',
      timeOut: '17:30',
      status: 'present',
      hoursWorked: 8,
      overtime: 0,
      createdAt: formatDate(now),
      updatedAt: formatDate(now)
    }
  ];

  const inventory: InventoryItem[] = [
    {
      id: '1',
      name: 'Steel Beams',
      description: 'Structural steel beams for construction',
      category: 'Structural',
      currentStock: 50,
      minThreshold: 10,
      maxThreshold: 100,
      unit: 'pieces',
      unitCost: 500,
      supplier: 'Steel Corp',
      location: 'Warehouse A',
      createdAt: formatDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)),
      updatedAt: formatDate(now)
    },
    {
      id: '2',
      name: 'Cement Bags',
      description: 'Portland cement for concrete',
      category: 'Concrete',
      currentStock: 200,
      minThreshold: 50,
      maxThreshold: 500,
      unit: 'bags',
      unitCost: 25,
      supplier: 'Cement Ltd',
      location: 'Warehouse B',
      createdAt: formatDate(new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000)),
      updatedAt: formatDate(now)
    }
  ];

  const users: User[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@construction.com',
      role: 'admin',
      avatar: undefined
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@construction.com',
      role: 'manager',
      avatar: undefined
    },
    {
      id: '3',
      name: 'Mike Wilson',
      email: 'mike.wilson@construction.com',
      role: 'site_supervisor',
      avatar: undefined
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily.davis@construction.com',
      role: 'employee',
      avatar: undefined
    },
    {
      id: '5',
      name: 'David Brown',
      email: 'david.brown@construction.com',
      role: 'employee',
      avatar: undefined
    },
    {
      id: '6',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@construction.com',
      role: 'site_supervisor',
      avatar: undefined
    }
  ];

  return {
    projects,
    tasks,
    issues,
    resources,
    pettyCash,
    attendance,
    inventory,
    siteTransfers: [],
    materialIssues: [],
    materialReturns: [],
    materialConsumptions: [],
    notifications: [],
    users
  };
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(() => generateDummyData());

  // Load data from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem('construction_data');
    if (storedData) {
      try {
        setData(JSON.parse(storedData));
      } catch (error) {
        console.error('Error loading stored data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('construction_data', JSON.stringify(data));
  }, [data]);

  const addProject = (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...project,
      id: generateId(),
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date())
    };
    setData(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
  };

  const updateProject = (id: string, project: Partial<Project>) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => 
        p.id === id ? { ...p, ...project, updatedAt: formatDate(new Date()) } : p
      )
    }));
  };

  const deleteProject = (id: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
  };

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => {
    const newTask: Task = {
      ...task,
      id: generateId(),
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date()),
      comments: []
    };
    setData(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
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
          ? { ...t, comments: [...t.comments, newComment] }
          : t
      )
    }));
  };

  const addIssue = (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => {
    const newIssue: Issue = {
      ...issue,
      id: generateId(),
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date()),
      comments: []
    };
    setData(prev => ({ ...prev, issues: [...prev.issues, newIssue] }));
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
          ? { ...i, comments: [...i.comments, newComment] }
          : i
      )
    }));
  };

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

  const addAttendance = (attendance: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAttendance: Attendance = {
      ...attendance,
      id: generateId(),
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date())
    };
    setData(prev => ({ ...prev, attendance: [...prev.attendance, newAttendance] }));
  };

  const updateAttendance = (id: string, attendance: Partial<Attendance>) => {
    setData(prev => ({
      ...prev,
      attendance: prev.attendance.map(a => 
        a.id === id ? { ...a, ...attendance, updatedAt: formatDate(new Date()) } : a
      )
    }));
  };

  const deleteAttendance = (id: string) => {
    setData(prev => ({
      ...prev,
      attendance: prev.attendance.filter(a => a.id !== id)
    }));
  };

  const bulkUploadAttendance = (attendanceList: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>[]) => {
    const newAttendanceList = attendanceList.map(attendance => ({
      ...attendance,
      id: generateId(),
      createdAt: formatDate(new Date()),
      updatedAt: formatDate(new Date())
    }));
    setData(prev => ({ 
      ...prev, 
      attendance: [...prev.attendance, ...newAttendanceList] 
    }));
  };

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

  const addSiteTransfer = (transfer: Omit<SiteTransfer, 'id' | 'createdAt'>) => {
    const newTransfer: SiteTransfer = {
      ...transfer,
      id: generateId(),
      createdAt: formatDate(new Date())
    };
    setData(prev => ({ ...prev, siteTransfers: [...prev.siteTransfers, newTransfer] }));
  };

  const addMaterialIssue = (issue: Omit<MaterialIssue, 'id' | 'createdAt'>) => {
    const newIssue: MaterialIssue = {
      ...issue,
      id: generateId(),
      createdAt: formatDate(new Date())
    };
    setData(prev => ({ ...prev, materialIssues: [...prev.materialIssues, newIssue] }));
  };

  const addMaterialReturn = (returnItem: Omit<MaterialReturn, 'id' | 'createdAt'>) => {
    const newReturn: MaterialReturn = {
      ...returnItem,
      id: generateId(),
      createdAt: formatDate(new Date())
    };
    setData(prev => ({ ...prev, materialReturns: [...prev.materialReturns, newReturn] }));
  };

  const addMaterialConsumption = (consumption: Omit<MaterialConsumption, 'id' | 'createdAt'>) => {
    const newConsumption: MaterialConsumption = {
      ...consumption,
      id: generateId(),
      createdAt: formatDate(new Date())
    };
    setData(prev => ({ ...prev, materialConsumptions: [...prev.materialConsumptions, newConsumption] }));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      createdAt: formatDate(new Date())
    };
    setData(prev => ({ ...prev, notifications: [...prev.notifications, newNotification] }));
  };

  const markNotificationAsRead = (id: string) => {
    setData(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    }));
  };

  const clearAllNotifications = () => {
    setData(prev => ({ ...prev, notifications: [] }));
  };

  const getDashboardStats = (): DashboardStats => {
    const totalProjects = data.projects.length;
    const activeProjects = data.projects.filter(p => p.status === 'active').length;
    const completedProjects = data.projects.filter(p => p.status === 'completed').length;
    const totalTasks = data.tasks.length;
    const pendingTasks = data.tasks.filter(t => t.status !== 'completed').length;
    const completedTasks = data.tasks.filter(t => t.status === 'completed').length;
    const totalIssues = data.issues.length;
    const openIssues = data.issues.filter(i => i.status === 'open').length;
    const highPriorityIssues = data.issues.filter(i => i.priority === 'high' || i.priority === 'urgent').length;
    const totalExpenses = data.pettyCash.reduce((sum, pc) => sum + pc.amount, 0);
    const monthlyExpenses = data.pettyCash
      .filter(pc => {
        const pcDate = new Date(pc.date);
        const now = new Date();
        return pcDate.getMonth() === now.getMonth() && pcDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, pc) => sum + pc.amount, 0);
    const attendanceRate = data.attendance.length > 0 
      ? (data.attendance.filter(a => a.status === 'present').length / data.attendance.length) * 100 
      : 0;
    const totalResources = data.resources.length;
    const allocatedResources = data.resources.filter(r => r.status === 'allocated' || r.status === 'in_use').length;
    const lowStockItems = data.inventory.filter(i => i.currentStock <= i.minThreshold).length;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      pendingTasks,
      completedTasks,
      totalIssues,
      openIssues,
      highPriorityIssues,
      totalExpenses,
      monthlyExpenses,
      attendanceRate,
      totalResources,
      allocatedResources,
      lowStockItems
    };
  };

  const getProjectTasks = (projectId: string) => {
    return data.tasks.filter(t => t.projectId === projectId);
  };

  const getProjectIssues = (projectId: string) => {
    return data.issues.filter(i => i.projectId === projectId);
  };

  const getProjectResources = (projectId: string) => {
    return data.resources.filter(r => r.projectId === projectId);
  };

  const getProjectPettyCash = (projectId: string) => {
    return data.pettyCash.filter(pc => pc.projectId === projectId);
  };

  const getProjectAttendance = (projectId: string) => {
    return data.attendance.filter(a => a.projectId === projectId);
  };

  const addUser = (user: Omit<User, 'id'>) => {
    const newUser: User = {
      ...user,
      id: generateId()
    };
    setData(prev => ({ ...prev, users: [...prev.users, newUser] }));
  };

  const updateUser = (id: string, user: Partial<User>) => {
    setData(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === id ? { ...u, ...user } : u)
    }));
  };

  const deleteUser = (id: string) => {
    setData(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== id)
    }));
  };

  const value: DataContextType = {
    ...data,
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
    bulkUploadAttendance,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addSiteTransfer,
    addMaterialIssue,
    addMaterialReturn,
    addMaterialConsumption,
    addNotification,
    markNotificationAsRead,
    clearAllNotifications,
    getDashboardStats,
    getProjectTasks,
    getProjectIssues,
    getProjectResources,
    getProjectPettyCash,
    getProjectAttendance,
    addUser,
    updateUser,
    deleteUser
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
