import { useToast } from "@/hooks";
import { serverAxios } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

export interface BoardingPayload {
    status?: "onboarding" | "active" | "inactive";
    specialityId?: string;
}

export interface BoardingResponse {
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
}

export const useBoarding = (
    clerkId: string,
    onSuccess?: (data?: BoardingResponse) => void
) => {
    const { toast } = useToast();

    const mutation = useMutation<BoardingResponse, Error, BoardingPayload>({
        mutationFn: async (user) => {
            const { data } = await serverAxios.put(`/users/clerk/${clerkId}`, {
                ...user,
            });
            return data;
        },

        onSuccess: (data) => {
            if (onSuccess) onSuccess(data);
        },

        onError: (error) => {
            toast({
                title: "Failed to onboard User",
                description:
                    "We encountered an issue onboarding your user. Please try again.",
                variant: "destructive",
            });
        },
    });

    return {
        user: mutation.data,
        updateUser: mutation.mutate,
        isLoading: mutation.isPending,
    };
};
