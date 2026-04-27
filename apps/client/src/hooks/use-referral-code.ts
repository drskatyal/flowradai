import { useToast } from "@/hooks";
import { serverAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

export const useVerifyReferralCode = (onSuccess?: (data?: any) => void) => {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (params: { referralCode?: string; isSkip?: boolean; }) => {
      const { referralCode, isSkip } = params;
      const { data } = await serverAxios.post(`/users/onboarding`, {
        referralCode: isSkip ? undefined : referralCode, // Avoid sending referralCode if skipping
        isSkip,
      });
      return data;
    },

    onSuccess: (data) => {
      if (onSuccess) onSuccess(data);
    },

    onError: (error, variables) => {
      // If skipping, don't show referral error
      if (variables.isSkip) return;
      toast({
        title: "Referral Code Not Found",
        description:
          "The referral code you entered is invalid. Please check the code and try again.",
        variant: "destructive",
      });
    },
  });

  return {
    status: mutation.data,
    verifyReferralCode: mutation.mutate,
    isLoading: mutation.isPending,
  };
};
