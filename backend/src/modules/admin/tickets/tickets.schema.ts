import { z } from "zod";

export const generateTicketsSchema = z.object({
	quantity: z.number().min(1, "Quantity is required").max(100, "Quantity must be less than 100"),
});

export const checkTicketSchema = z.object({
	serial: z.string().regex(/^\d+$/, "Invalid ticket serial format"),
});

export const importTicketsSchema = z.object({
	tickets: z
		.array(
			z.object({
				serial: z.string().regex(/^\d+$/, "Invalid ticket serial format"),
			})
		)
		.min(1, "At least one ticket is required"),
	skipDuplicates: z.boolean().optional().default(true),
});

export type GenerateTicketsInput = z.infer<typeof generateTicketsSchema>;
export type CheckTicketInput = z.infer<typeof checkTicketSchema>;
export type ImportTicketsInput = z.infer<typeof importTicketsSchema>;
