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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Period, PeriodCreate, PeriodUpdate } from '@/services/periods/types';

const periodFormSchema = z.object({
  academic_year: z.string().min(1, 'Tahun akademik wajib diisi').max(20, 'Tahun akademik maksimal 20 karakter'),
  semester: z.string().min(1, 'Semester wajib diisi').max(20, 'Semester maksimal 20 karakter'),
  start_date: z.string().min(1, 'Tanggal mulai wajib diisi'),
  end_date: z.string().min(1, 'Tanggal selesai wajib diisi'),
  description: z.string().optional().or(z.literal('')),
}).refine((data) => {
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  return endDate > startDate;
}, {
  message: "Tanggal selesai harus setelah tanggal mulai",
  path: ["end_date"],
});

type PeriodFormData = z.infer<typeof periodFormSchema>;

interface PeriodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPeriod: Period | null;
  onSave: (data: PeriodCreate | PeriodUpdate) => void;
}

export const PeriodDialog: React.FC<PeriodDialogProps> = ({
  open,
  onOpenChange,
  editingPeriod,
  onSave
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const isEdit = !!editingPeriod;

  const form = useForm<PeriodFormData>({
    resolver: zodResolver(periodFormSchema),
    defaultValues: {
      academic_year: '',
      semester: '',
      start_date: '',
      end_date: '',
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (editingPeriod) {
        form.reset({
          academic_year: editingPeriod.academic_year,
          semester: editingPeriod.semester,
          start_date: editingPeriod.start_date,
          end_date: editingPeriod.end_date,
          description: editingPeriod.description || '',
        });
      } else {
        form.reset({
          academic_year: '',
          semester: '',
          start_date: '',
          end_date: '',
          description: '',
        });
      }
    }
  }, [open, editingPeriod, form]);

  const onSubmit = async (data: PeriodFormData) => {
    setLoading(true);

    try {
      const submitData = {
        academic_year: data.academic_year,
        semester: data.semester,
        start_date: data.start_date,
        end_date: data.end_date,
        description: data.description || undefined,
      };

      onSave(submitData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving period:', error);
      toast({
        title: 'Error',
        description: 'Gagal menyimpan periode. Silakan coba lagi.',
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

  // Generate academic year options (current year ± 5 years)
  const currentYear = new Date().getFullYear();
  const academicYearOptions: string[] = [];
  for (let i = -5; i <= 5; i++) {
    const year = currentYear + i;
    academicYearOptions.push(`${year}/${year + 1}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Periode' : 'Tambah Periode'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="academic_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tahun Akademik</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tahun akademik" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {academicYearOptions.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="semester"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Semester</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih semester" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Ganjil">Ganjil</SelectItem>
                      <SelectItem value="Genap">Genap</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Mulai</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      placeholder="Pilih tanggal mulai"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Selesai</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      placeholder="Pilih tanggal selesai"
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
                  <FormLabel>Deskripsi (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Deskripsi periode..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Menyimpan...' : (isEdit ? 'Perbarui' : 'Simpan')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};