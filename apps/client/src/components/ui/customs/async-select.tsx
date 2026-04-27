"use client";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDebounce } from "@/hooks";
import { cn } from "@/lib/utils";

export interface Option {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: React.ReactNode;
}

export interface AsyncSelectProps<T> {
  listOpen?: boolean;

  setListOpen?: (value: boolean) => void;
  /** Async function to fetch options */
  fetcher: (query?: string) => Promise<T[]>;
  /** Preload all data ahead of time */
  preload?: boolean;
  /** Function to filter options */
  filterFn?: (option: T, query: string) => boolean;
  /** Function to render each option */
  renderOption: (option: T) => React.ReactNode;
  /** Function to get the value from an option */
  getOptionValue: (option: T) => string;
  /** Function to get the display value for the selected option */
  getDisplayValue: (option: T) => React.ReactNode;
  /** Custom not found message */
  notFound?: React.ReactNode;
  /** Custom loading skeleton */
  loadingSkeleton?: React.ReactNode;
  /** Currently selected value */
  value: string;
  /** Callback when selection changes */
  onChange: (value: string) => void;
  /** Label for the select field */
  label: string;
  /** Placeholder text when no selection */
  placeholder?: string;
  /** Disable the entire select */
  disabled?: boolean;
  /** Custom width for the popover */
  width?: string | number;
  /** Custom class names */
  className?: string;
  /** Custom trigger button class names */
  triggerClassName?: string;
  /** Custom no results message */
  noResultsMessage?: string;
  /** Allow clearing the selection */
  clearable?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Show reset button */
  showReset?: boolean;
  /** Custom reset button class names */
  resetButtonClassName?: string;
  /** Custom class names */
  commandItemClassName?: string;

  children?: React.ReactNode;

  commandInputClassName?: string;

  commandInputParentClassName?: string;

  isCheckable?: boolean;

  searchChildrenClassName?: string;

  serachInputClassName?: string;

  isCustom?: boolean

}

