import axios from 'axios';
import { apiCache } from './performance';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and caching
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add cache key for GET requests
    if (config.method === 'get') {
      const cacheKey = `${config.url}?${JSON.stringify(config.params || {})}`;
      const cachedData = apiCache.get(cacheKey);
      if (cachedData) {
        return Promise.reject({ cached: true, data: cachedData });
      }
      config.cacheKey = cacheKey;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and caching
api.interceptors.response.use(
  (response) => {
    // Cache GET responses
    if (response.config.method === 'get' && response.config.cacheKey) {
      apiCache.set(response.config.cacheKey, response.data);
    }
    return response;
  },
  (error) => {
    // Handle cached responses
    if (error.cached) {
      return Promise.resolve({ data: error.data });
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Performance monitoring wrapper
const originalGet = api.get;
api.get = async (...args) => {
  const start = performance.now();
  try {
    const result = await originalGet.apply(api, args);
    const end = performance.now();
    if (end - start > 1000) {
      console.warn(`Slow API call: ${args[0]} took ${end - start}ms`);
    }
    return result;
  } catch (error) {
    const end = performance.now();
    console.error(`API call failed: ${args[0]} took ${end - start}ms`, error);
    throw error;
  }
};

export default api;