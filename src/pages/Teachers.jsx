import React, { useState, useEffect } from 'react';
import { getTeachers, updateTeacherStatus } from '../services/admin.service';
import { GraduationCap, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTeachers();
      if (res.success) {
        setTeachers(res.teachers);
      } else {
        setError('Failed to fetch teacher data');
      }
    } catch (err) {
      setError(err.message || 'Failed to load teachers. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await updateTeacherStatus(id, status);
      if (res.success) {
        toast.success(res.message);
        setTeachers(prev => prev.map(t => t._id === id ? { ...t, approvalStatus: status } : t));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update teacher status');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-brand-black dark:text-white">Instructor Registrations</h2>
          <p className="text-xs text-gray-500">Review, approve, or suspend teacher credentials.</p>
        </div>
        <div className="bg-white dark:bg-brand-darkGray rounded-2xl border border-gray-200/50 dark:border-gray-800/80 p-8">
          <div className="space-y-4 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-brand-black dark:text-white">Instructor Registrations</h2>
          <p className="text-xs text-gray-500">Review, approve, or suspend teacher credentials.</p>
        </div>
        <div className="bg-white dark:bg-brand-darkGray rounded-2xl border border-gray-200/50 dark:border-gray-800/80 p-12 text-center space-y-4">
          <AlertCircle className="h-10 w-10 mx-auto text-red-400" />
          <div>
            <h3 className="text-sm font-bold text-brand-black dark:text-white">Failed to load teachers</h3>
            <p className="text-xs text-gray-500 mt-1">{error}</p>
          </div>
          <button onClick={fetchTeachers} className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-red text-white rounded-full text-xs font-bold hover:bg-red-600 transition-colors">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold text-brand-black dark:text-white">Instructor Registrations</h2>
        <p className="text-xs text-gray-500">Review, approve, or suspend teacher credentials.</p>
      </div>

      {teachers.length === 0 ? (
        <div className="bg-white dark:bg-brand-darkGray rounded-2xl border border-gray-200/50 dark:border-gray-800/80 p-12 text-center space-y-3">
          <GraduationCap className="h-10 w-10 mx-auto text-gray-300" />
          <h3 className="text-sm font-bold text-brand-black dark:text-white">No teacher registrations yet</h3>
          <p className="text-xs text-gray-500">Teachers will appear here once they sign up and request approval.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-brand-darkGray rounded-2xl border border-gray-200/50 dark:border-gray-800/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-brand-black/20 text-gray-400 font-bold border-b border-gray-100 dark:border-gray-800">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Expertise</th>
                  <th className="p-4">Approval Status</th>
                  <th className="p-4 text-center">Approve / Reject</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {teachers.map(teacher => (
                  <tr key={teacher._id} className="hover:bg-gray-50/50 dark:hover:bg-brand-black/10">
                    <td className="p-4 font-bold flex items-center space-x-2">
                      <div className="h-7 w-7 rounded-full bg-brand-red/15 text-brand-red flex items-center justify-center font-bold text-xs">
                        {teacher.user?.name?.[0] || '?'}
                      </div>
                      <span>{teacher.user?.name}</span>
                    </td>
                    <td className="p-4 text-gray-500">{teacher.user?.email}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {teacher.expertise?.map((exp, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-brand-black/30 text-[9px] rounded font-semibold text-gray-500">
                            {exp}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full capitalize ${
                        teacher.approvalStatus === 'approved' 
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' 
                          : teacher.approvalStatus === 'rejected'
                          ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                      }`}>
                        {teacher.approvalStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleUpdateStatus(teacher._id, 'approved')}
                          disabled={teacher.approvalStatus === 'approved'}
                          className="p-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-lg transition-all disabled:cursor-not-allowed"
                          title="Approve"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" /></svg>
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(teacher._id, 'rejected')}
                          disabled={teacher.approvalStatus === 'rejected'}
                          className="p-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white rounded-lg transition-all disabled:cursor-not-allowed"
                          title="Reject"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
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

export default Teachers;
