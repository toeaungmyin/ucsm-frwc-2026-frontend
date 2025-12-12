import type { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

export const sendCreated = <T>(res: Response, data: T, message = 'Created successfully'): Response => {
  return sendSuccess(res, data, message, 201);
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  meta: { page: number; limit: number; total: number }
): Response => {
  return res.status(200).json({
    success: true,
    data,
    meta: {
      ...meta,
      totalPages: Math.ceil(meta.total / meta.limit),
    },
  });
};

