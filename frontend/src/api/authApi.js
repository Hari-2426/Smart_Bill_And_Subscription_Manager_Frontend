import api from './api';

export const authApi = {
  register: async (data) => {
    const response = await api.post('/users/auth/register', data);
    return response.data;
  },
  login: async (data) => {
    const response = await api.post('/users/auth/login', data);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/users/auth/profile');
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.patch('/users/auth/updateProfile', data);
    return response.data;
  },
  updatePassword: async (data) => {
    const response = await api.put('/users/auth/updatePassword', data);
    return response.data;
  },
  deleteAccount: async () => {
    const response = await api.delete('/users/auth/delete');
    return response.data;
  },
};
