import React from 'react';
import { Message } from '@/services/messages/types';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Eye, Archive, Trash2, EyeOff } from 'lucide-react';

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
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <Badge variant="destructive" className="text-xs">Belum Dibaca</Badge>;
      case 'read':
        return <Badge variant="default" className="text-xs">Sudah Dibaca</Badge>;
      case 'archived':
        return <Badge variant="secondary" className="text-xs">Diarsipkan</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
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
                    {getStatusBadge(message.status)}
                  </div>
                  <p className="text-xs text-muted-foreground">{message.email}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(message.created_at), 'dd MMM yyyy', { locale: id })}
                </span>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-1">{message.short_title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {message.short_message}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={() => onView(message)}>
                  <Eye className="w-3 h-3 mr-1" />
                  Lihat
                </Button>
                {message.is_unread && (
                  <Button size="sm" variant="outline" onClick={() => onMarkAsRead(message)}>
                    <EyeOff className="w-3 h-3 mr-1" />
                    Tandai Dibaca
                  </Button>
                )}
                {message.status !== 'archived' && (
                  <Button size="sm" variant="outline" onClick={() => onArchive(message)}>
                    <Archive className="w-3 h-3 mr-1" />
                    Arsip
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => onDelete(message)}>
                  <Trash2 className="w-3 h-3 mr-1" />
                  Hapus
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};