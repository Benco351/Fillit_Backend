import { z } from 'zod';

export const CreateEmployeeSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string(),
  admin: z.boolean().optional(),
  phone: z.string().optional()
  
});

export type CreateEmployeeDTO = z.infer<typeof CreateEmployeeSchema>; 