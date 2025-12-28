import type { Request, Response, NextFunction } from "express";
import { prisma } from "@/config/index.js";
import { sendSuccess } from "@/utils/index.js";
import { getPublicUrl } from "@/services/index.js";

// Helper to add presigned icon URL to category
const withIconUrl = async <T extends { icon: string | null }>(category: T): Promise<T & { iconUrl: string | null }> => {
	return {
		...category,
		iconUrl: category.icon ? await getPublicUrl(category.icon) : null,
	};
};

/**
 * Get all active categories sorted by order
 */
export const index = async (
	_req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const categories = await prisma.category.findMany({
			where: {
				isActive: true,
			},
			orderBy: {
				order: "asc",
			},
			select: {
				id: true,
				name: true,
				icon: true,
				order: true,
			},
		});

		// Add presigned URLs
		const categoriesWithUrls = await Promise.all(categories.map(withIconUrl));
		sendSuccess(res, categoriesWithUrls, "Categories fetched successfully");
	} catch (error) {
		next(error);
	}
};

