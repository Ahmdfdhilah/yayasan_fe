import * as React from "react"
import { Check, ChevronsUpDown, Search, Loader2 } from "lucide-react"
import { Command as CommandPrimitive } from "cmdk"
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"

// Basic components from your existing Combobox
const ComboboxRoot = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
      className
    )}
    {...props}
  />
))
ComboboxRoot.displayName = CommandPrimitive.displayName

const ComboboxInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  </div>
))
ComboboxInput.displayName = CommandPrimitive.Input.displayName

const ComboboxEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm"
    {...props}
  />
))
ComboboxEmpty.displayName = CommandPrimitive.Empty.displayName

const ComboboxGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    )}
    {...props}
  />
))
ComboboxGroup.displayName = CommandPrimitive.Group.displayName

const ComboboxSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-border", className)}
    {...props}
  />
))
ComboboxSeparator.displayName = CommandPrimitive.Separator.displayName

const ComboboxItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground",
      className
    )}
    {...props}
  >
    <Check className="mr-2 h-4 w-4 opacity-0 aria-selected:opacity-100" />
    {children}
  </CommandPrimitive.Item>
))
ComboboxItem.displayName = CommandPrimitive.Item.displayName

const ComboboxList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List> & {
    onScroll?: (e: React.UIEvent<HTMLDivElement>) => void
  }
>(({ className, onScroll, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    onScroll={onScroll}
    {...props}
  />
))
ComboboxList.displayName = CommandPrimitive.List.displayName

const ComboboxButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
  </button>
))
ComboboxButton.displayName = "ComboboxButton"

// New enhanced Combobox component that accepts options, value, onChange, etc.
interface ComboboxOption {
  value: string | number
  label: string
  description?: string
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  hasNextPage: boolean
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string | number | null
  onChange: (value: string | number) => void
  placeholder?: string
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  emptyMessage?: string
  className?: string
  isLoading?: boolean
  // Infinite scrolling props
  enableInfiniteScroll?: boolean
  onLoadMore?: () => void
  hasNextPage?: boolean
  isLoadingMore?: boolean
  pagination?: PaginationInfo
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  emptyMessage = "No results found.",
  className,
  isLoading = false,
  enableInfiniteScroll = false,
  onLoadMore,
  hasNextPage = false,
  isLoadingMore = false,
  pagination
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [internalSearchValue, setInternalSearchValue] = React.useState("")
  const selectedOption = options.find(option => option.value === value)
  const listRef = React.useRef<HTMLDivElement>(null)

  // Use external search value if provided, otherwise use internal
  const currentSearchValue = onSearchChange ? searchValue : internalSearchValue
  const handleSearchChange = onSearchChange || setInternalSearchValue

  const handleSelect = React.useCallback((optionValue: string | number) => {
    onChange(optionValue)
    setOpen(false)
    if (!onSearchChange) {
      setInternalSearchValue("")
    }
  }, [onChange, onSearchChange])

  // Infinite scroll handler
  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!enableInfiniteScroll || !onLoadMore || isLoadingMore || !hasNextPage) return

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const scrollThreshold = 50 // Load more when 50px from bottom

    if (scrollHeight - scrollTop <= clientHeight + scrollThreshold) {
      onLoadMore()
    }
  }, [enableInfiniteScroll, onLoadMore, isLoadingMore, hasNextPage])

  // Reset scroll position when search changes
  React.useEffect(() => {
    if (listRef.current && currentSearchValue) {
      listRef.current.scrollTop = 0
    }
  }, [currentSearchValue])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ComboboxButton className={className}>
          {selectedOption ? selectedOption.label : placeholder}
        </ComboboxButton>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <ComboboxRoot shouldFilter={false}>
          <ComboboxInput 
            placeholder={searchPlaceholder} 
            value={currentSearchValue}
            onValueChange={handleSearchChange}
          />
          <ComboboxList 
            ref={listRef}
            onScroll={enableInfiniteScroll ? handleScroll : undefined}
          >
            {isLoading && options.length === 0 ? (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </div>
            ) : options.length > 0 ? (
              <>
                {options.map((option) => (
                  <div
                    key={option.value}
                    className="relative flex cursor-pointer select-none items-start rounded-sm px-3 py-2 text-sm outline-none hover:bg-primary hover:text-accent-foreground"
                    onClick={() => handleSelect(option.value)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <div className="flex flex-col gap-1 w-full">
                      <div className="font-medium leading-none">
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="text-xs leading-none">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Load more indicator */}
                {enableInfiniteScroll && isLoadingMore && (
                  <div className="flex items-center justify-center py-4 text-sm text-muted-foreground border-t">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading more...
                  </div>
                )}
                
                {/* Pagination info */}
                {enableInfiniteScroll && pagination && (
                  <div className="px-3 py-2 text-xs text-muted-foreground border-t bg-muted/20">
                    Showing {options.length} of {pagination.totalItems} items
                    {pagination.hasNextPage && !isLoadingMore && (
                      <span className="block mt-1">Scroll down for more results</span>
                    )}
                  </div>
                )}
              </>
            ) : (
              <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
            )}
          </ComboboxList>
        </ComboboxRoot>
      </PopoverContent>
    </Popover>
  )
}

// Export everything
export {
  ComboboxRoot,
  ComboboxInput,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxSeparator,
  ComboboxEmpty,
  ComboboxButton,
}