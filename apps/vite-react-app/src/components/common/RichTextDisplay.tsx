import { renderRichText } from '@/utils/textUtils';
import { cn } from '@workspace/ui/lib/utils';

interface RichTextDisplayProps {
  content?: string;
  isDetailView?: boolean;
  maxLength?: number;
  className?: string;
  fallback?: string;
}

/**
 * Component for safely displaying rich text content
 * - In detail views: renders full HTML with formatting
 * - In list/card views: renders truncated plain text
 */
export function RichTextDisplay({ 
  content = '', 
  isDetailView = false, 
  maxLength = 150, 
  className = '',
  fallback = 'No description available'
}: RichTextDisplayProps) {
  const rendered = renderRichText(content, { isDetailView, maxLength, className });

  if (rendered.isEmpty) {
    return (
      <span className={cn("text-muted-foreground italic", className)}>
        {fallback}
      </span>
    );
  }

  if (rendered.isHtml && isDetailView) {
    return (
      <div 
        className={cn(
          "prose prose-sm max-w-none",
          "prose-headings:font-semibold prose-headings:text-foreground",
          "prose-p:text-foreground prose-p:leading-relaxed",
          "prose-strong:text-foreground prose-strong:font-semibold",
          "prose-ul:text-foreground prose-ol:text-foreground",
          "prose-li:text-foreground",
          "prose-blockquote:text-muted-foreground prose-blockquote:border-l-border",
          "prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
          rendered.className
        )}
        dangerouslySetInnerHTML={{ __html: rendered.content }}
      />
    );
  }

  return (
    <span className={cn("leading-relaxed", rendered.className)}>
      {rendered.content}
    </span>
  );
}