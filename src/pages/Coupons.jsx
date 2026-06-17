import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Tag, Plus, X, Loader2, Trash2, Percent, DollarSign, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../services/admin.service';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minAmount: 0,
    maxUses: 0,
    expiresAt: '',
    isActive: true
  });

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCoupons();
      if (res.success) {
        setCoupons(res.coupons);
      } else {
        throw new Error(res.message || 'Failed to load coupons');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const openCreate = () => {
    setEditing(null);
    setFormData({ code: '', discountType: 'percentage', discountValue: '', minAmount: 0, maxUses: 0, expiresAt: '', isActive: true });
    setShowModal(true);
  };

  const openEdit = (coupon) => {
    setEditing(coupon._id);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minAmount: coupon.minAmount,
      maxUses: coupon.maxUses,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 16) : '',
      isActive: coupon.isActive
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.code.trim() || !formData.discountValue) {
      toast.error('Code and discount value are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minAmount: Number(formData.minAmount),
        maxUses: Number(formData.maxUses)
      };
      if (editing) {
        await updateCoupon(editing, payload);
        toast.success('Coupon updated successfully');
      } else {
        await createCoupon(payload);
        toast.success('Coupon created successfully');
      }
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.message || 'Failed to save coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await deleteCoupon(id);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (err) {
      toast.error(err.message || 'Failed to delete coupon');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1"><h2 className="text-xl font-extrabold text-brand-black dark:text-white">Coupon Management</h2><p className="text-xs text-gray-500">Create and manage discount coupons</p></div>
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white dark:bg-brand-darkGray p-5 rounded-2xl border border-gray-200/50 dark:border-gray-800/80 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="space-y-1"><h2 className="text-xl font-extrabold text-brand-black dark:text-white">Coupon Management</h2><p className="text-xs text-gray-500">Create and manage discount coupons</p></div>
        <div className="bg-white dark:bg-brand-darkGray p-8 rounded-2xl border border-gray-200/50 dark:border-gray-800/80 text-center space-y-4">
          <XCircle className="h-10 w-10 text-red-400 mx-auto" />
          <p className="text-sm text-gray-500">{error}</p>
          <button onClick={fetchCoupons} className="px-4 py-2 bg-brand-red text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-all">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-brand-black dark:text-white">Coupon Management</h2>
          <p className="text-xs text-gray-500">Create and manage discount coupons for enrollments</p>
        </div>
        <button onClick={openCreate} className="flex items-center space-x-2 px-4 py-2.5 bg-brand-red hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-md">
          <Plus className="h-4 w-4" />
          <span>New Coupon</span>
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="bg-white dark:bg-brand-darkGray p-12 rounded-2xl border border-gray-200/50 dark:border-gray-800/80 text-center space-y-3">
          <Tag className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto" />
          <p className="text-sm text-gray-500 font-semibold">No coupons yet</p>
          <p className="text-xs text-gray-400">Create your first coupon to offer discounts to students</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {coupons.map(coupon => {
            const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
            return (
              <motion.div
                key={coupon._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-brand-darkGray rounded-2xl border border-gray-200/50 dark:border-gray-800/80 p-5 space-y-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-brand-red/10 text-brand-red text-xs font-extrabold tracking-wider">{coupon.code}</span>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      {coupon.discountType === 'percentage' ? (
                        <span className="flex items-center"><Percent className="h-3 w-3 mr-1" />{coupon.discountValue}% Off</span>
                      ) : (
                        <span className="flex items-center"><DollarSign className="h-3 w-3 mr-1" />৳{coupon.discountValue} Off</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(coupon._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-400 hover:text-red-500 transition-all">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-2 text-[10px]">
                  <div className="flex justify-between text-gray-500"><span>Min Amount</span><span className="font-bold text-brand-black dark:text-white">৳{coupon.minAmount}</span></div>
                  <div className="flex justify-between text-gray-500"><span>Usage</span><span className="font-bold text-brand-black dark:text-white">{coupon.usedCount}/{coupon.maxUses || '∞'}</span></div>
                  {coupon.expiresAt && (
                    <div className="flex justify-between text-gray-500">
                      <span>Expires</span>
                      <span className={`font-bold flex items-center ${isExpired ? 'text-red-500' : 'text-brand-black dark:text-white'}`}>
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(coupon.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>Status</span>
                    <span className={`font-bold flex items-center ${coupon.isActive && !isExpired ? 'text-emerald-500' : 'text-red-500'}`}>
                      {coupon.isActive && !isExpired ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                      {coupon.isActive && !isExpired ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <button onClick={() => openEdit(coupon)} className="w-full py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-500 hover:border-brand-red hover:text-brand-red transition-all">Edit</button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => !saving && setShowModal(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-brand-darkGray rounded-3xl border border-gray-200/50 dark:border-gray-800/80 shadow-2xl max-w-md w-full overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800/50">
                  <div>
                    <h3 className="text-sm font-extrabold text-brand-black dark:text-white">{editing ? 'Edit Coupon' : 'Create Coupon'}</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">{editing ? 'Update coupon details' : 'Add a new discount coupon'}</p>
                  </div>
                  <button onClick={() => setShowModal(false)} disabled={saving} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold">Coupon Code</label>
                    <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="SUMMER50" className="w-full px-3 py-2 bg-transparent border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none uppercase" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold">Discount Type</label>
                      <select value={formData.discountType} onChange={e => setFormData({ ...formData, discountType: e.target.value })} className="w-full px-3 py-2 bg-transparent border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none">
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat (৳)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold">Discount Value</label>
                      <input type="number" value={formData.discountValue} onChange={e => setFormData({ ...formData, discountValue: e.target.value })} placeholder="10" min="0" className="w-full px-3 py-2 bg-transparent border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold">Min Order Amount (৳)</label>
                      <input type="number" value={formData.minAmount} onChange={e => setFormData({ ...formData, minAmount: e.target.value })} placeholder="0" min="0" className="w-full px-3 py-2 bg-transparent border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold">Max Uses (0 = unlimited)</label>
                      <input type="number" value={formData.maxUses} onChange={e => setFormData({ ...formData, maxUses: e.target.value })} placeholder="0" min="0" className="w-full px-3 py-2 bg-transparent border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold">Expiry Date (optional)</label>
                    <input type="datetime-local" value={formData.expiresAt} onChange={e => setFormData({ ...formData, expiresAt: e.target.value })} className="w-full px-3 py-2 bg-transparent border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none" />
                  </div>

                  <label className="flex items-center space-x-2.5 cursor-pointer pt-2">
                    <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="text-brand-red focus:ring-brand-red h-4 w-4 rounded" />
                    <span className="text-xs font-semibold">Active</span>
                  </label>
                </div>

                <div className="px-5 pb-5">
                  <button onClick={handleSave} disabled={saving} className="w-full py-2.5 bg-brand-red hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Tag className="h-4 w-4" /><span>{editing ? 'Update Coupon' : 'Create Coupon'}</span></>}
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

export default Coupons;
