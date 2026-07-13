import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { billsApi } from '../api/billsApi';
import {
  LayoutDashboard,
  Receipt,
  AlertTriangle,
  CreditCard,
  User,
  Users,
  ShieldAlert,
  LogOut,
  X,
  TrendingUp,
} from 'lucide-react';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { role, logout } = useAuth();
  const [hasOverdue, setHasOverdue] = useState(false);

  useEffect(() => {
    if (role === 'USER') {
      const checkOverdue = async () => {
        try {
          const data = await billsApi.getOverdueBills();
          setHasOverdue(data && data.length > 0);
        } catch (err) {
          console.error('Error checking overdue status in sidebar:', err);
        }
      };
      checkOverdue();
    }
  }, [role]);

  const userNavigation = [
    { name: 'Dashboard', to: '/app/dashboard', icon: LayoutDashboard },
    { name: 'My Bills', to: '/app/bills', icon: Receipt },
    { name: 'Overdue Bills', to: '/app/bills/overdue', icon: AlertTriangle, badge: 'pulse' },
    { name: 'Payments', to: '/app/payments', icon: CreditCard },
    { name: 'Profile', to: '/app/profile', icon: User },
  ];

  const adminNavigation = [
    { name: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Users', to: '/admin/users', icon: Users },
  ];

  if (role === 'SUPER_ADMIN') {
    adminNavigation.push({ name: 'Manage Admins', to: '/admin/admins', icon: ShieldAlert });
    adminNavigation.push({ name: 'Timeline', to: '/admin/timeline', icon: TrendingUp });
  }

  const navigation = role === 'USER' ? userNavigation : adminNavigation;

  const linkClass = ({ isActive }) =>
    `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium ${
      isActive
        ? 'bg-c-sidebar-active text-c-sidebar-text-active border border-c-sidebar-border/30 shadow-sm'
        : 'text-c-sidebar-text hover:bg-c-sidebar-active hover:text-c-sidebar-text-active'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-c-sidebar-bg border-r border-c-sidebar-border">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-c-sidebar-border">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-c-sidebar-text-active text-c-sidebar-bg flex items-center justify-center font-bold text-lg shadow-sm">
            S
          </div>
          <span className="font-serif font-medium text-lg text-c-sidebar-text-active tracking-tight">
            {role === 'USER' ? 'SmartBill' : 'Command Center'}
          </span>
        </div>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-c-sidebar-text hover:bg-c-sidebar-active hover:text-c-sidebar-text-active"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            onClick={() => mobileOpen && setMobileOpen(false)}
            className={linkClass}
          >
            <item.icon size={20} className="flex-shrink-0" />
            <span className="flex-1">{item.name}</span>
            {item.badge === 'pulse' && role === 'USER' && hasOverdue && (
              <span className="w-2 h-2 rounded-full bg-c-danger pulse-overdue" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-c-sidebar-border">
        <button
          onClick={logout}
          className="flex w-full items-center space-x-3 px-4 py-3 rounded-xl text-c-danger hover:bg-c-danger/10 font-semibold text-sm transition-colors duration-200"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed inset-y-0 left-0 w-64 h-full z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-[#0B1220]/40 backdrop-blur-sm z-30 transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer Panel */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 w-64 h-full z-40 bg-c-sidebar-bg shadow-2xl transition-transform duration-300 transform ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
