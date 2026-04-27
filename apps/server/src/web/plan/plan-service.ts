import logger from "../../core/logger";
import PlanModel, { IPlanModel } from "./plan-model";

class PlanService {
    async getAllPlans(includeInactive = false) {
        const query: any = {};
        if (!includeInactive) query.isActive = true;
        return PlanModel.find(query).sort({ sortOrder: 1, createdAt: 1 });
    }

    async getPlanBySlug(slug: string) {
        return PlanModel.findOne({ slug, isDeleted: false });
    }

    async getPlanById(id: string) {
        return PlanModel.findById(id);
    }

    async createPlan(data: Partial<IPlanModel>) {
        const plan = new PlanModel(data);
        await plan.save();
        logger.info(`Plan created: ${plan.name}`);
        return plan;
    }

    async updatePlan(id: string, data: Partial<IPlanModel>) {
        const plan = await PlanModel.findByIdAndUpdate(id, data, { new: true });
        if (!plan) throw new Error("Plan not found");
        logger.info(`Plan updated: ${plan.name}`);
        return plan;
    }

    async deletePlan(id: string) {
        const plan = await PlanModel.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );
        if (!plan) throw new Error("Plan not found");
        logger.info(`Plan deleted: ${plan.name}`);
        return plan;
    }

    /**
     * Calculate payment amount for a given plan slug + currency
     */
    async calculatePaymentAmount(
        slug: string,
        isCurrency: boolean
    ): Promise<{ basePrice: number; gstRate: number; totalAmount: number; gstAmount: number }> {
        const plan = await this.getPlanBySlug(slug);
        if (!plan) throw new Error(`Plan not found: ${slug}`);

        const basePrice = isCurrency ? plan.inrPrice : plan.usdPrice;
        const gstRate = isCurrency ? plan.gstPercent / 100 : 0;
        const gstAmount = isCurrency ? Math.round(basePrice * gstRate) : 0;
        const totalAmount = isCurrency ? Math.round(basePrice * (1 + gstRate)) : basePrice;

        return { basePrice, gstRate, totalAmount, gstAmount };
    }

    /**
     * Resolve plan name from a payment amount (for legacy display)
     */
    async getPlanNameByAmount(amount: number): Promise<string> {
        const plans = await this.getAllPlans(true);
        for (const plan of plans) {
            const usdTotal = plan.usdPrice;
            const inrTotal = Math.round(plan.inrPrice * (1 + plan.gstPercent / 100));
            const inrBase = plan.inrPrice;
            if ([usdTotal, inrTotal, inrBase].includes(amount)) {
                return plan.name;
            }
        }
        return "Unknown Plan";
    }
}

export default new PlanService();
