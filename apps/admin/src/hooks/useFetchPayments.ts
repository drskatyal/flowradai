import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  referralCode: string;
  availableCredits: number;
  totalCredits: number;
  clerkId: string;
  createdAt: string;
}

interface Payment {
  _id: string;
  userId: User;
  status: string;
  paymentType: string;
  paymentId: string;
  threadsQuantity: number;
  unitPrice: number;
  totalAmount: number;
  orderId: string;
  createdAt: string;
}

interface Pagination {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  totalPages: number;
  currentPage: number;
}

interface PaymentResponse {
  success: boolean;
  data: {
    payments: Payment[];
    pagination: {
      pages: number;
      currentPage: number;
    };
  };
}

interface PaymentFilters {
  search?: string;
  status?: string | string[];
  role?: string | string[];
  tier?: string | string[];
  paymentType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

const useFetchPayments = (initialFilters?: PaymentFilters) => {
  const { getToken } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    hasPreviousPage: false,
    hasNextPage: false,
    totalPages: 0,
    currentPage: 1,
  });
  const [filters, setFilters] = useState<PaymentFilters>({
    page: 1,
    limit: 10,
    ...initialFilters,
  });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();

      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== null) {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              queryParams.append(key, value.join(","));
            }
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const response = await axios.get<PaymentResponse>(
        `${process.env.NEXT_PUBLIC_API_URL
        }/payment/all?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setPayments(response.data.data.payments);
        const { pages, currentPage } = response.data.data.pagination;
        setPagination({
          totalPages: pages,
          currentPage,
          hasPreviousPage: currentPage > 1,
          hasNextPage: currentPage < pages,
        });
      } else {
        throw new Error("Failed to fetch payments");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch payments";
      setError(errorMessage);
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [filters]);

  const updateFilters = (newFilters: Partial<PaymentFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const downloadExcel = async () => {
    try {
      const token = await getToken();
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== null) {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              queryParams.append(key, value.join(","));
            }
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/payment/export?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const data = response.data.data;
        if (data.length === 0) {
          alert("No data to export");
          return;
        }

        const xlsx = await import("xlsx");

        const formattedData = data.map((row: any) => ({
          "User Name": row.userName,
          "Email": row.email,
          "Subscription Plan": row.plan,
          "Currency": row.currency,
          "Base Amount": row.baseAmount,
          "GST Amount": row.gstAmount,
          "Total Paid Amount": row.totalAmount,
          "Payment Date": new Date(row.date).toLocaleDateString(),
          "Payment ID": row.transactionId,
        }));

        const worksheet = xlsx.utils.json_to_sheet(formattedData);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, "Payments");

        // Generate Excel file
        xlsx.writeFile(
          workbook,
          `payments_export_${new Date().toISOString().split("T")[0]}.xlsx`
        );
      }
    } catch (err) {
      console.error("Error downloading Excel:", err);
      alert("Failed to download Excel");
    }
  };

  return {
    payments,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    downloadExcel,
    refetch: fetchPayments,
  };
};

export default useFetchPayments;
