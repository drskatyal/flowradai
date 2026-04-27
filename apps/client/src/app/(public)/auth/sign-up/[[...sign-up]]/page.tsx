"use client";
import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function SignUpPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refParam =
      searchParams.get("ref") || searchParams.get("referralCode");
    if (refParam) {
      localStorage.setItem("pendingReferralCode", refParam);
    }

    const couponParam =
      searchParams.get("coupon") || searchParams.get("couponCode");
    if (couponParam) {
      localStorage.setItem("pendingCouponCode", couponParam);
    }
  }, [searchParams]);

  return <SignUp signInUrl="/auth/sign-in" oauthFlow="popup" />;
}