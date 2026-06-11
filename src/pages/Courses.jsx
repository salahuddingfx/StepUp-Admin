import React, { useState, useEffect } from 'react';
import { getCourses, createCourse, deleteCourse, togglePublishCourse } from '../services/admin.service';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Eye, EyeOff, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, reset } = useForm();

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

  const onSubmit = async (data) => {
    try {
      const res = await createCourse({
        ...data,
        price: Number(data.price)
      });
      if (res.success) {
        toast.success('Course created successfully!');
        setShowModal(false);
        reset();
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
      reset();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-brand-black dark:text-white">Course Directory</h2>
          <p className="text-xs text-gray-500">Manage course catalogs, prices, and publishing flags.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-brand-red text-white text-xs font-bold rounded-lg shadow-md shadow-brand-red/10"
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
          <div className="bg-white dark:bg-brand-darkGray max-w-md w-full rounded-2xl p-6 border border-gray-100 dark:border-gray-800 space-y-6 shadow-xl relative animate-in fade-in-50">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowModal(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-sm font-bold">Add New Course</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300">Course Title</label>
                <input 
                  type="text" 
                  required 
                  {...register('title')}
                  placeholder="e.g. Fluent Spoken English"
                  className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300">Category</label>
                <select 
                  {...register('category')}
                  className="w-full px-3 py-2 bg-white dark:bg-brand-darkGray border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                >
                  <option value="Kids English">Kids English</option>
                  <option value="Junior English">Junior English</option>
                  <option value="SSC English Preparation">SSC English Preparation</option>
                  <option value="HSC English Preparation">HSC English Preparation</option>
                  <option value="Spoken English">Spoken English</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-300">Price (৳)</label>
                  <input 
                    type="number" 
                    required 
                    {...register('price')}
                    placeholder="2500"
                    className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-300">Duration</label>
                  <input 
                    type="text" 
                    required 
                    {...register('duration')}
                    placeholder="e.g. 8 Weeks"
                    className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-300">Description</label>
                <textarea 
                  rows="3"
                  required 
                  {...register('description')}
                  placeholder="Course summary details..."
                  className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brand-red hover:bg-red-600 text-white rounded-lg text-xs font-bold shadow-md shadow-brand-red/10"
              >
                Create Course
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
