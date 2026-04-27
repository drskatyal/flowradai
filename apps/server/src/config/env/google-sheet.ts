import { z } from "zod";
import logger from "../../core/logger";

const googleSheetsSchema = z.object({
  GOOGLE_PROJECT_ID: z.string().min(1),
  GOOGLE_PRIVATE_KEY_ID: z.string().min(1),
  GOOGLE_PRIVATE_KEY: z.string().min(1),
  GOOGLE_CLIENT_EMAIL: z.string().email(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_UNIVERSE_DOMAIN: z.string().default("googleapis.com"),
  GOOGLE_SPREADSHEET_ID: z.string().min(1),
  GOOGLE_SHEET_NAME: z.string().min(1),
});

export const getGoogleSheetsConfig = () => {
  const config = googleSheetsSchema.safeParse(process.env);

  if (!config.success) {
    const errorMessages = config.error.errors
      .map((err) => `${err.path.join(".")} - ${err.message}`)
      .join(", ");
    logger.error(`Google Sheets config validation error: ${errorMessages}`);
    throw new Error(`Google Sheets config validation error: ${errorMessages}`);
  }

  return {
    projectId: config.data.GOOGLE_PROJECT_ID,
    privateKeyId: config.data.GOOGLE_PRIVATE_KEY_ID,
    privateKey: config.data.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"), // 🔑 fix line breaks
    clientEmail: config.data.GOOGLE_CLIENT_EMAIL,
    clientId: config.data.GOOGLE_CLIENT_ID,
    universeDomain: config.data.GOOGLE_UNIVERSE_DOMAIN,
    spreadsheetId: config.data.GOOGLE_SPREADSHEET_ID,
    sheetName: config.data.GOOGLE_SHEET_NAME,
  };
};
