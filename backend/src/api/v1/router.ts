import { Router } from 'express';
import { getAllClients, getClientById, updateClient, deleteAllClients } from '../../controllers/clients.controller';
import { createTask, getTasksForClient, getAllTasks, updateTask, deleteTask } from '../../controllers/tasks.controller.persistent';
import { getAllUsers, updateUserRole } from '../../controllers/users.controller';
import { login, refresh, logout, register } from '../../controllers/auth.controller';
import { authorizeRole } from '../../middleware/rbac';
import { authenticate } from '../../middleware/authMiddleware';
import loginStatsRouter from '../../routes/loginStats.routes';

export const apiRouter = Router();

// Login stats endpoints
apiRouter.use(loginStatsRouter);

// Auth routes
apiRouter.post('/auth/register', register);
apiRouter.post('/auth/login', login);
apiRouter.post('/auth/refresh', refresh);
apiRouter.post('/auth/logout', logout);

// Protected routes
apiRouter.get('/clients', authenticate, getAllClients);
apiRouter.get('/clients/:id', authenticate, getClientById);
apiRouter.patch('/clients/:id', authenticate, updateClient);
apiRouter.delete('/clients', authenticate, deleteAllClients);
apiRouter.get('/tasks', authenticate, getAllTasks);
apiRouter.post('/tasks', authenticate, createTask);
apiRouter.get('/tasks/:clientId', authenticate, getTasksForClient);
apiRouter.patch('/tasks/:id', authenticate, updateTask);
apiRouter.delete('/tasks/:id', authenticate, deleteTask);
apiRouter.get('/users', authenticate, authorizeRole('ADMIN'), getAllUsers);
apiRouter.patch('/users/:id/role', authenticate, authorizeRole('ADMIN'), updateUserRole);