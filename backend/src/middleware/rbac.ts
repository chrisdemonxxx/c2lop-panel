import { Request, Response, NextFunction } from 'express';

export function authorizeRole(requiredRole: 'ADMIN' | 'OPERATOR') {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user; // should be populated by auth middleware
    if (!user || user.role !== requiredRole) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}