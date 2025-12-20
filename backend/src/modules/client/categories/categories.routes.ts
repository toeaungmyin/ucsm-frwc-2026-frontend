import { Router } from "express";
import { index } from "./categories.controller.js";

const router = Router();

// Get all active categories (sorted by order)
router.get("/", index);

export default router;

