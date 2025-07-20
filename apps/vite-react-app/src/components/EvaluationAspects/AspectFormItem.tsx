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
  onDelete?: (aspect: EvaluationAspect) => void;
  loading?: boolean;
  defaultCategory?: string;
  questionNumber?: number;
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
  questionNumber,
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
    if (aspect && onDelete) {
      onDelete(aspect);
    }
  };

  if (!isEditing && !isNewAspect) {
    return (
      <div className="group bg-card border rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col lg:flex-row items-start gap-4">
          {/* Question Number */}
          <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {questionNumber || '?'}
            </span>
          </div>
          
          {/* Question Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-normal mb-2">
                  {aspect?.aspect_name}
                </h3>
                {aspect?.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {aspect.description}
                  </p>
                )}
                <div className="inline-flex items-center px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                  Tipe: Pilihan Ganda (A-D)
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onEdit}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                {onDelete && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleDelete}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Preview Answer Area - Evaluation Options */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted/30">
                <div className="w-4 h-4 border-2 border-primary rounded-full"></div>
                <span className="text-sm">A - Sangat Baik (4)</span>
              </div>
              <div className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted/30">
                <div className="w-4 h-4 border-2 border-border rounded-full"></div>
                <span className="text-sm">B - Baik (3)</span>
              </div>
              <div className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted/30">
                <div className="w-4 h-4 border-2 border-border rounded-full"></div>
                <span className="text-sm">C - Cukup (2)</span>
              </div>
              <div className="flex items-center space-x-2 p-2 border rounded-md hover:bg-muted/30">
                <div className="w-4 h-4 border-2 border-border rounded-full"></div>
                <span className="text-sm">D - Perlu Perbaikan (1)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border-2 border-primary/30 rounded-lg p-6 shadow-md">
      <div className="flex items-start gap-4">
        {/* Question Number */}
        <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-primary">
            {questionNumber || 'N'}
          </span>
        </div>
        
        {/* Form Content */}
        <div className="flex-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Question Title Field */}
              <FormField
                control={form.control}
                name="aspect_name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Pertanyaan tanpa judul"
                        className="text-lg font-normal border-0 border-b-2 border-border rounded-none px-0 py-3 focus:border-primary bg-transparent"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-sm mt-1" />
                  </FormItem>
                )}
              />

              {/* Description Field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Deskripsi pertanyaan (opsional)"
                        className="border-0 border-b border-border rounded-none px-0 py-2 resize-none focus:border-primary bg-transparent"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-sm mt-1" />
                  </FormItem>
                )}
              />

              {/* Answer Type Preview */}
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Tipe jawaban: Skala Penilaian
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 p-2 bg-muted/50 border rounded-md">
                    <div className="w-4 h-4 border-2 border-primary rounded-full bg-primary"></div>
                    <span className="text-sm">A - Sangat Baik (4)</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-muted/30 border rounded-md">
                    <div className="w-4 h-4 border-2 border-border rounded-full"></div>
                    <span className="text-sm">B - Baik (3)</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-muted/30 border rounded-md">
                    <div className="w-4 h-4 border-2 border-border rounded-full"></div>
                    <span className="text-sm">C - Cukup (2)</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-muted/30 border rounded-md">
                    <div className="w-4 h-4 border-2 border-border rounded-full"></div>
                    <span className="text-sm">D - Perlu Perbaikan (1)</span>
                  </div>
                </div>
              </div>

              {/* Category Selection */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Bagian
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih bagian" />
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
                    <FormMessage className="text-sm mt-1" />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    disabled={loading}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {loading ? 'Menyimpan...' : 'Selesai'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost"
                    onClick={onCancel}
                    disabled={loading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Batal
                  </Button>
                </div>
                
                {/* Additional Options */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-xs">Wajib diisi</span>
                  <div className="w-8 h-4 bg-muted rounded-full relative">
                    <div className="w-3 h-3 bg-background rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};