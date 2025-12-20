import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Connection pool configuration for production reliability
// Add ?connection_limit=20&pool_timeout=30 to DATABASE_URL for pooling
export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		datasourceUrl: process.env.DATABASE_URL,
		log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
		// Error formatting for better debugging
		errorFormat: process.env.NODE_ENV === "development" ? "pretty" : "minimal",
	});

// Prevent multiple instances in development (hot reloading)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Handle Prisma client events for monitoring
prisma.$on('error' as never, (e: Error) => {
	console.error('Prisma Client Error:', e);
});

// Export connection test function
export const testDatabaseConnection = async (): Promise<boolean> => {
	try {
		await prisma.$queryRaw`SELECT 1`;
		return true;
	} catch (error) {
		console.error('Database connection test failed:', error);
		return false;
	}
};

