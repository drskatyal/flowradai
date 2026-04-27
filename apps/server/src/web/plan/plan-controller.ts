import { Request, Response } from "express";
import logger from "../../core/logger";
import planService from "./plan-service";

class PlanController {
    async checkSlug(req: Request, res: Response) {
        try {
            const { slug, excludeId } = req.query as { slug: string; excludeId?: string };
            if (!slug) return res.status(400).json({ success: false, message: "Slug is required" });

            const existing = await planService.getPlanBySlug(slug);
            const isTaken = existing && existing.id !== excludeId;
            return res.status(200).json({ available: !isTaken });
        } catch (error: any) {
            logger.error("Error checking slug:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getPlans(req: Request, res: Response) {
        try {
            const includeInactive = req.query.includeInactive === "true";
            const plans = await planService.getAllPlans(includeInactive);
            return res.status(200).json({ success: true, data: plans });
        } catch (error: any) {
            logger.error("Error fetching plans:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async createPlan(req: Request, res: Response) {
        try {
            const plan = await planService.createPlan(req.body);
            return res.status(201).json({ success: true, data: plan });
        } catch (error: any) {
            logger.error("Error creating plan:", error);
            if (error.code === 11000 && error.keyPattern?.slug) {
                return res.status(400).json({ success: false, message: "A plan with this slug already exists" });
            }
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async updatePlan(req: Request, res: Response) {
        try {
            const plan = await planService.updatePlan(req.params.id, req.body);
            return res.status(200).json({ success: true, data: plan });
        } catch (error: any) {
            logger.error("Error updating plan:", error);
            if (error.code === 11000 && error.keyPattern?.slug) {
                return res.status(400).json({ success: false, message: "A plan with this slug already exists" });
            }
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async deletePlan(req: Request, res: Response) {
        try {
            await planService.deletePlan(req.params.id);
            return res.status(200).json({ success: true, message: "Plan deleted" });
        } catch (error: any) {
            logger.error("Error deleting plan:", error);
            return res.status(400).json({ success: false, message: error.message });
        }
    }
}

export default new PlanController();
