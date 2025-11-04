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
const generateEmptyData = (): DataContextType => {
  return {
    // Data
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
    users: [],
    
    // Project actions
    addProject: () => {},
    updateProject: () => {},
    deleteProject: () => {},
    
    // Task actions
    addTask: () => {},
    updateTask: () => {},
    deleteTask: () => {},
    addTaskComment: () => {},
    
    // Issue actions
    addIssue: () => {},
    updateIssue: () => {},
    deleteIssue: () => {},
    addIssueComment: () => {},
    
    // Resource actions
    addResource: () => {},
    updateResource: () => {},
    deleteResource: () => {},
    
    // Petty Cash actions
    addPettyCash: () => {},
    updatePettyCash: () => {},
    deletePettyCash: () => {},
    
    // Attendance actions
    addAttendance: () => {},
    updateAttendance: () => {},
    deleteAttendance: () => {},
    
    // Inventory actions
    addInventoryItem: () => {},
    updateInventoryItem: () => {},
    deleteInventoryItem: () => {},
    
    // Site Transfer actions
    addSiteTransfer: () => {},
    updateSiteTransfer: () => {},
    deleteSiteTransfer: () => {},
    
    // Material Issue actions
    addMaterialIssue: () => {},
    updateMaterialIssue: () => {},
    deleteMaterialIssue: () => {},
    
    // Material Return actions
    addMaterialReturn: () => {},
    updateMaterialReturn: () => {},
    deleteMaterialReturn: () => {},
    
    // Material Consumption actions
    addMaterialConsumption: () => {},
    updateMaterialConsumption: () => {},
    deleteMaterialConsumption: () => {},
    
    // User actions
    addUser: () => {},
    updateUser: () => {},
    deleteUser: () => {},
    
    // Notification actions
    addNotification: () => {},
    markNotificationAsRead: () => {},
    deleteNotification: () => {},
    
    // Utility functions
    getDashboardStats: () => ({
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      totalIssues: 0,
      openIssues: 0,
      resolvedIssues: 0,
      totalResources: 0,
      allocatedResources: 0,
      availableResources: 0,
      totalAttendance: 0,
      presentToday: 0,
      attendanceRate: 0,
      totalInventory: 0,
      lowStockItems: 0,
      totalPettyCash: 0,
      pendingApprovals: 0,
      highPriorityIssues: 0,
      totalExpenses: 0,
      monthlyExpenses: 0
    })
  };
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<DataContextType>(() => generateEmptyData());

  // Load data from API and localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Loading data from API...');
        // Try to load projects, tasks, issues, attendance, and resources from API first
        const [projectsResponse, tasksResponse, issuesResponse, attendanceResponse, resourcesResponse, pettyCashResponse, commercialResponse, usersResponse] = await Promise.all([
          apiService.getProjects(),
          apiService.getTasks(),
          apiService.getIssues(),
          apiService.getAttendance(),
          apiService.getResources(),
          apiService.getPettyCashEntries(),
          apiService.getCommercialEntries(),
          apiService.getUsers()
        ]);
        
        console.log('📊 API Responses:', {
          projects: projectsResponse,
          tasks: tasksResponse,
          issues: issuesResponse,
          attendance: attendanceResponse,
          resources: resourcesResponse,
          pettyCash: pettyCashResponse,
          commercial: commercialResponse,
          users: usersResponse
        });
        
        const projects = (projectsResponse as any).data || projectsResponse;
        const tasks = (tasksResponse as any).data || tasksResponse;
        const issues = (issuesResponse as any).data || issuesResponse;
        const attendance = (attendanceResponse as any).data || attendanceResponse;
        const resources = (resourcesResponse as any).data || resourcesResponse;
        const pettyCash = (pettyCashResponse as any).data || pettyCashResponse;
        const commercial = (commercialResponse as any).data || commercialResponse;
        const users = (usersResponse as any).data || usersResponse;
        
        setData(prev => ({
          ...prev,
          projects: projects.map((p: any) => ({
            ...p,
            id: p._id || p.id,
            createdAt: new Date(p.createdAt || Date.now()),
            updatedAt: new Date(p.updatedAt || Date.now())
          })),
          tasks: tasks.map((t: any) => ({
            ...t,
            id: t._id || t.id,
            projectId: t.projectId?._id || t.projectId || t.projectId,
            assignedTo: t.assignedTo?._id || t.assignedTo || t.assignedTo,
            attachments: t.attachments || [], // Ensure attachments array is preserved
            createdAt: new Date(t.createdAt || Date.now()),
            updatedAt: new Date(t.updatedAt || Date.now()),
            comments: t.comments || []
          })),
          issues: issues.map((i: any) => ({
            ...i,
            id: i._id || i.id,
            projectId: i.projectId?._id || i.projectId || i.projectId,
            assignedTo: i.assignedTo?._id || i.assignedTo || i.assignedTo,
            reportedBy: i.reportedBy?._id || i.reportedBy || i.reportedBy,
            dueDate: i.dueDate ? new Date(i.dueDate) : new Date(),
            createdAt: new Date(i.createdAt || Date.now()),
            updatedAt: new Date(i.updatedAt || Date.now()),
            comments: i.comments || []
          })),
          attendance: attendance.map((a: any) => ({
            ...a,
            id: a._id || a.id,
            projectId: a.projectId?._id || a.projectId || a.projectId,
            employeeId: a.employeeId?._id || a.employeeId || a.employeeId,
            createdAt: new Date(a.createdAt || Date.now()),
            updatedAt: new Date(a.updatedAt || Date.now())
          })),
          resources: resources.map((r: any) => ({
            ...r,
            id: r._id || r.id,
            name: r.name,
            type: r.type === 'other' ? 'labor' : r.type, // Map 'other' to 'labor' for frontend
            quantity: r.quantity || 0,
            allocatedQuantity: r.allocatedQuantity || 0, // Calculate allocated from status
            status: r.status === 'out_of_order' ? 'maintenance' : r.status, // Map status
            projectId: r.projectId?._id || r.projectId || r.projectId,
            unit: r.unit || 'unit',
            cost: r.costPerUnit || r.cost || 0,
            createdAt: new Date(r.createdAt || Date.now()),
            updatedAt: new Date(r.updatedAt || Date.now())
          })),
          pettyCash: pettyCash.map((pc: any) => ({
            ...pc,
            id: pc._id || pc.id,
            date: pc.requestDate ? formatDate(new Date(pc.requestDate)) : formatDate(new Date(pc.date || Date.now())),
            amount: pc.amount || 0,
            projectId: pc.projectId?._id || pc.projectId || pc.projectId,
            paidTo: pc.requestedBy?.name || pc.paidTo || '',
            category: pc.category || 'other',
            description: pc.description || '',
            attachment: pc.receiptImage || pc.attachment || '',
            createdAt: formatDate(new Date(pc.createdAt || Date.now())),
            updatedAt: formatDate(new Date(pc.updatedAt || Date.now()))
          })),
          users: users.map((u: any) => ({
            ...u,
            id: u._id || u.id,
            createdAt: formatDate(new Date(u.createdAt || Date.now())),
            updatedAt: formatDate(new Date(u.updatedAt || Date.now()))
          }))
        }));
      } catch (error) {
        console.error('❌ Failed to load data from API:', error);
        console.log('🔄 Falling back to localStorage...');
        // Fallback to localStorage
        const savedData = localStorage.getItem('construction-management-data');
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            console.log('📦 Loaded data from localStorage:', parsedData);
            setData(parsedData);
          } catch (error) {
            console.error('Error loading saved data:', error);
          }
        } else {
          console.log('📭 No saved data found in localStorage');
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
        ...(response as any).data,
        id: (response as any).data._id || (response as any).data.id,
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
          p.id === id ? { ...p, ...(response as any).data, updatedAt: formatDate(new Date()) } : p
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
        ...(response as any).data,
        id: (response as any).data._id || (response as any).data.id,
        attachments: (response as any).data.attachments || [],
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
        attachments: task.attachments || [],
        createdAt: formatDate(new Date()),
        updatedAt: formatDate(new Date()),
        comments: []
      };
      setData(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
    }
  };

  const updateTask = async (id: string, task: Partial<Task>) => {
    try {
      const response = await apiService.updateTask(id, task);
      setData(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => 
          t.id === id ? { 
            ...t, 
            ...(response as any).data, 
            attachments: (response as any).data.attachments || t.attachments,
            updatedAt: formatDate(new Date()) 
          } : t
        )
      }));
    } catch (error) {
      console.error('Failed to update task:', error);
      // Fallback to localStorage if API fails
      setData(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => 
          t.id === id ? { ...t, ...task, updatedAt: formatDate(new Date()) } : t
        )
      }));
    }
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
        ...(response as any).data,
        id: (response as any).data._id || (response as any).data.id,
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
  const addResource = async (resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Map frontend fields to backend format
      const resourceData = {
        name: resource.name,
        type: resource.type === 'labor' ? 'other' : resource.type,
        category: resource.type || 'general',
        description: '',
        quantity: resource.quantity || 0,
        unit: resource.unit || 'unit',
        costPerUnit: resource.cost || 0,
        supplier: '',
        location: '',
        status: resource.status || 'available',
        projectId: resource.projectId || undefined,
        purchaseDate: new Date(),
        notes: ''
      };

      const response = await apiService.createResource(resourceData);
      const newResource: Resource = {
        ...(response as any).data,
        id: (response as any).data._id || (response as any).data.id,
        type: (response as any).data.type === 'other' ? 'labor' : (response as any).data.type,
        allocatedQuantity: (response as any).data.allocatedQuantity || 0,
        status: (response as any).data.status === 'out_of_order' ? 'maintenance' : (response as any).data.status,
        cost: (response as any).data.costPerUnit || (response as any).data.cost || 0,
        projectId: (response as any).data.projectId?._id || (response as any).data.projectId || (response as any).data.projectId,
        createdAt: formatDate(new Date()),
        updatedAt: formatDate(new Date())
      };
      setData(prev => ({ ...prev, resources: [...prev.resources, newResource] }));
    } catch (error) {
      console.error('Failed to create resource:', error);
      // Fallback to localStorage if API fails
      const newResource: Resource = {
        ...resource,
        id: generateId(),
        createdAt: formatDate(new Date()),
        updatedAt: formatDate(new Date())
      };
      setData(prev => ({ ...prev, resources: [...prev.resources, newResource] }));
    }
  };

  const updateResource = async (id: string, resource: Partial<Resource>) => {
    try {
      // Map frontend fields to backend format
      const updateData: any = {};
      if (resource.name !== undefined) updateData.name = resource.name;
      if (resource.type !== undefined) {
        updateData.type = resource.type === 'labor' ? 'other' : resource.type;
      }
      if (resource.quantity !== undefined) updateData.quantity = resource.quantity;
      if (resource.unit !== undefined) updateData.unit = resource.unit;
      if (resource.cost !== undefined) updateData.costPerUnit = resource.cost;
      if (resource.status !== undefined) {
        updateData.status = resource.status === 'retired' ? 'out_of_order' : resource.status;
      }
      if (resource.projectId !== undefined) updateData.projectId = resource.projectId;

      const response = await apiService.updateResource(id, updateData);
      setData(prev => ({
        ...prev,
        resources: prev.resources.map(r => {
          if (r.id === id) {
            const updated = (response as any).data;
            return {
              ...r,
              ...updated,
              id: updated._id || updated.id || r.id,
              type: updated.type === 'other' ? 'labor' : updated.type,
              allocatedQuantity: updated.allocatedQuantity || r.allocatedQuantity || 0,
              status: updated.status === 'out_of_order' ? 'maintenance' : updated.status,
              cost: updated.costPerUnit || updated.cost || r.cost,
              projectId: updated.projectId?._id || updated.projectId || updated.projectId,
              updatedAt: formatDate(new Date())
            };
          }
          return r;
        })
      }));
    } catch (error) {
      console.error('Failed to update resource:', error);
      // Fallback to localStorage if API fails
      setData(prev => ({
        ...prev,
        resources: prev.resources.map(r => 
          r.id === id ? { ...r, ...resource, updatedAt: formatDate(new Date()) } : r
        )
      }));
    }
  };

  const deleteResource = async (id: string) => {
    try {
      await apiService.deleteResource(id);
      setData(prev => ({
        ...prev,
        resources: prev.resources.filter(r => r.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete resource:', error);
      // Fallback to localStorage if API fails
      setData(prev => ({
        ...prev,
        resources: prev.resources.filter(r => r.id !== id)
      }));
    }
  };

  // Petty Cash actions
  const addPettyCash = async (pettyCash: Omit<PettyCash, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Map frontend fields to backend format
      const pettyCashData = {
        projectId: pettyCash.projectId,
        amount: pettyCash.amount,
        description: pettyCash.description || '',
        category: pettyCash.category || 'other',
        date: pettyCash.date,
        paidTo: pettyCash.paidTo || '',
        attachment: pettyCash.attachment || ''
      };

      const response = await apiService.createPettyCashEntry(pettyCashData);
      const newPettyCash: PettyCash = {
        ...(response as any).data,
        id: (response as any).data._id || (response as any).data.id,
        date: (response as any).data.requestDate ? formatDate(new Date((response as any).data.requestDate)) : formatDate(new Date((response as any).data.date || Date.now())),
        projectId: (response as any).data.projectId?._id || (response as any).data.projectId || (response as any).data.projectId,
        paidTo: (response as any).data.requestedBy?.name || (response as any).data.paidTo || '',
        attachment: (response as any).data.receiptImage || (response as any).data.attachment || '',
        createdAt: formatDate(new Date()),
        updatedAt: formatDate(new Date())
      };
      setData(prev => ({ ...prev, pettyCash: [...prev.pettyCash, newPettyCash] }));
    } catch (error) {
      console.error('Failed to create petty cash entry:', error);
      // Fallback to localStorage if API fails
      const newPettyCash: PettyCash = {
        ...pettyCash,
        id: generateId(),
        createdAt: formatDate(new Date()),
        updatedAt: formatDate(new Date())
      };
      setData(prev => ({ ...prev, pettyCash: [...prev.pettyCash, newPettyCash] }));
    }
  };

  const updatePettyCash = async (id: string, pettyCash: Partial<PettyCash>) => {
    try {
      // Map frontend fields to backend format
      const updateData: any = {};
      if (pettyCash.projectId !== undefined) updateData.projectId = pettyCash.projectId;
      if (pettyCash.amount !== undefined) updateData.amount = pettyCash.amount;
      if (pettyCash.description !== undefined) updateData.description = pettyCash.description;
      if (pettyCash.category !== undefined) updateData.category = pettyCash.category;
      if (pettyCash.date !== undefined) updateData.date = pettyCash.date;
      if (pettyCash.paidTo !== undefined) updateData.requestedBy = pettyCash.paidTo;
      if (pettyCash.attachment !== undefined) updateData.receiptImage = pettyCash.attachment;

      const response = await apiService.updatePettyCashEntry(id, updateData);
      setData(prev => ({
        ...prev,
        pettyCash: prev.pettyCash.map(pc => {
          if (pc.id === id) {
            const updated = (response as any).data;
            return {
              ...pc,
              ...updated,
              id: updated._id || updated.id || pc.id,
              date: updated.requestDate ? formatDate(new Date(updated.requestDate)) : updated.date ? formatDate(new Date(updated.date)) : pc.date,
              projectId: updated.projectId?._id || updated.projectId || updated.projectId,
              paidTo: updated.requestedBy?.name || updated.paidTo || pc.paidTo,
              attachment: updated.receiptImage || updated.attachment || pc.attachment,
              updatedAt: formatDate(new Date())
            };
          }
          return pc;
        })
      }));
    } catch (error) {
      console.error('Failed to update petty cash entry:', error);
      // Fallback to localStorage if API fails
      setData(prev => ({
        ...prev,
        pettyCash: prev.pettyCash.map(pc => 
          pc.id === id ? { ...pc, ...pettyCash, updatedAt: formatDate(new Date()) } : pc
        )
      }));
    }
  };

  const deletePettyCash = async (id: string) => {
    try {
      await apiService.deletePettyCashEntry(id);
      setData(prev => ({
        ...prev,
        pettyCash: prev.pettyCash.filter(pc => pc.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete petty cash entry:', error);
      // Fallback to localStorage if API fails
      setData(prev => ({
        ...prev,
        pettyCash: prev.pettyCash.filter(pc => pc.id !== id)
      }));
    }
  };

  // Attendance actions
  const addAttendance = async (attendance: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await apiService.createAttendance(attendance);
        const newAttendance: Attendance = {
          ...(response as any).data,
          id: (response as any).data._id || (response as any).data.id,
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
            a.id === id ? { ...a, ...(response as any).data, updatedAt: new Date() } : a
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
  const addSiteTransfer = (transfer: Omit<SiteTransfer, 'id' | 'createdAt'>) => {
    const newTransfer: SiteTransfer = {
      ...transfer,
      id: generateId(),
      createdAt: formatDate(new Date())
    };
    setData(prev => ({ ...prev, siteTransfers: [...prev.siteTransfers, newTransfer] }));
  };

  const updateSiteTransfer = (id: string, transfer: Partial<SiteTransfer>) => {
    setData(prev => ({
      ...prev,
      siteTransfers: prev.siteTransfers.map(st => 
        st.id === id ? { ...st, ...transfer } : st
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
  const addMaterialIssue = (issue: Omit<MaterialIssue, 'id' | 'createdAt'>) => {
    const newIssue: MaterialIssue = {
      ...issue,
      id: generateId(),
      createdAt: formatDate(new Date())
    };
    setData(prev => ({ ...prev, materialIssues: [...prev.materialIssues, newIssue] }));
  };

  const updateMaterialIssue = (id: string, issue: Partial<MaterialIssue>) => {
    setData(prev => ({
      ...prev,
      materialIssues: prev.materialIssues.map(mi => 
        mi.id === id ? { ...mi, ...issue } : mi
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
  const addMaterialReturn = (returnItem: Omit<MaterialReturn, 'id' | 'createdAt'>) => {
    const newReturn: MaterialReturn = {
      ...returnItem,
      id: generateId(),
      createdAt: formatDate(new Date())
    };
    setData(prev => ({ ...prev, materialReturns: [...prev.materialReturns, newReturn] }));
  };

  const updateMaterialReturn = (id: string, returnItem: Partial<MaterialReturn>) => {
    setData(prev => ({
      ...prev,
      materialReturns: prev.materialReturns.map(mr => 
        mr.id === id ? { ...mr, ...returnItem } : mr
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
  const addMaterialConsumption = (consumption: Omit<MaterialConsumption, 'id' | 'createdAt'>) => {
    const newConsumption: MaterialConsumption = {
      ...consumption,
      id: generateId(),
      createdAt: formatDate(new Date())
    };
    setData(prev => ({ ...prev, materialConsumptions: [...prev.materialConsumptions, newConsumption] }));
  };

  const updateMaterialConsumption = (id: string, consumption: Partial<MaterialConsumption>) => {
    setData(prev => ({
      ...prev,
      materialConsumptions: prev.materialConsumptions.map(mc => 
        mc.id === id ? { ...mc, ...consumption } : mc
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
  const addUser = async (user: Omit<User, 'id'>) => {
    try {
      const response = await apiService.createUser(user);
      const newUser: User = {
        ...(response as any).data,
        id: (response as any).data._id || (response as any).data.id,
        createdAt: formatDate(new Date()),
        updatedAt: formatDate(new Date())
      };
      setData(prev => ({ ...prev, users: [...prev.users, newUser] }));
    } catch (error) {
      console.error('Failed to create user:', error);
      // Fallback to localStorage if API fails
      const newUser: User = {
        ...user,
        id: generateId()
      };
      setData(prev => ({ ...prev, users: [...prev.users, newUser] }));
    }
  };

  const updateUser = async (id: string, user: Partial<User>) => {
    try {
      const response = await apiService.updateUser(id, user);
      setData(prev => ({
        ...prev,
        users: prev.users.map(u => 
          u.id === id ? { 
            ...u, 
            ...(response as any).data, 
            id: (response as any).data._id || (response as any).data.id || u.id,
            updatedAt: formatDate(new Date()) 
          } : u
        )
      }));
    } catch (error) {
      console.error('Failed to update user:', error);
      // Fallback to localStorage if API fails
      setData(prev => ({
        ...prev,
        users: prev.users.map(u => 
          u.id === id ? { ...u, ...user } : u
        )
      }));
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await apiService.deleteUser(id);
      setData(prev => ({
        ...prev,
        users: prev.users.filter(u => u.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete user:', error);
      // Fallback to localStorage if API fails
      setData(prev => ({
        ...prev,
        users: prev.users.filter(u => u.id !== id)
      }));
    }
  };

  // Notification actions
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