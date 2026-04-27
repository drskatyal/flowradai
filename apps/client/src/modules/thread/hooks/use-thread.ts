import { serverAxios } from "@/lib/axios";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { ThreadResponse } from "./use-threads";
import { useStore } from "@/stores/use-store";

export const useThread = (threadId: string) => {
  const { isLoaded, isSignedIn } = useUser();
  const user = useStore((state) => state.user);
  
  const { data, isLoading, isSuccess, isError, refetch } =
    useQuery<ThreadResponse>({
      queryKey: ["thread", threadId, user?._id],
      queryFn: async () => {
        const response = await serverAxios.get(`/thread/${threadId}`);
        return response?.data;
      },
      enabled: !!threadId && isLoaded && isSignedIn,
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      retry: false,
    });

  return {
    thread: data,
    isLoading,
    isSuccess,
    isError,
    refetch,
  };
};
