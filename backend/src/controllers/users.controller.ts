import { Request, Response, NextFunction } from 'express';
import { getSocketServer } from '../services/websocket';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = [
      { id: 1, username: 'admin', role: 'ADMIN' },
      { id: 2, username: 'viewer', role: 'VIEWER' }
    ]; // Simulated user list
    res.status(200).json({ data: users });
    // Emit real-time user list update
    const io = getSocketServer();
    if (io) io.emit('user_list_updated', users);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    res.status(200).json({ message: `User ${id} role updated to ${role}` });
    // Emit real-time role update
    const io = getSocketServer();
    if (io) io.emit('user_role_updated', { id, role });
  } catch (error) {
    next(error);
  }
};
