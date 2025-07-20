import React from 'react';
import { Organization } from '@/services/organizations/types';
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

interface OrganizationTableProps {
  organizations: Organization[];
  loading?: boolean;
  onEdit: (organization: Organization) => void;
  onDelete: (organization: Organization) => void;
  onView: (organization: Organization) => void;
}

export const OrganizationTable: React.FC<OrganizationTableProps> = ({
  organizations,
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
            <TableHead>Organisasi</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Kepala</TableHead>
            <TableHead>Pengguna</TableHead>
            <TableHead>Dibuat</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Memuat organisasi...
              </TableCell>
            </TableRow>
          ) : organizations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Tidak ada organisasi ditemukan
              </TableCell>
            </TableRow>
          ) : (
            organizations.map((organization) => (
              <TableRow key={organization.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{organization.name}</p>
                    <p className="text-sm text-muted-foreground">ID: {organization.id}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {organization.description ? (
                      <span className="line-clamp-2">{organization.description}</span>
                    ) : (
                      <span className="text-muted-foreground italic">Tidak ada deskripsi</span>
                    )}
                  </span>
                </TableCell>
                <TableCell>
                  {organization.head_name || 'Belum ada'}
                </TableCell>
                <TableCell>
                  {organization.user_count}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(organization.created_at), 'dd MMM yyyy', { locale: id })}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <ActionDropdown
                    onView={() => onView(organization)}
                    onEdit={() => onEdit(organization)}
                    onDelete={() => onDelete(organization)}
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