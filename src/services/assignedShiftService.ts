import { CreateAssignedShiftDTO } from '../types/assignedShiftSchema';
import { AssignedShift } from '../config/postgres/models/assignedShift.model'; 
import { AvailableShift, Employee } from '../config/postgres/models';
import { ParsedQs } from 'qs';

/**
 * Creates a new assigned shift in the database.
 * @param {CreateAssignedShiftDTO} data - Data for the new assigned shift.
 * @returns {Promise<AssignedShift>} The created assigned shift.
 */
export const createAssignedShift = async (data: CreateAssignedShiftDTO): Promise<AssignedShift> => {
  const newAssignedShift = await AssignedShift.create({
    assigned_shift_id_fkey: data.shiftSlotId,
    assigned_employee_id_fkey: data.employeeId,
  } as any); 

  return newAssignedShift;
};

/**
 * Deletes a specific assigned shift by ID.
 * @param {number} id - ID of the assigned shift.
 * @returns {Promise<boolean>} True if the shift was deleted, false if not found.
 */
export const deleteAssignedShift = async (id: number): Promise<boolean> => {
  const assignedShift = await AssignedShift.findOne({ where: { assigned_id: id } });
  if (!assignedShift) return false;

  await assignedShift.destroy();
  return true;
};

/**
 * Retrieves a specific assigned shift by ID.
 * @param {number} id - ID of the assigned shift.
 * @returns {Promise<AssignedShift | null>} The assigned shift or null if not found.
 */
export const getAssignedShiftById = async (id: number): Promise<AssignedShift | null> => {
  if (!Number.isInteger(id)) {
    throw new Error(`Invalid assigned shift ID: ${id}`);
  }
  const assignedShift = await AssignedShift.findOne({
    where: { assigned_id: id },
  });

  return assignedShift;
};

/**
 * Retrieves assigned shifts based on query parameters.
 * @param {ParsedQs} params - Query parameters for filtering shifts.
 * @returns {Promise<AssignedShift[]>} A list of assigned shifts.
 */
export const getAssignedShiftsByParams = async (params: ParsedQs): Promise<AssignedShift[]> => {
  const filters: any = {};

  // Check if employee ID is provided
  if (params.employeeId !== undefined) {
    if (!Number.isInteger(Number(params.employeeId))) {
      throw new Error(`Invalid employee ID: ${params.employeeId}`);
    }
    filters.request_employee_id = params.employeeId;
  }

  const requestedShifts = await AssignedShift.findAll({
    where: filters,
    include: [
      {
        model: AvailableShift,
        attributes: ['shift_date', 'shift_time_start', 'shift_time_end'],
      },
      {
        model: Employee,
        attributes: ['employee_name', 'employee_email'],
      },
    ],
  });

  return requestedShifts;
};