import React, { useState, useEffect } from 'react';
import { 
  getQuizzes, 
  createQuiz, 
  deleteQuiz, 
  getCourses, 
  getCourseById 
} from '../services/admin.service';
import { Plus, Trash2, X, Loader2, BookOpen, AlertCircle, FileSpreadsheet, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [lessons, setLessons] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [structureLoading, setStructureLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form States
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [timeLimit, setTimeLimit] = useState(10);
  const [passingScore, setPassingScore] = useState(60);
  
  // Question Builder States
  const [questionsList, setQuestionsList] = useState([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [correctOptionIdx, setCorrectOptionIdx] = useState(0);

  const mockQuizzes = [
    {
      _id: 'q1',
      title: 'Phonics Sounds Checkpoint 1',
      timeLimit: 15,
      passingScore: 70,
      questions: [
        { questionText: 'What sound does "a" make?', options: ['Ah', 'Buh', 'Cuh', 'Duh'], correctOptionIndex: 0 }
      ],
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

  const fetchQuizzesList = async () => {
    try {
      const res = await getQuizzes();
      if (res.success) {
        setQuizzes(res.quizzes);
      } else {
        setQuizzes(mockQuizzes);
      }
    } catch (err) {
      setQuizzes(mockQuizzes);
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
    fetchQuizzesList();
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

  // Question Builder Actions
  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) {
      return toast.error('Question text is required');
    }
    if (newOptions.some(opt => !opt.trim())) {
      return toast.error('All 4 options must be completed');
    }

    const questionObj = {
      questionText: newQuestionText.trim(),
      options: newOptions.map(o => o.trim()),
      correctOptionIndex: correctOptionIdx
    };

    setQuestionsList(prev => [...prev, questionObj]);
    
    // Reset Question Builder inputs
    setNewQuestionText('');
    setNewOptions(['', '', '', '']);
    setCorrectOptionIdx(0);
    toast.success('Question added to quiz list!');
  };

  const handleRemoveQuestion = (idxToRemove) => {
    setQuestionsList(prev => prev.filter((_, i) => i !== idxToRemove));
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      const res = await deleteQuiz(quizId);
      if (res.success) {
        toast.success(res.message || 'Quiz deleted');
        fetchQuizzesList();
      }
    } catch (err) {
      toast.error(err.message || 'Delete quiz failed');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLessonId) {
      return toast.error('Please select a lesson to link this quiz');
    }
    if (!quizTitle.trim()) {
      return toast.error('Quiz title is required');
    }
    if (questionsList.length === 0) {
      return toast.error('Please add at least one question to the quiz');
    }

    setSubmitting(true);
    try {
      const res = await createQuiz({
        title: quizTitle.trim(),
        questions: questionsList,
        timeLimit: Number(timeLimit),
        passingScore: Number(passingScore),
        lessonId: selectedLessonId
      });

      if (res.success) {
        toast.success('Quiz created successfully!');
        setShowModal(false);
        // Reset States
        setQuizTitle('');
        setSelectedCourseId('');
        setSelectedModuleId('');
        setSelectedLessonId('');
        setQuestionsList([]);
        setTimeLimit(10);
        setPassingScore(60);
        fetchQuizzesList();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create quiz');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-brand-black dark:text-white">Quiz Manager</h2>
          <p className="text-xs text-gray-500">Create checkpoints, multiple-choice questions, passing score rules, and link them to lessons.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-brand-red text-white text-xs font-bold rounded-lg shadow-md shadow-brand-red/10 animate-in fade-in"
        >
          <Plus className="h-4 w-4" />
          <span>New Quiz</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-gray-500">Loading quizzes...</div>
      ) : (
        <div className="bg-white dark:bg-brand-darkGray rounded-2xl border border-gray-200/50 dark:border-gray-800/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-brand-black/20 text-gray-400 font-bold border-b border-gray-100 dark:border-gray-800">
                  <th className="p-4">Quiz Title</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Module</th>
                  <th className="p-4">Linked Lesson</th>
                  <th className="p-4 text-center">Time Limit</th>
                  <th className="p-4 text-center">Pass Score</th>
                  <th className="p-4 text-center">Questions</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {quizzes.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-400 italic">No quizzes created yet. Click "New Quiz" to get started.</td>
                  </tr>
                ) : (
                  quizzes.map(q => (
                    <tr key={q._id} className="hover:bg-gray-50/50 dark:hover:bg-brand-black/10">
                      <td className="p-4 font-bold flex items-center space-x-2">
                        <FileSpreadsheet className="h-4 w-4 text-brand-red shrink-0" />
                        <span className="truncate max-w-[200px]">{q.title}</span>
                      </td>
                      <td className="p-4 text-gray-550 truncate max-w-[150px]">{q.lesson?.module?.course?.title || 'Unknown Course'}</td>
                      <td className="p-4 text-gray-400 truncate max-w-[150px]">{q.lesson?.module?.title || 'N/A'}</td>
                      <td className="p-4 text-gray-500 font-medium truncate max-w-[150px]">{q.lesson?.title || 'Unknown Lesson'}</td>
                      <td className="p-4 text-center font-semibold text-gray-700 dark:text-gray-300">{q.timeLimit} mins</td>
                      <td className="p-4 text-center font-bold text-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/10 rounded">{q.passingScore}%</td>
                      <td className="p-4 text-center text-gray-450 font-bold">{q.questions?.length || 0} Qs</td>
                      <td className="p-4 flex items-center justify-center">
                        <button
                          onClick={() => handleDeleteQuiz(q._id)}
                          className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          title="Delete Quiz"
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
              <h3 className="text-sm font-extrabold text-brand-black dark:text-white">Create Checkpoint Quiz</h3>
              <p className="text-[10px] text-gray-400">Select course curriculum path and compile questions array.</p>
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

              {/* Main Quiz Details */}
              <div className="space-y-3 bg-gray-50/50 dark:bg-brand-black/15 p-3.5 rounded-xl border border-gray-150 dark:border-gray-850">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Quiz Title</label>
                  <input 
                    type="text" 
                    required 
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="e.g. Grammar Checkpoint 1"
                    className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Time Limit (Minutes)</label>
                    <input 
                      type="number" 
                      required 
                      min="1"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Passing Score (%)</label>
                    <input 
                      type="number" 
                      required 
                      min="1"
                      max="100"
                      value={passingScore}
                      onChange={(e) => setPassingScore(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Question List Preview */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold uppercase text-gray-400">Questions List ({questionsList.length})</span>
                </div>
                
                {questionsList.length === 0 ? (
                  <div className="text-[10px] py-4 bg-gray-50/30 dark:bg-brand-black/5 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 text-center text-gray-400 italic">
                    No questions added yet. Use the tool below to build your quiz bank.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto border border-gray-100 dark:border-gray-850 rounded-lg p-2 bg-white dark:bg-brand-darkGray/60">
                    {questionsList.map((q, qidx) => (
                      <div key={qidx} className="flex justify-between items-center text-[10px] border-b border-gray-100 dark:border-gray-850 pb-1.5 last:border-none">
                        <span className="truncate font-semibold text-brand-black dark:text-white">
                          {qidx + 1}. {q.questionText} <span className="text-gray-400 font-normal">({q.options.length} options, correct: #{q.correctOptionIndex + 1})</span>
                        </span>
                        <button type="button" onClick={() => handleRemoveQuestion(qidx)} className="text-red-500 hover:underline shrink-0 font-bold">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sub-form Question Builder */}
              <div className="bg-gray-50/50 dark:bg-brand-black/20 p-4 rounded-xl border border-gray-150 dark:border-gray-800 space-y-3">
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-3.5 w-3.5 text-brand-red" />
                  <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase">Interactive Question Builder</span>
                </div>

                <div className="space-y-1">
                  <input 
                    type="text" 
                    placeholder="Enter question text here (e.g. What is the synonym of 'Rapid'?)"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-brand-darkGray border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {newOptions.map((opt, oidx) => (
                    <div key={oidx} className="flex items-center space-x-2 bg-white dark:bg-brand-darkGray p-2 border border-gray-100 dark:border-gray-800 rounded-lg">
                      <input 
                        type="radio" 
                        name="correctAnswerOption" 
                        checked={correctOptionIdx === oidx}
                        onChange={() => setCorrectOptionIdx(oidx)}
                        className="text-brand-red focus:ring-brand-red h-3.5 w-3.5"
                      />
                      <input 
                        type="text" 
                        placeholder={`Option ${oidx + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewOptions(prev => prev.map((o, idx) => idx === oidx ? val : o));
                        }}
                        className="flex-grow bg-transparent text-xs focus:outline-none border-none p-0 text-brand-black dark:text-white"
                      />
                      {correctOptionIdx === oidx && <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                    </div>
                  ))}
                </div>

                <button 
                  type="button" 
                  onClick={handleAddQuestion}
                  className="w-full py-2 bg-gray-150 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-brand-black dark:text-white text-[10px] font-bold rounded-lg transition-all"
                >
                  Save Question to Quiz List
                </button>
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
                    <span>Create Quiz & Publish</span>
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

export default Quizzes;
