import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { getSocketServer } from '../services/websocket';

// Get all tasks
export const getAllTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tasks = await prisma.task.findMany({ include: { result: true } });
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// Create a new task
export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { clientId, command } = req.body;
    const newTask = await prisma.task.create({ data: { clientId, command } });
    const io = getSocketServer();
    if (io) io.emit('task_created', newTask);
    res.status(201).json({ message: 'Task created', task: newTask });
  } catch (error) {
    next(error);
  }
};

// Get tasks for a specific client
export const getTasksForClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { clientId } = req.params;
    const tasks = await prisma.task.findMany({ where: { clientId }, include: { result: true } });
    res.status(200).json({ data: tasks });
  } catch (error) {
    next(error);
  }
};

// Update a task
export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { command } = req.body;
    const updatedTask = await prisma.task.update({ where: { id }, data: { command } });
    const io = getSocketServer();
    if (io) io.emit('task_updated', updatedTask);
    res.status(200).json({ message: 'Task updated', task: updatedTask });
  } catch (error) {
    next(error);
  }
};

// Delete a task
export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedTask = await prisma.task.delete({ where: { id } });
    const io = getSocketServer();
    if (io) io.emit('task_deleted', deletedTask);
    res.status(200).json({ message: 'Task deleted', task: deletedTask });
  } catch (error) {
    next(error);
  }
};
