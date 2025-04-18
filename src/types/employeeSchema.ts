import { z } from 'zod';

export const CreateEmployeeSchema = z.object({
  //id: z.number().optional(),
  name: z.string().nonempty(),
  email: z.string().email(),
  password: z.string().min(1),
  phone: z.string().optional()
}).strict();

export const UpdateEmployeeSchema = z.object({
  name: z.string().nonempty().optional(),
  email: z.string().email().optional(),
  password: z.string().optional(),
  admin: z.boolean().optional(),
  phone: z.string().optional()
}).strict();

export const EmployeeQuerySchema = z.object({
  employee_admin: z.enum(['true', 'false']).optional()
}).strict();

export type UpdateEmployeeDTO = z.infer<typeof UpdateEmployeeSchema>;

export type CreateEmployeeDTO = z.infer<typeof CreateEmployeeSchema>;

export type EmployeeQueryDTO = z.infer<typeof EmployeeQuerySchema>;