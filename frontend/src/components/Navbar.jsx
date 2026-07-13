import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Toggle from './Toggle';

const Navbar = ({ setMobileOpen }) => {
  const { user, role } = useAuth();
  const location = useLocation();

  const [isDark, setIsDark] = useState(
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/bills/overdue')) return 'Overdue Bills';
    if (path.includes('/bills')) return 'My Bills';
    if (path.includes('/payments')) return 'Payments History';
    if (path.includes('/profile')) return 'Account Profile';
    if (path.includes('/users')) return 'Manage Users';
    if (path.includes('/admins')) return 'Manage Admins';
    return 'SmartBill';
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const first = user.firstName ? user.firstName[0] : '';
    const last = user.lastName ? user.lastName[0] : '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <header className="sticky top-0 bg-c-sidebar-bg border-b border-c-sidebar-border z-10 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 rounded-xl border border-c-sidebar-border text-c-sidebar-text hover:bg-c-sidebar-active hover:text-c-sidebar-text-active transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl md:text-2xl font-serif font-medium text-c-sidebar-text-active tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center space-x-6">
        {/* Dark Mode Switcher (only visible in user / public views since admin is command center dark) */}
        {!location.pathname.startsWith('/admin') && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-c-sidebar-text hidden sm:inline-block">
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
            <Toggle checked={isDark} onChange={setIsDark} ariaLabel="Toggle theme" />
          </div>
        )}

        {role !== 'USER' && (
          <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-c-accent/15 text-c-accent border border-c-accent/30">
            {role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
          </span>
        )}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-c-sidebar-text-active">
              {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
            </p>
            <p className="text-xs text-c-sidebar-text">{user?.email}</p>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border select-none ${
            role === 'USER'
              ? 'bg-c-success-bg text-c-success-text border-c-sidebar-border'
              : 'bg-[#232F47] text-[#C9A24B] border-[#232F47]'
          }`}>
            {getUserInitials()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
