import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services/auth';
import { userService } from '@/services/users';
import { UserUpdate } from '@/services/users/types';
import { 
  LoginRequest, 
  PasswordResetRequest, 
  PasswordResetConfirmRequest,
  ChangePasswordRequest,
  UserResponse 
} from '@/services/auth/types';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserResponse | null;
  error: string | null;
  projectId?: string; // Add project identifier
  // Note: tokens are stored in HttpOnly cookies, not in Redux state
}

export const updateProfileAsync = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: UserUpdate | { formData: FormData }, { rejectWithValue }) => {
    try {
      let response;
      if ('formData' in profileData) {
        // Multipart form data update (with image)
        response = await userService.updateCurrentUserMultipart(profileData.formData);
      } else {
        // Regular JSON update
        response = await userService.updateCurrentUser(profileData);
      }
      
      // After successful update, refetch current user data to ensure we have the latest info
      try {
        const freshUserData = await userService.getCurrentUser();
        return freshUserData;
      } catch (fetchError) {
        // If refetch fails, return the update response but log the error
        console.warn('Failed to refetch user data after profile update:', fetchError);
        return response;
      }
    } catch (error: any) {
      // BaseService already handles error.response?.data?.detail extraction
      const errorMessage = error?.message || 'Profile update failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// Project identifier to prevent conflicts with other projects
const PROJECT_ID = import.meta.env.VITE_PROJECT_ID || 'ta-fatur';

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,
  projectId: PROJECT_ID,
};

export const loginAsync = createAsyncThunk(
  'auth/login',
  async (loginData: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(loginData);
      
      // Only return user data - tokens are stored in HttpOnly cookies
      return {
        user: response.user
      };
    } catch (error: any) {
      // BaseService already handles error.response?.data?.detail extraction
      const errorMessage = error?.message || 'Login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return;
    } catch (error: any) {
      // BaseService already handles error.response?.data?.detail extraction
      const errorMessage = error?.message || 'Logout failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const refreshTokenAsync = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken();
      
      // Only return user data - tokens are handled by cookies
      return {
        user: response.user
      };
    } catch (error: any) {
      // BaseService already handles error.response?.data?.detail extraction
      const errorMessage = error?.message || 'Token refresh failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const getCurrentUserAsync = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      return response;
    } catch (error: any) {
      // BaseService already handles error.response?.data?.detail extraction
      const errorMessage = error?.message || 'Failed to get current user';
      return rejectWithValue(errorMessage);
    }
  }
);

export const requestPasswordResetAsync = createAsyncThunk(
  'auth/requestPasswordReset',
  async (resetData: PasswordResetRequest, { rejectWithValue }) => {
    try {
      const response = await authService.requestPasswordReset(resetData);
      return response.message;
    } catch (error: any) {
      // BaseService already handles error.response?.data?.detail extraction
      const errorMessage = error?.message || 'Password reset request failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const confirmPasswordResetAsync = createAsyncThunk(
  'auth/confirmPasswordReset',
  async (resetData: PasswordResetConfirmRequest, { rejectWithValue }) => {
    try {
      const response = await authService.confirmPasswordReset(resetData);
      return response.message;
    } catch (error: any) {
      // BaseService already handles error.response?.data?.detail extraction
      const errorMessage = error?.message || 'Password reset confirmation failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const changePasswordAsync = createAsyncThunk(
  'auth/changePassword',
  async (passwordData: ChangePasswordRequest, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword(passwordData);
      return response.message;
    } catch (error: any) {
      // BaseService already handles error.response?.data?.detail extraction
      const errorMessage = error?.message || 'Password change failed';
      return rejectWithValue(errorMessage);
    }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
      state.projectId = PROJECT_ID;
    },
    clearPersistAndAuth: (state) => {
      // This action will be handled by the AuthProvider to purge persist storage
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
      state.projectId = PROJECT_ID;
    },
    validateProjectState: (state) => {
      // Clear state if it's from a different project
      if (state.projectId !== PROJECT_ID) {
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
        state.projectId = PROJECT_ID;
      }
    },
    setUser: (state, action: PayloadAction<UserResponse>) => {
      state.user = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<UserResponse>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      .addCase(logoutAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(refreshTokenAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshTokenAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.user) {
          state.user = action.payload.user;
        }
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(refreshTokenAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // Clear all auth data when refresh fails
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(requestPasswordResetAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestPasswordResetAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(requestPasswordResetAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(confirmPasswordResetAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(confirmPasswordResetAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(confirmPasswordResetAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(changePasswordAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePasswordAsync.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changePasswordAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getCurrentUserAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUserAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUserAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        // Always clear auth on getCurrentUser rejection - if we can't get user, we're not authenticated
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(updateProfileAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfileAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfileAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearAuth, clearPersistAndAuth, setUser, updateUser, validateProjectState } = authSlice.actions;

export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export default authSlice.reducer;