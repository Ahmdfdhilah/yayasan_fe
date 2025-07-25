import React from 'react';
import { Gallery } from '@/services/galleries/types';
import { Card, CardContent } from '@workspace/ui/components/card';
import ActionDropdown from '@/components/common/ActionDropdown';
import { getThumbnailUrl } from '@/utils/imageUtils';

interface GalleryCardsProps {
  galleries: Gallery[];
  loading?: boolean;
  onEdit: (gallery: Gallery) => void;
  onDelete: (gallery: Gallery) => void;
  onView: (gallery: Gallery) => void;
}

export const GalleryCards: React.FC<GalleryCardsProps> = ({
  galleries, loading = false, onEdit, onDelete, onView
}) => {
  if (loading) {
    return (
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (galleries.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Tidak ada Galeri ditemukan
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {galleries.map((gallery) => (
        <Card key={gallery.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <img src={getThumbnailUrl(gallery.img_url, 64)} alt={gallery.title} className="w-16 h-16 rounded object-cover" />
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{gallery.title}</h3>
                  <div className="mt-1">
                    <span className="text-xs text-muted-foreground">Urutan: {gallery.display_order}</span>
                  </div>
                </div>
              </div>
              <ActionDropdown
                onView={() => onView(gallery)}
                onEdit={() => onEdit(gallery)}
                onDelete={() => onDelete(gallery)}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};