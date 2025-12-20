import { Router } from "express";
import { getConfig } from "./config.controller.js";

const router = Router();

// Get event configuration
router.get("/", getConfig);

export default router;

