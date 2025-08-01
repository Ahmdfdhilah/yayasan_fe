import { useCallback } from 'react';

interface ShareData {
  title: string;
  text?: string;
  url?: string;
}

export function useShareHandler() {
  const handleShare = useCallback(async (data: ShareData) => {
    const shareData = {
      title: data.title,
      text: data.text || '',
      url: data.url || window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Fallback to copying URL if share fails
        navigator.clipboard.writeText(shareData.url);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(shareData.url);
    }
  }, []);

  return handleShare;
}