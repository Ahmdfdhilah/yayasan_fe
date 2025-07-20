import React from 'react';
import { ExternalLink } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';

interface FileUrls {
  view_url?: string;
  file_url?: string;
  download_url?: string;
}

interface FileViewLinkProps {
  hasFile: boolean;
  fileUrls?: FileUrls;
  fileName?: string;
  className?: string;
  linkText?: string;
  showIcon?: boolean;
}

const FileViewLink: React.FC<FileViewLinkProps> = ({
  hasFile,
  fileUrls,
  fileName,
  className = "text-blue-600 hover:text-blue-800 underline",
  linkText = "Lihat Dokumen",
  showIcon = false,
}) => {
  if (!hasFile || !fileUrls?.view_url) {
    return <span className="text-muted-foreground">Tidak ada file</span>;
  }

  return (
    <a
      href={`${API_BASE_URL}${fileUrls.file_url}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 ${className}`}
      title={fileName ? `Lihat ${fileName}` : linkText}
    >
      {linkText}
      {showIcon && <ExternalLink className="w-3 h-3" />}
    </a>
  );
};

export default FileViewLink;