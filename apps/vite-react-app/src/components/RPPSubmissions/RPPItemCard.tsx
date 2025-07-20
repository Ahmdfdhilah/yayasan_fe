import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { 
  Eye, 
  Upload, 
  FileText, 
  Download 
} from 'lucide-react';
import { useToast } from '@workspace/ui/components/sonner';
import { RPPSubmissionItemResponse, RPPSubmissionStatus } from '@/services/rpp-submissions/types';
import { RPPFileUploadDialog } from './RPPFileUploadDialog';
import { fileUtils } from '@/utils/fileUtils';

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

  const handleViewFile = () => {
    if (!item.file_id) {
      toast({
        title: 'Error',
        description: 'File ID tidak ditemukan.',
        variant: 'destructive'
      });
      return;
    }

    try {
      fileUtils.viewFile(item.file_id);
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
      await fileUtils.downloadFile(item.file_id, item.file_name || undefined);
      toast({
        title: 'Berhasil',
        description: 'File berhasil didownload.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal mendownload file.',
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
            {item.is_uploaded ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{item.file_name}</span>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleViewFile}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Lihat
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDownloadFile}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Belum ada file yang diupload</p>
              </div>
            )}

            {canUpload && (
              <div className="flex justify-end">
                <Button
                  variant={item.is_uploaded ? "outline" : "default"}
                  size="sm"
                  onClick={handleUploadClick}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  {item.is_uploaded ? "Ganti File" : "Upload File"}
                </Button>
              </div>
            )}

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