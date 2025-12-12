import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/index.js';
import { sendSuccess, sendCreated } from '../../utils/response.js';
import { AppError } from '../../middleware/index.js';
import type { CreateCategoryInput, UpdateCategoryInput } from './categories.schema.js';

export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { candidates: true },
        },
      },
    });

    sendSuccess(res, categories);
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        candidates: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    sendSuccess(res, category);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: Request<object, object, CreateCategoryInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, order, isActive } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        description,
        order: order ?? 0,
        isActive: isActive ?? true,
      },
    });

    sendCreated(res, category, 'Category created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: Request<{ id: string }, object, UpdateCategoryInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new AppError('Category not found', 404);
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    sendSuccess(res, category, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
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
      throw new AppError('Category not found', 404);
    }

    await prisma.category.delete({
      where: { id },
    });

    sendSuccess(res, null, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};

