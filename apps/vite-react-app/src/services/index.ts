// apps/vite-react-app/src/services/index.ts

// Export base types (including shared types to avoid conflicts)
export * from "./base";

// Export services with explicit type re-exports to avoid naming conflicts
export { authService } from "./auth";
export { userService } from "./users";
export { organizationService } from "./organizations";
export { periodService } from "./periods";
export { evaluationAspectService } from "./evaluation-aspects";
export { teacherEvaluationService } from "./teacher-evaluations";
export { rppSubmissionService } from "./rpp-submissions";
export { mediaFileService } from "./media-files";
export { dashboardService } from "./dashboard";
export { mitraService } from "./mitra";
export { programService } from "./program";
export { statisticService } from "./statistics";

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

export type {
  Organization,
  OrganizationCreate,
  OrganizationUpdate,
  OrganizationResponse,
  OrganizationListResponse,
  OrganizationFilterParams,
} from "./organizations";

export type {
  Period,
  PeriodCreate,
  PeriodUpdate,
  PeriodResponse,
  PeriodWithStats,
  PeriodListResponse,
  PeriodFilterParams,
} from "./periods";

export type {
  EvaluationAspect,
  EvaluationAspectCreate,
  EvaluationAspectUpdate,
  EvaluationAspectResponse,
  EvaluationAspectSummary,
  EvaluationAspectListResponse,
  EvaluationAspectFilterParams,
} from "./evaluation-aspects";

export type {
  TeacherEvaluation,
  TeacherEvaluationCreate,
  TeacherEvaluationUpdate,
  TeacherEvaluationResponse,
  TeacherEvaluationWithDetails,
  TeacherEvaluationListResponse,
  TeacherEvaluationFilterParams,
  MyEvaluationsFilterParams,
  TeacherEvaluationMessageResponse,
  AssignTeachersToPeriodRequest,
  AssignTeachersResponse,
  TeacherEvaluationStats,
  TeacherEvaluationStatus,
  EvaluationData,
  EvaluationRating,
} from "./teacher-evaluations";

export type {
  RPPType,
  RPPSubmissionStatus,
  RPPSubmissionResponse,
  RPPSubmissionListResponse,
  RPPSubmissionItemResponse,
  RPPSubmissionItemListResponse,
  RPPSubmissionFilterParams,
  RPPSubmissionItemFilterParams,
  RPPSubmissionStats,
  RPPSubmissionDashboard,
  GenerateRPPSubmissionsRequest,
  GenerateRPPSubmissionsResponse,
  RPPSubmissionSubmitRequest,
  RPPSubmissionReviewRequest,
  RPPSubmissionItemUpdate,
  RPPSubmissionMessageResponse,
} from "./rpp-submissions";

export type {
  MediaFileResponse,
  MediaFileListResponse,
  MediaFileFilterParams,
  MediaFileMessageResponse,
  MediaFileUpdate,
  MediaFileUploadResponse,
  MediaFileUploadData,
} from "./media-files";

export type {
  RPPDashboardStats,
  TeacherEvaluationDashboardStats,
  OrganizationSummary,
  PeriodSummary,
  QuickStats,
  BaseDashboard,
  TeacherDashboard,
  PrincipalDashboard,
  AdminDashboard,
  DashboardResponse,
  DashboardQueryParams,
  QuickStatsQueryParams,
  TeacherSummary,
  OrganizationOverview,
  SystemOverview,
  SystemActivity,
} from "./dashboard";

export type {
  Mitra,
  MitraCreate,
  MitraUpdate,
  MitraResponse,
  MitraListResponse,
  MitraFilterParams,
} from "./mitra";

export type {
  Program,
  ProgramCreate,
  ProgramUpdate,
  ProgramResponse,
  ProgramListResponse,
  ProgramFilterParams,
} from "./program";

export type {
  Statistic,
  StatisticCreate,
  StatisticUpdate,
  StatisticResponse,
  StatisticListResponse,
  StatisticFilterParams,
} from "./statistics";