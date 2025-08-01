import { Link } from 'react-router-dom';
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft, Share2 } from 'lucide-react';

interface DetailPageHeaderProps {
  backLabel: string;
  backPath: string;
  onShare?: () => void;
  showShare?: boolean;
}

export function DetailPageHeader({ 
  backLabel, 
  backPath, 
  onShare, 
  showShare = true 
}: DetailPageHeaderProps) {
  return (
    <div className="border-b bg-muted/20">
      <div className="px-4 lg:px-12 py-8 flex items-center justify-between">
        <Link to={backPath}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {backLabel}
          </Button>
        </Link>
        
        {showShare && onShare && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Bagikan
          </Button>
        )}
      </div>
    </div>
  );
}