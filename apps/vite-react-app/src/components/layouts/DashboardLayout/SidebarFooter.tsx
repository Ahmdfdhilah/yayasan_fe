import { UserDropdown } from './UserDropdown';
import { cn } from '@workspace/ui/lib/utils';

interface SidebarFooterProps {
  collapsed: boolean;
}

export function SidebarFooter({ collapsed }: SidebarFooterProps) {


  return (
    <>
      <div className={cn("flex-shrink-0 mt-auto", collapsed ? "p-2" : "p-4 pt-3")}>
        <UserDropdown collapsed={collapsed} />
      </div>
    </>
  );
}