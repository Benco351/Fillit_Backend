import { z } from 'zod';

export const CreateAssignedShiftSchema = z.object({
  userId: z.number(),
  shiftSlotId: z.number(),
});

export type CreateAssignedShiftDTO = z.infer<typeof CreateAssignedShiftSchema>;