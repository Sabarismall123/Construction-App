import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Paperclip, Download, Image, File, Eye } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Task } from '@/types';
import { formatDate } from '@/utils';
import { TASK_STATUSES, PRIORITIES } from '@/constants';
import { toast } from 'react-hot-toast';
import { apiService } from '@/services/api';

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
  onTaskUpdate?: () => void; // Callback to refresh task data
}

const TaskDetail: React.FC<TaskDetailProps> = ({ task, onClose, onTaskUpdate }) => {
  const { addTaskComment, updateTask, projects, users, addNotification } = useData();
  const { user: currentUser } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [storedFiles, setStoredFiles] = useState<any[]>([]);
  const [taskStatus, setTaskStatus] = useState(task.status);
  const [taskPriority, setTaskPriority] = useState(task.priority);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const project = projects.find(p => p.id === task.projectId);

  useEffect(() => {
    // Load files from task attachments (already populated by backend)
    const loadFiles = () => {
      console.log('🔄 Loading files for task:', {
        taskId: task.id,
        attachments: task.attachments,
        attachmentsLength: task.attachments?.length
      });
      
      if (task.attachments && task.attachments.length > 0) {
        // Check if attachments are already populated objects or just IDs
        const firstAttachment = task.attachments[0];
        
        if (typeof firstAttachment === 'object' && (firstAttachment as any)._id) {
          // Attachments are already populated objects from backend
          console.log('✅ Attachments are already populated objects');
          const files = task.attachments.map((attachment: any) => ({
            id: attachment._id,
            originalName: attachment.originalName,
            mimetype: attachment.mimetype,
            size: attachment.size
          }));
          console.log('📁 Using populated files:', files);
          setStoredFiles(files);
        } else {
          // Attachments are just IDs, need to load them individually
          console.log('⚠️ Attachments are IDs, loading individually...');
          const loadFilePromises = task.attachments.map(async (fileId) => {
            try {
              const response = await apiService.getFileInfo(fileId);
              return response.success ? response.data : null;
            } catch (error) {
              console.error(`❌ Failed to load file ${fileId}:`, error);
              return null;
            }
          });
          
          Promise.all(loadFilePromises).then(files => {
            const validFiles = files.filter(file => file !== null);
            console.log('📁 Loaded files from API:', validFiles);
            setStoredFiles(validFiles);
          });
        }
      } else {
        console.log('ℹ️ No attachments found for this task');
        setStoredFiles([]);
      }
    };

    loadFiles();
  }, [task.attachments, task.id]);


  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);

    try {
      await addTaskComment(task.id, {
        content: newComment.trim(),
        author: currentUser?.id || 'current-user',
        authorName: currentUser?.name || 'Current User'
      });
      
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      await updateTask(task.id, { status: newStatus as any });
      setTaskStatus(newStatus as any);
      
      // If status changed to completed, send notification to assigned user
      if (newStatus === 'completed') {
        const assignedUser = users.find(u => u.id === task.assignedTo);
        if (assignedUser) {
          addNotification({
            title: 'Task Completed',
            message: `Task "${task.title}" has been marked as completed by ${currentUser?.name || 'System'}`,
            type: 'success',
            read: false,
            userId: assignedUser.id
          });
          toast.success(`Notification sent to ${assignedUser.name}`);
        }
      }
      
      toast.success('Task status updated successfully');
    } catch (error) {
      toast.error('Failed to update task status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle priority change
  const handlePriorityChange = async (newPriority: string) => {
    try {
      await updateTask(task.id, { priority: newPriority as any });
      setTaskPriority(newPriority as any);
      toast.success('Task priority updated successfully');
    } catch (error) {
      toast.error('Failed to update task priority');
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      try {
        // Upload files
        for (const file of files) {
          await apiService.uploadFile(file, task.id, task.projectId);
        }
        
        toast.success(`${files.length} file(s) uploaded successfully`);
        // Refresh task data to show new attachments
        if (onTaskUpdate) {
          onTaskUpdate();
        } else {
          // Fallback: reload page if no callback provided
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } catch (error) {
        console.error('File upload error:', error);
        toast.error('Failed to upload files');
      } finally {
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  // Handle add attachment button click
  const handleAddAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="modal-overlay">
      <div className="modal max-w-4xl">
        <div className="modal-header">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="modal-title">{task.title}</h2>
              <p className="text-sm text-gray-500">{project?.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900">Description</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">{task.description}</p>
                </div>
              </div>

              {/* Attachments */}
              {task.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Attachments ({task.attachments.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {task.attachments.map((attachment, index) => {
                      // Handle both populated objects and ID strings
                      const attachmentId = typeof attachment === 'object' ? (attachment as any)._id : attachment;
                      const storedFile = storedFiles.find(f => f.id === attachmentId);
                      const isImage = storedFile?.mimetype?.startsWith('image/');
                      const isPdf = storedFile?.mimetype === 'application/pdf';
                      
                      console.log('File lookup:', {
                        attachment,
                        attachmentId,
                        storedFile,
                        isImage,
                        totalFiles: storedFiles.length
                      });
                      
                      return (
                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              {isImage ? (
                                <Image className="h-5 w-5 text-blue-500 flex-shrink-0" />
                              ) : (
                                <File className="h-5 w-5 text-gray-500 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {storedFile?.originalName || 'Unknown file'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {isImage ? 'Image file' : isPdf ? 'PDF document' : 'Document'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-2">
                              {isImage && storedFile && (
                                <button
                                  onClick={() => {
                                    // Open image in new tab
                                    window.open(apiService.getFileUrl(storedFile.id), '_blank');
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                  title="Preview image"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={async () => {
                                  if (storedFile) {
                                    try {
                                      // Download file from backend
                                      const blob = await apiService.getFile(storedFile.id);
                                      const url = window.URL.createObjectURL(blob);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = storedFile.originalName;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                      window.URL.revokeObjectURL(url);
                                    } catch (error) {
                                      toast.error('Failed to download file');
                                    }
                                  } else {
                                    toast.error('File not found');
                                  }
                                }}
                                className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                                title="Download file"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Image preview */}
                          {isImage && storedFile && (
                            <div className="mt-3">
                              <img
                                src={apiService.getFileUrl(storedFile.id)}
                                alt={storedFile.originalName}
                                className="w-full h-48 object-cover rounded border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(apiService.getFileUrl(storedFile.id), '_blank')}
                              />
                            </div>
                          )}
                          
                          {/* Placeholder for files not found */}
                          {isImage && !storedFile && (
                            <div className="mt-3 p-4 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 text-center">
                              <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Image not found
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                File ID: {attachmentId}
                              </p>
                            </div>
                          )}
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Comments */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Comments</h3>
                
                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="mb-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddAttachmentClick}
                      className="h-9 w-9 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300 flex-shrink-0 transition-colors flex items-center justify-center"
                      title="Add attachment"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <input
                      type="text"
                      placeholder="Add a comment... (Press Enter to send)"
                      className="input flex-1 h-9 py-2 px-3 text-sm min-w-0"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      disabled={isSubmittingComment}
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                      onChange={handleFileUpload}
                    />
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  {task.comments.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No comments yet</p>
                  ) : (
                    task.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-gray-600">
                            {comment.authorName?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {comment.authorName || 'Unknown'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(comment.createdAt, 'MMM dd, yyyy HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Task Details */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">Task Details</h3>
                </div>
                <div className="card-body space-y-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                    <select
                      value={taskStatus}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={isUpdatingStatus}
                      className="input w-full text-sm py-2 px-3 h-10"
                    >
                      {TASK_STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                    <select
                      value={taskPriority}
                      onChange={(e) => handlePriorityChange(e.target.value)}
                      className="input w-full text-sm py-2 px-3 h-10"
                    >
                      {PRIORITIES.map((priority) => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Assigned To</label>
                    <div className="flex items-center gap-2 mt-1">
                      {(() => {
                        const assignedUser = users.find(u => u.id === task.assignedTo);
                        const userName = assignedUser?.name || 'Unassigned';
                        const initial = userName.charAt(0).toUpperCase();
                        return (
                          <>
                            <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-medium text-gray-600">
                                {initial}
                              </span>
                            </div>
                            <span className="text-sm text-gray-900 truncate">
                              {userName}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Due Date</label>
                    <div className="flex items-center gap-2 text-sm text-gray-900 mt-1">
                      <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Project</label>
                    <div className="text-sm text-gray-900 mt-1">{project?.name || 'No project'}</div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Created</label>
                    <div className="text-sm text-gray-900 mt-1">
                      {formatDate(task.createdAt, 'MMM dd, yyyy')}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Updated</label>
                    <div className="text-sm text-gray-900 mt-1">
                      {formatDate(task.updatedAt, 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                </div>
                <div className="card-body">
                  <button
                    type="button"
                    onClick={handleAddAttachmentClick}
                    className="btn-secondary w-full flex items-center justify-center gap-2 py-2.5"
                  >
                    <Paperclip className="h-4 w-4" />
                    <span>Add Attachment</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
