import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog';
import {
  FileText,
} from 'lucide-react';
import { useToast } from '@workspace/ui/components/sonner';
import { RPPSubmissionItemResponse, RPPSubmissionStatus } from '@/services/rpp-submissions/types';
import { RPPFileUploadDialog } from './RPPFileUploadDialog';
import { EditRPPItemDialog } from './EditRPPItemDialog';
import { mediaFileService } from '@/services/media-files/service';
import { rppSubmissionService } from '@/services';
import { API_BASE_URL } from '@/config/api';
import ActionDropdown from '@/components/common/ActionDropdown';

interface RPPItemCardProps {
  item: RPPSubmissionItemResponse;
  canUpload: boolean;
  submissionStatus: RPPSubmissionStatus;
  onFileUploaded: () => void;
  onItemDeleted?: () => void;
}

export const RPPItemCard: React.FC<RPPItemCardProps> = ({
  item,
  canUpload,
  onFileUploaded,
  onItemDeleted
}) => {
  const { toast } = useToast();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleUploadClick = () => {
    setUploadDialogOpen(true);
  };

  const handleEditClick = () => {
    setEditDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await rppSubmissionService.deleteRPPSubmissionItem(item.id);
      
      toast({
        title: 'Berhasil',
        description: 'Item RPP berhasil dihapus.',
      });

      setDeleteDialogOpen(false);
      if (onItemDeleted) {
        onItemDeleted();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus item RPP.',
        variant: 'destructive'
      });
      setDeleteDialogOpen(false);
    }
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
            <CardTitle className="text-lg">{item.name}</CardTitle>
            <Badge variant={item.is_uploaded ? "default" : "secondary"}>
              {item.is_uploaded ? "Sudah di Upload" : "Belum Upload"}
            </Badge>
          </div>
          {item.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {item.description}
            </p>
          )}
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

              {(item.is_uploaded || canUpload) && (
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
                    ] : []),
                    ...(canUpload ? [
                      {
                        label: 'Edit Item',
                        onClick: handleEditClick,
                        icon: 'Edit'
                      }
                    ] : []),
                    ...(canUpload && onItemDeleted ? [
                      {
                        label: 'Hapus Item',
                        onClick: handleDeleteClick,
                        icon: 'Trash2'
                      }
                    ] : [])
                  ]}
                  showView={item.is_uploaded}
                  showEdit={false}
                  showDelete={false}
                />
              )}
            </div>

            {item.uploaded_at && (
              <p className="text-xs">
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
        itemId={item.id}
        title={item.name}
        currentFileName={item.file_name || undefined}
      />

      <EditRPPItemDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        item={item}
        onSuccess={onFileUploaded} // Same callback to refresh data
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Item RPP</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus item RPP "{item.name}"? 
              {item.is_uploaded && " File yang sudah diupload juga akan terhapus."}
              <br />
              <br />
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};