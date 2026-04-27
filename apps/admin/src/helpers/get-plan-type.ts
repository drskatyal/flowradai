import { serverAxios } from "@/lib/axios";

// Cache plans in memory to avoid repeated API calls
let cachedPlans: Array<{ slug: string; name: string; usdPrice: number; inrPrice: number; gstPercent: number }> | null = null;

const loadPlans = async () => {
  if (cachedPlans) return cachedPlans;
  try {
    const { data } = await serverAxios.get("/plans?includeInactive=true");
    cachedPlans = data.data;
    return cachedPlans!;
  } catch {
    return [];
  }
};

export const getPlanType = (totalAmount: number): string => {
  // Synchronous fallback — used in table cells where async isn't possible.
  // The admin paymentTable now uses getPlanTypeAsync for accurate results.
  return `₹/$ ${totalAmount}`;
};

export const getPlanTypeAsync = async (totalAmount: number): Promise<string> => {
  const plans = await loadPlans();
  for (const plan of plans) {
    const inrTotal = Math.round(plan.inrPrice * (1 + plan.gstPercent / 100));
    if ([plan.usdPrice, plan.inrPrice, inrTotal].includes(totalAmount)) {
      return plan.name;
    }
  }
  return "Unknown Plan";
};