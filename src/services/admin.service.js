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

export const getCourseById = async (id) => {
  return await api.get(`/courses/${id}`);
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

// Curriculum Management
export const createModule = async (moduleData) => {
  return await api.post('/lessons/module', moduleData);
};

export const updateModule = async (id, moduleData) => {
  return await api.put(`/lessons/module/${id}`, moduleData);
};

export const deleteModule = async (id) => {
  return await api.delete(`/lessons/module/${id}`);
};

export const createLesson = async (lessonData) => {
  return await api.post('/lessons', lessonData);
};

export const deleteLesson = async (id) => {
  return await api.delete(`/lessons/${id}`);
};

export const getTransactions = async () => {
  return await api.get('/payments/transactions');
};

export const getPayments = async () => {
  return await api.get('/payments/history');
};

export const updatePaymentStatus = async (id, status) => {
  return await api.put(`/payments/${id}/status`, { status });
};

export const deletePayment = async (id) => {
  return await api.delete(`/payments/${id}`);
};

export const updateUserRole = async (id, role) => {
  return await api.patch(`/users/${id}/role`, { role });
};

export const deleteUser = async (id) => {
  return await api.delete(`/users/${id}`);
};

export const getSettings = async () => {
  return await api.get('/settings');
};

export const updateSettings = async (settingsData) => {
  return await api.put('/settings', settingsData);
};

export const createQuiz = async (quizData) => {
  return await api.post('/quizzes', quizData);
};

export const deleteQuiz = async (id) => {
  return await api.delete(`/quizzes/${id}`);
};

export const createAssignment = async (assignmentData) => {
  return await api.post('/assignments', assignmentData);
};

export const deleteAssignment = async (id) => {
  return await api.delete(`/assignments/${id}`);
};

export const updateLesson = async (id, lessonData) => {
  return await api.put(`/lessons/${id}`, lessonData);
};

export const getQuizzes = async () => {
  return await api.get('/quizzes');
};

export const getAssignments = async () => {
  return await api.get('/assignments');
};

export const getLessons = async () => {
  return await api.get('/lessons');
};

export const getCoupons = async () => {
  return await api.get('/coupons');
};

export const createCoupon = async (data) => {
  return await api.post('/coupons', data);
};

export const updateCoupon = async (id, data) => {
  return await api.put(`/coupons/${id}`, data);
};

export const deleteCoupon = async (id) => {
  return await api.delete(`/coupons/${id}`);
};

export const getCertificates = async () => {
  return await api.get('/certificates');
};

export const issueCertificate = async (studentId, courseId) => {
  return await api.post('/certificates/issue', { studentId, courseId });
};

export const deleteCertificate = async (id) => {
  return await api.delete(`/certificates/${id}`);
};
