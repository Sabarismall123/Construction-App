// Detect API URL - use production backend URL for deployed frontend
const getApiBaseUrl = () => {
  // If VITE_API_URL is set, use it
  if (import.meta.env.VITE_API_URL) {
    console.log('📡 Using API URL from env:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // If we're on localhost, use local backend
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('📡 Using local API URL');
    return 'http://localhost:5000/api';
  }
  
  // For deployed frontend (Vercel), use production backend (Render)
  // Replace with your actual Render backend URL
  const productionApiUrl = 'https://your-backend-url.onrender.com/api';
  console.log('📡 Using production API URL:', productionApiUrl);
  return productionApiUrl;
};

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const user = localStorage.getItem('construction_user');
    const token = user ? 'mock-token' : null; // Use mock token for demo
    
    console.log('🌐 API Request:', {
      method: options.method || 'GET',
      url,
      endpoint,
      baseUrl: API_BASE_URL,
      hostname: window.location.hostname
    });
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      console.log('📥 API Response:', {
        url,
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        let errorData: any;
        const contentType = response.headers.get('content-type');
        
        try {
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
          } else {
            const errorText = await response.text();
            errorData = { message: errorText };
          }
        } catch (parseError) {
          errorData = { message: `HTTP error! status: ${response.status}` };
        }
        
        console.error('❌ API Error:', {
          status: response.status,
          statusText: response.statusText,
          url,
          error: errorData
        });
        
        // Create error with proper message
        const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${response.status}`;
        const error: any = new Error(errorMessage);
        error.response = {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        };
        throw error;
      }
      
      const data = await response.json();
      console.log('✅ API Success:', { url, dataLength: JSON.stringify(data).length });
      return data;
    } catch (error: any) {
      console.error('❌ API request failed:', {
        url,
        error: error.message,
        stack: error.stack,
        hostname: window.location.hostname,
        userAgent: navigator.userAgent
      });
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: { name: string; email: string; password: string; role: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Project endpoints
  async getProjects() {
    return this.request('/projects');
  }

  async getProject(id: string) {
    return this.request(`/projects/${id}`);
  }

  async createProject(project: any) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async updateProject(id: string, project: any) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  }

  async deleteProject(id: string) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Task endpoints
  async getTasks() {
    return this.request('/tasks');
  }

  async getTask(id: string) {
    return this.request(`/tasks/${id}`);
  }

  async createTask(task: any) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, task: any) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  }

  async deleteTask(id: string) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Issue endpoints
  async getIssues() {
    return this.request('/issues');
  }

  async getIssue(id: string) {
    return this.request(`/issues/${id}`);
  }

  async createIssue(issue: any) {
    return this.request('/issues', {
      method: 'POST',
      body: JSON.stringify(issue),
    });
  }

  async updateIssue(id: string, issue: any) {
    return this.request(`/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(issue),
    });
  }

  async deleteIssue(id: string) {
    return this.request(`/issues/${id}`, {
      method: 'DELETE',
    });
  }

  // Resource endpoints
  async getResources() {
    return this.request('/resources');
  }

  async getResource(id: string) {
    return this.request(`/resources/${id}`);
  }

  async createResource(resource: any) {
    return this.request('/resources', {
      method: 'POST',
      body: JSON.stringify(resource),
    });
  }

  async updateResource(id: string, resource: any) {
    return this.request(`/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(resource),
    });
  }

  async deleteResource(id: string) {
    return this.request(`/resources/${id}`, {
      method: 'DELETE',
    });
  }

  async getResourcesByProject(projectId: string) {
    return this.request(`/resources/project/${projectId}`);
  }

  // Petty Cash endpoints
  async getPettyCashEntries() {
    return this.request('/petty-cash');
  }

  async getPettyCashEntry(id: string) {
    return this.request(`/petty-cash/${id}`);
  }

  async createPettyCashEntry(entry: any) {
    return this.request('/petty-cash', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  async updatePettyCashEntry(id: string, entry: any) {
    return this.request(`/petty-cash/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    });
  }

  async deletePettyCashEntry(id: string) {
    return this.request(`/petty-cash/${id}`, {
      method: 'DELETE',
    });
  }

  async getPettyCashEntriesByProject(projectId: string) {
    return this.request(`/petty-cash/project/${projectId}`);
  }

  // Commercial endpoints
  async getCommercialEntries() {
    return this.request('/commercial');
  }

  async getCommercialEntry(id: string) {
    return this.request(`/commercial/${id}`);
  }

  async createCommercialEntry(entry: any) {
    return this.request('/commercial', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  async updateCommercialEntry(id: string, entry: any) {
    return this.request(`/commercial/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entry),
    });
  }

  async deleteCommercialEntry(id: string) {
    return this.request(`/commercial/${id}`, {
      method: 'DELETE',
    });
  }

  async getCommercialEntriesByProject(projectId: string) {
    return this.request(`/commercial/project/${projectId}`);
  }

  // Inventory endpoints
  async getInventoryItems() {
    return this.request('/inventory');
  }

  async getInventoryItem(id: string) {
    return this.request(`/inventory/${id}`);
  }

  async createInventoryItem(item: any) {
    return this.request('/inventory', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateInventoryItem(id: string, item: any) {
    return this.request(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  }

  async deleteInventoryItem(id: string) {
    return this.request(`/inventory/${id}`, {
      method: 'DELETE',
    });
  }

  // Material Issue endpoints
  async getMaterialIssues() {
    return this.request('/material-issues');
  }

  async getMaterialIssue(id: string) {
    return this.request(`/material-issues/${id}`);
  }

  async createMaterialIssue(issue: any) {
    return this.request('/material-issues', {
      method: 'POST',
      body: JSON.stringify(issue),
    });
  }

  async updateMaterialIssue(id: string, issue: any) {
    return this.request(`/material-issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(issue),
    });
  }

  async deleteMaterialIssue(id: string) {
    return this.request(`/material-issues/${id}`, {
      method: 'DELETE',
    });
  }

  // Material Return endpoints
  async getMaterialReturns() {
    return this.request('/material-returns');
  }

  async getMaterialReturn(id: string) {
    return this.request(`/material-returns/${id}`);
  }

  async createMaterialReturn(returnItem: any) {
    return this.request('/material-returns', {
      method: 'POST',
      body: JSON.stringify(returnItem),
    });
  }

  async updateMaterialReturn(id: string, returnItem: any) {
    return this.request(`/material-returns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(returnItem),
    });
  }

  async deleteMaterialReturn(id: string) {
    return this.request(`/material-returns/${id}`, {
      method: 'DELETE',
    });
  }

  // Material Consumption endpoints
  async getMaterialConsumptions() {
    return this.request('/material-consumptions');
  }

  async getMaterialConsumption(id: string) {
    return this.request(`/material-consumptions/${id}`);
  }

  async createMaterialConsumption(consumption: any) {
    return this.request('/material-consumptions', {
      method: 'POST',
      body: JSON.stringify(consumption),
    });
  }

  async updateMaterialConsumption(id: string, consumption: any) {
    return this.request(`/material-consumptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(consumption),
    });
  }

  async deleteMaterialConsumption(id: string) {
    return this.request(`/material-consumptions/${id}`, {
      method: 'DELETE',
    });
  }

  // User endpoints
  async getUsers() {
    return this.request('/users');
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async createUser(user: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async updateUser(id: string, user: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Attendance/Labor endpoints
  async getAttendance() {
    return this.request('/attendance');
  }

  async getAttendanceRecord(id: string) {
    return this.request(`/attendance/${id}`);
  }

  async createAttendance(attendance: any) {
    return this.request('/attendance', {
      method: 'POST',
      body: JSON.stringify(attendance),
    });
  }

  async updateAttendance(id: string, attendance: any) {
    return this.request(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(attendance),
    });
  }

  async deleteAttendance(id: string) {
    return this.request(`/attendance/${id}`, {
      method: 'DELETE',
    });
  }

  async getAttendanceByProject(projectId: string) {
    return this.request(`/attendance/project/${projectId}`);
  }

  // File upload methods
  async uploadFile(file: File, taskId?: string, projectId?: string, issueId?: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (taskId) formData.append('taskId', taskId);
    if (projectId) formData.append('projectId', projectId);
    if (issueId) formData.append('issueId', issueId);

    const user = localStorage.getItem('construction_user');
    const token = user ? 'mock-token' : null;
    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async uploadMultipleFiles(files: File[], taskId?: string, projectId?: string, issueId?: string): Promise<any> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (taskId) formData.append('taskId', taskId);
    if (projectId) formData.append('projectId', projectId);
    if (issueId) formData.append('issueId', issueId);

    const user = localStorage.getItem('construction_user');
    const token = user ? 'mock-token' : null;
    const response = await fetch(`${API_BASE_URL}/files/upload-multiple`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getFile(fileId: string): Promise<Blob> {
    const user = localStorage.getItem('construction_user');
    const token = user ? 'mock-token' : null;
    const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }

  async getFileInfo(fileId: string): Promise<any> {
    return this.request(`/files/${fileId}/info`);
  }

  async deleteFile(fileId: string): Promise<any> {
    return this.request(`/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  async getFilesByTask(taskId: string): Promise<any> {
    return this.request(`/files/task/${taskId}`);
  }

  // Helper method to get file URL
  getFileUrl(fileId: string): string {
    const user = localStorage.getItem('construction_user');
    const token = user ? 'mock-token' : null;
    return `${API_BASE_URL}/files/${fileId}${token ? `?token=${token}` : ''}`;
  }
}

export const apiService = new ApiService();
