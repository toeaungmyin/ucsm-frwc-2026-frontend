import { Router } from "express";
import { authMiddleware, validateBody, uploadVideo } from "@/middleware/index.js";
import { getSettings, updateSettings, toggleVoting, uploadPromoVideo, deletePromoVideo } from "./settings.controller.js";
import { updateSettingsSchema, toggleVotingSchema } from "./settings.schema.js";

const router = Router();

// All settings routes require admin authentication
router.use(authMiddleware);

// Get current settings
router.get("/", getSettings);

// Update settings
router.patch("/", validateBody(updateSettingsSchema), updateSettings);

// Toggle voting on/off
router.post("/toggle-voting", validateBody(toggleVotingSchema), toggleVoting);

// Upload promo video
router.post("/promo-video", uploadVideo.single("video"), uploadPromoVideo);

// Delete promo video
router.delete("/promo-video", deletePromoVideo);

export default router;

