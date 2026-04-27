"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { serverAxios } from "@/lib/axios";
import { useDebounce } from "@/hooks/use-debounce";

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
}

interface UserSelectorProps {
    value: string[];
    onChange: (value: string[]) => void;
    allowMultiple?: boolean;
    disabled?: boolean;
    lockedUsers?: string[]; // User IDs that cannot be removed
    width?: string | number;
    placeholder?: string;
}

export function UserSelector({
    value = [],
    onChange,
    allowMultiple = false,
    disabled = false,
    lockedUsers = [],
    width,
    placeholder = "Select user(s)...",
}: UserSelectorProps) {
    const [open, setOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Fetch users based on search term
    const fetchUsers = async (query?: string) => {
        setLoading(true);
        try {
            const response = await serverAxios.get("/users/all", {
                params: {
                    limit: 1000,
                    page: 1,
                    search: query || ""
                },
            });

            const usersData = response.data?.users || [];
            const validUsers = Array.isArray(usersData) ? usersData.filter((u: User) => u && u._id) : [];
            setUsers(validUsers);

            return validUsers;
        } catch (error) {
            console.error("Failed to fetch users:", error);
            setUsers([]);
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and search updates
    useEffect(() => {
        fetchUsers(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    // Get selected users for display
    const selectedUsers = users.filter((user) =>
        value.includes(user._id)
    );

    const handleSelect = (userId: string) => {
        if (!userId) return;

        const currentValue = Array.isArray(value) ? value : [];
        const safeLockedUsers = Array.isArray(lockedUsers) ? lockedUsers : [];

        if (allowMultiple) {
            if (currentValue.includes(userId)) {
                // Don't allow removing locked users
                if (safeLockedUsers.includes(userId)) {
                    return;
                }
                onChange(currentValue.filter((id) => id !== userId));
            } else {
                onChange([...currentValue, userId]);
            }
        } else {
            onChange([userId]);
            setOpen(false);
        }
    };

    const handleRemove = (userId: string) => {
        if (!userId) return;

        const safeLockedUsers = Array.isArray(lockedUsers) ? lockedUsers : [];
        // Don't allow removing locked users
        if (safeLockedUsers.includes(userId)) {
            return;
        }
        const currentValue = Array.isArray(value) ? value : [];
        onChange(currentValue.filter((id) => id !== userId));
    };

    const renderUser = (user: User) => (
        <div className="flex flex-col">
            <span className="font-medium">{`${user.firstName} ${user.lastName}`}</span>
            <span className="text-xs text-gray-500">{user.email}</span>
        </div>
    );

    return (
        <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "w-full justify-between",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                        style={{ width }}
                        disabled={disabled || loading}
                    >
                        {!Array.isArray(value) || value.length === 0
                            ? placeholder
                            : `${value.length} user(s) selected`}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent onWheel={(e) => e.stopPropagation()} className="w-full p-0" style={{ width }}>
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder="Search users..."
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                        />
                        <CommandList>
                            <CommandEmpty>
                                {loading ? "Loading users..." : "No user found."}
                            </CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-auto">
                                {users.map((user) => (
                                    <CommandItem
                                        key={user._id}
                                        value={user._id}
                                        onSelect={() => handleSelect(user._id)}
                                    >
                                        {renderUser(user)}
                                        <Check
                                            className={cn(
                                                "ml-auto h-4 w-4",
                                                value.includes(user._id) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => {
                        const safeLockedUsers = Array.isArray(lockedUsers) ? lockedUsers : [];
                        const isLocked = safeLockedUsers.includes(user._id);
                        return (
                            <Badge
                                key={user._id}
                                variant="secondary"
                                className="flex items-center gap-1"
                            >
                                {`${user.firstName} ${user.lastName}`}
                                {!isLocked && !disabled && (
                                    <X
                                        className="h-3 w-3 cursor-pointer hover:text-red-500"
                                        onClick={() => handleRemove(user._id)}
                                    />
                                )}
                            </Badge>
                        );
                    })}
                </div>
            )}
        </div>
    );
}