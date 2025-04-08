import { z } from 'zod';
import { RequestStatus } from '../config/postgres/models/requestedShift.model';

export const CreateRequestedShiftSchema = z.object({
  employeeId: z.number(),
  shiftSlotId: z.number(),
  notes: z.string().optional(),
}).strict();

export const UpdateRequestedShiftSchema = z.object({
  status: z.nativeEnum(RequestStatus).optional(),
}).strict();

export type UpdateRequestedShiftDTO = z.infer<typeof UpdateRequestedShiftSchema>;

export type CreateRequestedShiftDTO = z.infer<typeof CreateRequestedShiftSchema>;