import { z } from 'zod';

export const CreateAssignedShiftSchema = z.object({
  employeeId: z.number(),
  shiftSlotId: z.number(),
}).strict();

export const AssignedShiftQuerySchema = z.object({
  assigned_employee_id: z.coerce.number().optional()
}).strict();

export type CreateAssignedShiftDTO = z.infer<typeof CreateAssignedShiftSchema>;

export type AssignedShiftQueryDTO = z.infer<typeof AssignedShiftQuerySchema>;