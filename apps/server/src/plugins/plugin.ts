import { Express } from "express";

export interface Plugin {
  install(app: Express): void;
}
