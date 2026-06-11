import api from './api';

export const getMetrics = async () => {
  const response = await api.get('/reports/metrics');
  return response.data;
};
