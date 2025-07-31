import { ScrollArea, ScrollBar } from '@workspace/ui/components/scroll-area';
import { SidebarHeader } from './SidebarHeader';
import { SidebarFooter } from './SidebarFooter';
import { SidebarMenuItem } from './SidebarMenuItem';
import { getMenuItemsForUser } from '@/lib/menus';

interface SidebarItem {
  title: string;
  href?: string;
  icon: any;
  children?: SidebarItem[];
  isPlaceholder?: boolean;
  allowedRoles?: string[];
  badge?: string;
}
import { cn } from '@workspace/ui/lib/utils';
import { useMemo } from 'react';
import { useRole } from '@/hooks/useRole';

interface SidebarContentProps {
  collapsed?: boolean;
  expandedMenus: string[];
  onToggleCollapse: () => void;
  onToggleSubmenu: (title: string) => void;
  onMenuClick: (item: SidebarItem) => void;
  onLinkClick: () => void;
}

export function SidebarContent({ 
  collapsed = false, 
  expandedMenus,
  onToggleCollapse,
  onToggleSubmenu,
  onMenuClick,
  onLinkClick 
}: SidebarContentProps) {
  // Get current role
  const { currentRole } = useRole();
  
  // Get appropriate menu items based on current role
  const menuItems = useMemo(() => {
    return getMenuItemsForUser([currentRole]) as SidebarItem[];
  }, [currentRole]);

  return (
    <div className="flex h-full flex-col">
      <SidebarHeader 
        collapsed={collapsed} 
        onToggleCollapse={onToggleCollapse} 
      />

      <div className="flex-1 overflow-hidden min-h-0">
        <ScrollArea className="h-full">
          <div className={cn("p-3 pb-2", collapsed && "px-2")}>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem 
                  key={item.title} 
                  item={item} 
                  collapsed={collapsed}
                  expandedMenus={expandedMenus}
                  onToggleSubmenu={onToggleSubmenu}
                  onMenuClick={onMenuClick}
                  onLinkClick={onLinkClick}
                />
              ))}
            </nav>
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>

      <SidebarFooter collapsed={collapsed} />
    </div>
  );
}