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
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    // Automated Developer Mock Log in for pairing review
    if (!isAuthenticated) {
      dispatch(loginSuccess({
        accessToken: 'mock-admin-token-value',
        user: { name: 'Ahmed Shahriar', email: 'founder@englishstepup.com', role: 'admin', avatar: '' }
      }));
    }
  }, [isAuthenticated, dispatch]);

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
