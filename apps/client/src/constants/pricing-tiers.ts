import { PricingPlan } from "@/hooks/use-pricing-plans";

export interface PricingTier {
  id: string;
  name: string;
  slug: string;
  range: number;
  minReports: number;
  price: number;
  inrPrice: number;
  features: string[];
  highlighted: boolean;
  subscription: string;
  gst: number;
}

export const mapPlanToTier = (plan: PricingPlan): PricingTier => ({
  id: plan.id,
  name: plan.name,
  slug: plan.slug,
  range: plan.threadsQuantity === 0 ? Infinity : plan.threadsQuantity,
  minReports: plan.threadsQuantity === 0 ? Infinity : plan.threadsQuantity,
  price: plan.usdPrice,
  inrPrice: plan.inrPrice,
  features: plan.features,
  highlighted: plan.highlighted,
  subscription: plan.subscriptionType,
  gst: plan.gstPercent,
});

export const heroContent = {
  badge: "Limited-Time Offer",
};

export const pricingDescription = {
  title: "Our Flexible, Scalable Pricing",
  description:
    "We understand that every practice has unique needs. That's why our pricing is designed to grow with you. Simply purchase the number of report credits you need upfront—no subscriptions, no hidden fees. Your credits never expire, and you can top up anytime to unlock better rates.",
};
