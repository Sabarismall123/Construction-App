import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
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
  updateIssue: (id: string, issue: Partial<Issue>) => Promise<void>;
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
  clearAllNotifications: () => void;
  
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
    updateIssue: async () => {},
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
        const [projectsResponse, tasksResponse, issuesResponse, attendanceResponse, resourcesResponse, pettyCashResponse, commercialResponse, usersResponse, inventoryResponse, materialIssuesResponse, materialReturnsResponse, materialConsumptionsResponse] = await Promise.all([
          apiService.getProjects(),
          apiService.getTasks(),
          apiService.getIssues(),
          apiService.getAttendance(),
          apiService.getResources(),
          apiService.getPettyCashEntries(),
          apiService.getCommercialEntries(),
          apiService.getUsers(),
          apiService.getInventoryItems(),
          apiService.getMaterialIssues(),
          apiService.getMaterialReturns(),
          apiService.getMaterialConsumptions()
        ]);
        
        console.log('📊 API Responses:', {
          projects: projectsResponse,
          tasks: tasksResponse,
          issues: issuesResponse,
          attendance: attendanceResponse,
          resources: resourcesResponse,
          pettyCash: pettyCashResponse,
          commercial: commercialResponse,
          users: usersResponse,
          inventory: inventoryResponse,
          materialIssues: materialIssuesResponse,
          materialReturns: materialReturnsResponse,
          materialConsumptions: materialConsumptionsResponse
        });
        
        const projects = (projectsResponse as any).data || projectsResponse;
        const tasks = (tasksResponse as any).data || tasksResponse;
        const issues = (issuesResponse as any).data || issuesResponse;
        const attendance = (attendanceResponse as any).data || attendanceResponse;
        const resources = (resourcesResponse as any).data || resourcesResponse;
        const pettyCash = (pettyCashResponse as any).data || pettyCashResponse;
        const commercial = (commercialResponse as any).data || commercialResponse;
        const users = (usersResponse as any).data || usersResponse;
        const inventory = (inventoryResponse as any).data || inventoryResponse;
        const materialIssues = (materialIssuesResponse as any).data || materialIssuesResponse;
        const materialReturns = (materialReturnsResponse as any).data || materialReturnsResponse;
        const materialConsumptions = (materialConsumptionsResponse as any).data || materialConsumptionsResponse;
        
        setData(prev => ({
          ...prev,
          projects: projects.map((p: any) => ({
            ...p,
            id: p._id || p.id,
            startDate: p.startDate ? (typeof p.startDate === 'string' ? p.startDate : formatDate(new Date(p.startDate), 'yyyy-MM-dd')) : formatDate(new Date(), 'yyyy-MM-dd'),
            endDate: p.endDate ? (typeof p.endDate === 'string' ? p.endDate : formatDate(new Date(p.endDate), 'yyyy-MM-dd')) : formatDate(new Date(), 'yyyy-MM-dd'),
            createdAt: p.createdAt ? formatDate(new Date(p.createdAt), 'MMM dd, yyyy') : formatDate(new Date(), 'MMM dd, yyyy'),
            updatedAt: p.updatedAt ? formatDate(new Date(p.updatedAt), 'MMM dd, yyyy') : formatDate(new Date(), 'MMM dd, yyyy')
          })),
          tasks: tasks.map((t: any) => ({
            ...t,
            id: t._id || t.id,
            projectId: t.projectId?._id || t.projectId || t.projectId,
            assignedTo: t.assignedTo?._id || t.assignedTo || t.assignedTo,
            createdBy: t.createdBy?._id || t.createdBy || t.createdBy,
            createdByName: t.createdByName || t.createdBy?.name || 'System',
            createdByRole: t.createdByRole || t.createdBy?.role || '',
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
          attendance: attendance.map((a: any) => {
            const projectId = a.projectId?._id || a.projectId || a.projectId;
            const project = Array.isArray(projects) ? projects.find((p: any) => 
              ((p._id || p.id)?.toString()) === (projectId?.toString())
            ) : null;
            
            // Map attachments - handle both populated objects and IDs
            const mappedAttachments = (a.attachments || []).map((attachment: any) => {
              if (typeof attachment === 'object' && (attachment._id || attachment.id)) {
                // Attachment is a populated object, return the ID
                return attachment._id || attachment.id;
              } else if (typeof attachment === 'string') {
                // Attachment is already an ID string
                return attachment;
              }
              return attachment;
            });
            
            return {
              ...a,
              id: a._id || a.id,
              projectId: projectId,
              projectName: a.projectName || a.projectId?.name || project?.name || 'Unknown Project',
              employeeId: a.employeeId?._id || a.employeeId || a.employeeId,
              employeeName: a.employeeName || a.employeeId?.name || '',
              mobileNumber: a.mobileNumber || a.employeeId?.mobileNumber || '',
              labourType: a.labourType || '',
              attachments: mappedAttachments, // Map attachments to IDs
              createdAt: new Date(a.createdAt || Date.now()),
              updatedAt: new Date(a.updatedAt || Date.now())
            };
          }),
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
          })),
          inventory: inventory.map((i: any) => ({
            ...i,
            id: i._id || i.id,
            createdAt: formatDate(new Date(i.createdAt || Date.now())),
            updatedAt: formatDate(new Date(i.updatedAt || Date.now()))
          })),
          materialIssues: materialIssues.map((mi: any) => ({
            ...mi,
            id: mi._id || mi.id,
            projectId: mi.projectId?._id || mi.projectId || mi.projectId,
            taskId: mi.taskId?._id || mi.taskId || mi.taskId,
            materialId: mi.materialId?._id || mi.materialId || mi.materialId,
            issuedBy: mi.issuedBy?._id || mi.issuedBy || mi.issuedBy,
            issuedDate: mi.issuedDate ? formatDate(new Date(mi.issuedDate), 'yyyy-MM-dd') : formatDate(new Date(), 'yyyy-MM-dd'),
            createdAt: formatDate(new Date(mi.createdAt || Date.now()))
          })),
          materialReturns: materialReturns.map((mr: any) => ({
            ...mr,
            id: mr._id || mr.id,
            projectId: mr.projectId?._id || mr.projectId || mr.projectId,
            taskId: mr.taskId?._id || mr.taskId || mr.taskId,
            materialId: mr.materialId?._id || mr.materialId || mr.materialId,
            returnedBy: mr.returnedBy?._id || mr.returnedBy || mr.returnedBy,
            returnDate: mr.returnDate ? formatDate(new Date(mr.returnDate), 'yyyy-MM-dd') : formatDate(new Date(), 'yyyy-MM-dd'),
            createdAt: formatDate(new Date(mr.createdAt || Date.now()))
          })),
          materialConsumptions: materialConsumptions.map((mc: any) => ({
            ...mc,
            id: mc._id || mc.id,
            projectId: mc.projectId?._id || mc.projectId || mc.projectId,
            taskId: mc.taskId?._id || mc.taskId || mc.taskId,
            materialId: mc.materialId?._id || mc.materialId || mc.materialId,
            recordedBy: mc.recordedBy?._id || mc.recordedBy || mc.recordedBy,
            consumptionDate: mc.consumptionDate ? formatDate(new Date(mc.consumptionDate), 'yyyy-MM-dd') : formatDate(new Date(), 'yyyy-MM-dd'),
            createdAt: formatDate(new Date(mc.createdAt || Date.now()))
          }))
        }));
      } catch (error: any) {
        console.error('❌ Failed to load data from API:', error);
        console.error('Error details:', {
          message: error?.message,
          stack: error?.stack,
          hostname: window.location.hostname,
          userAgent: navigator.userAgent,
          apiUrl: import.meta.env.VITE_API_URL || 'NOT SET'
        });
        
        // Show error message on mobile
        if (window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          console.warn('📱 Mobile device detected - API might not be configured correctly');
          console.warn('📱 Make sure VITE_API_URL is set in Vercel environment variables');
          console.warn('📱 Current API URL:', import.meta.env.VITE_API_URL || 'NOT SET - Using default');
        }
        
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
      console.log('📝 Creating project:', project);
      const response = await apiService.createProject(project);
      console.log('✅ Project created successfully:', response);
      
      const responseData = (response as any).data || response;
      const newProject: Project = {
        ...responseData,
        id: responseData._id || responseData.id,
        startDate: responseData.startDate ? (typeof responseData.startDate === 'string' ? responseData.startDate : formatDate(new Date(responseData.startDate), 'yyyy-MM-dd')) : project.startDate,
        endDate: responseData.endDate ? (typeof responseData.endDate === 'string' ? responseData.endDate : formatDate(new Date(responseData.endDate), 'yyyy-MM-dd')) : project.endDate,
        createdAt: responseData.createdAt ? formatDate(new Date(responseData.createdAt), 'MMM dd, yyyy') : formatDate(new Date(), 'MMM dd, yyyy'),
        updatedAt: responseData.updatedAt ? formatDate(new Date(responseData.updatedAt), 'MMM dd, yyyy') : formatDate(new Date(), 'MMM dd, yyyy')
      };
      
      console.log('📦 Adding project to state:', newProject);
      setData(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
      
      // Refresh projects list to ensure consistency - wait longer for database write
      setTimeout(async () => {
        try {
          console.log('🔄 Refreshing projects list...');
          const projectsResponse = await apiService.getProjects();
          const projects = (projectsResponse as any).data || projectsResponse;
          console.log('📊 Refreshed projects:', projects);
          setData(prev => ({
            ...prev,
            projects: projects.map((p: any) => ({
              ...p,
              id: p._id || p.id,
              startDate: p.startDate ? (typeof p.startDate === 'string' ? p.startDate : formatDate(new Date(p.startDate), 'yyyy-MM-dd')) : formatDate(new Date(), 'yyyy-MM-dd'),
              endDate: p.endDate ? (typeof p.endDate === 'string' ? p.endDate : formatDate(new Date(p.endDate), 'yyyy-MM-dd')) : formatDate(new Date(), 'yyyy-MM-dd'),
              createdAt: p.createdAt ? formatDate(new Date(p.createdAt), 'MMM dd, yyyy') : formatDate(new Date(), 'MMM dd, yyyy'),
              updatedAt: p.updatedAt ? formatDate(new Date(p.updatedAt), 'MMM dd, yyyy') : formatDate(new Date(), 'MMM dd, yyyy')
            }))
          }));
          console.log('✅ Projects list refreshed successfully');
        } catch (error) {
          console.error('❌ Failed to refresh projects:', error);
        }
      }, 1000);
    } catch (error) {
      console.error('❌ Failed to create project:', error);
      console.error('Error details:', error);
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
      console.log('✅ Task created response:', response);
      
      // Handle different response structures
      const responseData = (response as any).data || response;
      
      // Map the response to match the Task type structure
      const newTask: Task = {
        ...responseData,
        id: responseData._id || responseData.id,
        title: responseData.title || task.title,
        description: responseData.description || task.description,
        status: responseData.status || task.status,
        priority: responseData.priority || task.priority,
        dueDate: responseData.dueDate ? new Date(responseData.dueDate) : (task.dueDate ? new Date(task.dueDate) : new Date()),
        projectId: responseData.projectId?._id || responseData.projectId || task.projectId,
        // Ensure assignedTo is a string (not ObjectId) for consistent filtering
        assignedTo: (responseData.assignedTo?._id || responseData.assignedTo || task.assignedTo)?.toString(),
        createdBy: responseData.createdBy?._id || responseData.createdBy || task.createdBy || null,
        createdByName: responseData.createdByName || responseData.createdBy?.name || 'System',
        createdByRole: responseData.createdByRole || responseData.createdBy?.role || '',
        attachments: responseData.attachments || task.attachments || [],
        createdAt: responseData.createdAt ? new Date(responseData.createdAt) : new Date(),
        updatedAt: responseData.updatedAt ? new Date(responseData.updatedAt) : new Date(),
        comments: responseData.comments || []
      };
      
      console.log('✅ Mapped task assignedTo:', {
        original: responseData.assignedTo,
        mapped: newTask.assignedTo,
        type: typeof newTask.assignedTo
      });
      
      console.log('📝 Adding task to state:', newTask);
      console.log('📊 Current tasks count before add:', data.tasks.length);
      
      // Add task to state
      setData(prev => {
        const updatedTasks = [...prev.tasks, newTask];
        console.log('📊 Updated tasks count after add:', updatedTasks.length);
        return { ...prev, tasks: updatedTasks };
      });
      
      // Create notification for the assigned user
      const assignedUserId = newTask.assignedTo;
      const createdByName = newTask.createdByName || 'System';
      const createdByRole = newTask.createdByRole || '';
      const roleLabel = createdByRole ? ` (${createdByRole.charAt(0).toUpperCase() + createdByRole.slice(1)})` : '';
      
      if (assignedUserId) {
        addNotification({
          title: 'New Task Assigned',
          message: `Task "${newTask.title}" is assigned from ${createdByName}${roleLabel}`,
          type: 'info',
          read: false,
          userId: assignedUserId.toString()
        });
      }
      
      return newTask; // Return the created task
    } catch (error) {
      console.error('❌ Failed to create task:', error);
      toast.error('Failed to create task. Please try again.');
      throw error; // Re-throw so TaskForm can handle it
    }
  };

  const updateTask = async (id: string, task: Partial<Task>) => {
    try {
      const response = await apiService.updateTask(id, task);
      const responseData = (response as any).data || response;
      
      // Properly map the response to ensure assignedTo is preserved
      const updatedTask = {
        ...responseData,
        id: responseData._id || responseData.id || id,
        projectId: responseData.projectId?._id || responseData.projectId || task.projectId,
        // Ensure assignedTo is properly extracted and converted to string
        assignedTo: (responseData.assignedTo?._id || responseData.assignedTo || task.assignedTo)?.toString(),
        createdBy: responseData.createdBy?._id || responseData.createdBy || task.createdBy,
        createdByName: responseData.createdByName || responseData.createdBy?.name || task.createdByName,
        createdByRole: responseData.createdByRole || responseData.createdBy?.role || task.createdByRole,
        attachments: responseData.attachments || task.attachments || [],
        comments: responseData.comments || task.comments || [],
        updatedAt: formatDate(new Date())
      };
      
      setData(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => 
          t.id === id ? { ...t, ...updatedTask } : t
        )
      }));
      
      console.log('✅ Task updated successfully:', updatedTask);
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task. Please try again.');
      // Fallback to localStorage if API fails
      setData(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => 
          t.id === id ? { 
            ...t, 
            ...task, 
            assignedTo: task.assignedTo?.toString() || t.assignedTo,
            updatedAt: formatDate(new Date()) 
          } : t
        )
      }));
    }
  };

  const deleteTask = async (id: string) => {
    try {
      // Call API to delete from database
      await apiService.deleteTask(id);
      
      // Remove from local state
      setData(prev => ({
        ...prev,
        tasks: prev.tasks.filter(t => t.id !== id)
      }));
      
      // Show success message
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task. Please try again.');
      // Don't remove from local state if API call failed
    }
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

  // Helper function to notify all managers
  const notifyAllManagers = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const managers = data.users.filter(u => u.role === 'manager' || u.role === 'admin');
    managers.forEach(manager => {
      addNotification({
        title: title,
        message: message,
        type: type,
        read: false,
        userId: manager.id
      });
    });
    console.log(`✅ Notifications sent to ${managers.length} manager(s): ${message}`);
  };

  // Issue actions
  const addIssue = async (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => {
    try {
      const response = await apiService.createIssue(issue);
      const responseData = (response as any).data || response;
      
      const newIssue: Issue = {
        ...responseData,
        id: responseData._id || responseData.id,
        projectId: responseData.projectId?._id || responseData.projectId || issue.projectId,
        assignedTo: (responseData.assignedTo?._id || responseData.assignedTo || issue.assignedTo)?.toString(),
        reportedBy: responseData.reportedBy?._id || responseData.reportedBy || issue.reportedBy,
        reportedByName: responseData.reportedByName || responseData.reportedBy?.name || 'System',
        dueDate: responseData.dueDate ? new Date(responseData.dueDate) : (issue.dueDate ? new Date(issue.dueDate) : new Date()),
        createdAt: formatDate(new Date()),
        updatedAt: formatDate(new Date()),
        comments: []
      };
      setData(prev => ({ ...prev, issues: [...prev.issues, newIssue] }));
      
      // Notify all managers when an issue is created (especially by employees)
      const issueWithReporter = responseData || issue;
      const reporterName = issueWithReporter.reportedByName || issueWithReporter.reportedBy?.name || 'An employee';
      const projectName = data.projects.find(p => p.id === issue.projectId)?.name || 'a project';
      notifyAllManagers(
        'New Issue Reported',
        `${reporterName} reported a new issue: "${issue.title}" in project "${projectName}"`,
        'warning'
      );
      
      // If issue is assigned to a user, notify that user
      const assignedToId = newIssue.assignedTo?.toString();
      if (assignedToId) {
        const assignedUser = data.users.find(u => {
          const userId = u.id?.toString() || u._id?.toString() || u.id;
          return userId === assignedToId;
        });
        
        if (assignedUser) {
          // Ensure userId is a string for consistent comparison
          const userId = assignedUser.id?.toString() || (assignedUser as any)._id?.toString() || assignedUser.id;
          
          addNotification({
            title: 'New Issue Assigned',
            message: `Issue "${issue.title}" has been assigned to you in project "${projectName}"`,
            type: 'info',
            read: false,
            userId: userId
          });
          console.log(`✅ Notification sent to ${assignedUser.name} (ID: ${userId}): Issue assigned`);
        } else {
          // If user not found, still send notification with the ID
          addNotification({
            title: 'New Issue Assigned',
            message: `Issue "${issue.title}" has been assigned to you in project "${projectName}"`,
            type: 'info',
            read: false,
            userId: assignedToId
          });
          console.log(`✅ Notification sent to user (ID: ${assignedToId}): Issue assigned`);
        }
      }
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
      
      // Notify managers even if API fails
      const projectName = data.projects.find(p => p.id === issue.projectId)?.name || 'a project';
      notifyAllManagers(
        'New Issue Reported',
        `An employee reported a new issue: "${issue.title}" in project "${projectName}"`,
        'warning'
      );
      
      // If issue is assigned to a user, notify that user (even if API fails)
      const assignedToId = issue.assignedTo?.toString();
      if (assignedToId) {
        const assignedUser = data.users.find(u => {
          const userId = u.id?.toString() || u._id?.toString() || u.id;
          return userId === assignedToId;
        });
        
        if (assignedUser) {
          // Ensure userId is a string for consistent comparison
          const userId = assignedUser.id?.toString() || (assignedUser as any)._id?.toString() || assignedUser.id;
          
          addNotification({
            title: 'New Issue Assigned',
            message: `Issue "${issue.title}" has been assigned to you in project "${projectName}"`,
            type: 'info',
            read: false,
            userId: userId
          });
          console.log(`✅ Notification sent to ${assignedUser.name} (ID: ${userId}): Issue assigned (fallback)`);
        } else {
          addNotification({
            title: 'New Issue Assigned',
            message: `Issue "${issue.title}" has been assigned to you in project "${projectName}"`,
            type: 'info',
            read: false,
            userId: assignedToId
          });
          console.log(`✅ Notification sent to user (ID: ${assignedToId}): Issue assigned (fallback)`);
        }
      }
    }
  };

  const updateIssue = async (id: string, issue: Partial<Issue>) => {
    try {
      // Get the current issue to check if assignedTo changed
      const currentIssue = data.issues.find(i => i.id === id);
      const oldAssignedTo = currentIssue?.assignedTo;
      const newAssignedTo = issue.assignedTo;
      
      const response = await apiService.updateIssue(id, issue);
      const responseData = (response as any).data || response;
      
      // Properly map the response to ensure assignedTo is preserved
      const updatedIssue = {
        ...responseData,
        id: responseData._id || responseData.id || id,
        projectId: responseData.projectId?._id || responseData.projectId || issue.projectId,
        // Ensure assignedTo is properly extracted and converted to string
        assignedTo: (responseData.assignedTo?._id || responseData.assignedTo || issue.assignedTo)?.toString(),
        reportedBy: responseData.reportedBy?._id || responseData.reportedBy || issue.reportedBy,
        reportedByName: responseData.reportedByName || responseData.reportedBy?.name || issue.reportedByName,
        attachments: responseData.attachments || issue.attachments || [],
        comments: responseData.comments || issue.comments || [],
        updatedAt: formatDate(new Date())
      };
      
      setData(prev => ({
        ...prev,
        issues: prev.issues.map(i => 
          i.id === id ? { ...i, ...updatedIssue } : i
        )
      }));
      
      // Check if assignedTo changed and send notification to the assigned user
      // Normalize both old and new assignedTo to strings for comparison
      const oldAssignedToStr = oldAssignedTo ? (
        typeof oldAssignedTo === 'string' ? oldAssignedTo : 
        (oldAssignedTo as any)?._id ? (oldAssignedTo as any)._id.toString() : 
        oldAssignedTo.toString()
      ) : '';
      
      const newAssignedToStr = updatedIssue.assignedTo ? (
        typeof updatedIssue.assignedTo === 'string' ? updatedIssue.assignedTo :
        (updatedIssue.assignedTo as any)?._id ? (updatedIssue.assignedTo as any)._id.toString() :
        updatedIssue.assignedTo.toString()
      ) : '';
      
      console.log('🔔 Issue assignment check:', {
        oldAssignedTo,
        newAssignedTo: issue.assignedTo,
        oldAssignedToStr,
        newAssignedToStr,
        changed: newAssignedToStr && newAssignedToStr !== oldAssignedToStr,
        currentIssue: currentIssue?.assignedTo,
        updatedIssueAssignedTo: updatedIssue.assignedTo
      });
      
      // Send notification if:
      // 1. New assignedTo exists and is different from old
      // 2. OR if old was empty/null and new has a value (new assignment)
      // Always send notification if newAssignedTo exists and is different from old
      const shouldNotify = newAssignedToStr && (
        !oldAssignedToStr || // New assignment (was unassigned)
        newAssignedToStr !== oldAssignedToStr // Changed assignment
      );
      
      console.log('🔔 Should notify?', {
        shouldNotify,
        newAssignedToStr,
        oldAssignedToStr,
        condition1: !oldAssignedToStr,
        condition2: newAssignedToStr !== oldAssignedToStr
      });
      
      if (shouldNotify) {
        // Issue was assigned to a new user
        const assignedUser = data.users.find(u => {
          const userId = u.id?.toString() || (u as any)._id?.toString() || u.id;
          const assignedToId = newAssignedToStr;
          return userId === assignedToId || userId?.toString() === assignedToId?.toString();
        });
        
        const issueTitle = updatedIssue.title || currentIssue?.title || 'an issue';
        // Try to get the current user from localStorage or use reportedByName
        let assignedByName = currentIssue?.reportedByName || 'Manager';
        try {
          const storedUser = localStorage.getItem('construction_user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            assignedByName = userData.name || assignedByName;
          }
        } catch (e) {
          // Ignore error, use default
        }
        
        console.log('🔔 Sending issue assignment notification:', {
          assignedUser,
          assignedToId: newAssignedToStr,
          issueTitle,
          assignedByName
        });
        
        if (assignedUser) {
          // Ensure userId is a string for consistent comparison
          const userId = assignedUser.id?.toString() || (assignedUser as any)._id?.toString() || assignedUser.id;
          
          addNotification({
            title: 'New Issue Assigned',
            message: `Issue "${issueTitle}" has been assigned to you by ${assignedByName}`,
            type: 'info',
            read: false,
            userId: userId
          });
          
          // Also show toast notification
          toast.success(`Issue assigned to ${assignedUser.name}`);
          console.log(`✅ Notification sent to ${assignedUser.name} (ID: ${userId}): Issue assigned`);
        } else {
          // If user not found, still send notification with the ID
          addNotification({
            title: 'New Issue Assigned',
            message: `Issue "${issueTitle}" has been assigned to you by ${assignedByName}`,
            type: 'info',
            read: false,
            userId: newAssignedToStr
          });
          console.log(`✅ Notification sent to user (ID: ${newAssignedToStr}): Issue assigned`);
        }
      }
      
      console.log('✅ Issue updated successfully:', updatedIssue);
    } catch (error) {
      console.error('Failed to update issue:', error);
      toast.error('Failed to update issue. Please try again.');
      // Fallback to localStorage if API fails
      setData(prev => ({
        ...prev,
        issues: prev.issues.map(i => 
          i.id === id ? { 
            ...i, 
            ...issue, 
            assignedTo: issue.assignedTo?.toString() || i.assignedTo,
            updatedAt: formatDate(new Date()) 
          } : i
        )
      }));
    }
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
      const responseData = (response as any).data || response;
      
      // Map attachments - handle both populated objects and IDs
      const responseAttachments = responseData.attachments || attendance.attachments || [];
      const mappedAttachments = responseAttachments.map((attachment: any) => {
        if (typeof attachment === 'object' && (attachment._id || attachment.id)) {
          // Attachment is a populated object, return the ID
          return attachment._id || attachment.id;
        } else if (typeof attachment === 'string') {
          // Attachment is already an ID string
          return attachment;
        }
        return attachment;
      });
      
      // Properly map the response to ensure projectId and projectName are preserved
      const newAttendance: Attendance = {
        ...responseData,
        id: responseData._id || responseData.id,
        projectId: responseData.projectId?._id || responseData.projectId || attendance.projectId,
        projectName: responseData.projectName || responseData.projectId?.name || 
                     data.projects.find(p => {
                       const projectId = responseData.projectId?._id || responseData.projectId || attendance.projectId;
                       return p.id === projectId || p.id === projectId?.toString();
                     })?.name || 'Unknown Project',
        employeeName: responseData.employeeName || attendance.employeeName,
        mobileNumber: responseData.mobileNumber || attendance.mobileNumber,
        labourType: responseData.labourType || attendance.labourType,
        date: responseData.date ? new Date(responseData.date) : (attendance.date ? new Date(attendance.date) : new Date()),
        timeIn: responseData.timeIn || attendance.timeIn,
        timeOut: responseData.timeOut || attendance.timeOut,
        status: responseData.status || attendance.status,
        hours: responseData.hours || attendance.hours || 0,
        overtimeHours: responseData.overtimeHours || attendance.overtimeHours || 0,
        notes: responseData.notes || attendance.notes,
        attachments: mappedAttachments, // Map attachments to IDs
        createdAt: responseData.createdAt ? new Date(responseData.createdAt) : new Date(),
        updatedAt: responseData.updatedAt ? new Date(responseData.updatedAt) : new Date()
      };
      
      setData(prev => ({ ...prev, attendance: [...prev.attendance, newAttendance] }));
      
      // Notify all managers when attendance is marked
      const employeeName = attendance.employeeName || 'An employee';
      const projectName = data.projects.find(p => p.id === attendance.projectId)?.name || 'a project';
      const statusLabel = attendance.status === 'present' ? 'Present' : 
                         attendance.status === 'absent' ? 'Absent' :
                         attendance.status === 'late' ? 'Late' :
                         attendance.status === 'half_day' ? 'Half Day' : 'Overtime';
      notifyAllManagers(
        'Attendance Marked',
        `${employeeName} marked attendance as ${statusLabel} for project "${projectName}"`,
        'info'
      );
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
      
      // Notify managers even if API fails
      const employeeName = attendance.employeeName || 'An employee';
      const projectName = data.projects.find(p => p.id === attendance.projectId)?.name || 'a project';
      const statusLabel = attendance.status === 'present' ? 'Present' : 
                         attendance.status === 'absent' ? 'Absent' :
                         attendance.status === 'late' ? 'Late' :
                         attendance.status === 'half_day' ? 'Half Day' : 'Overtime';
      notifyAllManagers(
        'Attendance Marked',
        `${employeeName} marked attendance as ${statusLabel} for project "${projectName}"`,
        'info'
      );
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
  const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await apiService.createInventoryItem(item);
      const responseData = (response as any).data || response;
      const newItem: InventoryItem = {
        ...responseData,
        id: responseData._id || responseData.id,
        createdAt: formatDate(new Date(responseData.createdAt || Date.now())),
        updatedAt: formatDate(new Date(responseData.updatedAt || Date.now()))
      };
      setData(prev => ({ ...prev, inventory: [...prev.inventory, newItem] }));
    } catch (error) {
      console.error('Failed to create inventory item:', error);
      // Fallback to localStorage if API fails
      const newItem: InventoryItem = {
        ...item,
        id: generateId(),
        createdAt: formatDate(new Date()),
        updatedAt: formatDate(new Date())
      };
      setData(prev => ({ ...prev, inventory: [...prev.inventory, newItem] }));
    }
  };

  const updateInventoryItem = async (id: string, item: Partial<InventoryItem>) => {
    try {
      const response = await apiService.updateInventoryItem(id, item);
      setData(prev => ({
        ...prev,
        inventory: prev.inventory.map(i => 
          i.id === id ? { 
            ...i, 
            ...(response as any).data, 
            id: (response as any).data._id || (response as any).data.id || i.id,
            updatedAt: formatDate(new Date()) 
          } : i
        )
      }));
    } catch (error) {
      console.error('Failed to update inventory item:', error);
      // Fallback to localStorage if API fails
      setData(prev => ({
        ...prev,
        inventory: prev.inventory.map(i => 
          i.id === id ? { ...i, ...item, updatedAt: formatDate(new Date()) } : i
        )
      }));
    }
  };

  const deleteInventoryItem = async (id: string) => {
    try {
      await apiService.deleteInventoryItem(id);
      setData(prev => ({
        ...prev,
        inventory: prev.inventory.filter(i => i.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete inventory item:', error);
      // Fallback to localStorage if API fails
      setData(prev => ({
        ...prev,
        inventory: prev.inventory.filter(i => i.id !== id)
      }));
    }
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
  const addMaterialIssue = async (issue: Omit<MaterialIssue, 'id' | 'createdAt'>) => {
    try {
      const response = await apiService.createMaterialIssue(issue);
      const responseData = (response as any).data || response;
      const newIssue: MaterialIssue = {
        ...responseData,
        id: responseData._id || responseData.id,
        projectId: responseData.projectId?._id || responseData.projectId || issue.projectId,
        taskId: responseData.taskId?._id || responseData.taskId || issue.taskId,
        materialId: responseData.materialId?._id || responseData.materialId || issue.materialId,
        issuedBy: responseData.issuedBy?._id || responseData.issuedBy || issue.issuedBy,
        issuedDate: responseData.issuedDate ? formatDate(new Date(responseData.issuedDate), 'yyyy-MM-dd') : issue.issuedDate,
        createdAt: formatDate(new Date(responseData.createdAt || Date.now()))
      };
      setData(prev => ({ ...prev, materialIssues: [...prev.materialIssues, newIssue] }));
    } catch (error) {
      console.error('Failed to create material issue:', error);
      // Fallback to localStorage if API fails
      const newIssue: MaterialIssue = {
        ...issue,
        id: generateId(),
        createdAt: formatDate(new Date())
      };
      setData(prev => ({ ...prev, materialIssues: [...prev.materialIssues, newIssue] }));
    }
  };

  const updateMaterialIssue = async (id: string, issue: Partial<MaterialIssue>) => {
    try {
      const response = await apiService.updateMaterialIssue(id, issue);
      setData(prev => ({
        ...prev,
        materialIssues: prev.materialIssues.map(mi => 
          mi.id === id ? { 
            ...mi, 
            ...(response as any).data, 
            id: (response as any).data._id || (response as any).data.id || mi.id 
          } : mi
        )
      }));
    } catch (error) {
      console.error('Failed to update material issue:', error);
      // Fallback to localStorage if API fails
      setData(prev => ({
        ...prev,
        materialIssues: prev.materialIssues.map(mi => 
          mi.id === id ? { ...mi, ...issue } : mi
        )
      }));
    }
  };

  const deleteMaterialIssue = async (id: string) => {
    try {
      await apiService.deleteMaterialIssue(id);
      setData(prev => ({
        ...prev,
        materialIssues: prev.materialIssues.filter(mi => mi.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete material issue:', error);
      // Fallback to localStorage if API fails
      setData(prev => ({
        ...prev,
        materialIssues: prev.materialIssues.filter(mi => mi.id !== id)
      }));
    }
  };

  // Material Return actions
  const addMaterialReturn = async (returnItem: Omit<MaterialReturn, 'id' | 'createdAt'>) => {
    try {
      const response = await apiService.createMaterialReturn(returnItem);
      const responseData = (response as any).data || response;
      const newReturn: MaterialReturn = {
        ...responseData,
        id: responseData._id || responseData.id,
        projectId: responseData.projectId?._id || responseData.projectId || returnItem.projectId,
        taskId: responseData.taskId?._id || responseData.taskId || returnItem.taskId,
        materialId: responseData.materialId?._id || responseData.materialId || returnItem.materialId,
        returnedBy: responseData.returnedBy?._id || responseData.returnedBy || returnItem.returnedBy,
        returnDate: responseData.returnDate ? formatDate(new Date(responseData.returnDate), 'yyyy-MM-dd') : returnItem.returnDate,
        createdAt: formatDate(new Date(responseData.createdAt || Date.now()))
      };
      setData(prev => ({ ...prev, materialReturns: [...prev.materialReturns, newReturn] }));
    } catch (error) {
      console.error('Failed to create material return:', error);
      // Fallback to localStorage if API fails
      const newReturn: MaterialReturn = {
        ...returnItem,
        id: generateId(),
        createdAt: formatDate(new Date())
      };
      setData(prev => ({ ...prev, materialReturns: [...prev.materialReturns, newReturn] }));
    }
  };

  const updateMaterialReturn = async (id: string, returnItem: Partial<MaterialReturn>) => {
    try {
      const response = await apiService.updateMaterialReturn(id, returnItem);
      setData(prev => ({
        ...prev,
        materialReturns: prev.materialReturns.map(mr => 
          mr.id === id ? { 
            ...mr, 
            ...(response as any).data, 
            id: (response as any).data._id || (response as any).data.id || mr.id 
          } : mr
        )
      }));
    } catch (error) {
      console.error('Failed to update material return:', error);
      // Fallback to localStorage if API fails
      setData(prev => ({
        ...prev,
        materialReturns: prev.materialReturns.map(mr => 
          mr.id === id ? { ...mr, ...returnItem } : mr
        )
      }));
    }
  };

  const deleteMaterialReturn = async (id: string) => {
    try {
      await apiService.deleteMaterialReturn(id);
      setData(prev => ({
        ...prev,
        materialReturns: prev.materialReturns.filter(mr => mr.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete material return:', error);
      // Fallback to localStorage if API fails
      setData(prev => ({
        ...prev,
        materialReturns: prev.materialReturns.filter(mr => mr.id !== id)
      }));
    }
  };

  // Material Consumption actions
  const addMaterialConsumption = async (consumption: Omit<MaterialConsumption, 'id' | 'createdAt'>) => {
    try {
      const response = await apiService.createMaterialConsumption(consumption);
      const responseData = (response as any).data || response;
      const newConsumption: MaterialConsumption = {
        ...responseData,
        id: responseData._id || responseData.id,
        projectId: responseData.projectId?._id || responseData.projectId || consumption.projectId,
        taskId: responseData.taskId?._id || responseData.taskId || consumption.taskId,
        materialId: responseData.materialId?._id || responseData.materialId || consumption.materialId,
        recordedBy: responseData.recordedBy?._id || responseData.recordedBy || consumption.recordedBy,
        consumptionDate: responseData.consumptionDate ? formatDate(new Date(responseData.consumptionDate), 'yyyy-MM-dd') : consumption.consumptionDate,
        createdAt: formatDate(new Date(responseData.createdAt || Date.now()))
      };
      setData(prev => ({ ...prev, materialConsumptions: [...prev.materialConsumptions, newConsumption] }));
    } catch (error) {
      console.error('Failed to create material consumption:', error);
      // Fallback to localStorage if API fails
      const newConsumption: MaterialConsumption = {
        ...consumption,
        id: generateId(),
        createdAt: formatDate(new Date())
      };
      setData(prev => ({ ...prev, materialConsumptions: [...prev.materialConsumptions, newConsumption] }));
    }
  };

  const updateMaterialConsumption = async (id: string, consumption: Partial<MaterialConsumption>) => {
    try {
      const response = await apiService.updateMaterialConsumption(id, consumption);
      setData(prev => ({
        ...prev,
        materialConsumptions: prev.materialConsumptions.map(mc => 
          mc.id === id ? { 
            ...mc, 
            ...(response as any).data, 
            id: (response as any).data._id || (response as any).data.id || mc.id 
          } : mc
        )
      }));
    } catch (error) {
      console.error('Failed to update material consumption:', error);
      // Fallback to localStorage if API fails
      setData(prev => ({
        ...prev,
        materialConsumptions: prev.materialConsumptions.map(mc => 
          mc.id === id ? { ...mc, ...consumption } : mc
        )
      }));
    }
  };

  const deleteMaterialConsumption = async (id: string) => {
    try {
      await apiService.deleteMaterialConsumption(id);
      setData(prev => ({
        ...prev,
        materialConsumptions: prev.materialConsumptions.filter(mc => mc.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete material consumption:', error);
      // Fallback to localStorage if API fails
      setData(prev => ({
        ...prev,
        materialConsumptions: prev.materialConsumptions.filter(mc => mc.id !== id)
      }));
    }
  };

  // User actions
  const addUser = async (user: Omit<User, 'id'>) => {
    try {
      const response = await apiService.createUser(user);
      
      // Check if response has success and data
      if ((response as any).success && (response as any).data) {
        const newUser: User = {
          ...(response as any).data,
          id: (response as any).data._id || (response as any).data.id,
          createdAt: formatDate(new Date()),
          updatedAt: formatDate(new Date())
        };
        setData(prev => ({ ...prev, users: [...prev.users, newUser] }));
      } else {
        // If response structure is different, try to extract data
        const responseData = (response as any).data || response;
        const newUser: User = {
          ...responseData,
          id: responseData._id || responseData.id || generateId(),
          createdAt: formatDate(new Date()),
          updatedAt: formatDate(new Date())
        };
        setData(prev => ({ ...prev, users: [...prev.users, newUser] }));
      }
    } catch (error: any) {
      console.error('Failed to create user:', error);
      
      // Extract error message from API response
      let errorMessage = 'Failed to create user. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      // Re-throw error so form can handle it and show error message
      throw new Error(errorMessage);
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

  const clearAllNotifications = () => {
    setData(prev => ({
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true }))
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
    clearAllNotifications,
    getDashboardStats
  };

  // Expose addNotification to AuthContext
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__dataContextAddNotification = addNotification;
    }
  }, []);

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