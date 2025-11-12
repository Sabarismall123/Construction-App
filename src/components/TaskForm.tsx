import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, File, Image, Trash2, Download } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Task } from '@/types';
import { formatDate } from '@/utils';
import { TASK_STATUSES, PRIORITIES } from '@/constants';
import { toast } from 'react-hot-toast';
import { apiService } from '@/services/api';
import PhotoCapture from './PhotoCapture';
import LocationTracker from './LocationTracker';

interface TaskFormProps {
  task?: Task;
  onClose: () => void;
}

interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  file?: File;
  originalName?: string;
  mimetype?: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onClose }) => {
  const { addTask, updateTask, projects, users } = useData();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    assignedTo: '',
    priority: 'medium' as const,
    status: 'todo' as const,
    dueDate: '',
    description: '',
    projectId: '',
    attachments: [] as string[]
  });
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [photoAttachments, setPhotoAttachments] = useState<string[]>([]); // Store photo file IDs
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        assignedTo: task.assignedTo,
        priority: task.priority as typeof formData.priority,
        status: task.status as typeof formData.status,
        dueDate: task.dueDate,
        description: task.description,
        projectId: task.projectId,
        attachments: task.attachments
      });
    } else {
      // Set default due date
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setFormData(prev => ({
        ...prev,
        dueDate: formatDate(nextWeek, 'yyyy-MM-dd')
      }));
    }
  }, [task]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.assignedTo.trim()) {
      newErrors.assignedTo = 'Assigned to is required';
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const taskData = {
        title: formData.title.trim(),
        assignedTo: formData.assignedTo.trim(),
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate,
        description: formData.description.trim(),
        projectId: formData.projectId,
        attachments: [...attachments.map(a => a.id), ...photoAttachments], // Store file IDs from both regular attachments and photos
        createdBy: user?.id || null // Include creator ID
      };

      if (task) {
        await updateTask(task.id, taskData);
        toast.success('Task updated successfully');
      } else {
        await addTask(taskData);
        toast.success('Task created successfully');
      }

      onClose();
    } catch (error) {
      toast.error('Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: FileAttachment[] = [];
    
    for (const file of Array.from(files)) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'application/zip', 'application/x-rar-compressed'
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error(`File type ${file.type} is not supported.`);
        continue;
      }

      try {
        // Upload file to backend
        const taskId = task?.id || formData.projectId;
        console.log('📤 Uploading file for task/project:', taskId);
        const response = await apiService.uploadFile(file, taskId);
        
        if (response.success) {
          const fileAttachment: FileAttachment = {
            id: response.data.id,
            name: response.data.originalName,
            size: response.data.size,
            type: response.data.mimetype,
            url: apiService.getFileUrl(response.data.id),
            file: file,
            originalName: response.data.originalName,
            mimetype: response.data.mimetype
          };

          newAttachments.push(fileAttachment);
        } else {
          toast.error(`Failed to upload file ${file.name}`);
        }
      } catch (error) {
        toast.error(`Failed to upload file ${file.name}`);
        console.error('File upload error:', error);
      }
    }

    if (newAttachments.length > 0) {
      setAttachments(prev => [...prev, ...newAttachments]);
      toast.success(`${newAttachments.length} file(s) uploaded successfully`);
    }
  };

  const removeAttachment = async (id: string) => {
    try {
      // Delete file from backend
      await apiService.deleteFile(id);
      
      setAttachments(prev => {
        const attachment = prev.find(a => a.id === id);
        if (attachment) {
          URL.revokeObjectURL(attachment.url);
        }
        return prev.filter(a => a.id !== id);
      });
      
      toast.success('File removed successfully');
    } catch (error) {
      toast.error('Failed to remove file');
      console.error('File removal error:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="h-4 w-4 text-blue-500" />;
    }
    return <File className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="modal-overlay">
      <div className="modal max-w-2xl">
        <div className="modal-header">
          <h2 className="modal-title">
            {task ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="space-y-6">
              <div className="form-group">
                <label htmlFor="title" className="label">
                  Task Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className={errors.title ? 'input-error' : 'input'}
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter task title"
                />
                {errors.title && <p className="form-error">{errors.title}</p>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="projectId" className="label">
                    Project *
                  </label>
                  <select
                    id="projectId"
                    name="projectId"
                    className={errors.projectId ? 'input-error' : 'input'}
                    value={formData.projectId}
                    onChange={handleChange}
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  {errors.projectId && <p className="form-error">{errors.projectId}</p>}
                </div>

                <div className="form-group">
                  <label htmlFor="assignedTo" className="label">
                    Assigned To *
                  </label>
                  <select
                    id="assignedTo"
                    name="assignedTo"
                    className={errors.assignedTo ? 'input-error' : 'input'}
                    value={formData.assignedTo}
                    onChange={handleChange}
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  {errors.assignedTo && <p className="form-error">{errors.assignedTo}</p>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority" className="label">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    className="input"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    {PRIORITIES.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="status" className="label">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="input"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    {TASK_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="dueDate" className="label">
                  Due Date *
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  className={errors.dueDate ? 'input-error' : 'input'}
                  value={formData.dueDate}
                  onChange={handleChange}
                />
                {errors.dueDate && <p className="form-error">{errors.dueDate}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="description" className="label">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className={errors.description ? 'input-error' : 'input'}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter task description"
                />
                {errors.description && <p className="form-error">{errors.description}</p>}
              </div>

              {/* Location Tracking */}
              <LocationTracker 
                onLocationUpdate={(location) => {
                  console.log('Location updated:', location);
                }}
                className="mb-6"
              />

              {/* Photo Capture with Timestamps */}
              <PhotoCapture
                onPhotosCaptured={async (photos) => {
                  console.log('Photos captured:', photos);
                  // Upload photos and save to task attachments
                  try {
                    const uploadedFileIds: string[] = [];
                    for (const photo of photos) {
                      try {
                        // Upload photo file
                        const response = await apiService.uploadFile(
                          photo.file,
                          task?.id || undefined,
                          formData.projectId || undefined
                        );
                        if ((response as any).data?._id) {
                          uploadedFileIds.push((response as any).data._id);
                        }
                      } catch (error) {
                        console.error('Failed to upload photo:', error);
                      }
                    }
                    setPhotoAttachments(uploadedFileIds);
                    toast.success(`${photos.length} photo(s) uploaded successfully`);
                  } catch (error) {
                    console.error('Error uploading photos:', error);
                    toast.error('Failed to upload some photos');
                  }
                }}
                projectId={formData.projectId}
                taskId={task?.id}
                maxPhotos={5}
                className="mb-6"
              />

              {/* File Upload Section */}
              <div className="form-group">
                <label className="label">
                  Attachments
                </label>
                <div className="space-y-4">
                  {/* Upload Button */}
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:border-gray-600"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Images, PDF, DOC, XLS, TXT, ZIP (MAX. 10MB each)
                        </p>
                      </div>
                      <input
                        id="file-upload"
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>

                  {/* File List */}
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Attached Files ({attachments.length})
                      </p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              {getFileIcon(attachment.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {attachment.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatFileSize(attachment.size)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => window.open(attachment.url, '_blank')}
                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                title="Preview/Download"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeAttachment(attachment.id)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title="Remove file"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="loading-spinner h-4 w-4 mr-2"></div>
                  {task ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                task ? 'Update Task' : 'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
