import { serverAxios } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
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
    limit?: number;
    skip?: number;
}

export const useCreateMacro = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

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
    const { toast } = useToast();

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
    const { toast } = useToast();

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
    const { toast } = useToast();

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

export const useMacros = (options: MacroQueryOptions = {}) => {
    const { limit = 10, skip = 0, ...queryOptions } = options;

    return useQuery({
        queryKey: ["macros", limit, skip],
        queryFn: async () => {
            const response = await serverAxios.get("/macro/getMacros", {
                params: { limit, skip }
            });
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...queryOptions,
    });
};