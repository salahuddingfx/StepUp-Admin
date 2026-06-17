import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/authSlice';
import { toggleTheme } from '../store/themeSlice';
import { 
  LayoutDashboard, Users, GraduationCap, BookOpen, 
  CreditCard, Landmark, FileText, MessageSquare, 
  Settings, LogOut, Sun, Moon, Bell, Menu, X, ShieldAlert,
  FileSpreadsheet, ClipboardCheck, Home, Tag, Award
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logoutUser());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Teachers', path: '/admin/teachers', icon: GraduationCap },
    { name: 'Courses', path: '/admin/courses', icon: BookOpen },
    { name: 'Quiz Manager', path: '/admin/quizzes', icon: FileSpreadsheet },
    { name: 'Assignment Manager', path: '/admin/assignments', icon: ClipboardCheck },
    { name: 'Resources Manager', path: '/admin/resources', icon: FileText },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Transactions', path: '/admin/transactions', icon: Landmark },
    { name: 'Blogs', path: '/admin/blogs', icon: FileText },
    { name: 'Testimonials', path: '/admin/testimonials', icon: MessageSquare },
    { name: 'Certificates', path: '/admin/certificates', icon: Award },
    { name: 'Coupons', path: '/admin/coupons', icon: Tag },
    { name: 'Homepage Media', path: '/admin/homepage', icon: Home },
    { name: 'Settings', path: '/admin/settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-black flex transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-brand-black text-gray-300 transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex md:flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-800">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/StepUp.jpg" alt="StepUp Logo" className="h-8 w-8 rounded-lg object-cover shadow-lg border border-gray-800" />
            <span className="font-extrabold text-md tracking-wider text-white">
              StepUp <span className="text-xs text-brand-red font-medium">SaaS Admin</span>
            </span>
          </Link>
          <button 
            className="md:hidden p-1 rounded-md text-gray-400 hover:bg-gray-800"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Admin Card */}
        <div className="p-4 border-b border-gray-850">
          <div className="flex items-center space-x-3 p-2 bg-gray-850/40 rounded-xl">
            <div className="h-9 w-9 rounded-full bg-brand-red/10 text-brand-red flex items-center justify-center font-bold border border-brand-red/20 shrink-0">
              A
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold truncate text-white">{user?.name || 'Administrator'}</h4>
              <p className="text-[9px] text-gray-500 truncate uppercase tracking-widest font-extrabold">{(user?.role === 'superadmin' ? 'Super Admin' : 'Administrator')}</p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive 
                    ? 'bg-brand-red text-white shadow-md shadow-brand-red/15' 
                    : 'text-gray-400 hover:bg-gray-850 hover:text-white'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-950/10 transition-all"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-brand-darkGray border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 z-10">
          <button
            className="md:hidden p-1.5 text-gray-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Quick Stats Widget */}
          <div className="hidden sm:flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 text-brand-red" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Enterprise Security Layer Active</span>
          </div>

          {/* Actions toolbar */}
          <div className="flex items-center space-x-4 ml-auto">
            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-brand-black/40 text-gray-500 dark:text-gray-300"
            >
              {mode === 'dark' ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notification bell */}
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-brand-black/40 text-gray-500 dark:text-gray-300 relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-brand-red animate-ping" />
            </button>
          </div>
        </header>

        {/* Page contents */}
        <main className="flex-grow p-6 overflow-y-auto w-full mx-auto max-w-7xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
