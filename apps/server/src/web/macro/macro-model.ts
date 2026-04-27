import mongoose, { Schema } from "mongoose";
import { z } from "zod";
import baseSchema, { IBaseModel } from "../../models/base-model";

export const MacroValidationSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    isActive: z.boolean().optional(),
    isPublic: z.boolean().optional(),
    specialityId: z.string().optional(),
});

export interface IMacro extends IBaseModel {
    userId: string;
    name: string;
    description: string;
    isActive: boolean;
    isPublic: boolean;
    specialityId?: mongoose.Types.ObjectId;
    originalMacroId?: string; // For tracking cloned macros
}

const macroSchema = new Schema<IMacro>(
    {
        userId: {
            type: String,
            required: true,
            ref: "UserModel", // Assuming you want to populate this later potentially
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isPublic: {
            type: Boolean,
            default: false,
        },
        specialityId: {
            type: Schema.Types.ObjectId,
            ref: "SpecialityModel",
            required: false,
        },
        originalMacroId: {
            type: String,
            required: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        collection: "macros",
        timestamps: true,
    }
);

macroSchema.add(baseSchema.statics);

const MacroModel = mongoose.model<IMacro>("MacroModel", macroSchema);

export default MacroModel;
