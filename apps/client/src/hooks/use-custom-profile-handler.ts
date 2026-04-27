import { serverAxios } from "@/lib/axios";
import { CustomProfile } from "@/modules/home/custom-profile/hooks/use-custom-profile";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useCustomProfile = (userId: string) => {
  const { data, isLoading, isSuccess, isError, refetch } = useQuery<CustomProfile>({
    queryKey: ["customProfile"],
    queryFn: async () => {
      const response = await serverAxios.get("/custom-profile");
      return response.data.data;
    },
    enabled: !!userId,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  return {
    customProfile: data,
    isLoading,
    isSuccess,
    isError,
    refetchProfile: refetch,
  };
};

export const useSaveCustomProfile = () => {
  const { mutate, isPending, isSuccess, isError } = useMutation({
    mutationFn: async (content: string ) => {
      const response = await serverAxios.post("/custom-profile", { content });
      return response.data;
    },
  });

  return {
    saveCustomProfile: mutate,
    isSaving: isPending,
    isSuccess: isSuccess,
    isError: isError,
  };
};
