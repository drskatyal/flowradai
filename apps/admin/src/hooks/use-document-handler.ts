import { serverAxios } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";

export interface Document {
    _id: string;
    title: string;
    description: string;
    category: string;
    userId: string;
    specialityId: string;
    prompt: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDocumentData {
    title: string;
    description: string;
    category: string;
    specialityId: string;
    prompt: string;
}

export interface UpdateDocumentData {
    title?: string;
    description?: string;
    category: string;
    specialityId: string;
    prompt: string;
}

export interface DocumentQueryOptions {
    enabled?: boolean;
    staleTime?: number;
    refetchOnWindowFocus?: boolean;
    refetchOnMount?: boolean;
}

export const useCreateDocument = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (data: CreateDocumentData) => {
            const sanitizedData = {
                ...data,
                category: !!data?.category ? data?.category : null,
            };
            const response = await serverAxios.post("/document", sanitizedData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["documents"] });
            toast({
                title: "Success",
                description: "Document created successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description:
                    error.response?.data?.message || "Failed to create document",
                variant: "destructive",
            });
        }
    })
}

export const useUpdateDocument = (id: string) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (data: UpdateDocumentData) => {
            const response = await serverAxios.put(`/document/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["documents"] });
            queryClient.invalidateQueries({ queryKey: ["document", id] });
            toast({
                title: "Success",
                description: "Document updated successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description:
                    error.response?.data?.message || "Failed to update document",
                variant: "destructive",
            });
        }
    })

}

export const useDeleteDocument = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await serverAxios.delete(`/document/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["documents"] });
            toast({
                title: "Success",
                description: "Document deleted successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description:
                    error.response?.data?.message || "Failed to delete document",
                variant: "destructive",
            });
        }
    })
}

export const useDocument = (id: string) => {
    return useQuery({
        queryKey: ["document", id],
        queryFn: async () => {
            const response = await serverAxios.get(`/document/${id}`);
            return response.data;
        },
        enabled: !!id
    })
}

export const useDocuments = (
    searchQuery = "",
    limit = 10,
    skip = 0,
    specialtyIds: string[] = [],
    categories: string[] = [],
    options: DocumentQueryOptions = {}
) => {
    return useQuery({
        queryKey: ["documents", searchQuery, limit, skip, specialtyIds, categories],
        queryFn: async () => {
            const specialtyParam = specialtyIds.length > 0
                ? `&specialtyIds=${specialtyIds.join(',')}`
                : '';
            const categoryParam = categories.length > 0
                ? `&categories=${categories.join(',')}`
                : '';
            const response = await serverAxios.get(
                `/document?search=${searchQuery}&limit=${limit}&skip=${skip}${specialtyParam}${categoryParam}`
            );
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    })
}