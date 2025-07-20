# Services Layer

This directory contains the service layer for API communication in the Perwadag application. The services follow a consistent pattern and architecture for type-safe, maintainable API interactions.

## Architecture Overview

### Base Service Pattern
All services extend the `BaseService` class which provides:
- Consistent HTTP method wrappers (GET, POST, PUT, PATCH, DELETE)
- Centralized error handling
- Type-safe request/response handling
- Automatic API endpoint prefixing

### Directory Structure
```
services/
├── README.md                    # This documentation
├── index.ts                     # Central exports for all services and types
├── base/                        # Base service foundation
│   ├── index.ts                 # Base exports
│   ├── service.ts               # BaseService class
│   └── types.ts                 # Shared interfaces and types
├── auth/                        # Authentication services
│   ├── index.ts                 # Auth service exports
│   ├── service.ts               # AuthService implementation
│   └── types.ts                 # Auth-specific types
├── users/                       # User management services
├── meeting/                     # Meeting-related services
├── matriks/                     # Matrix evaluation services
├── kuisioner/                   # Questionnaire services
├── formatKuisioner/             # Questionnaire template services
├── laporanHasil/                # Evaluation report services
├── suratTugas/                  # Task letter services
└── suratPemberitahuan/          # Notification letter services
```

## Service Architecture

### 1. BaseService Class (`base/service.ts`)

The foundation class that all specific services extend:

```typescript
export abstract class BaseService {
  protected baseEndpoint: string;
  
  constructor(baseEndpoint: string) {
    this.baseEndpoint = `/api/v1${baseEndpoint}`;
  }
}
```

**Key Features:**
- **Automatic Error Handling**: Catches errors
- **Type Safety**: Generic types for request/response handling

### 2. Service Implementation Pattern

Each service follows this consistent pattern:

```typescript
// Example: UserService
class UserService extends BaseService {
  constructor() {
    super("/users");  // API endpoint prefix
  }

  async getUsers(params?: UserFilterParams, options?: UserServiceOptions): Promise<UserListResponse> {
    return this.get(
      endpoint
    );
  }
}

export const userService = new UserService();
```

### 3. Type Definitions Pattern

Each service module includes comprehensive TypeScript types:

```typescript
// Domain types
export interface User {
  id: string;
  username: string;
  // ... other properties
}

// Request/Response types
export interface UserCreate { /* ... */ }
export interface UserUpdate { /* ... */ }
export interface UserResponse { /* ... */ }
export interface UserListResponse { /* ... */ }

```

## Available Services

### 1. Authentication Service (`auth/`)
- **Purpose**: Handle user authentication, token management, password operations
- **Key Methods**:
  - `login(loginData, options?)` - User authentication
  - `logout(options?)` - User logout
  - `refreshToken(refreshToken)` - Token refresh
  - `verifyToken()` - Token validation
  - `requestPasswordReset(resetData, options?)` - Password reset request
  - `confirmPasswordReset(resetData, options?)` - Password reset confirmation

### 2. User Management Service (`users/`)
- **Purpose**: User CRUD operations, profile management, role-based queries
- **Key Methods**:
  - `getCurrentUser(options?)` - Get current user profile
  - `updateCurrentUser(userData, options?)` - Update profile
  - `changePassword(passwordData, options?)` - Change password
  - `getUsers(params?, options?)` - List users with filtering
  - `getUsersByRole(roleName, options?)` - Get users by role
  - `createUser(userData, options?)` - Create new user
  - `updateUser(userId, userData, options?)` - Update user
  - `deleteUser(userId, options?)` - Delete user

### 3. Meeting Service (`meeting/`)
- **Purpose**: Meeting management, file uploads, meeting lifecycle
- **Key Methods**:
  - Meeting CRUD operations
  - File upload/download management
  - Meeting status updates

### 4. Document Services
Multiple services for document management:
- **Surat Tugas** (`suratTugas/`) - Task letters
- **Surat Pemberitahuan** (`suratPemberitahuan/`) - Notification letters
- **Matriks** (`matriks/`) - Evaluation matrices
- **Kuisioner** (`kuisioner/`) - Questionnaires
- **Format Kuisioner** (`formatKuisioner/`) - Questionnaire templates
- **Laporan Hasil** (`laporanHasil/`) - Evaluation reports

