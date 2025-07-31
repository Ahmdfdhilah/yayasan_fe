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
  FolderOpen,
  UserCheck,
  Newspaper,
  Image,
  MessageSquare,
  Settings,
} from "lucide-react";

// PKG System Role definitions
export type UserRole =
  | 'admin'
  | 'guru'
  | 'kepala_sekolah';

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
    allowedRoles: ['admin', 'guru', 'kepala_sekolah'],
  },

  // RPP Management - Teachers and Principals
  {
    title: 'RPP Guru',
    icon: FileText,
    allowedRoles: ['kepala_sekolah', 'admin', 'guru'],
    children: [
      {
        title: 'Daftar RPP',
        href: '/rpp-submissions',
        icon: ClipboardCheck,
        allowedRoles: ['kepala_sekolah', 'admin'],
      },
      {
        title: 'RPP Saya',
        href: '/my-rpp-submissions',
        icon: Upload,
        allowedRoles: ['guru', 'kepala_sekolah'],
      },
    ],
  },

  // Teacher Evaluations - Principals and Admin
  {
    title: 'Evaluasi Guru',
    icon: GraduationCap,
    allowedRoles: ['kepala_sekolah', 'admin', 'guru'],
    children: [
      {
        title: 'Daftar Evaluasi',
        href: '/teacher-evaluations',
        icon: ClipboardCheck,
        allowedRoles: ['kepala_sekolah', 'admin'],
      },
      {
        title: 'Evaluasi Saya',
        href: '/my-evaluations',
        icon: ClipboardCheck,
        allowedRoles: ['guru', 'kepala_sekolah'],
      },
      {
        title: 'Laporan Evaluasi',
        href: '/evaluations/reports',
        icon: BarChart3,
        allowedRoles: ['admin'],
      },
    ],
  },

  // Management System - Admin only
  {
    title: 'Manajemen Sistem',
    icon: Settings,
    allowedRoles: ['admin'],
    children: [
      {
        title: 'Manajemen Aspek Evaluasi',
        href: '/evaluation-aspects',
        icon: BookOpen,
        allowedRoles: ['admin'],
      },
      {
        title: 'Manajemen Periode',
        href: '/periods',
        icon: Calendar,
        allowedRoles: ['admin'],
      },
      {
        title: 'Manajemen Sekolah',
        href: '/organizations',
        icon: Building,
        allowedRoles: ['admin'],
      },
      {
        title: 'Manajemen Pengguna',
        href: '/users',
        icon: Users,
        allowedRoles: ['admin'],
      },
    ],
  },

  // Content Management - Admin only
  {
    title: 'Manajemen Konten',
    icon: Building,
    allowedRoles: ['admin'],
    children: [
      {
        title: 'Pengurus',
        href: '/board-members',
        icon: UserCheck,
        allowedRoles: ['admin'],
      },
      {
        title: 'Artikel',
        href: '/articles',
        icon: Newspaper,
        allowedRoles: ['admin'],
      },
      {
        title: 'Galeri',
        href: '/galleries',
        icon: Image,
        allowedRoles: ['admin'],
      },
      {
        title: 'Pesan',
        href: '/messages',
        icon: MessageSquare,
        allowedRoles: ['admin'],
      },
    ],
  },

  // Media Files Management - All users can view their own files
  {
    title: 'File Saya',
    href: '/media-files',
    icon: FolderOpen,
    allowedRoles: ['admin', 'guru', 'kepala_sekolah'],
  },

];

// Helper function to get appropriate menu items based on user roles
export const getMenuItemsForUser = (userRoles: string[]): SidebarItem[] => {
  // If user has roles, combine basic items with filtered items
  const items = filterMenuByRoles(appMenuItems, userRoles);
  return [...items];
};

// Helper function to filter menu items based on user roles
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
  userRoles: string[],
  menuItems: SidebarItem[] = appMenuItems
): boolean => {
  for (const item of menuItems) {
    // Check direct match
    if (item.href === path) {
      // If allowedRoles is empty, allow access to all authenticated users
      if (item.allowedRoles.length === 0) {
        return true;
      }
      return item.allowedRoles.some(role => userRoles.includes(role));
    }

    // Check children
    if (item.children) {
      const childAccess = hasRouteAccess(path, userRoles, item.children);
      if (childAccess !== null) return childAccess;
    }
  }
  return false;
};

// Default export for backward compatibility
export default appMenuItems;