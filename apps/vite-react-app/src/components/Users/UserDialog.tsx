import React, { useState } from 'react';
import { useToast } from '@workspace/ui/components/sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import { User } from '@/services/users/types';
import { useFormPermissions } from '@/hooks/useFormPermissions';
import { UserForm } from './UserForm';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: User | null;
  mode?: 'view' | 'edit' | 'create';
  onSave: (userData: any) => void;
}

export const UserDialog: React.FC<UserDialogProps> = ({
  open,
  onOpenChange,
  editingUser,
  mode = editingUser ? 'edit' : 'create',
  onSave
}) => {
  const { canEditForm } = useFormPermissions();
  const isEditable = mode !== 'view';
  const canEdit = canEditForm('user_management') && isEditable;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);

    try {
      // Transform data to match API requirements
      const transformedData = {
        nama: data.nama,
        jabatan: data.jabatan,
        email: data.email || undefined,
        is_active: data.is_active,
        role: data.role,
        inspektorat: data.inspektorat || undefined,
      };

      onSave(transformedData);
      onOpenChange(false);

    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: 'Terjadi kesalahan',
        description: 'Gagal menyimpan data user. Silakan coba lagi.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingUser ? 'Edit User' : 'Create New User'}
          </DialogTitle>
        </DialogHeader>

        <UserForm
          initialData={editingUser || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
          disabled={!canEdit}
          mode={mode}
        />
      </DialogContent>
    </Dialog>
  );
};