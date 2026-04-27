import { useToast } from "@/hooks";
import { serverAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

export const useSubscription =  () => {
    const { toast } = useToast();

    const mutation = useMutation({
      mutationFn: async (id: string) => {
        const { data } = await serverAxios.put(`/subscription/${id}`);
        return data;
      },
  
      onSuccess: (data) => {
        
      },
  
      onError: (error) => {
        toast({
          title: "Failed to get User subscription Plan",
          description:
            "We encountered an issue to fetch user subscription plan details. Please try again.",
          variant: "destructive",
        });
      },
    });
  
    return {
      planDetails: mutation.data,
      getUserPlan: mutation.mutate,
      isLoading: mutation.isPending,
    };
}