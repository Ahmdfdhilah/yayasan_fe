import { ReactNode, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@workspace/ui/components/sheet';

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
        "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300",
        isCollapsed ? "lg:w-[5rem]" : "lg:w-[16rem]" 
      )}>
        <div className="flex grow flex-col gap-y-0 border-r border-sidebar-border bg-sidebar min-h-full">
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
        <SheetContent side="left" className="p-0 w-[16rem] max-w-[80vw]">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
            <SheetDescription>Application navigation and menu options</SheetDescription>
          </SheetHeader>
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
        isCollapsed ? "lg:pl-[5rem]" : "lg:pl-[16rem]" 
      )}>
        <MobileHeader onOpenSidebar={() => setIsSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 min-h-0">
          <div className="py-3 lg:py-6 px-3 sm:px-4 lg:px-6 xl:px-8">
            {children || <Outlet />}
          </div>
        </main>

        {/* Footer */}
        <div className="mt-auto flex-shrink-0">
          <DashboardFooter />
        </div>
      </div>
    </div>
  );
}