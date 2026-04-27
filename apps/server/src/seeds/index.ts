import connectDB from "../models";
import logger from "../core/logger";

import { seedTemplates } from "./template-seed";
import { seedContacts } from "./contact-seed";

const runSeed = async () => {
  try {
    await connectDB();

    //seed execution command
    //npx nx seed server

    // Run seeders
    // await seedTemplates();
    // await seedContacts();

    logger.info("Database seeding completed!");
    process.exit(0);
  } catch (err) {
    logger.error("Seeding failed:", err);
    process.exit(1);
  }
};

runSeed();