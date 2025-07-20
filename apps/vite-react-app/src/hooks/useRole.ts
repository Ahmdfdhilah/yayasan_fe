import { useCallback } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { selectUser } from '@/redux/features/authSlice';
import { USER_ROLES } from '@/lib/constants';

export const useRole = () => {
  const user = useAppSelector((state) => state.auth?.user ?? null);
  // PKG system uses roles array, get primary role or default to GURU
  const currentRole = user?.roles?.[0] || USER_ROLES.GURU;
  const allRoles = user?.roles || [];

  const isRole = useCallback((role: string) => {
    return allRoles.includes(role);
  }, [allRoles]);

  const isAdmin = useCallback(() => {
    return allRoles.includes(USER_ROLES.ADMIN);
  }, [allRoles]);

  const isGuru = useCallback(() => {
    return allRoles.includes(USER_ROLES.GURU);
  }, [allRoles]);

  const isKepalaSekolah = useCallback(() => {
    return allRoles.includes(USER_ROLES.KEPALA_SEKOLAH);
  }, [allRoles]);

  const hasPermission = useCallback((requiredRoles: string[]) => {
    return requiredRoles.some(role => allRoles.includes(role));
  }, [allRoles]);

  const hasAnyRole = useCallback((roles: string[]) => {
    return roles.some(role => allRoles.includes(role));
  }, [allRoles]);

  const hasAllRoles = useCallback((roles: string[]) => {
    return roles.every(role => allRoles.includes(role));
  }, [allRoles]);

  // Permission helpers for PKG system
  const canManageUsers = useCallback(() => {
    return isAdmin();
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
    allRoles,
    user,
    isRole,
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