import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5055',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add common headers or auth tokens here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const searchByIP = async (ip) => {
  try {
    const response = await api.post('/perform_ip_search', { ip });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to search IP');
  }
};

export const searchByFilters = async (filters) => {
  try {
    const response = await api.post('/perform_filter_search', filters);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to perform filter search');
  }
};

export default api;