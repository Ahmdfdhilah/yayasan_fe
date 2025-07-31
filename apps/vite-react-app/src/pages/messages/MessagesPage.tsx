import React, { useState, useEffect, useCallback } from 'react';
import { useRole } from '@/hooks/useRole';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useToast } from '@workspace/ui/components/sonner';
import { Message, MessageFilterParams, MessageStatus } from '@/services/messages/types';
import { messageService } from '@/services/messages';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Label } from '@workspace/ui/components/label';
import { MessageTable } from '@/components/Messages/MessageTable';
import { MessageCards } from '@/components/Messages/MessageCards';
import { PageHeader } from '@/components/common/PageHeader';
import ListHeaderComposite from '@/components/common/ListHeaderComposite';
import SearchContainer from '@/components/common/SearchContainer';
import Filtering from '@/components/common/Filtering';
import Pagination from '@/components/common/Pagination';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@workspace/ui/components/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';

interface MessagePageFilters {
  search: string;
  status: string;
  unread_only: string;
  page: number;
  size: number;
  [key: string]: string | number;
}

const MessagesPage: React.FC = () => {
  const { isAdmin } = useRole();
  const { toast } = useToast();
  
  const { updateURL, getCurrentFilters } = useURLFilters<MessagePageFilters>({
    defaults: { search: '', status: 'all', unread_only: 'false', page: 1, size: 10 },
    cleanDefaults: true,
  });

  const filters = getCurrentFilters();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingMessage, setViewingMessage] = useState<Message | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);

  const hasAccess = isAdmin();

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params: MessageFilterParams = {
        page: filters.page,
        size: filters.size,
        search: filters.search || undefined,
        status: filters.status !== 'all' ? filters.status as MessageStatus : undefined,
        unread_only: filters.unread_only === 'true',
      };

      const response = await messageService.getMessages(params);
      setMessages(response.items);
      setTotalItems(response.total);
      setTotalPages(response.pages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data Pesan. Silakan coba lagi.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasAccess) {
      fetchMessages();
    }
  }, [filters.page, filters.size, filters.search, filters.status, filters.unread_only, hasAccess]);


  const handleView = async (message: Message) => {
    try {
      // Mark as read when viewing
      const updatedMessage = await messageService.getMessageById(message.id, true);
      setViewingMessage(updatedMessage);
      setIsViewDialogOpen(true);
      // Refresh list to update read status
      fetchMessages();
    } catch (error) {
      console.error('Failed to view message:', error);
      setViewingMessage(message);
      setIsViewDialogOpen(true);
    }
  };

  const handleDelete = (message: Message) => {
    setMessageToDelete(message);
  };

  const confirmDeleteMessage = async () => {
    if (messageToDelete) {
      try {
        await messageService.deleteMessage(messageToDelete.id);
        setMessageToDelete(null);
        fetchMessages();
        toast({
          title: 'Pesan berhasil dihapus',
          description: `Pesan dari ${messageToDelete.name} telah dihapus dari sistem.`,
        });
      } catch (error: any) {
        console.error('Failed to delete message:', error);
        const errorMessage = error?.message || 'Gagal menghapus Pesan. Silakan coba lagi.';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    }
  };

  const handleMarkAsRead = async (message: Message) => {
    try {
      await messageService.markMessageAsRead(message.id);
      fetchMessages();
      toast({
        title: 'Pesan ditandai sebagai dibaca',
        description: `Pesan dari ${message.name} telah ditandai sebagai dibaca.`,
      });
    } catch (error: any) {
      console.error('Failed to mark message as read:', error);
      toast({
        title: 'Error',
        description: 'Gagal menandai pesan sebagai dibaca.',
        variant: 'destructive'
      });
    }
  };

  const handleArchive = async (message: Message) => {
    try {
      await messageService.archiveMessage(message.id);
      fetchMessages();
      toast({
        title: 'Pesan diarsipkan',
        description: `Pesan dari ${message.name} telah diarsipkan.`,
      });
    } catch (error: any) {
      console.error('Failed to archive message:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengarsipkan pesan.',
        variant: 'destructive'
      });
    }
  };

  // Filter handlers
  const handleSearchChange = useCallback((search: string) => {
    if (search !== filters.search) {
      updateURL({ search, page: 1 });
    }
  }, [updateURL, filters.search]);

  const handleStatusChange = useCallback((status: string) => {
    if (status !== filters.status) {
      updateURL({ status, page: 1 });
    }
  }, [updateURL, filters.status]);

  const handleUnreadOnlyChange = useCallback((unread_only: string) => {
    if (unread_only !== filters.unread_only) {
      updateURL({ unread_only, page: 1 });
    }
  }, [updateURL, filters.unread_only]);

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
          <p className="text-muted-foreground">
            Anda tidak memiliki akses untuk melihat halaman ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Pesan"
        description="Kelola pesan masuk dari pengunjung website"
      />

      <Filtering>
        <div className="space-y-2">
          <Label htmlFor="status-filter">Status</Label>
          <Select value={filters.status} onValueChange={handleStatusChange}>
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="Filter berdasarkan status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="unread">Belum Dibaca</SelectItem>
              <SelectItem value="read">Sudah Dibaca</SelectItem>
              <SelectItem value="archived">Diarsipkan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unread-filter">Tampilan</Label>
          <Select value={filters.unread_only} onValueChange={handleUnreadOnlyChange}>
            <SelectTrigger id="unread-filter">
              <SelectValue placeholder="Filter tampilan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">Semua Pesan</SelectItem>
              <SelectItem value="true">Hanya Belum Dibaca</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Filtering>

      <Card>
        <CardContent>
          <div className="space-y-4">
            <ListHeaderComposite
              title="Daftar Pesan"
              subtitle="Kelola pesan masuk dari pengunjung website"
            />

            <SearchContainer
              searchQuery={filters.search}
              onSearchChange={handleSearchChange}
              placeholder="Cari pesan berdasarkan nama, email, atau judul..."
            />

            <div className="hidden lg:block">
              <MessageTable
                messages={messages}
                loading={loading}
                onView={handleView}
                onDelete={handleDelete}
                onMarkAsRead={handleMarkAsRead}
                onArchive={handleArchive}
              />
            </div>

            <div className="lg:hidden">
              <MessageCards
                messages={messages}
                loading={loading}
                onView={handleView}
                onDelete={handleDelete}
                onMarkAsRead={handleMarkAsRead}
                onArchive={handleArchive}
              />
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={filters.page}
                totalPages={totalPages}
                itemsPerPage={filters.size}
                totalItems={totalItems}
                onPageChange={(page) => updateURL({ page })}
                onItemsPerPageChange={(value) => updateURL({ size: parseInt(value), page: 1 })}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {viewingMessage && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detail Pesan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nama Pengirim</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {viewingMessage.name}
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {viewingMessage.email}
                  </div>
                </div>
              </div>
              <div>
                <Label>Judul</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {viewingMessage.title}
                </div>
              </div>
              <div>
                <Label>Pesan</Label>
                <div className="p-4 bg-muted rounded text-sm max-h-64 overflow-y-auto">
                  {viewingMessage.message}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {viewingMessage.status === 'unread' ? 'Belum Dibaca' : 
                     viewingMessage.status === 'read' ? 'Sudah Dibaca' : 'Diarsipkan'}
                  </div>
                </div>
                <div>
                  <Label>Tanggal</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {new Date(viewingMessage.created_at).toLocaleDateString('id-ID')}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={!!messageToDelete} onOpenChange={() => setMessageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Pesan dari{' '}
              <span className="font-semibold">{messageToDelete?.name}</span> akan dihapus
              secara permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMessage}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus Pesan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MessagesPage;