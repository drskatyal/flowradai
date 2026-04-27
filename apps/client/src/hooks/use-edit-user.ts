import { useToast } from "@/hooks";
import { serverAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

export interface EditUserPayload {
  status?: "onboarding" | "active" | "inactive";
  specialityId?: string;
  autoTemplate?: boolean;
  actionMode?: boolean;
  defaultTranscriptionModel?: "v2" | "v1" | "v0";
  isErrorCheck?: boolean;
  isReportGuideline?: boolean;
  reportEmail?: string;
  isTextAutoCorrection?: boolean;
  voiceCommandsEnabled?: boolean;
}

export interface EditUserResponse {
  _id: string;
  clerkId: string;
  firstName: string;
  lastName: string;
  email: string;
  specialityId: string;
  availableCredits: number;
  totalCredits: number;
  referralCode: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  status: "active" | "inactive" | "onboarding";
  autoTemplate: boolean;
  actionMode: boolean;
  defaultTranscriptionModel: "v2" | "v1" | "v0";
  isErrorCheck: boolean;
  isReportGuideline: boolean;
  reportEmail: string;
  isTextAutoCorrection: boolean;
  voiceCommandsEnabled: boolean;
}

export const useEditUser = (
  userId: string,
  onSuccess?: (data?: EditUserResponse) => void
) => {
  const { toast } = useToast();

  const mutation = useMutation<EditUserResponse, Error, EditUserPayload>({
    mutationFn: async (user) => {
      const { data } = await serverAxios.put(`/users/${userId}`, {
        ...user,
      });
      return data;
    },

    onSuccess: (data) => {
      if (onSuccess) onSuccess(data);
    },

    onError: () => {
      toast({
        title: "Failed to Update User",
        description:
          "We encountered an issue updating your user. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    user: mutation.data,
    editUser: mutation.mutate,
    isLoading: mutation.isPending,
  };
};
