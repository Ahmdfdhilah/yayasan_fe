// apps/vite-react-app/src/components/Auth/AuthProvider.tsx
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { persistor } from '@/redux/store';
import {
  loginAsync,
  logoutAsync,
  refreshTokenAsync,
  changePasswordAsync,
  getCurrentUserAsync,
  clearAuth,
  clearPersistAndAuth,
  clearError
} from '@/redux/features/authSlice';
import type { User } from '@/services/users/types';

interface LoginData {
  email: string;
  password: string;
}

interface PasswordChangeData {
  current_password: string;
  new_password: string;
}

interface AuthContextType {
  // State
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;

  // Actions
  login: (loginData: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  changeUserPassword: (passwordData: PasswordChangeData) => Promise<void>;
  clearAuthError: () => void;
  clearPersistentAuth: () => Promise<void>;

  // Token management
  isTokenValid: () => boolean;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth?.isAuthenticated ?? false);
  const user = useAppSelector((state) => state.auth?.user ?? null);
  const loading = useAppSelector((state) => state.auth?.isLoading ?? false);
  const error = useAppSelector((state) => state.auth?.error ?? null);
  const accessToken = useAppSelector((state) => state.auth?.accessToken ?? null);
  const refreshToken = useAppSelector((state) => state.auth?.refreshToken ?? null);
  const tokenExpiry = useAppSelector((state) => state.auth?.tokenExpiry ?? null);

  const login = async (loginData: LoginData): Promise<void> => {
    try {
      await dispatch(loginAsync(loginData)).unwrap();
    } catch (error: any) {
      // Error is already handled in the slice
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await dispatch(logoutAsync()).unwrap();
    } catch (error) {
      console.error('Logout error:', error);
      // Force clear auth even if logout request fails
      dispatch(clearAuth());
    }
  };

  const checkAuth = async (): Promise<void> => {
    if (!accessToken) {
      return;
    }

    try {
      // Check if token is expired
      if (tokenExpiry && tokenExpiry < Date.now()) {
        // Token is expired, try to refresh
        if (refreshToken) {
          try {
            await dispatch(refreshTokenAsync(refreshToken)).unwrap();
            // After successful refresh, try to get current user
            if (!user) {
              await dispatch(getCurrentUserAsync()).unwrap();
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Both tokens are invalid, clear persistent storage
            await clearPersistentAuth();
          }
        } else {
          // No refresh token, clear persistent storage
          await clearPersistentAuth();
        }
        return;
      }

      // Fetch user data if not available
      if (!user) {
        try {
          await dispatch(getCurrentUserAsync()).unwrap();
        } catch (getCurrentUserError: any) {
          console.error('Get current user failed:', getCurrentUserError);
          // If getting user fails with token-related error, clear persistent storage
          const errorMsg = getCurrentUserError?.message || '';
          if (errorMsg.includes('401') || errorMsg.includes('403') || 
              errorMsg.includes('Unauthorized') || errorMsg.includes('Forbidden') ||
              errorMsg.includes('Invalid token') || errorMsg.includes('Token expired')) {
            await clearPersistentAuth();
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await clearPersistentAuth();
    }
  };

  const changeUserPassword = async (passwordData: PasswordChangeData): Promise<void> => {
    try {
      await dispatch(changePasswordAsync(passwordData)).unwrap();
    } catch (error) {
      throw error;
    }
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  const clearPersistentAuth = async (): Promise<void> => {
    try {
      // Clear Redux state
      dispatch(clearPersistAndAuth());
      // Clear persistent storage
      await persistor.purge();
      // Clear localStorage items that might contain auth data
      localStorage.removeItem('rememberMe');
      console.log('Persistent auth data cleared due to invalid tokens');
    } catch (error) {
      console.error('Error clearing persistent auth:', error);
      // Fallback to just clearing Redux state
      dispatch(clearAuth());
    }
  };

  const isTokenValid = (): boolean => {
    if (!accessToken || !tokenExpiry) {
      return false;
    }

    // Check if token expires in the next 5 minutes
    const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
    return tokenExpiry > fiveMinutesFromNow;
  };

  const getAccessToken = (): string | null => {
    return accessToken;
  };

  // Check auth on mount and when authentication state changes
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      checkAuth();
    }
  }, []); // Only run on mount

  // Auto-refresh token before expiration
  useEffect(() => {
    if (accessToken && tokenExpiry) {
      const timeUntilExpiry = tokenExpiry - Date.now();
      // Refresh 5 minutes before expiry, but not if less than 1 minute remaining
      const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0);

      if (refreshTime > 60 * 1000) { // Only set timer if more than 1 minute
        const timer = setTimeout(() => {
          if (isAuthenticated) {
            checkAuth();
          }
        }, refreshTime);

        return () => clearTimeout(timer);
      }
    }
  }, [accessToken, refreshToken, tokenExpiry, isAuthenticated, dispatch]);

  // Periodic token validation (every 10 minutes)
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      const interval = setInterval(() => {
        if (!isTokenValid()) {
          checkAuth();
        }
      }, 10 * 60 * 1000); // Check every 10 minutes

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, accessToken]);

  const value: AuthContextType = {
    // State
    isAuthenticated,
    user,
    loading,
    error,

    // Actions
    login,
    logout,
    checkAuth,
    changeUserPassword,
    clearAuthError,
    clearPersistentAuth,

    // Token management
    isTokenValid,
    getAccessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};