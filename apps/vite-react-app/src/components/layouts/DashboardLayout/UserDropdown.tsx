// apps/vite-react-app/src/components/layouts/DashboardLayout/UserDropdown.tsx
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@workspace/ui/components/button';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@workspace/ui/components/dropdown-menu';
import {
  ChevronDown,
  LogOut,
  User,
  Loader2,
  Moon,
  Sun,
} from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { useState } from 'react';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/components/Auth/AuthProvider';
import { useTheme } from '@/hooks/useTheme';
import { Switch } from '@workspace/ui/components/switch';

interface UserDropdownProps {
  collapsed?: boolean;
  className?: string;
}

export function UserDropdown({ collapsed = false, className }: UserDropdownProps) {
  const { user, logout, loading } = useAuth();
  const { currentRole } = useRole();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigate = useNavigate();

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    const name = user?.profile?.name || user?.display_name || user?.full_name;
    if (!name) return 'U';
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  // Get user display name
  const getUserDisplayName = () => {
    return user?.profile?.name || user?.display_name || user?.full_name || 'User';
  };

  // Get user role display
  const getUserRole = () => {
    switch (currentRole) {
      case 'admin':
        return 'Administrator';
      case 'guru':
        return 'Guru';
      case 'kepala_sekolah':
        return 'Kepala Sekolah';
      default:
        return currentRole;
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user || loading) {
    return (
      <div className={cn("flex", collapsed ? "justify-center" : "justify-start", className)}>
        <div className="animate-pulse">
          <div className="h-8 w-8 bg-muted rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex", collapsed ? "justify-center" : "justify-start", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "hover:bg-transparent",
              collapsed ? "p-1.5 flex items-center justify-center h-auto" : "p-2 flex items-center space-x-2 w-full"
            )}
            disabled={isLoggingOut}
          >
            <div className="relative">
              <Avatar className={cn("flex-shrink-0", collapsed ? "h-5 w-5" : "h-6 w-6")}>
                <AvatarFallback className={cn(collapsed ? "text-[10px]" : "text-xs")}>
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              {/* Active user indicator */}
              {user.status === 'active' && (
                <div className={cn(
                  "absolute bg-green-500 rounded-full border border-background",
                  collapsed ? "-top-0.5 -right-0.5 h-2 w-2" : "-top-1 -right-1 h-3 w-3"
                )}></div>
              )}
            </div>
            {!collapsed && (
              <>
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="text-sm font-medium text-sidebar-foreground truncate w-full">
                    {getUserDisplayName()}
                  </span>
                  <div className="flex items-center gap-1 w-full">
                    <span className="text-xs text-muted-foreground truncate">
                      {getUserRole()}
                    </span>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align={collapsed ? "start" : "end"} className="w-56" side={collapsed ? "right" : "bottom"}>
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <span className="font-medium truncate" title={getUserDisplayName()}>
                {getUserDisplayName()}
              </span>
              {user.email && (
                <span className="text-xs text-muted-foreground truncate" title={user.email}>
                  {user.email}
                </span>
              )}
              <span className="text-xs text-muted-foreground truncate" title={getUserRole()}>
                {getUserRole()}
              </span>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link to="/profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center justify-between" onClick={(e) => e.preventDefault()}>
            <div className="flex items-center">
              {isDarkMode ? (
                <Moon className="mr-2 h-4 w-4" />
              ) : (
                <Sun className="mr-2 h-4 w-4" />
              )}
              <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <Switch
              checked={isDarkMode}
              onCheckedChange={toggleTheme}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="ml-2"
            />
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Signing out...</span>
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}