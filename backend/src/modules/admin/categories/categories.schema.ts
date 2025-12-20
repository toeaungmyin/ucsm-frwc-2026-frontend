import { z } from "zod";

// Helper to transform string "true"/"false" to boolean (for FormData)
const booleanFromString = z
	.union([z.boolean(), z.string()])
	.transform((val) => {
		if (typeof val === "boolean") return val;
		return val === "true";
	});

export const createCategorySchema = z.object({
	name: z.string().min(1, "Name is required"),
	isActive: booleanFromString.optional(),
});

export const updateCategorySchema = z.object({
	name: z.string().min(1, "Name is required"),
	isActive: booleanFromString.optional(),
});

export const reorderCategoriesSchema = z.object({
	orderedIds: z.array(z.string().uuid("Invalid category ID")).min(1, "At least one category ID is required"),
});

export const categoryIdSchema = z.object({
	id: z.string().uuid("Invalid category ID"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>;

