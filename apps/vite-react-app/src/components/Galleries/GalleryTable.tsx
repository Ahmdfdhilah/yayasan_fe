import React from 'react';
import { Gallery } from '@/services/galleries/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import ActionDropdown from '@/components/common/ActionDropdown';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { getThumbnailUrl } from '@/utils/imageUtils';

interface GalleryTableProps {
  galleries: Gallery[];
  loading?: boolean;
  onEdit: (gallery: Gallery) => void;
  onDelete: (gallery: Gallery) => void;
  onView: (gallery: Gallery) => void;
}

export const GalleryTable: React.FC<GalleryTableProps> = ({
  galleries, loading = false, onEdit, onDelete, onView
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Gambar</TableHead>
            <TableHead>Judul</TableHead>
            <TableHead>Urutan</TableHead>
            <TableHead>Dibuat</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Memuat Galeri...
              </TableCell>
            </TableRow>
          ) : galleries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Tidak ada Galeri ditemukan
              </TableCell>
            </TableRow>
          ) : (
            galleries.map((gallery) => (
              <TableRow key={gallery.id}>
                <TableCell>
                  <img src={getThumbnailUrl(gallery.img_url, 48)} alt={gallery.title} className="w-12 h-12 rounded object-cover" />
                </TableCell>
                <TableCell>
                  <div className="font-medium">{gallery.title}</div>
                  {gallery.excerpt && (
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {gallery.short_excerpt}
                    </div>
                  )}
                </TableCell>
                <TableCell>{gallery.display_order}</TableCell>
                <TableCell>
                  {format(new Date(gallery.created_at), 'dd MMM yyyy', { locale: id })}
                </TableCell>
                <TableCell className="text-right">
                  <ActionDropdown
                    onView={() => onView(gallery)}
                    onEdit={() => onEdit(gallery)}
                    onDelete={() => onDelete(gallery)}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};