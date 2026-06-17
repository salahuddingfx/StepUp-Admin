import React, { useState, useEffect } from 'react';
import { getUsers, toggleUserStatus, updateUserRole, deleteUser } from '../services/admin.service';
import { UserX, UserCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mocks fallback
  const mockStudents = [
    { _id: 's1', name: 'Tahmid Hasan', email: 'tahmid@gmail.com', role: 'student', isActive: true, createdAt: '2026-06-05T10:00:00Z' },
    { _id: 's2', name: 'Nusrat Jahan', email: 'nusrat@gmail.com', role: 'student', isActive: false, createdAt: '2026-06-08T12:00:00Z' }
  ];

  const fetchStudents = async () => {
    try {
      const res = await getUsers();
      if (res.success) {
        // Show all users who are students
        const list = res.users.filter(u => u.role === 'student');
        setStudents(list);
      } else {
        setStudents(mockStudents);
      }
    } catch (err) {
      setStudents(mockStudents);
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
      setStudents(prev => prev.map(s => s._id === id ? { ...s, isActive: !s.isActive } : s));
      toast.success('Status toggled locally (mock)!');
    }
  };

  const handleRoleChange = async (id, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
      const res = await updateUserRole(id, newRole);
      if (res.success) {
        toast.success(res.message);
        // Since this page lists students, remove the user from student state if role changed
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
      setStudents(prev => prev.filter(s => s._id !== id));
      toast.success('User deleted (mock)!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold text-brand-black dark:text-white">Student & User Directory</h2>
        <p className="text-xs text-gray-500">Monitor student logins, suspension states, role updates and accounts deletion.</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-gray-500">Loading student directories...</div>
      ) : (
        <div className="bg-white dark:bg-brand-darkGray rounded-2xl border border-gray-200/50 dark:border-gray-800/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-brand-black/20 text-gray-400 font-bold border-b border-gray-100 dark:border-gray-800">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Change Role</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {students.map(student => (
                  <tr key={student._id} className="hover:bg-gray-50/50 dark:hover:bg-brand-black/10">
                    <td className="p-4 font-bold">{student.name}</td>
                    <td className="p-4 text-gray-500">{student.email}</td>
                    <td className="p-4 text-gray-400">{new Date(student.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                        student.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-650'
                      }`}>
                        {student.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={student.role}
                        onChange={(e) => handleRoleChange(student._id, e.target.value)}
                        className="px-2 py-1 bg-white dark:bg-brand-black border border-gray-200 dark:border-gray-800 rounded text-[10px] focus:outline-none"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4 flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleToggleStatus(student._id)}
                        className={`p-1.5 rounded text-white ${
                          student.isActive ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'
                        }`}
                        title={student.isActive ? 'Suspend User' : 'Activate User'}
                      >
                        {student.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(student._id)}
                        className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
