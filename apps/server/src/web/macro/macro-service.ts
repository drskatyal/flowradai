import logger from "../../core/logger";
import MacroModel, { IMacro } from "./macro-model";
import UserModel from "../user/user-model";

class MacroService {

    async createMacro(userId: string, payload: Partial<IMacro>) {
        try {
            const macro = await MacroModel.create({
                ...payload,
                name: `Insert ${payload.name}`,
                userId,
            });
            return macro;
        } catch (error) {
            logger.error("Error creating macro", { error });
            throw error;
        }
    }

    async getMacros(
        userId: string,
        limit: number = 10,
        skip: number = 0,
        search: string = "",
        showMarketplace: boolean = false,
        specialties: string[] = []
    ) {
        try {
            // Find user details to check role and specialty
            const user = await UserModel.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }

            // Build dynamic query
            let query: any = { isDeleted: false };

            if (showMarketplace) {
                // Marketplace: Only public macros from OTHER users
                query.isPublic = true;
                query.userId = { $ne: userId };
            } else {
                // My Macros: Only macros owned by ME (private or public)
                // If user is admin, show all admin macros
                if (user.role === "admin") {
                    const admins = await UserModel.find({ role: "admin" }, "_id");
                    const adminIds = admins.map(admin => admin._id.toString());
                    query.userId = { $in: adminIds };
                } else {
                    query.userId = userId;
                }
            }

            // Apply Search Filter (name or description)
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } }
                ];
            }

            // Apply Specialty Filter
            if (specialties && specialties.length > 0) {
                query.specialityId = { $in: specialties };
            }

            const macros = await MacroModel.find(query)
                .populate('specialityId', 'name')
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip);

            const count = await MacroModel.countDocuments(query);

            return { macros, count };

        } catch (error) {
            logger.error("Error getting macros", { error });
            throw error;
        }
    }

    async getMacroById(id: string, userId: string) {
        try {
            // Users should be able to view their own or admin macros
            const admins = await UserModel.find({ role: "admin" }, "_id");
            const adminIds = admins.map(admin => admin._id.toString());

            const macro = await MacroModel.findOne({
                _id: id,
                $or: [
                    { userId: userId },
                    { userId: { $in: adminIds } }
                ],
                isDeleted: false
            });
            return macro;
        } catch (error) {
            logger.error("Error getting macro by id", { error });
            throw error;
        }
    }

    async updateMacro(id: string, userId: string, payload: Partial<IMacro>) {
        try {
            const user = await UserModel.findById(userId);
            const isAdmin = user?.role === "admin";

            let macro;
            if (isAdmin) {
                macro = await MacroModel.findOne({ _id: id, isDeleted: false });
            } else {
                macro = await MacroModel.findOne({ _id: id, userId: userId, isDeleted: false });
            }

            if (!macro) {
                throw new Error("Macro not found or you do not have permission to update it.");
            }

            Object.assign(macro, payload);
            await macro.save();
            return macro;
        } catch (error) {
            logger.error("Error updating macro", { error });
            throw error;
        }
    }

    async deleteMacro(id: string, userId: string) {
        try {
            // Check if user is admin
            const user = await UserModel.findById(userId);
            const isAdmin = user?.role === "admin";
            let macro;
            if (isAdmin) {
                // Admins can delete any macro created by an admin OR any public macro
                const admins = await UserModel.find({ role: "admin" }, "_id");
                const adminIds = admins.map(admin => admin._id.toString());

                macro = await MacroModel.findOne({
                    _id: id,
                    $or: [
                        { userId: { $in: adminIds } },
                        { isPublic: true }
                    ],
                    isDeleted: false
                });
            } else {
                // Regular users can only delete their own macros
                macro = await MacroModel.findOne({ _id: id, userId: userId, isDeleted: false });
                // macro = await MacroModel.findOne({ _id: id, userId: userId });
            }

            if (!macro) {
                throw new Error("Macro not found or you do not have permission to delete it.");
            }

            // Soft delete
            if (typeof macro.delete === 'function') {
                await macro.delete(); // Using the soft delete method from base model if available
            } else {
                macro.isDeleted = true;
                await macro.save();
            }

            return { message: "Macro deleted successfully" };
        } catch (error) {
            logger.error("Error deleting macro", { error });
            throw error;
        }
    }

    async cloneMacro(macroId: string, userId: string) {
        try {
            // Find the original macro
            const originalMacro = await MacroModel.findOne({
                _id: macroId,
                isPublic: true,
                isDeleted: false
            });

            if (!originalMacro) {
                throw new Error("Public macro not found or is not available for cloning.");
            }

            // Create a clone for the user
            const clonedMacro = await MacroModel.create({
                userId,
                name: originalMacro.name,
                description: originalMacro.description,
                isActive: true,
                isPublic: false, // Cloned macros are private by default
                specialityId: originalMacro.specialityId,
                originalMacroId: macroId,
            });

            return clonedMacro;
        } catch (error) {
            logger.error("Error cloning macro", { error });
            throw error;
        }
    }
    async bulkCloneMacros(macroIds: string[], userId: string) {
        try {
            // Find all public, non-deleted original macros
            const originalMacros = await MacroModel.find({
                _id: { $in: macroIds },
                isPublic: true,
                isDeleted: false
            });

            if (originalMacros.length === 0) {
                throw new Error("No valid public macros found for cloning.");
            }

            // Prepare clones
            const clonedMacrosData = originalMacros.map(macro => ({
                userId,
                name: macro.name,
                description: macro.description,
                isActive: true,
                isPublic: false,
                specialityId: macro.specialityId,
                originalMacroId: macro._id.toString(),
            }));

            // Bulk create
            const clonedMacros = await MacroModel.insertMany(clonedMacrosData);

            return clonedMacros;
        } catch (error) {
            logger.error("Error bulk cloning macros", { error });
            throw error;
        }
    }
} export default new MacroService();

