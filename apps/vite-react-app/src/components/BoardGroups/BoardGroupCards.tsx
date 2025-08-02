import React from 'react';
import { BoardGroup } from '@/services/board-members/types';
import { Card, CardContent } from '@workspace/ui/components/card';
import ActionDropdown from '@/components/common/ActionDropdown';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface BoardGroupCardsProps {
  boardGroups: BoardGroup[];
  loading?: boolean;
  onEdit: (boardGroup: BoardGroup) => void;
  onDelete: (boardGroup: BoardGroup) => void;
  onView: (boardGroup: BoardGroup) => void;
}

export const BoardGroupCards: React.FC<BoardGroupCardsProps> = ({
  boardGroups,
  loading = false,
  onEdit,
  onDelete,
  onView
}) => {
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

  if (boardGroups.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Tidak ada Grup Dewan ditemukan
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {boardGroups.map((boardGroup) => (
        <Card key={boardGroup.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2">
                  <h3 className="font-medium text-sm">{boardGroup.title}</h3>
                  {boardGroup.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {boardGroup.description}
                    </p>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Urutan:</span>
                    <span>{boardGroup.display_order}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Dibuat:</span>
                    <span>{format(new Date(boardGroup.created_at), 'dd MMM yyyy', { locale: id })}</span>
                  </div>
                </div>
              </div>
              
              <div className="ml-2">
                <ActionDropdown
                  onView={() => onView(boardGroup)}
                  onEdit={() => onEdit(boardGroup)}
                  onDelete={() => onDelete(boardGroup)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};