## Enum Values Reference

### Role Enum Values
```typescript
type Role = "ADMIN" | "INSPEKTORAT" | "PERWADAG";
```

### Meeting Type Enum Values
```typescript
type MeetingType = "ENTRY" | "KONFIRMASI" | "EXIT";
```

**Important**: All enum values use UPPERCASE format for consistency across the application.

## Usage Examples

### Basic Service Usage

```typescript
import { userService, UserCreate } from '@/services';

// Get current user
const currentUser = await userService.getCurrentUser();

// Create new user 
const newUserData: UserCreate = {
  nama_lengkap: "John Doe",
  email: "john@example.com",
  // ... other fields
};

const createdUser = await userService.createUser(newUserData);
```


### Authentication Flow

```typescript
import { authService } from '@/services';

// Login
const loginResponse = await authService.login({
  username: "user@example.com",
  password: "password123"
});

// The response includes tokens and user info
const { access_token, refresh_token, user } = loginResponse;

// Token refresh (usually handled automatically by API interceptor)
const newTokens = await authService.refreshToken(refresh_token);
```

### Filtering and Pagination

```typescript
import { userService, UserFilterParams } from '@/services';

const filterParams: UserFilterParams = {
  page: 1,
  limit: 20,
  search: "john",
  role: "admin",
  is_active: true
};

const usersResponse = await userService.getUsers(filterParams);
const { items, total, page, limit, pages } = usersResponse;
```

## Error Handling

The BaseService provides consistent error handling:

1. **HTTP Errors**: Automatically caught and parsed
2. **Error Messages**: Extracted from API response or fallback to generic messages
3. **Error Propagation**: Errors re-thrown for component-level handling

```typescript
// Error handling example
try {
  await userService.createUser(userData);
} catch (error) {
  // Additional error handling if needed
  console.error("User creation failed:", error.message);
}
```

## Adding New Services

To add a new service, follow this pattern:

1. **Create service directory**: `services/newService/`

2. **Define types** (`types.ts`):
```typescript
export interface NewEntity {
  id: string;
  name: string;
}

export interface NewEntityCreate {
  name: string;
}

export interface NewEntityServiceOptions extends ServiceOptions {
  // Additional options if needed
}
```

3. **Implement service** (`service.ts`):
```typescript
import { BaseService } from "../base";

class NewEntityService extends BaseService {
  constructor() {
    super("/new-entity");
  }

  async getEntities(options?: NewEntityServiceOptions) {
    return this.get("/", undefined, errorConfig, options);
  }
}

export const newEntityService = new NewEntityService();
```

4. **Export from index** (`index.ts`):
```typescript
export { newEntityService } from "./service";
export type * from "./types";
```

5. **Add to main exports** (`services/index.ts`):
```typescript
export { newEntityService } from "./newEntity";
export type { NewEntity, NewEntityCreate } from "./newEntity";
```

## Best Practices

1. **Type Safety**: Always define comprehensive TypeScript types
2. **Consistent Naming**: Follow the established naming conventions
3. **Service Options**: Support options parameter for flexibility
4. **Documentation**: Include JSDoc comments for complex methods
5. **Testing**: Write unit tests for service methods (when applicable)

## Common Patterns

### File Upload Services
Several services support file uploads with consistent patterns:

```typescript
async uploadFile(entityId: string, file: File, options?: ServiceOptions) {
  const formData = new FormData();
  formData.append('file', file);
  
  return this.post(
    `/${entityId}/upload`,
    formData,
    { title: "Success", description: "File uploaded successfully" },
    { title: "Error", description: "Failed to upload file" },
    options
  );
}
```

### Statistics Methods
Many services provide statistics endpoints:

```typescript
async getStatistics(options?: ServiceOptions) {
  return this.get(
    "/statistics",
    undefined,
    { title: "Error", description: "Failed to get statistics" },
    options
  );
}
```

This service layer provides a robust, type-safe foundation for API communication while maintaining consistency and developer experience across the application.