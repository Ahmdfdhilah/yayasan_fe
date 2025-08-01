import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setTheme } from '@/redux/features/themeSlice';
import { RootState } from '@/redux/store';

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state: RootState) => state.theme.isDarkMode);

  useEffect(() => {
    // Update document class when theme changes
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Listen for system theme changes and sync automatically
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      dispatch(setTheme(e.matches));
    };

    // Set initial theme based on system preference
    dispatch(setTheme(mediaQuery.matches));

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [dispatch]);

  return {
    isDarkMode
  };
};