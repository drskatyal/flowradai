import { Message } from "@/interfaces/message";
import { serverAxios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useMessage = (threadId: string) => {
  const { data, isLoading, isSuccess, isError, refetch } = useQuery<Message[]>({
    queryKey: ["messages", threadId],
    queryFn: async () => {
      const response = await serverAxios.get(`/message/${threadId}`);

      return response?.data;
    },
    enabled: !!threadId,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    // Avoid showing previous thread's data while new thread is loading
    gcTime: 1000 * 60 * 10,
    retry: false,
    // Don't keep previous data when switching threads - always fetch fresh
    staleTime: 0,
    // Ensure data is always an array (API should return array, but be safe)
    select: (data) => (Array.isArray(data) ? data : []),
  });

  return {
    messages: data,
    isLoading,
    isSuccess,
    isError,
    refetchMessages: refetch,
  };
};
