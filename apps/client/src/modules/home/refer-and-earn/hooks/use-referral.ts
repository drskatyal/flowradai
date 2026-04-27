import { useState, useEffect } from "react";

import { serverAxios } from "@/lib/axios";

interface ReferralReward {
    id: string;
    referrerId: string;
    referredUserId: string;
    status: "pending_activation" | "active" | "expired" | "completed";
    grantDate: string;
    activationDeadline: string;
    activationDate?: string;
    expiryDate?: string;
    referredUserEmail?: string;
    referredUserName?: string;
}

interface ReferralStats {
    totalReferrals: number;
    successfulReferrals: number;
    activeRewards: number;
    pendingRewards: number;
}

interface ReferredUser {
    id: string;
    email: string;
    name: string;
    date: string;
    hasRewarded?: boolean;
}

export const useReferral = () => {

    const [rewards, setRewards] = useState<ReferralReward[]>([]);
    const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRewards = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await serverAxios.get("/referral/rewards");
            setRewards(response.data.data || []);
        } catch (err: any) {
            setError(err.message || "Failed to fetch rewards");
        } finally {
            setLoading(false);
        }
    };

    const fetchReferredUsers = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await serverAxios.get("/referral/users");
            setReferredUsers(response.data.data || []);
        } catch (err: any) {
            setError(err.message || "Failed to fetch referred users");
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await serverAxios.get("/referral/stats");
            setStats(response.data.data);
        } catch (err: any) {
            setError(err.message || "Failed to fetch stats");
        } finally {
            setLoading(false);
        }
    };

    const activateReward = async (rewardId: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await serverAxios.post("/referral/activate", { rewardId });
            const data = response.data;

            // Refresh rewards after activation
            await fetchRewards();
            await fetchStats();

            return data.data;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to activate reward";
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRewards();
        fetchStats();
        fetchReferredUsers();
    }, []);

    return {
        rewards,
        referredUsers,
        stats,
        loading,
        error,
        fetchRewards,
        fetchStats,
        activateReward,
    };
};
