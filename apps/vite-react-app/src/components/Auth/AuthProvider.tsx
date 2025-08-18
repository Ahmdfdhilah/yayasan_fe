// apps/vite-react-app/src/components/Auth/AuthProvider.tsx
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  loginAsync,
  logoutAsync,
  changePasswordAsync,
  getCurrentUserAsync,
  clearAuth,
  clearError
} from '@/redux/features/authSlice';
import { persistor } from '@/redux/store';
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

  // Session management
  isSessionValid: () => boolean;
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
    } finally {
      // Always purge persist storage to ensure complete logout
      try {
        await persistor.purge();
        localStorage.removeItem('persist:tafatur-root');
        sessionStorage.clear();
      } catch (persistError) {
        console.error('Error clearing persist storage:', persistError);
      }
    }
  };

  const checkAuth = async (): Promise<void> => {
    try {
      // Prevent multiple concurrent checkAuth calls
      if (loading) {
        return;
      }

      // If we have user data and authenticated state persisted, just verify
      if (user && isAuthenticated) {
        // User data already exists, no need to fetch again
        return;
      }

      // Only fetch user data if we don't have it
      await dispatch(getCurrentUserAsync()).unwrap();
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch(clearAuth());
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

  const isSessionValid = (): boolean => {
    // With cookie-based auth, we check if user exists
    // Actual token validation happens server-side
    return isAuthenticated && !!user;
  };

  // Check auth on mount to restore session after refresh - SIMPLE VERSION
  useEffect(() => {
    // If we have user data and authenticated state persisted, no need to check
    if (user && isAuthenticated) {
      return;
    }
    // If no user data and not authenticated, and not loading, try to check auth once
    if (!user && !isAuthenticated && !loading) {
      checkAuth();
    }
  }, []); // Only run on mount

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

    // Session management
    isSessionValid
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