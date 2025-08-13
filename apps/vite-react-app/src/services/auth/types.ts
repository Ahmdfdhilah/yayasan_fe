// apps/vite-react-app/src/services/auth/types.ts

// Enums from API
export enum UserRole {
  ADMIN = "ADMIN",
  GURU = "GURU",
  KEPALA_SEKOLAH = "KEPALA_SEKOLAH"
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended"
}

// Auth Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenRefreshRequest {
  refresh_token: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  new_password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// Auth Response Types
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
  user: UserResponse;
}

export interface MessageResponse {
  message: string;
  success: boolean;
  data?: object;
}

// Login response is the same as Token response
export interface LoginResponse extends TokenResponse {}

// User Response Type (PKG system structure)
export interface UserResponse {
  id: number;
  email: string;
  profile: {
    name: string;
    [key: string]: any;
  };
  img_url?: string;
  organization_id?: number;
  organization_name?: string;
  status: UserStatus;
  last_login_at?: string;
  created_at: string;
  updated_at?: string;
  display_name: string;
  full_name: string;
  role: UserRole;
}

