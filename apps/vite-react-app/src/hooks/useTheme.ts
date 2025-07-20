import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { toggleTheme, setTheme } from '@/redux/features/themeSlice';
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

  return {
    isDarkMode,
    toggleTheme: () => dispatch(toggleTheme()),
    setDarkMode: (value: boolean) => dispatch(setTheme(value))
  };
};