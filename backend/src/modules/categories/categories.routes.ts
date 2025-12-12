import { Router } from 'express';
import {
	getCategories,
	getCategory,
	createCategory,
	updateCategory,
	deleteCategory,
	reorderCategories,
} from "./categories.controller.js";
import { validateBody, validateParams, authMiddleware } from '../../middleware/index.js';
import {
	createCategorySchema,
	updateCategorySchema,
	categoryIdSchema,
	reorderCategoriesSchema,
} from "./categories.schema.js";

const router = Router();

// Public routes
router.get("/", getCategories);
router.get("/:id", validateParams(categoryIdSchema), getCategory);

// Protected routes (admin only)
router.post("/", authMiddleware, validateBody(createCategorySchema), createCategory);
router.patch("/reorder", authMiddleware, validateBody(reorderCategoriesSchema), reorderCategories);
router.patch('/:id', authMiddleware, validateParams(categoryIdSchema), validateBody(updateCategorySchema), updateCategory);
router.delete('/:id', authMiddleware, validateParams(categoryIdSchema), deleteCategory);

export default router;

