import logger from "../../core/logger";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/clerk-authentication";
import macroService from "./macro-service";
import { MacroValidationSchema, IMacro } from "./macro-model";
import mongoose from "mongoose";

class MacroController {
    async createOrUpdateMacro(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.auth().sessionClaims.internalId;
            const { id } = req.body; // If id exists, it's an update
            const payload = req.body;

            // Validate payload
            const validation = MacroValidationSchema.safeParse(payload);

            if (!validation.success) {
                return res.status(400).json({
                    error: "Validation Error",
                    details: validation.error.errors
                });
            }


            const { specialityId, ...rest } = validation.data;
            const macroData: Partial<IMacro> = {
                ...rest,
                ...(specialityId && { specialityId: new mongoose.Types.ObjectId(specialityId) })
            };

            if (id) {
                // Update
                const updatedMacro = await macroService.updateMacro(id, userId, macroData);
                return res.status(200).json(updatedMacro);
            } else {
                // Create
                const newMacro = await macroService.createMacro(userId, macroData);
                return res.status(201).json(newMacro);
            }

        } catch (error: any) {
            logger.error("Error creating/updating macro", { error });
            return res.status(500).json({ error: error.message });
        }
    }

    async getMacros(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.auth().sessionClaims.internalId;
            const { 
                limit = 10, 
                skip = 0, 
                search = "", 
                showMarketplace = "false", 
                specialties = "" 
            } = req.query;

            // Convert specialties string to array if provided
            const specialtyArray = specialties ? String(specialties).split(",") : [];

            const result = await macroService.getMacros(
                userId,
                Number(limit),
                Number(skip),
                String(search),
                showMarketplace === "true",
                specialtyArray
            );

            return res.status(200).json(result);
        } catch (error: any) {
            logger.error("Error getting macros", { error });
            return res.status(500).json({ error: error.message });
        }
    }

    async getMacroById(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.auth().sessionClaims.internalId;
            const { id } = req.query; // Changed to query as per routes? Or params?
            // Routes say: router.get("/getMacroById", ... method)
            // Usually get by id is /id param, but here route is generic.
            // Let's check routes file again or assume query param based on typical express patterns if not parameterized route.
            // The route is `router.get("/getMacroById", ...)` so it must be query param `?id=...`

            if (!id || typeof id !== 'string') {
                return res.status(400).json({ error: "Macro ID is required" });
            }

            const macro = await macroService.getMacroById(id, userId);

            if (!macro) {
                return res.status(404).json({ error: "Macro not found" });
            }

            return res.status(200).json(macro);
        } catch (error: any) {
            logger.error("Error getting macro by id", { error });
            return res.status(500).json({ error: error.message });
        }
    }

    async deleteMacro(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.auth().sessionClaims.internalId;
            const { id } = req.query; // Assuming query string for delete as well, typical for this project style?
            // Route is `router.delete("/deleteMacro", ...)` so likely query param.
            if (!id || typeof id !== 'string') {
                return res.status(400).json({ error: "Macro ID is required" });
            }

            const result = await macroService.deleteMacro(id, userId);
            return res.status(200).json(result);

        } catch (error: any) {
            logger.error("Error deleting macro", { error });
            return res.status(500).json({ error: error.message });
        }
    }

    async cloneMacro(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.auth().sessionClaims.internalId;
            const { id } = req.body;

            if (!id || typeof id !== 'string') {
                return res.status(400).json({ error: "Macro ID is required" });
            }

            const result = await macroService.cloneMacro(id, userId);
            return res.status(201).json(result);
        } catch (error: any) {
            logger.error("Error cloning macro", { error });
            return res.status(500).json({ error: error.message });
        }
    }

    async bulkCloneMacros(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.auth().sessionClaims.internalId;
            const { macroIds } = req.body;

            if (!macroIds || !Array.isArray(macroIds) || macroIds.length === 0) {
                return res.status(400).json({ error: "No macroIds provided for bulk cloning." });
            }

            const clonedMacros = await macroService.bulkCloneMacros(macroIds, userId);
            return res.status(201).json(clonedMacros);
        } catch (error: any) {
            logger.error("Error bulk cloning macros", { error });
            return res.status(500).json({ error: error.message });
        }
    }

}

export default new MacroController();