import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { billsApi } from '../../api/billsApi';
import StatCard from '../../components/StatCard';
import { SkeletonLoader } from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';
import { Users, FileText, CheckCircle, ShieldAlert, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const FETCH_BILLS_FOR_ADMIN = false; // Toggle to true if the backend updates Spring Security to allow admins on /bills/**

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [bills, setBills] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState(null);
  
  const { role } = useAuth();
  const isSuperAdmin = role === 'SUPER_ADMIN';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setErrorDetails(null);
        const usersData = await adminApi.getAllUsers().catch((err) => {
          console.error('Failed to load admin users:', err);
          return [];
        });
        setUsers(usersData || []);

        if (isSuperAdmin) {
          try {
            const adminsData = await adminApi.getAllAdmins();
            setAdmins(adminsData || []);
          } catch (err) {
            console.error('Failed to load system admins:', err);
            setErrorDetails(err.response?.data?.message || err.message || 'Unknown API Error');
            setAdmins([]);
          }
        }

        if (FETCH_BILLS_FOR_ADMIN) {
          const billsData = await billsApi.getAllBills().catch((err) => {
            console.error('Failed to load system bills:', err);
            return [];
          });
          setBills(billsData || []);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [role, isSuperAdmin]);

  if (loading) {
    return (
      <div className="px-6 md:px-10 py-8 space-y-8">
        <SkeletonLoader type="cards" count={4} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonLoader type="table" count={3} />
          <SkeletonLoader type="table" count={3} />
        </div>
      </div>
    );
  }

  // Calculate metrics
  const activeCount = users.filter((u) => u.accountStatus === 'ACTIVE').length;
  const inactiveCount = users.filter((u) => u.accountStatus === 'INACTIVE').length;
  const blockedCount = users.filter((u) => u.accountStatus === 'BLOCKED').length;

  const paidCount = bills.filter((b) => b.status === 'PAID').length;
  const pendingCount = bills.filter((b) => b.status === 'PENDING').length;
  const overdueCount = bills.filter((b) => b.status === 'OVERDUE').length;

  const getAdminStatus = (a) => {
    if (a.accountStatus) return a.accountStatus.toUpperCase().trim();
    if (a.status) return a.status.toUpperCase().trim();
    if (a.adminStatus) return a.adminStatus.toUpperCase().trim();
    if (typeof a.enabled === 'boolean') return a.enabled ? 'ACTIVE' : 'INACTIVE';
    if (typeof a.active === 'boolean') return a.active ? 'ACTIVE' : 'INACTIVE';
    return 'ACTIVE';
  };

  const activeAdminsCount = admins.filter((a) => getAdminStatus(a) === 'ACTIVE').length;
  const inactiveAdminsCount = admins.filter((a) => getAdminStatus(a) === 'INACTIVE').length;
  const blockedAdminsCount = admins.filter((a) => getAdminStatus(a) === 'BLOCKED').length;

  const userStatusData = [
    { name: 'Active', value: activeCount },
    { name: 'Inactive', value: inactiveCount },
    { name: 'Blocked', value: blockedCount },
  ].filter((d) => d.value > 0);

  const billStatusData = [
    { name: 'Paid', value: paidCount },
    { name: 'Pending', value: pendingCount },
    { name: 'Overdue', value: overdueCount },
  ].filter((d) => d.value > 0);

  const adminStatusData = [
    { name: 'Active', value: activeAdminsCount },
    { name: 'Inactive', value: inactiveAdminsCount },
    { name: 'Blocked', value: blockedAdminsCount },
  ].filter((d) => d.value > 0);

  return (
    <div className="px-6 md:px-10 py-8 space-y-8 font-sans text-left">
      <div>
        <h2 className="text-2xl md:text-3xl font-serif font-medium text-c-text-primary">System Administration Dashboard</h2>
        <p className="text-sm text-c-text-secondary font-medium">
          System-wide summary metrics, user accounts distribution, and administrative statistics
        </p>
      </div>

      {/* Admin stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total System Users" value={users.length} icon={Users} color="brand" />
        <StatCard
          title="Active System Accounts"
          value={activeCount}
          icon={CheckCircle}
          color="success"
        />
        {isSuperAdmin ? (
          <>
            <StatCard title="Total Admins" value={admins.length} icon={Users} color="brand" />
            <StatCard
              title="Deactivated Accounts"
              value={inactiveCount}
              icon={AlertTriangle}
              color="warning"
            />
          </>
        ) : (
          <>
            <StatCard title="Blocked Accounts" value={blockedCount} icon={ShieldAlert} color="danger" />
            <StatCard
              title="Systemic Bills Logged"
              value={FETCH_BILLS_FOR_ADMIN ? bills.length : 0}
              icon={FileText}
              color="brand"
            />
          </>
        )}
      </div>

      {/* Analytics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Account Distributions */}
        <div className="bg-c-card p-6 rounded-xl border border-c-border space-y-4">
          <h3 className="font-serif font-medium text-c-text-primary text-base border-b border-c-border pb-3">
            User Account Statuses
          </h3>
          <div className="h-64 flex flex-col justify-center">
            {userStatusData.length === 0 ? (
              <div className="text-center text-sm text-c-text-secondary font-semibold">
                No accounts active.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {userStatusData.map((entry, index) => {
                      let color = '#7E8AA6';
                      if (entry.name === 'Active') color = '#5DBE8F';
                      if (entry.name === 'Inactive') color = '#7E8AA6';
                      if (entry.name === 'Blocked') color = '#E0645E';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-card)',
                      borderRadius: '12px',
                      border: '1px solid var(--color-card-border)',
                      color: 'var(--color-text-primary)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right Card: Pie Chart for Admin Account Statuses (Super Admin only) OR Bill Status Distributions */}
        <div className="bg-c-card p-6 rounded-xl border border-c-border space-y-4">
          <h3 className="font-serif font-medium text-c-text-primary text-base border-b border-c-border pb-3">
            {isSuperAdmin ? 'Admin Account Statuses' : 'System Bills Statuses'}
          </h3>
          <div className="h-64 flex flex-col justify-center">
            {isSuperAdmin ? (
              errorDetails ? (
                <div className="text-center space-y-2 px-4">
                  <p className="text-sm font-semibold text-c-danger-text">Failed to fetch admin accounts</p>
                  <pre className="text-[10px] font-mono text-c-text-secondary overflow-x-auto bg-c-bg p-2.5 rounded-lg border border-c-border max-w-full">
                    {errorDetails}
                  </pre>
                </div>
              ) : adminStatusData.length === 0 ? (
                <div className="text-center text-sm text-c-text-secondary font-semibold space-y-1">
                  <p>No administrators active in chart.</p>
                  <p className="text-[10px] text-c-text-secondary/40 font-mono">
                    Loaded array length: {admins.length}
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={adminStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {adminStatusData.map((entry, index) => {
                        let color = '#7E8AA6';
                        if (entry.name === 'Active') color = '#5DBE8F';
                        if (entry.name === 'Inactive') color = '#7E8AA6';
                        if (entry.name === 'Blocked') color = '#E0645E';
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'var(--color-card)',
                        borderRadius: '12px',
                        border: '1px solid var(--color-card-border)',
                        color: 'var(--color-text-primary)',
                        fontSize: '12px',
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              )
            ) : !FETCH_BILLS_FOR_ADMIN ? (
              <div className="text-center text-xs text-c-text-secondary font-semibold px-6 leading-relaxed">
                Billing analytics disabled. (Requires Spring Security configurations to allow ADMIN role access on user endpoints).
              </div>
            ) : billStatusData.length === 0 ? (
              <div className="text-center text-sm text-c-text-secondary font-semibold">
                No registered bills.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={billStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {billStatusData.map((entry, index) => {
                      let color = '#7E8AA6';
                      if (entry.name === 'Paid') color = '#5DBE8F';
                      if (entry.name === 'Pending') color = '#C9A24B';
                      if (entry.name === 'Overdue') color = '#E0645E';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-card)',
                      borderRadius: '12px',
                      border: '1px solid var(--color-card-border)',
                      color: 'var(--color-text-primary)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
