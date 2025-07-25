import React from 'react';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@workspace/ui/components/select';
import { MediaFileFilterParams } from '@/services/media-files/types';

interface MediaFilesFilteringProps {
  filters: MediaFileFilterParams;
  onFiltersChange: (filters: Partial<MediaFileFilterParams>) => void;
}

const MediaFilesFiltering: React.FC<MediaFilesFilteringProps> = ({
  filters,
  onFiltersChange
}) => {

  const fileSizeOptions = [
    { value: '1048576', label: '< 1 MB' },    // 1MB
    { value: '10485760', label: '< 10 MB' },  // 10MB
    { value: '52428800', label: '< 50 MB' },  // 50MB
    { value: '104857600', label: '< 100 MB' }, // 100MB
  ];

  const sortOptions = [
    { value: 'created_at', label: 'Tanggal Upload' },
    { value: 'file_name', label: 'Nama File' },
    { value: 'file_size', label: 'Ukuran File' },
    { value: 'file_type', label: 'Jenis File' }
  ];

  return (
    <>
      {/* File Size Filter */}
      <div className="space-y-2">
        <Label htmlFor="size-filter">Ukuran Maksimal</Label>
        <Select 
          value={filters.max_size?.toString() || 'all'} 
          onValueChange={(value) => 
            onFiltersChange({ 
              max_size: value === 'all' ? undefined : parseInt(value) 
            })
          }
        >
          <SelectTrigger id="size-filter">
            <SelectValue placeholder="Semua Ukuran" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Ukuran</SelectItem>
            {fileSizeOptions.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <Label htmlFor="sort-filter">Urutkan Berdasarkan</Label>
        <Select 
          value={filters.sort_by || 'created_at'} 
          onValueChange={(value) => onFiltersChange({ sort_by: value })}
        >
          <SelectTrigger id="sort-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((sort) => (
              <SelectItem key={sort.value} value={sort.value}>
                {sort.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort Order */}
      <div className="space-y-2">
        <Label htmlFor="order-filter">Urutan</Label>
        <Select 
          value={filters.sort_order || 'desc'} 
          onValueChange={(value: 'asc' | 'desc') => onFiltersChange({ sort_order: value })}
        >
          <SelectTrigger id="order-filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Terbaru</SelectItem>
            <SelectItem value="asc">Terlama</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default MediaFilesFiltering;