import { Router } from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from './categories.controller.js';
import { validateBody, validateParams, authMiddleware } from '../../middleware/index.js';
import { createCategorySchema, updateCategorySchema, categoryIdSchema } from './categories.schema.js';

const router = Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', validateParams(categoryIdSchema), getCategory);

// Protected routes (admin only)
router.post('/', authMiddleware, validateBody(createCategorySchema), createCategory);
router.patch('/:id', authMiddleware, validateParams(categoryIdSchema), validateBody(updateCategorySchema), updateCategory);
router.delete('/:id', authMiddleware, validateParams(categoryIdSchema), deleteCategory);

export default router;

