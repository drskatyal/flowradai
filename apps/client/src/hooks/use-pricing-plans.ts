import { serverAxios } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface PricingPlan {
    id: string;
    name: string;
    slug: string;
    subscriptionType: "regular" | "monthly" | "yearly";
    threadsQuantity: number; // 0 = unlimited
    usdPrice: number;
    inrPrice: number;
    gstPercent: number;
    features: string[];
    highlighted: boolean;
    isActive: boolean;
    sortOrder: number;
}

export const usePricingPlans = () => {
    return useQuery<PricingPlan[]>({
        queryKey: ["pricing-plans"],
        queryFn: async () => {
            const { data } = await serverAxios.get("/plans");
            return data.data;
        },
        staleTime: 5 * 60 * 1000,
    });
};
