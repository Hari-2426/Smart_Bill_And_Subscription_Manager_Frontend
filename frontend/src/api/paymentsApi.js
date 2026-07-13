import api from './api';

export const paymentsApi = {
  payBill: async (data) => {
    const response = await api.post('/payments/paybill', data);
    return response.data;
  },
  getPaymentHistory: async () => {
    const response = await api.get('/payments/history');
    return response.data;
  },
  getPaymentsForBill: async (billId) => {
    const response = await api.get(`/payments/bill/${billId}`);
    return response.data;
  },
  getPaymentDetails: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  },
  getPaymentsByStatus: async (status) => {
    const response = await api.get(`/payments/status/${status}`);
    return response.data;
  },
};
