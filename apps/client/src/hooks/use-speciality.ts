import { serverAxios } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";

export interface Prompt {
  _id: string,
  specialityId: string,
  elaborateInstruction?: string,
  structuredReportingApproachInstruction?: string,
  regularInstruction?: string,
  defaultGrokInstructions?: string,
  defaultOpenaiInstructions?: string,
  defaultGeminiInstructions?: string,
  templateRegularInstruction?: string,
  textCorrectionInstruction?: string,
  refinementInstruction?: string,
  disabledRefinementInstructions?: string,
  actionModeRefinementInstruction?: string,
  wishperInstruction?: string,
  reportErrorValidationInstruction?: string,
  reportGuidelineInstruction?: string
}

export interface Speciality {
  _id: string,
  name: string,
  description: string,
  active: boolean,
  specialityButtonLabel?: string,
  prompt: Prompt
}

export interface CreateSpecialityData {
  name: string;
  description?: string,
  specialityButtonLabel?: string,
  elaborateButtonLabel?: string,
  active?: boolean,
  elaborateInstruction?: string,
  structuredReportingApproachInstruction?: string,
  regularInstruction?: string,
  defaultGrokInstructions?: string,
  defaultOpenaiInstructions?: string,
  defaultGeminiInstructions?: string,
  templateRegularInstruction?: string,
  textCorrectionInstruction?: string,
  refinementInstruction?: string,
  disabledRefinementInstructions?: string,
  actionModeRefinementInstruction?: string,
  wishperInstruction?: string,
  reportErrorValidationInstruction?: string,
  reportGuidelineInstruction?: string
}

export interface SpecilaityQueryOptions {
  enabled?: boolean;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
}

export const useCreateSpeciality = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateSpecialityData) => {
      const response = await serverAxios.post("/speciality", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialities"] });
      toast({
        title: "Success",
        description: "Specilaity created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create specilaity",
        variant: "destructive",
      });
    },
  });
};

export const useSpecialities = (
  searchQuery = "",
  limit = 0,
  skip = 0,
  options: SpecilaityQueryOptions = {}
) => {
  return useQuery({
    queryKey: ["specialities", searchQuery, limit, skip],
    queryFn: async () => {
      const response = await serverAxios.get(
        `/speciality?search=${searchQuery}&limit=${limit}&skip=${skip}`
      );
      return response.data;
    },
    staleTime: 0,
    refetchInterval: 30000,
    ...options,
  });
};

export const useSpeciality = (id?: string) => {
  return useQuery({
    queryKey: ["speciality", id],
    queryFn: async () => {
      const response = await serverAxios.get(`/speciality/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useUpdateSpeciality = (id: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateSpecialityData) => {
      const response = await serverAxios.put(`/speciality/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialities"] });
      queryClient.invalidateQueries({ queryKey: ["specilaity", id] });
      toast({
        title: "Success",
        description: "Speciality updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update speciality",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteSpeciality = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await serverAxios.delete(`/speciality/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialities"] });
      toast({
        title: "Success",
        description: "Speciality deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete speciality",
        variant: "destructive",
      });
    },
  });
};

export const useSpecialityList = () => {
  return useQuery<{ specialities: Speciality[] }>({
    queryKey: ["speciality-list"],
    queryFn: async () => {
      const response = await serverAxios.get("/speciality/speciality-list");
      return response.data;
    },
  });
};