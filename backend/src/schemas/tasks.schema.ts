import { z } from 'zod';

export const createTaskSchema = z.object({
  clientId: z.string().min(1),
  command: z.string().min(1),
});
