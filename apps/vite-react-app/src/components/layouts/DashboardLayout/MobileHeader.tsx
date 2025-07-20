import { Button } from '@workspace/ui/components/button';
import { UserDropdown } from './UserDropdown';
import { Menu } from 'lucide-react';

interface MobileHeaderProps {
  onOpenSidebar: () => void;
}

export function MobileHeader({ onOpenSidebar }: MobileHeaderProps) {


  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-3 shadow-sm md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenSidebar}
          className="h-8 w-8 p-0"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-x-2">
          <UserDropdown collapsed={true} className="h-8 w-8 flex items-center justify-center" />
        </div>
      </header>
    </>
  );
}