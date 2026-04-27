import { serverAxios } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Speciality } from "./use-speciality";

export interface Macro {
    _id: string;
    userId: string;
    name: string;
    description: string;
    isActive: boolean;
    isPublic: boolean;
    specialityId?: Speciality;
    originalMacroId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateMacroData {
    name: string;
    description: string;
    isActive?: boolean;
    isPublic?: boolean;
    specialityId?: string;
}

export interface UpdateMacroData {
    id: string;
    name: string;
    description: string;
    isActive?: boolean;
    isPublic?: boolean;
    specialityId?: string;
}

export interface MacroQueryOptions {
    enabled?: boolean;
    staleTime?: number;
    refetchOnWindowFocus?: boolean;
    refetchOnMount?: boolean;
}

export const useCreateMacro = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateMacroData) => {
            const response = await serverAxios.post("/macro/createOrUpdateMacro", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["macros"] });
            toast({
                title: "Success",
                description: "Macro created successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to create macro",
                variant: "destructive",
            });
        }
    });
};

export const useUpdateMacro = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateMacroData) => {
            const response = await serverAxios.post("/macro/createOrUpdateMacro", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["macros"] });
            toast({
                title: "Success",
                description: "Macro updated successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to update macro",
                variant: "destructive",
            });
        }
    });
};

export const useDeleteMacro = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await serverAxios.delete(`/macro/deleteMacro?id=${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["macros"] });
            toast({
                title: "Success",
                description: "Macro deleted successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to delete macro",
                variant: "destructive",
            });
        }
    });
};

export const useCloneMacro = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await serverAxios.post("/macro/cloneMacro", { id });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["macros"] });
            toast({
                title: "Success",
                description: "Macro cloned successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to clone macro",
                variant: "destructive",
            });
        }
    });
};

export const useMacro = (id: string, options: MacroQueryOptions = {}) => {
    return useQuery({
        queryKey: ["macro", id],
        queryFn: async () => {
            const response = await serverAxios.get(`/macro/getMacroById?id=${id}`);
            return response.data;
        },
        enabled: !!id,
        ...options,
    });
};

export const useBulkCloneMacro = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (macroIds: string[]) => {
            const response = await serverAxios.post("/macro/bulkCloneMacros", { macroIds });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["macros"] });
        },
    });
};

export const useMacros = (params?: { limit?: number; skip?: number; search?: string; showMarketplace?: boolean; specialties?: string[] }, options: MacroQueryOptions = {}) => {

    return useQuery({
        queryKey: ["macros", params],
        queryFn: async () => {
            const queryParams = new URLSearchParams();
            if (params?.limit) queryParams.append("limit", params.limit.toString());
            if (params?.skip) queryParams.append("skip", params.skip.toString());
            if (params?.search) queryParams.append("search", params.search);
            if (params?.showMarketplace !== undefined) queryParams.append("showMarketplace", params.showMarketplace.toString());
            if (params?.specialties && params.specialties.length > 0) {
                queryParams.append("specialties", params.specialties.join(","));
            }

            const url = queryParams.toString() ? `/macro/getMacros?${queryParams.toString()}` : "/macro/getMacros";
            const response = await serverAxios.get(url);

            // Backend now returns {macros: [], count: number}
            return {
                macros: response.data?.macros || [],
                count: response.data?.count || 0
            };
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    });
};
