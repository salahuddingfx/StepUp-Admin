import axiosInstance from 'axios';

const api = axiosInstance.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response Interceptor: Handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Silent refresh: cookies automatically sent and set by browser
        const res = await axiosInstance.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        if (res.data && res.data.success) {
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    const message = error.response?.data?.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
