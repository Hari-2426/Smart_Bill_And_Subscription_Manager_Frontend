import api from './api';

export const billsApi = {
  registerBill: async (data) => {
    const response = await api.post('/bills/registerBill', data);
    return response.data;
  },
  updateBill: async (billId, data) => {
    const response = await api.patch(`/bills/updateBill/${billId}`, data);
    return response.data;
  },
  deleteBill: async (billId) => {
    const response = await api.delete(`/bills/deleteBill/${billId}`);
    return response.data;
  },
  getOverdueBills: async () => {
    const response = await api.get('/bills/overdue');
    return response.data;
  },
  getAllBills: async () => {
    const response = await api.get('/bills/allBills');
    return response.data;
  },
  getBillById: async (billId) => {
    const response = await api.get(`/bills/billId/${billId}`);
    return response.data;
  },
  getBillsByCategory: async (category) => {
    const response = await api.get(`/bills/category/${category}`);
    return response.data;
  },
  getBillsByStatus: async (status) => {
    const response = await api.get(`/bills/billStatus/${status}`);
    return response.data;
  },
};
