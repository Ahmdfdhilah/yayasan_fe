import { Link, LinkProps } from 'react-router-dom';
import { useScrollToTop } from '@/hooks/useScrollToTop';

interface ScrollToTopLinkProps extends LinkProps {
  children: React.ReactNode;
}

export function ScrollToTopLink({ children, onClick, ...props }: ScrollToTopLinkProps) {
  const scrollToTop = useScrollToTop();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    scrollToTop();
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