import React from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import {
  Download,
  Eye,
  User,
  Calendar,
  HardDrive,
  DownloadCloudIcon
} from 'lucide-react';
import { MediaFileResponse } from '@/services/media-files/types';
import { useToast } from '@workspace/ui/components/sonner';
import { mediaFileService } from '@/services/media-files';

interface MediaFileCardProps {
  file: MediaFileResponse;
  onView?: (file: MediaFileResponse) => void;
}

const MediaFileCard: React.FC<MediaFileCardProps> = ({ file, onView }) => {
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      const blob = await mediaFileService.downloadFile(file.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.file_name;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast({
        title: 'Download Berhasil',
        description: `File "${file.display_name}" berhasil didownload.`
      });
    } catch (error: any) {
      toast({
        title: 'Download Gagal',
        description: error.message || 'Gagal mendownload file.',
        variant: 'destructive'
      });
    }
  };

  const handleView = async () => {
    if (onView) {
      onView(file);
    } else {
      try {
        const viewInfo = await mediaFileService.getFileViewInfo(file.id);
        window.open(viewInfo.view_url, '_blank');
      } catch (error: any) {
        toast({
          title: 'Gagal Membuka File',
          description: error.message || 'Tidak dapat membuka file untuk preview.',
          variant: 'destructive'
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* File Icon */}
          <div className="flex-shrink-0">
            <DownloadCloudIcon />
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium text-foreground truncate" title={file.display_name}>
                {file.display_name}
              </h3>
              <Badge
                variant="secondary"
              >
                {file.file_category}
              </Badge>
              {file.is_public && (
                <Badge variant="outline" className="text-green-600 border-green-300">
                  Public
                </Badge>
              )}
            </div>

            {/* File Details */}
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  <span>{file.file_size_formatted}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-xs px-1 py-0.5 bg-muted rounded">
                    .{file.extension}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {file.uploader_name && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{file.uploader_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(file.created_at)}</span>
                </div>
              </div>

              {file.organization_name && (
                <div className="text-xs text-muted-foreground">
                  Sekolah: {file.organization_name}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex gap-2">
            {file.can_preview && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleView}
                title="Lihat file"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              title="Unduh file"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaFileCard;