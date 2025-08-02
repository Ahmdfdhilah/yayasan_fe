import React from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { Building2, Calendar } from 'lucide-react';
import ActionDropdown from '@/components/common/ActionDropdown';
import { RichTextDisplay } from '@/components/common/RichTextDisplay';
import { Mitra } from '@/services/mitra/types';
import { getNewsImageUrl } from '@/utils/imageUtils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface MitraCardsProps {
  mitras: Mitra[];
  loading: boolean;
  onView: (mitra: Mitra) => void;
  onEdit: (mitra: Mitra) => void;
  onDelete: (mitra: Mitra) => void;
}

const MitraCardSkeleton = () => (
  <Card>
    <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted">
      <Skeleton className="w-full h-full" />
    </div>
    <CardContent className="p-4">
      <div className="flex justify-between items-start mb-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-3" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
      </div>
    </CardContent>
  </Card>
);

export const MitraCards: React.FC<MitraCardsProps> = ({
  mitras,
  loading,
  onView,
  onEdit,
  onDelete
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <MitraCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (mitras.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Tidak ada mitra ditemukan
        </h3>
        <p className="text-muted-foreground">
          Belum ada data mitra yang tersedia saat ini.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mitras.map((mitra) => (
        <Card key={mitra.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          {/* Image */}
          <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted">
            {mitra.img_url ? (
              <img
                src={getNewsImageUrl(mitra.img_url)}
                alt={mitra.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://picsum.photos/400/225?random=${mitra.id}`;
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building2 className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
          </div>

          <CardContent className="p-4">
            {/* Header with actions */}
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {mitra.title}
              </h3>
              <ActionDropdown
                onView={() => onView(mitra)}
                onEdit={() => onEdit(mitra)}
                onDelete={() => onDelete(mitra)}
              />
            </div>

            {/* Description */}
            {mitra.description && (
              <div className="text-sm text-muted-foreground mb-3 line-clamp-2">
                <RichTextDisplay content={mitra.description} />
              </div>
            )}

            {/* Meta info */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(mitra.created_at), 'dd MMM yyyy', { locale: id })}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};