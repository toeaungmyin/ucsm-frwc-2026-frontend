import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const categoryIdSchema = z.object({
  id: z.string().uuid('Invalid category ID'),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

