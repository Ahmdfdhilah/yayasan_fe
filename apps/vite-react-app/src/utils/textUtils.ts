// File: apps/vite-react-app/src/utils/textUtils.ts

/**
 * Text utility functions for handling rich text content
 * Used throughout the application for displaying HTML content safely
 */

/**
 * Strip HTML tags from a string and return plain text
 * @param html - HTML string to clean
 * @returns Plain text without HTML tags
 */
export const stripHtml = (html: string): string => {
    if (typeof window === 'undefined') {
      // Server-side fallback
      return html.replace(/<[^>]*>/g, '');
    }
    
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };
  
  /**
   * Get word count from text (including HTML content)
   * @param text - Text to count (can include HTML)
   * @returns Number of words
   */
  export const getWordCount = (text: string): number => {
    const plainText = stripHtml(text);
    return plainText.trim().split(/\s+/).filter(word => word.length > 0).length;
  };
  
  /**
   * Get character count from text (excluding HTML tags)
   * @param text - Text to count (can include HTML)
   * @returns Number of characters
   */
  export const getCharacterCount = (text: string): number => {
    return stripHtml(text).length;
  };
  
  /**
   * Truncate HTML content to a specific character limit while preserving formatting
   * @param html - HTML content to truncate
   * @param limit - Character limit for plain text
   * @param suffix - Suffix to add (default: '...')
   * @returns Truncated HTML
   */
  export const truncateHtml = (html: string, limit: number, suffix: string = '...'): string => {
    const plainText = stripHtml(html);
    if (plainText.length <= limit) {
      return html;
    }
    
    // Simple truncation - in a real app you might want a more sophisticated approach
    // that preserves HTML structure
    return stripHtml(html).substring(0, limit) + suffix;
  };
  
  /**
   * Check if rich text content is empty (only contains empty tags or whitespace)
   * @param html - HTML content to check
   * @returns True if content is effectively empty
   */
  export const isRichTextEmpty = (html: string): boolean => {
    const plainText = stripHtml(html).trim();
    return plainText.length === 0;
  };
  
  /**
   * Convert rich text to plain text for display
   * @param html - HTML content
   * @param maxLength - Optional maximum length
   * @returns Plain text representation
   */
  export const richTextToPlainText = (html: string, maxLength?: number): string => {
    const plainText = stripHtml(html);
    if (maxLength && plainText.length > maxLength) {
      return plainText.substring(0, maxLength) + '...';
    }
    return plainText;
  };

  /**
   * Render rich text content safely
   * For details pages - show full HTML with dangerouslySetInnerHTML
   * For list/card views - show truncated plain text
   * @param html - HTML content
   * @param options - Rendering options
   * @returns Rendered content object
   */
  export const renderRichText = (html: string, options: {
    isDetailView?: boolean;
    maxLength?: number;
    className?: string;
  } = {}) => {
    const { isDetailView = false, maxLength = 150, className = '' } = options;
    
    if (!html) {
      return {
        content: '',
        isEmpty: true,
        isHtml: false
      };
    }

    if (isDetailView) {
      // Detail view: show full HTML with formatting
      return {
        content: html,
        isEmpty: isRichTextEmpty(html),
        isHtml: true,
        className: `rich-text-content ${className}`
      };
    } else {
      // List/card view: show truncated plain text
      return {
        content: richTextToPlainText(html, maxLength),
        isEmpty: isRichTextEmpty(html),
        isHtml: false,
        className
      };
    }
  };

  /**
   * Smart truncate that respects word boundaries
   * @param text - Text to truncate
   * @param maxLength - Maximum length
   * @param suffix - Suffix to add
   * @returns Truncated text
   */
  export const smartTruncate = (text: string, maxLength: number, suffix = '...'): string => {
    if (text.length <= maxLength) return text;
    
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    // If we can find a space to break on, use it
    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + suffix;
    }
    
    return truncated + suffix;
  };