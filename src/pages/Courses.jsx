import React, { useState, useEffect } from 'react';
import { 
  getCourses, 
  createCourse, 
  deleteCourse, 
  togglePublishCourse,
  getCourseById,
  updateCourse,
  createModule,
  deleteModule,
  createLesson,
  deleteLesson,
  createQuiz,
  deleteQuiz,
  createAssignment,
  deleteAssignment
} from '../services/admin.service';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Eye, EyeOff, X, Edit, BookOpen, ChevronRight, PlusCircle, Play, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCurriculumModal, setShowCurriculumModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // Curriculum States
  const [curriculumStructure, setCurriculumStructure] = useState([]);
  const [curriculumLoading, setCurriculumLoading] = useState(false);
  const [newModTitle, setNewModTitle] = useState('');
  const [newModDesc, setNewModDesc] = useState('');
  
  // Lesson creation form state
  const [activeAddLessonModId, setActiveAddLessonModId] = useState(null);
  const [newLessTitle, setNewLessTitle] = useState('');
  const [newLessDesc, setNewLessDesc] = useState('');
  const [newLessVideo, setNewLessVideo] = useState('');
  const [newLessDuration, setNewLessDuration] = useState('30 mins');
  const [newLessContent, setNewLessContent] = useState('');
  const [newLessPdf, setNewLessPdf] = useState('');

  const [uploading, setUploading] = useState({ thumbnail: false, video: false, pdf: false, assignment: false });

  // Quiz Creator Form States
  const [activeQuizFormLessonId, setActiveQuizFormLessonId] = useState(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizTimeLimit, setQuizTimeLimit] = useState(15);
  const [quizPassingScore, setQuizPassingScore] = useState(60);
  const [quizQuestions, setQuizQuestions] = useState([]);
  // Question Builder States
  const [newQText, setNewQText] = useState('');
  const [newQOptions, setNewQOptions] = useState(['', '', '', '']);
  const [newQCorrectIndex, setNewQCorrectIndex] = useState(0);

  // Assignment Creator Form States
  const [activeAssignmentFormLessonId, setActiveAssignmentFormLessonId] = useState(null);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentInstructions, setAssignmentInstructions] = useState('');
  const [assignmentMaxPoints, setAssignmentMaxPoints] = useState(100);
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [assignmentPdf, setAssignmentPdf] = useState('');

  const handleOpenQuizForm = (lessonId) => {
    setActiveQuizFormLessonId(lessonId);
    setQuizTitle('');
    setQuizTimeLimit(15);
    setQuizPassingScore(60);
    setQuizQuestions([]);
    setNewQText('');
    setNewQOptions(['', '', '', '']);
    setNewQCorrectIndex(0);
  };

  const handleOpenAssignmentForm = (lessonId) => {
    setActiveAssignmentFormLessonId(lessonId);
    setAssignmentTitle('');
    setAssignmentInstructions('');
    setAssignmentMaxPoints(100);
    setAssignmentDueDate('');
    setAssignmentPdf('');
  };

  const handleAddQuestionToQuiz = () => {
    if (!newQText || newQOptions.some(opt => !opt.trim())) {
      toast.error('Please fill in the question text and all 4 options!');
      return;
    }
    const newQ = {
      questionText: newQText,
      options: [...newQOptions],
      correctOptionIndex: newQCorrectIndex
    };
    setQuizQuestions(prev => [...prev, newQ]);
    // Reset question inputs
    setNewQText('');
    setNewQOptions(['', '', '', '']);
    setNewQCorrectIndex(0);
    toast.success('Question added to quiz list!');
  };

  const handleAssignmentPdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'assignments/resources');

    setUploading(prev => ({ ...prev, assignment: true }));
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.success) {
        setAssignmentPdf(res.url);
        toast.success('Assignment PDF uploaded successfully to Cloudinary!');
      }
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(prev => ({ ...prev, assignment: false }));
    }
  };

  const handleCreateQuizSubmit = async (e, lessonId) => {
    e.preventDefault();
    if (quizQuestions.length === 0) {
      toast.error('Please add at least one question to the quiz!');
      return;
    }
    try {
      const res = await createQuiz({
        title: quizTitle,
        questions: quizQuestions,
        timeLimit: quizTimeLimit,
        passingScore: quizPassingScore,
        lessonId
      });
      if (res.success) {
        toast.success('Quiz created successfully!');
        setActiveQuizFormLessonId(null);
        fetchCurriculum(selectedCourse._id);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create quiz');
    }
  };

  const handleCreateAssignmentSubmit = async (e, lessonId) => {
    e.preventDefault();
    try {
      const res = await createAssignment({
        title: assignmentTitle,
        instructions: assignmentInstructions,
        maxPoints: assignmentMaxPoints,
        dueDate: new Date(assignmentDueDate),
        fileUrl: assignmentPdf,
        lessonId
      });
      if (res.success) {
        toast.success('Assignment created successfully!');
        setActiveAssignmentFormLessonId(null);
        fetchCurriculum(selectedCourse._id);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create assignment');
    }
  };

  const handleDeleteQuizClick = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      const res = await deleteQuiz(quizId);
      if (res.success) {
        toast.success('Quiz deleted successfully');
        fetchCurriculum(selectedCourse._id);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete quiz');
    }
  };

  const handleDeleteAssignmentClick = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      const res = await deleteAssignment(assignmentId);
      if (res.success) {
        toast.success('Assignment deleted successfully');
        fetchCurriculum(selectedCourse._id);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete assignment');
    }
  };

  const { register: registerCreate, handleSubmit: handleSubmitCreate, reset: resetCreate, setValue: setValueCreate, watch: watchCreate } = useForm();
  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, setValue: setValueEdit, watch: watchEdit } = useForm();

  const watchCreateThumbnail = watchCreate('thumbnail');
  const watchCreateIntroVideo = watchCreate('introVideoUrl');
  const watchEditThumbnail = watchEdit('thumbnail');
  const watchEditIntroVideo = watchEdit('introVideoUrl');

  const handleCloudinaryUpload = async (e, type, fieldName, setValueField) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', type === 'thumbnail' ? 'courses/thumbnails' : 'courses/videos');

    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.success) {
        setValueField(fieldName, res.url);
        toast.success(`${type === 'thumbnail' ? 'Thumbnail' : 'Intro video'} uploaded successfully to Cloudinary!`);
      }
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleLessonPdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'lessons/resources');

    setUploading(prev => ({ ...prev, pdf: true }));
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.success) {
        setNewLessPdf(res.url);
        toast.success('Resource PDF uploaded successfully to Cloudinary!');
      }
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(prev => ({ ...prev, pdf: false }));
    }
  };

  // Mocks fallback
  const mockCourses = [
    { _id: 'c1', title: 'English Phonics Masterclass', category: 'Kids English', price: 1500, enrollmentsCount: 8, isPublished: true },
    { _id: 'c2', title: 'Interactive Grammar & Vocabulary', category: 'Junior English', price: 2000, enrollmentsCount: 12, isPublished: true },
    { _id: 'c3', title: 'SSC Academic Prep Suite', category: 'SSC English Preparation', price: 3000, enrollmentsCount: 4, isPublished: false }
  ];

  const fetchAllCourses = async () => {
    try {
      const res = await getCourses();
      if (res.success) {
        setCourses(res.courses);
      } else {
        setCourses(mockCourses);
      }
    } catch (err) {
      setCourses(mockCourses);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCourses();
  }, []);

  const handleTogglePublish = async (id) => {
    try {
      const res = await togglePublishCourse(id);
      if (res.success) {
        toast.success(res.message);
        setCourses(prev => prev.map(c => c._id === id ? { ...c, isPublished: !c.isPublished } : c));
      }
    } catch (err) {
      setCourses(prev => prev.map(c => c._id === id ? { ...c, isPublished: !c.isPublished } : c));
      toast.success('Course status toggled (mock)!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      const res = await deleteCourse(id);
      if (res.success) {
        toast.success(res.message);
        setCourses(prev => prev.filter(c => c._id !== id));
      }
    } catch (err) {
      setCourses(prev => prev.filter(c => c._id !== id));
      toast.success('Course deleted (mock)!');
    }
  };

  const onCreateSubmit = async (data) => {
    try {
      const formattedOutcomes = data.outcomes ? data.outcomes.split(',').map(s => s.trim()).filter(Boolean) : [];
      const res = await createCourse({
        ...data,
        price: Number(data.price),
        outcomes: formattedOutcomes
      });
      if (res.success) {
        toast.success('Course created successfully!');
        setShowModal(false);
        resetCreate();
        fetchAllCourses();
      }
    } catch (err) {
      // Mock append
      const mockNew = {
        _id: 'c_new_' + Date.now(),
        title: data.title,
        category: data.category,
        price: Number(data.price),
        enrollmentsCount: 0,
        isPublished: false
      };
      setCourses(prev => [...prev, mockNew]);
      toast.success('Course created locally (mock)!');
      setShowModal(false);
      resetCreate();
    }
  };

  const handleEditClick = (course) => {
    setSelectedCourse(course);
    resetEdit({
      title: course.title,
      category: course.category,
      price: course.price,
      duration: course.duration || '8 Weeks',
      level: course.level || 'Beginner',
      description: course.description,
      thumbnail: course.thumbnail,
      introVideoUrl: course.introVideoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4',
      outcomes: course.outcomes ? course.outcomes.join(', ') : ''
    });
    setShowEditModal(true);
  };

  const onEditSubmit = async (data) => {
    try {
      const formattedOutcomes = data.outcomes ? data.outcomes.split(',').map(s => s.trim()).filter(Boolean) : [];
      const res = await updateCourse(selectedCourse._id, {
        ...data,
        price: Number(data.price),
        outcomes: formattedOutcomes
      });
      if (res.success) {
        toast.success('Course updated successfully!');
        setShowEditModal(false);
        fetchAllCourses();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update course');
    }
  };

  // Curriculum Handlers
  const fetchCurriculum = async (courseId) => {
    setCurriculumLoading(true);
    try {
      const res = await getCourseById(courseId);
      if (res.success) {
        setCurriculumStructure(res.structure || []);
      }
    } catch (err) {
      toast.error('Failed to load curriculum');
    } finally {
      setCurriculumLoading(false);
    }
  };

  const handleCurriculumClick = (course) => {
    setSelectedCourse(course);
    setCurriculumStructure([]);
    setShowCurriculumModal(true);
    fetchCurriculum(course._id);
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!newModTitle) return;
    try {
      const res = await createModule({
        title: newModTitle,
        description: newModDesc,
        courseId: selectedCourse._id,
        order: curriculumStructure.length
      });
      if (res.success) {
        toast.success('Module added successfully!');
        setNewModTitle('');
        setNewModDesc('');
        fetchCurriculum(selectedCourse._id);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add module');
    }
  };

  const handleDeleteModule = async (modId) => {
    if (!window.confirm('Delete this module and all of its lessons?')) return;
    try {
      const res = await deleteModule(modId);
      if (res.success) {
        toast.success('Module deleted');
        fetchCurriculum(selectedCourse._id);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete module');
    }
  };

  const handleAddLessonSubmit = async (e, moduleId) => {
    e.preventDefault();
    if (!newLessTitle) return;
    try {
      const res = await createLesson({
        title: newLessTitle,
        description: newLessDesc,
        content: newLessContent,
        videoUrl: newLessVideo || 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: newLessDuration,
        pdfNotesUrl: newLessPdf,
        moduleId
      });
      if (res.success) {
        toast.success('Lesson created successfully!');
        setNewLessTitle('');
        setNewLessDesc('');
        setNewLessVideo('');
        setNewLessContent('');
        setNewLessPdf('');
        setNewLessDuration('30 mins');
        setActiveAddLessonModId(null);
        fetchCurriculum(selectedCourse._id);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add lesson');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      const res = await deleteLesson(lessonId);
      if (res.success) {
        toast.success('Lesson deleted');
        fetchCurriculum(selectedCourse._id);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete lesson');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-brand-black dark:text-white">Course Directory</h2>
          <p className="text-xs text-gray-500">Manage course catalogs, prices, descriptions, and dynamic learning assets.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-brand-red text-white text-xs font-bold rounded-lg shadow-md shadow-brand-red/10 animate-in fade-in"
        >
          <Plus className="h-4 w-4" />
          <span>New Course</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-gray-500">Loading courses catalog...</div>
      ) : (
        <div className="bg-white dark:bg-brand-darkGray rounded-2xl border border-gray-200/50 dark:border-gray-800/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-brand-black/20 text-gray-400 font-bold border-b border-gray-100 dark:border-gray-800">
                  <th className="p-4">Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Level</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Enrollments</th>
                  <th className="p-4">Publish State</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {courses.map(course => (
                  <tr key={course._id} className="hover:bg-gray-50/50 dark:hover:bg-brand-black/10">
                    <td className="p-4 font-bold">{course.title}</td>
                    <td className="p-4 text-gray-500">{course.category}</td>
                    <td className="p-4 text-gray-500">{course.level || 'Beginner'}</td>
                    <td className="p-4 font-semibold text-brand-red">৳{course.price}</td>
                    <td className="p-4 text-gray-450">{course.enrollmentsCount || 0} students</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                        course.isPublished ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4 flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleCurriculumClick(course)}
                        className="p-1.5 bg-gray-100 dark:bg-brand-black/40 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200"
                        title="Manage Curriculum"
                      >
                        <BookOpen className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditClick(course)}
                        className="p-1.5 bg-gray-100 dark:bg-brand-black/40 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200"
                        title="Edit Details"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleTogglePublish(course._id)}
                        className="p-1.5 bg-gray-100 dark:bg-brand-black/40 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200"
                        title={course.isPublished ? 'Unpublish' : 'Publish'}
                      >
                        {course.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(course._id)}
                        className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600"
                        title="Delete"
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

      {/* Create Course Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-darkGray max-w-lg w-full rounded-2xl p-6 border border-gray-100 dark:border-gray-800 space-y-4 shadow-xl relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowModal(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-sm font-extrabold text-brand-black dark:text-white border-b border-gray-100 dark:border-gray-850 pb-2">Create New Course</h3>

            <form onSubmit={handleSubmitCreate(onCreateSubmit)} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Course Title</label>
                <input 
                  type="text" 
                  required 
                  {...registerCreate('title')}
                  placeholder="e.g. Fluent Spoken English"
                  className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Category</label>
                  <select 
                    {...registerCreate('category')}
                    className="w-full px-3 py-2 bg-white dark:bg-brand-darkGray border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none text-brand-black dark:text-gray-200"
                  >
                    <option value="Kids English">Kids English</option>
                    <option value="Junior English">Junior English</option>
                    <option value="SSC English Preparation">SSC English Preparation</option>
                    <option value="HSC English Preparation">HSC English Preparation</option>
                    <option value="Spoken English">Spoken English</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Difficulty Level</label>
                  <select 
                    {...registerCreate('level')}
                    className="w-full px-3 py-2 bg-white dark:bg-brand-darkGray border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none text-brand-black dark:text-gray-200"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Exam Prep">Exam Prep</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Price (৳)</label>
                  <input 
                    type="number" 
                    required 
                    {...registerCreate('price')}
                    placeholder="2500"
                    className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Duration</label>
                  <input 
                    type="text" 
                    required 
                    {...registerCreate('duration')}
                    placeholder="e.g. 8 Weeks"
                    className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Thumbnail / Banner URL</label>
                <div className="flex space-x-2">
                  <input 
                    type="url" 
                    required 
                    {...registerCreate('thumbnail')}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-grow px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                  />
                  <label className="px-3 py-2 bg-brand-black text-white hover:bg-black rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center justify-center shrink-0">
                    {uploading.thumbnail ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      'Upload Banner'
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleCloudinaryUpload(e, 'thumbnail', 'thumbnail', setValueCreate)}
                      className="hidden"
                    />
                  </label>
                </div>
                {watchCreateThumbnail && (
                  <img src={watchCreateThumbnail} alt="Thumbnail preview" className="h-16 w-full object-cover rounded-lg mt-2 border border-gray-200" />
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Intro Video URL</label>
                <div className="flex space-x-2">
                  <input 
                    type="url" 
                    required 
                    {...registerCreate('introVideoUrl')}
                    placeholder="https://www.w3schools.com/html/mov_bbb.mp4"
                    className="flex-grow px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                  />
                  <label className="px-3 py-2 bg-brand-black text-white hover:bg-black rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center justify-center shrink-0">
                    {uploading.video ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      'Upload Video'
                    )}
                    <input 
                      type="file" 
                      accept="video/*"
                      onChange={(e) => handleCloudinaryUpload(e, 'video', 'introVideoUrl', setValueCreate)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Outcomes (Comma separated)</label>
                <textarea 
                  rows="2"
                  {...registerCreate('outcomes')}
                  placeholder="Outcome 1, Outcome 2, Outcome 3"
                  className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Description</label>
                <textarea 
                  rows="3"
                  required 
                  {...registerCreate('description')}
                  placeholder="Course summary details..."
                  className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brand-red hover:bg-red-600 text-white rounded-lg text-xs font-bold shadow-md shadow-brand-red/10 transition-all"
              >
                Create Course
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-darkGray max-w-lg w-full rounded-2xl p-6 border border-gray-100 dark:border-gray-800 space-y-4 shadow-xl relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowEditModal(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-sm font-extrabold text-brand-black dark:text-white border-b border-gray-100 dark:border-gray-850 pb-2">Edit Course Details</h3>

            <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Course Title</label>
                <input 
                  type="text" 
                  required 
                  {...registerEdit('title')}
                  placeholder="e.g. Fluent Spoken English"
                  className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Category</label>
                  <select 
                    {...registerEdit('category')}
                    className="w-full px-3 py-2 bg-white dark:bg-brand-darkGray border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none text-brand-black dark:text-gray-200"
                  >
                    <option value="Kids English">Kids English</option>
                    <option value="Junior English">Junior English</option>
                    <option value="SSC English Preparation">SSC English Preparation</option>
                    <option value="HSC English Preparation">HSC English Preparation</option>
                    <option value="Spoken English">Spoken English</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Difficulty Level</label>
                  <select 
                    {...registerEdit('level')}
                    className="w-full px-3 py-2 bg-white dark:bg-brand-darkGray border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none text-brand-black dark:text-gray-200"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Exam Prep">Exam Prep</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Price (৳)</label>
                  <input 
                    type="number" 
                    required 
                    {...registerEdit('price')}
                    placeholder="2500"
                    className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Duration</label>
                  <input 
                    type="text" 
                    required 
                    {...registerEdit('duration')}
                    placeholder="e.g. 8 Weeks"
                    className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Thumbnail / Banner URL</label>
                <div className="flex space-x-2">
                  <input 
                    type="url" 
                    required 
                    {...registerEdit('thumbnail')}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-grow px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                  />
                  <label className="px-3 py-2 bg-brand-black text-white hover:bg-black rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center justify-center shrink-0">
                    {uploading.thumbnail ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      'Upload Banner'
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleCloudinaryUpload(e, 'thumbnail', 'thumbnail', setValueEdit)}
                      className="hidden"
                    />
                  </label>
                </div>
                {watchEditThumbnail && (
                  <img src={watchEditThumbnail} alt="Thumbnail preview" className="h-16 w-full object-cover rounded-lg mt-2 border border-gray-200" />
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Intro Video URL</label>
                <div className="flex space-x-2">
                  <input 
                    type="url" 
                    required 
                    {...registerEdit('introVideoUrl')}
                    placeholder="https://www.w3schools.com/html/mov_bbb.mp4"
                    className="flex-grow px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                  />
                  <label className="px-3 py-2 bg-brand-black text-white hover:bg-black rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center justify-center shrink-0">
                    {uploading.video ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      'Upload Video'
                    )}
                    <input 
                      type="file" 
                      accept="video/*"
                      onChange={(e) => handleCloudinaryUpload(e, 'video', 'introVideoUrl', setValueEdit)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Outcomes (Comma separated)</label>
                <textarea 
                  rows="2"
                  {...registerEdit('outcomes')}
                  placeholder="Outcome 1, Outcome 2, Outcome 3"
                  className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Description</label>
                <textarea 
                  rows="3"
                  required 
                  {...registerEdit('description')}
                  placeholder="Course summary details..."
                  className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brand-red hover:bg-red-600 text-white rounded-lg text-xs font-bold shadow-md shadow-brand-red/10 transition-all"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Curriculum Manager Modal */}
      {showCurriculumModal && selectedCourse && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-brand-darkGray max-w-2xl w-full rounded-2xl p-6 border border-gray-100 dark:border-gray-800 space-y-6 shadow-xl relative animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowCurriculumModal(false)}
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="border-b border-gray-100 dark:border-gray-850 pb-3">
              <span className="text-[9px] uppercase tracking-wider text-brand-red font-extrabold">Curriculum Builder</span>
              <h3 className="text-sm font-black text-brand-black dark:text-white mt-1">{selectedCourse.title}</h3>
            </div>

            {curriculumLoading ? (
              <div className="text-center py-20 text-xs text-gray-500">Loading curriculum data structure...</div>
            ) : (
              <div className="space-y-6">
                
                {/* Module List */}
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1">
                  {curriculumStructure.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 dark:bg-brand-black/25 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 text-xs text-gray-400">
                      No modules created yet. Add your first learning module below.
                    </div>
                  ) : (
                    curriculumStructure.map((mod) => (
                      <div key={mod._id} className="border border-gray-150 dark:border-gray-800 rounded-xl p-4 bg-gray-50/50 dark:bg-brand-black/10 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-extrabold text-brand-black dark:text-white">{mod.title}</h4>
                            <p className="text-[10px] text-gray-450 mt-0.5">{mod.description || 'No description'}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteModule(mod._id)}
                            className="text-[10px] text-red-500 hover:underline font-bold"
                          >
                            Delete Module
                          </button>
                        </div>

                        {/* Lessons list */}
                        <div className="pl-3 border-l border-gray-200 dark:border-gray-850 space-y-2">
                          <h5 className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Lessons</h5>
                          {mod.lessons && mod.lessons.length > 0 ? (
                            mod.lessons.map((less) => (
                              <div key={less._id} className="flex justify-between items-center bg-white dark:bg-brand-darkGray/60 border border-gray-150 dark:border-gray-800/80 p-2 rounded-lg text-[10px]">
                                <div className="flex items-center space-x-1.5 font-medium">
                                  <Play className="h-3 w-3 text-brand-red shrink-0" />
                                  <span className="font-bold text-gray-700 dark:text-gray-300">{less.title}</span>
                                  <span className="text-gray-400">({less.duration || '30 mins'})</span>
                                </div>
                                <button
                                  onClick={() => handleDeleteLesson(less._id)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="text-[10px] text-gray-400 italic">No lessons in this module.</div>
                          )}
                        </div>

                        {/* Add Lesson inline form toggle */}
                        {activeAddLessonModId === mod._id ? (
                          <form 
                            onSubmit={(e) => handleAddLessonSubmit(e, mod._id)}
                            className="bg-white dark:bg-brand-darkGray/80 border border-gray-150 dark:border-gray-800 p-3 rounded-lg space-y-3 animate-in slide-in-from-top-1"
                          >
                            <div className="text-[10px] font-bold text-brand-red">Add Lesson to Module</div>
                            <div className="grid grid-cols-2 gap-3">
                              <input 
                                type="text"
                                placeholder="Lesson Title"
                                required
                                value={newLessTitle}
                                onChange={(e) => setNewLessTitle(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-transparent border border-gray-150 dark:border-gray-800 rounded-md text-[11px] focus:outline-none text-brand-black dark:text-white"
                              />
                              <input 
                                type="text"
                                placeholder="Duration (e.g. 15 mins)"
                                value={newLessDuration}
                                onChange={(e) => setNewLessDuration(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-transparent border border-gray-150 dark:border-gray-800 rounded-md text-[11px] focus:outline-none text-brand-black dark:text-white"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <input 
                                type="text"
                                placeholder="Short Description"
                                value={newLessDesc}
                                onChange={(e) => setNewLessDesc(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-transparent border border-gray-150 dark:border-gray-800 rounded-md text-[11px] focus:outline-none text-brand-black dark:text-white"
                              />
                              <input 
                                type="url"
                                placeholder="Video URL (YouTube/Vimeo/MP4)"
                                value={newLessVideo}
                                onChange={(e) => setNewLessVideo(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-transparent border border-gray-150 dark:border-gray-800 rounded-md text-[11px] focus:outline-none text-brand-black dark:text-white"
                              />
                            </div>

                            <textarea 
                              placeholder="Study Notes / Markdown Content..."
                              rows="2"
                              value={newLessContent}
                              onChange={(e) => setNewLessContent(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-transparent border border-gray-150 dark:border-gray-800 rounded-md text-[11px] focus:outline-none text-brand-black dark:text-white resize-none"
                            />

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">PDF Notes / Resource Material</label>
                              <div className="flex space-x-2">
                                <input 
                                  type="url" 
                                  placeholder="PDF Resource URL (https://...)"
                                  value={newLessPdf}
                                  onChange={(e) => setNewLessPdf(e.target.value)}
                                  className="flex-grow px-2.5 py-1.5 bg-transparent border border-gray-150 dark:border-gray-800 rounded-md text-[11px] focus:outline-none text-brand-black dark:text-white"
                                />
                                <label className="px-3 py-1.5 bg-brand-black text-white hover:bg-black rounded-md text-[10px] font-bold cursor-pointer transition-all flex items-center justify-center shrink-0">
                                  {uploading.pdf ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    'Upload PDF'
                                  )}
                                  <input 
                                    type="file" 
                                    accept=".pdf"
                                    onChange={handleLessonPdfUpload}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-1">
                              <button 
                                type="button"
                                onClick={() => setActiveAddLessonModId(null)}
                                className="px-3 py-1 bg-gray-100 dark:bg-brand-black text-[10px] font-bold rounded-md"
                              >
                                Cancel
                              </button>
                              <button 
                                type="submit"
                                className="px-3 py-1 bg-brand-red text-white text-[10px] font-bold rounded-md hover:bg-red-600"
                              >
                                Add Lesson
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveAddLessonModId(mod._id);
                              setNewLessTitle('');
                              setNewLessVideo('');
                            }}
                            className="flex items-center space-x-1 text-[10px] text-brand-red hover:underline font-bold"
                          >
                            <PlusCircle className="h-3 w-3" />
                            <span>Add Lesson</span>
                          </button>
                        )}

                      </div>
                    ))
                  )}
                </div>

                {/* Add Module Box */}
                <form onSubmit={handleAddModule} className="border-t border-gray-100 dark:border-gray-850 pt-4 space-y-3">
                  <h4 className="text-xs font-extrabold text-brand-black dark:text-white uppercase tracking-wider">Add New Module</h4>
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      placeholder="Module Title (e.g., Module 1: Introduction to Grammar)"
                      required
                      value={newModTitle}
                      onChange={(e) => setNewModTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                    />
                    <textarea 
                      placeholder="Module Brief Description..."
                      rows="2"
                      value={newModDesc}
                      onChange={(e) => setNewModDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-brand-black hover:bg-black dark:bg-brand-red dark:hover:bg-red-600 text-white rounded-lg text-xs font-bold"
                  >
                    Add Module
                  </button>
                </form>

              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Courses;
