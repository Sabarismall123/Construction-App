import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Calendar, DollarSign, User, CheckSquare, AlertTriangle, Clock, TrendingUp, Info } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { formatDate, formatCurrency } from '@/utils';
import { PROJECT_STATUSES } from '@/constants';

const ProjectStatus: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, tasks, issues, pettyCash, attendance } = useData();

  const project = projects.find(p => p.id === projectId);
  
  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Project Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">The project you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/projects')}
            className="btn-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  // Get project-related data
  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const projectIssues = issues.filter(i => i.projectId === project.id);
  const projectExpenses = pettyCash.filter(pc => pc.projectId === project.id);
  const projectAttendance = attendance.filter(a => a.projectId === project.id);

  // Calculate project statistics
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = projectTasks.filter(t => t.status === 'in_progress').length;
  const notStartedTasks = projectTasks.filter(t => t.status === 'todo').length;

  // Calculate delayed tasks (overdue)
  const now = new Date();
  const delayedTasks = projectTasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    return dueDate < now && task.status !== 'completed';
  }).length;

  const delayedNotStarted = projectTasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    return dueDate < now && task.status === 'todo';
  }).length;

  const delayedInProgress = projectTasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    return dueDate < now && task.status === 'in_progress';
  }).length;

  const delayedCompleted = projectTasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    return dueDate < now && task.status === 'completed';
  }).length;

  // Calculate financial data
  const totalBudget = project.budget;
  const totalSpent = projectExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const earnedValue = (project.progress / 100) * totalBudget;
  const budgetVariance = totalBudget - totalSpent;

  // Calculate project dates
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);
  const actualStartDate = startDate; // Assuming actual start is same as planned
  const actualEndDate = project.status === 'completed' ? endDate : null;

  // Calculate project duration
  const projectDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const getStatusColor = (status: string) => {
    const statusConfig = PROJECT_STATUSES.find(s => s.value === status);
    return statusConfig?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Status</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{project.name}</p>
          </div>
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <Filter className="h-5 w-5" />
        </button>
      </div>

      {/* Main Status Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Progress & Financial */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Circle */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Project Progress</h3>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{project.progress}%</span>
              </div>
              
              {/* Circular Progress */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - project.progress / 100)}`}
                      className="text-blue-600"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{project.progress}%</span>
                  </div>
                </div>
              </div>

              {/* Earned Value */}
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {formatCurrency(earnedValue)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Earned Value</p>
              </div>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Price Value</p>
                  <Info className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalBudget)}
                </p>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
                  <Info className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalSpent)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Project Info */}
        <div className="space-y-6">
          {/* Project Dates */}
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Project Timeline</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Actual Start Date</p>
                    <Info className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(actualStartDate, 'MMM dd, yyyy')}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Actual End Date</p>
                    <Info className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {actualEndDate ? formatDate(actualEndDate, 'MMM dd, yyyy') : '--'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                    <Info className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(startDate, 'MMM dd, yyyy')}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-500 dark:text-gray-400">End Date</p>
                    <Info className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(endDate, 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Project Status */}
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Project Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                  <span className={`status-badge ${getStatusColor(project.status)}`}>
                    {PROJECT_STATUSES.find(s => s.value === project.status)?.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Duration</span>
                  <span className="font-medium">{projectDuration} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Days Elapsed</span>
                  <span className="font-medium">{Math.max(0, daysElapsed)} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Days Remaining</span>
                  <span className="font-medium">{Math.max(0, daysRemaining)} days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Breakdown */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Task Breakdown</h3>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalTasks} Tasks</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Not Started */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-8 bg-gray-300 rounded"></div>
                <h4 className="font-medium text-gray-900 dark:text-white">Not Started</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total:</span>
                  <span className="font-medium">{notStartedTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-red-500">Delayed:</span>
                  <span className="font-medium text-red-500">{delayedNotStarted}</span>
                </div>
              </div>
            </div>

            {/* In Progress */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-8 bg-yellow-400 rounded"></div>
                <h4 className="font-medium text-gray-900 dark:text-white">In Progress</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total:</span>
                  <span className="font-medium">{inProgressTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-red-500">Delayed:</span>
                  <span className="font-medium text-red-500">{delayedInProgress}</span>
                </div>
              </div>
            </div>

            {/* Completed */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-8 bg-green-500 rounded"></div>
                <h4 className="font-medium text-gray-900 dark:text-white">Completed</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total:</span>
                  <span className="font-medium">{completedTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-red-500">Delayed:</span>
                  <span className="font-medium text-red-500">{delayedCompleted}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-body">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {projectTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckSquare className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Due: {formatDate(task.dueDate, 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <span className={`status-badge ${
                  task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectStatus;
