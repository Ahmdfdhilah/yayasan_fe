import { Button } from '@workspace/ui/components/button';
import { UserDropdown } from './UserDropdown';
import { Menu } from 'lucide-react';

interface MobileHeaderProps {
  onOpenSidebar: () => void;
}

export function MobileHeader({ onOpenSidebar }: MobileHeaderProps) {

  return (
    <>
      <header className="sticky top-0 z-40 flex h-12 sm:h-14 shrink-0 items-center justify-between border-b border-border bg-background px-3 sm:px-4 shadow-sm lg:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenSidebar}
          className="h-8 w-8 sm:h-9 sm:w-9 p-0">
          <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>

        <div className="flex items-center gap-x-2">
          <UserDropdown collapsed={true} className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center" />
        </div>
      </header>
    </>
  );
}