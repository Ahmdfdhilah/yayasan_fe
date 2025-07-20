import { ReactNode, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sheet, SheetContent } from '@workspace/ui/components/sheet';

interface GenericSidebarItem {
  title: string;
  href?: string;
  icon: any;
  children?: GenericSidebarItem[];
  isPlaceholder?: boolean;
  allowedRoles?: string[];
  badge?: string;
}
import { cn } from '@workspace/ui/lib/utils';
import { SidebarContent } from './SidebarContent';
import { MobileHeader } from './MobileHeader';
import { DashboardFooter } from './DashboardFooter';

interface DashboardLayoutProps {
  children?: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleSubmenu = (title: string) => {
    setExpandedMenus(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const handleMenuClick = (item: GenericSidebarItem) => {
    if (item.children && item.children.length > 0) {
      if (isCollapsed) {
        setIsCollapsed(false);
      }
      toggleSubmenu(item.title);
    }
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLinkClick = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-muted/5">
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden md:fixed md:inset-y-0 md:z-50 md:flex md:flex-col transition-all duration-300",
        isCollapsed ? "md:w-20" : "md:w-64" 
      )}>
        <div className="flex grow flex-col gap-y-0 border-r border-sidebar-border bg-sidebar">
          <SidebarContent 
            collapsed={isCollapsed}
            expandedMenus={expandedMenus}
            onToggleCollapse={handleToggleCollapse}
            onToggleSubmenu={toggleSubmenu}
            onMenuClick={handleMenuClick}
            onLinkClick={handleLinkClick}
          />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent 
            collapsed={false}
            expandedMenus={expandedMenus}
            onToggleCollapse={handleToggleCollapse}
            onToggleSubmenu={toggleSubmenu}
            onMenuClick={handleMenuClick}
            onLinkClick={handleLinkClick}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className={cn(
        "min-h-screen flex flex-col transition-all duration-300",
        isCollapsed ? "md:pl-20" : "md:pl-64" 
      )}>
        <MobileHeader onOpenSidebar={() => setIsSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 min-h-0">
          <div className="py-3 lg:py-6 px-4 sm:px-6 lg:px-8">
            {children || <Outlet />}
          </div>
        </main>

        {/* Fixed Footer */}
        <div className="mt-auto">
          <DashboardFooter />
        </div>
      </div>
    </div>
  );
}