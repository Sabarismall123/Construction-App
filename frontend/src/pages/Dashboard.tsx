import React from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { 
  Building2, CheckSquare, AlertTriangle, Users, DollarSign, 
  Clock, Package, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/utils';
import { CHART_COLORS } from '@/constants';

const Dashboard: React.FC = () => {
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
    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 truncate">{title}</p>
          <p className="text-lg font-bold text-gray-900 truncate">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-1">
              {change >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1 flex-shrink-0" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1 flex-shrink-0" />
              )}
              <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'} truncate`}>
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-2 rounded-lg ${color} flex-shrink-0 ml-2`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mobile-content w-full px-4 py-4 space-y-6 min-h-full">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-primary-100">
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
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
          <Clock className="h-8 w-8 text-purple-500 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-2">Attendance</p>
          <p className="text-2xl font-bold text-gray-900">{formatPercentage(stats.attendanceRate)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
          <Users className="h-8 w-8 text-indigo-500 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-2">Resources</p>
          <p className="text-2xl font-bold text-gray-900">{stats.allocatedResources}/{stats.totalResources}</p>
        </div>
      </div>

      {/* Quick Actions - 2 columns on mobile */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <button className="flex flex-col items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
            <Building2 className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium">Project</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
            <CheckSquare className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium">Task</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
            <AlertTriangle className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium">Issue</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors">
            <DollarSign className="h-6 w-6 mb-2" />
            <span className="text-sm font-medium">Expense</span>
          </button>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {projects.slice(0, 5).map((project) => (
            <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{project.name}</p>
                  <p className="text-sm text-gray-500">{project.client}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{project.progress}%</p>
                <p className="text-sm text-gray-500">{project.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Project Progress</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Building2 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>Project Progress Chart</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Task Status</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <CheckSquare className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>Task Status Chart</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
