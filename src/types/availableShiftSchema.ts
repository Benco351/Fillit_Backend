import { z } from 'zod';

export const CreateAvailableShiftSchema = z.object({
  id: z.number(),
  date: z.date(),
  start: z.string().time(),
  end: z.string().time()
});

export type CreateAvailableShiftDTO = z.infer<typeof CreateAvailableShiftSchema>;