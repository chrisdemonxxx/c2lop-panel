import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';

export const deleteAllClients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Delete all tasks and results first due to foreign key constraints
    await prisma.taskResult.deleteMany({});
    await prisma.task.deleteMany({});
    const deleted = await prisma.client.deleteMany({});
    res.status(200).json({ message: 'All clients deleted', count: deleted.count });
  } catch (error) {
    next(error);
  }
};

export const getAllClients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clients = await prisma.client.findMany({
      where: { is_agent: true },
      select: {
        id: true,
        hostname: true,
        ip: true,
        status: true,
        tags: true,
        updatedAt: true,
        country: true,
        city: true,
        lat: true,
        lon: true,
      },
    });
    console.log('Fetched clients:', clients);
    res.status(200).json({ data: clients });
  } catch (error) {
    next(error);
  }
};

export const getClientById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) {
      res.status(404).json({ message: 'Client not found' });
      return;
    }
    res.status(200).json({ data: client });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { hostname, ip, status, tags } = req.body;
    const data: any = { hostname, ip, status };
    if (tags !== undefined) data.tags = tags;
    const updated = await prisma.client.update({
      where: { id },
      data,
    });
    res.status(200).json({ data: updated });
    return;
  } catch (error) {
    next(error);
  }
};
