import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { Skeleton } from '@workspace/ui/components/skeleton';
import { BookOpen } from 'lucide-react';
import ActionDropdown from '@/components/common/ActionDropdown';
import { RichTextDisplay } from '@/components/common/RichTextDisplay';
import { Program } from '@/services/program/types';
import { getNewsImageUrl } from '@/utils/imageUtils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface ProgramTableProps {
  programs: Program[];
  loading: boolean;
  onView: (program: Program) => void;
  onEdit: (program: Program) => void;
  onDelete: (program: Program) => void;
}

const ProgramTableSkeleton = () => (
  <TableBody>
    {Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell>
          <div className="flex items-center gap-3">
            <Skeleton className="w-16 h-12 rounded" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </TableCell>
        <TableCell>
          <Skeleton className="h-4 w-20" />
        </TableCell>
        <TableCell>
          <Skeleton className="h-8 w-8 rounded" />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
);

export const ProgramTable: React.FC<ProgramTableProps> = ({
  programs,
  loading,
  onView,
  onEdit,
  onDelete
}) => {
  if (loading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Program</TableHead>
              <TableHead>Ringkasan</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <ProgramTableSkeleton />
        </Table>
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Program</TableHead>
              <TableHead>Ringkasan</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Tidak ada program ditemukan
                </h3>
                <p className="text-muted-foreground">
                  Belum ada data program yang tersedia saat ini.
                </p>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Program</TableHead>
            <TableHead>Ringkasan</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Dibuat</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {programs.map((program) => (
            <TableRow key={program.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 relative overflow-hidden rounded bg-muted flex-shrink-0">
                    {program.img_url ? (
                      <img
                        src={getNewsImageUrl(program.img_url)}
                        alt={program.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://picsum.photos/200/150?random=${program.id}`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-foreground truncate">
                      {program.title}
                    </h3>
                  </div>
                </div>
              </TableCell>
              <TableCell className="max-w-md">
                {program.excerpt ? (
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {program.excerpt}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground italic">
                    Tidak ada ringkasan
                  </span>
                )}
              </TableCell>
              <TableCell className="max-w-md">
                {program.description ? (
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    <RichTextDisplay content={program.description} />
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground italic">
                    Tidak ada deskripsi
                  </span>
                )}
              </TableCell>
              <TableCell>
                <div className="text-sm text-foreground">
                  {format(new Date(program.created_at), 'dd MMM yyyy', { locale: id })}
                </div>
              </TableCell>
              <TableCell>
                <ActionDropdown
                  onView={() => onView(program)}
                  onEdit={() => onEdit(program)}
                  onDelete={() => onDelete(program)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};