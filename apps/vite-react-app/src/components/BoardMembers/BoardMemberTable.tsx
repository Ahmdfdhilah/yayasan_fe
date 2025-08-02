import React from 'react';
import { BoardMember, BoardGroup } from '@/services/board-members/types';
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
import { getThumbnailUrl } from '@/utils/imageUtils';

interface BoardMemberTableProps {
  boardMembers: BoardMember[];
  loading?: boolean;
  onEdit: (boardMember: BoardMember) => void;
  onDelete: (boardMember: BoardMember) => void;
  onView: (boardMember: BoardMember) => void;
  boardGroups: BoardGroup[];
}

export const BoardMemberTable: React.FC<BoardMemberTableProps> = ({
  boardMembers,
  loading = false,
  onEdit,
  onDelete,
  onView,
  boardGroups
}) => {
  const getGroupName = (groupId?: number) => {
    if (!groupId) return '-';
    const group = boardGroups.find(g => g.id === groupId);
    return group?.title || '-';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Posisi</TableHead>
            <TableHead>Grup</TableHead>
            <TableHead>Urutan</TableHead>
            <TableHead>Dibuat</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Memuat Anggota Dewan...
              </TableCell>
            </TableRow>
          ) : boardMembers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Tidak ada Anggota Dewan ditemukan
              </TableCell>
            </TableRow>
          ) : (
            boardMembers.map((boardMember) => (
              <TableRow key={boardMember.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {boardMember.img_url && (
                      <img 
                        src={getThumbnailUrl(boardMember.img_url, 48)} 
                        alt={boardMember.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <span className="font-medium">{boardMember.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {boardMember.position}
                </TableCell>
                <TableCell>
                  {getGroupName(boardMember.group_id)}
                </TableCell>
                <TableCell>
                  {boardMember.member_order}
                </TableCell>
                <TableCell>
                  {format(new Date(boardMember.created_at), 'dd MMM yyyy', { locale: id })}
                </TableCell>
                <TableCell className="text-right">
                  <ActionDropdown
                    onView={() => onView(boardMember)}
                    onEdit={() => onEdit(boardMember)}
                    onDelete={() => onDelete(boardMember)}
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