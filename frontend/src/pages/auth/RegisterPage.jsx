import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import toast from 'react-hot-toast';
import {
  User,
  Mail,
  Lock,
  MapPin,
  Phone,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  phoneNumber: z.string().min(8, 'Phone number must be at least 8 digits'),
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await authApi.register(data);
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-c-bg flex items-center justify-center p-6 font-sans transition-colors duration-300">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-c-accent flex items-center justify-center text-c-accent-text font-bold">
              S
            </div>
            <span className="font-serif font-medium text-lg text-c-text-primary tracking-tight">SmartBill</span>
          </Link>
          <h2 className="text-2xl font-serif font-medium text-c-text-primary">Create an account</h2>
          <p className="text-sm text-c-text-secondary font-medium">
            Join us to start managing your bills today
          </p>
        </div>

        <div className="bg-c-card p-8 rounded-2xl border border-c-border shadow-sm space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-c-text-secondary" htmlFor="firstName">
                  First Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-c-text-secondary"
                    size={16}
                  />
                  <input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    className={`w-full pl-9 pr-4 py-2 bg-c-bg border rounded-xl text-sm font-medium text-c-text-primary placeholder-c-text-secondary/50 focus:bg-c-card focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent transition-all ${
                      errors.firstName
                        ? 'border-c-danger/60 ring-2 ring-c-danger/10'
                        : 'border-c-border'
                    }`}
                    {...register('firstName')}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-xs text-c-danger font-semibold">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-c-text-secondary" htmlFor="lastName">
                  Last Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-c-text-secondary"
                    size={16}
                  />
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    className={`w-full pl-9 pr-4 py-2 bg-c-bg border rounded-xl text-sm font-medium text-c-text-primary placeholder-c-text-secondary/50 focus:bg-c-card focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent transition-all ${
                      errors.lastName
                        ? 'border-c-danger/60 ring-2 ring-c-danger/10'
                        : 'border-c-border'
                    }`}
                    {...register('lastName')}
                  />
                </div>
                {errors.lastName && (
                  <p className="text-xs text-c-danger font-semibold">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-c-text-secondary" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-c-text-secondary"
                  size={16}
                />
                <input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className={`w-full pl-9 pr-4 py-2 bg-c-bg border rounded-xl text-sm font-medium text-c-text-primary placeholder-c-text-secondary/50 focus:bg-c-card focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent transition-all ${
                    errors.email
                      ? 'border-c-danger/60 ring-2 ring-c-danger/10'
                      : 'border-c-border'
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-c-danger font-semibold">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-c-text-secondary" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-c-text-secondary"
                  size={16}
                />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-4 py-2 bg-c-bg border rounded-xl text-sm font-medium text-c-text-primary placeholder-c-text-secondary/50 focus:bg-c-card focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent transition-all ${
                    errors.password
                      ? 'border-c-danger/60 ring-2 ring-c-danger/10'
                      : 'border-c-border'
                  }`}
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-c-danger font-semibold">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-c-text-secondary" htmlFor="address">
                Full Address
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-c-text-secondary"
                  size={16}
                />
                <input
                  id="address"
                  type="text"
                  placeholder="123 Financial St, Capital City"
                  className={`w-full pl-9 pr-4 py-2 bg-c-bg border rounded-xl text-sm font-medium text-c-text-primary placeholder-c-text-secondary/50 focus:bg-c-card focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent transition-all ${
                    errors.address
                      ? 'border-c-danger/60 ring-2 ring-c-danger/10'
                      : 'border-c-border'
                  }`}
                  {...register('address')}
                />
              </div>
              {errors.address && (
                <p className="text-xs text-c-danger font-semibold">
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-c-text-secondary" htmlFor="phoneNumber">
                Phone Number
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-c-text-secondary"
                  size={16}
                />
                <input
                  id="phoneNumber"
                  type="text"
                  placeholder="+1 (555) 123-4567"
                  className={`w-full pl-9 pr-4 py-2 bg-c-bg border rounded-xl text-sm font-medium text-c-text-primary placeholder-c-text-secondary/50 focus:bg-c-card focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent transition-all ${
                    errors.phoneNumber
                      ? 'border-c-danger/60 ring-2 ring-c-danger/10'
                      : 'border-c-border'
                  }`}
                  {...register('phoneNumber')}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-xs text-c-danger font-semibold">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center space-x-2 bg-c-accent text-c-accent-text font-semibold py-2.5 rounded-xl hover:bg-c-accent-hover disabled:bg-c-accent/50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-c-accent/5 hover:scale-[1.02]"
            >
              {submitting ? (
                <span className="w-5 h-5 border-2 border-c-accent-text border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-c-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-c-card px-3 text-c-text-secondary font-semibold tracking-wider">
                Already registered?
              </span>
            </div>
          </div>

          <Link
            to="/login"
            className="w-full flex items-center justify-center py-2.5 border border-c-border text-c-text-secondary hover:bg-c-bg hover:text-c-text-primary rounded-xl font-semibold text-sm transition-colors"
          >
            <ArrowLeft size={16} className="mr-1.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
