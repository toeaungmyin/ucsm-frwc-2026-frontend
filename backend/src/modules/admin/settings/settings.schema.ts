import { z } from "zod";

export const updateSettingsSchema = z.object({
	eventName: z.string().min(1).max(200).optional(),
	eventStartTime: z.string().datetime().nullable().optional(),
	votingEnabled: z.boolean().optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

export const toggleVotingSchema = z.object({
	enabled: z.boolean(),
});

