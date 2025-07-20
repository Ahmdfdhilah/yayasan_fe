import React, { useState } from 'react';
import { useToast } from '@workspace/ui/components/sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { RPPType } from '@/services/rpp-submissions/types';
import { rppSubmissionService, mediaFileService } from '@/services';
import FileUpload from '@/components/common/FileUpload';

interface RPPFileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  periodId: number;
  rppType: RPPType;
  rppTypeDisplayName: string;
  currentFileName?: string;
}

export const RPPFileUploadDialog: React.FC<RPPFileUploadDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  periodId,
  rppType,
  rppTypeDisplayName,
  currentFileName
}) => {
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleClose = () => {
    if (!uploading) {
      setSelectedFiles([]);
      onOpenChange(false);
    }
  };

  const handleFilesChange = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: 'Error',
        description: 'Pilih file terlebih dahulu.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setUploading(true);
      
      const file = selectedFiles[0];
      
      // Validate file before upload
      const validationError = mediaFileService.validateFile(file, 10 * 1024 * 1024); // 10MB limit
      if (validationError) {
        throw new Error(validationError);
      }
      
      // Upload file using media files service
      const uploadResult = await mediaFileService.uploadFile({
        file,
        is_public: false // RPP files are private
      });
      
      const fileId = uploadResult.id;
      
      if (!fileId) {
        throw new Error('File ID not returned from upload');
      }
      
      // Associate the file with the RPP submission
      await rppSubmissionService.uploadRPPFile(periodId, rppType, {
        file_id: fileId
      });

      toast({
        title: 'Berhasil',
        description: `File ${rppTypeDisplayName} berhasil diupload.`,
      });

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error uploading RPP file:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal upload file RPP.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Upload {rppTypeDisplayName}</span>
          </DialogTitle>
          <DialogDescription>
            {currentFileName 
              ? `Pilih file baru untuk mengganti "${currentFileName}"`
              : `Pilih file untuk ${rppTypeDisplayName}`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <FileUpload
            accept=".pdf,.doc,.docx"
            maxSize={10 * 1024 * 1024}
            multiple={false}
            onFilesChange={handleFilesChange}
            label="Pilih File RPP"
            description="File yang diterima: PDF, DOC, DOCX (maksimal 10MB)"
            dragAndDrop={true}
            showPreview={true}
          />
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={uploading}
          >
            Batal
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Mengupload...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};