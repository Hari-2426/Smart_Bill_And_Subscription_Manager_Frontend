import React, { useState, useEffect } from 'react';
import { paymentsApi } from '../../api/paymentsApi';
import { SkeletonLoader } from '../../components/Loader';
import { Search, Filter, Calendar, FileText, CheckCircle2, XCircle, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const UserPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedPaymentId, setExpandedPaymentId] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await paymentsApi.getPaymentHistory();
      setPayments(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load payment history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const toggleRow = (paymentId) => {
    if (expandedPaymentId === paymentId) {
      setExpandedPaymentId(null);
    } else {
      setExpandedPaymentId(paymentId);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.paymentId && String(p.paymentId).toLowerCase().includes(search.toLowerCase())) ||
      (p.remarks && p.remarks.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter ? p.paymentStatus === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const formatDate = (dateStr) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  const downloadExcel = () => {
    if (filteredPayments.length === 0) {
      toast.error('No payment data available to download.');
      return;
    }

    // CSV Headers
    const headers = ['Payment ID', 'Bill Title', 'Amount Paid ($)', 'Payment Date', 'Status', 'Remarks'];

    // Map rows
    const rows = filteredPayments.map((p) => [
      p.paymentId,
      `"${(p.title || '').replace(/"/g, '""')}"`,
      p.amountPaid,
      `"${p.paymentDate || ''}"`,
      p.paymentStatus,
      `"${(p.remarks || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    
    // Create Blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SmartBill_Payments_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Downloaded payments history successfully!');
  };

  return (
    <div className="px-6 md:px-10 py-8 space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-medium text-c-text-primary">Payment History</h2>
          <p className="text-sm text-c-text-secondary font-medium">
            Track payments, view receipts, transaction remarks, and statuses
          </p>
        </div>
        <button
          onClick={downloadExcel}
          className="inline-flex items-center justify-center space-x-2 bg-c-card hover:bg-c-bg text-c-text-secondary border border-c-border font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] w-full sm:w-auto"
        >
          <Download size={16} />
          <span>Download Excel</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-c-card p-4 rounded-xl border border-c-border shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-c-text-secondary/60" size={18} />
          <input
            type="text"
            placeholder="Search payments by bill title, transaction ID, or remarks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-c-border rounded-xl bg-c-bg focus:bg-c-card text-sm font-semibold text-c-text-primary focus:outline-none focus:ring-2 focus:ring-c-accent/20 focus:border-c-accent transition-all"
          />
        </div>
        <div className="relative w-full md:w-48 flex-shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-3 pr-8 py-2 border border-c-border rounded-xl bg-c-bg focus:bg-c-card text-sm font-semibold text-c-text-secondary focus:outline-none focus:ring-2 focus:ring-c-accent/20 focus:border-c-accent transition-all appearance-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="NOT_COMPLETED">Not Completed</option>
          </select>
          <Filter
            className="absolute right-3 top-1/2 -translate-y-1/2 text-c-text-secondary/60 pointer-events-none"
            size={14}
          />
        </div>
      </div>

      {/* History table */}
      <div className="bg-c-card rounded-xl border border-c-border shadow-sm overflow-hidden animate-fade-in">
        {loading ? (
          <div className="p-6">
            <SkeletonLoader type="table" count={5} />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <FileText size={40} className="text-c-text-secondary/40" />
            <p className="text-c-text-secondary text-sm font-semibold">No recorded transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-c-bg/50 border-b border-c-border text-xs font-bold text-c-text-secondary uppercase tracking-wider select-none">
                  <th className="px-6 py-4">Bill Account Title</th>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Date Settle</th>
                  <th className="px-6 py-4 text-right">Amount Paid</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-c-border text-sm">
                {filteredPayments.map((p) => {
                  const isExpanded = expandedPaymentId === p.paymentId;
                  return (
                    <React.Fragment key={p.paymentId}>
                      <tr
                        onClick={() => toggleRow(p.paymentId)}
                        className="hover:bg-c-bg/30 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 font-bold text-c-text-primary">{p.title}</td>
                        <td className="px-6 py-4 font-mono text-xs text-c-text-secondary">
                          {p.paymentId}
                        </td>
                        <td className="px-6 py-4 text-c-text-secondary font-semibold">
                          <div className="flex items-center space-x-1.5">
                            <Calendar size={14} className="text-c-text-secondary/60" />
                            <span>{formatDate(p.paymentDate)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-serif font-medium text-c-text-primary">
                          {formatCurrency(p.amountPaid)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center space-x-1 text-xs font-bold px-3 py-1 rounded-full border ${
                              p.paymentStatus === 'COMPLETED'
                                ? 'bg-c-success-bg text-c-success-text border-c-success-bg/35'
                                : 'bg-c-danger-bg text-c-danger-text border border-c-danger-bg/35'
                            }`}
                          >
                            {p.paymentStatus === 'COMPLETED' ? (
                              <CheckCircle2 size={12} className="flex-shrink-0" />
                            ) : (
                              <XCircle size={12} className="flex-shrink-0" />
                            )}
                            <span className="capitalize">
                              {p.paymentStatus.toLowerCase().replace('_', ' ')}
                            </span>
                          </span>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-c-bg/20">
                          <td colSpan={5} className="px-6 py-4 border-t border-c-border">
                            <div className="text-xs space-y-1.5 text-c-text-secondary font-semibold">
                              <p>
                                <span className="font-bold text-c-text-primary">Remarks: </span>
                                {p.remarks || 'No remarks provided.'}
                              </p>
                              <p>
                                <span className="font-bold text-c-text-primary">Bill ID: </span>
                                <span className="font-mono text-c-text-secondary">{p.billId}</span>
                              </p>
                              <p>
                                <span className="font-bold text-c-text-primary">Transaction Ref: </span>
                                <span className="font-mono text-c-text-secondary">{p.paymentId}</span>
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPayments;
