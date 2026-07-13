import api from './api';

export const adminApi = {
  adminLogin: async (data) => {
    const response = await api.post('/admins/login', data);
    return response.data;
  },
  registerAdmin: async (data) => {
    const response = await api.post('/admins/register', data);
    return response.data;
  },
  getAllUsers: async () => {
    const response = await api.get('/admins/users');
    return response.data;
  },
  getUserDetails: async (userId) => {
    const response = await api.get(`/admins/users/${userId}`);
    return response.data;
  },
  activateUser: async (userId) => {
    const response = await api.patch(`/admins/users/activate/${userId}`);
    return response.data;
  },
  deactivateUser: async (userId) => {
    const response = await api.patch(`/admins/users/deactivate/${userId}`);
    return response.data;
  },
  getAllAdmins: async () => {
    const response = await api.get('/admins/getAllAdmins');
    return response.data;
  },
  getAdminById: async (adminId) => {
    const response = await api.get(`/admins/${adminId}`);
    return response.data;
  },
  deactivateAdmin: async (adminId) => {
    const response = await api.patch(`/admins/admin/deactivate/${adminId}`);
    return response.data;
  },
  activateAdmin: async (adminId) => {
    const response = await api.patch(`/admins/admin/activate/${adminId}`);
    return response.data;
  },
  getTimelineData: async () => {
    const response = await api.get('/admins/dashboard/timeline');
    return response.data;
  },
};
