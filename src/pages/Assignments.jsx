import React, { useState, useEffect } from 'react';
import { 
  getAssignments, 
  createAssignment, 
  deleteAssignment, 
  getCourses, 
  getCourseById 
} from '../services/admin.service';
import api from '../services/api';
import { Plus, Trash2, X, Loader2, ClipboardCheck, Calendar, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [structureLoading, setStructureLoading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form States
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [maxPoints, setMaxPoints] = useState(100);
  const [dueDate, setDueDate] = useState('');
  const [pdfFileUrl, setPdfFileUrl] = useState('');

  const mockAssignments = [
    {
      _id: 'a1',
      title: 'Phonics Homework Worksheet',
      instructions: 'Please write down 10 words containing the short "a" vowel sound. Submit a scanned PDF of your written work.',
      maxPoints: 100,
      fileUrl: 'https://cloudinary.com/sample.pdf',
      dueDate: '2026-06-30T23:59:59.000Z',
      lesson: {
        _id: 'less1',
        title: 'Short Vowels Introduction',
        module: {
          _id: 'mod1',
          title: 'Module 1: Sound Foundations',
          course: {
            _id: 'c1',
            title: 'English Phonics Masterclass'
          }
        }
      }
    }
  ];

  const fetchAssignmentsList = async () => {
    try {
      const res = await getAssignments();
      if (res.success) {
        setAssignments(res.assignments);
      } else {
        setAssignments(mockAssignments);
      }
    } catch (err) {
      setAssignments(mockAssignments);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursesList = async () => {
    try {
      const res = await getCourses();
      if (res.success) {
        setCourses(res.courses);
      }
    } catch (err) {
      toast.error('Failed to load courses directory');
    }
  };

  useEffect(() => {
    fetchAssignmentsList();
    fetchCoursesList();
  }, []);

  // Handle Course Change -> Load Modules & Lessons
  const handleCourseChange = async (courseId) => {
    setSelectedCourseId(courseId);
    setSelectedModuleId('');
    setSelectedLessonId('');
    setModules([]);
    setLessons([]);

    if (!courseId) return;

    setStructureLoading(true);
    try {
      const res = await getCourseById(courseId);
      if (res.success && res.structure) {
        setModules(res.structure);
      } else {
        toast.error('No curriculum module found for this course.');
      }
    } catch (err) {
      toast.error('Failed to load module structure');
    } finally {
      setStructureLoading(false);
    }
  };

  // Handle Module Change -> Populates Lessons
  const handleModuleChange = (moduleId) => {
    setSelectedModuleId(moduleId);
    setSelectedLessonId('');
    setLessons([]);

    const foundModule = modules.find(m => m._id === moduleId);
    if (foundModule && foundModule.lessons) {
      setLessons(foundModule.lessons);
    }
  };

  // Upload PDF Attachment directly to Cloudinary
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'assignments/worksheets');

    setUploadingPdf(true);
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.success) {
        setPdfFileUrl(res.url);
        toast.success('Assignment PDF uploaded successfully to Cloudinary!');
      } else {
        toast.error('PDF upload failed');
      }
    } catch (err) {
      toast.error(err.message || 'PDF upload failed');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      const res = await deleteAssignment(assignmentId);
      if (res.success) {
        toast.success(res.message || 'Assignment deleted');
        fetchAssignmentsList();
      }
    } catch (err) {
      toast.error(err.message || 'Delete assignment failed');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLessonId) {
      return toast.error('Please select a lesson to link this assignment');
    }
    if (!assignmentTitle.trim()) {
      return toast.error('Assignment title is required');
    }
    if (!instructions.trim()) {
      return toast.error('Instructions are required');
    }
    if (!dueDate) {
      return toast.error('Due date is required');
    }

    setSubmitting(true);
    try {
      const res = await createAssignment({
        title: assignmentTitle.trim(),
        instructions: instructions.trim(),
        maxPoints: Number(maxPoints),
        fileUrl: pdfFileUrl, // Attachment URL
        dueDate: new Date(dueDate).toISOString(),
        lessonId: selectedLessonId
      });

      if (res.success) {
        toast.success('Assignment created successfully!');
        setShowModal(false);
        // Reset States
        setAssignmentTitle('');
        setInstructions('');
        setMaxPoints(100);
        setDueDate('');
        setPdfFileUrl('');
        setSelectedCourseId('');
        setSelectedModuleId('');
        setSelectedLessonId('');
        fetchAssignmentsList();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-brand-black dark:text-white">Assignment Manager</h2>
          <p className="text-xs text-gray-500">Create written homework sheets, instruction sets, grade thresholds, and attach supplementary PDFs.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-brand-red text-white text-xs font-bold rounded-lg shadow-md shadow-brand-red/10 animate-in fade-in"
        >
          <Plus className="h-4 w-4" />
          <span>New Assignment</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-gray-500">Loading assignments...</div>
      ) : (
        <div className="bg-white dark:bg-brand-darkGray rounded-2xl border border-gray-200/50 dark:border-gray-800/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-brand-black/20 text-gray-400 font-bold border-b border-gray-100 dark:border-gray-800">
                  <th className="p-4">Assignment Title</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Module</th>
                  <th className="p-4">Linked Lesson</th>
                  <th className="p-4 text-center">Due Date</th>
                  <th className="p-4 text-center">Max Points</th>
                  <th className="p-4 text-center">Attachment</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-400 italic">No assignments created yet. Click "New Assignment" to get started.</td>
                  </tr>
                ) : (
                  assignments.map(a => (
                    <tr key={a._id} className="hover:bg-gray-50/50 dark:hover:bg-brand-black/10">
                      <td className="p-4 font-bold flex items-center space-x-2">
                        <ClipboardCheck className="h-4 w-4 text-brand-red shrink-0" />
                        <span className="truncate max-w-[200px]">{a.title}</span>
                      </td>
                      <td className="p-4 text-gray-550 truncate max-w-[150px]">{a.lesson?.module?.course?.title || 'Unknown Course'}</td>
                      <td className="p-4 text-gray-400 truncate max-w-[150px]">{a.lesson?.module?.title || 'N/A'}</td>
                      <td className="p-4 text-gray-500 font-medium truncate max-w-[150px]">{a.lesson?.title || 'Unknown Lesson'}</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center space-x-1 text-gray-650 dark:text-gray-300 font-medium">
                          <Calendar className="h-3 w-3 text-brand-red shrink-0" />
                          <span>{new Date(a.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-brand-red">{a.maxPoints} pts</td>
                      <td className="p-4 text-center">
                        {a.fileUrl ? (
                          <a 
                            href={a.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 px-2 py-0.5 bg-gray-100 dark:bg-brand-black hover:bg-gray-200 dark:hover:bg-brand-black/60 rounded text-brand-red font-bold"
                          >
                            <FileText className="h-3 w-3 shrink-0" />
                            <span>PDF</span>
                          </a>
                        ) : (
                          <span className="text-gray-400 italic">None</span>
                        )}
                      </td>
                      <td className="p-4 flex items-center justify-center">
                        <button
                          onClick={() => handleDeleteAssignment(a._id)}
                          className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          title="Delete Assignment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-darkGray max-w-2xl w-full rounded-2xl p-6 border border-gray-100 dark:border-gray-800 space-y-4 shadow-xl relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowModal(false)}
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="border-b border-gray-100 dark:border-gray-850 pb-2">
              <h3 className="text-sm font-extrabold text-brand-black dark:text-white">Create Practical Assignment</h3>
              <p className="text-[10px] text-gray-400">Select course curriculum path, specify grade limits, instructions, and upload worksheets.</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
              {/* Cascade Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">1. Select Course</label>
                  <select
                    required
                    value={selectedCourseId}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-brand-darkGray border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none text-brand-black dark:text-gray-200"
                  >
                    <option value="">-- Choose Course --</option>
                    {courses.map(c => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">2. Select Module</label>
                  <div className="relative">
                    <select
                      required
                      disabled={!selectedCourseId || structureLoading}
                      value={selectedModuleId}
                      onChange={(e) => handleModuleChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-brand-darkGray border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none text-brand-black dark:text-gray-200 disabled:opacity-50"
                    >
                      <option value="">-- Choose Module --</option>
                      {modules.map(m => (
                        <option key={m._id} value={m._id}>{m.title}</option>
                      ))}
                    </select>
                    {structureLoading && <Loader2 className="absolute right-3 top-2.5 h-3.5 w-3.5 animate-spin text-gray-400" />}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">3. Select Lesson</label>
                  <select
                    required
                    disabled={!selectedModuleId}
                    value={selectedLessonId}
                    onChange={(e) => setSelectedLessonId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-brand-darkGray border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none text-brand-black dark:text-gray-200 disabled:opacity-50"
                  >
                    <option value="">-- Choose Lesson --</option>
                    {lessons.map(l => (
                      <option key={l._id} value={l._id}>{l.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title & Limits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/50 dark:bg-brand-black/15 p-3.5 rounded-xl border border-gray-150 dark:border-gray-850">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Assignment Title</label>
                  <input 
                    type="text" 
                    required 
                    value={assignmentTitle}
                    onChange={(e) => setAssignmentTitle(e.target.value)}
                    placeholder="e.g. Essay Writing Worksheet"
                    className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Max Points</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    value={maxPoints}
                    onChange={(e) => setMaxPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                  />
                </div>
              </div>

              {/* Instructions & Date */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Submission Instructions</label>
                  <textarea 
                    required 
                    rows="3"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Describe step-by-step guidelines for students..."
                    className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Due Date</label>
                    <input 
                      type="date" 
                      required 
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none text-gray-500"
                    />
                  </div>

                  {/* File Attachment Uploader */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Supplementary Worksheet (PDF)</label>
                    <div className="flex space-x-2">
                      <input 
                        type="url" 
                        value={pdfFileUrl}
                        onChange={(e) => setPdfFileUrl(e.target.value)}
                        placeholder="PDF Url (https://...)"
                        className="flex-grow px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                      />
                      <label className="px-3 py-2 bg-brand-black text-white hover:bg-black rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center justify-center shrink-0">
                        {uploadingPdf ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          'Upload PDF'
                        )}
                        <input 
                          type="file" 
                          accept=".pdf"
                          onChange={handlePdfUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100 dark:border-gray-850">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex items-center justify-center space-x-1.5 px-6 py-2.5 bg-brand-red hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-brand-red/10"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Assignment</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;
