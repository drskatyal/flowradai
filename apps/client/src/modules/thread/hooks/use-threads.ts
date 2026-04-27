import { serverAxios } from "@/lib/axios";
import { useAuth, useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useStore } from "@/stores/use-store";

export interface ThreadResponse {
  userId: string;
  threadId: string;
  name: string;
  status: "regular" | "archived" | "new" | "deleted";
  maxAllowedMessage: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  id: string;
}

export const useThreads = (threadId?: string) => {
  const { userId } = useAuth();
  const { isLoaded, isSignedIn } = useUser();
  const user = useStore((state) => state.user);
  
  const { data, isLoading, isSuccess, isError, refetch } = useQuery<
    ThreadResponse[]
  >({
    queryKey: ["threads", userId], // Include userId in query key to ensure unique caching per user
    
    queryFn: async () => {
      const response = await serverAxios.get("/thread");
      return response?.data;
    },
    
    enabled: !threadId && isLoaded && isSignedIn && !!userId,
    
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
    gcTime: 1000 * 60 * 30, // Keep cached data for 30 minutes (formerly cacheTime)
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Always refetch when component mounts
    
    retry: false,
  });

  // Force refetch when user changes or when userId becomes available
  useEffect(() => {
    if (userId && isSignedIn) {
      refetch();
    }
  }, [userId, isSignedIn, user?._id]);

  return {
    threads: data,
    isLoading,
    isSuccess,
    isError,
    refetchThreads: refetch,
  };
};
