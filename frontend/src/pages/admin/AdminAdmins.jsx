import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { adminApi } from '../../api/adminApi';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import { SkeletonLoader } from '../../components/Loader';
import toast from 'react-hot-toast';
import { Search, UserPlus, ShieldAlert, User, Mail, Lock } from 'lucide-react';

const adminRegisterSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const AdminAdmins = () => {
  const { user: currentAdmin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [registerOpen, setRegisterOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminRegisterSchema),
  });

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllAdmins();
      setAdmins(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load administrative accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const onRegisterSubmit = async (data) => {
    try {
      await adminApi.registerAdmin(data);
      toast.success('Admin registered successfully!');
      setRegisterOpen(false);
      reset();
      fetchAdmins();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to register admin';
      toast.error(msg);
    }
  };

  const onToggleClick = (adminItem) => {
    setSelectedAdmin(adminItem);
    setConfirmOpen(true);
  };

  const onToggleConfirm = async () => {
    const isActivating = selectedAdmin.accountStatus !== 'ACTIVE';
    try {
      if (isActivating) {
        await adminApi.activateAdmin(selectedAdmin.adminId);
        toast.success(`Admin ${selectedAdmin.firstName} activated.`);
      } else {
        await adminApi.deactivateAdmin(selectedAdmin.adminId);
        toast.success(`Admin ${selectedAdmin.firstName} deactivated.`);
      }
      setConfirmOpen(false);
      fetchAdmins();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to toggle admin status';
      toast.error(msg);
    }
  };

  const filteredAdmins = admins.filter((a) => {
    const name = `${a.firstName} ${a.lastName}`.toLowerCase();
    return (
      name.includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase())
    );
  });


  return (
    <div className="px-6 md:px-10 py-8 space-y-6 font-sans text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-medium text-c-text-primary">System Administrator Accounts</h2>
          <p className="text-sm text-c-text-secondary font-medium">
            Register new administrative credentials and manage service access permissions
          </p>
        </div>
        <button
          onClick={() => setRegisterOpen(true)}
          className="inline-flex items-center justify-center space-x-2 bg-c-accent hover:bg-c-accent-hover text-c-accent-text font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md duration-200 hover:scale-[1.02] w-full sm:w-auto"
        >
          <UserPlus size={16} />
          <span>Register Admin</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-c-card p-4 rounded-xl border border-c-border shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-c-text-secondary/60" size={18} />
          <input
            type="text"
            placeholder="Search administrative accounts by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-c-border rounded-xl bg-c-bg focus:bg-c-card text-sm font-semibold text-c-text-primary focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-c-card rounded-xl border border-c-border shadow-sm overflow-hidden animate-fade-in">
        {loading ? (
          <div className="p-6">
            <SkeletonLoader type="table" count={4} />
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <ShieldAlert size={40} className="text-c-text-secondary/40" />
            <p className="text-c-text-secondary text-sm font-medium">
              No admin accounts found matching filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-c-bg/50 border-b border-c-border text-xs font-bold text-c-text-secondary uppercase tracking-wider select-none">
                  <th className="px-6 py-4">Full Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Security Role</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-c-border text-sm">
                {filteredAdmins.map((a) => {
                  const isSelf =
                    currentAdmin &&
                    (currentAdmin.adminId === a.adminId || currentAdmin.email === a.email);
                  return (
                    <tr key={a.adminId} className="hover:bg-c-bg/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-c-text-primary">
                        {a.firstName} {a.lastName}
                        {isSelf && (
                          <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded bg-c-accent/15 text-c-accent border border-c-accent/30">
                            You
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-c-text-secondary">{a.email}</td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-c-bg border border-c-border text-c-text-secondary uppercase tracking-wider">
                          {a.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            a.accountStatus === 'ACTIVE'
                              ? 'bg-c-success-bg text-c-success-text border-c-success-bg/35'
                              : 'bg-c-danger-bg text-c-danger-text border border-c-danger-bg/35'
                          }`}
                        >
                          {a.accountStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isSelf && a.role !== 'SUPER_ADMIN' ? (
                          <button
                            onClick={() => onToggleClick(a)}
                            className={`inline-flex items-center space-x-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200 ${
                              a.accountStatus === 'ACTIVE'
                                ? 'border border-c-border text-c-text-secondary hover:bg-c-danger-bg/20 hover:text-c-danger-text hover:border-c-danger-bg/40'
                                : 'bg-c-accent hover:bg-c-accent-hover text-c-accent-text hover:scale-[1.02] shadow-sm'
                            }`}
                          >
                            <span>{a.accountStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}</span>
                          </button>
                        ) : (
                          <span className="text-xs font-medium text-c-text-secondary/40 italic select-none pr-3">
                            Locked
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Admin Modal */}
      <Modal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        title="Register Administrative Account"
      >
        <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-4 font-sans text-left">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-c-text-secondary">First Name</label>
              <div className="relative">
                <User
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-c-text-secondary/60"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Jane"
                  className="w-full pl-9 pr-4 py-2 bg-c-bg border border-c-border rounded-xl text-sm font-semibold text-c-text-primary focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent"
                  {...register('firstName')}
                />
              </div>
              {errors.firstName && (
                <p className="text-xs text-c-danger font-semibold">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-c-text-secondary">Last Name</label>
              <div className="relative">
                <User
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-c-text-secondary/60"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Smith"
                  className="w-full pl-9 pr-4 py-2 bg-c-bg border border-c-border rounded-xl text-sm font-semibold text-c-text-primary focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent"
                  {...register('lastName')}
                />
              </div>
              {errors.lastName && (
                <p className="text-xs text-c-danger font-semibold">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-c-text-secondary">Admin Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-c-text-secondary/60" size={16} />
              <input
                type="email"
                placeholder="jane.smith@smartbill.com"
                className="w-full pl-9 pr-4 py-2 bg-c-bg border border-c-border rounded-xl text-sm font-semibold text-c-text-primary focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-c-danger font-semibold">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-c-text-secondary">Temporary Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-c-text-secondary/60" size={16} />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2 bg-c-bg border border-c-border rounded-xl text-sm font-semibold text-c-text-primary focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent"
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-c-danger font-semibold">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-c-accent hover:bg-c-accent-hover text-c-accent-text font-bold rounded-xl text-sm transition-colors shadow-md shadow-c-accent/15"
          >
            Submit Administrative Registration
          </button>
        </form>
      </Modal>

      {/* Confirm Toggle Modal */}
      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm Admin Status Change"
      >
        <div className="space-y-4 text-left font-sans text-sm text-c-text-secondary">
          <p>
            Are you sure you want to{' '}
            {selectedAdmin?.accountStatus === 'ACTIVE' ? 'deactivate' : 'activate'} the admin
            credentials for{' '}
            <strong className="text-c-text-primary">
              {selectedAdmin?.firstName} {selectedAdmin?.lastName}
            </strong>
            ?
          </p>
          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={onToggleConfirm}
              className="flex-1 py-2 font-semibold text-[#0B1220] rounded-xl text-sm bg-c-accent hover:bg-c-accent-hover transition-colors shadow-sm"
            >
              Confirm Status Change
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
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

export default AdminAdmins;
