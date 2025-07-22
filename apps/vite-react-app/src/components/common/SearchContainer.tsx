import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@workspace/ui/components/input';
import { cn } from '@workspace/ui/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchContainerProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  className?: string;
  debounceDelay?: number;
}

const SearchContainer: React.FC<SearchContainerProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = "Cari...",
  className,
  debounceDelay = 300
}) => {
  const [inputValue, setInputValue] = useState(searchQuery);
  const debouncedSearchQuery = useDebounce(inputValue, debounceDelay);

  useEffect(() => {
    onSearchChange(debouncedSearchQuery);
  }, [debouncedSearchQuery, onSearchChange]);

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="pl-9"
      />
    </div>
  );
};

export default SearchContainer;