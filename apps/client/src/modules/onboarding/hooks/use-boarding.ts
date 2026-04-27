import { useBoarding } from "@/hooks/use-boarding";
import { serverAxios } from "@/lib/axios";
import { useVerifyReferralCode } from "@/hooks";
import { useStore } from "@/stores";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useCallback } from "react";
import { ProcessingStage } from "../processing-steps";
import { useUser } from "@clerk/nextjs";

export { ProcessingStage };

export const clerkBoarding = (clerkId: string) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user: authUser } = useUser();

    // Local state
    const [specialityId, setSpecialityId] = useState<string>("");
    const [referralCode, setReferralCode] = useState<string | null>(() => {
        if (typeof window !== "undefined") {
            const refParam =
                searchParams.get("ref") || searchParams.get("referralCode");
            if (refParam) {
                // Store in localStorage for persistence
                localStorage.setItem("pendingReferralCode", refParam);
                return refParam;
            }
            // Check localStorage for previously stored ref code
            return localStorage.getItem("pendingReferralCode") || null;
        }
        return null;

    });
    const [couponCode, setCouponCode] = useState<string | null>(() => {
        if (typeof window !== "undefined") {
            const couponParam =
                searchParams.get("coupon") || searchParams.get("couponCode");
            if (couponParam) {
                localStorage.setItem("pendingCouponCode", couponParam);
                return couponParam;
            }
            return localStorage.getItem("pendingCouponCode") || null;
        }
        return null;

    });
    const [error, setError] = useState<string | null>(null);
    const [processingStage, setProcessingStage] = useState<ProcessingStage>(
        ProcessingStage.IDLE
    );
    const isSubmittingRef = useRef<boolean>(false);

    // Hooks
    const { updateUser: updateUserMutate, isLoading: isBoardingLoading } =
        useBoarding(clerkId, () => {
            console.log("User updated successfully via clerkId");
        });

    const {
        verifyReferralCode: verifyReferralCodeMutate,
        isLoading: isVerifyLoading,
    } = useVerifyReferralCode(undefined);

    // Handlers
    const handleReferralCodeChange = useCallback((value: string) => {
        setReferralCode(value);
        setError(null);
    }, []);

    const handleSpecialityChange = useCallback((value: string) => {
        setSpecialityId(value);
        setError(null);
    }, []);

    const handleCouponCodeChange = useCallback((value: string) => {
        setCouponCode(value);
        setError(null);
    }, []);

    const handleContinue = useCallback(async () => {
        // Reload Clerk user data to update navbar with latest credits/plan info
        if (authUser) {
            await authUser.reload();
        }
        router.push("/");
    }, [router, authUser]);

    // Actual onboarding process (after coupon step)
    const proceedWithOnboarding = useCallback(async () => {
        // Prevent multiple simultaneous submissions
        if (isSubmittingRef.current) {
            return;
        }

        isSubmittingRef.current = true;
        setError(null);

        try {
            // Stage 1: Creating Account (Wait 10s)
            setProcessingStage(ProcessingStage.CREATING_ACCOUNT);
            await new Promise((resolve) => setTimeout(resolve, 15000));

            // Stage 2: Saving Specialty
            setProcessingStage(ProcessingStage.SAVING_SPECIALTY);

            // Run API call and 5s timer concurrently
            await Promise.all([
                new Promise<void>((resolve, reject) => {
                    updateUserMutate(
                        { specialityId, status: "active" },
                        {
                            onSuccess: (data) => {
                                // Update store with new user data
                                const { setUser } = useStore.getState();
                                setUser({
                                    ...data,
                                    status: "active",
                                    specialityId,
                                });
                                resolve();
                            },
                            onError: (error) => {
                                console.error("Onboarding error:", error);
                                reject(error);
                            },
                        }
                    );
                }),
                new Promise((resolve) => setTimeout(resolve, 5000)),
            ]);

            // Stage 3: Preparing Workspace
            setProcessingStage(ProcessingStage.PREPARING_WORKSPACE);

            // Ensure user is created
            try {
                const { data: ensureData } = await serverAxios.post("/users/ensure", {
                    referralCode: referralCode || undefined,
                    couponCode: couponCode || undefined,
                });

                console.log("User ensured successfully:", ensureData);

                // Clear the stored referral code and coupon code after successful processing
                if (typeof window !== "undefined") {
                    localStorage.removeItem("pendingReferralCode");
                    localStorage.removeItem("pendingCouponCode");
                }

            } catch (error) {
                console.error("Ensure user error:", error);
            }

            // Wait for the minimum stage time
            await new Promise((resolve) => setTimeout(resolve, 5000));

            // Stage 4: Almost Done (Wait 3s)
            setProcessingStage(ProcessingStage.ALMOST_DONE);
            await new Promise((r) => setTimeout(r, 3000));

            // Stage 5: Completed (Show Continue Button)
            setProcessingStage(ProcessingStage.COMPLETED);
        } catch (error) {
            console.error("Onboarding submission error:", error);
            // Reset state on error so user can try again
            setProcessingStage(ProcessingStage.IDLE);
            setError("Something went wrong. Please try again.");
            isSubmittingRef.current = false;
        }
        // Note: We do NOT set isSubmittingRef.current = false on success
        // because we want to stay in the completed state until user clicks continue
    }, [
        clerkId,
        specialityId,
        referralCode,
        couponCode,
        updateUserMutate,
        verifyReferralCodeMutate,
        router,
    ]);

    // Main submission handler
    const handleSubmit = useCallback(async () => {
        if (!clerkId || !specialityId) {
            setError("Please select a speciality");
            return;
        }

        // Proceed with onboarding
        proceedWithOnboarding();
    }, [clerkId, specialityId, proceedWithOnboarding]);

    return {
        // State
        specialityId,
        referralCode,
        couponCode,
        error,
        processingStage,

        // Loading states
        isLoading: processingStage !== ProcessingStage.IDLE,
        isBoardingLoading,
        isVerifyLoading,

        // Handlers
        handleReferralCodeChange,
        handleCouponCodeChange,
        handleSpecialityChange,
        handleSubmit,
        handleContinue,
    };
};