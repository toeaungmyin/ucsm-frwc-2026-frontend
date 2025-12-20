import { z } from "zod";

export const authenticateTicketSchema = z.object({
	ticketId: z.string().uuid("Invalid ticket ID format"),
});

export type AuthenticateTicketInput = z.infer<typeof authenticateTicketSchema>;

