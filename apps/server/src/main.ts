import 'newrelic';
const newrelic = require("newrelic") as any;

import dns from "node:dns/promises";

// Explicitly set DNS servers if configured (useful for environments with DNS resolution issues)
if (process.env.FORCE_PUBLIC_DNS === "true") {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
}

import cors, { CorsOptions } from "cors";
import express from "express";
import { getAppConfig } from "./config/env";
import logger from "./core/logger";
import connectDB from "./models";
import RoutesPlugin from "./plugins/route";
import { initializeSettings } from "./web/settings/settings-init";
import fileUpload from "express-fileupload";
import { initializeCronJobs } from "./cron";

const app = express();

const corsOptions: CorsOptions = {
  origin: "*", // TODO: change to the frontend url
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

// Configure express-fileupload
app.use(fileUpload({
  createParentPath: true,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Increase payload limit (e.g. 50 MB)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const { host, port } = getAppConfig();

const plugins = [new RoutesPlugin()];

plugins.forEach((plugin) => plugin.install(app));

app.use((err: any, req: any, res: any, next: any) => {
  newrelic.noticeError(err);
  logger.error("Unhandled Error:", err);
  res.status(500).json({ message: "Internal server error" });
});

const startServer = async () => {
  try {
    await connectDB();

    // Initialize application settings
    await initializeSettings();

    // Initialize all cron jobs
    initializeCronJobs();

    app.listen(port, host, () => {
      logger.info(`Server is running on port ${port}`);
    });
  } catch (error) {
    logger.error("Error starting the server:", error);
    process.exit(1);
  }
};

startServer();
