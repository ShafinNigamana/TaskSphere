import api from './api';

export const getComments = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}/comments`);
  return response.data;
};

export const createComment = async (taskId, content) => {
  const response = await api.post(`/tasks/${taskId}/comments`, { content });
  return response.data;
};
