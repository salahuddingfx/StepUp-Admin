import React, { useState, useEffect } from 'react';
import { getPayments, updatePaymentStatus, deletePayment } from '../services/admin.service';
import { CreditCard, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPayments();
      if (res.success) {
        setPayments(res.payments);
      } else {
        setError('Failed to fetch payment data');
      }
    } catch (err) {
      setError(err.message || 'Failed to load payments. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await updatePaymentStatus(id, status);
      if (res.success) {
        toast.success(res.message);
        setPayments(prev => prev.map(p => p._id === id ? { ...p, status } : p));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update payment status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment record?')) return;
    try {
      const res = await deletePayment(id);
      if (res.success) {
        toast.success(res.message);
        setPayments(prev => prev.filter(p => p._id !== id));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete payment record');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-brand-black dark:text-white">Payments History</h2>
          <p className="text-xs text-gray-500">Audit logs of course subscription checkouts.</p>
        </div>
        <div className="bg-white dark:bg-brand-darkGray rounded-2xl border border-gray-200/50 dark:border-gray-800/80 p-8">
          <div className="space-y-4 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-brand-black dark:text-white">Payments History</h2>
          <p className="text-xs text-gray-500">Audit logs of course subscription checkouts.</p>
        </div>
        <div className="bg-white dark:bg-brand-darkGray rounded-2xl border border-gray-200/50 dark:border-gray-800/80 p-12 text-center space-y-4">
          <AlertCircle className="h-10 w-10 mx-auto text-red-400" />
          <div>
            <h3 className="text-sm font-bold text-brand-black dark:text-white">Failed to load payments</h3>
            <p className="text-xs text-gray-500 mt-1">{error}</p>
          </div>
          <button onClick={fetchPayments} className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-red text-white rounded-full text-xs font-bold hover:bg-red-600 transition-colors">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold text-brand-black dark:text-white">Payments History</h2>
        <p className="text-xs text-gray-500">Audit logs of course subscription checkouts. Manually approve, reject or delete records.</p>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white dark:bg-brand-darkGray rounded-2xl border border-gray-200/50 dark:border-gray-800/80 p-12 text-center space-y-3">
          <CreditCard className="h-10 w-10 mx-auto text-gray-300" />
          <h3 className="text-sm font-bold text-brand-black dark:text-white">No payment records yet</h3>
          <p className="text-xs text-gray-500">Payments will appear here once students enroll in courses.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-brand-darkGray rounded-2xl border border-gray-200/50 dark:border-gray-800/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-brand-black/20 text-gray-400 font-bold border-b border-gray-100 dark:border-gray-800">
                  <th className="p-4">Student</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {payments.map(pay => (
                  <tr key={pay._id} className="hover:bg-gray-50/50 dark:hover:bg-brand-black/10">
                    <td className="p-4">
                      <div className="font-bold">{pay.student?.name}</div>
                      <div className="text-[10px] text-gray-400">{pay.student?.email}</div>
                    </td>
                    <td className="p-4 text-gray-500">{pay.course?.title}</td>
                    <td className="p-4 font-bold text-brand-black dark:text-white">৳{pay.amount}</td>
                    <td className="p-4 uppercase text-gray-400 font-bold text-[10px]">{pay.paymentMethod}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full capitalize ${
                        pay.status === 'completed' 
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' 
                          : pay.status === 'failed'
                          ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                      }`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">{new Date(pay.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-2">
                        {pay.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(pay._id, 'completed')}
                              className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all"
                              title="Approve & Enroll"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" /></svg>
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(pay._id, 'failed')}
                              className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all"
                              title="Reject Payment"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" /></svg>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(pay._id)}
                          className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                          title="Delete Record"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" /></svg>
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
    </div>
  );
};

export default Payments;
