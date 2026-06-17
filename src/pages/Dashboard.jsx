import React, { useState, useEffect } from 'react';
import { getStats } from '../services/admin.service';
import { 
  Users, GraduationCap, BookOpen, DollarSign, 
  CreditCard, TrendingUp, AlertCircle, RefreshCw
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [courseStats, setCourseStats] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStats();
      if (res.success) {
        setStats(res.stats);
        setCourseStats(res.courseStats || []);
        setGrowthData(res.monthlyGrowth || []);
      } else {
        setError('Failed to load dashboard stats');
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold text-brand-black dark:text-white">Admin Dashboard</h1>
          <p className="text-xs text-gray-500">Overview metrics, student signups growth, and revenue analytics.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="dashboard-card animate-pulse">
              <div className="h-4 w-16 bg-gray-100 dark:bg-gray-800 rounded mb-3" />
              <div className="h-8 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold text-brand-black dark:text-white">Admin Dashboard</h1>
          <p className="text-xs text-gray-500">Overview metrics, student signups growth, and revenue analytics.</p>
        </div>
        <div className="bg-white dark:bg-brand-darkGray rounded-2xl border border-gray-200/50 dark:border-gray-800/80 p-12 text-center space-y-4">
          <AlertCircle className="h-10 w-10 mx-auto text-red-400" />
          <div>
            <h3 className="text-sm font-bold text-brand-black dark:text-white">Failed to load dashboard</h3>
            <p className="text-xs text-gray-500 mt-1">{error}</p>
          </div>
          <button onClick={fetchStats} className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-red text-white rounded-full text-xs font-bold hover:bg-red-600 transition-colors">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const widgetList = [
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: Users, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
    { label: 'Active Students', value: stats?.activeStudents || 0, icon: TrendingUp, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
    { label: 'Total Teachers', value: stats?.totalTeachers || 0, icon: GraduationCap, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' },
    { label: 'Total Courses', value: stats?.totalCourses || 0, icon: BookOpen, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
    { label: 'Total Revenue', value: `৳${stats?.revenue || 0}`, icon: DollarSign, color: 'text-red-500 bg-red-50 dark:bg-red-950/20' },
    { label: 'Enrollments Count', value: stats?.totalEnrollments || 0, icon: CreditCard, color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/20' }
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-xl font-extrabold text-brand-black dark:text-white">Admin Dashboard</h1>
        <p className="text-xs text-gray-500">Overview metrics, student signups growth, and revenue analytics.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
        {widgetList.map((widget, idx) => {
          const Icon = widget.icon;
          return (
            <div key={idx} className="dashboard-card flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{widget.label}</span>
                <div className={`p-2 rounded-lg ${widget.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <h3 className="text-lg font-extrabold text-brand-black dark:text-white leading-tight">{widget.value}</h3>
            </div>
          );
        })}
      </div>

      {growthData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-white dark:bg-brand-darkGray p-6 rounded-2xl border border-gray-150/50 dark:border-gray-800/80 space-y-4">
            <h3 className="text-xs font-bold uppercase text-gray-400">Student Signups Growth</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="studentGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF1D25" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#FF1D25" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="students" stroke="#FF1D25" strokeWidth={2} fillOpacity={1} fill="url(#studentGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white dark:bg-brand-darkGray p-6 rounded-2xl border border-gray-150/50 dark:border-gray-800/80 space-y-4">
            <h3 className="text-xs font-bold uppercase text-gray-400">Monthly Revenue Stream (৳)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#FF1D25" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {courseStats.length > 0 && (
        <div className="bg-white dark:bg-brand-darkGray p-6 rounded-2xl border border-gray-150/50 dark:border-gray-800/80 space-y-4">
          <h3 className="text-xs font-bold uppercase text-gray-400">Course Performance</h3>
          <div className="space-y-3">
            {courseStats.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-brand-black/20 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-brand-black dark:text-white">{c.name}</p>
                  <p className="text-[10px] text-gray-400">{c.enrollments} enrollments</p>
                </div>
                <span className="text-sm font-black text-brand-red">৳{c.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
