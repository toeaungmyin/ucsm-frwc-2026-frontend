import jwt from 'jsonwebtoken';
import { env } from '../config/index.js';

// Admin token payload
interface AdminTokenPayload {
  id: string;
  username: string;
}

// Voter token payload (for ticket holders)
interface VoterTokenPayload {
  ticketId: string;
  serial: string;
}

// Generate admin token
export const generateToken = (payload: AdminTokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
		expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
};

// Verify admin token
export const verifyToken = (token: string): AdminTokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as AdminTokenPayload;
};

// Generate voter token (for ticket authentication)
export const generateVoterToken = (payload: VoterTokenPayload): string => {
  return jwt.sign({ ...payload, type: 'voter' }, env.JWT_SECRET, {
    expiresIn: '24h', // Voter tokens valid for 24 hours
  });
};

// Verify voter token
export const verifyVoterToken = (token: string): VoterTokenPayload & { type: 'voter' } => {
  const decoded = jwt.verify(token, env.JWT_SECRET) as VoterTokenPayload & { type: string };
  if (decoded.type !== 'voter') {
    throw new Error('Invalid token type');
  }
  return decoded as VoterTokenPayload & { type: 'voter' };
};

