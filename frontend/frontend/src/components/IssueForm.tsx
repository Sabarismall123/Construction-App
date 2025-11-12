import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, File, Image, Trash2, Download } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Issue } from '@/types';
import { formatDate, validateDateRange } from '@/utils';
import { ISSUE_STATUSES, PRIORITIES } from '@/constants';
import { toast } from 'react-hot-toast';
import { apiService } from '@/services/api';

interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  file: File;
  originalName: string;
  mimetype: string;
}

interface IssueFormProps {
  issue?: Issue;
  onClose: () => void;
}

const IssueForm: React.FC<IssueFormProps> = ({ issue, onClose }) => {
  const { addIssue, updateIssue, projects, users, addNotification } = useData();
  const { hasRole, user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    projectId: '',
    priority: 'medium' as const,
    status: 'open' as const,
    assignedTo: '',
    dueDate: '',
    description: '',
    attachments: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (issue) {
      // Handle assignedTo - it might be an ObjectId, string, or object
      let assignedToValue = '';
      if (issue.assignedTo) {
        if (typeof issue.assignedTo === 'string') {
          assignedToValue = issue.assignedTo;
        } else if (typeof issue.assignedTo === 'object' && (issue.assignedTo as any)._id) {
          assignedToValue = (issue.assignedTo as any)._id.toString();
        } else {
          assignedToValue = issue.assignedTo.toString();
        }
      }
      
      setFormData({
        title: issue.title,
        projectId: issue.projectId,
        priority: issue.priority,
        status: issue.status,
        assignedTo: assignedToValue,
        dueDate: issue.dueDate,
        description: issue.description,
        attachments: issue.attachments
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
  }, [issue]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Issue title is required';
    }

    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }

    // Only require assignedTo for managers/admins, not for employees
    if (hasRole(['admin', 'manager', 'site_supervisor']) && !formData.assignedTo.trim()) {
      newErrors.assignedTo = 'Assigned to is required';
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

  // File upload functions
  const handleFileUpload = async (files: FileList) => {
    const newAttachments: FileAttachment[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
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
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      try {
        // Upload file to backend
        const issueId = issue?.id;
        console.log('📤 Uploading file for issue:', issueId);
        const response = await apiService.uploadFile(file, undefined, formData.projectId, issueId);
        
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
          toast.error(`Failed to upload ${file.name}`);
        }
      } catch (error) {
        console.error('File upload error:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    if (newAttachments.length > 0) {
      setAttachments(prev => [...prev, ...newAttachments]);
      toast.success(`${newAttachments.length} file(s) uploaded successfully`);
    }
  };

  const removeAttachment = async (attachmentId: string) => {
    try {
      await apiService.deleteFile(attachmentId);
      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
      toast.success('File removed successfully');
    } catch (error) {
      console.error('Error removing file:', error);
      toast.error('Failed to remove file');
    }
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const issueData: any = {
        title: formData.title.trim(),
        projectId: formData.projectId,
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate,
        description: formData.description.trim(),
        attachments: attachments.map(att => att.id),
        // For employees, include reportedBy to track who reported the issue
        reportedBy: user?.id || ''
      };
      
      // Only include assignedTo if it's provided (for managers) or if editing
      if (formData.assignedTo.trim() || (issue && issue.assignedTo)) {
        const assignedToValue = formData.assignedTo.trim() || (issue?.assignedTo ? 
          (typeof issue.assignedTo === 'string' ? issue.assignedTo : 
           typeof issue.assignedTo === 'object' && (issue.assignedTo as any)._id ? 
           (issue.assignedTo as any)._id.toString() : 
           issue.assignedTo.toString()) : '');
        issueData.assignedTo = assignedToValue;
      }
      // For employees, don't send assignedTo at all (or send null)

      if (issue) {
        await updateIssue(issue.id, issueData);
        toast.success('Issue updated successfully');
        // Notification is sent in updateIssue function if assignedTo changed
      } else {
        await addIssue(issueData);
        toast.success('Issue created successfully');
        
        // Notify all managers when employee creates an issue (additional notification in form)
        if (user && (user.role === 'employee' || !hasRole(['admin', 'manager', 'site_supervisor']))) {
          const managers = users.filter(u => u.role === 'manager' || u.role === 'admin');
          const projectName = projects.find(p => p.id === formData.projectId)?.name || 'a project';
          managers.forEach(manager => {
            addNotification({
              title: 'New Issue Reported',
              message: `${user.name} reported a new issue: "${formData.title}" in project "${projectName}"`,
              type: 'warning',
              read: false,
              userId: manager.id
            });
          });
        }
      }

      onClose();
    } catch (error) {
      toast.error('Failed to save issue');
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

  return (
    <div className="modal-overlay">
      <div className="modal max-w-2xl">
        <div className="modal-header">
          <h2 className="modal-title">
            {issue ? 'Edit Issue' : 'Add New Issue'}
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
                  Issue Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className={errors.title ? 'input-error' : 'input'}
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter issue title"
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

                {/* Only show Assigned To field for managers/admins, not for employees */}
                {hasRole(['admin', 'manager', 'site_supervisor']) && (
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
                )}
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
                    {ISSUE_STATUSES.map((status) => (
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
                  placeholder="Enter issue description"
                />
                {errors.description && <p className="form-error">{errors.description}</p>}
              </div>

              {/* File Upload Section */}
              <div className="form-group">
                <label className="label">Attachments</label>
                <div className="space-y-4">
                  {/* File Upload Area */}
                  <div
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Images, PDF, DOC, XLS, TXT, ZIP (MAX. 10MB each)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                      className="hidden"
                    />
                  </div>

                  {/* Attached Files List */}
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Attached Files ({attachments.length})
                      </p>
                      {attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-center space-x-3">
                            {getFileIcon(attachment.mimetype)}
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {attachment.originalName}
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
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                              title="Download file"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeAttachment(attachment.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                              title="Remove file"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
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
                  {issue ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                issue ? 'Update Issue' : 'Create Issue'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueForm;
