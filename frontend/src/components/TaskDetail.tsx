import React, { useState, useEffect } from 'react';
import { X, Calendar, User, MessageSquare, Paperclip, Send, Download, Image, File, Eye } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Task } from '@/types';
import { formatDate } from '@/utils';
import { TASK_STATUSES, PRIORITIES } from '@/constants';
import { toast } from 'react-hot-toast';
import { apiService } from '@/services/api';

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ task, onClose }) => {
  const { addTaskComment, projects } = useData();
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [storedFiles, setStoredFiles] = useState<any[]>([]);

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
        
        if (typeof firstAttachment === 'object' && firstAttachment._id) {
          // Attachments are already populated objects from backend
          console.log('✅ Attachments are already populated objects');
          const files = task.attachments.map(attachment => ({
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

  const getStatusColor = (status: string) => {
    const statusConfig = TASK_STATUSES.find(s => s.value === status);
    return statusConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const priorityConfig = PRIORITIES.find(p => p.value === priority);
    return priorityConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);

    try {
      await addTaskComment(task.id, {
        content: newComment.trim(),
        author: 'current-user',
        authorName: 'Current User'
      });
      
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
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
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{task.description}</p>
              </div>

              {/* Attachments */}
              {task.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Attachments ({task.attachments.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {task.attachments.map((attachment, index) => {
                      // Handle both populated objects and ID strings
                      const attachmentId = typeof attachment === 'object' ? attachment._id : attachment;
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
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Comments</h3>
                
                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="mb-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      className="input flex-1"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || isSubmittingComment}
                      className="btn-primary"
                    >
                      {isSubmittingComment ? (
                        <div className="loading-spinner h-4 w-4"></div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  {task.comments.length === 0 ? (
                    <p className="text-gray-500 text-sm">No comments yet</p>
                  ) : (
                    task.comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {comment.authorName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {comment.authorName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(comment.createdAt, 'MMM dd, yyyy HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
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
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      <span className={`status-badge ${getStatusColor(task.status)}`}>
                        {TASK_STATUSES.find(s => s.value === task.status)?.label}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Priority</label>
                    <div className="mt-1">
                      <span className={`priority-badge ${getPriorityColor(task.priority)}`}>
                        {PRIORITIES.find(p => p.value === task.priority)?.label}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Assigned To</label>
                    <div className="mt-1 flex items-center">
                      <div className="h-6 w-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs font-medium text-gray-600">
                          {task.assignedTo.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-900">{task.assignedTo}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Due Date</label>
                    <div className="mt-1 flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(task.dueDate)}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Project</label>
                    <div className="mt-1 text-sm text-gray-900">{project?.name}</div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {formatDate(task.createdAt, 'MMM dd, yyyy')}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <div className="mt-1 text-sm text-gray-900">
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
                <div className="card-body space-y-2">
                  <button className="btn-secondary w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Comment
                  </button>
                  <button className="btn-secondary w-full">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Add Attachment
                  </button>
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
