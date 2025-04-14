import { z } from "zod";

export const CreateAvailableShiftSchema = z.object({
  //id: z.number().optional(),
  date: z.coerce.date(), // allows string like "2025-04-10"
  start: z.string().time(),   // validates "HH:MM" or "HH:MM:SS"
  end: z.string().time()
}).strict();


export const UpdateAvailableShiftSchema = z.object({
  date: z.coerce.date().optional(), 
  start: z.string().time().optional(), 
  end: z.string().time().optional()
}).strict();


export const AvailableShiftQuerySchema = z.object({
  shift_date: z.coerce.date().optional(), 
  shift_start_before: z.string().time().optional(), 
  shift_start_after: z.string().time().optional(), 
  shift_end_before: z.string().time().optional(), 
  shift_end_after: z.string().time().optional()
}).strict();


export type UpdateAvailableShiftDTO = z.infer<typeof UpdateAvailableShiftSchema>;

export type CreateAvailableShiftDTO = z.infer<typeof CreateAvailableShiftSchema>;

export type AvailableShiftQueryDTO = z.infer<typeof AvailableShiftQuerySchema>;