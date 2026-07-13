import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Mail, Lock, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const AdminLoginPage = () => {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await adminLogin(data.email, data.password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Decorative dark background details */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C9A24B]/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10">
        <div className="glass-panel p-8 rounded-2xl shadow-2xl space-y-6 text-[#F1EBDA] border border-[#232F47]">
          {/* Header */}
          <div className="text-center space-y-3 pb-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-[#C9A24B]/10 flex items-center justify-center text-[#C9A24B] border border-[#C9A24B]/20">
              <Shield size={24} />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-serif font-medium text-[#F1EBDA] tracking-tight">Command Center</h2>
              <p className="text-xs text-[#7E8AA6] font-semibold tracking-wider uppercase">Restricted Admin Access</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-[#7E8AA6]" htmlFor="email">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7E8AA6]/60"
                  size={18}
                />
                <input
                  id="email"
                  type="email"
                  placeholder="admin@smartbill.com"
                  className={`w-full pl-10 pr-4 py-2.5 bg-[#0B1220] border rounded-xl text-sm font-semibold text-[#F1EBDA] placeholder-[#7E8AA6]/45 focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/20 focus:border-[#C9A24B] transition-all ${
                    errors.email
                      ? 'border-[#E0645E] ring-2 ring-[#E0645E]/15'
                      : 'border-[#232F47]'
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-[#E0645E] font-semibold">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-[#7E8AA6]" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7E8AA6]/60"
                  size={18}
                />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 bg-[#0B1220] border rounded-xl text-sm font-semibold text-[#F1EBDA] placeholder-[#7E8AA6]/45 focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/20 focus:border-[#C9A24B] transition-all ${
                    errors.password
                      ? 'border-[#E0645E] ring-2 ring-[#E0645E]/15'
                      : 'border-[#232F47]'
                  }`}
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-[#E0645E] font-semibold">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center space-x-2 bg-[#C9A24B] hover:bg-[#B8923A] text-[#0B1220] font-bold py-2.5 rounded-xl disabled:bg-[#C9A24B]/50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-[#C9A24B]/10"
            >
              {submitting ? (
                <span className="w-5 h-5 border-2 border-[#0B1220] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
