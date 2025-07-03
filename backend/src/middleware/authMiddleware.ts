import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any; // Replace 'any' with your user type if known
    }
  }
}

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'insecure';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.sendStatus(403);
  }
};