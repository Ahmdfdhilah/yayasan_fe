// apps/vite-react-app/src/services/auth/service.ts
import { BaseService } from "../base";
import {
  LoginRequest,
  LoginResponse,
  TokenResponse,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  ChangePasswordRequest,
  MessageResponse,
  UserResponse,
} from "./types";

class AuthService extends BaseService {
  constructor() {
    super("/auth");
  }

  async login(loginData: LoginRequest): Promise<LoginResponse> {
    return this.post("/login", loginData);
  }

  async logout(): Promise<MessageResponse> {
    try {
      return await this.post("/logout", {});
    } catch (error: any) {
      console.error("Logout error:", error);
      return { message: "Logout failed", success: false };
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    return this.post("/refresh", { refresh_token: refreshToken });
  }

  async getCurrentUser(): Promise<UserResponse> {
    return this.get("/me");
  }

  async requestPasswordReset(
    resetData: PasswordResetRequest
  ): Promise<MessageResponse> {
    return this.post("/password-reset", resetData);
  }

  async confirmPasswordReset(
    resetData: PasswordResetConfirmRequest
  ): Promise<MessageResponse> {
    return this.post("/password-reset/confirm", resetData);
  }

  async changePassword(
    changePasswordData: ChangePasswordRequest
  ): Promise<MessageResponse> {
    return this.post("/change-password", changePasswordData);
  }
}

export const authService = new AuthService();