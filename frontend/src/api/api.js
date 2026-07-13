import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const url = config.url || '';

    // Exclude public authentication endpoints from token attachment
    const isPublicAuth =
      url.includes('/users/auth/register') ||
      url.includes('/users/auth/login') ||
      url.includes('/admins/login');

    if (token && !isPublicAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry (401/403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const url = error.config?.url || '';
      
      // We check if it is a specific request that can throw a 403 but shouldn't trigger global logout
      const isActionRequest =
        url.includes('/bills/allBills') ||
        url.includes('/admins/admin/activate/') ||
        url.includes('/admins/admin/deactivate/') ||
        url.includes('/admins/users/activate/') ||
        url.includes('/admins/users/deactivate/') ||
        url.includes('/admins/dashboard/timeline') ||
        url.includes('/admins/getAllAdmins');

      if (status === 401 || (status === 403 && !isActionRequest)) {
        // Prevent infinite redirect loop if already on login pages
        const currentPath = window.location.pathname;
        if (
          currentPath === '/login' ||
          currentPath === '/admin/login' ||
          currentPath === '/register'
        ) {
          return Promise.reject(error);
        }

        // Clear token and user details
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');

        // Persist the failure context across the page reload (satisfies JWT timeout requirement)
        sessionStorage.setItem(
          'auth_failure_reason',
          'Session expired, please log in again'
        );

        // Redirect based on current section
        if (currentPath.startsWith('/admin')) {
          window.location.href = '/admin/login';
        } else {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
