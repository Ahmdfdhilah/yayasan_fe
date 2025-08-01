import { Link } from 'react-router-dom';
import { Button } from "@workspace/ui/components/button";
import { Share2 } from 'lucide-react';

interface DetailPageFooterProps {
  onShare?: () => void;
  shareLabel?: string;
  backPath: string;
  backLabel: string;
  showShare?: boolean;
}

export function DetailPageFooter({ 
  onShare, 
  shareLabel = "Bagikan", 
  backPath, 
  backLabel,
  showShare = true 
}: DetailPageFooterProps) {
  return (
    <footer className="border-t pt-8">
      <div className="flex items-center justify-between">
        {showShare && onShare && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Bagikan:</span>
            <Button variant="outline" size="sm" onClick={onShare}>
              <Share2 className="w-4 h-4 mr-2" />
              {shareLabel}
            </Button>
          </div>
        )}
        
        <Link to={backPath} className={!showShare || !onShare ? "ml-auto" : ""}>
          <Button variant="outline">
            {backLabel}
          </Button>
        </Link>
      </div>
    </footer>
  );
}