import type { Request, Response, NextFunction } from "express";
import { prisma } from "@/config/index.js";
import { sendSuccess, sendCreated } from "@/utils/index.js";
import { AppError } from "@/middleware/index.js";
import { uploadFile, deleteFile, getPublicUrl, extractObjectPath } from "@/services/index.js";
import { v4 as uuidv4 } from "uuid";
import type { CreateCandidateInput, UpdateCandidateInput } from "./candidates.schema.js";

const IMAGE_FOLDER = "candidates/photos";

// Helper to add presigned image URL to candidate
const withImageUrl = async <T extends { image: string | null }>(
	candidate: T
): Promise<T & { imageUrl: string | null }> => {
	return {
		...candidate,
		imageUrl: candidate.image ? await getPublicUrl(candidate.image) : null,
	};
};

// Helper to add presigned image URLs to multiple candidates
const withImageUrls = async <T extends { image: string | null }>(
	candidates: T[]
): Promise<(T & { imageUrl: string | null })[]> => {
	return Promise.all(candidates.map(withImageUrl));
};

export const index = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const candidates = await prisma.candidate.findMany({
			orderBy: { createdAt: "asc" },
			include: {
				category: {
					select: { id: true, name: true },
				},
			},
		});

		const candidatesWithUrls = await withImageUrls(candidates);
		sendSuccess(res, candidatesWithUrls);
	} catch (error) {
		next(error);
	}
};

export const show = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { id } = req.params;

		const candidate = await prisma.candidate.findUnique({
			where: { id },
			include: {
				category: {
					select: { id: true, name: true },
				},
			},
		});

		if (!candidate) {
			throw new AppError("Candidate not found", 404);
		}

		const candidateWithUrl = await withImageUrl(candidate);
		sendSuccess(res, candidateWithUrl);
	} catch (error) {
		next(error);
	}
};

export const store = async (
	req: Request<object, object, CreateCandidateInput>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { nomineeId, name, category } = req.body;
		const file = req.file;

		const existingCategory = await prisma.category.findUnique({
			where: { name: category },
		});

		if (!existingCategory) {
			throw new AppError("Category not found", 404);
		}

		// Upload image to MinIO if provided
		let imagePath: string | undefined;
		if (file) {
			const extension = file.originalname.split(".").pop();
			const fileName = `${uuidv4()}.${extension}`;
			imagePath = await uploadFile(fileName, file.buffer, file.mimetype, IMAGE_FOLDER);
		}

		const candidate = await prisma.candidate.create({
			data: {
				nomineeId,
				name,
				categoryId: existingCategory.id,
				image: imagePath || null, // Store only object path
			},
			include: {
				category: {
					select: { id: true, name: true },
				},
			},
		});

		const candidateWithUrl = await withImageUrl(candidate);
		sendCreated(res, candidateWithUrl, "Candidate created successfully");
	} catch (error) {
		next(error);
	}
};

export const update = async (
	req: Request<{ id: string }, object, UpdateCandidateInput>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { id } = req.params;
		const { nomineeId, name, category } = req.body;
		const file = req.file;

		const existingCandidate = await prisma.candidate.findUnique({
			where: { id },
		});

		if (!existingCandidate) {
			throw new AppError("Candidate not found", 404);
		}

		// Only lookup category if it's being updated
		let categoryId: string | undefined;
		if (category) {
			const existingCategory = await prisma.category.findUnique({
				where: { name: category },
			});

			if (!existingCategory) {
				throw new AppError("Category not found", 404);
			}
			categoryId = existingCategory.id;
		}

		// Upload new image to MinIO if provided
		let imagePath: string | undefined;
		if (file) {
			// Delete old image if exists
			if (existingCandidate.image) {
				try {
					const oldImagePath = extractObjectPath(existingCandidate.image);
					await deleteFile(oldImagePath);
				} catch {
					// Ignore delete errors for old file
				}
			}

			const extension = file.originalname.split(".").pop();
			const fileName = `${uuidv4()}.${extension}`;
			imagePath = await uploadFile(fileName, file.buffer, file.mimetype, IMAGE_FOLDER);
		}

		const candidate = await prisma.candidate.update({
			where: { id },
			data: {
				...(nomineeId !== undefined && { nomineeId }),
				...(name !== undefined && { name }),
				...(categoryId !== undefined && { categoryId }),
				...(imagePath && { image: imagePath }), // Store only object path
			},
			include: {
				category: {
					select: { id: true, name: true },
				},
			},
		});

		const candidateWithUrl = await withImageUrl(candidate);
		sendSuccess(res, candidateWithUrl, "Candidate updated successfully");
	} catch (error) {
		next(error);
	}
};

export const destroy = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { id } = req.params;

		const existingCandidate = await prisma.candidate.findUnique({
			where: { id },
		});

		if (!existingCandidate) {
			throw new AppError("Candidate not found", 404);
		}

		// Delete image from MinIO if exists
		if (existingCandidate.image) {
			try {
				const imagePath = extractObjectPath(existingCandidate.image);
				await deleteFile(imagePath);
			} catch {
				// Ignore delete errors
			}
		}

		await prisma.candidate.delete({
			where: { id },
		});

		sendSuccess(res, null, "Candidate deleted successfully");
	} catch (error) {
		next(error);
	}
};

export const destroyAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const result = await prisma.candidate.deleteMany();

		sendSuccess(res, { count: result.count }, "All candidates deleted successfully");
	} catch (error) {
		next(error);
	}
};

// Remove image from candidate
export const removeImage = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { id } = req.params;

		const existingCandidate = await prisma.candidate.findUnique({
			where: { id },
		});

		if (!existingCandidate) {
			throw new AppError("Candidate not found", 404);
		}

		// Delete image from MinIO if exists
		if (existingCandidate.image) {
			try {
				const imagePath = extractObjectPath(existingCandidate.image);
				await deleteFile(imagePath);
			} catch {
				// Ignore delete errors
			}
		}

		const candidate = await prisma.candidate.update({
			where: { id },
			data: { image: null },
			include: {
				category: {
					select: { id: true, name: true },
				},
			},
		});

		const candidateWithUrl = await withImageUrl(candidate);
		sendSuccess(res, candidateWithUrl, "Image removed successfully");
	} catch (error) {
		next(error);
	}
};
