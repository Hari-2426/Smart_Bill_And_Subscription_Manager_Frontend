import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { billsApi } from '../../api/billsApi';
import { paymentsApi } from '../../api/paymentsApi';
import Modal from '../../components/Modal';
import { SkeletonLoader } from '../../components/Loader';
import toast from 'react-hot-toast';
import { AlertOctagon, DollarSign, Calendar, RefreshCw } from 'lucide-react';

const paySchema = z.object({
  amountPaid: z.preprocess(
    (val) => (val === '' ? undefined : parseFloat(val)),
    z.number().positive('Payment amount must be a positive number')
  ),
  remarks: z.string().optional(),
});

const UserOverdueBills = () => {
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [payOpen, setPayOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(paySchema),
  });

  const fetchOverdue = async () => {
    setLoading(true);
    try {
      const data = await billsApi.getOverdueBills();
      setOverdue(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load overdue bills.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdue();
  }, []);

  const onPayClick = (bill) => {
    setSelectedBill(bill);
    setValue('amountPaid', bill.amount);
    setValue('remarks', '');
    reset({ amountPaid: bill.amount, remarks: '' });
    setPayOpen(true);
  };

  const onPaySubmit = async (data) => {
    try {
      await paymentsApi.payBill({
        billId: selectedBill.billId,
        amountPaid: data.amountPaid,
        remarks: data.remarks || '',
      });
      toast.success('Payment recorded successfully!');
      setPayOpen(false);
      fetchOverdue();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit payment';
      toast.error(msg);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  return (
    <div className="px-6 md:px-10 py-8 space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-medium text-c-text-primary">Overdue Resolution Center</h2>
          <p className="text-sm text-c-text-secondary font-medium">
            Review and settle accounts that require immediate resolution
          </p>
        </div>
        <button
          onClick={fetchOverdue}
          className="inline-flex items-center justify-center space-x-1.5 border border-c-border bg-c-card hover:bg-c-bg text-c-text-secondary font-semibold text-sm px-4 py-2 rounded-xl transition-all w-full sm:w-auto"
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <SkeletonLoader type="table" count={4} />
      ) : overdue.length === 0 ? (
        <div className="bg-c-card p-12 rounded-xl border border-c-border shadow-sm flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-c-success-bg flex items-center justify-center text-c-success-text border border-c-success-bg/30">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="font-serif font-medium text-c-text-primary text-lg">All clear!</h3>
          <p className="text-c-text-secondary text-sm font-semibold">
            You do not have any overdue bills at this time.
          </p>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 rounded-xl bg-c-danger-bg/10 border border-c-danger-bg/25 text-sm font-medium text-c-danger-text flex items-start space-x-3">
            <AlertOctagon className="flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-bold">Immediate Attention Required</p>
              <p className="text-c-danger-text mt-0.5 text-xs font-semibold">
                You have {overdue.length} overdue bill{overdue.length > 1 ? 's' : ''} total. Settle
                them to prevent service restrictions or extra fees.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {overdue.map((bill) => (
              <div
                key={bill.billId}
                className="bg-c-card p-6 rounded-xl border border-c-danger-bg/20 hover:border-c-danger-bg/50 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover-lift"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-c-danger-bg text-c-danger-text uppercase tracking-wider select-none border border-c-danger-bg/30 pulse-overdue">
                      Overdue
                    </span>
                    <span className="text-xs font-semibold text-c-text-secondary uppercase tracking-wide">
                      {bill.category.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-serif font-medium text-c-text-primary text-lg truncate">{bill.title}</h3>
                  {bill.description && (
                    <p className="text-xs text-c-text-secondary truncate max-w-lg font-medium">
                      {bill.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-1.5 text-xs text-c-danger-text font-bold">
                    <Calendar size={14} />
                    <span>Was due on {formatDate(bill.dueDate)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-6 w-full sm:w-auto justify-between sm:justify-end flex-shrink-0 border-t sm:border-t-0 border-c-border pt-4 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-semibold text-c-text-secondary">Total Due</p>
                    <p className="text-xl font-serif font-medium text-c-text-primary">
                      {formatCurrency(bill.amount)}
                    </p>
                  </div>
                  <button
                    onClick={() => onPayClick(bill)}
                    className="inline-flex items-center justify-center space-x-1.5 bg-[#E1F0E5] text-[#1C3B2E] border border-[#C7CFC7] font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm hover:bg-[#C7CFC7]/50 transition-colors"
                  >
                    <DollarSign size={16} />
                    <span>Pay Bill</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pay Modal */}
      <Modal isOpen={payOpen} onClose={() => setPayOpen(false)} title="Settle Overdue Bill">
        <form onSubmit={handleSubmit(onPaySubmit)} className="space-y-4 font-sans text-left">
          <p className="text-xs text-c-text-secondary font-medium">
            Recording payment for <strong className="text-c-text-primary">{selectedBill?.title}</strong>
          </p>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-c-text-secondary">Payment Amount ($)</label>
            <input
              type="number"
              step="0.01"
              className="w-full px-3 py-2 bg-c-bg border border-c-border rounded-xl text-sm font-semibold text-c-text-primary focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent transition-all"
              {...register('amountPaid')}
            />
            {errors.amountPaid && (
              <p className="text-xs text-c-danger font-semibold">{errors.amountPaid.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-c-text-secondary">Remarks / Transaction ID</label>
            <input
              type="text"
              placeholder="e.g. Settled overdue online"
              className="w-full px-3 py-2 bg-c-bg border border-c-border rounded-xl text-sm font-semibold text-c-text-primary focus:outline-none focus:ring-2 focus:ring-c-accent/25 focus:border-c-accent transition-all"
              {...register('remarks')}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-c-accent hover:bg-c-accent-hover text-c-accent-text font-semibold rounded-xl text-sm transition-colors shadow-md"
          >
            Settle Amount
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default UserOverdueBills;
