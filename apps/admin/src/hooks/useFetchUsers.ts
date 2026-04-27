import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

// User and Pagination Types
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  referralCode: string;
  availableCredits: number;
  totalCredits: number;
}

export type Pagination = {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  totalPages: number;
  currentPage: number;
};

interface UsersResponse {
  users: User[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    limit: number;
  };
}

interface FetchUsersFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

const useFetchUsers = (initialFilters?: FetchUsersFilters) => {
  const { getToken } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    hasPreviousPage: false,
    hasNextPage: false,
    totalPages: 0,
    currentPage: 1,
  });
  const [filters, setFilters] = useState<FetchUsersFilters>({
    page: 1,
    limit: 10,
    role: "user",
    search: "",
    ...initialFilters,
  });

  const fetchUsers = async (newFilters?: FetchUsersFilters) => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      const queryParams = new URLSearchParams();

      const currentFilters = { ...filters, ...newFilters };

      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          queryParams.append(key, value.toString());
        }
      });

      const response = await axios.get<UsersResponse>(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/users/all?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { users, pagination } = response.data;

      setUsers(users);
      setPagination({
        hasPreviousPage: pagination.currentPage > 1,
        hasNextPage: pagination.currentPage < pagination.pages,
        totalPages: pagination.pages,
        currentPage: pagination.currentPage,
      });

      setFilters(currentFilters);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch users";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePageChange = (newPage: number) => {
    fetchUsers({
      ...filters,
      page: newPage,
    });
  };

  const handleLimitChange = (newLimit: number) => {
    fetchUsers({
      ...filters,
      limit: newLimit,
      page: 1, // Reset to first page when changing the limit
    });
  };

  const updateFilters = (newFilters: FetchUsersFilters) => {
    fetchUsers(newFilters);
  };

  return {
    users,
    loading,
    error,
    pagination,
    filters,
    handlePageChange,
    handleLimitChange,
    updateFilters,
    refetch: fetchUsers,
  };
};

export default useFetchUsers;
