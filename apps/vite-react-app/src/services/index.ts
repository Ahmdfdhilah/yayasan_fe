// apps/vite-react-app/src/services/index.ts

// Export base types (including shared types to avoid conflicts)
export * from "./base";

// Export services with explicit type re-exports to avoid naming conflicts
export { authService } from "./auth";
export { userService } from "./users";

// Export types with explicit imports to avoid conflicts
export type {
  LoginRequest,
  LoginResponse,
  TokenResponse,
  TokenRefreshRequest,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
} from "./auth";

export type {
  User,
  UserCreate,
  UserUpdate,
  UserChangePassword,
  UserResponse,
  UserListResponse,
  UserFilterParams,
} from "./users";