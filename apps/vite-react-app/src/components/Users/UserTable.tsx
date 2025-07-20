import React from 'react';
import { User } from '@/services/users/types';
import { ROLE_LABELS } from '@/lib/constants';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { Badge } from '@workspace/ui/components/badge';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import ActionDropdown  from '@/components/common/ActionDropdown';

interface UserTableProps {
  users: User[];
  loading?: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onView: (user: User) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  loading = false,
  onEdit,
  onDelete,
  onView
}) => {
  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'destructive'}>
        {isActive ? 'Aktif' : 'Tidak Aktif'}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    return (
      <Badge variant="secondary" className="text-xs">
        {ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role}
      </Badge>
    );
  };


  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Jabatan</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Inspektorat</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Loading users...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Tidak ada user ditemukan
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs">
                        {user.nama.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.nama}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{user.jabatan}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{user.email || '-'}</span>
                </TableCell>
                <TableCell>
                  {getRoleBadge(user.role)}
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {user.inspektorat || '-'}
                  </span>
                </TableCell>
                <TableCell>
                  {getStatusBadge(user.is_active)}
                </TableCell>
                <TableCell className="text-right">
                  <ActionDropdown
                    onView={() => onView(user)}
                    onEdit={() => onEdit(user)}
                    onDelete={() => onDelete(user)}
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