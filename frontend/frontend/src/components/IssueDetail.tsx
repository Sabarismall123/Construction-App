import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, User, MessageSquare, Paperclip, Send, CheckCircle, Download, Image, File, Eye } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Issue } from '@/types';
import { formatDate } from '@/utils';
import { ISSUE_STATUSES, PRIORITIES } from '@/constants';
import { toast } from 'react-hot-toast';
import { apiService } from '@/services/api';

interface IssueDetailProps {
  issue: Issue;
  onClose: () => void;
}

const IssueDetail: React.FC<IssueDetailProps> = ({ issue, onClose }) => {
  const { addIssueComment, updateIssue, projects, users, addNotification } = useData();
  const { user: currentUser, hasRole } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [resolution, setResolution] = useState(issue.resolution || '');
  const [storedFiles, setStoredFiles] = useState<any[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check if current user is the assigned user
  const isAssignedUser = currentUser && issue.assignedTo && (
    currentUser.id === issue.assignedTo || 
    currentUser.id === (issue.assignedTo as any)?._id?.toString() ||
    currentUser.id === issue.assignedTo.toString()
  );
  
  // Check if current user is manager/admin (can resolve issues)
  const canResolveIssue = currentUser && (
    isAssignedUser || 
    hasRole(['admin', 'manager', 'site_supervisor'])
  );

  const project = projects.find(p => p.id === issue.projectId);

  useEffect(() => {
    // Load files from issue attachments (already populated by backend)
    const loadFiles = () => {
      console.log('🔄 Loading files for issue:', {
        issueId: issue.id,
        attachments: issue.attachments,
        attachmentsLength: issue.attachments?.length
      });
      
      if (issue.attachments && issue.attachments.length > 0) {
        // Check if attachments are already populated objects or just IDs
        const firstAttachment = issue.attachments[0];
        
        if (typeof firstAttachment === 'object' && firstAttachment._id) {
          // Attachments are already populated objects from backend
          console.log('✅ Attachments are already populated objects');
          const files = issue.attachments.map(attachment => ({
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
          const loadFilePromises = issue.attachments.map(async (fileId) => {
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
        console.log('ℹ️ No attachments found for this issue');
        setStoredFiles([]);
      }
    };

    loadFiles();
  }, [issue.attachments, issue.id]);

  const getStatusColor = (status: string) => {
    const statusConfig = ISSUE_STATUSES.find(s => s.value === status);
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
      await addIssueComment(issue.id, {
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

  // Track changes to resolution
  useEffect(() => {
    const resolutionChanged = resolution !== (issue.resolution || '');
    setHasChanges(resolutionChanged);
  }, [resolution, issue.resolution]);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      
      try {
        // Upload files
        for (const file of files) {
          await apiService.uploadFile(file, undefined, issue.projectId, issue.id);
        }
        
        toast.success(`${files.length} file(s) uploaded successfully`);
        
        // Mark as having changes so Save button becomes enabled
        setHasChanges(true);
        
        // Reload attachments by fetching issue again
        try {
          const issueResponse = await apiService.getIssue(issue.id);
          const updatedIssue = (issueResponse as any).data || issueResponse;
          if (updatedIssue.attachments && updatedIssue.attachments.length > 0) {
            // Check if attachments are already populated objects or just IDs
            const firstAttachment = updatedIssue.attachments[0];
            
            if (typeof firstAttachment === 'object' && firstAttachment._id) {
              // Attachments are already populated objects from backend
              const files = updatedIssue.attachments.map((attachment: any) => ({
                id: attachment._id,
                originalName: attachment.originalName,
                mimetype: attachment.mimetype,
                size: attachment.size
              }));
              setStoredFiles(files);
            } else {
              // Attachments are just IDs, need to load them individually
              const loadFilePromises = updatedIssue.attachments.map(async (fileId: string) => {
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
                setStoredFiles(validFiles);
              });
            }
          }
        } catch (error) {
          console.error('Error reloading attachments:', error);
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

  // Handle save - save resolution and notify reporter
  const handleSave = async () => {
    if (!resolution.trim()) {
      toast.error('Please provide a resolution');
      return;
    }

    setIsSaving(true);

    try {
      await updateIssue(issue.id, {
        status: 'resolved',
        resolution: resolution.trim(),
        resolvedAt: formatDate(new Date())
      });
      
      // Fetch latest issue data to get attachment count
      let updatedIssueData = issue;
      try {
        const issueResponse = await apiService.getIssue(issue.id);
        updatedIssueData = (issueResponse as any).data || issueResponse;
      } catch (error) {
        console.warn('Could not fetch updated issue data, using current issue data');
      }
      
      // Check if issue has attachments
      const issueAttachments = updatedIssueData.attachments || issue.attachments || [];
      const hasAttachments = issueAttachments.length > 0;
      
      // Notify the person who created/reported the issue
      const issueWithReporter = updatedIssueData as any;
      const reportedById = issueWithReporter.reportedBy?._id || issueWithReporter.reportedBy || issue.reportedBy;
      const reportedByName = issueWithReporter.reportedByName || issueWithReporter.reportedBy?.name || 'the reporter';
      
      if (reportedById) {
        const reportedByIdStr = reportedById.toString();
        const reporter = users.find(u => u.id === reportedByIdStr || u.id === reportedById);
        
        const attachmentText = hasAttachments ? ` (${issueAttachments.length} photo${issueAttachments.length > 1 ? 's' : ''} attached)` : '';
        const message = `Issue "${issue.title}" has been resolved${attachmentText}. Resolution: ${resolution.trim().substring(0, 100)}${resolution.trim().length > 100 ? '...' : ''}`;
        
        if (reporter) {
          addNotification({
            title: 'Issue Resolved',
            message: message,
            type: 'success',
            read: false,
            userId: reporter.id
          });
          console.log(`✅ Notification sent to reporter ${reporter.name}: Issue resolved`);
        } else {
          // If reporter not found in users list, use reportedBy ID directly
          addNotification({
            title: 'Issue Resolved',
            message: message,
            type: 'success',
            read: false,
            userId: reportedByIdStr
          });
          console.log(`✅ Notification sent to reporter (ID: ${reportedByIdStr}): Issue resolved`);
        }
      }
      
      setHasChanges(false);
      toast.success('Issue resolved successfully! Reporter has been notified.');
      
      // Auto-close the dialog after a short delay
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to resolve issue');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResolve = async () => {
    // Use handleSave instead
    await handleSave();
  };

  return (
    <div className="modal-overlay">
      <div className="modal max-w-4xl">
        <div className="modal-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-red-600 text-lg">⚠️</span>
              </div>
              <div>
                <h2 className="modal-title">{issue.title}</h2>
                <p className="text-sm text-gray-500">{project?.name}</p>
              </div>
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
                <p className="text-gray-600">{issue.description}</p>
              </div>

              {/* Resolution */}
              {issue.status === 'resolved' && issue.resolution && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Resolution</h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800">{issue.resolution}</p>
                    {issue.resolvedAt && (
                      <p className="text-sm text-green-600 mt-2">
                        Resolved on {formatDate(issue.resolvedAt, 'MMM dd, yyyy HH:mm')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Resolution Form - Show for assigned users and managers */}
              {issue.status !== 'resolved' && canResolveIssue && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Resolution</h3>
                  <div className="space-y-3">
                    <textarea
                      rows={3}
                      className="input"
                      placeholder="Enter resolution details..."
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddAttachmentClick}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <Paperclip className="h-4 w-4" />
                        Add Attachment
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
              )}

              {/* Attachments */}
              {issue.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Attachments ({issue.attachments.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {issue.attachments.map((attachment, index) => {
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
                      placeholder="Add a comment... (Press Enter to send)"
                      className="input flex-1"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (newComment.trim() && !isSubmittingComment) {
                            handleAddComment(e as any);
                          }
                        }
                      }}
                    />
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                  {issue.comments.length === 0 ? (
                    <p className="text-gray-500 text-sm">No comments yet</p>
                  ) : (
                    issue.comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {comment.authorName?.charAt(0)?.toUpperCase() || '?'}
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
              {/* Issue Details */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">Issue Details</h3>
                </div>
                <div className="card-body space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      <span className={`status-badge ${getStatusColor(issue.status)}`}>
                        {ISSUE_STATUSES.find(s => s.value === issue.status)?.label}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Priority</label>
                    <div className="mt-1">
                      <span className={`priority-badge ${getPriorityColor(issue.priority)}`}>
                        {PRIORITIES.find(p => p.value === issue.priority)?.label}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Assigned To</label>
                    <div className="mt-1 flex items-center">
                      {issue.assignedTo ? (
                        <>
                          <div className="h-6 w-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                            <span className="text-xs font-medium text-gray-600">
                              {typeof issue.assignedTo === 'string' ? issue.assignedTo.charAt(0).toUpperCase() : 'U'}
                            </span>
                          </div>
                          <span className="text-sm text-gray-900">{issue.assignedTo}</span>
                        </>
                      ) : (
                        <>
                          <div className="h-6 w-6 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                            <span className="text-xs font-medium text-gray-500">-</span>
                          </div>
                          <span className="text-sm text-gray-500 italic">Unassigned</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Due Date</label>
                    <div className="mt-1 flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(issue.dueDate)}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Project</label>
                    <div className="mt-1 text-sm text-gray-900">{project?.name}</div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {formatDate(issue.createdAt, 'MMM dd, yyyy')}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {formatDate(issue.updatedAt, 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-gray-500">
              {hasChanges && canResolveIssue && <span className="text-orange-600">You have unsaved changes</span>}
            </div>
            <div className="flex items-center gap-3">
              {issue.status !== 'resolved' && canResolveIssue && (
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving || !resolution.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="loading-spinner h-4 w-4"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Save & Resolve</span>
                    </>
                  )}
                </button>
              )}
              <button
                onClick={onClose}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
