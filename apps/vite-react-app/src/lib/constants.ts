// apps/vite-react-app/src/lib/constants.ts

// PKG System User Role Constants
export const USER_ROLES = {
  ADMIN: 'admin',
  GURU: 'guru',
  KEPALA_SEKOLAH: 'kepala_sekolah'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Role Display Labels
export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.GURU]: 'Guru',
  [USER_ROLES.KEPALA_SEKOLAH]: 'Kepala Sekolah'
} as const;

// User Status Constants
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];

// Status Display Labels
export const STATUS_LABELS = {
  [USER_STATUS.ACTIVE]: 'Aktif',
  [USER_STATUS.INACTIVE]: 'Tidak Aktif',
  [USER_STATUS.SUSPENDED]: 'Ditangguhkan'
} as const;

// RPP Status Constants
export const RPP_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REVISION_NEEDED: 'revision_needed'
} as const;

export type RPPStatus = typeof RPP_STATUS[keyof typeof RPP_STATUS];

// RPP Status Display Labels
export const RPP_STATUS_LABELS = {
  [RPP_STATUS.PENDING]: 'Menunggu Review',
  [RPP_STATUS.APPROVED]: 'Disetujui',
  [RPP_STATUS.REJECTED]: 'Ditolak',
  [RPP_STATUS.REVISION_NEEDED]: 'Perlu Revisi'
} as const;

// Evaluation Grade Constants
export const EVALUATION_GRADES = {
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D'
} as const;

export type EvaluationGrade = typeof EVALUATION_GRADES[keyof typeof EVALUATION_GRADES];

// Grade Display Labels and Scores
export const GRADE_LABELS = {
  [EVALUATION_GRADES.A]: 'Sangat Baik (4)',
  [EVALUATION_GRADES.B]: 'Baik (3)',
  [EVALUATION_GRADES.C]: 'Cukup (2)',
  [EVALUATION_GRADES.D]: 'Perlu Perbaikan (1)'
} as const;

// Period Type Constants
export const PERIOD_TYPES = {
  EVALUATION: 'evaluation',
  RPP_SUBMISSION: 'rpp_submission',
  ACADEMIC: 'academic'
} as const;

export type PeriodType = typeof PERIOD_TYPES[keyof typeof PERIOD_TYPES];

// Period Type Display Labels
export const PERIOD_TYPE_LABELS = {
  [PERIOD_TYPES.EVALUATION]: 'Periode Evaluasi',
  [PERIOD_TYPES.RPP_SUBMISSION]: 'Periode Pengumpulan RPP',
  [PERIOD_TYPES.ACADEMIC]: 'Periode Akademik'
} as const;


// API Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  SIZE: 20,
  MAX_SIZE: 100
} as const;

// Academic Year Options (example)
export const ACADEMIC_YEARS = [
  { value: '2023/2024', label: '2023/2024' },
  { value: '2024/2025', label: '2024/2025' },
  { value: '2025/2026', label: '2025/2026' }
] as const;

// Semester Options
export const SEMESTERS = [
  { value: 'Ganjil', label: 'Semester Ganjil' },
  { value: 'Genap', label: 'Semester Genap' }
] as const;

// File Size Limits
export const FILE_LIMITS = {
  MAX_SIZE: 100 * 1024 * 1024, // 100MB in bytes
  ALLOWED_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
} as const;