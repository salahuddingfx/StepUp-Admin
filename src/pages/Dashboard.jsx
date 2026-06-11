import React, { useState, useEffect } from 'react';
import { getStats } from '../services/admin.service';
import { 
  Users, GraduationCap, BookOpen, DollarSign, 
  CreditCard, ArrowUpRight, TrendingUp 
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

  // Mocks fallback
  const mockStats = {
    totalStudents: 154,
    activeStudents: 142,
    totalTeachers: 12,
    totalCourses: 5,
    revenue: 45000,
    totalEnrollments: 34
  };

  const mockGrowth = [
    { month: 'Jan', students: 15, revenue: 4500 },
    { month: 'Feb', students: 38, revenue: 9500 },
    { month: 'Mar', students: 64, revenue: 18000 },
    { month: 'Apr', students: 95, revenue: 27500 },
    { month: 'May', students: 128, revenue: 38000 },
    { month: 'Jun', students: 154, revenue: 45000 }
  ];

  const mockCourseStats = [
    { name: 'Fluent Spoken English', enrollments: 18, revenue: 22000 },
    { name: 'HSC Target A+ Grammar', enrollments: 10, revenue: 15000 },
    { name: 'SSC Prep Suite', enrollments: 6, revenue: 8000 }
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getStats();
        if (res.success) {
          setStats(res.stats);
          setCourseStats(res.courseStats || []);
          setGrowthData(res.monthlyGrowth || []);
        } else {
          setStats(mockStats);
          setGrowthData(mockGrowth);
          setCourseStats(mockCourseStats);
        }
      } catch (err) {
        setStats(mockStats);
        setGrowthData(mockGrowth);
        setCourseStats(mockCourseStats);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-xs text-gray-500">Loading admin statistics...</div>;
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
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-extrabold text-brand-black dark:text-white">Admin Dashboard</h1>
        <p className="text-xs text-gray-500">Overview metrics, student signups growth, and revenue analytics.</p>
      </div>

      {/* Stats Widgets Grid */}
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

      {/* Recharts Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Student growth Area chart */}
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

        {/* Revenue growth Bar chart */}
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
    </div>
  );
};

export default Dashboard;
