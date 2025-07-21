import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { 
  FileText
} from 'lucide-react';
import { useToast } from '@workspace/ui/components/sonner';
import { RPPSubmissionItemResponse, RPPSubmissionStatus } from '@/services/rpp-submissions/types';
import { RPPFileUploadDialog } from './RPPFileUploadDialog';
import { mediaFileService } from '@/services/media-files/service';
import { API_BASE_URL } from '@/config/api';
import ActionDropdown from '@/components/common/ActionDropdown';

interface RPPItemCardProps {
  item: RPPSubmissionItemResponse;
  canUpload: boolean;
  submissionStatus: RPPSubmissionStatus;
  onFileUploaded: () => void;
}

export const RPPItemCard: React.FC<RPPItemCardProps> = ({
  item,
  canUpload,
  onFileUploaded
}) => {
  const { toast } = useToast();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const handleUploadClick = () => {
    setUploadDialogOpen(true);
  };

  const handleViewFile = async () => {
    if (!item.file_id) {
      toast({
        title: 'Error',
        description: 'File ID tidak ditemukan.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const viewInfo = await mediaFileService.getFileViewInfo(item.file_id);
      const view_url = `${API_BASE_URL}${viewInfo.view_url}`;

      if (view_url) {
        window.open(view_url, '_blank');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal membuka file.',
        variant: 'destructive'
      });
    }
  };

  const handleDownloadFile = async () => {
    if (!item.file_id) {
      toast({
        title: 'Error',
        description: 'File ID tidak ditemukan.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const blob = await mediaFileService.downloadFile(item.file_id);
      
      if (blob.size === 0) {
        throw new Error('File is empty');
      }
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = item.file_name || 'downloaded-file';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: 'Berhasil',
        description: 'File berhasil didownload.',
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Error',
        description: `Gagal mendownload file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{item.rpp_type_display_name}</CardTitle>
            <Badge variant={item.is_uploaded ? "default" : "secondary"}>
              {item.is_uploaded ? "Uploaded" : "Belum Upload"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className={`h-4 w-4 ${item.is_uploaded ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="text-sm">
                  {item.is_uploaded ? item.file_name : 'Belum ada file yang diupload'}
                </span>
              </div>
              
              <ActionDropdown
                onView={item.is_uploaded ? handleViewFile : undefined}
                customActions={[
                  ...(item.is_uploaded ? [
                    {
                      label: 'Download',
                      onClick: handleDownloadFile,
                      icon: 'Download'
                    }
                  ] : []),
                  ...(canUpload ? [
                    {
                      label: item.is_uploaded ? 'Ganti File' : 'Upload File',
                      onClick: handleUploadClick,
                      icon: 'Upload'
                    }
                  ] : [])
                ]}
                showView={item.is_uploaded}
                showEdit={false}
                showDelete={false}
              />
            </div>

            {item.uploaded_at && (
              <p className="text-xs text-gray-500">
                Diupload: {new Date(item.uploaded_at).toLocaleString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <RPPFileUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSuccess={onFileUploaded}
        periodId={item.period_id}
        rppType={item.rpp_type}
        rppTypeDisplayName={item.rpp_type_display_name}
        currentFileName={item.file_name || undefined}
      />
    </>
  );
};