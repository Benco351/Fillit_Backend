import { z } from 'zod';

export const CreateEmployeeSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string(),
  phone: z.string().optional()
}).strict();

export const UpdateEmployeeSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().optional(),
  admin: z.boolean().optional(),
  phone: z.string().optional()
}).strict();

export type UpdateEmployeeDTO = z.infer<typeof UpdateEmployeeSchema>;

export type CreateEmployeeDTO = z.infer<typeof CreateEmployeeSchema>;