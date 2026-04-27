import { useCustomProfile as useCustomProfileHook } from "@/hooks/use-custom-profile-handler";

export interface CustomProfile {
  _id: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const useCustomProfile = (userId: string) => {
  const { customProfile, isLoading, isSuccess, isError, refetchProfile } =
    useCustomProfileHook(userId);

  return {
    customProfile,
    isLoading,
    isSuccess,
    isError,
    refetchProfile,
  };
};
