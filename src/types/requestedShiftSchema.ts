import { z } from 'zod';

export const CreateRequestedShiftSchema = z.object({
  employeeId: z.number(),
  shiftSlotId: z.number(),
  notes: z.string().optional(),
});

export type CreateRequestedShiftDTO = z.infer<typeof CreateRequestedShiftSchema>;