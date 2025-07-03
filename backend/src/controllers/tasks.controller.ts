import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { getSocketServer } from '../services/websocket';

export const getAllTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tasks = await prisma.task.findMany({
      include: { result: true }
    });
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { clientId, command } = req.body;
    const newTask = await prisma.task.create({
      data: { clientId, command }
    });
    const io = getSocketServer();
    if (io) io.emit('task_created', newTask);
    res.status(201).json({ message: 'Task created', task: newTask });
  } catch (error) {
    next(error);
  }
};

export const getTasksForClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { clientId } = req.params;
    const tasks = await prisma.task.findMany({
      where: { clientId },
      include: { result: true }
    });
    res.status(200).json({ data: tasks });
  } catch (error) {
    next(error);
  }
};
