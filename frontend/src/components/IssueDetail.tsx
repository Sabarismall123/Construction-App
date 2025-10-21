import React, { useState } from 'react';
import { X, Calendar, User, MessageSquare, Paperclip, Send, CheckCircle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Issue } from '@/types';
import { formatDate } from '@/utils';
import { ISSUE_STATUSES, PRIORITIES } from '@/constants';
import { toast } from 'react-hot-toast';

interface IssueDetailProps {
  issue: Issue;
  onClose: () => void;
}

const IssueDetail: React.FC<IssueDetailProps> = ({ issue, onClose }) => {
  const { addIssueComment, updateIssue, projects } = useData();
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [resolution, setResolution] = useState(issue.resolution || '');

  const project = projects.find(p => p.id === issue.projectId);

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

  const handleResolve = async () => {
    if (!resolution.trim()) {
      toast.error('Please provide a resolution');
      return;
    }

    try {
      await updateIssue(issue.id, {
        status: 'resolved',
        resolution: resolution.trim(),
        resolvedAt: formatDate(new Date())
      });
      toast.success('Issue resolved successfully');
    } catch (error) {
      toast.error('Failed to resolve issue');
    }
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

              {/* Resolution Form */}
              {issue.status !== 'resolved' && (
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
                    <button
                      onClick={handleResolve}
                      className="btn-primary"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Resolve Issue
                    </button>
                  </div>
                </div>
              )}

              {/* Attachments */}
              {issue.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Attachments</h3>
                  <div className="space-y-2">
                    {issue.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Paperclip className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{attachment}</span>
                      </div>
                    ))}
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
                  {issue.comments.length === 0 ? (
                    <p className="text-gray-500 text-sm">No comments yet</p>
                  ) : (
                    issue.comments.map((comment) => (
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
                      <div className="h-6 w-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs font-medium text-gray-600">
                          {issue.assignedTo.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-900">{issue.assignedTo}</span>
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

export default IssueDetail;
