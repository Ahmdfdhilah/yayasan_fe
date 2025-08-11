import { USER_ROLES, ROLE_LABELS, UserRole } from '@/lib/constants';

/**
 * Get user-friendly display name for role
 */
export function getRoleDisplayName(role: UserRole | string | null | undefined): string {
  if (!role) return 'Tidak ada role';
  
  // Handle role as string
  const roleKey = role as keyof typeof ROLE_LABELS;
  return ROLE_LABELS[roleKey] || role;
}

/**
 * Get all role options for forms/filters
 */
export function getRoleOptions() {
  return [
    { value: USER_ROLES.ADMIN, label: ROLE_LABELS[USER_ROLES.ADMIN] },
    { value: USER_ROLES.GURU, label: ROLE_LABELS[USER_ROLES.GURU] },
    { value: USER_ROLES.KEPALA_SEKOLAH, label: ROLE_LABELS[USER_ROLES.KEPALA_SEKOLAH] },
  ];
}

/**
 * Get role badge variant based on role
 */
export function getRoleBadgeVariant(role: UserRole | string | null | undefined): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (role) {
    case USER_ROLES.ADMIN:
      return 'destructive';
    case USER_ROLES.KEPALA_SEKOLAH:
      return 'default';
    case USER_ROLES.GURU:
      return 'secondary';
    default:
      return 'outline';
  }
}