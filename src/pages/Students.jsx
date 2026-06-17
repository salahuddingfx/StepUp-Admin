import React, { useState, useEffect } from 'react';
import { getUsers, toggleUserStatus, updateUserRole, deleteUser } from '../services/admin.service';
import { Users, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUsers();
      if (res.success) {
        const list = res.users.filter(u => u.role === 'student');
        setStudents(list);
      } else {
        setError('Failed to fetch student data');
      }
    } catch (err) {
      setError(err.message || 'Failed to load students. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      const res = await toggleUserStatus(id);
      if (res.success) {
        toast.success(res.message);
        setStudents(prev => prev.map(s => s._id === id ? { ...s, isActive: !s.isActive } : s));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to toggle user status');
    }
  };

  const handleRoleChange = async (id, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
      const res = await updateUserRole(id, newRole);
      if (res.success) {
        toast.success(res.message);
        if (newRole !== 'student') {
          setStudents(prev => prev.filter(s => s._id !== id));
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to change user role');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user and all their profiles?')) return;
    try {
      const res = await deleteUser(id);
      if (res.success) {
        toast.success(res.message);
        setStudents(prev => prev.filter(s => s._id !== id));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-brand-black dark:text-white">Student & User Directory</h2>
          <p className="text-xs text-gray-500">Monitor student logins, suspension states, role updates and accounts deletion.</p>
        </div>
        <div className="bg-white dark:bg-brand-darkGray rounded-2xl border border-gray-200/50 dark:border-gray-800/80 p-8">
          <div className="space-y-4 animate-pulse">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-brand-black dark:text-white">Student & User Directory</h2>
          <p className="text-xs text-gray-500">Monitor student logins, suspension states, role updates and accounts deletion.</p>
        </div>
        <div className="bg-white dark:bg-brand-darkGray rounded-2xl border border-gray-200/50 dark:border-gray-800/80 p-12 text-center space-y-4">
          <AlertCircle className="h-10 w-10 mx-auto text-red-400" />
          <div>
            <h3 className="text-sm font-bold text-brand-black dark:text-white">Failed to load students</h3>
            <p className="text-xs text-gray-500 mt-1">{error}</p>
          </div>
          <button onClick={fetchStudents} className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-red text-white rounded-full text-xs font-bold hover:bg-red-600 transition-colors">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-brand-black dark:text-white">Student & User Directory</h2>
          <p className="text-xs text-gray-500">Monitor student logins, suspension states, role updates and accounts deletion.</p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-400 bg-gray-50 dark:bg-brand-black/30 px-3 py-1.5 rounded-full">
          <Users className="h-3.5 w-3.5" />
          <span className="font-bold">{students.length} student{students.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="bg-white dark:bg-brand-darkGray rounded-2xl border border-gray-200/50 dark:border-gray-800/80 p-12 text-center space-y-3">
          <Users className="h-10 w-10 mx-auto text-gray-300" />
          <h3 className="text-sm font-bold text-brand-black dark:text-white">No students registered yet</h3>
          <p className="text-xs text-gray-500">Students will appear here once they sign up for an account.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-brand-darkGray rounded-2xl border border-gray-200/50 dark:border-gray-800/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-brand-black/20 text-gray-400 font-bold border-b border-gray-100 dark:border-gray-800">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Registered</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Role</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {students.map(student => (
                  <tr key={student._id} className="hover:bg-gray-50/50 dark:hover:bg-brand-black/10 transition-colors">
                    <td className="p-4 font-bold text-brand-black dark:text-white">{student.name}</td>
                    <td className="p-4 text-gray-500">{student.email}</td>
                    <td className="p-4 text-gray-400">{formatDate(student.createdAt)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full ${
                        student.isActive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                      }`}>
                        {student.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={student.role}
                        onChange={(e) => handleRoleChange(student._id, e.target.value)}
                        className="px-2 py-1 bg-white dark:bg-brand-black border border-gray-200 dark:border-gray-800 rounded-lg text-[10px] font-semibold focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-colors cursor-pointer"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleToggleStatus(student._id)}
                          className={`p-1.5 rounded-lg text-white transition-all ${
                            student.isActive
                              ? 'bg-amber-500 hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/20'
                              : 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20'
                          }`}
                          title={student.isActive ? 'Suspend User' : 'Activate User'}
                        >
                          {student.isActive ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" /></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M18 1.5c2.9 0 5.25 2.35 5.25 5.25v3.75a.75.75 0 01-1.5 0V6.75a3.75 3.75 0 10-7.5 0v3a3 3 0 013 3v6.75a3 3 0 01-3 3H3.75a3 3 0 01-3-3v-6.75a3 3 0 013-3h9v-3c0-2.9 2.35-5.25 5.25-5.25z" /></svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(student._id)}
                          className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all hover:shadow-lg hover:shadow-red-500/20"
                          title="Delete User"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
