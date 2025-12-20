import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "@/config/index.js";
import { generateToken, sendSuccess } from "@/utils/index.js";
import { AppError } from "@/middleware/index.js";
import type { LoginInput } from "./auth.schema.js";

export const login = async (
	req: Request<object, object, LoginInput>,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { username, password } = req.body;

		const admin = await prisma.admin.findUnique({
			where: { username },
		});

		if (!admin) {
			throw new AppError("Invalid credentials", 401);
		}

		const isValidPassword = await bcrypt.compare(password, admin.password);

		if (!isValidPassword) {
			throw new AppError("Invalid credentials", 401);
		}

		const token = generateToken({ id: admin.id, username: admin.username });

		sendSuccess(res, {
			token,
			admin: {
				id: admin.id,
				username: admin.username,
				// name: admin.name, 
			},
		});
	} catch (error) {
		next(error);
	}
};

export const profile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const adminId = (req as Request & { admin?: { id: string } }).admin?.id;

		if (!adminId) {
			throw new AppError("Unauthorized", 401);
		}

		const admin = await prisma.admin.findUnique({
			where: { id: adminId },
			select: {
				id: true,
				username: true,
				// name: true,
				createdAt: true,
			},
		});

		if (!admin) {
			throw new AppError("Admin not found", 404);
		}

		sendSuccess(res, admin);
	} catch (error) {
		next(error);
	}
};
