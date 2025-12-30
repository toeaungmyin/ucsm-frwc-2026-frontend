import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
	APP_URL: z.string().default("localhost"),
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
	PORT: z.string().default("8000"),
	DATABASE_URL: z.string(),
	JWT_SECRET: z.string(),
	JWT_EXPIRES_IN: z.string().default("7d"),
	FRONTEND_URL: z.string().default("http://localhost:5173"),
	// MinIO Configuration
	MINIO_ENDPOINT: z.string().default("localhost"),
	MINIO_PORT: z.string().default("9000"),
	MINIO_ACCESS_KEY: z.string().default("minioadmin"),
	MINIO_SECRET_KEY: z.string().default("minioadmin"),
	MINIO_BUCKET: z.string().default("uploads"),
	MINIO_USE_SSL: z.string().default("false"),
	// Public URL for MinIO (used for generating accessible URLs from outside Docker)
	MINIO_PUBLIC_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

