import { useState } from "react";
import { PricingState } from "@/constants";
import { useRouter } from "next/navigation";

export const usePricing = () => {
  const router = useRouter();

  const [pricingState, setPricingState] = useState<PricingState>({
    selectedTier: "",
    quantity: 0,
  });

  const handleQuantityChange = (value: string) => {
    setPricingState((prev) => ({ ...prev, quantity: parseInt(value) || 1 }));
  };

  const handleClose = () => {
    router.push("/");
  };

  return {
    ...pricingState,
    tierPrice: 0,
    totalPrice: 0,
    handleQuantityChange,
    setSelectedTier: (tier: string) =>
      setPricingState((prev) => ({ ...prev, selectedTier: tier })),
    setQuantity: (quantity: number) =>
      setPricingState((prev) => ({ ...prev, quantity })),
    handleClose,
  };
};
