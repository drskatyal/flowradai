import { useToast } from "@/hooks";
import { serverAxios } from "@/lib/axios";
import { ExtendedUserPublicMetadata } from "@/modules/home/navbar";
import { pricingSchema } from "@/modules/pricing/schemas";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export interface CreatePaymentLinkPayload {
  planSlug: string;
  isCurrency: boolean;
}

export const useCreatePaymentLink = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const router = useRouter();

  const referredBy = (user?.publicMetadata as ExtendedUserPublicMetadata)
    ?.referral?.by;

  const mutation = useMutation<string, Error, CreatePaymentLinkPayload>({
    mutationFn: async (paymentLinkPayload) => {
      const sanitizedPayload = pricingSchema.parse(paymentLinkPayload);

      const { data } = await serverAxios.post("/payment/create", {
        ...sanitizedPayload,
        name: user?.fullName,
        email: user?.emailAddresses?.[0]?.emailAddress,
        referredBy,
      });

      return data;
    },

    onSuccess: (paymentLink) => {
      if (paymentLink) router.push(paymentLink);
    },

    onError: (error) => {
      toast({
        title: "Failed to Process Payment",
        description:
          "We encountered an issue while processing your payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    paymentLink: mutation.data,
    createPaymentLink: mutation.mutate,
    isLoading: mutation.isPending,
  };
};