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
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import ActionDropdown from '@/components/common/ActionDropdown';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

interface PeriodTableProps {
  periods: Period[];
  loading?: boolean;
  onEdit: (period: Period) => void;
  onDelete: (period: Period) => void;
  onView: (period: Period) => void;
  onActivate?: (period: Period) => void;
  onDeactivate?: (period: Period) => void;
  canManage?: boolean;
}

export const PeriodTable: React.FC<PeriodTableProps> = ({
  periods,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onActivate,
  onDeactivate,
  canManage = false
}) => {

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: id });
  };

  const getStatusBadge = (period: Period) => {
    if (period.is_active) {
      return (
        <div className="flex items-center space-x-2">
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aktif
          </Badge>
          {canManage && onDeactivate && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDeactivate(period)}
              className="h-6 px-2 text-xs"
            >
              Nonaktifkan
            </Button>
          )}
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-100">
            <XCircle className="w-3 h-3 mr-1" />
            Tidak Aktif
          </Badge>
          {canManage && onActivate && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onActivate(period)}
              className="h-6 px-2 text-xs"
            >
              Aktifkan
            </Button>
          )}
        </div>
      );
    }
  };

  const getActionProps = (period: Period) => {
    return {
      onView: () => onView(period),
      onEdit: () => onEdit(period),
      onDelete: () => onDelete(period),
      showView: true,
      showEdit: true,
      showDelete: true,
    };
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tahun Akademik</TableHead>
            <TableHead>Semester</TableHead>
            <TableHead>Periode</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Dibuat</TableHead>
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
                <TableCell className="font-medium">
                  {period.academic_year}
                </TableCell>
                <TableCell>
                  {period.semester}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(period.start_date)} - {formatDate(period.end_date)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(period)}
                </TableCell>
                <TableCell>
                  <div className="max-w-xs truncate">
                    {period.description || 'Tidak ada deskripsi'}
                  </div>
                </TableCell>
                <TableCell>
                  {formatDate(period.created_at)}
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