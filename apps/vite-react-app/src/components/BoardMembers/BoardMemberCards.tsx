import React from 'react';
import { BoardMember, BoardGroup } from '@/services/board-members/types';
import { Card, CardContent } from '@workspace/ui/components/card';
import ActionDropdown from '@/components/common/ActionDropdown';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { getThumbnailUrl } from '@/utils/imageUtils';

interface BoardMemberCardsProps {
  boardMembers: BoardMember[];
  loading?: boolean;
  onEdit: (boardMember: BoardMember) => void;
  onDelete: (boardMember: BoardMember) => void;
  onView: (boardMember: BoardMember) => void;
  boardGroups: BoardGroup[];
}

export const BoardMemberCards: React.FC<BoardMemberCardsProps> = ({
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
  if (loading) {
    return (
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (boardMembers.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Tidak ada Anggota Dewan ditemukan
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {boardMembers.map((boardMember) => (
        <Card key={boardMember.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {boardMember.img_url && (
                    <img 
                      src={getThumbnailUrl(boardMember.img_url, 64)} 
                      alt={boardMember.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-medium text-sm">{boardMember.name}</h3>
                    <p className="text-xs text-muted-foreground">{boardMember.position}</p>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Grup:</span>
                    <span>{getGroupName(boardMember.group_id)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Urutan:</span>
                    <span>{boardMember.member_order}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Dibuat:</span>
                    <span>{format(new Date(boardMember.created_at), 'dd MMM yyyy', { locale: id })}</span>
                  </div>
                  
                  {boardMember.description && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {boardMember.short_description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="ml-2">
                <ActionDropdown
                  onView={() => onView(boardMember)}
                  onEdit={() => onEdit(boardMember)}
                  onDelete={() => onDelete(boardMember)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};