import { Router } from "express";
import { index, show, store, update, destroy, reorder, removeIcon } from "./categories.controller.js";
import { validateBody, validateParams, uploadImage } from "@/middleware/index.js";
import {
	createCategorySchema,
	updateCategorySchema,
	categoryIdSchema,
	reorderCategoriesSchema,
} from "./categories.schema.js";

const router = Router();

// Public routes
router.get("/", index);
router.get("/:id", validateParams(categoryIdSchema), show);

// Protected routes (admin only)
router.post("/", uploadImage.single("icon"), validateBody(createCategorySchema), store);
router.patch("/reorder", validateBody(reorderCategoriesSchema), reorder);
router.patch("/:id", validateParams(categoryIdSchema), uploadImage.single("icon"), validateBody(updateCategorySchema), update);
router.delete("/:id", validateParams(categoryIdSchema), destroy);
router.delete("/:id/icon", validateParams(categoryIdSchema), removeIcon);

export default router;
