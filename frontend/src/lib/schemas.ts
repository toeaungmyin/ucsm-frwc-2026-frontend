import { z } from 'zod';

// Example user schema
export const userSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  createdAt: z.string().datetime().optional(),
});

export type User = z.infer<typeof userSchema>;

// Example login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Example API response schema
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
  });

