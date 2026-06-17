import React, { useState, useEffect } from 'react';
import { getLessons, updateLesson } from '../services/admin.service';
import api from '../services/api';
import { Edit, FileText, CheckCircle, XCircle, X, Loader2, BookOpen, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const Resources = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);

  // Edit Form States
  const [content, setContent] = useState('');
  const [pdfNotesUrl, setPdfNotesUrl] = useState('');

  const mockLessons = [
    {
      _id: 'less1',
      title: 'Short Vowels Introduction',
      description: 'Introduction to short vowel sounds in phonics.',
      content: '# Study Notes\nLearn the sounds of A, E, I, O, U.',
      pdfNotesUrl: 'https://cloudinary.com/notes.pdf',
      duration: '30 mins',
      videoUrl: 'https://w3schools.com/movie.mp4',
      order: 0,
      module: {
        _id: 'mod1',
        title: 'Module 1: Sound Foundations',
        course: {
          _id: 'c1',
          title: 'English Phonics Masterclass'
        }
      }
    }
  ];

  const fetchLessonsList = async () => {
    try {
      const res = await getLessons();
      if (res.success) {
        setLessons(res.lessons);
      } else {
        setLessons(mockLessons);
      }
    } catch (err) {
      setLessons(mockLessons);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessonsList();
  }, []);

  const handleEditClick = (lesson) => {
    setSelectedLesson(lesson);
    setContent(lesson.content || '');
    setPdfNotesUrl(lesson.pdfNotesUrl || '');
    setShowModal(true);
  };

  // Upload Resource PDF directly to Cloudinary
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'lessons/resources');

    setUploadingPdf(true);
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.success) {
        setPdfNotesUrl(res.url);
        toast.success('Resource PDF uploaded successfully to Cloudinary!');
      } else {
        toast.error('PDF upload failed');
      }
    } catch (err) {
      toast.error(err.message || 'PDF upload failed');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLesson) return;

    setSubmitting(true);
    try {
      // Pass original lesson parameters to keep them intact, modifying only content and pdfNotesUrl
      const res = await updateLesson(selectedLesson._id, {
        title: selectedLesson.title,
        description: selectedLesson.description,
        videoUrl: selectedLesson.videoUrl,
        duration: selectedLesson.duration,
        order: selectedLesson.order,
        content: content.trim(),
        pdfNotesUrl: pdfNotesUrl.trim()
      });

      if (res.success) {
        toast.success('Resources updated successfully!');
        setShowModal(false);
        fetchLessonsList();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update lesson resources');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold text-brand-black dark:text-white">Resources & Notes Manager</h2>
        <p className="text-xs text-gray-500">Manage lesson learning assets: compose study notes in Markdown format and upload downloadable PDF lecture sheets.</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-gray-500">Loading lesson resources...</div>
      ) : (
        <div className="bg-white dark:bg-brand-darkGray rounded-2xl border border-gray-200/50 dark:border-gray-800/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-brand-black/20 text-gray-400 font-bold border-b border-gray-100 dark:border-gray-800">
                  <th className="p-4">Lesson Title</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Module</th>
                  <th className="p-4 text-center">Study Notes</th>
                  <th className="p-4 text-center">PDF Resource</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {lessons.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-400 italic">No lessons found. Please create lessons in the Course Directory first.</td>
                  </tr>
                ) : (
                  lessons.map(l => (
                    <tr key={l._id} className="hover:bg-gray-50/50 dark:hover:bg-brand-black/10">
                      <td className="p-4 font-bold flex items-center space-x-2">
                        <BookOpen className="h-4 w-4 text-brand-red shrink-0" />
                        <span className="truncate max-w-[200px]">{l.title}</span>
                      </td>
                      <td className="p-4 text-gray-550 truncate max-w-[180px]">{l.module?.course?.title || 'Unknown Course'}</td>
                      <td className="p-4 text-gray-400 truncate max-w-[180px]">{l.module?.title || 'N/A'}</td>
                      <td className="p-4 text-center">
                        {l.content && l.content.trim() ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450 rounded text-[10px] font-bold">
                            <CheckCircle className="h-3 w-3 shrink-0" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-gray-100 text-gray-400 dark:bg-brand-black/35 rounded text-[10px]">
                            <XCircle className="h-3 w-3 shrink-0" />
                            <span>Empty</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {l.pdfNotesUrl ? (
                          <a 
                            href={l.pdfNotesUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 px-2 py-0.5 bg-red-50 text-brand-red dark:bg-red-950/20 rounded font-bold hover:underline"
                          >
                            <FileText className="h-3 w-3 shrink-0" />
                            <span>Attached</span>
                            <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-gray-450 italic">None</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleEditClick(l)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-brand-black hover:bg-black text-white rounded text-[10px] font-bold transition-all"
                          title="Edit Resources"
                        >
                          <Edit className="h-3 w-3" />
                          <span>Edit Resources</span>
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

      {/* Edit Resources Modal */}
      {showModal && selectedLesson && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-darkGray max-w-3xl w-full rounded-2xl p-6 border border-gray-100 dark:border-gray-800 space-y-4 shadow-xl relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowModal(false)}
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="border-b border-gray-100 dark:border-gray-850 pb-3">
              <span className="text-[9px] uppercase tracking-wider text-brand-red font-extrabold">Resource Editor</span>
              <h3 className="text-sm font-black text-brand-black dark:text-white mt-1">{selectedLesson.title}</h3>
              <p className="text-[10px] text-gray-400 mt-1">
                Course: <span className="font-bold text-gray-600 dark:text-gray-300">{selectedLesson.module?.course?.title || 'N/A'}</span> &bull; Module: <span className="font-bold text-gray-600 dark:text-gray-300">{selectedLesson.module?.title || 'N/A'}</span>
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Study Notes (Markdown Supported)</label>
                  <span className="text-[8px] text-gray-400">Use basic markdown tags like # Header, **bold**, or lists.</span>
                </div>
                <textarea 
                  rows="10"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="# Study Guide Title&#10;&#10;Use this field to write summaries, tips, or grammar formulas for the lesson..."
                  className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none font-mono resize-none leading-relaxed"
                />
              </div>

              {/* Resource PDF Attachment */}
              <div className="space-y-1.5 bg-gray-50/50 dark:bg-brand-black/20 p-4 rounded-xl border border-gray-150 dark:border-gray-850">
                <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase block">Supplementary Sheet PDF</label>
                <div className="flex space-x-3">
                  <input 
                    type="url" 
                    value={pdfNotesUrl}
                    onChange={(e) => setPdfNotesUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/.../file.pdf"
                    className="flex-grow px-3 py-2 bg-white dark:bg-brand-darkGray border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                  />
                  <label className="px-4 py-2 bg-brand-black text-white hover:bg-black rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center justify-center shrink-0">
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
                <p className="text-[9px] text-gray-450">Upload a lecture note, exercise worksheet, or additional reading PDF document.</p>
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
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Resources</span>
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

export default Resources;
