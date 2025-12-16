import { z } from "zod";

export const generateTicketsSchema = z.object({
    quantity : z.number().min(1 , "Quantity is required").max(100 ,"Quantity must be less than 100")
});
export const checkTicketSchema = z.object({
    uuid : z.string().regex(/^UCSM-[0-9a-fA-F-]{36}$/,"Invalid Voter Format ID!"),
})
export type GenerateTicketsInput = z.infer<typeof generateTicketsSchema>;
export type CheckTicketInput = z.infer<typeof checkTicketSchema>;