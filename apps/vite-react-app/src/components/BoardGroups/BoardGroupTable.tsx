import React from 'react';
import { BoardGroup } from '@/services/board-members/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import ActionDropdown from '@/components/common/ActionDropdown';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface BoardGroupTableProps {
  boardGroups: BoardGroup[];
  loading?: boolean;
  onEdit: (boardGroup: BoardGroup) => void;
  onDelete: (boardGroup: BoardGroup) => void;
  onView: (boardGroup: BoardGroup) => void;
}

export const BoardGroupTable: React.FC<BoardGroupTableProps> = ({
  boardGroups,
  loading = false,
  onEdit,
  onDelete,
  onView
}) => {

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Grup</TableHead>
            <TableHead>Urutan</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Dibuat</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Memuat Grup Dewan...
              </TableCell>
            </TableRow>
          ) : boardGroups.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Tidak ada Grup Dewan ditemukan
              </TableCell>
            </TableRow>
          ) : (
            boardGroups.map((boardGroup) => (
              <TableRow key={boardGroup.id}>
                <TableCell>
                  <span className="font-medium">{boardGroup.title}</span>
                </TableCell>
                <TableCell>
                  {boardGroup.display_order}
                </TableCell>
                <TableCell>
                  {boardGroup.description || '-'}
                </TableCell>
                <TableCell>
                  {format(new Date(boardGroup.created_at), 'dd MMM yyyy', { locale: id })}
                </TableCell>
                <TableCell className="text-right">
                  <ActionDropdown
                    onView={() => onView(boardGroup)}
                    onEdit={() => onEdit(boardGroup)}
                    onDelete={() => onDelete(boardGroup)}
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