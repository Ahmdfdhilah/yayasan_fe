// src/utils/api.ts
import axios, { AxiosInstance } from 'axios';
import { clearAuth, refreshTokenAsync } from '@/redux/features/authSlice';
import { store } from '@/redux/store';
import { API_BASE_URL } from '@/config/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Configure interceptors for both API instances
const configureInterceptors = (api: AxiosInstance) => {
  // Request interceptor - Add auth token to requests
  api.interceptors.request.use(
    (config) => {
      const state = store.getState();
      const token = state.auth?.accessToken;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

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
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        const state = store.getState();
        const refreshToken = state.auth?.refreshToken;
        
        // Don't try to refresh if the original request was already a refresh request
        if (refreshToken && !originalRequest.url?.includes('/refresh')) {
          try {
            // Try to refresh the token
            await store.dispatch(refreshTokenAsync(refreshToken)).unwrap();
            
            // Get the new access token
            const newState = store.getState();
            const newAccessToken = newState.auth?.accessToken;
            
            if (newAccessToken) {
              // Update the original request with new token
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              
              // Retry the original request
              return api.request(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            store.dispatch(clearAuth());
          }
        } else {
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