import { useState } from "react";
import { serverAxios } from "@/lib/axios";

export const useCouponCode = () => {
    const [applying, setApplying] = useState(false);
    const [loading, setLoading] = useState(false);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);

    const applyCoupon = async (code: string) => {
        setApplying(true);
        try {
            const response = await serverAxios.post(`/coupon-code/applyCouponCode`, {
                code,
            });
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.error || "Failed to apply coupon code"
            );
        } finally {
            setApplying(false);
        }
    };

    const getUserCoupons = async () => {
        setLoading(true);
        try {
            const response = await serverAxios.get(
                `/coupon-code/getUserCouponSubscriptions`
            );
            setSubscriptions(response.data || []);
        } catch (error: any) {
            console.error("Error fetching coupon subscriptions:", error);
            setSubscriptions([]);
        } finally {
            setLoading(false);
        }
    };

    return {
        applyCoupon,
        getUserCoupons,
        applying,
        loading,
        subscriptions,
    };
};