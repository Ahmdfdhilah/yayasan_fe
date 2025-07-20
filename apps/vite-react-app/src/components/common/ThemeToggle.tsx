import { Switch } from '@workspace/ui/components/switch';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@workspace/ui/lib/utils';

interface ThemeToggleProps {
  className?: string;
  collapsed?: boolean;
}

export function ThemeToggle({ className, collapsed = false }: ThemeToggleProps) {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className={cn(
      "flex items-center",
      collapsed ? "flex-col space-y-1" : "space-x-2",
      className
    )}>
      {isDarkMode ? (
        <Moon className="h-4 w-4 flex-shrink-0" />
      ) : (
        <Sun className="h-4 w-4 flex-shrink-0" />
      )}
      <Switch
        checked={isDarkMode}
        onCheckedChange={toggleTheme}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        className={cn(collapsed && "scale-75")}
      />
    </div>
  );
}