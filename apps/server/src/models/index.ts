import { getMongoConfig } from "../config/env";
import mongoose from "mongoose";
import logger from "../core/logger";

const mongoConfig = getMongoConfig();

const { uri, dbName } = mongoConfig;

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(uri, {
      dbName,
    });
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
