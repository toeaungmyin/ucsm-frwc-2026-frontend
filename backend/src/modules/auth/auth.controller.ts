import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/index.js';
import { generateToken } from '../../utils/index.js';
import { sendSuccess } from '../../utils/response.js';
import { AppError } from '../../middleware/index.js';
import type { LoginInput } from './auth.schema.js';

export const login = async (
  req: Request<object, object, LoginInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const admin = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = generateToken({ id: admin.id, email: admin.email });

    sendSuccess(res, {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminId = (req as Request & { admin?: { id: string } }).admin?.id;

    if (!adminId) {
      throw new AppError('Unauthorized', 401);
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!admin) {
      throw new AppError('Admin not found', 404);
    }

    sendSuccess(res, admin);
  } catch (error) {
    next(error);
  }
};
