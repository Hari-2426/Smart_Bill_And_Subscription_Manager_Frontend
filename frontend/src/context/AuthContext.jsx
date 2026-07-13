import React, { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../api/authApi';
import { adminApi } from '../api/adminApi';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [loading, setLoading] = useState(true);

  // Sync auth state and load full details if token is found on mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (token && role) {
        try {
          if (role === 'USER') {
            const profile = await authApi.getProfile();
            setUser(profile);
          } else {
            // Admin or Super Admin
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              const parsedUser = JSON.parse(storedUser);
              setUser(parsedUser);
            }
          }
        } catch (error) {
          console.error('Failed to initialize auth profile:', error);
          // Token is invalid/expired
          logoutSilent();
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, [token, role]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      setToken(data.token);
      setRole(data.role);
      setUser(data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success(data.message || 'Login successful!');
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      toast.error(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (email, password) => {
    setLoading(true);
    try {
      const data = await adminApi.adminLogin({ email, password });
      setToken(data.token);
      setRole(data.role);
      setUser(data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success(data.message || 'Admin login successful!');
      return data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Admin login failed';
      toast.error(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    toast.success('Logged out successfully.');
  };

  const logoutSilent = () => {
    setToken(null);
    setRole(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
  };

  const refreshProfile = async () => {
    if (role === 'USER') {
      try {
        const profile = await authApi.getProfile();
        setUser(profile);
        localStorage.setItem('user', JSON.stringify(profile));
      } catch (error) {
        console.error('Failed to refresh user profile:', error);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        loading,
        login,
        adminLogin,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
