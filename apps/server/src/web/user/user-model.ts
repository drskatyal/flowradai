import mongoose, { Schema } from "mongoose";
import { getRestrictionsConfig } from "../../config/env/restrictions";
import baseSchema, { IBaseModel } from "../../models/base-model";
import { ISubscriptionModel } from "../subscription/subscription-model";

const { freeReports } = getRestrictionsConfig();

export interface IUserModel extends IBaseModel {
  clerkId: string;
  firstName: string;
  lastName?: string;
  email: string;
  availableCredits: number;
  totalCredits: number;
  referralCode: string;
  status: "active" | "inactive" | "onboarding";
  role: "admin" | "user",
  specialityId: mongoose.Types.ObjectId,
  autoTemplate?: boolean,
  actionMode?: boolean;
  defaultTranscriptionModel?: "v2" | "v1" | "v0";
  isErrorCheck?: boolean;
  isReportGuideline?: boolean;
  reportEmail?: string;
  isTextAutoCorrection?: boolean;
  voiceCommandsEnabled?: boolean;
  activeSessionId?: string; // Track the current active Clerk session ID
  lastLoginAt?: Date; // Track last login timestamp
  referredBy?: string; // User ID of the referrer
  isReferralRewardClaimed?: boolean; // Track if this user has already triggered a reward for their referrer
  currentSubscription?: ISubscriptionModel; // Active subscription details
  unlimitedUsage?: number; // Usage count for unlimited plans
}

const userSchema = new Schema<IUserModel>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      help: "Unique identifier from Clerk",
    },
    firstName: {
      type: String,
      required: true,
      help: "User's first name",
    },
    lastName: {
      type: String,
      required: false,
      help: "User's last name",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      help: "User's email address",
    },
    specialityId: {
      type: Schema.Types.ObjectId,
      ref: "SpecialityModel",
      required: false,
    },
    availableCredits: {
      type: Number,
      default: freeReports || 0,
      required: true,
      help: "Current available thread balance",
    },
    totalCredits: {
      type: Number,
      default: freeReports || 0,
      required: true,
      help: "Total number of threads purchased by user",
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      help: "User's referral code",
    },
    status: {
      type: String,
      enum: ["onboarding", "active", "inactive"],
      default: "onboarding",
      required: true,
      help: "User's status",
    },
    role: {
      type: String,
      required: true,
      default: "user"
    },
    autoTemplate: {
      type: Boolean,
      required: false,
      default: true,
    },
    actionMode: {
      type: Boolean,
      required: false,
      default: false,
    },
    defaultTranscriptionModel: {
      type: String,
      default: "v2",
      enum: ["v2", "v1", "v0"],
      required: false
    },
    isErrorCheck: {
      type: Boolean,
      required: false,
      default: false,
    },
    isReportGuideline: {
      type: Boolean,
      required: false,
      default: false,
    },
    reportEmail: {
      type: String,
      required: false,
      default: "",
    },
    isTextAutoCorrection: {
      type: Boolean,
      required: false,
      default: false,
    },
    voiceCommandsEnabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    activeSessionId: {
      type: String,
      required: false,
      help: "Current active Clerk session ID for single-device login enforcement",
    },
    lastLoginAt: {
      type: Date,
      required: false,
      help: "Timestamp of last successful login",
    },
    referredBy: {
      type: String,
      required: false,
      help: "User ID of the person who referred this user",
    },
    isReferralRewardClaimed: {
      type: Boolean,
      default: false,
      help: "Whether the referral reward for this user has been claimed by the referrer",
    },
  },
  {
    collection: "users",
    timestamps: true,
  }
);

userSchema.add(baseSchema.statics);

const UserModel = mongoose.model<IUserModel>("UserModel", userSchema);

export default UserModel;
