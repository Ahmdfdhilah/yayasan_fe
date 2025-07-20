import React from 'react';
import { Edit, Eye, Trash2, Mail, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Button } from '@workspace/ui/components/button';

interface ActionDropdownProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onComposeEmail?: () => void;
  onExport?: () => void;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showComposeEmail?: boolean;
  showExport?: boolean;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({
  onView,
  onEdit,
  onDelete,
  onComposeEmail,
  onExport,
  showView = true,
  showEdit = true,
  showDelete = true,
  showComposeEmail = false,
  showExport = false,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <Edit className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {showView && (
          <DropdownMenuItem onClick={onView}>
            <Eye className="mr-2 h-4 w-4" />
            Lihat
          </DropdownMenuItem>
        )}
        {showEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        {showComposeEmail && (
          <DropdownMenuItem onClick={onComposeEmail}>
            <Mail className="mr-2 h-4 w-4" />
            Kirim Email
          </DropdownMenuItem>
        )}
        {showExport && (
          <DropdownMenuItem onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </DropdownMenuItem>
        )}
        {showDelete && (
          <DropdownMenuItem onClick={onDelete} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionDropdown;