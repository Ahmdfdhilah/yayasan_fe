import { AlertTriangle, FileInput, Grid2X2, Mail, MailWarningIcon, PhoneIncoming, PhoneOutgoing, Users, ClipboardList, ClipboardCopyIcon, CheckSquare } from "lucide-react";

// Role definitions - UPPERCASE to match backend
export type UserRole =
  | 'ADMIN'
  | 'INSPEKTORAT'
  | 'PERWADAG';

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

  // Risk Assessment - Only ADMIN and INSPEKTORAT
  {
    title: 'Penilaian Risiko',
    href: '/penilaian-resiko',
    icon: AlertTriangle,
    allowedRoles: ['ADMIN'],
  },
  // Surat Tugas - All roles
  {
    title: 'Surat Tugas',
    href: '/surat-tugas',
    icon: Mail,
    allowedRoles: ['ADMIN', 'INSPEKTORAT', 'PERWADAG'],
  },
  // Surat Pemberitahuan - All roles
  {
    title: 'Surat Pemberitahuan',
    href: '/surat-pemberitahuan',
    icon: MailWarningIcon,
    allowedRoles: ['ADMIN', 'INSPEKTORAT', 'PERWADAG'],
  },
    // Kuesioner - All roles
    {
      title: 'Kuesioner',
      href: '/kuesioner',
      icon: ClipboardList,
      allowedRoles: ['ADMIN', 'INSPEKTORAT', 'PERWADAG'],
    },
  
  // Entry Meeting - All roles
  {
    title: 'Entry Meeting',
    href: '/entry-meeting',
    icon: PhoneIncoming,
    allowedRoles: ['ADMIN', 'INSPEKTORAT', 'PERWADAG'],
  },

  // Konfirmasi Meeting - All roles
  {
    title: 'Konfirmasi Meeting',
    href: '/konfirmasi-meeting',
    icon: CheckSquare,
    allowedRoles: ['ADMIN', 'INSPEKTORAT', 'PERWADAG'],
  },
  // Matriks - All roles
  {
    title: 'Matriks',
    href: '/matriks',
    icon: Grid2X2,
    allowedRoles: ['ADMIN', 'INSPEKTORAT', 'PERWADAG'],
  },

  // Exit Meeting - All roles
  {
    title: 'Exit Meeting',
    href: '/exit-meeting',
    icon: PhoneOutgoing,
    allowedRoles: ['ADMIN', 'INSPEKTORAT', 'PERWADAG'],
  },



  // Laporan Hasil - All roles
  {
    title: 'Laporan Hasil',
    href: '/laporan-hasil',
    icon: FileInput,
    allowedRoles: ['ADMIN'],
  },

  // Template Kuesioner - All roles
  {
    title: 'Template Kuesioner',
    href: '/template-kuesioner',
    icon: ClipboardCopyIcon,
    allowedRoles: ['ADMIN'],
  },

  // User Management - ADMIN only
  {
    title: 'Manajemen User',
    href: '/users',
    icon: Users,
    allowedRoles: ['ADMIN'],
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