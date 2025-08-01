import { useTheme } from '@/hooks/useTheme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // This will initialize theme detection and apply it to the document
  useTheme();
  
  return <>{children}</>;
}