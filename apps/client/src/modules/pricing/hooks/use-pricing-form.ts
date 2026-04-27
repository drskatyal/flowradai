import { useCreatePaymentLink } from "@/hooks";
import { PricingSchemaType } from "../schemas";

export const usePricingForm = () => {
  const { createPaymentLink, isLoading } = useCreatePaymentLink();

  const onSubmit = (data: PricingSchemaType) => {
    createPaymentLink(data);
  };

  return {
    onSubmit,
    isLoading,
  };
};
