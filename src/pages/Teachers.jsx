import React, { useState, useEffect } from 'react';
import { getTeachers, updateTeacherStatus } from '../services/admin.service';
import { Check, X, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mocks fallback
  const mockTeachers = [
    { _id: 't1', user: { name: 'Dr. Sarah Rahman', email: 'sarah@gmail.com', avatar: '' }, bio: 'Ex-IELTS examiner.', approvalStatus: 'approved', rating: 4.9, expertise: ['HSC Grammar', 'IELTS Speaking'] },
    { _id: 't2', user: { name: 'James Miller', email: 'james@gmail.com', avatar: '' }, bio: 'Native spoken trainer.', approvalStatus: 'pending', rating: 4.8, expertise: ['Accent Training'] }
  ];

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await getTeachers();
        if (res.success) {
          setTeachers(res.teachers);
        } else {
          setTeachers(mockTeachers);
        }
      } catch (err) {
        setTeachers(mockTeachers);
      } finally {
        setLoading(false);
      }
    };
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
      setTeachers(prev => prev.map(t => t._id === id ? { ...t, approvalStatus: status } : t));
      toast.success(`Teacher updated to ${status} (mock)!`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold text-brand-black dark:text-white">Instructor Registrations</h2>
        <p className="text-xs text-gray-500">Review, approve, or suspend teacher credentials.</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-gray-500">Loading teacher rosters...</div>
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
                      <div className="h-7 w-7 rounded-full bg-brand-red/15 text-brand-red flex items-center justify-center font-bold">
                        {teacher.user?.name[0]}
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
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded capitalize ${
                        teacher.approvalStatus === 'approved' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : teacher.approvalStatus === 'rejected'
                          ? 'bg-red-50 text-red-650'
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {teacher.approvalStatus}
                      </span>
                    </td>
                    <td className="p-4 flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleUpdateStatus(teacher._id, 'approved')}
                        disabled={teacher.approvalStatus === 'approved'}
                        className="p-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-lg"
                        title="Approve"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(teacher._id, 'rejected')}
                        disabled={teacher.approvalStatus === 'rejected'}
                        className="p-1.5 bg-red-500 hover:bg-red-650 disabled:opacity-40 text-white rounded-lg"
                        title="Reject"
                      >
                        <X className="h-4 w-4" />
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

export default Teachers;
