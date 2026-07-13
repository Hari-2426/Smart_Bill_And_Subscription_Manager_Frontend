import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import Modal from '../../components/Modal';
import { SkeletonLoader } from '../../components/Loader';
import toast from 'react-hot-toast';
import { Search, Filter, Eye, ShieldAlert, Calendar, MapPin, Phone } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch users list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onViewDetails = async (userItem) => {
    try {
      const details = await adminApi.getUserDetails(userItem.userId);
      setSelectedUser(details);
      setDetailOpen(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load user details.');
    }
  };

  const onToggleConfirmClick = (userItem) => {
    setSelectedUser(userItem);
    setConfirmOpen(true);
  };

  const onToggleStatusConfirm = async () => {
    const isActivating = selectedUser.accountStatus !== 'ACTIVE';
    try {
      if (isActivating) {
        await adminApi.activateUser(selectedUser.userId);
        toast.success(`User ${selectedUser.firstName} activated successfully.`);
      } else {
        await adminApi.deactivateUser(selectedUser.userId);
        toast.success(`User ${selectedUser.firstName} deactivated successfully.`);
      }
      setConfirmOpen(false);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update user status';
      toast.error(msg);
    }
  };

  const filteredUsers = users.filter((u) => {
    const name = `${u.firstName} ${u.lastName}`.toLowerCase();
    const matchesSearch =
      name.includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phoneNumber && u.phoneNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter ? u.accountStatus === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  return (
    <div className="px-6 md:px-10 py-8 space-y-6 font-sans text-left">
      <div>
        <h2 className="text-2xl md:text-3xl font-serif font-medium text-c-text-primary">System Users Accounts</h2>
        <p className="text-sm text-c-text-secondary font-medium">
          Monitor register logs, audit locations, search profiles, and toggle account states
        </p>
      </div>

      {/* Filters bar */}
      <div className="bg-c-card p-4 rounded-xl border border-c-border shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-c-text-secondary/60" size={18} />
          <input
            type="text"
            placeholder="Search system users by name, email, phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-c-border rounded-xl bg-c-bg focus:bg-c-card text-sm font-semibold text-c-text-primary focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent transition-all"
          />
        </div>
        <div className="relative w-full md:w-48 flex-shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-3 pr-8 py-2 border border-c-border rounded-xl bg-c-bg focus:bg-c-card text-sm font-semibold text-c-text-secondary focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent transition-all appearance-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="BLOCKED">Blocked</option>
          </select>
          <Filter
            className="absolute right-3 top-1/2 -translate-y-1/2 text-c-text-secondary/60 pointer-events-none"
            size={14}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-c-card rounded-xl border border-c-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonLoader type="table" count={5} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <ShieldAlert size={40} className="text-c-text-secondary/40" />
            <p className="text-c-text-secondary text-sm font-semibold">
              No system users found matching filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-c-bg/50 border-b border-c-border text-xs font-bold text-c-text-secondary uppercase tracking-wider select-none">
                  <th className="px-6 py-4">Full Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">System Role</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-c-border text-sm">
                {filteredUsers.map((u) => (
                  <tr key={u.userId} className="hover:bg-c-bg/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-c-text-primary">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-6 py-4 font-semibold text-c-text-secondary">{u.email}</td>
                    <td className="px-6 py-4 text-c-text-secondary font-mono text-xs">
                      {u.phoneNumber || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-c-bg border border-c-border text-c-text-secondary uppercase tracking-wider">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          u.accountStatus === 'ACTIVE'
                            ? 'bg-c-success-bg text-c-success-text border-c-success-bg/35'
                            : u.accountStatus === 'BLOCKED'
                            ? 'bg-c-danger-bg text-c-danger-text border border-c-danger-bg/35'
                            : 'bg-c-warning-bg text-c-warning-text border border-c-warning-bg/35'
                        }`}
                      >
                        {u.accountStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onViewDetails(u)}
                          className="inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-c-border hover:bg-c-bg text-c-text-secondary hover:text-c-text-primary transition-colors"
                        >
                          <Eye size={13} />
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={() => onToggleConfirmClick(u)}
                          className={`inline-flex items-center space-x-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200 ${
                            u.accountStatus === 'ACTIVE'
                              ? 'border border-c-border text-c-text-secondary hover:bg-c-danger-bg/20 hover:text-c-danger-text hover:border-c-danger-bg/40'
                              : 'bg-c-accent hover:bg-c-accent-hover text-c-accent-text hover:scale-[1.02] shadow-sm'
                          }`}
                        >
                          <span>{u.accountStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="System User Profile Details"
      >
        {selectedUser && (
          <div className="space-y-5 text-left font-sans text-sm">
            <div className="flex items-center space-x-4 border-b border-c-border pb-4">
              <div className="w-12 h-12 rounded-full bg-[#232F47] border border-[#232F47] flex items-center justify-center text-[#C9A24B] font-bold text-lg select-none">
                {selectedUser.firstName[0] + selectedUser.lastName[0]}
              </div>
              <div>
                <h4 className="font-serif font-medium text-c-text-primary text-base">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h4>
                <p className="text-xs text-c-text-secondary font-semibold">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-c-text-secondary uppercase tracking-wider">
                  Account Status
                </span>
                <p className="font-bold text-c-text-primary capitalize">
                  {selectedUser.accountStatus.toLowerCase()}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-c-text-secondary uppercase tracking-wider">
                  Account Role
                </span>
                <p className="font-bold text-c-text-primary">{selectedUser.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-c-text-secondary uppercase tracking-wider flex items-center space-x-1">
                  <Phone size={10} />
                  <span>Phone Number</span>
                </span>
                <p className="font-bold text-c-text-primary font-mono text-xs font-semibold">
                  {selectedUser.phoneNumber || '—'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-c-text-secondary uppercase tracking-wider flex items-center space-x-1">
                  <Calendar size={10} />
                  <span>Created At</span>
                </span>
                <p className="font-bold text-c-text-primary">{formatDate(selectedUser.createdAt)}</p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-c-text-secondary uppercase tracking-wider flex items-center space-x-1">
                <MapPin size={10} />
                <span>Contact Address</span>
              </span>
              <p className="font-semibold text-c-text-secondary leading-relaxed">
                {selectedUser.address || '—'}
              </p>
            </div>

            <div className="border-t border-c-border pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailOpen(false)}
                className="px-4 py-2 border border-c-border hover:bg-c-bg text-c-text-secondary font-semibold rounded-xl text-xs transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toggle Confirmation Modal */}
      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm Status Change">
        <div className="space-y-4 text-left font-sans text-sm text-c-text-secondary">
          <p>
            Are you sure you want to{' '}
            {selectedUser?.accountStatus === 'ACTIVE' ? 'deactivate' : 'activate'} the user account
            for{' '}
            <strong className="text-c-text-primary">
              {selectedUser?.firstName} {selectedUser?.lastName}
            </strong>
            ?
          </p>
          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={onToggleStatusConfirm}
              className={`flex-1 py-2 font-semibold text-[#0B1220] rounded-xl text-sm transition-colors shadow-sm bg-c-accent hover:bg-c-accent-hover`}
            >
              Confirm {selectedUser?.accountStatus === 'ACTIVE' ? 'Deactivation' : 'Activation'}
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

export default AdminUsers;
