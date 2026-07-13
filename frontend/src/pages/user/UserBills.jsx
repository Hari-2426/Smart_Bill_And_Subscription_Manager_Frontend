import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { billsApi } from '../../api/billsApi';
import { paymentsApi } from '../../api/paymentsApi';
import Modal from '../../components/Modal';
import { SkeletonLoader } from '../../components/Loader';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  DollarSign,
  AlertCircle,
  Calendar,
  Bolt,
  Droplet,
  Wifi,
  Smartphone,
  Flame,
  Home,
  Tv,
  ShieldCheck,
  CreditCard,
  HelpCircle,
} from 'lucide-react';

const CATEGORIES = [
  'ELECTRICITY',
  'WATER',
  'INTERNET',
  'MOBILE',
  'GAS',
  'RENT',
  'SUBSCRIPTION',
  'INSURANCE',
  'CREDIT_CARD',
  'OTHER',
];

const RECURRENCES = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'ONE_TIME'];

// Category mapping for custom icon chips
const CATEGORY_MAP = {
  ELECTRICITY: { icon: Bolt, bg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
  WATER: { icon: Droplet, bg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' },
  INTERNET: { icon: Wifi, bg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' },
  MOBILE: { icon: Smartphone, bg: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300' },
  GAS: { icon: Flame, bg: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300' },
  RENT: { icon: Home, bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
  SUBSCRIPTION: { icon: Tv, bg: 'bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300' },
  INSURANCE: { icon: ShieldCheck, bg: 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300' },
  CREDIT_CARD: { icon: CreditCard, bg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' },
  OTHER: { icon: HelpCircle, bg: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-300' },
};

const getCategoryChip = (category) => {
  const cat = category ? category.toUpperCase() : 'OTHER';
  const info = CATEGORY_MAP[cat] || CATEGORY_MAP.OTHER;
  const IconComponent = info.icon;
  
  return (
    <div className="flex items-center space-x-2.5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${info.bg}`}>
        <IconComponent size={16} />
      </div>
      <span className="font-semibold text-c-text-primary capitalize text-sm">
        {cat.toLowerCase().replace('_', ' ')}
      </span>
    </div>
  );
};

const addBillSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  amount: z.preprocess(
    (val) => parseFloat(val),
    z.number().positive('Amount must be greater than 0')
  ),
  recurrence: z.string().min(1, 'Recurrence is required'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Required format YYYY-MM-DD'),
});

const payBillSchema = z.object({
  amountPaid: z.preprocess(
    (val) => parseFloat(val),
    z.number().positive('Amount must be positive')
  ),
  remarks: z.string().optional(),
});

const UserBills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  const [selectedBill, setSelectedBill] = useState(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // react-hook-form setups
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: errorsAdd },
  } = useForm({
    resolver: zodResolver(addBillSchema),
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    setValue: setValueEdit,
    formState: { errors: errorsEdit },
  } = useForm({
    resolver: zodResolver(addBillSchema),
  });

  const {
    register: registerPay,
    handleSubmit: handleSubmitPay,
    setValue: setValuePay,
    reset: resetPay,
    formState: { errors: errorsPay },
  } = useForm({
    resolver: zodResolver(payBillSchema),
  });

  const fetchBills = async () => {
    setLoading(true);
    try {
      const data = await billsApi.getAllBills();
      setBills(data || []);
    } catch (err) {
      console.error('Failed to fetch bills:', err);
      toast.error('Failed to load your bills.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // Handlers
  const onAddSubmit = async (data) => {
    try {
      await billsApi.registerBill(data);
      toast.success('Bill registered successfully!');
      setAddOpen(false);
      resetAdd();
      fetchBills();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to register bill';
      toast.error(msg);
    }
  };

  const onEditClick = (bill) => {
    setSelectedBill(bill);
    setValueEdit('title', bill.title);
    setValueEdit('description', bill.description || '');
    setValueEdit('category', bill.category);
    setValueEdit('amount', bill.amount);
    setValueEdit('recurrence', bill.recurrence);
    setValueEdit('dueDate', bill.dueDate);
    setEditOpen(true);
  };

  const onEditSubmit = async (data) => {
    try {
      await billsApi.updateBill(selectedBill.billId, data);
      toast.success('Bill updated successfully!');
      setEditOpen(false);
      fetchBills();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update bill';
      toast.error(msg);
    }
  };

  const onDeleteClick = (bill) => {
    setSelectedBill(bill);
    setDeleteOpen(true);
  };

  const onDeleteConfirm = async () => {
    try {
      await billsApi.deleteBill(selectedBill.billId);
      toast.success('Bill deleted successfully.');
      setDeleteOpen(false);
      fetchBills();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete bill';
      toast.error(msg);
    }
  };

  const onPayClick = (bill) => {
    setSelectedBill(bill);
    setValuePay('amountPaid', bill.amount);
    setValuePay('remarks', '');
    setPayOpen(true);
  };

  const onPaySubmit = async (data) => {
    try {
      await paymentsApi.payBill({
        billId: selectedBill.billId,
        amountPaid: data.amountPaid,
        remarks: data.remarks || '',
      });
      toast.success(`Recorded payment of ${formatCurrency(data.amountPaid)} successfully!`);
      setPayOpen(false);
      resetPay();
      fetchBills();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to process payment';
      toast.error(msg);
    }
  };

  // Filter bills
  const filteredBills = bills.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.description && b.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter ? b.category === categoryFilter : true;
    const matchesStatus = statusFilter ? b.status === statusFilter : true;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  return (
    <div className="px-6 md:px-10 py-8 space-y-6 text-left">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-medium text-c-text-primary">My Bills & Subscriptions</h2>
          <p className="text-sm text-c-text-secondary font-medium">
            Manage your registered accounts, schedule, amount dues, and transactions
          </p>
        </div>
        <div>
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center justify-center space-x-2 bg-c-accent hover:bg-c-accent-hover text-c-accent-text font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md shadow-c-accent/10 duration-200 hover:scale-[1.02] w-full sm:w-auto"
          >
            <Plus size={16} />
            <span>Add New Bill</span>
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-c-card p-4 rounded-xl border border-c-border shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-c-text-secondary/60"
            size={18}
          />
          <input
            type="text"
            placeholder="Search bills by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-c-border rounded-xl bg-c-bg focus:bg-c-card text-sm font-semibold text-c-text-primary focus:outline-none focus:ring-2 focus:ring-c-accent/20 focus:border-c-accent transition-all"
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Category Dropdown */}
          <div className="relative flex-1 md:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 border border-c-border rounded-xl bg-c-bg focus:bg-c-card text-sm font-semibold text-c-text-secondary focus:outline-none focus:ring-2 focus:ring-c-accent/20 focus:border-c-accent transition-all appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace('_', ' ')}
                </option>
              ))}
            </select>
            <Filter
              className="absolute right-3 top-1/2 -translate-y-1/2 text-c-text-secondary/60 pointer-events-none"
              size={14}
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative flex-1 md:w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 border border-c-border rounded-xl bg-c-bg focus:bg-c-card text-sm font-semibold text-c-text-secondary focus:outline-none focus:ring-2 focus:ring-c-accent/20 focus:border-c-accent transition-all appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
            </select>
            <Filter
              className="absolute right-3 top-1/2 -translate-y-1/2 text-c-text-secondary/60 pointer-events-none"
              size={14}
            />
          </div>
        </div>
      </div>

      {/* Bills Table / Content */}
      <div className="bg-c-card rounded-xl border border-c-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonLoader type="table" count={5} />
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <AlertCircle size={40} className="text-c-text-secondary/40" />
            <p className="text-c-text-secondary text-sm font-semibold">No bills found matching filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-c-bg/50 border-b border-c-border text-xs font-bold text-c-text-secondary uppercase tracking-wider">
                  <th className="px-6 py-4">Title & Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Recurrence</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-c-border text-sm">
                {filteredBills.map((bill) => (
                  <tr key={bill.billId} className="hover:bg-c-bg/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-c-text-primary">{bill.title}</p>
                      {bill.description && (
                        <p className="text-xs text-c-text-secondary truncate max-w-xs font-medium mt-0.5">
                          {bill.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getCategoryChip(bill.category)}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-c-text-secondary uppercase">
                      {bill.recurrence.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 font-semibold text-c-text-secondary">
                      <div className="flex items-center space-x-1.5">
                        <Calendar size={14} className="text-c-text-secondary/60" />
                        <span>{formatDate(bill.dueDate)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-serif font-medium text-c-text-primary">
                      {formatCurrency(bill.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          bill.status === 'PAID'
                            ? 'bg-c-success-bg text-c-success-text border-c-success-bg/35'
                            : bill.status === 'OVERDUE'
                            ? 'bg-c-danger-bg text-c-danger-text border border-c-danger-bg/35 pulse-overdue'
                            : 'bg-c-warning-bg text-c-warning-text border border-c-warning-bg/35'
                        }`}
                      >
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {bill.status !== 'PAID' && (
                          <button
                            onClick={() => onPayClick(bill)}
                            className="inline-flex items-center space-x-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#E1F0E5] text-[#1C3B2E] border border-[#C7CFC7] hover:bg-[#C7CFC7]/50 transition-colors"
                          >
                            <DollarSign size={13} />
                            <span>Pay</span>
                          </button>
                        )}
                        <button
                          onClick={() => onEditClick(bill)}
                          className="p-1.5 rounded-lg border border-c-border text-c-text-secondary hover:bg-c-bg hover:text-c-text-primary transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteClick(bill)}
                          className="p-1.5 rounded-lg border border-c-danger/35 text-c-danger hover:bg-c-danger/10 hover:text-c-danger transition-colors"
                        >
                          <Trash2 size={14} />
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

      {/* Add Bill Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Register New Bill">
        <form onSubmit={handleSubmitAdd(onAddSubmit)} className="space-y-4 font-sans text-left">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-c-text-secondary">Bill Title</label>
            <input
              type="text"
              placeholder="e.g. Fiber Internet Subscription"
              className="w-full px-3 py-2 bg-c-bg border border-c-border rounded-xl text-sm font-semibold text-c-text-primary focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent transition-all"
              {...registerAdd('title')}
            />
            {errorsAdd.title && (
              <p className="text-xs text-c-danger font-semibold">{errorsAdd.title.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-c-text-secondary">Description</label>
            <textarea
              placeholder="Provide a brief billing note (optional)..."
              rows={2}
              className="w-full px-3 py-2 bg-c-bg border border-c-border rounded-xl text-sm font-semibold text-c-text-primary focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent transition-all"
              {...registerAdd('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-c-text-secondary">Category</label>
              <select
                className="w-full px-3 py-2 bg-c-bg border border-c-border rounded-xl text-sm font-semibold text-c-text-secondary focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent transition-all cursor-pointer"
                {...registerAdd('category')}
              >
                <option value="">Select...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace('_', ' ')}
                  </option>
                ))}
              </select>
              {errorsAdd.category && (
                <p className="text-xs text-c-danger font-semibold">{errorsAdd.category.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-c-text-secondary">Recurrence</label>
              <select
                className="w-full px-3 py-2 bg-c-bg border border-c-border rounded-xl text-sm font-semibold text-c-text-secondary focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent transition-all cursor-pointer"
                {...registerAdd('recurrence')}
              >
                <option value="">Select...</option>
                {RECURRENCES.map((r) => (
                  <option key={r} value={r}>
                    {r.replace('_', ' ')}
                  </option>
                ))}
              </select>
              {errorsAdd.recurrence && (
                <p className="text-xs text-c-danger font-semibold">{errorsAdd.recurrence.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-c-text-secondary">Amount Due ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="49.99"
                className="w-full px-3 py-2 bg-c-bg border border-c-border rounded-xl text-sm font-semibold text-c-text-primary focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent transition-all"
                {...registerAdd('amount')}
              />
              {errorsAdd.amount && (
                <p className="text-xs text-c-danger font-semibold">{errorsAdd.amount.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-c-text-secondary">Due Date (YYYY-MM-DD)</label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-c-bg border border-c-border rounded-xl text-sm font-semibold text-c-text-primary focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent transition-all"
                {...registerAdd('dueDate')}
              />
              {errorsAdd.dueDate && (
                <p className="text-xs text-c-danger font-semibold">{errorsAdd.dueDate.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-c-accent hover:bg-c-accent-hover text-c-accent-text font-semibold rounded-xl text-sm transition-colors shadow-md shadow-c-accent/15"
          >
            Submit Registration
          </button>
        </form>
      </Modal>

      {/* Edit Bill Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Update Bill Details">
        <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4 font-sans text-left">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-c-text-secondary">Bill Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-c-bg border border-c-border rounded-xl text-sm font-semibold text-c-text-primary focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent transition-all"
              {...registerEdit('title')}
            />
            {errorsEdit.title && (
              <p className="text-xs text-c-danger font-semibold">{errorsEdit.title.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-c-text-secondary">Description</label>
            <textarea
              rows={2}
              className="w-full px-3 py-2 bg-c-bg border border-c-border rounded-xl text-sm font-semibold text-c-text-primary focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent transition-all"
              {...registerEdit('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-c-text-secondary">Category</label>
              <select
                className="w-full px-3 py-2 bg-c-bg border border-c-border rounded-xl text-sm font-semibold text-c-text-secondary focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent transition-all cursor-pointer"
                {...registerEdit('category')}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace('_', ' ')}
                  </option>
                ))}
              </select>
              {errorsEdit.category && (
                <p className="text-xs text-c-danger font-semibold">{errorsEdit.category.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-c-text-secondary">Recurrence</label>
              <select
                className="w-full px-3 py-2 bg-c-bg border border-c-border rounded-xl text-sm font-semibold text-c-text-secondary focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent transition-all cursor-pointer"
                {...registerEdit('recurrence')}
              >
                {RECURRENCES.map((r) => (
                  <option key={r} value={r}>
                    {r.replace('_', ' ')}
                  </option>
                ))}
              </select>
              {errorsEdit.recurrence && (
                <p className="text-xs text-c-danger font-semibold">{errorsEdit.recurrence.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-c-text-secondary">Amount Due ($)</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 bg-c-bg border border-c-border rounded-xl text-sm font-semibold text-c-text-primary focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent transition-all"
                {...registerEdit('amount')}
              />
              {errorsEdit.amount && (
                <p className="text-xs text-c-danger font-semibold">{errorsEdit.amount.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-c-text-secondary">Due Date (YYYY-MM-DD)</label>
              <input
                type="date"
                className="w-full px-3 py-2 bg-c-bg border border-c-border rounded-xl text-sm font-semibold text-c-text-primary focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent transition-all"
                {...registerEdit('dueDate')}
              />
              {errorsEdit.dueDate && (
                <p className="text-xs text-c-danger font-semibold">{errorsEdit.dueDate.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-c-accent hover:bg-c-accent-hover text-c-accent-text font-semibold rounded-xl text-sm transition-colors shadow-md"
          >
            Save Changes
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Confirm Deletion">
        <div className="space-y-4 font-sans text-left text-sm text-c-text-secondary">
          <p>
            Are you sure you want to delete the bill "
            <strong className="text-c-text-primary">{selectedBill?.title}</strong>"? This action is
            permanent and cannot be undone.
          </p>
          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={onDeleteConfirm}
              className="flex-1 py-2 bg-c-danger text-c-danger-text hover:bg-c-danger/85 font-semibold rounded-xl text-sm transition-colors shadow-sm"
            >
              Delete Permanently
            </button>
            <button
              type="button"
              onClick={() => setDeleteOpen(false)}
              className="flex-1 py-2 border border-c-border text-c-text-secondary hover:bg-c-bg font-semibold rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Pay Bill Modal */}
      <Modal isOpen={payOpen} onClose={() => setPayOpen(false)} title="Submit Bill Payment">
        <form onSubmit={handleSubmitPay(onPaySubmit)} className="space-y-4 font-sans text-left">
          <p className="text-xs text-c-text-secondary font-medium">
            Recording payment for <strong className="text-c-text-primary">{selectedBill?.title}</strong>
          </p>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-c-text-secondary">Payment Amount ($)</label>
            <input
              type="number"
              step="0.01"
              className="w-full px-3 py-2 bg-c-bg border border-c-border rounded-xl text-sm font-semibold text-c-text-primary focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent transition-all"
              {...registerPay('amountPaid')}
            />
            {errorsPay.amountPaid && (
              <p className="text-xs text-c-danger font-semibold">{errorsPay.amountPaid.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-c-text-secondary">Remarks / Transaction ID</label>
            <input
              type="text"
              placeholder="e.g. Paid online via banking app"
              className="w-full px-3 py-2 bg-c-bg border border-c-border rounded-xl text-sm font-semibold text-c-text-primary focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent transition-all"
              {...registerPay('remarks')}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-c-accent hover:bg-c-accent-hover text-c-accent-text font-semibold rounded-xl text-sm transition-colors shadow-md"
          >
            Record Payment
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default UserBills;
