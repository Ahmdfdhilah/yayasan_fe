import React from 'react';
import { Message } from '@/services/messages/types';
import { Card, CardContent } from '@workspace/ui/components/card';
import ActionDropdown from '@/components/common/ActionDropdown';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { MessageSquare } from 'lucide-react';

interface MessageCardsProps {
  messages: Message[];
  loading?: boolean;
  onView: (message: Message) => void;
  onDelete: (message: Message) => void;
  onMarkAsRead: (message: Message) => void;
  onArchive: (message: Message) => void;
}

export const MessageCards: React.FC<MessageCardsProps> = ({
  messages, loading = false, onView, onDelete, onMarkAsRead, onArchive
}) => {
  const getStatus = (status: string) => {
    switch (status) {
      case 'UNREAD':
        return 'Belum Dibaca';
      case 'READ':
        return 'Sudah Dibaca';
      case 'ARCHIEVED':
        return 'Diarsipkan';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Tidak ada Pesan ditemukan
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {messages.map((message) => (
        <Card key={message.id} className={message.is_unread ? 'border-blue-200 bg-blue-50' : ''}>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-sm">{message.name}</h3>
                    {getStatus(message.status)}
                  </div>
                  <p className="text-xs text-muted-foreground">{message.email}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(message.created_at), 'dd MMM yyyy', { locale: id })}
                </span>
              </div>


              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">{message.short_title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {message.short_message}
                    </p>
                  </div>
                </div>
                <ActionDropdown
                  onView={() => onView(message)}
                  onDelete={() => onDelete(message)}
                  showView={true}
                  showEdit={false}
                  showDelete={true}
                  customActions={[
                    ...(message.is_unread ? [{
                      label: 'Tandai Dibaca',
                      onClick: () => onMarkAsRead(message),
                      icon: 'Eye'
                    }] : []),
                    ...(message.status !== 'ARCHIEVED' ? [{
                      label: 'Arsipkan',
                      onClick: () => onArchive(message),
                      icon: 'Archive'
                    }] : [])
                  ]}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};