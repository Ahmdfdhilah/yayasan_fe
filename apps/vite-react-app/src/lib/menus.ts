import {
  BookOpen,
  FileText,
  Users,
  GraduationCap,
  Calendar,
  BarChart3,
  Building,
  ClipboardCheck,
  Upload,
  UserCheck,
  Newspaper,
  Image,
  MessageSquare,
  Settings,
  Building2,
  Target,
} from "lucide-react";

// PKG System Role definitions
export type UserRole =
  | 'ADMIN'
  | 'GURU'
  | 'KEPALA_SEKOLAH';

export interface SidebarItem {
  title: string;
  href?: string;
  icon: any;
  children?: SidebarItem[];
  isPlaceholder?: boolean;
  allowedRoles: UserRole[];
  badge?: string;
}


export const appMenuItems: SidebarItem[] = [
  // Dashboard - All roles
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    allowedRoles: ['ADMIN', 'GURU', 'KEPALA_SEKOLAH'],
  },

  // RPP Management - Teachers and Principals
  {
    title: 'RPP Guru',
    icon: FileText,
    allowedRoles: ['KEPALA_SEKOLAH', 'ADMIN', 'GURU'],
    children: [
      {
        title: 'Daftar RPP',
        href: '/rpp-submissions',
        icon: ClipboardCheck,
        allowedRoles: ['KEPALA_SEKOLAH', 'ADMIN'],
      },
      {
        title: 'RPP Saya',
        href: '/my-rpp-submissions',
        icon: Upload,
        allowedRoles: ['GURU', 'KEPALA_SEKOLAH'],
      },
    ],
  },

  // Teacher Evaluations - Principals and Admin
  {
    title: 'Evaluasi Guru',
    icon: GraduationCap,
    allowedRoles: ['KEPALA_SEKOLAH', 'ADMIN', 'GURU'],
    children: [
      {
        title: 'Daftar Evaluasi',
        href: '/teacher-evaluations',
        icon: ClipboardCheck,
        allowedRoles: ['KEPALA_SEKOLAH', 'ADMIN'],
      },
      {
        title: 'Evaluasi Saya',
        href: '/my-evaluations',
        icon: ClipboardCheck,
        allowedRoles: ['GURU', 'KEPALA_SEKOLAH'],
      },
      {
        title: 'Laporan Evaluasi',
        href: '/evaluations/reports',
        icon: BarChart3,
        allowedRoles: ['ADMIN'],
      },
    ],
  },

  // Management System - Admin only
  {
    title: 'Manajemen Sistem',
    icon: Settings,
    allowedRoles: ['ADMIN'],
    children: [
      {
        title: 'Aspek Evaluasi',
        href: '/evaluation-aspects',
        icon: BookOpen,
        allowedRoles: ['ADMIN'],
      },
      {
        title: 'Periode',
        href: '/periods',
        icon: Calendar,
        allowedRoles: ['ADMIN'],
      },
      {
        title: 'Pengguna',
        href: '/users',
        icon: Users,
        allowedRoles: ['ADMIN'],
      },
    ],
  },

  // Content Management - Admin only
  {
    title: 'Manajemen Konten',
    icon: Building,
    allowedRoles: ['ADMIN'],
    children: [
      {
        title: 'Pengurus',
        href: '/cms/board-members',
        icon: UserCheck,
        allowedRoles: ['ADMIN'],
      },
      {
        title: 'Sekolah',
        href: '/cms/organizations',
        icon: Building,
        allowedRoles: ['ADMIN'],
      },
      {
        title: 'Artikel',
        href: '/cms/articles',
        icon: Newspaper,
        allowedRoles: ['ADMIN'],
      },
      {
        title: 'Galeri',
        href: '/cms/galleries',
        icon: Image,
        allowedRoles: ['ADMIN'],
      },
      {
        title: 'Pesan',
        href: '/cms/messages',
        icon: MessageSquare,
        allowedRoles: ['ADMIN'],
      },
      {
        title: 'Mitra',
        href: '/cms/mitra',
        icon: Building2,
        allowedRoles: ['ADMIN'],
      },
      {
        title: 'Program',
        href: '/cms/program',
        icon: Target,
        allowedRoles: ['ADMIN'],
      },
      {
        title: 'Statistik',
        href: '/cms/statistik',
        icon: BarChart3,
        allowedRoles: ['ADMIN'],
      },
    ],
  }
];

// Helper function to get appropriate menu items based on user role
export const getMenuItemsForUser = (userRole: UserRole): SidebarItem[] => {
  // Filter items based on user's single role
  const items = filterMenuByRole(appMenuItems, userRole);
  return [...items];
};

// Helper function to filter menu items based on user role
export const filterMenuByRole = (
  menuItems: SidebarItem[],
  userRole: UserRole
): SidebarItem[] => {
  return menuItems
    .filter(item => {
      // If allowedRoles is empty, allow access to all authenticated users
      if (item.allowedRoles.length === 0) {
        return true;
      }
      // Check if user's role is in the allowed roles for this menu item
      const hasAccess = item.allowedRoles.includes(userRole);
      return hasAccess;
    })
    .map(item => {
      // If item has children, filter them too
      if (item.children) {
        const filteredChildren = filterMenuByRole(item.children, userRole);
        return {
          ...item,
          children: filteredChildren,
        };
      }
      return item;
    })
    .filter(item => {
      // Remove parent items that have no visible children
      if (item.children) {
        return item.children.length > 0;
      }
      return true;
    });
};

// Helper function to filter menu items based on user roles (legacy)
export const filterMenuByRoles = (
  menuItems: SidebarItem[],
  userRoles: string[]
): SidebarItem[] => {
  return menuItems
    .filter(item => {
      // If allowedRoles is empty, allow access to all authenticated users
      if (item.allowedRoles.length === 0) {
        return true;
      }
      // Check if user has any of the allowed roles for this menu item
      const hasAccess = item.allowedRoles.some(role => userRoles.includes(role));
      return hasAccess;
    })
    .map(item => {
      // If item has children, filter them too
      if (item.children) {
        const filteredChildren = filterMenuByRoles(item.children, userRoles);
        return {
          ...item,
          children: filteredChildren,
        };
      }
      return item;
    })
    .filter(item => {
      // Remove parent items that have no accessible children
      if (item.isPlaceholder && item.children) {
        return item.children.length > 0;
      }
      return true;
    });
};

// Helper function to check if user has access to specific route
export const hasRouteAccess = (
  path: string,
  userRole: UserRole,
  menuItems: SidebarItem[] = appMenuItems
): boolean => {
  for (const item of menuItems) {
    // Check direct match
    if (item.href === path) {
      // If allowedRoles is empty, allow access to all authenticated users
      if (item.allowedRoles.length === 0) {
        return true;
      }
      return item.allowedRoles.includes(userRole);
    }

    // Check children
    if (item.children) {
      const childAccess = hasRouteAccess(path, userRole, item.children);
      if (childAccess !== null) return childAccess;
    }
  }
  return false;
};

// Default export for backward compatibility
export default appMenuItems;