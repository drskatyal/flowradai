import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { usePricingForm } from "./hooks";
import { pricingSchema, PricingSchemaType } from "./schemas";

interface PricingFormProps {
  planSlug: string;
  isCurrency?: boolean;
}

const PricingForm = ({ planSlug, isCurrency = false }: PricingFormProps) => {
  const { onSubmit, isLoading } = usePricingForm();

  const form = useForm<PricingSchemaType>({
    resolver: zodResolver(pricingSchema),
    values: {
      planSlug,
      isCurrency,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4"
      >
        <FormField
          control={form.control}
          name="planSlug"
          render={({ field }) => (
            <FormItem className="flex-1 sm:w-2/3">
              <FormControl>
                <Input
                  placeholder="Plan"
                  className="w-full h-10 sm:h-11 text-sm sm:text-base border rounded-md border-[rgba(0,0,0,0.1)] bg-grayScale text-black"
                  {...field}
                  readOnly
                />
              </FormControl>
              <FormMessage className="text-xs sm:text-sm" />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full sm:w-1/3 h-10 sm:h-11 text-sm sm:text-base"
          disabled={isLoading}
        >
          Buy
        </Button>
      </form>
    </Form>
  );
};

export default PricingForm;