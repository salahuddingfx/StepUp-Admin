import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ShieldAlert, LogIn, Mail, Lock, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    dispatch(loginStart());
    try {
      // Direct call to standard auth login endpoint
      const res = await api.post('/auth/login', {
        email: data.email,
        password: data.password
      });

      if (res.success) {
        // Enforce admin validation
        if (res.user.role !== 'admin') {
          const errMsg = 'Access Denied: Only administrators can access this control panel.';
          dispatch(loginFailure(errMsg));
          toast.error(errMsg);
          return;
        }

        dispatch(loginSuccess(res));
        toast.success(`Access granted. Welcome, Admin ${res.user.name}!`);
        navigate('/admin');
      } else {
        throw new Error(res.message || 'Login failed');
      }
    } catch (err) {
      dispatch(loginFailure(err.message));
      toast.error(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Background Decorative Glow Circles */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-brand-red/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-brand-red/5 blur-3xl" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-brand-darkGray/40 backdrop-blur-md border border-gray-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-red/10 border border-brand-red/20 shadow-inner">
            <img src="/StepUp.jpg" alt="StepUp Logo" className="h-10 w-10 rounded-xl object-cover shadow-lg" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-black tracking-wider text-white uppercase">
              StepUp <span className="text-brand-red font-medium text-xs tracking-normal capitalize">SaaS Admin</span>
            </h1>
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest flex items-center justify-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-brand-red" />
              Secure Administration Console
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
              <input
                type="email"
                {...register('email')}
                placeholder="admin@englishstepup.com"
                className="w-full pl-10 pr-4 py-3 bg-brand-black/40 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-600 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red transition-all"
              />
            </div>
            {errors.email && <p className="text-[10px] text-brand-red font-semibold">{errors.email.message}</p>}
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Security Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-brand-black/40 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-600 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red transition-all"
              />
            </div>
            {errors.password && <p className="text-[10px] text-brand-red font-semibold">{errors.password.message}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-red hover:bg-red-600 disabled:bg-brand-red/50 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-brand-red/15 hover:shadow-xl hover:shadow-brand-red/25 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Verify & Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center text-[10px] font-semibold text-gray-600 border-t border-gray-800/40 pt-4">
          IP Address logging active. Authorized access only.
        </div>
      </div>
    </div>
  );
};

export default Login;
