import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess } from '../store/authSlice';

// Layout
import AdminLayout from '../layouts/AdminLayout';

// Pages
import Dashboard from '../pages/Dashboard';
import Students from '../pages/Students';
import Teachers from '../pages/Teachers';
import Courses from '../pages/Courses';
import Payments from '../pages/Payments';
import Transactions from '../pages/Transactions';
import Blogs from '../pages/Blogs';
import Testimonials from '../pages/Testimonials';
import Settings from '../pages/Settings';

const AdminRouteGuard = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    const userParam = urlParams.get('user');

    if (tokenParam && userParam) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userParam));
        dispatch(loginSuccess({
          accessToken: tokenParam,
          user: parsedUser
        }));
        // Clean URL parameters
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      } catch (err) {
        console.error('Error parsing auth parameters:', err);
      }
    } else if (!isAuthenticated) {
      const clientUrl = import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173';
      window.location.href = `${clientUrl}/login`;
    }
  }, [isAuthenticated, dispatch]);

  if (!isAuthenticated && !new URLSearchParams(window.location.search).get('token')) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-400 flex items-center justify-center text-xs font-semibold">
        Redirecting to authentication portal...
      </div>
    );
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route 
        path="/admin" 
        element={
          <AdminRouteGuard>
            <AdminLayout />
          </AdminRouteGuard>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="courses" element={<Courses />} />
        <Route path="payments" element={<Payments />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="blogs" element={<Blogs />} />
        <Route path="testimonials" element={<Testimonials />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Catch-all redirects */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AppRoutes;
