import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Save, Loader2 } from 'lucide-react';
import { getSettings, updateSettings } from '../services/admin.service';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      appName: '',
      tagline: '',
      contactEmail: '',
      contactPhone: '',
      maintenanceMode: false,
      allowTeacherRegistration: false,
      bkashNumber: '',
      nagadNumber: ''
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getSettings();
        if (response.success && response.data) {
          reset(response.data);
        }
      } catch (error) {
        toast.error(error.message || 'Failed to load system settings');
      } finally {
        setFetching(false);
      }
    };
    fetchSettings();
  }, [reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await updateSettings(data);
      if (response.success) {
        toast.success(response.message || 'System configurations updated successfully!');
        reset(response.data);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update configurations');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold text-brand-black dark:text-white">System Settings</h2>
        <p className="text-xs text-gray-500">Configure public tags, email configurations and toggles.</p>
      </div>

      <div className="bg-white dark:bg-brand-darkGray p-6 rounded-3xl border border-gray-200/50 dark:border-gray-800/80 max-w-xl shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold">Platform Name</label>
              <input 
                type="text" 
                required 
                {...register('appName')}
                className="w-full px-3 py-2 bg-transparent border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold">Brand Tagline</label>
              <input 
                type="text" 
                required 
                {...register('tagline')}
                className="w-full px-3 py-2 bg-transparent border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold">Contact Support Email</label>
                <input 
                  type="email" 
                  required 
                  {...register('contactEmail')}
                  className="w-full px-3 py-2 bg-transparent border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">Support Hot-line</label>
                <input 
                  type="text" 
                  required 
                  {...register('contactPhone')}
                  className="w-full px-3 py-2 bg-transparent border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800/50">
              <div className="space-y-2">
                <label className="text-xs font-bold">bKash Number (Send Money)</label>
                <input 
                  type="text" 
                  {...register('bkashNumber')}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2 bg-transparent border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold">Nagad Number (Send Money)</label>
                <input 
                  type="text" 
                  {...register('nagadNumber')}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2 bg-transparent border border-gray-250 dark:border-gray-800 rounded-lg text-xs focus:border-brand-red focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800/50">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  {...register('maintenanceMode')}
                  className="text-brand-red focus:ring-brand-red h-4 w-4 rounded" 
                />
                <span className="text-xs font-semibold">Enable Under-Maintenance Mode Toggles</span>
              </label>
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  {...register('allowTeacherRegistration')}
                  className="text-brand-red focus:ring-brand-red h-4 w-4 rounded" 
                />
                <span className="text-xs font-semibold">Allow Teacher Registration (on client site)</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-red hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Configs</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
