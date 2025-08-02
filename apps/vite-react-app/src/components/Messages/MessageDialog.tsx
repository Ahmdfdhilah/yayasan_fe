import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Button } from '@workspace/ui/components/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { Badge } from '@workspace/ui/components/badge';
import { Message, MessageStatus } from '../../services/messages';

const messageSchema = z.object({
  name: z.string().min(1, 'Nama harus diisi'),
  email: z.string().email('Email tidak valid'),
  title: z.string().min(1, 'Subjek harus diisi'),
  message: z.string().min(1, 'Pesan harus diisi'),
  status: z.nativeEnum(MessageStatus),
});

type MessageFormData = z.infer<typeof messageSchema>;

interface MessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: Message | null;
  onSubmit: (data: MessageFormData) => Promise<void>;
  loading?: boolean;
  mode: 'create' | 'edit' | 'view';
}

const statusOptions: { value: MessageStatus; label: string; color: string }[] = [
  { value: MessageStatus.UNREAD, label: 'Belum Dibaca', color: 'bg-red-100 text-red-800' },
  { value: MessageStatus.READ, label: 'Sudah Dibaca', color: 'bg-green-100 text-green-800' },
  { value: MessageStatus.ARCHIEVED, label: 'Diarsipkan', color: 'bg-gray-100 text-gray-800' },
];

export function MessageDialog({
  open,
  onOpenChange,
  message,
  onSubmit,
  loading = false,
  mode,
}: MessageDialogProps) {
  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      name: '',
      email: '',
      title: '',
      message: '',
      status: MessageStatus.UNREAD,
    },
  });

  React.useEffect(() => {
    if (message) {
      form.reset({
        name: message.name,
        email: message.email,
        title: message.title,
        message: message.message,
        status: message.status,
      });
    } else {
      form.reset({
        name: '',
        email: '',
        title: '',
        message: '',
        status: MessageStatus.UNREAD,
      });
    }
  }, [message, form]);

  const handleSubmit = async (data: MessageFormData) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' && 'Tambah Pesan Baru'}
            {mode === 'edit' && 'Edit Pesan'}
            {mode === 'view' && 'Detail Pesan'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Pengirim</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Masukkan nama pengirim"
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Masukkan email pengirim"
                        disabled={isReadOnly}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subjek</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Masukkan subjek pesan"
                      disabled={isReadOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pesan</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Masukkan isi pesan"
                      rows={6}
                      disabled={isReadOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    {isReadOnly ? (
                      <div>
                        <Badge
                          className={
                            statusOptions.find(opt => opt.value === field.value)?.color || 'bg-gray-100 text-gray-800'
                          }
                        >
                          {statusOptions.find(opt => opt.value === field.value)?.label || field.value}
                        </Badge>
                      </div>
                    ) : (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isReadOnly}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <Badge className={option.color}>
                                  {option.label}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Metadata for existing messages */}
            {message && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-gray-700">Tanggal Diterima</label>
                  <p className="text-sm text-gray-600">
                    {new Date(message.created_at).toLocaleString('id-ID')}
                  </p>
                </div>
                {message.updated_at && message.updated_at !== message.created_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Terakhir Diupdate</label>
                    <p className="text-sm text-gray-600">
                      {new Date(message.updated_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {!isReadOnly && (
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Menyimpan...' : mode === 'create' ? 'Tambah' : 'Simpan'}
                </Button>
              </div>
            )}

            {isReadOnly && (
              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
                >
                  Tutup
                </Button>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}