import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

interface PaginationProps {
  currentPage: number;
  totalPages?: number;
  itemsPerPage: number;
  totalItems?: number;
  hasNext?: boolean;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: string) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  hasNext = false,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const showPageNumbers = totalPages !== undefined && totalPages > 0;

  const getPageNumbers = () => {
    if (!showPageNumbers) return [];

    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages! <= maxPagesToShow) {
      for (let i = 1; i <= totalPages!; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages! - 1, currentPage + 1);

      if (currentPage <= 2) {
        endPage = 4;
      } else if (currentPage >= totalPages! - 1) {
        startPage = totalPages! - 3;
      }

      if (startPage > 2) {
        pageNumbers.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages! - 1) {
        pageNumbers.push("...");
      }

      pageNumbers.push(totalPages!);
    }

    return pageNumbers;
  };

  const startItem = totalItems && totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : currentPage * itemsPerPage;

  const isNextDisabled = showPageNumbers ? currentPage >= totalPages! : !hasNext;

  return (
    <div className="w-full pt-8">
      <div className="p-4 border border-secondary rounded-md bg-primary text-popover">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 sm:mb-0">
            <span className="text-sm text-popover">
              {totalItems !== undefined ? (
                `Menampilkan ${startItem} - ${endItem} dari ${totalItems} entri`
              ) : (
                `Menampilkan ${startItem} - ${endItem} entri`
              )}
            </span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={onItemsPerPageChange}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4 text-primary" />
            </Button>

            {showPageNumbers ? (
              getPageNumbers().map((page, index) =>
                typeof page === "number" ? (
                  <Button
                    key={index}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className={`h-8 w-8 p-0 ${currentPage === page ? 'text-popover' : 'text-primary'}`}
                  >
                    {page}
                  </Button>
                ) : (
                  <span key={index} className="mx-1 text-primary">
                    ...
                  </span>
                )
              )
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-primary px-2">
                  Halaman {currentPage}
                </span>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={isNextDisabled}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4 text-primary" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pagination;