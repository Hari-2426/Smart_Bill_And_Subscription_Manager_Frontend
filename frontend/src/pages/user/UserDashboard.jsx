import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { billsApi } from '../../api/billsApi';
import { paymentsApi } from '../../api/paymentsApi';
import StatCard from '../../components/StatCard';
import toast from 'react-hot-toast';
import {
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Calendar,
  ChevronRight,
  Plus,
  Receipt,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const COLORS = [
  '#1C3B2E', // forest green
  '#C6461E', // terracotta
  '#8A6B1E', // warm bronze
  '#2E5142', // medium forest
  '#8A8676', // warm gray
  '#4B6E5F', // teal-forest
  '#D26947', // soft terracotta
  '#A89E84', // warm olive
];

// Robust helper to parse dates in string or array formats
const parseDate = (dateVal) => {
  if (!dateVal) return new Date();
  if (Array.isArray(dateVal)) {
    const year = dateVal[0];
    const month = (dateVal[1] || 1) - 1;
    const day = dateVal[2] || 1;
    const hour = dateVal[3] || 0;
    const minute = dateVal[4] || 0;
    const second = dateVal[5] || 0;
    return new Date(year, month, day, hour, minute, second);
  }
  return new Date(dateVal);
};

const UserDashboard = () => {
  const [bills, setBills] = useState([]);
  const [overdueBills, setOverdueBills] = useState([]);
  const [payments, setPayments] = useState([]);

  // Independent loading states
  const [billsLoading, setBillsLoading] = useState(true);
  const [overdueLoading, setOverdueLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  const [billsError, setBillsError] = useState(false);
  const [paymentsError, setPaymentsError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Fetch Bills
    billsApi.getAllBills()
      .then((data) => {
        if (isMounted) {
          setBills(data || []);
          setBillsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Dashboard error loading bills:', err);
        if (isMounted) {
          setBillsError(true);
          setBillsLoading(false);
          toast.error('Failed to load system bills.');
        }
      });

    // Fetch Overdue Bills
    billsApi.getOverdueBills()
      .then((data) => {
        if (isMounted) {
          setOverdueBills(data || []);
          setOverdueLoading(false);
        }
      })
      .catch((err) => {
        console.error('Dashboard error loading overdue bills:', err);
        if (isMounted) {
          setOverdueError(true);
          setOverdueLoading(false);
        }
      });

    // Fetch Payments
    paymentsApi.getPaymentHistory()
      .then((data) => {
        if (isMounted) {
          setPayments(data || []);
          setPaymentsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Dashboard error loading payments history:', err);
        if (isMounted) {
          setPaymentsError(true);
          setPaymentsLoading(false);
          toast.error('Failed to load payment history.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Calculate Metrics
  const totalBills = bills.length;
  const pendingAmount = bills
    .filter((b) => b.status === 'PENDING')
    .reduce((sum, b) => sum + b.amount, 0);
  const overdueCount = overdueBills.length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const paidThisMonth = payments
    .filter((p) => {
      const pDate = parseDate(p.paymentDate);
      return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
    })
    .reduce((sum, p) => sum + p.amountPaid, 0);

  // Group by category for Pie Chart
  const categoryTotals = {};
  bills.forEach((b) => {
    const cat = b.category || 'OTHER';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + b.amount;
  });

  const pieData = Object.keys(categoryTotals).map((cat) => ({
    name: cat.replace('_', ' '),
    value: categoryTotals[cat],
  }));

  // Group by month for Bar Chart (last 6 months)
  const getMonthlyData = () => {
    const monthlyMap = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1); // Set to day 1 to prevent day overflow bugs (e.g., 31st day skipping months)
      d.setMonth(d.getMonth() - i);
      monthlyMap.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        name: d.toLocaleString('en-US', { month: 'short' }),
        amount: 0,
      });
    }

    payments.forEach((p) => {
      const pDate = parseDate(p.paymentDate);
      const pKey = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}`;
      const monthObj = monthlyMap.find((m) => m.key === pKey);
      if (monthObj) {
        monthObj.amount += p.amountPaid;
      }
    });

    return monthlyMap;
  };

  const barData = getMonthlyData();

  // Upcoming bills sorted by date (closer first)
  const upcomingBills = bills
    .filter((b) => b.status === 'PENDING' || b.status === 'OVERDUE')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="px-6 md:px-10 py-8 space-y-8 font-sans text-left">
      {/* Welcome header / Quick action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-medium text-c-text-primary">Financial Overview</h2>
          <p className="text-sm text-c-text-secondary font-medium">
            Monitor subscriptions, bills, and recent payment logs
          </p>
        </div>
        <Link
          to="/app/bills"
          className="inline-flex items-center justify-center space-x-2 bg-c-accent text-c-accent-text hover:bg-c-accent-hover font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md shadow-c-accent/10 duration-200 hover:scale-[1.02]"
        >
          <Plus size={16} />
          <span>Add New Bill</span>
        </Link>
      </div>

      {/* Stats Cards Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={itemVariants}>
          <StatCard title="Total Bills Registered" value={billsLoading ? 0 : totalBills} icon={FileText} color="brand" />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Pending Due Amount"
            value={billsLoading ? 0 : pendingAmount}
            icon={DollarSign}
            isCurrency={true}
            color="warning"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Overdue Accounts"
            value={overdueLoading ? 0 : overdueCount}
            icon={AlertTriangle}
            color="danger"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard
            title="Paid This Month"
            value={paymentsLoading ? 0 : paidThisMonth}
            icon={CheckCircle}
            isCurrency={true}
            color="success"
          />
        </motion.div>
      </motion.div>

      {/* Main Charts & Urgency List Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Graphs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bar Chart - Payments */}
          <div className="bg-c-card p-6 rounded-xl border border-c-border shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-c-border pb-3">
              <h3 className="font-serif font-medium text-c-text-primary text-base">Payment Analytics</h3>
              <div className="flex items-center space-x-1.5 text-xs text-c-accent font-semibold">
                <TrendingUp size={14} />
                <span>Last 6 Months</span>
              </div>
            </div>
            <div className="h-64">
              {paymentsLoading ? (
                /* Pulse Skeleton Loader for Recharts Chart */
                <div className="w-full h-full flex flex-col justify-end space-y-4 animate-pulse">
                  <div className="flex items-end justify-between space-x-2 h-48 px-4">
                    <div className="bg-c-border/40 rounded w-12 h-[20%]"></div>
                    <div className="bg-c-border/40 rounded w-12 h-[45%]"></div>
                    <div className="bg-c-border/40 rounded w-12 h-[30%]"></div>
                    <div className="bg-c-border/40 rounded w-12 h-[60%]"></div>
                    <div className="bg-c-border/40 rounded w-12 h-[15%]"></div>
                    <div className="bg-c-border/40 rounded w-12 h-[80%]"></div>
                  </div>
                  <div className="h-4 bg-c-border/20 rounded w-full"></div>
                </div>
              ) : paymentsError ? (
                <div className="h-full flex flex-col items-center justify-center text-c-danger-text text-sm font-semibold">
                  <span>Failed to load payment history logs.</span>
                </div>
              ) : payments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-c-text-secondary text-sm font-medium">
                  <Receipt size={40} className="text-c-text-secondary/40 mb-2" />
                  <span>No payment history found yet.</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      stroke="var(--color-text-secondary)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="var(--color-text-secondary)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      formatter={(v) => [`$${v.toFixed(2)}`, 'Paid Amount']}
                      contentStyle={{
                        background: 'var(--color-card)',
                        borderRadius: '12px',
                        border: '1px solid var(--color-card-border)',
                        color: 'var(--color-text-primary)',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="amount" fill="var(--color-accent)" radius={[4, 4, 0, 0]} barSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Pie Chart - Categories */}
          <div className="bg-c-card p-6 rounded-xl border border-c-border shadow-sm space-y-4">
            <h3 className="font-serif font-medium text-c-text-primary text-base border-b border-c-border pb-3">
              Bill Category Distributions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="h-56">
                {billsLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-8 border-c-border/40 border-t-transparent animate-spin"></div>
                  </div>
                ) : billsError ? (
                  <div className="h-full flex flex-col items-center justify-center text-c-danger-text text-sm font-semibold">
                    <span>Failed to load category logs.</span>
                  </div>
                ) : bills.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-c-text-secondary text-sm font-medium">
                    <FileText size={40} className="text-c-text-secondary/40 mb-2" />
                    <span>No bill categories to distribute.</span>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v) => [`$${v.toFixed(2)}`, 'Total Amount']}
                        contentStyle={{
                          background: 'var(--color-card)',
                          borderRadius: '12px',
                          border: '1px solid var(--color-card-border)',
                          color: 'var(--color-text-primary)',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              {/* Pie Legends List */}
              <div className="max-h-48 overflow-y-auto space-y-2.5 pr-2">
                {billsLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-c-border/30 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-c-border/30 rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-c-border/30 rounded w-2/3 animate-pulse"></div>
                  </div>
                ) : (
                  pieData.map((data, index) => (
                    <div key={data.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-semibold text-c-text-secondary capitalize">
                          {data.name.toLowerCase()}
                        </span>
                      </div>
                      <span className="font-bold text-c-text-primary">{formatCurrency(data.value)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Urgency / Upcoming Bills */}
        <div className="bg-c-card p-6 rounded-xl border border-c-border shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between border-b border-c-border pb-3 mb-4">
            <h3 className="font-serif font-medium text-c-text-primary text-base">Action Required</h3>
            <Link
              to="/app/bills"
              className="text-xs font-semibold text-c-accent hover:text-c-accent-hover flex items-center"
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto">
            {billsLoading || overdueLoading ? (
              <div className="space-y-3">
                <div className="h-16 bg-c-border/20 rounded-xl animate-pulse"></div>
                <div className="h-16 bg-c-border/20 rounded-xl animate-pulse"></div>
                <div className="h-16 bg-c-border/20 rounded-xl animate-pulse"></div>
              </div>
            ) : upcomingBills.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-c-text-secondary text-sm font-medium">
                <CheckCircle size={40} className="text-c-success-text/40 mb-2" />
                <span>All clear! No pending bills.</span>
              </div>
            ) : (
              upcomingBills.map((bill) => (
                <div
                  key={bill.billId}
                  className="p-4 rounded-xl border border-c-border/40 bg-c-bg/30 hover:bg-c-bg/60 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0 text-left">
                    <h4 className="font-bold text-c-text-primary text-sm truncate">{bill.title}</h4>
                    <div className="flex items-center space-x-2 text-xs text-c-text-secondary font-medium">
                      <span className="capitalize">{bill.category.toLowerCase()}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Calendar size={12} />
                        <span>Due {formatDate(bill.dueDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 space-y-1.5">
                    <p className="font-bold text-c-text-primary text-sm">
                      {formatCurrency(bill.amount)}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        bill.status === 'OVERDUE'
                          ? 'bg-c-danger-bg text-c-danger-text border border-c-danger-bg/20 pulse-overdue'
                          : 'bg-c-warning-bg text-c-warning-text border border-c-warning-bg/20'
                      }`}
                    >
                      {bill.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
