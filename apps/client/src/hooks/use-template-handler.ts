import { serverAxios } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";

export interface Template {
  _id: string;
  title: string;
  description: string;
  category: string | null;
  userId: string;
  type: "private" | "public";
  specialityId: string;
  embedding?: number[];
  prompt: string;
  createdAt: string;
  updatedAt: string;
  originalTemplateId?: string;
}

export interface CreateTemplateData {
  title: string;
  description: string;
  type?: "private" | "public";
  category: string | null;
  specialityId?: string;
  prompt: string;
}

export interface UpdateTemplateData {
  title?: string;
  description?: string;
  category?: string | null;
  specialityId?: string;
  prompt: string;
}

export interface TemplateQueryOptions {
  enabled?: boolean;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
}

export const useTemplates = (
  user: any,
  searchQuery = "",
  limit = 10,
  skip = 0,
  specialtyIds: string[] = [],
  categories: string[] = [],
  types: string[] = [],
  showMarketplace: boolean = false,
  options: TemplateQueryOptions = {}
) => {
  return useQuery({
    queryKey: [
      "templates",
      user?.specialityId,
      searchQuery,
      limit,
      skip,
      specialtyIds,
      categories,
      types,
      showMarketplace,
    ],
    queryFn: async () => {
      const specialtyParam =
        specialtyIds.length > 0
          ? `&specialtyIds=${specialtyIds.join(",")}`
          : "";
      const categoryParam =
        categories.length > 0 ? `&categories=${categories.join(",")}` : "";
      const typeParam = types.length > 0 ? `&types=${types.join(",")}` : "";
      const response = await serverAxios.get(
        `/template?search=${searchQuery}&limit=${limit}&skip=${skip}${specialtyParam}${categoryParam}${typeParam}&showMarketplace=${showMarketplace}&userSpecialityId=${user.specialityId}`
      );
      return response.data;
    },
    enabled: !!user && !!user.specialityId,
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

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTemplateData;
    }) => {
      const sanitizedData = {
        ...data,
        category: !!data?.category ? data?.category : null,
        specialityId: !!data?.specialityId ? data.specialityId : null,
      };
      const response = await serverAxios.put(`/template/${id}`, sanitizedData);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["template", variables.id] });
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

export const useCloneTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await serverAxios.post("/template/clone", { id });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast({
        title: "Success",
        description: "Template added to your profile",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to clone template",
        variant: "destructive",
      });
    },
  });
};

export const useBulkCloneTemplates = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await serverAxios.post("/template/bulk-clone", { ids });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast({
        title: "Success",
        description: "Selected templates added to your profile",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to clone templates",
        variant: "destructive",
      });
    },
  });
};
