import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { RichTextDisplay } from './RichTextDisplay';

interface ImageViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  image: {
    src: string;
    alt: string;
    title?: string;
  };
  description?: string;
}

export const ImageViewDialog: React.FC<ImageViewDialogProps> = ({
  open,
  onOpenChange,
  image,
  description,
}) => {


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-scroll p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              {image.title || image.alt}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex flex-col h-full">
          {/* Image Section */}
          <div className="flex-1 flex items-center justify-center p-6 bg-muted/20">
            <div className="relative w-full h-full max-w-[30vw] lg:max-w-[50vw]">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-contain rounded-lg"
                loading="lazy"
              />
            </div>
          </div>

          {/* Description Section */}
          {description && (
            <div className="p-6 bg-background border-t lg:border-t-0 lg:border-l">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Deskripsi</h3>
                <div className="text-sm text-muted-foreground leading-relaxed">
                  <RichTextDisplay isDetailView={true} content={description} />
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewDialog;