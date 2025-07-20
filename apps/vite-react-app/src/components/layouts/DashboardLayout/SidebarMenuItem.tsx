
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';

// Generic SidebarItem interface that supports both menu types
interface GenericSidebarItem {
  title: string;
  href?: string;
  icon: any;
  children?: GenericSidebarItem[];
  isPlaceholder?: boolean;
  allowedRoles?: string[]; // Optional
  badge?: string; // Optional 
}

interface SidebarMenuItemProps {
  item: GenericSidebarItem;
  collapsed: boolean;
  expandedMenus: string[];
  onToggleSubmenu: (title: string) => void;
  onMenuClick: (item: GenericSidebarItem) => void;
  onLinkClick: () => void;
}

export function SidebarMenuItem({ 
  item, 
  collapsed, 
  expandedMenus, 
  onMenuClick, 
  onLinkClick 
}: SidebarMenuItemProps) {
  const location = useLocation();
  
  const isMenuExpanded = (title: string) => expandedMenus.includes(title);
  
  const isActive = (item: GenericSidebarItem): boolean => {
    if (item.href && location.pathname === item.href) return true;
    if (item.children) {
      return item.children.some(child => location.pathname === child.href);
    }
    return false;
  };

  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = hasChildren && isMenuExpanded(item.title);
  const menuIsActive = isActive(item);

  if (hasChildren) {
    return (
      <div className="mb-2">
        <button
          onClick={() => onMenuClick(item)}
          className={cn(
            'flex items-center w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            collapsed ? 'justify-center' : 'justify-between',
            menuIsActive
              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
              : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
          )}
          title={collapsed ? item.title : undefined}
        >
          <div className={cn('flex items-center', collapsed ? 'justify-center' : 'space-x-3')}>
            <item.icon className={cn("flex-shrink-0", collapsed ? "h-4 w-4" : "h-5 w-5")} />
            {!collapsed && <span>{item.title}</span>}
          </div>
          {!collapsed && hasChildren && (
            <ChevronDown className={cn('h-4 w-4 transition-transform flex-shrink-0', isExpanded && 'rotate-180')} />
          )}
        </button>

        {!collapsed && hasChildren && isExpanded && (
          <div className="ml-6 mt-1 space-y-1">
            {item.children!.map((child) => (
              <Link
                key={child.href}
                to={child.href!}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  location.pathname === child.href
                    ? 'bg-sidebar-primary/80 text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/30 hover:text-sidebar-accent-foreground'
                )}
                onClick={onLinkClick}
              >
                <child.icon className="h-4 w-4 flex-shrink-0" />
                <span>{child.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-2">
      <Link
        to={item.href!}
        className={cn(
          'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          collapsed ? 'justify-center' : 'space-x-3',
          menuIsActive
            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
        )}
        onClick={onLinkClick}
        title={collapsed ? item.title : undefined}
      >
        <item.icon className={cn("flex-shrink-0", collapsed ? "h-4 w-4" : "h-5 w-5")} />
        {!collapsed && <span>{item.title}</span>}
      </Link>
    </div>
  );
}