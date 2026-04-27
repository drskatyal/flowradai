import { serverAxios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface DBUser {
  _id: string;
  clerkId: string;
  firstName: string;
  lastName?: string;
  email: string;
  availableCredits: number;
  totalCredits: number;
  referralCode: string;
  status: "active" | "inactive" | "onboarding";
  specialityId: string;
  autoTemplate: boolean;
  actionMode: boolean;
  defaultTranscriptionModel: "v2" | "v1" | "v0";
  isErrorCheck: boolean;
  isReportGuideline: boolean;
  isTextAutoCorrection: boolean;
  voiceCommandsEnabled: boolean;
  reportEmail: string;
  createdAt: string;
  updatedAt: string;
}

export const useDbUser = (userId: string) => {
  const { data, isLoading, isSuccess, isError, refetch } = useQuery<DBUser>({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await serverAxios.get(`/users/${userId}`);
      return response?.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // Consider data stale after 2 minutes
    gcTime: 1000 * 60 * 10, // Keep cached data for 10 minutes
    refetchOnMount: true, // Always refetch when the hook mounts
    refetchOnWindowFocus: true, // Refetch when the window gains focus
    retry: false,
  });

  return {
    user: data,
    isLoading,
    isSuccess,
    isError,
    refetch,
  };
};
