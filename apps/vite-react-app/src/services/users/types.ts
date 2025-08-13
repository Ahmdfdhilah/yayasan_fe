// apps/vite-react-app/src/services/users/types.ts

import { PaginatedResponse } from "../base/types";
import { UserRole, UserStatus } from "../auth/types";

// PKG User Types
export interface User {
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

// Request Types
export interface UserCreate {
  email: string;
  profile: {
    name: string;
    [key: string]: any;
  };
  img_url?: string;
  organization_id?: number;
  role?: UserRole;
  status?: UserStatus;
  password?: string;
}

export interface UserUpdate {
  email?: string;
  profile?: {
    [key: string]: any;
  };
  img_url?: string;
}

export interface AdminUserUpdate {
  profile?: {
    [key: string]: any;
  };
  img_url?: string;
  organization_id?: number;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  password?: string;
}

export interface AdminSetUserPassword {
  new_password: string;
}

export interface UserChangePassword {
  current_password: string;
  new_password: string;
}

// Response Types
export interface UserResponse extends User { }

export interface UserListResponse extends PaginatedResponse<User> { }

// Filter Types
export interface UserFilterParams {
  page?: number;
  size?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  organization_id?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  created_after?: string;
  created_before?: string;
  is_active?: boolean;
}

// Response wrapper for single operations
export interface MessageResponse {
  message: string;
  success: boolean;
  data?: object;
}