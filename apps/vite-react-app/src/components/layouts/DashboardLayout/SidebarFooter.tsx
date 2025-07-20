import { ThemeToggle } from '@/components/common/ThemeToggle';
import { UserDropdown } from './UserDropdown';
import { cn } from '@workspace/ui/lib/utils';

interface SidebarFooterProps {
  collapsed: boolean;
}

export function SidebarFooter({ collapsed }: SidebarFooterProps) {


  return (
    <>
      <div className={cn("border-t border-sidebar-border flex-shrink-0 mt-auto", collapsed ? "p-2 space-y-2" : "p-4 pt-3 space-y-3")}>
        <div className={cn("flex", collapsed ? "justify-center" : "items-center justify-between")}>
          <div className={cn("flex", collapsed ? "justify-center" : "justify-start")}>
            <ThemeToggle collapsed={collapsed} />
          </div>
        </div>

        <UserDropdown collapsed={collapsed} />
      </div>
    </>
  );
}