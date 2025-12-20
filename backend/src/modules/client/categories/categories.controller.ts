import type { Request, Response, NextFunction } from "express";
import { prisma } from "@/config/index.js";
import { sendSuccess } from "@/utils/index.js";

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

		sendSuccess(res, categories, "Categories fetched successfully");
	} catch (error) {
		next(error);
	}
};

