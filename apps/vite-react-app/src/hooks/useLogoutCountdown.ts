import { useEffect, useRef } from 'react';
import { useAuth } from '@/components/Auth/AuthProvider';

interface UseLogoutCountdownProps {
  seconds?: number;
  reason?: string;
  onStart?: () => void;
  onComplete?: () => void;
}

export const useLogoutCountdown = ({
  seconds = 5,
  onStart,
  onComplete
}: UseLogoutCountdownProps = {}) => {
  const { logout } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startCountdown = () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    onStart?.();

    

    // No need for interval toast updates - just the timeout for logout

    // Auto logout after specified seconds
    timeoutRef.current = setTimeout(async () => {
      try {
        await logout();
        onComplete?.();
      } catch (error) {
        console.error('Auto logout error:', error);
      }
    }, seconds * 1000);
  };

  const cancelCountdown = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelCountdown();
    };
  }, []);

  return {
    startCountdown,
    cancelCountdown
  };
};