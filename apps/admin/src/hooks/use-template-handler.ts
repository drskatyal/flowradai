import { serverAxios } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";

export interface Template {
  _id: string;
  title: string;
  description: string;
  category: string;
  userId: string;
  type: "private" | "public";
  specialityId: string;
  prompt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateData {
  title: string;
  description: string;
  type?: "private" | "public";
  category: string;
  specialityId: string;
  prompt: string;
}

export interface UpdateTemplateData {
  title?: string;
  description?: string;
  category: string;
  specialityId: string;
  prompt: string;
}

export interface TemplateQueryOptions {
  enabled?: boolean;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
}

export const useTemplates = (
  searchQuery = "",
  limit = 10,
  skip = 0,
  specialtyIds: string[] = [],
  categories: string[] = [],
  options: TemplateQueryOptions = {}
) => {
  return useQuery({
    queryKey: ["templates", searchQuery, limit, skip, specialtyIds, categories],
    queryFn: async () => {
      const specialtyParam = specialtyIds.length > 0 
        ? `&specialtyIds=${specialtyIds.join(',')}`
        : '';
      const categoryParam = categories.length > 0
        ? `&categories=${categories.join(',')}`
        : '';
      const response = await serverAxios.get(
        `/template?search=${searchQuery}&limit=${limit}&skip=${skip}${specialtyParam}${categoryParam}`
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useTemplate = (id: string) => {
  return useQuery({
    queryKey: ["template", id],
    queryFn: async () => {
      const response = await serverAxios.get(`/template/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTemplateData) => {
      const sanitizedData = {
        ...data,
        category: !!data?.category ? data?.category : null,
        specialityId: !!data?.specialityId ? data.specialityId : null,
      };
      const response = await serverAxios.post("/template", sanitizedData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast({
        title: "Success",
        description: "Template created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create template",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateTemplate = (id: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateTemplateData) => {
      const sanitizedData = {
        ...data,
        category: !!data?.category ? data?.category : null,
        specialityId: !!data?.specialityId ? data.specialityId : null,
      };
      const response = await serverAxios.put(`/template/${id}`, sanitizedData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["template", id] });
      toast({
        title: "Success",
        description: "Template updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update template",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await serverAxios.delete(`/template/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete template",
        variant: "destructive",
      });
    },
  });
};
