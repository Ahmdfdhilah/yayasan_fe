import { Link, LinkProps } from 'react-router-dom';
import { useScrollToTop } from '@/hooks/useScrollToTop';

interface MobileNavLinkProps extends LinkProps {
  children: React.ReactNode;
  onNavigate?: () => void;
}

export function MobileNavLink({ children, onClick, onNavigate, ...props }: MobileNavLinkProps) {
  const scrollToTop = useScrollToTop();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    scrollToTop();
    if (onNavigate) {
      onNavigate();
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link {...props} onClick={handleClick}>
      {children}
    </Link>
  );
}