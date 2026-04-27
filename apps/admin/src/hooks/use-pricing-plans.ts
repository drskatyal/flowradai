import { serverAxios } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";

export interface PricingPlan {
    id: string;
    name: string;
    slug: string;
    subscriptionType: "regular" | "monthly" | "yearly";
    threadsQuantity: number;
    usdPrice: number;
    inrPrice: number;
    gstPercent: number;
    features: string[];
    highlighted: boolean;
    isActive: boolean;
    sortOrder: number;
}

export type PricingPlanInput = Omit<PricingPlan, "id">;

export const usePricingPlans = () => {
    return useQuery<PricingPlan[]>({
        queryKey: ["pricing-plans"],
        queryFn: async () => {
            const { data } = await serverAxios.get("/plans?includeInactive=true");
            return data.data;
        },
        staleTime: 2 * 60 * 1000,
    });
};

export const useCreatePricingPlan = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (data: PricingPlanInput) => {
            const res = await serverAxios.post("/plans", data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pricing-plans"] });
            toast({ title: "Plan created successfully" });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err?.response?.data?.message || "Failed to create plan", variant: "destructive" });
        },
    });
};

export const useUpdatePricingPlan = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<PricingPlanInput> }) => {
            const res = await serverAxios.put(`/plans/${id}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pricing-plans"] });
            toast({ title: "Plan updated successfully" });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err?.response?.data?.message || "Failed to update plan", variant: "destructive" });
        },
    });
};

export const useDeletePricingPlan = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (id: string) => {
            const res = await serverAxios.delete(`/plans/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pricing-plans"] });
            toast({ title: "Plan deleted successfully" });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err?.response?.data?.message || "Failed to delete plan", variant: "destructive" });
        },
    });
};
