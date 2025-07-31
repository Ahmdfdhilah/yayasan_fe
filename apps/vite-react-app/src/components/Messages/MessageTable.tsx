import React from 'react';
import { Message } from '@/services/messages/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import ActionDropdown from '@/components/common/ActionDropdown';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

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
                <TableCell>{getStatus(message.status)}</TableCell>
                <TableCell>
                  {format(new Date(message.created_at), 'dd MMM yyyy', { locale: id })}
                </TableCell>
                <TableCell className="text-right">
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};