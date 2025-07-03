import { Prisma } from '@prisma/client';

export const loginEventSchema = {
  email: { type: 'string', required: true },
  status: { type: 'string', enum: ['success', 'failure'], required: true },
  ip: { type: 'string', required: false },
  timestamp: { type: 'date', required: true },
};

export type LoginEvent = {
  id: string;
  email: string;
  status: 'success' | 'failure';
  ip?: string;
  timestamp: Date;
};
