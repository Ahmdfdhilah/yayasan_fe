// apps/vite-react-app/src/services/users/service.ts
import { BaseService } from "../base";
import {
  UserCreate,
  UserUpdate,
  AdminUserUpdate,
  AdminSetUserPassword,
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

  async updateCurrentUserMultipart(
    userData: FormData
  ): Promise<UserResponse> {
    return this.put("/me/multipart", userData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
    
    const endpoint = queryParams.toString() ? `?${queryParams.toString()}` : "";
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
    return this.post(`${params}`, createData);
  }

  async createUserMultipart(
    userData: FormData,
    organizationId?: number
  ): Promise<UserResponse> {
    const params = organizationId ? `?organization_id=${organizationId}` : '';
    return this.post(`/multipart${params}`, userData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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

  async updateUserMultipart(
    userId: number,
    userData: FormData
  ): Promise<UserResponse> {
    return this.put(`/${userId}/multipart`, userData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async deleteUser(
    userId: number
  ): Promise<MessageResponse> {
    return this.delete(`/${userId}`);
  }

  async resetUserPassword(
    userId: number
  ): Promise<MessageResponse> {
    return this.post(`/${userId}/reset-password`);
  }

  async setUserPassword(
    userId: number,
    passwordData: AdminSetUserPassword
  ): Promise<MessageResponse> {
    return this.post(`/${userId}/set-password`, passwordData);
  }

  async activateUser(
    userId: number
  ): Promise<UserResponse> {
    return this.post(`/${userId}/activate`);
  }

  async deactivateUser(
    userId: number
  ): Promise<UserResponse> {
    return this.post(`/${userId}/deactivate`);
  }

  async suspendUser(
    userId: number
  ): Promise<UserResponse> {
    return this.post(`/${userId}/suspend`);
  }
}

export const userService = new UserService();