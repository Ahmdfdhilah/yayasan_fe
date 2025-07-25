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
import { RichTextDisplay } from '@/components/common/RichTextDisplay';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Users } from 'lucide-react';
import { getThumbnailUrl } from '@/utils/imageUtils';

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
            <TableHead>Sekolah</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Pengguna</TableHead>
            <TableHead>Dibuat</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Memuat Sekolah...
              </TableCell>
            </TableRow>
          ) : organizations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Tidak ada Sekolah ditemukan
              </TableCell>
            </TableRow>
          ) : (
            organizations.map((organization) => (
              <TableRow key={organization.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {organization.img_url ? (
                      <img 
                        src={getThumbnailUrl(organization.img_url, 48)} 
                        alt={organization.name}
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-8 h-8 bg-muted rounded">
                        <Users className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{organization.name}</div>
                      {organization.head_name && (
                        <div className="text-xs text-muted-foreground">
                          Kepala: {organization.head_name}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <RichTextDisplay 
                    content={organization.excerpt || organization.description}
                    isDetailView={false}
                    maxLength={80}
                    fallback="Tidak ada deskripsi"
                  />
                </TableCell>
                <TableCell className='text-center flex'>
                  <Users className='w-4' />
                  <span>  {organization.user_count}</span>
                </TableCell>
                <TableCell>
                  {format(new Date(organization.created_at), 'dd MMM yyyy', { locale: id })}
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