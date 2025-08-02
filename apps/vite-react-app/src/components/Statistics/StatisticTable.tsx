import React from 'react';
import { Statistic } from '@/services/statistics/types';
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
import { getImageUrl } from '@/utils/imageUtils';

interface StatisticTableProps {
  statistics: Statistic[];
  loading?: boolean;
  onEdit: (statistic: Statistic) => void;
  onDelete: (statistic: Statistic) => void;
  onView: (statistic: Statistic) => void;
}

export const StatisticTable: React.FC<StatisticTableProps> = ({
  statistics,
  loading = false,
  onEdit,
  onDelete,
  onView
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Judul</TableHead>
            <TableHead>Nilai</TableHead>
            <TableHead>Urutan</TableHead>
            <TableHead>Dibuat</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Memuat Statistik...
              </TableCell>
            </TableRow>
          ) : statistics.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Tidak ada Statistik ditemukan
              </TableCell>
            </TableRow>
          ) : (
            statistics.map((statistic) => (
              <TableRow key={statistic.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {statistic.img_url && (
                      <img
                        src={getImageUrl(statistic.img_url)}
                        alt={statistic.title}
                        className="w-8 h-8 rounded object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium">{statistic.title}</div>
                      {statistic.description && (
                        <div className="text-muted-foreground">
                          {statistic.description.length > 60
                            ? `${statistic.description.substring(0, 60)}...`
                            : statistic.description
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {statistic.stats}
                </TableCell>
                <TableCell>
                  {statistic.display_order}
                </TableCell>
                <TableCell>
                  {format(new Date(statistic.created_at), 'dd MMM yyyy', { locale: id })}
                </TableCell>
                <TableCell className="text-right">
                  <ActionDropdown
                    onView={() => onView(statistic)}
                    onEdit={() => onEdit(statistic)}
                    onDelete={() => onDelete(statistic)}
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