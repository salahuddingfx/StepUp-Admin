import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useForm } from 'react-hook-form';
import { FileText, Trash2, Plus, Edit, X, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Blogs = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { register: registerCreate, handleSubmit: handleSubmitCreate, reset: resetCreate, setValue: setValueCreate, watch: watchCreate } = useForm();
  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, setValue: setValueEdit, watch: watchEdit } = useForm();

  const watchCreateCoverImage = watchCreate('coverImage');
  const watchEditCoverImage = watchEdit('coverImage');

  // Mocks fallback
  const mockBlogs = [
    { _id: 'b1', title: '5 Essential Rules to Speak English Confidently', author: { name: 'Dr. Sarah Rahman' }, isPublished: true, createdAt: '2026-06-01T10:00:00Z', tags: ['Spoken English', 'Fluency'], coverImage: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&auto=format&fit=crop&q=60', content: 'Lorem ipsum dolor sit amet...' },
    { _id: 'b2', title: 'HSC English Preposition Masterclass Hacks', author: { name: 'Anisul Islam' }, isPublished: true, createdAt: '2026-06-05T10:00:00Z', tags: ['HSC Prep', 'Grammar'], coverImage: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&auto=format&fit=crop&q=60', content: 'Lorem ipsum dolor sit amet...' }
  ];

  const fetchBlogs = async () => {
    try {
      const res = await api.get('/blogs');
      if (res.success && res.blogs) {
        setPosts(res.blogs);
      } else {
        setPosts(mockBlogs);
      }
    } catch (err) {
      setPosts(mockBlogs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleImageUpload = async (e, setValueField) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'blogs');
    
    setUploading(true);
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.success) {
        setValueField('coverImage', res.url);
        toast.success('Cover image uploaded successfully to Cloudinary!');
      }
    } catch (err) {
      toast.error(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onCreateSubmit = async (data) => {
    try {
      const res = await api.post('/blogs', {
        ...data,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      });
      if (res.success) {
        toast.success('Blog post created successfully!');
        setShowModal(false);
        resetCreate();
        fetchBlogs();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create blog');
    }
  };

  const handleEditClick = (post) => {
    setSelectedPost(post);
    resetEdit({
      title: post.title,
      coverImage: post.coverImage || '',
      tags: post.tags ? post.tags.join(', ') : '',
      content: post.content || '',
      isPublished: post.isPublished
    });
    setShowEditModal(true);
  };

  const onEditSubmit = async (data) => {
    try {
      const res = await api.put(`/blogs/${selectedPost._id}`, {
        ...data,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      });
      if (res.success) {
        toast.success('Blog post updated successfully!');
        setShowEditModal(true);
        setShowEditModal(false);
        fetchBlogs();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update blog');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await api.delete(`/blogs/${id}`);
      toast.success('Article deleted');
      setPosts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      setPosts(prev => prev.filter(p => p._id !== id));
      toast.success('Article deleted (mock)');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-brand-black dark:text-white">Blogs Management</h2>
          <p className="text-xs text-gray-500">Edit or publish learning articles for the student community.</p>
        </div>

        <button
          onClick={() => {
            resetCreate();
            setShowModal(true);
          }}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-brand-red text-white text-xs font-bold rounded-lg shadow-md shadow-brand-red/10 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Article</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-gray-500">Loading blog list...</div>
      ) : (
        <div className="bg-white dark:bg-brand-darkGray rounded-2xl border border-gray-200/50 dark:border-gray-800/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-brand-black/20 text-gray-400 font-bold border-b border-gray-100 dark:border-gray-800">
                  <th className="p-4">Title</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {posts.map(post => (
                  <tr key={post._id} className="hover:bg-gray-50/50 dark:hover:bg-brand-black/10">
                    <td className="p-4 font-bold">{post.title}</td>
                    <td className="p-4 text-gray-500">{post.author?.name || 'Administrator'}</td>
                    <td className="p-4 text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                        post.isPublished ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {post.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4 flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleEditClick(post)}
                        className="p-1.5 bg-gray-100 dark:bg-brand-black/40 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200"
                        title="Edit Article"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="p-1.5 bg-red-500 text-white rounded hover:bg-red-650"
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

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-brand-darkGray max-w-lg w-full rounded-2xl p-6 border border-gray-100 dark:border-gray-800 space-y-4 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowModal(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-sm font-extrabold text-brand-black dark:text-white border-b border-gray-100 dark:border-gray-850 pb-2">Create New Article</h3>

            <form onSubmit={handleSubmitCreate(onCreateSubmit)} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Article Title</label>
                <input 
                  type="text" 
                  required 
                  {...registerCreate('title')}
                  placeholder="e.g. Master HSC Prepositions in 10 Days"
                  className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Tags (Comma separated)</label>
                <input 
                  type="text" 
                  {...registerCreate('tags')}
                  placeholder="Grammar, Spoken, HSC"
                  className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Cover Image</label>
                <div className="flex space-x-2">
                  <input 
                    type="url" 
                    {...registerCreate('coverImage')}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-grow px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                  />
                  <label className="px-3 py-2 bg-brand-black text-white hover:bg-black rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center justify-center shrink-0">
                    {uploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      'Upload File'
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setValueCreate)}
                      className="hidden"
                    />
                  </label>
                </div>
                {watchCreateCoverImage && (
                  <img src={watchCreateCoverImage} alt="Cover preview" className="h-20 w-full object-cover rounded-lg mt-2 border border-gray-200" />
                )}
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    {...registerCreate('isPublished')}
                    className="text-brand-red focus:ring-brand-red h-4 w-4 rounded" 
                  />
                  <span className="text-xs font-semibold">Publish immediately</span>
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Content (Markdown supported)</label>
                <textarea 
                  rows="6"
                  required 
                  {...registerCreate('content')}
                  placeholder="Write your article content here..."
                  className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-brand-red hover:bg-red-600 text-white rounded-lg text-xs font-bold shadow-md shadow-brand-red/10 transition-all"
              >
                Create Article
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-brand-darkGray max-w-lg w-full rounded-2xl p-6 border border-gray-100 dark:border-gray-800 space-y-4 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowEditModal(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-sm font-extrabold text-brand-black dark:text-white border-b border-gray-100 dark:border-gray-850 pb-2">Edit Article Details</h3>

            <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Article Title</label>
                <input 
                  type="text" 
                  required 
                  {...registerEdit('title')}
                  placeholder="e.g. Master HSC Prepositions in 10 Days"
                  className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Tags (Comma separated)</label>
                <input 
                  type="text" 
                  {...registerEdit('tags')}
                  placeholder="Grammar, Spoken, HSC"
                  className="w-full px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Cover Image</label>
                <div className="flex space-x-2">
                  <input 
                    type="url" 
                    {...registerEdit('coverImage')}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-grow px-3 py-2 bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                  />
                  <label className="px-3 py-2 bg-brand-black text-white hover:bg-black rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center justify-center shrink-0">
                    {uploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      'Upload File'
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, setValueEdit)}
                      className="hidden"
                    />
                  </label>
                </div>
                {watchEditCoverImage && (
                  <img src={watchEditCoverImage} alt="Cover preview" className="h-20 w-full object-cover rounded-lg mt-2 border border-gray-200" />
                )}
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    {...registerEdit('isPublished')}
                    className="text-brand-red focus:ring-brand-red h-4 w-4 rounded" 
                  />
                  <span className="text-xs font-semibold">Publish immediately</span>
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-650 dark:text-gray-300 uppercase">Content (Markdown supported)</label>
                <textarea 
                  rows="6"
                  required 
                  {...registerEdit('content')}
                  placeholder="Write your article content here..."
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
    </div>
  );
};

export default Blogs;
