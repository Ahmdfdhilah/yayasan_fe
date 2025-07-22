import React from 'react';
import { Period } from '@/services/periods/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import ActionDropdown from '@/components/common/ActionDropdown';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface PeriodTableProps {
  periods: Period[];
  loading?: boolean;
  onEdit: (period: Period) => void;
  onDelete: (period: Period) => void;
  onView: (period: Period) => void;
}

export const PeriodTable: React.FC<PeriodTableProps> = ({
  periods,
  loading = false,
  onEdit,
  onDelete,
  onView,
}) => {

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: id });
  };


  const getActionProps = (period: Period) => {
    const props: any = {
      onView: () => onView(period),
      onEdit: () => onEdit(period),
      onDelete: () => onDelete(period),
      showView: true,
      showEdit: true,
      showDelete: true,
    };

    return props;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tahun Akademik</TableHead>
            <TableHead>Semester</TableHead>
            <TableHead>Tanggal Mulai</TableHead>
            <TableHead>Tanggal Selesai</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Memuat periode...
              </TableCell>
            </TableRow>
          ) : periods.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Tidak ada periode ditemukan
              </TableCell>
            </TableRow>
          ) : (
            periods.map((period) => (
              <TableRow key={period.id}>
                <TableCell>
                  {period.academic_year}
                </TableCell>
                <TableCell>
                  {period.semester}
                </TableCell>
                <TableCell>
                  {formatDate(period.start_date)}
                </TableCell>
                <TableCell>
                  {formatDate(period.end_date)}
                </TableCell>
                <TableCell>
                  {period.is_active ? 'Aktif' : 'Tidak Aktif'}
                </TableCell>
                <TableCell>
                  {period.description || '-'}
                </TableCell>
                <TableCell className="text-right">
                  <ActionDropdown
                    {...getActionProps(period)}
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