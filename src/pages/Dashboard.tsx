import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart, Legend
} from 'recharts';
import { 
  Building2, CheckSquare, AlertTriangle, Users, DollarSign, 
  Clock, Package, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/utils';
import { CHART_COLORS } from '@/constants';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { getDashboardStats, projects, tasks, issues, pettyCash, attendance, inventory } = useData();
  const { user } = useAuth();
  
  const stats = getDashboardStats();

  // Chart data
  const projectProgressData = projects.map(project => ({
    name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
    progress: project.progress,
    budget: project.budget / 1000 // Convert to thousands
  }));

  const taskStatusData = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length, color: '#6b7280' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#3b82f6' },
    { name: 'Review', value: tasks.filter(t => t.status === 'review').length, color: '#f59e0b' },
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#10b981' }
  ];

  const issuePriorityData = [
    { name: 'Low', value: issues.filter(i => i.priority === 'low').length, color: '#6b7280' },
    { name: 'Medium', value: issues.filter(i => i.priority === 'medium').length, color: '#f59e0b' },
    { name: 'High', value: issues.filter(i => i.priority === 'high').length, color: '#f97316' },
    { name: 'Urgent', value: issues.filter(i => i.priority === 'urgent').length, color: '#ef4444' }
  ];

  const monthlyExpensesData = pettyCash
    .reduce((acc, expense) => {
      const month = new Date(expense.date).toLocaleDateString('en-US', { month: 'short' });
      const existing = acc.find(item => item.month === month);
      if (existing) {
        existing.amount += expense.amount;
      } else {
        acc.push({ month, amount: expense.amount });
      }
      return acc;
    }, [] as Array<{ month: string; amount: number }>)
    .sort((a, b) => new Date(a.month + ' 1, 2024').getTime() - new Date(b.month + ' 1, 2024').getTime());

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, change, icon, color }) => (
    <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 truncate">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1 flex-shrink-0" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1 flex-shrink-0" />
              )}
              <span className={`text-xs font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'} truncate`}>
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color} flex-shrink-0 ml-3 shadow-sm`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mobile-content w-full px-4 py-6 space-y-6 min-h-full pb-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-primary-100 text-lg">
          Here's what's happening with your construction projects today.
        </p>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Projects"
          value={stats.totalProjects}
          change={12}
          icon={<Building2 className="h-6 w-6 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Tasks"
          value={stats.pendingTasks}
          change={-5}
          icon={<CheckSquare className="h-6 w-6 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="Issues"
          value={stats.openIssues}
          change={8}
          icon={<AlertTriangle className="h-6 w-6 text-white" />}
          color="bg-red-500"
        />
        <StatCard
          title="Expenses"
          value={formatCurrency(stats.totalExpenses)}
          change={-2}
          icon={<DollarSign className="h-6 w-6 text-white" />}
          color="bg-yellow-500"
        />
      </div>

      {/* Additional Stats - 2 columns on mobile */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 text-center hover:shadow-lg transition-shadow duration-200">
          <div className="bg-purple-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Attendance</p>
          <p className="text-2xl font-bold text-gray-900">{formatPercentage(stats.attendanceRate)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 text-center hover:shadow-lg transition-shadow duration-200">
          <div className="bg-indigo-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
            <Users className="h-8 w-8 text-indigo-600" />
          </div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Resources</p>
          <p className="text-2xl font-bold text-gray-900">{stats.allocatedResources}/{stats.totalResources}</p>
        </div>
      </div>

      {/* Quick Actions - 2 columns on mobile */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/projects')}
            className="flex flex-col items-center justify-center p-6 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 hover:shadow-md transition-all duration-200 transform hover:scale-105"
          >
            <div className="bg-blue-100 rounded-full p-3 mb-3">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <span className="text-sm font-semibold">Project</span>
          </button>
          <button 
            onClick={() => navigate('/tasks')}
            className="flex flex-col items-center justify-center p-6 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 hover:shadow-md transition-all duration-200 transform hover:scale-105"
          >
            <div className="bg-green-100 rounded-full p-3 mb-3">
              <CheckSquare className="h-8 w-8 text-green-600" />
            </div>
            <span className="text-sm font-semibold">Task</span>
          </button>
          <button 
            onClick={() => navigate('/issues')}
            className="flex flex-col items-center justify-center p-6 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 hover:shadow-md transition-all duration-200 transform hover:scale-105"
          >
            <div className="bg-red-100 rounded-full p-3 mb-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <span className="text-sm font-semibold">Issue</span>
          </button>
          <button 
            onClick={() => navigate('/petty-cash')}
            className="flex flex-col items-center justify-center p-6 bg-yellow-50 text-yellow-700 rounded-xl hover:bg-yellow-100 hover:shadow-md transition-all duration-200 transform hover:scale-105"
          >
            <div className="bg-yellow-100 rounded-full p-3 mb-3">
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
            <span className="text-sm font-semibold">Expense</span>
          </button>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-3">
          {projects.length > 0 ? (
            projects.slice(0, 5).map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center shadow-sm">
                    <Building2 className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-gray-900">{project.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{project.client}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{project.progress}%</p>
                  <p className="text-xs text-gray-500 mt-1 capitalize">{project.status}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No recent projects</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 w-full">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Project Progress</h3>
          {projectProgressData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectProgressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="progress" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No project data available</p>
              </div>
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 w-full">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Task Status</h3>
          {taskStatusData.some(item => item.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <CheckSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No task data available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
