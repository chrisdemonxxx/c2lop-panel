import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

// Record a login event
export async function recordLoginEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, status, ip } = req.body;
    const event = await prisma.loginEvent.create({
      data: {
        email,
        status,
        ip,
        timestamp: new Date(),
      },
    });
    // Optionally emit socket event here
    res.status(201).json({ event });
  } catch (err) {
    next(err);
  }
}

// Get recent login events
export async function getLoginStats(req: Request, res: Response, next: NextFunction) {
  try {
    const events = await prisma.loginEvent.findMany({
      orderBy: { timestamp: 'desc' },
      take: 20,
    });
    res.status(200).json({ events });
  } catch (err) {
    next(err);
  }
}
