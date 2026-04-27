import { Router } from "express";
import shareController from "./share-controller";

const router = Router();

router.post("/email", shareController.shareEmail);

export default router;
