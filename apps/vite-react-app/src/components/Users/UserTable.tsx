import React from 'react';
import { User } from '@/services/users/types';
import { UserStatus } from '@/services/auth/types';
import { getRoleDisplayName } from '@/utils/role';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import ActionDropdown from '@/components/common/ActionDropdown';

interface UserTableProps {
  users: User[];
  loading?: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onView: (user: User) => void;
  disableEdit?: boolean;
  editDisabledTooltip?: string;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  loading = false,
  onEdit,
  onDelete,
  onView,
  disableEdit = false,
  editDisabledTooltip = 'Edit tidak tersedia'
}) => {


  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Posisi</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Organisasi</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Telepon</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Memuat pengguna...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Tidak ada user ditemukan
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {user.profile?.name || user.display_name}
                </TableCell>
                <TableCell>
                  {user.profile?.position || '-'}
                </TableCell>
                <TableCell>
                  {user.email}
                </TableCell>
                <TableCell>
                  {user.organization_name || '-'}
                </TableCell>
                <TableCell>
                  {getRoleDisplayName(user.role)}
                </TableCell>
                <TableCell>
                  {user.profile?.phone || '-'}
                </TableCell>
                <TableCell>
                  {user.status === UserStatus.ACTIVE ? 'Aktif' : 'Tidak Aktif'}
                </TableCell>
                <TableCell className="text-right">
                  <ActionDropdown
                    onView={() => onView(user)}
                    onEdit={() => onEdit(user)}
                    onDelete={() => onDelete(user)}
                    disableEdit={disableEdit}
                    editDisabledTooltip={editDisabledTooltip}
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