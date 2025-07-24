import React from 'react';
import { Message } from '@/services/messages/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Eye, Archive, Trash2, EyeOff } from 'lucide-react';

interface MessageTableProps {
  messages: Message[];
  loading?: boolean;
  onView: (message: Message) => void;
  onDelete: (message: Message) => void;
  onMarkAsRead: (message: Message) => void;
  onArchive: (message: Message) => void;
}

export const MessageTable: React.FC<MessageTableProps> = ({
  messages, loading = false, onView, onDelete, onMarkAsRead, onArchive
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <Badge variant="destructive">Belum Dibaca</Badge>;
      case 'read':
        return <Badge variant="default">Sudah Dibaca</Badge>;
      case 'archived':
        return <Badge variant="secondary">Diarsipkan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pengirim</TableHead>
            <TableHead>Judul</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Memuat Pesan...
              </TableCell>
            </TableRow>
          ) : messages.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Tidak ada Pesan ditemukan
              </TableCell>
            </TableRow>
          ) : (
            messages.map((message) => (
              <TableRow key={message.id} className={message.is_unread ? 'bg-blue-50' : ''}>
                <TableCell>
                  <div>
                    <div className="font-medium">{message.name}</div>
                    <div className="text-xs text-muted-foreground">{message.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{message.short_title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {message.short_message}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(message.status)}</TableCell>
                <TableCell>
                  {format(new Date(message.created_at), 'dd MMM yyyy HH:mm', { locale: id })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <Button size="sm" variant="ghost" onClick={() => onView(message)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {message.is_unread && (
                      <Button size="sm" variant="ghost" onClick={() => onMarkAsRead(message)}>
                        <EyeOff className="w-4 h-4" />
                      </Button>
                    )}
                    {message.status !== 'archived' && (
                      <Button size="sm" variant="ghost" onClick={() => onArchive(message)}>
                        <Archive className="w-4 h-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => onDelete(message)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};