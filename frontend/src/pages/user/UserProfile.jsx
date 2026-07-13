import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import { AlertTriangle, Trash2 } from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  phoneNumber: z.string().min(8, 'Phone number must be at least 8 digits'),
});

const passwordSchema = z
  .object({
    oldPassword: z.string().min(6, 'Old password must be at least 6 characters'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const UserProfile = () => {
  const { user, refreshProfile, logout } = useAuth();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    setValue: setValueProfile,
    formState: { errors: errorsProfile },
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: errorsPassword },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (user) {
      setValueProfile('firstName', user.firstName || '');
      setValueProfile('lastName', user.lastName || '');
      setValueProfile('address', user.address || '');
      setValueProfile('phoneNumber', user.phoneNumber || '');
    }
  }, [user, setValueProfile]);

  const onProfileSubmit = async (data) => {
    setUpdatingProfile(true);
    try {
      await authApi.updateProfile(data);
      toast.success('Profile details updated successfully!');
      await refreshProfile();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setUpdatingPassword(true);
    try {
      await authApi.updatePassword(data);
      toast.success('Password changed successfully!');
      resetPassword();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update password';
      toast.error(msg);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const onDeleteConfirm = async () => {
    if (deleteInput !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    try {
      await authApi.deleteAccount();
      toast.success('Your account has been deleted.');
      logout();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete account';
      toast.error(msg);
    }
  };

  return (
    <div className="px-6 md:px-10 py-8 max-w-4xl mx-auto space-y-8 font-sans text-left">
      <div>
        <h2 className="text-2xl md:text-3xl font-serif font-medium text-c-text-primary">Profile & Security Settings</h2>
        <p className="text-sm text-c-text-secondary font-medium">
          Modify contact details, edit passwords, and manage account preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Card */}
        <div className="bg-c-card p-6 rounded-xl border border-c-border shadow-sm space-y-6">
          <h3 className="font-serif font-medium text-c-text-primary text-base border-b border-c-border pb-3">
            General Contact Info
          </h3>
          <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-c-text-secondary">Email Address (Locked)</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2 bg-c-bg/40 border border-c-border/60 rounded-xl text-sm font-semibold text-c-text-secondary/60 cursor-not-allowed focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-c-text-secondary">First Name</label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2 bg-c-bg border border-c-border text-c-text-primary rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent"
                  {...registerProfile('firstName')}
                />
                {errorsProfile.firstName && (
                  <p className="text-xs text-c-danger font-semibold">
                    {errorsProfile.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-c-text-secondary">Last Name</label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2 bg-c-bg border border-c-border text-c-text-primary rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent"
                  {...registerProfile('lastName')}
                />
                {errorsProfile.lastName && (
                  <p className="text-xs text-c-danger font-semibold">
                    {errorsProfile.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-c-text-secondary">Full Address</label>
              <input
                type="text"
                className="w-full px-3.5 py-2 bg-c-bg border border-c-border text-c-text-primary rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent"
                {...registerProfile('address')}
              />
              {errorsProfile.address && (
                <p className="text-xs text-c-danger font-semibold">
                  {errorsProfile.address.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-c-text-secondary">Phone Number</label>
              <input
                type="text"
                className="w-full px-3.5 py-2 bg-c-bg border border-c-border text-c-text-primary rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent"
                {...registerProfile('phoneNumber')}
              />
              {errorsProfile.phoneNumber && (
                <p className="text-xs text-c-danger font-semibold">
                  {errorsProfile.phoneNumber.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full py-2.5 bg-c-accent hover:bg-c-accent-hover text-c-accent-text font-semibold rounded-xl text-sm transition-colors shadow-md shadow-c-accent/15 animate-fade-in"
            >
              {updatingProfile ? 'Saving Details...' : 'Save Details'}
            </button>
          </form>
        </div>

        {/* Security Card / Password */}
        <div className="bg-c-card p-6 rounded-xl border border-c-border shadow-sm space-y-6">
          <h3 className="font-serif font-medium text-c-text-primary text-base border-b border-c-border pb-3">
            Change Profile Password
          </h3>
          <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-c-text-secondary">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2 bg-c-bg border border-c-border text-c-text-primary rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent"
                {...registerPassword('oldPassword')}
              />
              {errorsPassword.oldPassword && (
                <p className="text-xs text-c-danger font-semibold">
                  {errorsPassword.oldPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-c-text-secondary">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2 bg-c-bg border border-c-border text-c-text-primary rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent"
                {...registerPassword('newPassword')}
              />
              {errorsPassword.newPassword && (
                <p className="text-xs text-c-danger font-semibold">
                  {errorsPassword.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-c-text-secondary">Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2 bg-c-bg border border-c-border text-c-text-primary rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent"
                {...registerPassword('confirmPassword')}
              />
              {errorsPassword.confirmPassword && (
                <p className="text-xs text-c-danger font-semibold">
                  {errorsPassword.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="w-full py-2.5 bg-c-accent hover:bg-c-accent-hover text-c-accent-text font-semibold rounded-xl text-sm transition-colors shadow-md shadow-c-accent/15 animate-fade-in"
            >
              {updatingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-c-danger-bg/10 p-6 rounded-xl border border-c-danger-bg/25 shadow-sm space-y-4 text-left">
        <div className="flex items-center space-x-2.5 text-c-danger-text font-bold">
          <AlertTriangle size={20} className="text-c-danger" />
          <h3 className="text-base font-serif font-medium">Danger Zone</h3>
        </div>
        <p className="text-xs text-c-text-secondary font-medium">
          Once you delete your account, there is no going back. All of your historical bills and
          payment transactions will be permanently deleted.
        </p>
        <button
          onClick={() => setDeleteOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 border border-c-danger/30 hover:border-c-danger bg-c-card hover:bg-c-danger/10 text-c-danger font-bold text-xs rounded-xl transition-all"
        >
          <Trash2 size={14} className="text-c-danger" />
          <span>Delete Account</span>
        </button>
      </div>

      {/* Account Delete Modal */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Account Confirmation"
      >
        <div className="space-y-4 text-left font-sans text-sm text-c-text-secondary">
          <p>
            Please type <strong className="text-c-text-primary select-none">DELETE</strong> below to
            confirm that you wish to remove your account.
          </p>
          <input
            type="text"
            placeholder="Type DELETE..."
            value={deleteInput}
            onChange={(e) => setDeleteInput(e.target.value)}
            className="w-full px-3.5 py-2 bg-c-bg border border-c-border rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-c-danger/25 focus:border-c-danger text-c-text-primary placeholder-c-text-secondary/40"
          />
          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={onDeleteConfirm}
              className="flex-1 py-2 bg-c-danger text-c-danger-text hover:bg-c-danger/85 font-semibold rounded-xl text-sm transition-colors shadow-sm"
            >
              Delete Account
            </button>
            <button
              onClick={() => setDeleteOpen(false)}
              className="flex-1 py-2 border border-c-border text-c-text-secondary hover:bg-c-bg font-semibold rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserProfile;
