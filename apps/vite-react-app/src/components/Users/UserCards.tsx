import React from 'react';
import { User } from '@/services/users/types';
import { ROLE_LABELS } from '@/lib/constants';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import ActionDropdown  from '@/components/common/ActionDropdown';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  Mail, 
  Calendar, 
  CreditCard,
  Building
} from 'lucide-react';

interface UserCardsProps {
  users: User[];
  loading?: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onView: (user: User) => void;
}

export const UserCards: React.FC<UserCardsProps> = ({
  users,
  loading = false,
  onEdit,
  onDelete,
  onView
}) => {
  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'destructive'} className="text-xs">
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


  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading users...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Tidak ada user ditemukan
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {users.map((user) => (
        <Card key={user.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            {/* Header with Avatar and Actions */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="text-sm">
                    {user.nama.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-sm">{user.nama}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusBadge(user.is_active)}
                  </div>
                </div>
              </div>
              <ActionDropdown
                onView={() => onView(user)}
                onEdit={() => onEdit(user)}
                onDelete={() => onDelete(user)}
              />
            </div>

            {/* Username */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
              <CreditCard className="w-4 h-4" />
              <span>@{user.username}</span>
            </div>

            {/* Jabatan */}
            <div className="mb-2">
              <p className="text-sm font-medium">{user.jabatan}</p>
            </div>

            {/* Email */}
            {user.email && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                <Mail className="w-4 h-4" />
                <span className="truncate">{user.email}</span>
              </div>
            )}


            {/* Inspektorat */}
            {user.inspektorat && (
              <div className="flex items-start space-x-2 text-sm text-muted-foreground mb-2">
                <Building className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">Inspektorat: {user.inspektorat}</span>
              </div>
            )}

            {/* Role */}
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1">Role:</p>
              {getRoleBadge(user.role)}
            </div>

            {/* Created At */}
            <div className="flex items-center space-x-2 text-xs text-muted-foreground pt-2 border-t">
              <Calendar className="w-3 h-3" />
              <span>
                Dibuat: {format(new Date(user.created_at), 'dd MMM yyyy', { locale: id })}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};