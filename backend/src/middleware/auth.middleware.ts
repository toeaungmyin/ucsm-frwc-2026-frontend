import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/index.js';
import { verifyVoterToken } from "../utils/jwt.js";

export interface AuthRequest extends Request {
  admin?: {
    id: string;
    username: string;
  };
}

export interface VoterRequest extends Request {
	voter?: {
		ticketId: string;
		serial: string;
	};
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ success: false, message: 'Invalid token format' });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      username: string;
    };

    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

/**
 * Middleware to authenticate voters using their ticket token
 */
export const voterAuthMiddleware = (
  req: VoterRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'No ticket token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ success: false, message: 'Invalid token format' });
      return;
    }

    const decoded = verifyVoterToken(token);
    req.voter = {
      ticketId: decoded.ticketId,
      serial: decoded.serial,
    };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired ticket token' });
  }
};

