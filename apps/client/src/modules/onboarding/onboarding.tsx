"use client";
import { Button } from "@/components/ui/button";
import { useStore } from "@/stores/use-store";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ReferralCodeInput from "./referral-input";
import Speciality from "./speciality/speciality";
import { ExtendedUserPublicMetadata } from "../home/navbar";
import { clerkBoarding, ProcessingStage } from "./hooks/use-boarding";
import ProcessingSteps from "./processing-steps";
import CouponCodeInput from "./coupon-code-input";

const Onboarding = () => {
  const authUser = useStore((state) => state.user);
  const isUserLoading = useStore((state) => state.isUserLoading);
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();

  const metadata = (user?.publicMetadata as ExtendedUserPublicMetadata) || {};
  const clerkId = user?.id;
  const isOnboarded =
    (authUser && authUser.status !== "onboarding" && isLoaded && isSignedIn) ||
    false;

  const {
    specialityId,
    referralCode,
    couponCode,
    error,
    isLoading,
    processingStage,
    handleReferralCodeChange,
    handleCouponCodeChange,
    handleSpecialityChange,
    handleSubmit,
    handleContinue,
  } = clerkBoarding(clerkId || "");

  // Redirect if already onboarded
  useEffect(() => {
    if (isOnboarded && processingStage === ProcessingStage.IDLE) {
      router.replace("/");
    }
  }, [authUser, isOnboarded, router, processingStage]);

  // Render processing steps overlay/conditional
  if (processingStage !== ProcessingStage.IDLE) {
    return (
      <section className="flex h-screen bg-gradient-to-b from-muted to-muted/50 px-4 sm:px-0">
        <div className="flex flex-col items-center justify-center grow max-w-5xl mx-auto w-full">
          <ProcessingSteps
            currentStage={processingStage}
            onContinue={handleContinue}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-screen bg-gradient-to-b from-muted to-muted/50 px-4 sm:px-0">
      <div className="flex flex-col items-center justify-center grow max-w-2xl mx-auto w-full">
        <div className="w-full xs:max-w-md  bg-white rounded-lg shadow-lg border">
          <div className="p-6 md:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-primary">
                Select Speciality
              </h2>
            </div>
            <div className="space-y-3">
              <h2 className="text-sm text-primary">Medical Speciality</h2>
              <Speciality
                value={specialityId}
                onChange={handleSpecialityChange}
              />
            </div>
            <div className="space-y-3">
              <h2 className="text-sm text-primary">Referral Code (optional)</h2>
              <p className="text-sm text-muted-foreground">
                Please enter a valid referral code before continuing. Once
                submitted, the referral code cannot be changed or updated later.
              </p>
            </div>

            <ReferralCodeInput
              referralCode={referralCode}
              onChange={handleReferralCodeChange}
              error={error}
            />

            <div className="space-y-3 pt-4 border-t">
              <h2 className="text-sm font-semibold text-primary">
                Coupon Code (optional)
              </h2>
              <p className="text-sm text-muted-foreground">
                If you have a coupon code, enter it below to apply it to your
                account.
              </p>
              <CouponCodeInput
                couponCode={couponCode}
                onChange={handleCouponCodeChange}
              />
            </div>
          </div>

          <div className="flex flex-col xs:flex-row gap-3 pt-3 border-t p-6 md:p-8">
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={
                isLoading || isOnboarded || isUserLoading || !specialityId
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Onboarding;