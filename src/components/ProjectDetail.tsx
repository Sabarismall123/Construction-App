import React from 'react';
import { X, Calendar, DollarSign, User, Building2, CheckSquare, AlertTriangle, Users, Clock } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Project } from '@/types';
import { formatDate, formatCurrency } from '@/utils';
import { PROJECT_STATUSES } from '@/constants';

interface ProjectDetailProps {
  project: Project;
  onClose: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onClose }) => {
  const { getProjectTasks, getProjectIssues, getProjectResources, getProjectPettyCash, getProjectAttendance } = useData();
  
  const tasks = getProjectTasks(project.id);
  const issues = getProjectIssues(project.id);
  const resources = getProjectResources(project.id);
  const pettyCash = getProjectPettyCash(project.id);
  const attendance = getProjectAttendance(project.id);

  const getStatusColor = (status: string) => {
    const statusConfig = PROJECT_STATUSES.find(s => s.value === status);
    return statusConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const totalExpenses = pettyCash.reduce((sum, expense) => sum + expense.amount, 0);
  const budgetUsed = (totalExpenses / project.budget) * 100;

  return (
    <div className="modal-overlay">
      <div className="modal max-w-4xl">
        <div className="modal-header">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
              <Building2 className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="modal-title">{project.name}</h2>
              <p className="text-sm text-gray-500">{project.client}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="modal-body">
          <div className="space-y-6">
            {/* Project Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="font-medium">{formatCurrency(project.budget)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="h-5 w-5 mr-2">
                    <span className={`status-badge ${getStatusColor(project.status)}`}>
                      {PROJECT_STATUSES.find(s => s.value === project.status)?.label}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium">{PROJECT_STATUSES.find(s => s.value === project.status)?.label}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500">Overall Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500">Budget Used</span>
                    <span className="font-medium">{budgetUsed.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{project.description}</p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <CheckSquare className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{tasks.length}</p>
                <p className="text-sm text-blue-600">Tasks</p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg text-center">
                <AlertTriangle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{issues.length}</p>
                <p className="text-sm text-red-600">Issues</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg text-center">
                <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{resources.length}</p>
                <p className="text-sm text-green-600">Resources</p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-600">{attendance.length}</p>
                <p className="text-sm text-yellow-600">Attendance</p>
              </div>
            </div>

            {/* Recent Tasks */}
            {tasks.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Tasks</h3>
                <div className="space-y-2">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-500">Due: {formatDate(task.dueDate)}</p>
                      </div>
                      <span className={`status-badge ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Issues */}
            {issues.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Issues</h3>
                <div className="space-y-2">
                  {issues.slice(0, 5).map((issue) => (
                    <div key={issue.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{issue.title}</p>
                        <p className="text-sm text-gray-500">Priority: {issue.priority}</p>
                      </div>
                      <span className={`status-badge ${
                        issue.status === 'open' ? 'bg-red-100 text-red-800' :
                        issue.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {issue.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

export default ProjectDetail;
