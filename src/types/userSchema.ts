import { z } from 'zod';

export const CreateUserSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.string().optional()
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema>; 