import { z } from "zod";

export const castVoteSchema = z.object({
	candidateId: z.string().uuid("Invalid candidate ID"),
	categoryId: z.string().uuid("Invalid category ID"),
});

export type CastVoteInput = z.infer<typeof castVoteSchema>;

