import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@workspace/ui/components/input';
import { cn } from '@workspace/ui/lib/utils';

interface SearchContainerProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchContainer: React.FC<SearchContainerProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = "Cari...",
  className
}) => {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-9"
      />
    </div>
  );
};

export default SearchContainer;