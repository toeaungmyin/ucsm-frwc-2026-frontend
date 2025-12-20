import { z } from "zod";

export const createCandidateSchema = z.object({
	nomineeId: z.string().min(1, "Nominee ID is required"),
	name: z
		.string()
		.min(1, "Name is required")
		.max(120, "Name must be at most 120 characters")
		.transform((val) => val.trim()),
	category: z
		.string()
		.min(1, "Category is required")
		.transform((val) => val.toUpperCase()),
});

export const updateCandidateSchema = z.object({
	nomineeId: z.string().min(1, "Nominee ID is required").optional(),
	name: z
		.string()
		.min(1, "Name is required")
		.max(120, "Name must be at most 120 characters")
		.transform((val) => val.trim())
		.optional(),
	category: z
		.string()
		.min(1, "Category is required")
		.transform((val) => val.toUpperCase())
		.optional(),
});

export const candidateIdSchema = z.object({
	id: z.string().uuid("Invalid candidate ID"),
});

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;
export type UpdateCandidateInput = z.infer<typeof updateCandidateSchema>;
