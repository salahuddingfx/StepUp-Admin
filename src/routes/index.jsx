import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess, logoutUser } from '../store/authSlice';
import api from '../services/api';

// Layout
import AdminLayout from '../layouts/AdminLayout';

// Pages
import Dashboard from '../pages/Dashboard';
import Students from '../pages/Students';
import Teachers from '../pages/Teachers';
import Courses from '../pages/Courses';
import Quizzes from '../pages/Quizzes';
import Assignments from '../pages/Assignments';
import Resources from '../pages/Resources';
import Payments from '../pages/Payments';
import Transactions from '../pages/Transactions';
import Blogs from '../pages/Blogs';
import Testimonials from '../pages/Testimonials';
import Settings from '../pages/Settings';
import HomepageMedia from '../pages/HomepageMedia';
import Login from '../pages/Login';

const AdminRouteGuard = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [checking, setChecking] = useState(!isAuthenticated);

  useEffect(() => {
    const checkSession = async () => {
      if (isAuthenticated) {
        setChecking(false);
        return;
      }

      try {
        const res = await api.get('/users/profile');
        if (res.success && res.user && res.user.role === 'admin') {
          dispatch(loginSuccess({ user: res.user }));
        } else {
          dispatch(logoutUser());
        }
      } catch (err) {
        dispatch(logoutUser());
      } finally {
        setChecking(false);
      }
    };

    checkSession();
  }, [isAuthenticated, dispatch]);

  if (checking) {
    return (
      <div className="min-h-screen bg-brand-black text-gray-400 flex items-center justify-center text-xs font-semibold select-none">
        Restoring administrator session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
        <Route path="quizzes" element={<Quizzes />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="resources" element={<Resources />} />
        <Route path="payments" element={<Payments />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="blogs" element={<Blogs />} />
        <Route path="testimonials" element={<Testimonials />} />
        <Route path="settings" element={<Settings />} />
        <Route path="homepage" element={<HomepageMedia />} />
      </Route>
      
      <Route path="/login" element={<Login />} />
      
      {/* Catch-all redirects */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AppRoutes;
