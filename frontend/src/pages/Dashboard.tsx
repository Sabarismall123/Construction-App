import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import ConstructionAnimations from '@/components/ConstructionAnimations';
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
    <div className="backdrop-blur-sm rounded-xl shadow-lg border-2 hover:shadow-xl transition-all duration-200 h-full flex flex-col" style={{
      background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.98) 0%, rgba(255, 248, 235, 0.95) 100%)',
      borderColor: 'rgba(217, 119, 6, 0.2)',
      boxShadow: '0 10px 15px -3px rgba(217, 119, 6, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
      padding: '24px'
    }}>
      <div className="flex items-start justify-between gap-4 h-full">
        <div className={`p-3 rounded-xl ${color} flex-shrink-0 shadow-md flex items-center justify-center`} style={{ width: '48px', height: '48px' }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0 flex flex-col items-end justify-between text-right">
          <p className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">{title}</p>
          <div className="flex flex-col items-end">
            <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{value}</p>
            {change !== undefined && (
              <div className="flex items-center">
                {change >= 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-500 mr-1 flex-shrink-0" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-red-500 mr-1 flex-shrink-0" />
                )}
                <span className={`text-xs md:text-sm font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(change)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mobile-content w-full min-h-full pb-6 max-w-7xl mx-auto relative" style={{ padding: '16px' }}>
      {/* Construction Animations */}
      <ConstructionAnimations type="dashboard" />
      
      {/* Construction-themed background overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: '100px 100px'
          }}
        />
      </div>
      
      <div className="relative z-10" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Welcome Section */}
      <div className="rounded-2xl text-white shadow-2xl border-2 backdrop-blur-sm" style={{
        background: 'linear-gradient(135deg, #ea580c 0%, #d97706 50%, #b45309 100%)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        boxShadow: '0 20px 25px -5px rgba(234, 88, 12, 0.4), 0 10px 10px -5px rgba(217, 119, 6, 0.3)',
        padding: '24px'
      }}>
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 leading-tight">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-base md:text-lg text-orange-50 leading-relaxed">
            Here's what's happening with your construction projects today.
          </p>
        </div>
      </div>

      {/* Stats Grid - 4-column layout with equal cards */}
      <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '16px' }}>
        <StatCard
          title="Projects"
          value={stats.totalProjects}
          change={12}
          icon={<Building2 className="h-6 w-6 text-white" />}
          color="bg-orange-600"
        />
        <StatCard
          title="Tasks"
          value={stats.pendingTasks}
          change={-5}
          icon={<CheckSquare className="h-6 w-6 text-white" />}
          color="bg-amber-600"
        />
        <StatCard
          title="Issues"
          value={stats.openIssues}
          change={8}
          icon={<AlertTriangle className="h-6 w-6 text-white" />}
          color="bg-red-600"
        />
        <StatCard
          title="Expenses"
          value={formatCurrency(stats.totalExpenses)}
          change={-2}
          icon={<DollarSign className="h-6 w-6 text-white" />}
          color="bg-yellow-600"
        />
      </div>

      {/* Additional Stats - 2 columns on mobile */}
      <div className="grid grid-cols-2" style={{ gap: '16px' }}>
        <div className="backdrop-blur-sm rounded-xl shadow-lg border-2 text-center hover:shadow-xl transition-all duration-200" style={{
          background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.98) 0%, rgba(255, 248, 235, 0.95) 100%)',
          borderColor: 'rgba(217, 119, 6, 0.2)',
          boxShadow: '0 10px 15px -3px rgba(217, 119, 6, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
          padding: '24px'
        }}>
          <div className="bg-orange-100 rounded-full p-2.5 md:p-3 w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 flex items-center justify-center shadow-md">
            <Clock className="h-6 w-6 md:h-8 md:w-8 text-orange-700" />
          </div>
          <p className="text-xs md:text-sm font-medium text-gray-800 uppercase tracking-wide mb-2 font-semibold">Attendance</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{formatPercentage(stats.attendanceRate)}</p>
        </div>
        <div className="backdrop-blur-sm rounded-xl shadow-lg border-2 text-center hover:shadow-xl transition-all duration-200" style={{
          background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.98) 0%, rgba(255, 248, 235, 0.95) 100%)',
          borderColor: 'rgba(217, 119, 6, 0.2)',
          boxShadow: '0 10px 15px -3px rgba(217, 119, 6, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
          padding: '24px'
        }}>
          <div className="bg-amber-100 rounded-full p-2.5 md:p-3 w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 flex items-center justify-center shadow-md">
            <Users className="h-6 w-6 md:h-8 md:w-8 text-amber-700" />
          </div>
          <p className="text-xs md:text-sm font-medium text-gray-800 uppercase tracking-wide mb-2 font-semibold">Resources</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.allocatedResources}/{stats.totalResources}</p>
        </div>
      </div>

      {/* Quick Actions - 2 columns on mobile */}
      <div className="backdrop-blur-sm rounded-xl shadow-lg border-2" style={{
        background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.98) 0%, rgba(255, 248, 235, 0.95) 100%)',
        borderColor: 'rgba(217, 119, 6, 0.2)',
        boxShadow: '0 10px 15px -3px rgba(217, 119, 6, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
        padding: '24px'
      }}>
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 text-center">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: '16px' }}>
          <button 
            onClick={() => navigate('/projects')}
            className="flex flex-col items-center justify-center p-4 md:p-6 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 border-2"
            style={{
              background: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)',
              borderColor: 'rgba(217, 119, 6, 0.3)',
              color: '#92400e'
            }}
          >
            <div className="bg-orange-600 rounded-full p-2.5 md:p-3 mb-2 md:mb-3 shadow-md">
              <Building2 className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <span className="text-xs md:text-sm font-semibold">Project</span>
          </button>
          <button 
            onClick={() => navigate('/tasks')}
            className="flex flex-col items-center justify-center p-4 md:p-6 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 border-2"
            style={{
              background: 'linear-gradient(135deg, #fde68a 0%, #fcd34d 100%)',
              borderColor: 'rgba(217, 119, 6, 0.3)',
              color: '#92400e'
            }}
          >
            <div className="bg-amber-600 rounded-full p-2.5 md:p-3 mb-2 md:mb-3 shadow-md">
              <CheckSquare className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <span className="text-xs md:text-sm font-semibold">Task</span>
          </button>
          <button 
            onClick={() => navigate('/issues')}
            className="flex flex-col items-center justify-center p-4 md:p-6 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 border-2"
            style={{
              background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
              borderColor: 'rgba(220, 38, 38, 0.3)',
              color: '#991b1b'
            }}
          >
            <div className="bg-red-600 rounded-full p-2.5 md:p-3 mb-2 md:mb-3 shadow-md">
              <AlertTriangle className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <span className="text-xs md:text-sm font-semibold">Issue</span>
          </button>
          <button 
            onClick={() => navigate('/petty-cash')}
            className="flex flex-col items-center justify-center p-4 md:p-6 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 border-2"
            style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderColor: 'rgba(217, 119, 6, 0.3)',
              color: '#92400e'
            }}
          >
            <div className="bg-yellow-600 rounded-full p-2.5 md:p-3 mb-2 md:mb-3 shadow-md">
              <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <span className="text-xs md:text-sm font-semibold">Expense</span>
          </button>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="backdrop-blur-sm rounded-xl shadow-lg border-2" style={{
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.98) 0%, rgba(255, 248, 235, 0.95) 100%)',
        borderColor: 'rgba(217, 119, 6, 0.2)',
        boxShadow: '0 10px 15px -3px rgba(217, 119, 6, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-3">
          {projects.length > 0 ? (
            projects.slice(0, 5).map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-orange-50/50 transition-colors duration-200 border border-orange-200/50" style={{
                background: 'linear-gradient(135deg, rgba(255, 247, 237, 0.8) 0%, rgba(254, 243, 199, 0.6) 100%)'
              }}>
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-orange-600 rounded-xl flex items-center justify-center shadow-md">
                    <Building2 className="h-6 w-6 text-white" />
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
      <div className="grid grid-cols-1 lg:grid-cols-2 mb-6" style={{ gap: '16px' }}>
        <div className="backdrop-blur-sm rounded-xl shadow-lg border-2 w-full" style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.98) 0%, rgba(255, 248, 235, 0.95) 100%)',
          borderColor: 'rgba(217, 119, 6, 0.2)',
          boxShadow: '0 10px 15px -3px rgba(217, 119, 6, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Project Progress</h3>
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
        <div className="backdrop-blur-sm rounded-xl shadow-lg border-2 w-full" style={{
          background: 'linear-gradient(135deg, rgba(255, 250, 240, 0.98) 0%, rgba(255, 248, 235, 0.95) 100%)',
          borderColor: 'rgba(217, 119, 6, 0.2)',
          boxShadow: '0 10px 15px -3px rgba(217, 119, 6, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
          padding: '24px'
        }}>
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Task Status</h3>
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
    </div>
  );
};

export default Dashboard;
