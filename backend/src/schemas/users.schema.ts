import { z } from 'zod';

export const updateUserRoleSchema = z.object({
  role: z.string().min(1), // you may want to restrict to allowed roles
});
