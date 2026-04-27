import { z } from "zod";
import logger from "../../core/logger";

// Define the schema for MongoDB configuration
const mongoSchema = z.object({
  MONGODB_URI: z.string().url(),
  MONGO_DB_NAME: z.string().min(1),
});

export const getMongoConfig = () => {
  const config = mongoSchema.safeParse(process.env);

  if (!config.success) {
    const errorMessages = config.error.errors
      .map((err) => `${err.path.join(".")} - ${err.message}`)
      .join(", ");
    logger.error(`MongoDB config validation error: ${errorMessages}`);
    throw new Error(`MongoDB config validation error: ${errorMessages}`);
  }

  return {
    uri: config.data.MONGODB_URI,
    dbName: config.data.MONGO_DB_NAME,
  };
};
