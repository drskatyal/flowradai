import { serverAxios } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";

export interface CouponCode {
    _id: string;
    code: string;
    name?: string;
    days: number;
    allowedUsers: Array<{ _id: string; firstName: string; lastName: string; email: string }>;
    allowToAllUsers?: boolean;
    isActive: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCouponCodeData {
    code: string;
    name?: string;
    days: number;
    allowedUsers: string[];
    allowToAllUsers?: boolean;
    isActive?: boolean;
}

export interface CouponCodeQueryOptions {
    enabled?: boolean;
    staleTime?: number;
    refetchOnWindowFocus?: boolean;
    refetchOnMount?: boolean;
    limit?: number;
    skip?: number;
    search?: string;
}

export const useCreateCouponCode = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (data: CreateCouponCodeData & { id?: string }) => {
            const response = await serverAxios.post(
                "/coupon-code/createOrUpdateCouponCode",
                data
            );
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["couponCodes"] });
            toast({
                title: "Success",
                description: variables.id
                    ? "Coupon code updated successfully"
                    : "Coupon code created successfully",
            });
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { error?: string } } };
            toast({
                title: "Error",
                description:
                    err.response?.data?.error || "Failed to save coupon code",
                variant: "destructive",
            });
        },
    });
};

export const useDeleteCouponCode = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await serverAxios.delete(
                `/coupon-code/deleteCouponCode?id=${id}`
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["couponCodes"] });
            toast({
                title: "Success",
                description: "Coupon code deleted successfully",
            });
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { error?: string } } };
            toast({
                title: "Error",
                description:
                    err.response?.data?.error || "Failed to delete coupon code",
                variant: "destructive",
            });
        },
    });
};

export const useToggleCouponCodeStatus = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await serverAxios.post(
                "/coupon-code/toggleCouponCodeStatus",
                { id }
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["couponCodes"] });
            toast({
                title: "Success",
                description: "Coupon code status updated successfully",
            });
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { error?: string } } };
            toast({
                title: "Error",
                description:
                    err.response?.data?.error || "Failed to update coupon code status",
                variant: "destructive",
            });
        },
    });
};

export const useGenerateCouponCode = () => {
    return useQuery({
        queryKey: ["generateCouponCode", Math.random()],
        queryFn: async () => {
            const response = await serverAxios.get("/coupon-code/generateCouponCode");
            return response.data;
        },
        enabled: false,
    });
};

export const useCouponCode = (
    id: string,
    options: CouponCodeQueryOptions = {}
) => {
    return useQuery({
        queryKey: ["couponCode", id],
        queryFn: async () => {
            const response = await serverAxios.get(
                `/coupon-code/getCouponCodeById?id=${id}`
            );
            return response.data;
        },
        enabled: !!id,
        ...options,
    });
};

export const useCouponCodes = (options: CouponCodeQueryOptions = {}) => {
    const { limit = 10, skip = 0, search, ...queryOptions } = options;

    return useQuery({
        queryKey: ["couponCodes", limit, skip, search],
        queryFn: async () => {
            const response = await serverAxios.get("/coupon-code/getCouponCodes", {
                params: { limit, skip, search },
            });
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...queryOptions,
    });
};