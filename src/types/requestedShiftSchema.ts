import { z } from 'zod';

export const CreateRequestedShiftSchema = z.object({
  userId: z.number(),
  shiftSlotId: z.number(),
  notes: z.string().optional(),
});

export type CreateRequestedShiftDTO = z.infer<typeof CreateRequestedShiftSchema>;