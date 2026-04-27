import express from "express";
import MailchimpController from "./mailchimp-controller";

const router = express.Router();

router.post("/user", MailchimpController.createOrUpdateUser);
router.get("/users", MailchimpController.getUsers);
router.post("/bulk-sync", MailchimpController.bulkSync);

export default router;
