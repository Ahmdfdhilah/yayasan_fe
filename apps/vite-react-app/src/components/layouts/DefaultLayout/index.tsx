import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

interface DefaultLayoutProps {
  children?: ReactNode;
}

export function DefaultLayout({ children }: DefaultLayoutProps) {

  return (
    < main className="flex-1" >
      {children || <Outlet />
      }
    </main >
  );
}