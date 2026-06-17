import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Award, Plus, X, Loader2, Trash2, AlertCircle, RefreshCw, Eye, Search } from 'lucide-react';
import { getCertificates, issueCertificate, deleteCertificate, getUsers, getCourses } from '../services/admin.service';

const CertMgmt = () => {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [search, setSearch] = useState('');

  const fetchCerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCertificates();
      if (res.success) {
        setCerts(res.certificates);
      } else {
        throw new Error(res.message || 'Failed to load certificates');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCerts(); }, [fetchCerts]);

  const openIssue = async () => {
    try {
      const [usersRes, coursesRes] = await Promise.all([getUsers(), getCourses()]);
      if (usersRes.success) setStudents(usersRes.users.filter(u => u.role === 'student'));
      if (coursesRes.success) setCourses(coursesRes.courses);
    } catch (err) {
      toast.error('Failed to load students/courses');
    }
    setSelectedStudent('');
    setSelectedCourse('');
    setShowModal(true);
  };

  const handleIssue = async () => {
    if (!selectedStudent || !selectedCourse) {
      toast.error('Please select a student and course');
      return;
    }
    setSaving(true);
    try {
      const res = await issueCertificate(selectedStudent, selectedCourse);
      if (res.success) {
        toast.success('Certificate issued successfully');
        setShowModal(false);
        fetchCerts();
      } else {
        throw new Error(res.message || 'Failed to issue certificate');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this certificate? This cannot be undone.')) return;
    try {
      await deleteCertificate(id);
      toast.success('Certificate deleted');
      fetchCerts();
    } catch (err) {
      toast.error(err.message || 'Failed to delete certificate');
    }
  };

  const filtered = certs.filter(c =>
    c.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.course?.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.certificateId?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1"><h2 className="text-xl font-extrabold text-brand-black dark:text-white">Certificates</h2><p className="text-xs text-gray-500">Manage student completion certificates</p></div>
        <div className="bg-white dark:bg-brand-darkGray rounded-2xl border border-gray-200/50 dark:border-gray-800/80 p-8 space-y-4 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="space-y-1"><h2 className="text-xl font-extrabold text-brand-black dark:text-white">Certificates</h2><p className="text-xs text-gray-500">Manage student completion certificates</p></div>
        <div className="bg-white dark:bg-brand-darkGray rounded-2xl border border-gray-200/50 dark:border-gray-800/80 p-12 text-center space-y-4">
          <AlertCircle className="h-10 w-10 mx-auto text-red-400" />
          <p className="text-sm text-gray-500">{error}</p>
          <button onClick={fetchCerts} className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-red text-white rounded-full text-xs font-bold hover:bg-red-600 transition-colors">
            <RefreshCw className="h-3.5 w-3.5" /><span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-brand-black dark:text-white">Certificates</h2>
          <p className="text-xs text-gray-500">View and manage student completion certificates</p>
        </div>
        <button onClick={openIssue} className="flex items-center space-x-2 px-4 py-2.5 bg-brand-red hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-md">
          <Plus className="h-4 w-4" /><span>Issue Certificate</span>
        </button>
      </div>

      {certs.length > 0 && (
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search certificates..." className="w-full pl-9 pr-3 py-2 bg-transparent border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none" />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-brand-darkGray rounded-2xl border border-gray-200/50 dark:border-gray-800/80 p-12 text-center space-y-3">
          <Award className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-bold text-brand-black dark:text-white">{search ? 'No matching certificates' : 'No certificates issued yet'}</p>
          <p className="text-xs text-gray-500">Certificates are auto-issued when students complete courses, or you can issue manually.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-brand-darkGray rounded-2xl border border-gray-200/50 dark:border-gray-800/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-brand-black/20 text-gray-400 font-bold border-b border-gray-100 dark:border-gray-800">
                  <th className="p-4">Student</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Certificate ID</th>
                  <th className="p-4">Grade</th>
                  <th className="p-4">Issued</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map(cert => (
                  <tr key={cert._id} className="hover:bg-gray-50/50 dark:hover:bg-brand-black/10">
                    <td className="p-4">
                      <div className="font-bold">{cert.student?.name}</div>
                      <div className="text-[10px] text-gray-400">{cert.student?.email}</div>
                    </td>
                    <td className="p-4 text-gray-500 max-w-[160px] truncate">{cert.courseTitle || cert.course?.title}</td>
                    <td className="p-4 font-mono text-[10px] text-gray-500">{cert.certificateId}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded text-[9px] font-bold">{cert.grade || 'A+'}</span>
                    </td>
                    <td className="p-4 text-gray-400">{new Date(cert.issueDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-2">
                        {cert.pdfUrl && (
                          <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all" title="View">
                            <Eye className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button onClick={() => handleDelete(cert._id)} className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
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

      <AnimatePresence>
        {showModal && (
          <>
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => !saving && setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-brand-darkGray rounded-3xl border border-gray-200/50 dark:border-gray-800/80 shadow-2xl max-w-md w-full overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800/50">
                  <div>
                    <h3 className="text-sm font-extrabold text-brand-black dark:text-white">Issue Certificate</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Manually issue a certificate to a student</p>
                  </div>
                  <button onClick={() => setShowModal(false)} disabled={saving} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold">Student</label>
                    <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="w-full px-3 py-2 bg-transparent border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none">
                      <option value="">Select a student...</option>
                      {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold">Course</label>
                    <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="w-full px-3 py-2 bg-transparent border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none">
                      <option value="">Select a course...</option>
                      {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                    </select>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <button onClick={handleIssue} disabled={saving} className="w-full py-2.5 bg-brand-red hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Award className="h-4 w-4" /><span>Issue Certificate</span></>}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CertMgmt;
