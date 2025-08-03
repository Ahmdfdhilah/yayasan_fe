// apps/vite-react-app/src/components/Auth/AuthProvider.tsx
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { persistor } from '@/redux/store';
import {
  loginAsync,
  logoutAsync,
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
    try {
      // Try to get current user using cookies
      // This will succeed if valid authentication cookies exist
      if (!user) {
        await dispatch(getCurrentUserAsync()).unwrap();
      }
    } catch (error: any) {
      // Clear any stale Redux state
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
    } catch (error) {
      console.error('Error clearing persistent auth:', error);
      // Fallback to just clearing Redux state
      dispatch(clearAuth());
    }
  };

  const isTokenValid = (): boolean => {
    // With cookie-based auth, we check if user exists
    // Actual token validation happens server-side
    return isAuthenticated && !!user;
  };

  const getAccessToken = (): string | null => {
    // Tokens are stored in HttpOnly cookies, not accessible to JavaScript
    // Return null to indicate tokens are handled by cookies
    return null;
  };

  // Check auth on mount - this will work with both cookies and stored tokens
  useEffect(() => {
    checkAuth();
  }, []); // Only run on mount

  // Auto-refresh token before expiration (handled by server-side cookie expiry)
  // No need for client-side token refresh timing with HttpOnly cookies

  // Periodic authentication check (every 10 minutes)
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(() => {
        checkAuth();
      }, 10 * 60 * 1000); // Check every 10 minutes

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

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