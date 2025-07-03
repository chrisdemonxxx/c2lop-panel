import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { getSocketServer } from '../services/websocket';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'insecure';
const JWT_EXPIRES_IN = '1h';

function signToken(user: { id: string; email: string; role: string }) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ message: 'User already exists.' });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, role: Role.OPERATOR }
    });
    const token = signToken(user);
    res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] || '';
    const timestamp = new Date();
    if (!email || !password) {
      // Record failed login
      const event = await prisma.loginEvent.create({
        data: { email: email || '', status: 'failure', ip: String(ip), timestamp }
      });
      const io = getSocketServer();
      if (io) io.emit('login_stats_updated', event);
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      await prisma.loginEvent.create({
        data: { email, status: 'failure', ip: String(ip), timestamp }
      });
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      await prisma.loginEvent.create({
        data: { email, status: 'failure', ip: String(ip), timestamp }
      });
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }
    // Success
    const event = await prisma.loginEvent.create({
      data: { email, status: 'success', ip: String(ip), timestamp }
    });
    const io = getSocketServer();
    if (io) io.emit('login_stats_updated', event);
    const token = signToken(user);
    res.status(200).json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json({ message: 'refresh executed' });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json({ message: 'logout executed' });
  } catch (error) {
    next(error);
  }
};
