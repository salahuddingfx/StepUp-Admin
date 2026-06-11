import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const Blogs = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mocks fallback
  const mockBlogs = [
    { _id: 'b1', title: '5 Essential Rules to Speak English Confidently', author: { name: 'Dr. Sarah Rahman' }, isPublished: true, createdAt: '2026-06-01T10:00:00Z' },
    { _id: 'b2', title: 'HSC English Preposition Masterclass Hacks', author: { name: 'Anisul Islam' }, isPublished: true, createdAt: '2026-06-05T10:00:00Z' }
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
                    <td className="p-4 text-gray-500">{post.author?.name}</td>
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
                        onClick={() => handleDelete(post._id)}
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
    </div>
  );
};

export default Blogs;
