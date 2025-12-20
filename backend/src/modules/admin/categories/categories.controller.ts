import type { Request, Response, NextFunction } from "express";
import { prisma } from "@/config/index.js";
import { sendSuccess, sendCreated } from "@/utils/index.js";
import { AppError } from "@/middleware/index.js";
import { uploadFile, deleteFile, getPublicUrl } from "@/services/index.js";
import { v4 as uuidv4 } from "uuid";
import type { CreateCategoryInput, UpdateCategoryInput } from "./categories.schema.js";

const ICON_FOLDER = "categories/icons";

export const index = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const categories = await prisma.category.findMany({
			orderBy: { order: "asc" },
		});

		sendSuccess(res, categories);
	} catch (error) {
		next(error);
	}
};

export const show = async (
	req: Request<{ id: string }>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { id } = req.params;

		const category = await prisma.category.findUnique({
			where: { id },
		});

		if (!category) {
			throw new AppError("Category not found", 404);
		}

		sendSuccess(res, category);
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
				icon: iconPath ? getPublicUrl(iconPath) : null,
			},
		});

		sendCreated(res, category, "Category created successfully");
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
					const oldIconPath = existingCategory.icon.split("/").slice(-2).join("/");
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
				...(iconPath && { icon: getPublicUrl(iconPath) }),
			},
		});

		sendSuccess(res, category, "Category updated successfully");
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

		sendSuccess(res, categories, "Categories reordered successfully");
	} catch (error) {
		next(error);
	}
};

export const destroy = async (
	req: Request<{ id: string }>,
	res: Response,
	next: NextFunction
): Promise<void> => {
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
				const iconPath = existingCategory.icon.split("/").slice(-2).join("/");
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
export const removeIcon = async (
	req: Request<{ id: string }>,
	res: Response,
	next: NextFunction
): Promise<void> => {
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
				const iconPath = existingCategory.icon.split("/").slice(-2).join("/");
				await deleteFile(iconPath);
			} catch {
				// Ignore delete errors
			}
		}

		const category = await prisma.category.update({
			where: { id },
			data: { icon: null },
		});

		sendSuccess(res, category, "Icon removed successfully");
	} catch (error) {
		next(error);
	}
};
