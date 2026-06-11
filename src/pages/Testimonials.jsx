import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Star, Check, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mocks fallback
  const mockReviews = [
    { _id: 'r1', student: { name: 'Tahmid Hasan', email: 'tahmid@gmail.com' }, content: 'English StepUp transformed my HSC Prep. The structured notes and daily feedback helped me secure an A+ in English!', rating: 5, isApproved: true },
    { _id: 'r2', student: { name: 'Nusrat Jahan', email: 'nusrat@gmail.com' }, content: 'I used to struggle speaking in corporate meetings. The spoken course gave me the confidence to communicate fluently.', rating: 5, isApproved: false }
  ];

  const fetchReviews = async () => {
    try {
      const res = await api.get('/testimonials');
      if (res.success && res.testimonials) {
        setReviews(res.testimonials);
      } else {
        setReviews(mockReviews);
      }
    } catch (err) {
      setReviews(mockReviews);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApproval = async (id) => {
    try {
      const res = await api.patch(`/testimonials/${id}/approve`);
      if (res.success) {
        toast.success(res.message);
        setReviews(prev => prev.map(r => r._id === id ? { ...r, isApproved: !r.isApproved } : r));
      }
    } catch (err) {
      setReviews(prev => prev.map(r => r._id === id ? { ...r, isApproved: !r.isApproved } : r));
      toast.success('Approval status changed (mock)');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/testimonials/${id}`);
      toast.success('Review deleted');
      setReviews(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      setReviews(prev => prev.filter(r => r._id !== id));
      toast.success('Review deleted (mock)');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold text-brand-black dark:text-white">Student Testimonials</h2>
        <p className="text-xs text-gray-500">Approve reviews to display them on the homepage testimonial carousel.</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-gray-500">Loading student reviews...</div>
      ) : (
        <div className="bg-white dark:bg-brand-darkGray rounded-2xl border border-gray-200/50 dark:border-gray-800/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-brand-black/20 text-gray-400 font-bold border-b border-gray-100 dark:border-gray-800">
                  <th className="p-4">Student</th>
                  <th className="p-4">Review content</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Approval State</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {reviews.map(rev => (
                  <tr key={rev._id} className="hover:bg-gray-50/50 dark:hover:bg-brand-black/10">
                    <td className="p-4">
                      <div className="font-bold">{rev.student?.name}</div>
                      <div className="text-[10px] text-gray-400">{rev.student?.email}</div>
                    </td>
                    <td className="p-4 text-gray-500 max-w-[300px] truncate">{rev.content}</td>
                    <td className="p-4 text-yellow-400 font-bold">
                      <div className="flex">
                        {[...Array(rev.rating)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                        rev.isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {rev.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleToggleApproval(rev._id)}
                        className={`p-1.5 rounded text-white ${
                          rev.isApproved ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        title={rev.isApproved ? 'Revoke Approval' : 'Approve'}
                      >
                        {rev.isApproved ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(rev._id)}
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

export default Testimonials;
