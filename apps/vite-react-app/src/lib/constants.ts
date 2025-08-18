// apps/vite-react-app/src/lib/constants.ts

// PKG System User Role Constants
export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  GURU: 'GURU',
  KEPALA_SEKOLAH: 'KEPALA_SEKOLAH'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Role Display Labels
export const ROLE_LABELS = {
  [USER_ROLES.SUPER_ADMIN]: 'Super Administrator',
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
} as const;

export type RPPStatus = typeof RPP_STATUS[keyof typeof RPP_STATUS];

// RPP Status Display Labels
export const RPP_STATUS_LABELS = {
  [RPP_STATUS.PENDING]: 'Menunggu Review',
  [RPP_STATUS.APPROVED]: 'Disetujui',
  [RPP_STATUS.REJECTED]: 'Ditolak',
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

// Evaluation Rating Options for forms
export const EVALUATION_RATINGS = [
  {
    value: 'A',
    label: 'A',
    description: 'Sangat Baik',
    score: 4,
  },
  {
    value: 'B',
    label: 'B',
    description: 'Baik',
    score: 3,
  },
  {
    value: 'C',
    label: 'C',
    description: 'Cukup',
    score: 2,
  },
  {
    value: 'D',
    label: 'D',
    description: 'Perlu Perbaikan',
    score: 1,
  },
] as const;


// API Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  SIZE: 20,
  MAX_SIZE: 100
} as const;

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