export function AsyncSelect<T>({
  fetcher,
  preload,
  filterFn,
  renderOption,
  getOptionValue,
  getDisplayValue,
  notFound,
  loadingSkeleton,
  label,
  placeholder = "Select...",
  value,
  onChange,
  disabled = false,
  width,
  className,
  triggerClassName,
  noResultsMessage,
  clearable = true,
  loading,
  showReset = true,
  resetButtonClassName,
  commandItemClassName,
  children,
  commandInputClassName,
  commandInputParentClassName,
  isCheckable = false,
  searchChildrenClassName,
  serachInputClassName,
  isCustom,
  listOpen,
  setListOpen,
  ...props
}: AsyncSelectProps<T>) {
  const [mounted, setMounted] = useState(false);
  const [defaultOpen, setDefaultOpen] = useState(false);
  const [options, setOptions] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState(value);
  const [selectedOption, setSelectedOption] = useState<T | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, preload ? 0 : 300);
  const [originalOptions, setOriginalOptions] = useState<T[]>([]);

  const open = isCustom ? listOpen : defaultOpen;
  const setOpen = isCustom ? setListOpen : setDefaultOpen;

  useEffect(() => {
    setMounted(true);
    setSelectedValue(value);
  }, [value]);

  // Initialize selectedOption when options are loaded and value exists
  useEffect(() => {
    if (value && options?.length > 0) {
      const option = options.find((opt) => getOptionValue(opt) === value);
      if (option) {
        setSelectedOption(option);
      }
    }
  }, [value, options, getOptionValue]);

  // Effect for initial fetch
  useEffect(() => {
    const initializeOptions = async () => {
      try {
        setError(null);
        // If we have a value, use it for the initial search
        const data = await fetcher(value);
        setOriginalOptions(data);
        setOptions(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch options"
        );
      }
    };

    if (!mounted) {
      initializeOptions();
    }
  }, [mounted, fetcher, value]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setError(null);
        const data = await fetcher(debouncedSearchTerm);
        setOriginalOptions(data);
        setOptions(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch options"
        );
      }
    };

    if (!mounted) {
      fetchOptions();
    } else if (!preload) {
      fetchOptions();
    } else if (preload) {
      if (debouncedSearchTerm) {
        setOptions(
          originalOptions.filter((option) =>
            filterFn ? filterFn(option, debouncedSearchTerm) : true
          )
        );
      } else {
        setOptions(originalOptions);
      }
    }
  }, [fetcher, debouncedSearchTerm, mounted, preload, filterFn]);

  const handleSelect = useCallback(
    (currentValue: string) => {
      const newValue =
        clearable && currentValue === selectedValue ? "" : currentValue;
      setSelectedValue(newValue);
      setSelectedOption(
        options.find((option) => getOptionValue(option) === newValue) || null
      );
      onChange(newValue);
      setOpen?.(false);
    },
    [selectedValue, onChange, clearable, options, getOptionValue]
  );

  const handleReset = useCallback(() => {
    setSelectedValue("");
    setSelectedOption(null);
    onChange("");
  }, [onChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between h-8 pr-1",
            disabled && "opacity-50 cursor-not-allowed",
            triggerClassName
          )}
          style={{ width: width }}
          disabled={disabled}
        >
          <div className="flex items-center justify-between w-full">
            <span className="max-w-full inline-block text-left text-ellipsis overflow-hidden flex-1">
              {selectedOption ? getDisplayValue(selectedOption) : placeholder}
            </span>
            <div className="flex items-center gap-1">
              {selectedValue ? (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      handleReset();
                    }
                  }}
                  className={cn(
                    "text-muted-foreground hover:text-foreground rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 disabled:pointer-events-none cursor-pointer px-2",
                    disabled && "opacity-50 cursor-not-allowed",
                    resetButtonClassName
                  )}
                  aria-label="Clear selection"
                >
                  <span className="text-lg">×</span>
                </div>
              ) : (
                <ChevronsUpDown className="opacity-50" size={10} />
              )}
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent style={{ width: width }} className={cn("p-0", className)}>
        <Command shouldFilter={false}>
          <div className={cn("flex flex-col w-full border-b", commandInputParentClassName)}>
            <div className={cn("w-full", serachInputClassName)}>
              <CommandInput
                placeholder={`Search ${label.toLowerCase()}...`}
                value={searchTerm}
                onValueChange={(value) => {
                  setSearchTerm(value);
                }}
                className={cn("border-none", commandInputClassName)}
              />
              {loading && options.length > 0 && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
            </div>
            <div className={cn("", searchChildrenClassName)}>{children}</div>
          </div>
          <CommandList className="[&::-webkit-scrollbar]:w-2
                            [&::-webkit-scrollbar-thumb]:bg-gray-400
                            [&::-webkit-scrollbar-thumb]:rounded-full
                            [&::-webkit-scrollbar-track]:bg-gray-200">
            {error && (
              <div className="p-4 text-destructive text-center">{error}</div>
            )}
            {loading &&
              options?.length === 0 &&
              (loadingSkeleton || <DefaultLoadingSkeleton />)}
            {!loading &&
              !error &&
              options?.length === 0 &&
              (notFound || (
                <CommandEmpty>
                  {noResultsMessage ?? `No ${label.toLowerCase()} found.`}
                </CommandEmpty>
              ))}
            <CommandGroup>
              {options?.map((option) => {
                const isSelected = selectedValue === getOptionValue(option);
                return (
                  <CommandItem
                    key={getOptionValue(option)}
                    value={getOptionValue(option)}
                    onSelect={handleSelect}
                    className={cn(commandItemClassName, isSelected && !isCheckable && "bg-gray-200")}
                    disabled={(option as Option).disabled}
                  >
                    {renderOption(option)}
                    {isCheckable && (
                      <Check
                        className={cn(
                          "ml-auto h-3 w-3",
                          isSelected
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function DefaultLoadingSkeleton() {
  return (
    <CommandGroup>
      {[1, 2, 3].map((i) => (
        <CommandItem key={i} disabled>
          <div className="flex items-center gap-2 w-full">
            <div className="h-6 w-6 rounded-full animate-pulse bg-muted" />
            <div className="flex flex-col flex-1 gap-1">
              <div className="h-4 w-24 animate-pulse bg-muted rounded" />
              <div className="h-3 w-16 animate-pulse bg-muted rounded" />
            </div>
          </div>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}
