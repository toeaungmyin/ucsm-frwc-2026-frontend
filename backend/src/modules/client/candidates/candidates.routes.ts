import { Router } from "express";
import { getByCategoryId } from "./candidates.controller.js";

const router = Router();

// Get candidates by category ID
router.get("/category/:categoryId", getByCategoryId);

export default router;

