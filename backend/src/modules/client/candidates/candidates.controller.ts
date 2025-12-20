import type { Request, Response, NextFunction } from "express";
import { prisma } from "@/config/index.js";
import { sendSuccess } from "@/utils/index.js";

/**
 * Get candidates by category ID
 */
export const getByCategoryId = async (
	req: Request<{ categoryId: string }>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { categoryId } = req.params;

		// Check if category exists and is active
		const category = await prisma.category.findFirst({
			where: {
				id: categoryId,
				isActive: true,
			},
			select: {
				id: true,
				name: true,
				icon: true,
			},
		});

		if (!category) {
			res.status(404).json({ success: false, message: "Category not found" });
			return;
		}

		// Get candidates for this category
		const candidates = await prisma.candidate.findMany({
			where: {
				categoryId: categoryId,
			},
			select: {
				id: true,
				nomineeId: true,
				name: true,
				image: true,
			},
			orderBy: {
				nomineeId: "asc",
			},
		});

		sendSuccess(res, { category, candidates }, "Candidates fetched successfully");
	} catch (error) {
		next(error);
	}
};

