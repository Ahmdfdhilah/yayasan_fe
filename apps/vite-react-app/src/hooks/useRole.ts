import { useCallback } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { USER_ROLES } from '@/lib/constants';

export const useRole = () => {
  const user = useAppSelector((state) => state.auth?.user ?? null);
  // PKG system now uses single role field
  const currentRole = user?.role || USER_ROLES.GURU;

  const isRole = useCallback((role: string) => {
    return currentRole === role;
  }, [currentRole]);

  const isSuperAdmin = useCallback(() => {
    return currentRole === USER_ROLES.SUPER_ADMIN;
  }, [currentRole]);

  const isAdmin = useCallback(() => {
    return currentRole === USER_ROLES.ADMIN || currentRole === USER_ROLES.SUPER_ADMIN;
  }, [currentRole]);

  const isGuru = useCallback(() => {
    return currentRole === USER_ROLES.GURU;
  }, [currentRole]);

  const isKepalaSekolah = useCallback(() => {
    return currentRole === USER_ROLES.KEPALA_SEKOLAH;
  }, [currentRole]);

  const hasPermission = useCallback((requiredRoles: string[]) => {
    return requiredRoles.includes(currentRole);
  }, [currentRole]);

  const hasAnyRole = useCallback((roles: string[]) => {
    return roles.includes(currentRole);
  }, [currentRole]);

  const hasAllRoles = useCallback((roles: string[]) => {
    // With single role, user can only have all roles if there's only one role required
    return roles.length === 1 && roles.includes(currentRole);
  }, [currentRole]);

  // Permission helpers for PKG system
  const canManageUsers = useCallback(() => {
    return isAdmin(); // Now includes SUPER_ADMIN
  }, [isAdmin]);

  const canManageOrganization = useCallback(() => {
    return isAdmin() || isKepalaSekolah();
  }, [isAdmin, isKepalaSekolah]);

  const canEvaluateTeachers = useCallback(() => {
    return isAdmin() || isKepalaSekolah();
  }, [isAdmin, isKepalaSekolah]);

  const canSubmitRPP = useCallback(() => {
    return isGuru();
  }, [isGuru]);

  const canReviewRPP = useCallback(() => {
    return isKepalaSekolah();
  }, [isKepalaSekolah]);

  return {
    currentRole,
    user,
    isRole,
    isSuperAdmin,
    isAdmin,
    isGuru,
    isKepalaSekolah,
    hasPermission,
    hasAnyRole,
    hasAllRoles,
    // PKG specific permissions
    canManageUsers,
    canManageOrganization,
    canEvaluateTeachers,
    canSubmitRPP,
    canReviewRPP,
  };
};