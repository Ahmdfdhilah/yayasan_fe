import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Card, CardContent, CardHeader } from '@workspace/ui/components/card';
import { Trash2, Edit, Check, X } from 'lucide-react';
import { EvaluationAspect, EvaluationAspectCreate, EvaluationAspectUpdate } from '@/services/evaluation-aspects/types';

const aspectFormSchema = z.object({
  aspect_name: z.string().min(1, 'Nama aspek wajib diisi').max(255, 'Nama aspek maksimal 255 karakter'),
  category: z.string().min(1, 'Kategori wajib diisi').max(100, 'Kategori maksimal 100 karakter'),
  description: z.string().optional().or(z.literal('')),
});

type AspectFormData = z.infer<typeof aspectFormSchema>;

interface AspectFormItemProps {
  aspect?: EvaluationAspect;
  categories: string[];
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (data: EvaluationAspectCreate | EvaluationAspectUpdate) => void;
  onDelete?: (aspectId: number) => void;
  loading?: boolean;
  defaultCategory?: string;
}

export const AspectFormItem: React.FC<AspectFormItemProps> = ({
  aspect,
  categories,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  loading = false,
  defaultCategory,
}) => {
  const isNewAspect = !aspect;

  const form = useForm<AspectFormData>({
    resolver: zodResolver(aspectFormSchema),
    defaultValues: {
      aspect_name: aspect?.aspect_name || '',
      category: aspect?.category || defaultCategory || '',
      description: aspect?.description || '',
    },
  });

  useEffect(() => {
    if (aspect && isEditing) {
      form.reset({
        aspect_name: aspect.aspect_name,
        category: aspect.category,
        description: aspect.description || '',
      });
    } else if (isNewAspect && defaultCategory) {
      form.reset({
        aspect_name: '',
        category: defaultCategory,
        description: '',
      });
    }
  }, [aspect, isEditing, isNewAspect, defaultCategory, form]);

  const onSubmit = (data: AspectFormData) => {
    const submitData = {
      aspect_name: data.aspect_name,
      category: data.category,
      description: data.description || undefined,
      is_active: true,
    };
    onSave(submitData);
  };

  const handleDelete = () => {
    if (aspect && onDelete && window.confirm('Apakah Anda yakin ingin menghapus aspek evaluasi ini?')) {
      onDelete(aspect.id);
    }
  };

  if (!isEditing && !isNewAspect) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-sm">{aspect?.aspect_name}</h4>
              <p className="text-xs text-muted-foreground mt-1">{aspect?.category}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="h-3 w-3" />
              </Button>
              {onDelete && (
                <Button variant="ghost" size="sm" onClick={handleDelete}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        {aspect?.description && (
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">{aspect.description}</p>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-primary/20">
      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="aspect_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Nama Aspek</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan nama aspek..."
                        className="text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Kategori</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Pilih atau tulis kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Deskripsi (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Deskripsi aspek evaluasi..."
                      className="resize-none text-sm"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />


            <div className="flex justify-end gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={onCancel}
                disabled={loading}
              >
                <X className="h-3 w-3 mr-1" />
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={loading}>
                <Check className="h-3 w-3 mr-1" />
                {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};