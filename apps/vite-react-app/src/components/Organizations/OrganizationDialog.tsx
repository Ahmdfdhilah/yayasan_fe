import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@workspace/ui/components/sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { Combobox } from '@workspace/ui/components/combobox';
import { Organization, OrganizationCreate, OrganizationUpdate } from '@/services/organizations/types';
import { User } from '@/services/users/types';
import { userService } from '@/services/users';

const organizationFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be 255 characters or less'),
  description: z.string().optional().or(z.literal('')),
  head_id: z.number().optional().or(z.literal('')),
});

type OrganizationFormData = z.infer<typeof organizationFormSchema>;

interface OrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingOrganization: Organization | null;
  onSave: (data: OrganizationCreate | OrganizationUpdate) => void;
}

export const OrganizationDialog: React.FC<OrganizationDialogProps> = ({
  open,
  onOpenChange,
  editingOrganization,
  onSave
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const isEdit = !!editingOrganization;

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: '',
      description: '',
      head_id: undefined,
    },
  });

  // Load users for head selection
  const loadUsers = async (search: string = '') => {
    setUsersLoading(true);
    try {
      const response = await userService.getUsers({
        search,
        size: 50, // Limit for combobox
        page: 1,
      });
      setUsers(response.items);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users for head selection.',
        variant: 'destructive'
      });
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (editingOrganization) {
        form.reset({
          name: editingOrganization.name,
          description: editingOrganization.description || '',
          head_id: editingOrganization.head_id,
        });
      } else {
        form.reset({
          name: '',
          description: '',
          head_id: undefined,
        });
      }
      // Load initial users
      loadUsers();
    }
  }, [open, editingOrganization, form]);

  const onSubmit = async (data: OrganizationFormData) => {
    setLoading(true);

    try {
      const submitData = {
        name: data.name,
        description: data.description || undefined,
        head_id: data.head_id || undefined,
      };

      onSave(submitData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving organization:', error);
      toast({
        title: 'Error',
        description: 'Failed to save organization. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading) {
      form.reset();
      onOpenChange(false);
    }
  };

  // Prepare users for combobox
  const userOptions = users.map(user => ({
    value: user.id.toString(),
    label: `${user.profile?.name || user.display_name} (${user.email})`,
  }));

  const handleUserSearch = async (search: string) => {
    await loadUsers(search);
  };

  const handleUserSelect = (value: string) => {
    const userId = parseInt(value);
    form.setValue('head_id', userId);
  };

  const selectedUser = users.find(user => user.id === form.getValues('head_id'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 border-b pb-4">
          <DialogTitle>
            {isEdit ? 'Edit Organization' : 'Add New Organization'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter organization name"
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter organization description (optional)"
                          disabled={loading}
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="head_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Head</FormLabel>
                      <FormControl>
                        <Combobox
                          options={userOptions}
                          value={selectedUser ? selectedUser.id.toString() : ''}
                          onValueChange={handleUserSelect}
                          onSearch={handleUserSearch}
                          placeholder="Search and select organization head..."
                          emptyText="No users found"
                          searchPlaceholder="Search users..."
                          disabled={loading}
                          loading={usersLoading}
                        />
                      </FormControl>
                      <FormMessage />
                      {selectedUser && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Selected: {selectedUser.profile?.name || selectedUser.display_name} ({selectedUser.email})
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={loading}
          >
            {loading ? 'Saving...' : isEdit ? 'Update Organization' : 'Create Organization'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};