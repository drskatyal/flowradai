import { useEditUser, useVerifyReferralCode } from "@/hooks";
import { useStore } from "@/stores";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useCallback } from "react";

export const useOnboarding = (userId: string) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [referralCode, setReferralCode] = useState<string | null>(
    () => searchParams.get("referralCode") || null
  );
  const [specialityId, setSpecialityId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useStore();
  const isSubmittingRef = useRef<boolean>(false);
  
  // Use ref to access current specialityId in callbacks
  const specialityIdRef = useRef<string>("");
  specialityIdRef.current = specialityId;

  // Create editUser hook without navigation callback - we'll handle navigation manually
  const { editUser: editUserMutate, isLoading: isEditLoading } = useEditUser(userId, undefined);
  
  // Create verifyReferralCode hook without navigation callback - we'll handle navigation manually
  const { verifyReferralCode: verifyReferralCodeMutate, isLoading: isVerifyLoading } = useVerifyReferralCode(undefined);

  const handleSkip = () => {
    verifyReferralCodeMutate({ isSkip: true });
  };

  const handleReferralCodeChange = (value: string) => {
    setReferralCode(value);
    setError(null);
  };

  const handleSpecialityChange = (value: string) => {
    setSpecialityId(value);
    setError(null);
  }

  const handleVerifyReferralCode = () => {
    if (!referralCode || referralCode.length !== 6) {
      setError("Please enter a valid 6-character referral code");
      return;
    }
    setError(null);
    verifyReferralCodeMutate({ referralCode });
  };

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!specialityId || !specialityId.length) {
      setError("Please select speciality");
      return;
    }

    // Prevent multiple simultaneous submissions
    if (isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;
    setError(null);

    try {
      // Step 1: Update user with specialityId
      await new Promise<void>((resolve, reject) => {
        editUserMutate(
          { specialityId, status: "active" },
          {
            onSuccess: (data) => {
              // Update store with current specialityId
              setUser({ status: "active", specialityId: specialityIdRef.current });
              resolve();
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });

      // Step 2: Verify referral code if provided (only after user update succeeds)
      if (referralCode && referralCode.trim().length > 0) {
        try {
          await new Promise<void>((resolve, reject) => {
            verifyReferralCodeMutate(
              { referralCode },
              {
                onSuccess: () => {
                  setUser({ status: "active" });
                  resolve();
                },
                onError: (error) => {
                  // Even if referral code fails, user is already updated, so we can proceed
                  // Error toast is already shown by the hook
                  resolve(); // Resolve instead of reject to allow navigation
                },
              }
            );
          });
        } catch (error) {
          // Error handling is done by the mutation hook (toast notifications)
          // Continue with navigation even if referral code fails
        }
      }

      // Step 3: Navigate after user update (and referral code attempt if provided)
      router.push("/");
    } catch (error) {
      // Error handling is done by the mutation hooks (toast notifications)
      // Re-throw so caller knows submission failed
      throw error;
    } finally {
      // Reset submission flag
      isSubmittingRef.current = false;
    }
  }, [specialityId, referralCode, editUserMutate, verifyReferralCodeMutate, setUser, router]);

  return {
    setSpecialityId,
    specialityId,
    referralCode,
    error,
    isVerifyLoading,
    isEditLoading,
    handleReferralCodeChange,
    handleVerifyReferralCode,
    handleSpecialityChange,
    handleSubmit,
    handleSkip,
  };
};
