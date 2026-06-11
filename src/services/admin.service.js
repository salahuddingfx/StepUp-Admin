import api from './api';

export const getStats = async () => {
  return await api.get('/dashboard/stats');
};

export const getUsers = async () => {
  return await api.get('/users');
};

export const toggleUserStatus = async (id) => {
  return await api.patch(`/users/${id}/toggle-status`);
};

export const getTeachers = async () => {
  return await api.get('/teachers');
};

export const updateTeacherStatus = async (id, approvalStatus) => {
  return await api.patch(`/teachers/${id}/status`, { approvalStatus });
};

export const getCourses = async () => {
  return await api.get('/courses');
};

export const createCourse = async (courseData) => {
  return await api.post('/courses', courseData);
};

export const updateCourse = async (id, courseData) => {
  return await api.put(`/courses/${id}`, courseData);
};

export const togglePublishCourse = async (id) => {
  return await api.patch(`/courses/${id}/publish`);
};

export const deleteCourse = async (id) => {
  return await api.delete(`/courses/${id}`);
};

export const getTransactions = async () => {
  return await api.get('/payments/transactions');
};

export const getPayments = async () => {
  return await api.get('/payments/history');
};
