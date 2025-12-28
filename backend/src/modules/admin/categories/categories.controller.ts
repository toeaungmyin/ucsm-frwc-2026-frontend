import type { Request, Response, NextFunction } from "express";
import { prisma } from "@/config/index.js";
import { sendSuccess, sendCreated } from "@/utils/index.js";
import { AppError } from "@/middleware/index.js";
import { uploadFile, deleteFile, getPublicUrl, extractObjectPath } from "@/services/index.js";
import { v4 as uuidv4 } from "uuid";
import type { CreateCategoryInput, UpdateCategoryInput } from "./categories.schema.js";

const ICON_FOLDER = "categories/icons";

// Helper to add presigned icon URL to category
const withIconUrl = async <T extends { icon: string | null }>(category: T): Promise<T & { iconUrl: string | null }> => {
	return {
		...category,
		iconUrl: category.icon ? await getPublicUrl(category.icon) : null,
	};
};

// Helper to add presigned icon URLs to multiple categories
const withIconUrls = async <T extends { icon: string | null }>(
	categories: T[]
): Promise<(T & { iconUrl: string | null })[]> => {
	return Promise.all(categories.map(withIconUrl));
};

export const index = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const categories = await prisma.category.findMany({
			orderBy: { order: "asc" },
		});

		const categoriesWithUrls = await withIconUrls(categories);
		sendSuccess(res, categoriesWithUrls);
	} catch (error) {
		next(error);
	}
};

export const show = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { id } = req.params;

		const category = await prisma.category.findUnique({
			where: { id },
		});

		if (!category) {
			throw new AppError("Category not found", 404);
		}

		const categoryWithUrl = await withIconUrl(category);
		sendSuccess(res, categoryWithUrl);
	} catch (error) {
		next(error);
	}
};

export const store = async (
	req: Request<object, object, CreateCategoryInput>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { name, isActive } = req.body;
		const file = req.file;

		// Auto-calculate order: get max order + 1
		const maxOrderCategory = await prisma.category.findFirst({
			orderBy: { order: "desc" },
			select: { order: true },
		});
		const nextOrder = (maxOrderCategory?.order ?? 0) + 1;

		// Upload icon to MinIO if provided
		let iconPath: string | undefined;
		if (file) {
			const extension = file.originalname.split(".").pop();
			const fileName = `${uuidv4()}.${extension}`;
			iconPath = await uploadFile(fileName, file.buffer, file.mimetype, ICON_FOLDER);
		}

		const category = await prisma.category.create({
			data: {
				name,
				order: nextOrder,
				isActive: isActive ?? true,
				icon: iconPath || null, // Store only object path
			},
		});

		const categoryWithUrl = await withIconUrl(category);
		sendCreated(res, categoryWithUrl, "Category created successfully");
	} catch (error) {
		next(error);
	}
};

export const update = async (
	req: Request<{ id: string }, object, UpdateCategoryInput>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { id } = req.params;
		const { name, isActive } = req.body;
		const file = req.file;

		const existingCategory = await prisma.category.findUnique({
			where: { id },
		});

		if (!existingCategory) {
			throw new AppError("Category not found", 404);
		}

		// Upload new icon to MinIO if provided
		let iconPath: string | undefined;
		if (file) {
			// Delete old icon if exists
			if (existingCategory.icon) {
				try {
					const oldIconPath = extractObjectPath(existingCategory.icon);
					await deleteFile(oldIconPath);
				} catch {
					// Ignore delete errors for old file
				}
			}

			const extension = file.originalname.split(".").pop();
			const fileName = `${uuidv4()}.${extension}`;
			iconPath = await uploadFile(fileName, file.buffer, file.mimetype, ICON_FOLDER);
		}

		const category = await prisma.category.update({
			where: { id },
			data: {
				...(name !== undefined && { name }),
				...(isActive !== undefined && { isActive }),
				...(iconPath && { icon: iconPath }), // Store only object path
			},
		});

		const categoryWithUrl = await withIconUrl(category);
		sendSuccess(res, categoryWithUrl, "Category updated successfully");
	} catch (error) {
		next(error);
	}
};

// Reorder categories via drag and drop
export const reorder = async (
	req: Request<object, object, { orderedIds: string[] }>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { orderedIds } = req.body;

		// Update each category's order based on its position in the array
		await prisma.$transaction(
			orderedIds.map((id, index) =>
				prisma.category.update({
					where: { id },
					data: { order: index + 1 },
				})
			)
		);

		const categories = await prisma.category.findMany({
			orderBy: { order: "asc" },
		});

		const categoriesWithUrls = await withIconUrls(categories);
		sendSuccess(res, categoriesWithUrls, "Categories reordered successfully");
	} catch (error) {
		next(error);
	}
};

export const destroy = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { id } = req.params;

		const existingCategory = await prisma.category.findUnique({
			where: { id },
		});

		if (!existingCategory) {
			throw new AppError("Category not found", 404);
		}

		// Delete icon from MinIO if exists
		if (existingCategory.icon) {
			try {
				const iconPath = extractObjectPath(existingCategory.icon);
				await deleteFile(iconPath);
			} catch {
				// Ignore delete errors
			}
		}

		await prisma.category.delete({
			where: { id },
		});

		sendSuccess(res, null, "Category deleted successfully");
	} catch (error) {
		next(error);
	}
};

// Remove icon from category
export const removeIcon = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { id } = req.params;

		const existingCategory = await prisma.category.findUnique({
			where: { id },
		});

		if (!existingCategory) {
			throw new AppError("Category not found", 404);
		}

		// Delete icon from MinIO if exists
		if (existingCategory.icon) {
			try {
				const iconPath = extractObjectPath(existingCategory.icon);
				await deleteFile(iconPath);
			} catch {
				// Ignore delete errors
			}
		}

		const category = await prisma.category.update({
			where: { id },
			data: { icon: null },
		});

		const categoryWithUrl = await withIconUrl(category);
		sendSuccess(res, categoryWithUrl, "Icon removed successfully");
	} catch (error) {
		next(error);
	}
};
