import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Save, Loader2, Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      appName: 'English StepUp',
      tagline: 'Empowering Growth',
      contactEmail: 'info@englishstepup.com',
      contactPhone: '+880 1712-345678',
      maintenanceMode: false
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    // Simulate API update
    setTimeout(() => {
      setLoading(false);
      toast.success('System configurations updated successfully!');
    }, 1000);
  };

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

            <div className="space-y-2 pt-2">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  {...register('maintenanceMode')}
                  className="text-brand-red focus:ring-brand-red h-4 w-4 rounded" 
                />
                <span className="text-xs font-semibold">Enable Under-Maintenance Mode Toggles</span>
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
