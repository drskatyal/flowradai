"use client";
import { Badge } from "@/components/ui/badge";
import { heroContent, pricingDescription, mapPlanToTier } from "@/constants";
import { Clock, CreditCard, Globe } from "lucide-react";
import { usePricing } from "./hooks/use-pricing";
import PricingCard from "./pricing-card";
import { Button } from "@/components/ui/button";
import { useCurrency, usePricingForm } from "./hooks";
import { ToggleSwitch } from "@/components/ui/customs/custom-switch";
import { usePricingPlans } from "@/hooks";
import { XIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Pricing = () => {
  const { data: plans = [], isLoading: plansLoading } = usePricingPlans();
  const tiers = plans.map(mapPlanToTier);

  const { selectedTier, setSelectedTier, setQuantity, handleClose } = usePricing();
  const { onSubmit, isLoading } = usePricingForm();
  const { isCurrency, handleCurrencyChange } = useCurrency();

  const handlePurchaseReport = (slug: string) => {
    try {
      onSubmit({ planSlug: slug, isCurrency });
    } catch (error) {
      console.warn("error", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <button className="fixed top-3 right-3 sm:top-6 sm:right-6" onClick={handleClose}>
        <XIcon className="h-6 w-6" />
      </button>
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <section className="mb-8 sm:mb-16">
          <div className="max-w-4xl mx-auto text-center px-4">
            <Badge variant="secondary" className="mb-4">
              <Clock className="w-3 h-3 mr-1" />
              {heroContent.badge}
            </Badge>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
              {pricingDescription.title}
            </h2>
            <p className="text-base sm:text-lg text-slate-600">{pricingDescription.description}</p>
          </div>
        </section>

        <div className="flex justify-center items-center gap-3 my-14">
          <div className="flex gap-2">
            <Globe />
            <span>Currency :</span>
          </div>
          <div className="flex items-center gap-2">
            <span>USD</span>
            <ToggleSwitch id="currency-switch" checked={isCurrency} onCheckedChange={handleCurrencyChange} />
            <span>INR</span>
          </div>
        </div>

        {plansLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-96 w-full rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-4 max-w-6xl mx-auto mt-8 md:mt-0 md:mb-16">
            {tiers.map((tier) => (
              <PricingCard
                key={tier.slug}
                title={tier.name}
                range={tier.range}
                price={!isCurrency ? tier.price.toString() : tier.inrPrice.toString()}
                features={tier.features}
                highlighted={tier.highlighted}
                onSelect={() => { setSelectedTier(tier.name); setQuantity(tier.minReports); }}
                isSelected={selectedTier === tier.name}
                currency={isCurrency}
                gst={tier.gst}
                subscription={tier.subscription}
                buyNow={
                  <Button
                    disabled={isLoading}
                    onClick={() => handlePurchaseReport(tier.slug)}
                    className="w-full"
                  >Buy</Button>
                }
              />
            ))}
          </div>
        )}

        <div className="flex flex-col md:flex-row text-center justify-center items-center gap-1">
          <CreditCard />
          <span>Transparent Checkout Select your plan, pay once, and start reporting immediately. Your credits stay with you — no monthly renewal, no expiry.</span>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
