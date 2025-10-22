const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const user = localStorage.getItem('construction_user');
    const token = user ? 'mock-token' : null; // Use mock token for demo
    
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
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
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

  // User endpoints
  async getUsers() {
    return this.request('/users');
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
