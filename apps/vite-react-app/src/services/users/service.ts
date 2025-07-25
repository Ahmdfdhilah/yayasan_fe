// apps/vite-react-app/src/services/users/service.ts
import { BaseService } from "../base";
import {
  UserCreate,
  UserUpdate,
  AdminUserUpdate,
  UserChangePassword,
  UserResponse,
  UserListResponse,
  UserFilterParams,
  MessageResponse,
} from "./types";

class UserService extends BaseService {
  constructor() {
    super("/users");
  }

  // Current user methods
  async getCurrentUser(): Promise<UserResponse> {
    return this.get("/me");
  }

  async updateCurrentUser(
    userData: UserUpdate
  ): Promise<UserResponse> {
    return this.put("/me", userData);
  }

  async changePassword(
    passwordData: UserChangePassword
  ): Promise<MessageResponse> {
    return this.post("/auth/change-password", passwordData);
  }

  // Admin user management methods
  async getUsers(
    params?: UserFilterParams
  ): Promise<UserListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() ? `/?${queryParams.toString()}` : "/";
    return this.get(endpoint);
  }


  async createUser(
    userData: UserCreate,
    organizationId?: number
  ): Promise<UserResponse> {
    const params = organizationId ? `?organization_id=${organizationId}` : '';
    // For admin create, always set status to ACTIVE
    const createData = {
      ...userData,
      status: 'active' as const,
    };
    return this.post(`/${params}`, createData);
  }

  async getUserById(
    userId: number
  ): Promise<UserResponse> {
    return this.get(`/${userId}`);
  }

  async updateUser(
    userId: number,
    userData: AdminUserUpdate
  ): Promise<UserResponse> {
    return this.put(`/${userId}`, userData);
  }

  async deleteUser(
    userId: number
  ): Promise<MessageResponse> {
    return this.delete(`/${userId}`);
  }
}

export const userService = new UserService();