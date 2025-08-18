// src/utils/api.ts
import axios, { AxiosInstance } from 'axios';
import { clearAuth, refreshTokenAsync } from '@/redux/features/authSlice';
import { store } from '@/redux/store';
import { API_BASE_URL } from '@/config/api';

// Create axios instance with cookie support
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important: enables cookies to be sent with requests
});

// Configure interceptors for cookie-based authentication
const configureInterceptors = (api: AxiosInstance) => {
  // Request interceptor - cookies will be sent automatically with withCredentials: true
  // No need to manually add Authorization headers
  api.interceptors.request.use(
    (config) => {
      // Just pass through - cookies handle authentication
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - Handle 401 responses and automatic token refresh
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If error is 401 and we haven't already tried to refresh
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        
        // Don't try to refresh if the original request was already a refresh request or /me request
        if (!originalRequest.url?.includes('/refresh') && !originalRequest.url?.includes('/me')) {
          try {
            // Try to refresh the token using cookie-based refresh
            await store.dispatch(refreshTokenAsync()).unwrap();
            
            // Retry the original request (cookies will be sent automatically)
            return api.request(originalRequest);
          } catch (refreshError) {
            console.error('Cookie-based token refresh failed:', refreshError);
            store.dispatch(clearAuth());
          }
        } else {
          // Don't refresh for /me or /refresh endpoints, just clear auth
          console.log('Auth failed for critical endpoint, clearing auth');
          store.dispatch(clearAuth());
        }
      }

      return Promise.reject(error);
    }
  );
};

// Apply interceptors to both API instances
configureInterceptors(api);

export default api;